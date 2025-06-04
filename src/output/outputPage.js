// src/output/outputPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SelfIntroPage.css';
import LayoutAside from '../layout_old/layoutAside';
import Qna from './Qna';
import Evaluation from './eval';

const OutputPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 전달받은 값
  const { essay_id, title, content } = state || {};

  // 기본 예시로 초기값 설정
  const [displayTitle, setDisplayTitle] = useState('문항 예시 제목');
  const [displayContent, setDisplayContent] = useState('자기소개서 예시 본문');
  const [evaluations, setEvaluations] = useState([
    { id: 1, reviewer: 'ChatGPT', text: '' },
    { id: 2, reviewer: 'Perplexity', text: '' },
    { id: 3, reviewer: 'Claude', text: '' },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState('');

  // 에세이 데이터를 받아오면 초기값 덮어쓰기
  useEffect(() => {
    if (title) setDisplayTitle(title);
    if (content) setDisplayContent(content);
  }, [title, content]);

  // AI 평가 요청
  useEffect(() => {
    if (!essay_id) return;

    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('http://localhost:8000/essays/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essay_id,
            prompt_style: '강점과 약점을 구분해서 평가해줘',
          }),
        });

        const data = await res.json();

        const modelMap = {
          chatgpt: 'ChatGPT',
          gemini: 'Perplexity',
          claude: 'Claude',
        };

        const formatted = (data.feedbacks || []).map((fb, idx) => ({
          id: idx + 1,
          reviewer: modelMap[fb.llm_model] || fb.llm_model,
          text: fb.feedback_text,
        }));

        setEvaluations(formatted);
      } catch (err) {
        console.error('AI 피드백 요청 실패:', err);
      }
    };

    fetchFeedbacks();
  }, [essay_id]);

  const handleSave = () => {
    console.log('저장 클릭');
    // 저장 로직 또는 navigate('/save') 등 연결
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitModify = async () => {
    try {
      const response = await fetch('http://localhost:8000/feedback/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: { title: displayTitle, content: displayContent, evaluations },
          editRequest,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        const reviewers = ['ChatGPT', 'Perplexity', 'Claude'];
        const formattedEditedEvals = (result.evaluations || []).map((text, idx) => ({
          id: idx + 1,
          reviewer: reviewers[idx] || `AI ${idx + 1}`,
          text,
        }));

        navigate('/modify', {
          state: {
            original: { title: displayTitle, content: displayContent, evaluations },
            edited: {
              title: result.title || displayTitle,
              content: result.content || displayContent,
              evaluations: formattedEditedEvals,
            },
          },
        });
      } else {
        alert('수정 요청 실패! 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('수정 요청 에러:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="self-intro-container">
      <LayoutAside hideText={false} />
      <main className="content">
        <Qna question={displayTitle} answer={displayContent} />

        <Evaluation evaluations={evaluations} />

        {!isEditing ? (
          <div className="action-buttons">
            <button className="btn save" onClick={handleSave}>저장</button>
            <button className="btn edit" onClick={handleEdit}>수정</button>
          </div>
        ) : (
          <div className="input-bubble">
            <textarea
              className="input-field"
              placeholder="원하시는 수정 문구를 입력해주세요."
              value={editRequest}
              onChange={(e) => setEditRequest(e.target.value)}
            />
            <button
              className="submit-arrow"
              aria-label="제출"
              onClick={handleSubmitModify}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default OutputPage;
