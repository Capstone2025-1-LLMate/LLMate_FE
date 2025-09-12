// landingpage.js
import React from "react";
import { Link } from "react-router-dom";
import "./landingpage.css";

import emoticon from "../asset/emoticon.jpg";
import gptLogo from "../asset/gptLogo.png";
import gemLogo from "../asset/gemLogo.png";
import claudeLogo from "../asset/claudeLogo.png";

/* ⬇️ 파일명은 이대로 맞춰줘 (원래 파일명이 다르면 rename) */
import heroPen from "../asset/hero-pen.png";        // 히어로 펜 이미지
import avatar from "../asset/persona-avatar.png";   // 페르소나 아바타
import stepsFrame from "../asset/steps-frame.png";

import iconKakao from "../asset/step-kakao.png";
import iconApple from "../asset/step-apple.png";
import iconNaver from "../asset/step-naver.png";
import imgLaptop from "../asset/step-laptop.png";     // 노트북(우측 아래)
import imgForm from "../asset/step-form.png";

export default function LandingPage() {
  return (
    <main className="landing">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <div className="brand">
            <span className="brand__logo">다:서</span>
            <span className="brand__tagline">
              <span className="brand__accent">다多</span> 시점에서{" "}
              <span className="brand__accent">자기소개서</span>를 보다
            </span>
          </div>
          <Link to="/login" className="btn btn--ghost">로그인</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero hero--light">
        {/* 텍스트 레이어 */}
        <div className="hero__content">
          <div className="hero__text">
            <h1 className="hero__title">자소서,<br />더 설득력 있게</h1>
            <p className="hero__subtitle">
              <span className="accent">여러 AI의 피드백</span>으로<br />
              더 깔끔하게, 더 명확하게
            </p>
            <Link to="/login" className="btn btn--primary hero__cta">지금 시작하기</Link>
            <p className="hero__caption">무료로 시작하고, AI 피드백을 경험해보세요!</p>
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="features" id="features">
        <div className="section__title-with-lines">
          <div className="line" />
          <h2 className="section__title">
            <img src={emoticon} alt="이모티콘" className="emoticon-img" />
            <span style={{ marginLeft: "12px" }}>다:서는 이런 AI를 제공합니다</span>
          </h2>
          <div className="line" />
        </div>

        <div className="container">
          <div className="cards">
            <article className="card">
              <img src={gptLogo} alt="ChatGPT 로고" className="card__logo" />
              <h3 className="card__title">ChatGPT</h3>
              <p className="card__subtitle">논리 구조 전문가</p>
              <p className="card__desc">글의 전개 흐름과 구성 논리를 분석해, 설득력 있는 구조를 잡아줍니다.</p>
            </article>
            <article className="card">
              <img src={gemLogo} alt="Gemini 로고" className="card__logo" />
              <h3 className="card__title">Gemini</h3>
              <p className="card__subtitle">정보 큐레이터</p>
              <p className="card__desc">최신 산업 동향과 방대한 데이터로 글의 깊이와 풍부함을 더합니다.</p>
            </article>
            <article className="card">
              <img src={claudeLogo} alt="Claude 로고" className="card__logo" />
              <h3 className="card__title">Claude</h3>
              <p className="card__subtitle">한국어 마스터</p>
              <p className="card__desc">문맥·일관성·맞춤법까지 꼼꼼히 다듬어 완성도를 끌어올립니다.</p>
            </article>
          </div>
        </div>
      </section>


      {/* Persona (선택 섹션: 계속 사용 중이면 유지) */}
      <section className="persona">
        <div className="persona__rings" aria-hidden="true" />

        {/* ✅ 새 래퍼 */}
        <div className="persona__figure">
          <img src={avatar} alt="취준생 25세 A양" className="persona__avatar" />
          <div className="persona__label">취준생 25세 A양</div>
        </div>
        <div className="speech speech--left" style={{ left: 0, top: 130, width: 415 }}>
          <div className="speech__inner">경험은 있는데<br />어떻게 풀어야 할지 모르겠어</div>
        </div>
        <div className="speech speech--right" style={{ right: 40, top: 90, width: 300 }}>
          <div className="speech__inner">뭘 써야 할지 막막해요...</div>
        </div>
        <div className="speech speech--right" style={{ right: 70, top: 260, width: 320 }}>
          <div className="speech__inner">내 자소서, 누가 좀 봐줬으면..</div>
        </div>

        <div className="persona__headline">
          <h2 className="title">다:서와 함께 쓰는,<br></br>
            한층 더 완성된 자기소개서 !</h2>
        </div>
        <a href="#features" className="persona__arrow" aria-label="다음 섹션으로" />
      </section>


      {/* =========================
    STEPS 섹션 (Frame7.png 배경 + 카드들)
   ========================= */}
      <section
        className="steps"
        id="steps"
        style={{ backgroundImage: `url(${stepsFrame})` }}
      >
        <div className="steps__inner">
          {/* STEP 1 */}
          <div className="steps__panel steps__panel--left">
            <div className="steps__panel-body">
              <p className="steps__eyebrow">STEP 1</p>
              <h3 className="steps__title">지원 기업명과 직무/분야를 입력하세요.</h3>
              <p className="steps__desc">지원 기업과 직무에 맞춰 다:서가 맞춤 초안을 생성합니다.</p>
            </div>

            {/* 떠 있는 아이콘들 (카드 기준 배치) */}
            <img className="steps__icon steps__icon--kakao" src={iconKakao} alt="KakaoTalk" />
            <img className="steps__icon steps__icon--naver" src={iconNaver} alt="NAVER" />
            <img className="steps__icon steps__icon--apple" src={iconApple} alt="Apple" />
          </div>

          {/* STEP 2 */}
          <div className="steps__panel steps__panel--right">
            <div className="steps__panel-body">
              <p className="steps__eyebrow steps__eyebrow--right">STEP 2</p>
              <h3 className="steps__title steps__title--right">자기소개서 질문 문항을 추가하세요.</h3>
            </div>

            {/* 폼/노트북 (카드 기준 배치) */}
            <img className="steps__form" src={imgForm} alt="질문 입력 예시" />
            <img className="steps__laptop" src={imgLaptop} alt="Laptop" />
          {/* 하단 카피 */}
          <div className="steps__headline">
            <strong>질문 문항은 추가하고,</strong><br />
            <span>답변은 <em>한번에</em></span>
          </div>
          <p className="steps__caption">
            최대 4개의 문항에 대한 자기소개서 초안을 한 번에 생성합니다.
          </p>
          </div>

          
        </div>
      </section>

    </main>
  );
}