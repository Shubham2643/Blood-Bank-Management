export const getGoogleClientId = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return clientId && !clientId.startsWith("your-") ? clientId : null;
};
