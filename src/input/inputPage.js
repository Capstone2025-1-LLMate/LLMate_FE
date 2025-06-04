// src/components/InputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InputPage.css';
import LayoutAside from '../layout/layoutAside';
import InputButton from './InputButton';

const InputPage = () => {
  const navigate = useNavigate();

<<<<<<< HEAD
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
=======
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [length, setLength] = useState(600);

  const [experience, setExperience] = useState('');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [motivation, setMotivation] = useState('');

  const handleSubmit = async () => {
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
      const response = await fetch('http://localhost:8000/essays/generate/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('서버 응답:', result);
      navigate('/output', { state: result });

    } catch (err) {
      console.error('자기소개서 생성 실패:', err);
    }
>>>>>>> 97aef35cd1750ec379b23d0fbd64382b12630dcd
  };

  // 123
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
      const response = await fetch('http://localhost:4000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      navigate('/output', { state: result });

    } catch (err) {
      console.error('자기소개서 생성 실패:', err);
    }
  };

  return (
    <div className="input-page-container">
      <LayoutAside hideText={true} />
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 97aef35cd1750ec379b23d0fbd64382b12630dcd
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

<<<<<<< HEAD
        {/* 지원 동기 */}
=======
>>>>>>> 97aef35cd1750ec379b23d0fbd64382b12630dcd
        <div className="section">
          <h3>지원 동기 및 진로 목표</h3>
          <textarea
            className="section-input"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="예) 지원 동기 입력"
          />
        </div>

<<<<<<< HEAD
        {/* 버튼 */}
=======
>>>>>>> 97aef35cd1750ec379b23d0fbd64382b12630dcd
        <InputButton label="자기소개서 제작" onClick={handleSubmit} />
      </main>
    </div>
  );
};

export default InputPage;
