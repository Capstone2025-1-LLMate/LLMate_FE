import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelfIntroPage.css';  
import LayoutAside from '../layout_old/layoutAside';
import Qna from './Qna';
import Evaluation from './eval';

const initialQna = [
    {
        question: '문항 1. 지원하신 동기와 기대하시는 바를 말씀해주세요. 600자 이내)',
        answer: `네이버의 대규모 트래픽을 처리하는 백엔드 시스템 개발은 높은 수준의 기술력...`,
    },
    {
        question: '문항 2. 가장 열정을 가지고 임했던 프로젝트를 소개해주세요. (600자 이내)',
        answer: `해외 기업에서 웹 백엔드 인턴으로 근무하며 대규모 분산 시스템을 설계...`
    },
    
];

const initialEvals = [
    { id: 1, reviewer: 'ChatGPT', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
    { id: 2, reviewer: 'Perplexity', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
    { id: 3, reviewer: 'Claude', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
];

const OutputPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const handleSave = () => {
        console.log('저장');
        // 저장 로직 
    };
    const handleEdit = () => {
        setIsEditing(true);
    };
    
    const handleSubmitModify = () => {
        navigate('/modify', {
          state: {
            original: { qnaList: initialQna, evaluations: initialEvals },
            edited:   { qnaList: initialQna, evaluations: initialEvals },
          }
        });
    };
    
    return (
        <div className="self-intro-container">
            <LayoutAside
                hideText={false}
            />

            <main className="content">
            {initialQna.map((item, idx) => (
                <Qna
                key={idx}
                question={item.question}
                answer={item.answer}
                />
            ))}
            <Evaluation evaluations={initialEvals} />

            {!isEditing ? (
                <div className="action-buttons">
                <button className="btn save" onClick={handleSave}>저장</button>
                
                <button className="btn edit" onClick={handleEdit}>수정</button>
                </div>
            ) : (
                // <InputBubble placeHolder={"원하시는 수정 문구를 입력해주세요."}/>
                <div className="input-bubble">
                    <textarea
                    className="input-field"
                    placeholder= "원하시는 수정 문구를 입력해주세요."
                    />
                    {/* <button className="submit-arrow" aria-label="제출" /> */}
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
