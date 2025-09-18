// landingpage.js

import React from "react";
import { Link } from "react-router-dom";
import "./landingpage.css";

import Header from "../layout/headers"; // 🔹 공용 Header 사용
import emoticon from "../asset/emoticon.jpg";
import gptLogo from "../asset/gptLogo.png";
import gemLogo from "../asset/gemLogo.png";
import claudeLogo from "../asset/claudeLogo.png";

export default function LandingPage() {
  const isAuthed = !!localStorage.getItem("access_token"); // 🔹 로그인 여부

  return (
    <>
      {/* 🔹 공용 Header 사용 */}
      <Header />

      <main className="landing">
        {/* Hero */}
        <section className="hero">
          <div className="container hero__content">
            <h1 className="hero__title">
              다양한 시선, <span className="accent">완성</span>된 자기소개서
            </h1>
            <p className="hero__subtitle">
              다:서는 Multi-LLM의 피드백으로 당신의 글을 더 날카롭고 설득력 있게 다듬습니다.
            </p>

            {/* 🔹 로그인 여부에 따른 CTA 분기 */}
            {isAuthed ? (
              <p className="hero__caption">환영합니다! 상단 메뉴에서 마이페이지를 이용하세요.</p>
            ) : (
              <>
                <Link to="/login" className="btn btn--primary hero__cta">
                  지금 시작하기
                </Link>
                <p className="hero__caption">무료로 시작하고, AI 피드백을 경험해보세요!</p>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="section__title-with-lines">
            <div className="line" />
            <h2 className="section__title">
              <img src={emoticon} alt="이모티콘" className="emoticon-img" />
              <span style={{ marginLeft: "12px" }}>
                다:서는 이런 AI를 제공합니다
              </span>
            </h2>
            <div className="line" />
          </div>

          <div className="container">
            <div className="cards">
              <article className="card">
                <img src={gptLogo} alt="ChatGPT 로고" className="card__logo" />
                <h3 className="card__title">ChatGPT</h3>
                <p className="card__subtitle">논리 구조 전문가</p>
                <p className="card__desc">
                  글의 전개 흐름과 구성 논리를 분석해, 설득력 있는 구조를 잡아줍니다.
                </p>
              </article>

              <article className="card">
                <img src={gemLogo} alt="Gemini 로고" className="card__logo" />
                <h3 className="card__title">Gemini</h3>
                <p className="card__subtitle">정보 큐레이터</p>
                <p className="card__desc">
                  최신 산업 동향과 방대한 데이터로 글의 깊이와 풍부함을 더합니다.
                </p>
              </article>

              <article className="card">
                <img src={claudeLogo} alt="Claude 로고" className="card__logo" />
                <h3 className="card__title">Claude</h3>
                <p className="card__subtitle">한국어 마스터</p>
                <p className="card__desc">
                  문맥·일관성·맞춤법까지 꼼꼼히 다듬어 완성도를 끌어올립니다.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
