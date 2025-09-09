import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../layout/headers';
import Evaluation from "./eval";
import './outputpage2.css';

const Spinner = () => <div className="spinner" />;

// Mock data for development if location.state is not available
const mockData = {
  company_name: "네이버",
  job_position: "백엔드 개발자",
  essays: [
    { 
      id: 1,
      user_id: 1, // For testing modify feature
      essay_question_id: 1, // For testing modify feature
      question: "1. 지원동기와 기대하는 바를 말씀해주세요. (500자 이내)",
      content: `네이버의 대규모 트래픽을 처리하는 백엔드 시스템 개발은 높은 수준의 기술력과 데이터 처리 역량이 요구되는 분야로, 제 경험과 강점을 효과적으로 활용할 수 있는 환경이라고 생각합니다. 해외 기업에서 웹 백엔드 인턴으로 근무하며 대규모 분산 시스템을 설계하고, 데이터베이스 최적화 및 API 성능 개선을 수행한 경험이 있습니다. 이를 통해 트래픽 부하를 효율적으로 분산하고 확장 가능한 서비스를 구축하는 역량을 키웠습니다.
또한, 다층 LLM을 활용한 웹 프로젝트를 진행하며 대량의 데이터를 처리하는 백엔드 환경을 설계하고, 모델 응답 속도를 최적화하기 위한 캐싱 및 비동기 처리 기법을 적용한 경험이 있습니다. 데이터 분석 대회에서는 대용량 데이터 처리 및 모델 최적화 기술을 적용해 수상하며, 데이터 기반 문제 해결 능력을 검증받았습니다.`,
      evaluations: [
        { id: 1, reviewer: 'ChatGPT', text: '목표와 경험의 연결이 잘 되어 있어요. 문단 구성이 주제별로 나뉘어 흐름이 자연스러워요.' },
        { id: 2, reviewer: 'Gemini', text: '네이버에 대한 관심과 열정은 잘 느껴져요! 하지만 클라우드 전문가로 어떤 강점이 있는지 구체적인 사례나 경험을 더 보여주면 좋겠어요.' },
        { id: 3, reviewer: 'Claude', text: '문장이 전반적으로 자연스럽고 맥락이 잘 이어집니다! 맞춤법, 띄어쓰기, 문법적 오류가 없어 정확성이 높습니다.' },
      ]
    },
    {
      id: 2,
      user_id: 1,
      essay_question_id: 2,
      question: "2. 본인의 역량이 회사와 직무에 어떻게 기여할 수 있는지 서술하세요.",
      content: "2번 문항에 대한 자기소개서 내용입니다...",
      evaluations: []
    },
    {
      id: 3,
      user_id: 1,
      essay_question_id: 3,
      question: "3. 협업 경험에 대해 말씀해주세요.",
      content: "3번 문항에 대한 자기소개서 내용입니다...",
      evaluations: []
    }
  ]
};

