export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    window.location.href = '/login';
    throw new Error("Unauthorized");
  }

  return response;
};
