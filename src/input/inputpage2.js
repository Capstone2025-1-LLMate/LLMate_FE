import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './inputpage2.css';
import Header from '../layout/headers';
const Spinner = () => <div className="spinner" />;

// Mock data to simulate fetched user experiences
const mockUserExperiences = [
  {
    id: 1,
    title: '강원대학교 캡스톤 디자인',
    period: '2025.3.20~2025.5.30',
    role: '팀장으로 기획과 데이터 리서치 총괄, 타겟 분석 및 전략 제안 주도',
    learned: '소비자 인사이트 도출 과정의 중요성을 실감, 브랜드와 소비자 간 정서적 연결을 만드는 것이 마케팅의 핵심임을 배움'
  },
  {
    id: 2,
    title: '네이버 인턴',
    period: '2024.7.1~2024.12.31',
    role: '백엔드 API 개발 및 유지보수',
    learned: '대규모 트래픽 처리와 안정적인 서비스 운영의 중요성을 배움'
  }
];

const InputPage2 = () => {
  const navigate = useNavigate();

  // Form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [qnaList, setQnaList] = useState([
    { id: 1, len: 600, value: '' }
  ]);
  
  // Experience states
  const [userExperiences, setUserExperiences] = useState([]);
  const [selectedExpIds, setSelectedExpIds] = useState(new Set());

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this from an API
    setUserExperiences(mockUserExperiences);
  }, []);

  const handleExperienceToggle = (id) => {
    const newSelectedIds = new Set(selectedExpIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedExpIds(newSelectedIds);
  };

  const addQna = () => {
    setQnaList([...qnaList, { id: qnaList.length + 1, len: 600, value: '' }]);
  };

  const handleLenChange = (id, e) => {
    const newLen = parseInt(e.target.value) || 0;
    setQnaList(qnaList.map(item => item.id === id ? { ...item, len: newLen } : item));
  };

  const handleQnaChange = (id, e) => {
    setQnaList(qnaList.map(item => item.id === id ? { ...item, value: e.target.value } : item));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    const selectedExperiences = userExperiences
      .filter(exp => selectedExpIds.has(exp.id))
      .map(exp => `활동명: ${exp.title}, 기간: ${exp.period}, 역할/기여: ${exp.role}, 배운 점: ${exp.learned}`)
      .join('\n\n');

    const experiencesPayload = [
      { type: 'experience', content: selectedExperiences },
      { type: 'strength', content: strength },
    ];

    if (weakness.trim() !== '') {
      experiencesPayload.push({ type: 'weakness', content: weakness });
    }

    const payload = {
        company_name: company,
        job_position: position,
        questions: qnaList.map(q => ({ question: q.value, length_of_answer: q.len })),
        experiences: experiencesPayload
    };

    try {
      const response = await fetch('http://localhost:8000/essays/generate/full2', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      navigate('/output2', { state: { ...result, company_name: company, job_position: position } });

    } catch (err) {
      console.error('Failed to generate essay:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-input-page">
      <Header />

      <main className="new-form-container">
        <div className="new-form-row">
          <div className="new-form-group">
            <label htmlFor="company-name">기업명 :</label>
            <input id="company-name" type="text" placeholder="네이버" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="new-form-group">
            <label htmlFor="job-field">직무/분야 :</label>
            <input id="job-field" type="text" placeholder="백엔드 개발자" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
        </div>

        <div className="new-form-section">
          <h3 className="new-section-title">자기소개서 질문 문항 <span className="new-required">*</span></h3>
          {qnaList.map(item => (
            <div key={item.id} className="new-qna-item">
              <div className="new-qna-header">
                <label>글자 수 제한 :</label>
                <input type="text" className="new-char-limit-input" value={item.len} onChange={e => handleLenChange(item.id, e)} />
              </div>
              <textarea placeholder="예시) 본인의 역량이 회사와 직무에 어떻게 기여할 수 있는지 서술하세요." value={item.value} onChange={e => handleQnaChange(item.id, e)} />
            </div>
          ))}
          <button className="new-add-button" onClick={addQna}>+ 추가하기</button>
        </div>

        <div className="new-form-section">
          <h3 className="new-section-title">경험 및 활동 <span className="new-required">*</span></h3>
          <div className="new-info-box">
            ✨ 자기소개서에 넣을 경험 및 활동을 선택해 주세요!
          </div>
          <div className="experience-list">
            {userExperiences.map(exp => (
              <div key={exp.id} className={`experience-item ${selectedExpIds.has(exp.id) ? 'selected' : ''}`} onClick={() => handleExperienceToggle(exp.id)}>
                <div className="experience-checkbox">
                  {selectedExpIds.has(exp.id) && <div className="checkmark">✓</div>}
                </div>
                <div className="experience-content">
                  <p>• 활동명 : {exp.title}</p>
                  <p>• 활동기간 : {exp.period}</p>
                  <p>• 역할/기여도: {exp.role}</p>
                  <p>• 배운 점 / 느낀 점: {exp.learned}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="new-add-button" onClick={() => navigate('/mypage')}>+ 추가하기</button>
        </div>

        <div className="new-form-section">
          <h3 className="new-section-title">성격 및 가치관</h3>
          <div className="new-form-group-vertical">
            <label>장점</label>
            <input className ="mt15" type="text" placeholder="예시) 논리적인 사고력, 공감능력을 바탕으로 한 팀워크, 책임감 있게 끝까지 해내는 추진력" value={strength} onChange={(e) => setStrength(e.target.value)} />
          </div>
          <div className="new-form-group-vertical">
            <label>단점</label>
            <input type="text" className ="mt15" placeholder="예시) 완벽주의적 성향으로 때때로 실행이 늦어지는 경향이 있었지만, 우선순위 설정과 데드라인 관리로 개선 중" value={weakness} onChange={(e) => setWeakness(e.target.value)} />
          </div>
        </div>
        
        <div className="new-submit-container">
          {isLoading ? <Spinner /> : <button className="new-submit-button" onClick={handleSubmit}>제작하기</button>}
        </div>
      </main>
    </div>
  );
};

export default InputPage2;