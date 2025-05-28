import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelfIntroPage.css';
import LayoutAside from '../layout_old/layoutAside';
import Qna from './Qna';
import Evaluation from './eval';

const OutputPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [qnaList, setQnaList] = useState([
    { question: '문항 1. 지원하신 동기와 기대하시는 바를 말씀해주세요. (600자 이내)', answer: '' },
    { question: '문항 2. 가장 열정을 가지고 임했던 프로젝트를 소개해주세요. (600자 이내)', answer: '' },
  ]);
  const [evaluations, setEvaluations] = useState([
    { id: 1, reviewer: 'ChatGPT', text: '' },
    { id: 2, reviewer: 'Perplexity', text: '' },
    { id: 3, reviewer: 'Claude', text: '' },
  ]);
  const [editRequest, setEditRequest] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/testLogin');
        const data = await res.json();

        if (data.qnaList) setQnaList(data.qnaList);

        if (data.evaluations) {
          const reviewers = ['ChatGPT', 'Perplexity', 'Claude'];
          const formattedEvals = data.evaluations.map((text, idx) => ({
            id: idx + 1,
            reviewer: reviewers[idx] || `AI ${idx + 1}`,
            text,
          }));
          setEvaluations(formattedEvals);
        }
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    console.log('저장');
    // 저장 로직 필요 시 작성
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitModify = async () => {
    try {
      const response = await fetch('http://localhost:8000/testLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original: { qnaList, evaluations },
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
            original: { qnaList, evaluations },
            edited: {
              qnaList: result.qnaList || [],
              evaluations: formattedEditedEvals,
            },
          },
        });
      } else {
        alert('수정 요청 전송 실패! 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('수정 요청 중 에러 발생:', error);
      alert('서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div className="self-intro-container">
      <LayoutAside hideText={false} />
      <main className="content">
        {qnaList.map((item, idx) => (
          <Qna key={idx} question={item.question} answer={item.answer} />
        ))}

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
