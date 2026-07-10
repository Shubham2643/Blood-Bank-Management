const clean = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["'],?$/g, "")
    .replace(/,$/, "");

let apiBaseUrl = clean(import.meta.env.VITE_API_URL);
let socketUrl = clean(import.meta.env.VITE_SOCKET_URL);

if (apiBaseUrl && !apiBaseUrl.endsWith("/api") && !apiBaseUrl.endsWith("/api/")) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, "") + "/api";
}

if (import.meta.env.PROD) {
  // Force relative path in production if empty or misconfigured to localhost
  if (!apiBaseUrl || apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1")) {
    apiBaseUrl = "/api";
  }
  if (!socketUrl || socketUrl.includes("localhost") || socketUrl.includes("127.0.0.1")) {
    socketUrl = window.location.origin;
  }
} else {
  // Development fallbacks
  if (!apiBaseUrl) {
    apiBaseUrl = "http://localhost:5001/api";
  }
  if (!socketUrl) {
    socketUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  }
}

export const API_BASE_URL = apiBaseUrl;
export const SOCKET_URL = socketUrl;
export const IS_DEV = import.meta.env.DEV;
