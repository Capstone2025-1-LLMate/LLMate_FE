// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login/loginpage";
import OutputPage from './output/outputPage';
import InputPage from './input/inputPage';
import ModifyPage from './modify/modifypage';
import Mypage from './mypage/mypage.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/output" element={<OutputPage />} />
          <Route path="/modify"element={<ModifyPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/Mypage"element={<Mypage />} />

        </Routes>
        {/* <OutputPage /> */}
        {/* <InputPage/> */}
        {/* <ModifyPage/> */}
        
      </div>
    </Router>
  );
}

export default App;