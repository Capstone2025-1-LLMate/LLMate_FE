// src/modify/ModifyPage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Qna from "../output/Qna";
import Evaluation from "../output/eval";
import "./modifys.css";

const ModifyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // InputPage → OutputPage → ModifyPage 로 넘어온 original, edited 객체
  const { original = {}, edited = {} } = state || {};

  // original 버전: InputPage state 키와 동일하게 언패킹
  const {
    essayId: originalEssayId,
    user_id: originalUserId,
    essay_question_id: originalEssayQuestionId,
    title: originalTitle,
    content: originalContent,
    evaluations: originalEvaluations = [],
    question: originalQuestion
  } = original;

  // edited 버전: InputPage state 키와 동일하게 언패킹
  const {
    essayId: editedEssayId,
    user_id: editedUserId,
    essay_question_id: editedEssayQuestionId,
    title: editedTitle,
    content: editedContent,
    evaluations: editedEvaluations = [],
    question: editedQuestion
  } = edited;

  // JWT 토큰
  const token = localStorage.getItem("access_token");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (version) => {
    setError("");
    setSaving(true);

    // 토큰 없으면 로그인으로
    if (!token) {
      setSaving(false);
      navigate("/login");
      return;
    }

    try {
      // API 호출: 선택된 버전을 서버에 저장
      const selectedId = version === "original" ? originalEssayId : editedEssayId;
      const resp = await fetch(
        `http://localhost:8000/save-select/${selectedId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(
          `저장본 선택 실패 (${resp.status}): ${JSON.stringify(errJson)}`
        );
      }

      // 저장 성공 → /output 로 이동, InputPage state 형식 그대로 전달
      if (version === "original") {
        navigate("/output", {
          state: {
            essay_id: originalEssayId,
            user_id: originalUserId,
            essay_question_id: originalEssayQuestionId,
            title: originalTitle,
            content: originalContent,
            evaluations: originalEvaluations,
            question: originalQuestion,
          },
        });
      } else {
        navigate("/output", {
          state: {
            essay_id: editedEssayId,
            user_id: editedUserId,
            essay_question_id: editedEssayQuestionId,
            title: editedTitle,
            content: editedContent,
            evaluations: editedEvaluations,
            question: editedQuestion,
          },
        });
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modify-page">
      {error && (
        <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div className="compare-wrapper">
        {/* 수정 전 (Original) */}
        <div className="version-container before">
          <h3 className="version-title">수정 전 (Original)</h3>
          <div className="content-block">
            <div
              style={{
                whiteSpace: "pre-wrap",
                background: "#f8f8f8",
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
              }}
            >
              {originalContent}
            </div>
            {originalEvaluations.map((evalItem, idx) => (
              <Evaluation key={idx} evaluations={[evalItem]} />
            ))}
          </div>
          <button
            className="select-button"
            onClick={() => handleSelect("original")}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이 버전으로 저장"}
          </button>
        </div>

        {/* 수정 후 (Edited) */}
        <div className="version-container after">
          <h3 className="version-title">수정 후 (Edited)</h3>
          <div className="content-block">
            <div
              style={{
                whiteSpace: "pre-wrap",
                background: "#eef9ff",
                border: "1px solid #bbb",
                padding: "1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
              }}
            >
              {editedContent}
            </div>
            {editedEvaluations.map((evalItem, idx) => (
              <Evaluation key={idx} evaluations={[evalItem]} />
            ))}
          </div>
          <button
            className="select-button"
            onClick={() => handleSelect("edited")}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이 버전으로 저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyPage;
