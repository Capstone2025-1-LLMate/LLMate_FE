// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login/loginpage";
import MyPage from "./mypage/mypage";
import OutputPage from './output/outputpage';
import InputPage from './input/inputPage';
import ModifyPage from './modify/modifypage';
import LandingPage from './landing/landingpage';
import InputPage2 from "./input/inputpage2";
import OutputPage2 from "./output/outputpage2";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/output" element={<OutputPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/modify"element={<ModifyPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/input2" element={<InputPage2 />} />
          <Route path="/output2" element={<OutputPage2 />} />

        </Routes>
        {/* <OutputPage /> */}
        {/* <InputPage/> */}  
        {/* <ModifyPage/> */}
        
      </div>
    </Router>
  );
}

export default App;