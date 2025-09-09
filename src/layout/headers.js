import React from 'react';
import { useNavigate } from 'react-router-dom';
import './headers.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    // Navigate to the login page
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-main">다:서</span>
          <span className="logo-sub">다多시점에서 자기소개서를 보다</span>
        </div>
        <div className="header-buttons">
          <button className="mypage-button" onClick={() => navigate('/mypage')}>마이페이지</button>
          <button className="logout-button" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
