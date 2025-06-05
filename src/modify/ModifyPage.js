// src/modify/modifypage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Qna from "../output/Qna";
import Evaluation from "../output/eval";
import "./modifys.css";

const ModifyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // state.original.essayId, state.edited.essayId 가 이제 존재해야 합니다.
  const { original = {}, edited = {} } = state || {};

  const originalEssayId   = original.essayId   || "";  
  const originalContent   = original.content   || "";
  const originalQnaList   = original.qnaList   || [];
  const originalEvaluates = original.evaluations || [];

  const editedEssayId    = edited.essayId      || "";
  const editedContent    = edited.content      || "";
  const editedQnaList    = edited.qnaList      || [];
  const editedEvaluates  = edited.evaluations  || [];

  const token = localStorage.getItem("access_token");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSelect = async (version) => {
    setError("");
    setSaving(true);

    const selected =
      version === "original"
        ? {
            essayId: originalEssayId,   // ← 여기에 실제 ID가 들어 있습니다.
            content: originalContent,
            qnaList: originalQnaList,
            evaluations: originalEvaluates,
          }
        : {
            essayId: editedEssayId,     // ← 여기에 실제 ID가 들어 있습니다.
            content: editedContent,
            qnaList: editedQnaList,
            evaluations: editedEvaluates,
          };

    try {
      // 이제 URL에 ID가 붙어 있기 때문에 404가 뜨지 않습니다.
      const resp = await fetch(
        `http://localhost:8000/api/essay/${selected.essayId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: selected.content,
            qnaList: selected.qnaList,
            evaluations: selected.evaluations,
          }),
        }
      );

      if (!resp.ok) {
        throw new Error("저장에 실패했습니다.");
      }
      // 저장 완료 후 마이페이지로 이동
      navigate("/mypage", {
        state: {
          savedEssay: {
            essayId: selected.essayId,
            content: selected.content,
            qnaList: selected.qnaList,
            evaluations: selected.evaluations,
          },
        },
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "저장 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modify-page">
      <div className="compare-wrapper">
        {/* 수정 전(Original) */}
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
            {originalQnaList.map((item, idx) => (
              <Qna
                key={idx}
                question={item.question}
                answer={item.answer}
                readOnly
              />
            ))}
            <Evaluation evaluations={originalEvaluates} />
          </div>
          <button
            className="select-bottom"
            onClick={() => handleSelect("original")}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이 버전으로 저장"}
          </button>
        </div>

        {/* 수정 후(Edited) */}
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
            {editedQnaList.map((item, idx) => (
              <Qna
                key={idx}
                question={item.question}
                answer={item.answer}
                readOnly
              />
            ))}
            <Evaluation evaluations={editedEvaluates} />
          </div>
          <button
            className="select-bottom"
            onClick={() => handleSelect("edited")}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이 버전으로 저장"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ModifyPage;
