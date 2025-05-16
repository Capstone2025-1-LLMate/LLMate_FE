import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode";
import React from 'react'

export const GoogleLoginBtn = () => {
	const loginHandle = (response) => {
		console.log(response)
		const decode_token = jwtDecode(response.credential) //token decode
		console.log(decode_token)
	}
	return (
		<>
			<GoogleLogin
				onSuccess={loginHandle}
				onError={() => {
					console.log("Login Failed");
				}}
				width='400px' //버튼 크기 지정
				text="continue_with" //로그인 버튼 텍스트 지정 (구글에서 제공하는 문구만 사용)
				locale='zh_CN' //언어 표시
				shape='circle' //버튼 shape 지정
				theme='filled_blue' //테마 blue 또는 black
				logo_alignment='left' //로고 정렬 위치
                useOneTap='true'//팝업 창을 띄우지 않고 현재 탭에서 로그인
				/>
		</>
	)
}

export default GoogleLoginBtn