// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import MyPage from "./mypage/mypage";
import OutputPage from './output/outputPage';
import InputPage from './input/inputPage';
import ModifyPage from './modify/ModifyPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/output" element={<OutputPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/modify"element={<ModifyPage />} />
          <Route path="/mypage" element={<MyPage />} />

        </Routes>
        {/* <OutputPage /> */}
        {/* <InputPage/> */}
        {/* <ModifyPage/> */}
        
      </div>
    </Router>
  );
}

export default App;