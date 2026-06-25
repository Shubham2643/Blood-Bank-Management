import axios from "axios";

// Simple in-memory cache to reduce external API calls.
// (This resets on server restart.)
const cache = new Map();

const getEnv = (name) => {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : undefined;
};

const EKA_BASE_URL = getEnv("EKA_BASE_URL") || "https://api.eka.care";
const EKA_AUTH_TOKEN = getEnv("EKA_AUTH_TOKEN");
const X_PT_ID = getEnv("EKA_X_PT_ID");
const X_PARTNER_PT_ID = getEnv("EKA_X_PARTNER_PT_ID");
const X_HIP_ID = getEnv("EKA_X_HIP_ID");

const DEFAULT_BLOOD_GROUP = getEnv("EKA_DEFAULT_BLOOD_GROUP") || "O+";
const DEFAULT_BLOOD_COMPONENT =
  getEnv("EKA_DEFAULT_BLOOD_COMPONENT") || "Whole Blood";

const hasCredentials = () =>
  EKA_AUTH_TOKEN && X_PT_ID && X_PARTNER_PT_ID && X_HIP_ID;

const ekaHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${EKA_AUTH_TOKEN}`,
    "X-Pt-Id": X_PT_ID,
    "X-Partner-Pt-Id": X_PARTNER_PT_ID,
    "X-Hip-Id": X_HIP_ID,
  };
};

const getCacheKey = (prefix, obj) => `${prefix}:${JSON.stringify(obj)}`;

const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
};

const setCache = (key, value, ttlMs) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const parseGps = (gps) => {
  if (!gps || typeof gps !== "string") return undefined;
  const cleaned = gps.replace("(", "").replace(")", "").trim();
  const parts = cleaned.includes(",") ? cleaned.split(",") : cleaned.split(/\s+/);
  if (parts.length < 2) return undefined;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return undefined;
  return { lat, lng };
};

const extractProviders = (ekaResponse) => {
  // Provider location varies slightly depending on gateway/response shape.
  return (
    ekaResponse?.data?.data?.message?.catalog?.providers ||
    ekaResponse?.data?.message?.catalog?.providers ||
    ekaResponse?.data?.data?.message?.catalog?.descriptor?.providers ||
    []
  );
};

const normalizeProviderToPseudoCamp = ({
  provider,
  bloodGroup,
  dateISO,
}) => {
  const id = provider?.id || provider?.descriptor?.id || undefined;
  const descriptor = provider?.descriptor || {};

  const name =
    descriptor?.name ||
    descriptor?.short_desc ||
    descriptor?.long_desc ||
    id ||
    "Blood Bank";

  const contact = provider?.contact || {};
  const address = provider?.location?.address || "";
  const cityObj = provider?.location?.city?.name
    ? provider?.location?.city
    : provider?.location?.city;

  const cityName =
    (typeof cityObj === "object" && cityObj?.name) || cityObj?.code || "";

  const coordinates = parseGps(provider?.location?.gps);

  // Sum available quantity for requested search payload.
  // Spec: provider.items is nested arrays of items with quantity.count.
  let quantitySum = 0;
  try {
    const items = provider?.items;
    const flattened = Array.isArray(items)
      ? items.flatMap((x) => (Array.isArray(x) ? x : [x]))
      : [];

    for (const item of flattened) {
      const count = item?.quantity?.count;
      const computedValue = item?.quantity?.measure?.computed_value;
      const fallbackValue =
        item?.quantity?.measure?.value || item?.quantity?.measure?.unit;

      const num =
        typeof count === "number"
          ? count
          : typeof computedValue === "number"
            ? computedValue
            : typeof fallbackValue === "number"
              ? fallbackValue
              : undefined;
      if (typeof num === "number" && !Number.isNaN(num)) quantitySum += num;
    }
  } catch {
    // ignore quantity parsing errors
  }

  // Avoid returning zeros everywhere; if quantity couldn't be parsed, keep it 0.
  const expectedDonors = Math.max(0, quantitySum);

  return {
    _id: String(id || `${name}-${bloodGroup}`),
    title: name,
    description: descriptor?.long_desc || descriptor?.short_desc || "",
    date: dateISO,
    time: { start: "00:00", end: "23:59" },
    location: {
      venue: address || name,
      city: cityName || "",
      state: "",
      pincode: "",
    },
    expectedDonors,
    actualDonors: 0,
    status: "upcoming",
    registeredDonors: [],

    // UI organizers:
    hospital: { name },
    facility: { name },

    // UI filters:
    bloodTypesNeeded: bloodGroup ? [bloodGroup] : [],

    // Used by frontend to disable DB-only actions.
    isExternal: true,

    // Used by FindCamps.jsx to compute distance.
    coordinates,
    contactPhone: contact?.phone || "",
    contactEmail: contact?.email || "",
  };
};

const searchBloodBank = async ({
  searchType,
  bloodGroup = DEFAULT_BLOOD_GROUP,
  bloodComponent = DEFAULT_BLOOD_COMPONENT,
  location,
  radius,
  district,
  state,
}) => {
  if (!hasCredentials()) {
    throw new Error(
      "Eka Care credentials missing. Set EKA_AUTH_TOKEN, EKA_X_PT_ID, EKA_X_PARTNER_PT_ID, EKA_X_HIP_ID.",
    );
  }

  const body = {
    search_type: searchType, 
    blood_component: bloodComponent,
    blood_group: bloodGroup,
  };

  if (searchType === "location") {
    if (!location || typeof location.lat !== "number" || typeof location.long !== "number") {
      throw new Error("Missing location coordinates for Eka blood bank search.");
    }
    if (!radius || typeof radius.value !== "number") {
      throw new Error("Missing radius for Eka blood bank search.");
    }
    body.location = { lat: location.lat, long: location.long };
    body.radius = { unit: radius.unit || "km", value: radius.value };
  } else {
    // District/state search
    if (!state || !district) throw new Error("Missing state/district for district search.");
    body.state = state;
    body.district = district;
  }

  const post = await axios.post(
    `${EKA_BASE_URL}/abdm/uhi/v1/blood-bank/search`,
    body,
    {
      headers: ekaHeaders(),
      timeout: 15000,
    },
  );

  const requestId = post?.data?.request_id;
  if (!requestId) throw new Error("Eka did not return request_id.");

  const get = await axios.get(
    `${EKA_BASE_URL}/abdm/uhi/v1/blood-bank/search/${requestId}`,
    {
      headers: ekaHeaders(),
      timeout: 15000,
    },
  );

  const providers = extractProviders(get);
  const dateISO = new Date().toISOString();

  const camps = (providers || []).map((p) =>
    normalizeProviderToPseudoCamp({
      provider: p,
      bloodGroup,
      dateISO,
    }),
  );

  // De-duplicate by _id
  const unique = new Map();
  for (const c of camps) unique.set(c._id, c);
  return Array.from(unique.values());
};

const BLOOD_COMPONENT_CANDIDATES = [
  DEFAULT_BLOOD_COMPONENT,
  "Whole Blood",
  "RBC",
  "Platelets",
  "Plasma",
  "WBC",
].filter(Boolean);

export const getEkaCampsNearby = async ({
  lat,
  lng,
  radiusKm = 50,
  bloodGroup,
  bloodComponent,
}) => {
  const key = getCacheKey("ekaNearby", {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
    radiusKm,
    bloodGroup,
    bloodComponent,
  });
  const cached = getCache(key);
  if (cached) return cached;

  const group = bloodGroup || DEFAULT_BLOOD_GROUP;
  const candidates = bloodComponent
    ? [bloodComponent, ...BLOOD_COMPONENT_CANDIDATES]
    : BLOOD_COMPONENT_CANDIDATES;

  let lastErr;
  let camps = [];
  for (const component of candidates) {
    try {
      camps = await searchBloodBank({
        searchType: "location",
        bloodGroup: group,
        bloodComponent: component,
        location: { lat, long: lng },
        radius: { unit: "km", value: radiusKm },
      });
      if (Array.isArray(camps) && camps.length > 0) break;
    } catch (err) {
      lastErr = err;
      camps = [];
    }
  }

  if (!Array.isArray(camps) || camps.length === 0) {
    throw lastErr || new Error("Eka nearby search failed");
  }

  setCache(key, camps, 2 * 60 * 1000);
  return camps;
};

export const getEkaCampsUpcomingIndia = async ({
  bloodGroup,
  bloodComponent,
}) => {
  const key = getCacheKey("ekaUpcomingIndia", {
    bloodGroup,
    bloodComponent,
  });
  const cached = getCache(key);
  if (cached) return cached;

  // Rough zonal coverage to represent "India-wide" list.
  // This is used only when you don't have user GPS coords.
  const zones = [
    { lat: 28.6139, lng: 77.209, label: "north" },
    { lat: 23.1765, lng: 79.9864, label: "central" },
    { lat: 19.076, lng: 72.8777, label: "west" },
    { lat: 13.0827, lng: 80.2707, label: "south" },
    { lat: 22.5726, lng: 88.3639, label: "east" },
  ];

  const radiusKm = parseInt(getEnv("EKA_ZONE_RADIUS_KM") || "900", 10);

  const dateISO = new Date().toISOString();

  const group = bloodGroup || DEFAULT_BLOOD_GROUP;
  const candidates = bloodComponent
    ? [bloodComponent, ...BLOOD_COMPONENT_CANDIDATES]
    : BLOOD_COMPONENT_CANDIDATES;

  let merged = [];
  let lastErr;

  // Try components one-by-one until we get results.
  for (const component of candidates) {
    lastErr = undefined;
    const results = await Promise.allSettled(
      zones.map((z) =>
        searchBloodBank({
          searchType: "location",
          bloodGroup: group,
          bloodComponent: component,
          location: { lat: z.lat, long: z.lng },
          radius: { unit: "km", value: radiusKm },
        }),
      ),
    );

    merged = [];
    for (const r of results) {
      if (r.status === "fulfilled" && Array.isArray(r.value) && r.value.length) {
        merged.push(...r.value);
      } else if (r.status === "rejected") {
        lastErr = r.reason || lastErr;
      }
    }

    if (merged.length > 0) break;
  }

  if (!Array.isArray(merged) || merged.length === 0) {
    throw lastErr || new Error("Eka upcomingIndia search failed");
  }

  // De-duplicate by _id and cap
  const unique = new Map();
  for (const c of merged) unique.set(c._id, c);

  // Ensure we have at least a stable date
  const camps = Array.from(unique.values()).map((c) => ({
    ...c,
    date: c.date || dateISO,
  }));

  camps.sort((a, b) => (b.expectedDonors || 0) - (a.expectedDonors || 0));

  const capped = camps.slice(0, parseInt(getEnv("EKA_MAX_CAMP_RESULTS") || "40", 10));

  setCache(key, capped, 5 * 60 * 1000);
  return capped;
};

