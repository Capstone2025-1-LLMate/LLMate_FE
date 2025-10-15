// src/output/outputPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelfIntroPage.css";
import LayoutAside from "../layout/layoutAside";
import Qna from "./Qna";
import Evaluation from "./eval";

const Spinner = () => <div className="spinner" />;

const modelMap = {
  "gpt-4o-mini": "ChatGPT",
  "gpt-4o": "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
  Perplexity: "Perplexity",
};

const OutputPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // inputPage에서 넘어온 데이터(둘 다 지원: 평탄화 or essays[0].evaluations)
  const {
    essay_id,
    title,
    content,
    user_id,
    essay_question_id,
    evaluations,      // 평탄화 형태일 수 있음
    question,
    essays,           // [{ ..., evaluations: [...] }] 형태일 수 있음
  } = state || {};

  const [displayQuestion, setDisplayQuestion] = useState("문항 예시(없음)");
  const [displayTitle, setDisplayTitle] = useState("문항 예시 제목");
  const [displayContent, setDisplayContent] = useState("자기소개서 예시 본문");
  const [displayEvaluations, setDisplayEvaluations] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    // 1) 본문/제목/질문 우선 세팅. 없으면 essays[0]에서 보충.
    const firstEssay = Array.isArray(essays) && essays.length ? essays[0] : null;
    setDisplayQuestion(question ?? firstEssay?.question ?? "문항 예시(없음)");
    setDisplayTitle(title ?? firstEssay?.title ?? "문항 예시 제목");
    setDisplayContent(content ?? firstEssay?.content ?? "자기소개서 예시 본문");

    // 2) 평가 추출: evaluations 우선, 없으면 essays[].evaluations 평탄화
    const raw =
      (Array.isArray(evaluations) && evaluations.length ? evaluations : []) ||
      (Array.isArray(essays)
        ? essays.flatMap((e) => e?.evaluations ?? [])
        : []);

    const remapped = raw.map((item, idx) => {
      const id = item.id ?? item.feedback_id ?? idx + 1;
      const model = item.reviewer ?? item.llm_model ?? "";
      const text = item.text ?? item.feedback_text ?? "";
      return {
        id,
        reviewer: modelMap[model] || model, // 사람이 읽는 라벨로 매핑
        text,
      };
    });

    setDisplayEvaluations(remapped);
  }, [question, title, content, evaluations, essays]);

  const handleSave = () => navigate("/mypage");
  const handleEdit = () => setIsEditing(true);

  const handleSubmitModify = async () => {
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (!editRequest.trim()) {
      alert("수정 요청 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1) 수정 요청
      const revisionResponse = await fetch(
        `http://localhost:8000/revision/${essay_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id,
            revision: editRequest.trim(),
          }),
        }
      );
      if (!revisionResponse.ok) throw new Error("Revision request failed");

      // 2) 수정본 조회
      const essayRes = await fetch(
        `http://localhost:8000/revisions/${essay_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id,
            essay_question_id,
          }),
        }
      );
      if (!essayRes.ok) throw new Error("Failed to fetch revised essay");
      const essayData = await essayRes.json();
      const newEssayId = essayData.essay_id;
      const newContent = essayData.content;

      // 3) 수정본 평가
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

      const newEvaluations = (feedbackData.feedbacks ?? []).map((fb, idx) => ({
        id: fb.feedback_id ?? idx + 1,
        reviewer: modelMap[fb.llm_model] || fb.llm_model,
        text: fb.feedback_text ?? "",
      }));

      // 4) 비교 페이지로 이동
      navigate("/modify", {
        state: {
          original: {
            essayId: essay_id,
            user_id,
            title: displayTitle,
            essay_question_id,
            question: displayQuestion,
            content: displayContent,
            evaluations: displayEvaluations,
          },
          edited: {
            essayId: newEssayId,
            user_id,
            title: displayTitle,
            essay_question_id,
            question: displayQuestion,
            content: newContent,
            evaluations: newEvaluations,
          },
        },
      });
    } catch (err) {
      console.error("수정 요청 에러:", err);
      setError(err.message || "수정 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="self-intro-container">
      <LayoutAside />
      <main className="content">
        <Qna question={displayQuestion} title={displayTitle} answer={displayContent} />
        <Evaluation evaluations={displayEvaluations} />

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
      </main>
    </div>
  );
};

export default OutputPage;
