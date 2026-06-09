const clean = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["'],?$/g, "")
    .replace(/,$/, "");

export const API_BASE_URL =
  clean(import.meta.env.VITE_API_URL) || "http://localhost:5001/api";

export const SOCKET_URL =
  clean(import.meta.env.VITE_SOCKET_URL) ||
  API_BASE_URL.replace(/\/api\/?$/, "");

export const IS_DEV = import.meta.env.DEV;
