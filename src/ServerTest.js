import React, { useEffect, useState } from 'react';

const ServerTest = () => {
  const [msg, setMsg] = useState('로딩 중...');

  useEffect(() => {
    // 환경변수에 API URL이 설정되어 있으면 사용, 아니면 빈 문자열로
    const API = process.env.REACT_APP_API_URL || '';
    
    fetch(`${API}/ping`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => setMsg(data.message))
      .catch(err => setMsg(`에러: ${err.message || err}`));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>서버 연결 테스트</h3>
      <p>{msg}</p>
    </div>
  );
};

export default ServerTest;
