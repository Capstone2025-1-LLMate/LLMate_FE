import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './inputpage2.css';
import Header from '../layout/headers';
import { authFetch } from '../utils/authFetch';
const Spinner = () => <div className="spinner" />;

const InputPage2 = () => {
  const navigate = useNavigate();

  // Form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [qnaList, setQnaList] = useState([{ id: 1, len: 600, value: '' }]);

  // Experience states
  const [userExperiences, setUserExperiences] = useState([]);
  const [selectedExpIds, setSelectedExpIds] = useState(new Set());
  
  // const [isLoading, setIsLoading] = useState(true);
  const [isExpLoading, setIsExpLoading] = useState(true); // 경험 불러오기 로딩
  const [isSubmitLoading, setIsSubmitLoading] = useState(false); // 제출 버튼 로딩
  
  // 경험 전체 조회
  useEffect(() => {
    const fetchExperiences = async () => {

      // setIsLoading(true);
      setIsExpLoading(true); // 🌟 isExpLoading 사용
      
      try {
        const response = await authFetch('http://localhost:8000/api/essay-info/essay-experience');

        // 오류 처리
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const experiences = await response.json();

        // type이 experience인 것만 필터링
        setUserExperiences(experiences.filter(exp => exp.type === 'experience'));
        // setIsLoading(false);
        setIsExpLoading(false); // 🌟 isExpLoading 사용

      } catch (err) {
        console.error('Failed to fetch experiences:', err);
        // setIsLoading(false);
        setIsExpLoading(false); // 🌟 isExpLoading 사용
      }
    };
    fetchExperiences();
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
    // setIsLoading(true);
    setIsSubmitLoading(true); // 🌟 isSubmitLoading 사용
    
    const selectedExperiences = userExperiences
      .filter(exp => selectedExpIds.has(exp.experience_id))
      .map(exp => exp.content)
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
      const response = await authFetch('http://localhost:8000/essays/generate/full2', {
        method: 'POST',
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
      // setIsLoading(false);
      setIsSubmitLoading(false); // 🌟 isSubmitLoading 사용
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
            {/* {isLoading ? ( */}
            {isExpLoading ? ( // 🌟 isExpLoading에 따라 렌더링
              <Spinner />
            ) : userExperiences.length > 0 ? (
              userExperiences.map(exp => (
                <div key={exp.experience_id} className={`experience-item ${selectedExpIds.has(exp.experience_id) ? 'selected' : ''}`} onClick={() => handleExperienceToggle(exp.experience_id)}>
                  <div className="experience-checkbox">
                    {selectedExpIds.has(exp.experience_id) && <div className="checkmark">✓</div>}
                  </div>
                  <div className="experience-content">
                    {/* The content is now directly rendered as a single block of text */}
                    <p>{exp.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>등록된 경험 및 활동이 없습니다. 경험 및 활동을 추가하면 더 완성도 높은 자기소개서가 작성됩니다.</p>
            )}
          </div>
          <button className="new-add-button" onClick={() => navigate('/mypage')}>+ 추가하기</button>
        </div>

        <div className="new-form-section">
          <h3 className="new-section-title">성격 및 가치관</h3>
          <div className="new-form-group-vertical">
            <label>장점</label>
            <input className="mt15" type="text" placeholder="예시) 논리적인 사고력, 공감능력을 바탕으로 한 팀워크, 책임감 있게 끝까지 해내는 추진력" value={strength} onChange={(e) => setStrength(e.target.value)} />
          </div>
          <div className="new-form-group-vertical">
            <label>단점</label>
            <input type="text" className="mt15" placeholder="예시) 완벽주의적 성향으로 때때로 실행이 늦어지는 경향이 있었지만, 우선순위 설정과 데드라인 관리로 개선 중" value={weakness} onChange={(e) => setWeakness(e.target.value)} />
          </div>
        </div>
        
        {/* <div className="new-submit-container">
          {isLoading ? <Spinner /> : <button className="new-submit-button" onClick={handleSubmit}>제작하기</button>}
        </div> */}
        <div className="new-submit-container">
          {isSubmitLoading ? <Spinner /> : <button className="new-submit-button" onClick={handleSubmit}>제작하기</button>} {/* 🌟 isSubmitLoading에 따라 렌더링 */}
        </div>
      </main>
    </div>
  );
};

export default InputPage2;