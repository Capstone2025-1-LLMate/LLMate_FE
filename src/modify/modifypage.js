import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './modifys.css';
import LayoutAside from '../layout/layoutAside';
import Qna from '../output/Qna';
import Evaluation from '../output/eval';

const ModifyPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
  
    const {
      original = { qnaList: [], evaluations: [] },
      edited   = { qnaList: [], evaluations: [] }
    } = state || {};
  
    const handleSelect = (version) => {
      console.log('선택된 버전:', version);
    };
  
    return (
      <div className="modify-page">
        {/* 왼쪽 사이드바 */}
        <LayoutAside />
  
        {/* 비교 컨테이너 */}
        <div className="compare-wrapper">
          {/* 수정 전 */}
          <div className="version-container before">
            <h3 className="version-title">수정 전</h3>
            <div className="content-block">
              {original.qnaList.map((item, idx) => (
                <Qna
                  key={idx}
                  question={item.question}
                  answer={item.answer}
                  readOnly
                />
              ))}
              <Evaluation evaluations={original.evaluations} />
            </div>
            <button
              className="select-bottom"
              onClick={() => handleSelect('original')}
            >
              수정 전 선택
            </button>
          </div>
  
          {/* 수정 후 */}
          <div className="version-container after">
            <h3 className="version-title">수정 후</h3>
            <div className="content-block">
              {edited.qnaList.map((item, idx) => (
                <Qna
                  key={idx}
                  question={item.question}
                  answer={item.answer}
                  readOnly
                />
              ))}
              <Evaluation evaluations={edited.evaluations} />
            </div>
            <button
              className="select-bottom"
              onClick={() => handleSelect('edited')}
            >
              수정 후 선택
            </button>
          </div>
        </div>
      </div>
    );
  };
  
export default ModifyPage;

