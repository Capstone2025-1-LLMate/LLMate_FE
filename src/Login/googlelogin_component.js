import React from "react";

// const GoogleLoginBtn = () => {
//   const redirectToGoogleLogin = () => {
//     window.location.href = "http://localhost:8000/auth/login"; // ✅ 백엔드 OAuth 시작
//   };

//   return (
//     <button onClick={redirectToGoogleLogin} style={styles.button}>
//       구글로 로그인
//     </button>
//   );
// };
const GoogleLoginBtn = () => {
  const login = useGoogleLogin({
    // 구글 로그인 팝업이 성공하면 아래 onSuccess가 호출됨
    onSuccess: async (tokenResponse) => {
      try {
        // 구글에서 내려준 credential (id_token 또는 access_token)
        // tokenResponse.access_token 형태로 사용
        const googleToken = tokenResponse.access_token;

        // ② 구글 토큰을 백엔드에 POST
        const resp = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // 백엔드에서 provider: "google", token: "<구글에서 받은 토큰>" 을 expect한다고 가정
          body: JSON.stringify({
            provider: "google",
            token: googleToken,
          }),
        });

        if (!resp.ok) {
          throw new Error(`서버 에러: ${resp.status}`);
        }

        const data = await resp.json();
        // ③ 이제 data 안에 { user_id, name, email, profile_image, access_token, token_type } 이 담겨 있을 것
        console.log("백엔드 응답 전체:", data);

        // ④ 브라우저 로컬에 JWT만 저장해 두면, 이후 다른 API 호출 때 꺼내 쓸 수 있다.
        localStorage.setItem("access_token", data.access_token);

        // (선택) 로그인 후 홈 화면으로 라우팅
        // 예: navigate("/", { replace: true });

      } catch (err) {
        console.error("로그인 중 에러 발생:", err);
      }
    },
    onError: (error) => {
      console.error("구글 로그인 실패:", error);
    },
  });

  return (
    <button onClick={() => login()} style={styles.button}>
      구글로 로그인
    </button>
  );
};


const styles = {
  button: {
    width: "400px",
    height: "50px",
    borderRadius: "5px",
    backgroundColor: "#4285F4",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    cursor: "pointer"
  }
};

export default GoogleLoginBtn;
