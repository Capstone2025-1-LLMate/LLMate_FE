import React from 'react';

import './SelfIntroPage.css';  
// import SelfIntroPage from './output/outputPage';
import LayoutAside from '../layout/layoutAside';
import Qna from './Qna';


const qnaList = [
    {
        question: '문항 1. 지원하신 동기와 기대하시는 바를 말씀해주세요. 600자 이내)',
        answer: `네이버의 대규모 트래픽을 처리하는 백엔드 시스템 개발은 높은 수준의 기술력...`,
    },
    {
        question: '문항 2. 가장 열정을 가지고 임했던 프로젝트를 소개해주세요. (600자 이내)',
        answer: `해외 기업에서 웹 백엔드 인턴으로 근무하며 대규모 분산 시스템을 설계...`
    },
    // 추가 문항도 여기에 객체로 계속 넣을 수 있습니다
];
  
const SelfIntroPage = () => {
  return (
    <div className="self-intro-container">
      <LayoutAside/>
      <main className="content">
        {qnaList.map((item, idx) => (
          <Qna
            key={idx}
            question={item.question}
            answer={item.answer}
          />
        ))}

      </main>
    </div>
  );
};

export default SelfIntroPage;
