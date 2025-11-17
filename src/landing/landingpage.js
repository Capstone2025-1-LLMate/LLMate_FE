// landingpage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./landingpage.css";

import Header from "../layout/headers";
import emoticon from "../asset/emoticon.jpg";
import gptLogo from "../asset/gptLogo.png";
import gemLogo from "../asset/gemLogo.png";
import claudeLogo from "../asset/claudeLogo.png";
import ring from "../asset/persona-rings.png";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const io = new IntersectionObserver(
      (ents, ob) =>
        ents.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            ob.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ------------------------------
    로그인 상태 확인 후 이동 처리
    access_token 존재만 확인
  ------------------------------ */
  const handleStart = () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      navigate("/input2"); // 로그인 O → 바로 작성 화면
    } else {
      navigate("/login"); // 로그인 X → 로그인 화면으로
    }
  };

  return (
    <main className="landing">
      <Header />

      {/* Hero */}
      <section className="hero hero--light">
        <div className="hero__content">
          <div className="hero__text fade-seq">
            <h1 className="hero__title">자소서,<br />더 설득력 있게</h1>
            <p className="hero__subtitle">
              <span className="accent">여러 AI의 피드백</span>으로<br />
              더 깔끔하게, 더 명확하게
            </p>

            {/* 버튼 변경됨 */}
            <button type="button" onClick={handleStart} className="btn btn--primary hero__cta">
              지금 시작하기
            </button>

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

      {/* Steps */}
      <section className="steps-bg" id="steps">
        <div className="steps-hero">
          <img src={ring} alt="링" className="steps__rings" />

          <div className="persona__center">
            <img src={require("../asset/persona-avatar.png")} alt="페르소나" className="persona__avatar" />
            <p className="persona__name">취준생 25세 A양</p>
          </div>

          <div className="bubble bubble--left reveal-on-scroll">
            <div className="bubble-text">경험은 있는데<br />어떻게 풀어야 할지 모르겠어</div>
          </div>
          <div className="bubble bubble--right bubble--top reveal-on-scroll">
            <div className="bubble-text">뭘 써야 할지 막막해요...</div>
          </div>
          <div className="bubble bubble--right bubble--bottom reveal-on-scroll">
            <div className="bubble-text">내 자소서, 누가 좀 봐줬으면..</div>
          </div>

          <button
            className="scroll-arrow"
            aria-label="다음 화면으로"
            onClick={() => document.querySelector("#step1")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>

        {/* STEP 1 */}
        <section className="step1-bg" id="step1">
          <div className="step1-card reveal-on-scroll">
            <span className="step1-eyebrow">STEP 1</span>
            <h3 className="step1-title">지원 기업명과 직무/분야를 입력하세요.</h3>
            <p className="step1-caption">지원 기업과 직무에 맞춰 다:서가 맞춤 초안을 생성합니다.</p>
            <img src={require("../asset/step-kakao.png")} alt="Kakao" className="step1__badge step1__badge--kakao" />
            <img src={require("../asset/step-apple.png")} alt="Apple" className="step1__badge step1__badge--apple" />
            <img src={require("../asset/step-naver.png")} alt="Naver" className="step1__badge step1__badge--naver" />
          </div>
        </section>

        {/* STEP 2 */}
        <section className="step2-bg" id="step2">
          <div className="step2-card reveal-on-scroll">
            <span className="step2-eyebrow">STEP 2</span>
            <h3 className="step2-title">자기소개서 질문 문항을 추가하세요.</h3>
            <img src={require("../asset/step-form.png")} alt="자기소개서 질문 폼" className="step2__form-img" />
            <img src={require("../asset/step-laptop.png")} alt="노트북 목업" className="step2__laptop" />

            <div className="step2-bottomcopy">
              <h4 className="step2-headline">
                질문 문항은 <strong>추가하고,</strong><br />
                답변은 <span className="accent-blue accent-with-dots">한번에</span>
              </h4>
              <p className="step2-caption">최대 4개의 문항에 대한 자기소개서 초안을 한 번에 생성합니다.</p>
            </div>
          </div>
        </section>

        {/* STEP 3 */}
        <section className="step3-bg" id="step3">
          <div className="step3-card reveal-on-scroll">
            <span className="step3-eyebrow">STEP 3</span>
            <h3 className="step3-title">경험을 작성하고 ‘제작하기’를 누르세요</h3>
            <img src={require("../asset/step3-card.png")} alt="경험 입력 카드" className="step3__img-card" />
            <img src={require("../asset/step3-cta.png")} alt="제작하기 버튼" className="step3__img-cta" />

            <div className="step3-bottomcopy">
              <h4 className="step3-headline"><span className="accent-blue accent-2dots">짧게</span> 적어도 괜찮습니다</h4>
              <h4 className="step3-subline">경험은 간단히 — 자기소개서는 깊이 있게</h4>
              <ul className="step3-bullets">
                <li>저장된 경험을 선택하거나 새로 추가할 수 있습니다.</li>
                <li>가이드라인에 맞춰 간단히 작성해도 AI가 완성해 줍니다.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STEP 4 */}
        <section className="step4-bg" id="step4">
          <div className="step4-card reveal-on-scroll">
            <span className="step4-eyebrow">STEP 4</span>
            <h3 className="step4-title">AI 피드백을 확인하고 수정해 최종본을 완성하세요.</h3>

            {/* ChatGPT */}
            <div className="step4-row step4-row--chatgpt">
              <div className="step4-name step4-name--left">ChatGPT</div>
              <img src={require("../asset/step4-chatgpt-badge.png")} alt="ChatGPT 배지" className="step4-badge step4-badge--chatgpt" />
              <div className="step4-bubble step4-bubble--chatgpt">
                <ul>
                  <li>목표와 경험의 연결이 잘 되어 있어요 🙂</li>
                  <li><strong>문단 구성</strong>이 <strong>주제별로 나뉘어</strong> 흐름이 자연스러워요 💡</li>
                  <li>단점 언급 후 긍정적 태도 강조가 좋네요!</li>
                </ul>
              </div>
            </div>

            {/* Claude */}
            <div className="step4-row step4-row--claude">
              <div className="step4-name step4-name--right">Claude</div>
              <div className="step4-bubble step4-bubble--claude">
                <ul>
                  <li>문장이 전반적으로 자연스럽고 맥락이 잘 이어집니다!</li>
                  <li><strong>맞춤법, 띄어쓰기, 문법적 오류가 없어</strong> 정확성이 높습니다. ✨</li>
                  <li>전문성과 열정을 잘 드러내고 있어 긍정적인 인상을 줍니다.</li>
                </ul>
              </div>
              <img src={require("../asset/step4-claude-badge.png")} alt="Claude 배지" className="step4-badge step4-badge--claude" />
            </div>

            {/* Gemini */}
            <div className="step4-row step4-row--gemini">
              <div className="step4-name step4-name--left">Gemini</div>
              <img src={require("../asset/step4-gemini-badge.png")} alt="Gemini 배지" className="step4-badge step4-badge--gemini" />
              <div className="step4-bubble step4-bubble--gemini">
                <ul>
                  <li>클라우드 전문가로 어떤 강점이 있는지 <strong>구체적인 사례</strong>를 보여주면 좋겠어요.</li>
                  <li>“복잡하고 어려운 일을 해결”했다는 부분에서 <strong>어떻게 해결했는지</strong> 궁금해요! ✨</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-bg" id="cta">
          <div className="cta-wrap">
            <h3 className="cta-title">
              AI가 각자 강점을 발휘해<br />당신의 글을 한층 더 다듬어줍니다.
            </h3>

            {/* 버튼 변경 */}
            <button type="button" className="cta-button" aria-label="지금 시작하기" onClick={handleStart}>
              지금 시작하기
            </button>

            <p className="cta-caption">무료로 시작하고, AI 피드백을 경험해보세요!</p>
          </div>
        </section>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <small>© {new Date().getFullYear()} LLMate. All rights reserved.</small>
        </div>
      </footer>
    </main>
  );
}
