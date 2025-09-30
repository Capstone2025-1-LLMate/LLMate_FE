// src/utils/authFetch.js
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    alert("세션이 만료되었거나 인증이 해제되었습니다. 다시 로그인해주세요.");
    window.location.replace("/login");
    throw new Error("Unauthorized");
  }
  return response;
}
