import mongoSanitize from "mongo-sanitize";

const sanitizeValue = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return mongoSanitize(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      clean[mongoSanitize(key)] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params);
  }
  next();
};
