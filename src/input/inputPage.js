// src/components/InputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InputPage.css';
import LayoutAside from '../layout/layoutAside';
import InputButton from './InputButton';

const InputPage = () => {
  const navigate = useNavigate();

  // 입력 상태
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [experience, setExperience] = useState('');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [motivation, setMotivation] = useState('');

  // 자기소개서 문항
  const [qnaList, setQnaList] = useState([
    { id: 1, len: 600, value: '' }
  ]);

  const addQna = () => {
    setQnaList([...qnaList, { id: qnaList.length + 1, len: 600, value: '' }]);
  };

  const handleLenChange = (id, e) => {
    const newLen = parseInt(e.target.value) || 0;
    setQnaList(
      qnaList.map(item =>
        item.id === id ? { ...item, len: newLen } : item
      )
    );
  };

  const handleQnaChange = (id, e) => {
    setQnaList(
      qnaList.map(item =>
        item.id === id ? { ...item, value: e.target.value } : item
      )
    );
  };

  // 백엔드 전송
  const handleSubmit = async () => {
    const payload = {
      company,
      position,
      qnaList,
      experience,
      strength,
      weakness,
      motivation
    };

    try {
      const response = await fetch('http://localhost:8000/testLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('서버 응답: ', result);
      navigate('/output', { state: result });

    } catch (err) {
      console.error('자기소개서 생성 실패:', err);
    }
  };

  return (
    <div className="input-page-container">
      <LayoutAside hideText={true} />
      <main className="content">

        {/* 기업명, 직무 입력 */}
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

        {/* 자기소개서 질문 */}
        <div className="section">
          <h3>자기소개서 질문 문항 <span className="required">*</span></h3>
          {qnaList.map(item => (
            <div key={item.id} className="qna-block">
              <div className="qna-meta">
                <label>
                  글자수 제한:
                  <input
                    type="text"
                    className="len-input"
                    value={item.len}
                    onChange={e => handleLenChange(item.id, e)}
                  />
                </label>
              </div>
              <textarea
                className="qna-input"
                placeholder="예) 본인의 역량이 회사와 직무에 어떻게 기여할 수 있는지 서술하세요."
                maxLength={item.len}
                value={item.value}
                onChange={e => handleQnaChange(item.id, e)}
              />
            </div>
          ))}
          <div className="add-qna" onClick={addQna}>+ 추가하기</div>
        </div>

        {/* 경험 및 활동 */}
        <div className="section">
          <h3>경험 및 활동 <span className="required">*</span></h3>
          <textarea
            className="section-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="예) 활동명 · 기간 · 역할/성과 · 배운 점"
          />
        </div>

        {/* 성격 및 가치관 */}
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

        {/* 지원 동기 */}
        <div className="section">
          <h3>지원 동기 및 진로 목표</h3>
          <textarea
            className="section-input"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="예) 지원 동기 입력"
          />
        </div>

        {/* 버튼 */}
        <InputButton label="자기소개서 제작" onClick={handleSubmit} />
      </main>
    </div>
  );
};

export default InputPage;
