// src/utils/jwt.js
export function getJwtPayload(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json); // { exp: 1730000000, iat: ... , sub: ... }
  } catch {
    return null;
  }
}

export function getAccessTokenExpiryMs() {
  const token = localStorage.getItem("access_token");
  const payload = getJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000; // ms
}