const OutputPage2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [essays, setEssays] = useState([]);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [selectedEssayId, setSelectedEssayId] = useState(null);
  const [isAsideCollapsed, setIsAsideCollapsed] = useState(false);

  // State for modification logic
  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = location.state || mockData;
    if (data && data.essays) {
      setEssays(data.essays);
      setCompany(data.company_name);
      setPosition(data.job_position);
      if (data.essays.length > 0) {
        setSelectedEssayId(data.essays[0].id);
      }
    }
  }, [location.state]);

  const selectedEssay = essays.find(e => e.id === selectedEssayId);

  const handleSave = () => navigate("/mypage");
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitModify = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    if (!editRequest.trim()) {
      alert("수정 요청 내용을 입력해주세요.");
      return;
    }

    if (!selectedEssay) {
      alert("수정할 에세이가 선택되지 않았습니다.");
      return;
    }
    
    if (!selectedEssay.user_id || !selectedEssay.essay_question_id) {
      alert("수정 요청에 필요한 정보(user_id, essay_question_id)가 없어 요청을 보낼 수 없습니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Send revision request
      await fetch(
        `http://localhost:8000/revision/${selectedEssay.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: selectedEssay.user_id,
            revision: editRequest.trim(),
          }),
        }
      );

      // 2. Fetch revised essay
      const essayRes = await fetch(
        `http://localhost:8000/revisions/${selectedEssay.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: selectedEssay.user_id,
            essay_question_id: selectedEssay.essay_question_id,
          }),
        }
      );

      if (!essayRes.ok) throw new Error("Failed to fetch revised essay");
      const essayData = await essayRes.json();
      const newEssayId = essayData.essay_id;
      const newContent = essayData.content;

      // 3. Fetch AI feedback for the new essay
      const feedbackRes = await fetch(
        "http://localhost:8000/api/feedbacks/multi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            essay_id: newEssayId,
            prompt_style: "강점과 약점을 구분해서 평가해줘",
          }),
        }
      );

      if (!feedbackRes.ok) throw new Error("Failed to fetch feedback");
      const feedbackData = await feedbackRes.json();

      const modelMap = {
        "gpt-4o-mini": "ChatGPT",
        gemini: "Gemini",
        claude: "Claude",
        Perplexity: "Gemini",
      };

      const newEvaluations = (feedbackData.feedbacks || []).map((fb, idx) => ({
        id: idx + 1,
        reviewer: modelMap[fb.llm_model] || fb.llm_model,
        text: fb.feedback_text,
      }));

      // 4. Navigate to ModifyPage with original and edited data
      navigate("/modify", {
        state: {
          original: { ...selectedEssay, essayId: selectedEssay.id },
          edited: {
            ...selectedEssay,
            id: newEssayId,
            essayId: newEssayId,
            content: newContent,
            evaluations: newEvaluations,
          },
        },
      });
    } catch (err) {
      console.error("Modification request error:", err);
      setError(err.message || "An error occurred during the modification request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="output-page-container">
      <Header />
      <div className="output-main-content">
        <aside className={`output-aside ${isAsideCollapsed ? 'collapsed' : ''}`}>
          <div className="aside-back-button" onClick={() => setIsAsideCollapsed(prev => !prev)}>‹</div>
          {!isAsideCollapsed && (
            <>
              <nav className="aside-nav">
                {essays.map(essay => (
                  <a 
                    key={essay.id} 
                    href="#"
                    className={`aside-question-item ${essay.id === selectedEssayId ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedEssayId(essay.id);
                    }}
                  >
                    {essay.question.split('.')[0]}
                    <span>{essay.question.split('.')[1]}</span>
                  </a>
                ))}
              </nav>
              <div className="aside-footer">
                <div className="aside-info-group">
                  <h3>기업</h3>
                  <p>{company}</p>
                </div>
                <div className="aside-info-group">
                  <h3>직무</h3>
                  <p>{position}</p>
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="output-content-area">
          {selectedEssay ? (
            <>
              <div className="essay-content-section">
                <h2 className="essay-question">{selectedEssay.question}</h2>
                <p className="essay-body">
                  {selectedEssay.content.split('\n').map((line, index) => (
                    <React.Fragment key={index}>{line}<br /></React.Fragment>
                  ))}
                </p>
              </div>
              <Evaluation evaluations={selectedEssay.evaluations} />
              
              {!isEditing ? (
                <div className="action-buttons">
                  <button className="btn-save" onClick={handleSave}>저장</button>
                  <button className="btn-edit" onClick={handleEdit}>수정</button>
                </div>
              ) : (
                <div className="input-bubble">
                  <textarea
                    className="input-field"
                    placeholder="원하시는 수정 문구를 입력해주세요."
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                  />
                  {loading ? (
                    <Spinner />
                  ) : (
                    <button
                      className="submit-arrow"
                      aria-label="제출"
                      onClick={handleSubmitModify}
                    />
                  )}
                  {error && (
                    <div style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
                      {error}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p>표시할 자기소개서를 선택해주세요.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default OutputPage2;
