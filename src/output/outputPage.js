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

  // inputPage에서 넘어온 데이터
  const { essay_id, title, content, user_id, essay_question_id, evaluations,question } = state || {};

  const [displayQuestion, setDisplayQuestion] = useState('문항 예시(없음)');
  const [displayTitle, setDisplayTitle] = useState('문항 예시 제목');
  const [displayContent, setDisplayContent] = useState('자기소개서 예시 본문');
  const [displayEvaluations, setDisplayEvaluations] = useState([
    { id: 1, reviewer: 'ChatGPT', text: '' },
    { id: 2, reviewer: 'Gemini', text: '' },
    { id: 3, reviewer: 'Claude', text: '' },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  
  const modelMap = {
    "gpt-4o-mini": "ChatGPT",
    "gemini":      "Gemini",
    "claude":      "Claude",
    "Perplexity": "Gemini"
  };
  
  useEffect(() => {
    if (question)      setDisplayQuestion(question);
    if (title) setDisplayTitle(title);
    if (content) setDisplayContent(content);
    if (evaluations) setDisplayEvaluations(evaluations);
    if (evaluations) {
      const remapped = evaluations.map((item, idx) => ({
        id: item.id ?? idx + 1,
        reviewer: modelMap[item.reviewer] || item.reviewer,
        text: item.text
      }));
      setDisplayEvaluations(remapped);
    }
  }, [question, title, content, evaluations]);

  const handleSave = () => {
    navigate('/mypage'); // 저장 버튼 누르면 마이페이지로 이동
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitModify = async () => {
    try {
      // 1. 수정 요청 보내기
      const revisionResponse = await fetch(`http://localhost:8000/revision/${essay_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user_id,
          revision: editRequest,
        }),
      });

      if (!revisionResponse.ok) {
        throw new Error('Revision request failed');
      }

      // 2. 수정된 자기소개서 요청
      const essayRes = await fetch(`http://localhost:8000/revisions/${essay_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user_id,
          essay_question_id: essay_question_id,
        }),
      });

      const essayData = await essayRes.json();
      const newEssayId = essayData.essay_id;
      const newContent = essayData.content;

      // 3. 새 에세이에 대해 AI 피드백 요청
      const feedbackRes = await fetch('http://localhost:8000/feedback/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay_id: newEssayId,
          prompt_style: '강점과 약점을 구분해서 평가해줘',
        }),
      });

      const feedbackData = await feedbackRes.json();

      const newEvaluations = (feedbackData.feedbacks || []).map((fb, idx) => ({
        id: idx + 1,
        reviewer: modelMap[fb.llm_model] || fb.llm_model,
        text: fb.feedback_text,
      }));

      // 4. 수정 전과 수정 후 데이터를 modify 페이지로 넘기기
      navigate('/modify', {
        state: {
          original: {
            title: displayTitle,
            content: displayContent,
            evaluations: displayEvaluations,
          },
          edited: {
            title: displayTitle,
            content: newContent,
            evaluations: newEvaluations,
          },
        },
      });

    } catch (error) {
      console.error('수정 요청 에러:', error);
      alert('수정 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="self-intro-container">
      <LayoutAside hideText={false} />
      <main className="content">
        {/* <Qna question={displayTitle} answer={displayContent} /> */}
         <Qna 
          question={displayQuestion} 
          title={displayTitle} 
          answer={displayContent} 
        />
        <Evaluation evaluations={displayEvaluations} />

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
