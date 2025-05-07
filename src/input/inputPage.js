// src/components/InputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InputPage.css';
import LayoutAside from '../layout/layoutAside';
import InputButton from './InputButton';

const InputPage = () => {
  const navigate = useNavigate();

  // QnA 항목들의 { id, len, value } 상태
  const [qnaList, setQnaList] = useState([
    { id: 1, len: 600, value: '' }
  ]);

  // 새 QnA 항목 추가
  const addQna = () => {
    setQnaList([...qnaList, { id: qnaList.length + 1, len: 600, value: '' }]);
  };

  // 글자수 제한 변경 핸들러
  const handleLenChange = (id, e) => {
    const newLen = parseInt(e.target.value) || 0;
    setQnaList(
      qnaList.map(item =>
        item.id === id ? { ...item, len: newLen } : item
      )
    );
  };

  // 사용자 입력 변경 핸들러
  const handleQnaChange = (id, e) => {
    setQnaList(
      qnaList.map(item =>
        item.id === id ? { ...item, value: e.target.value } : item
      )
    );
  };

  return (
    <div className="input-page-container">
      <LayoutAside hideText={true} />
      <main className="content">
      {/* <button
      className="back-button"
      onClick={() => navigate('/login')}
      style={{
        backgroundColor: '#f1f1f1',
        color: '#333',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '20px'
        }}
        >
          ← 뒤로가기
        </button> */}

        {/* 기업명, 직무 입력 */}
        <div className="field-inline">
          <label>
            <span className="label">기업명:</span>
            <input type="text" className="field-input" />
          </label>
          <label>
            <span className="label">직무/분야:</span>
            <input type="text" className="field-input" />
          </label>
        </div>

        {/* 자기소개서 질문 */}
        <div className="section">
          <h3>
            자기소개서 질문 문항 <span className="required">*</span>
          </h3>
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
          <h3>
            경험 및 활동 <span className="required">*</span>
          </h3>
          {/* 기존 InputBubble 대신 간단한 텍스트 에어리어로 유지 */}
          <textarea
            className="section-input"
            placeholder="예) 활동명 · 기간 · 역할/성과 · 배운 점"
          />
        </div>

        {/* 성격 및 가치관 */}
        <div className="section">
          <h3>성격 및 가치관</h3>

          <p>장점</p>
          <textarea
            className="section-input"
            placeholder="예) 논리적 사고력, 팀워크 등"
          />

          <p>단점</p>
          <textarea
            className="section-input"
            placeholder="예) 논리적 사고력, 팀워크 등"
          />
        </div>

        {/* 지원 동기 및 진로 목표 */}
        <div className="section">
          <h3>지원 동기 및 진로 목표</h3>
          <textarea
            className="section-input"
            placeholder="예) 지원 동기 입력"
          />
        </div>

        <InputButton
            label="자기소개서 제작"
            // onClick={() => console.log('제작 버튼 클릭')}
            onClick={() => navigate('/output')}
        />

      </main>
    </div>
  );
};

export default InputPage;
