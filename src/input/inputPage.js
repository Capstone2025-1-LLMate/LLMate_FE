// src/components/InputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InputPage.css';
import LayoutAside from '../layout/layoutAside';
import InputButton from './InputButton';

const Spinner = () => <div className="spinner" />;

const InputPage = () => {
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [length, setLength] = useState(600);

  const [experience, setExperience] = useState('');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [motivation, setMotivation] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("로그인이 필요합니다.");
      // 로그인 페이지로 이동하거나 에러 처리
      navigate("/login");
      return;
    }

    setIsLoading(true);

    const experiences = [
      { type: 'experience', content: experience },
      { type: 'strength', content: strength },
      { type: 'goal', content: motivation }
    ];

    if (weakness.trim() !== '') {
      experiences.push({ type: 'weakness', content: weakness });
    }

    const payload = {
      question: {
        company_name: company,
        job_position: position,
        question: questionText,
        length_of_answer: length
      },
      experiences
    };

    try {
      // 1. 자기소개서 생성 요청
      const response = await fetch('http://localhost:8000/essays/generate/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 422) {
        const detail = await response.json();
        console.error('Validation Error Detail:', detail);
        throw new Error('유효성 검사 실패(422)');
      }

      if (!response.ok) {
        throw new Error(`에세이 생성 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('서버 응답:', result);

      const { essay_id, user_id, essay_question_id, title, content } = result;

      // 2. LLM 평가 요청
      const feedbackResponse = await fetch('http://localhost:8000/api/feedbacks/multi', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          essay_id,
          prompt_style: '강점과 약점을 구분해서 평가해줘',
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error(`LLM 평가 요청 실패: ${feedbackResponse.status}`);
      }

      const feedbackData = await feedbackResponse.json();

      const modelMap = {
        chatgpt: 'ChatGPT',
        gemini: 'Perplexity',
        claude: 'Claude',
      };

      const evaluations = (feedbackData.feedbacks || []).map((fb, idx) => ({
        id: idx + 1,
        reviewer: modelMap[fb.llm_model] || fb.llm_model,
        text: fb.feedback_text,
      }));

      // 3. output 페이지로 이동
      navigate('/output', {
        state: {
          essay_id,
          user_id,
          essay_question_id,
          title,
          content,
          evaluations,
          question: questionText    // ← 여기에서 questionText를 “question”이라는 이름으로 넣어줍니다.
        }
      });

    } catch (err) {
      console.error('자기소개서 생성 실패:', err);
    }finally {
      // 6) 로딩 끝
      setIsLoading(false);
    }
  };

  return (
    <div className="input-page-container">
      {/* <LayoutAside hideText={true} /> */}
      <LayoutAside/>
      <main className="content">
        <div className="field-inline">
          <label>
            <span className="label">기업명:</span>
            <input
              type="text"
              className="field-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
          <label>
            <span className="label">직무/분야:</span>
            <input
              type="text"
              className="field-input"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </label>
        </div>

        <div className="section">
          <h3>자기소개서 질문 문항 <span className="required">*</span></h3>
          <label>
            글자수 제한:
            <input
              type="number"
              className="len-input"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </label>
          <textarea
            className="qna-input"
            placeholder="예) 본인의 역량이 회사와 직무에 어떻게 기여할 수 있는지 서술하세요."
            maxLength={length}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        <div className="section">
          <h3>경험 및 활동 <span className="required">*</span></h3>
          <textarea
            className="section-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="예) 활동명 · 기간 · 역할/성과 · 배운 점"
          />
        </div>

        <div className="section">
          <h3>성격 및 가치관</h3>
          <p>장점</p>
          <textarea
            className="section-input"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="예) 논리적 사고력, 팀워크 등"
          />
          <p>단점</p>
          <textarea
            className="section-input"
            value={weakness}
            onChange={(e) => setWeakness(e.target.value)}
            placeholder="예) 논리적 사고력, 팀워크 등"
          />
        </div>

        <div className="section">
          <h3>지원 동기 및 진로 목표</h3>
          <textarea
            className="section-input"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="예) 지원 동기 입력"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          {isLoading ? (
            <Spinner />
          ) : (
            <InputButton label="자기소개서 제작" onClick={handleSubmit} />
          )}
        </div>
      </main>
    </div>
  );
};

export default InputPage;

/*

문항
스스로의 의지로 새로운 도전이나 변화를 시도했던 경험을 작성해 주세요.

경험 활동
고등교 졸업 후 빠르게 취직해 인턴 경험을 함.
그러나 이론의 중요를 느껴 대학에 다시가 수학함.
이를 통해 탄탄한 기초를 다지게 됨

장점
논리적 사고력
끝없는 탐구
왜 인지를 파악하려는 깊은 고찰

단점
걱정이 많다

지원동기 및 목표
네이버는 꿈의 직장이므로 꼭 합류해 세상을 바꾸고싶다.
끊임없이 공부해 멋진 사람이 되는 것
*/
