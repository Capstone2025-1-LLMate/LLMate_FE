// src/modify/ModifyPage2.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from '../layout/headers';
import Evaluation from "../output/eval";
import "./modifys.css";
import { authFetch} from "../utils/authFetch";

const ModifyPage2 = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { original = {}, edited = {}, allEssays, company_name, job_position } = state || {};

  const {
    essayId: originalEssayId,
    title: originalTitle,
    content: originalContent,
    evaluations: originalEvaluations = [],
    question: originalQuestion
  } = original;

  const {
    essayId: editedEssayId,
    title: editedTitle,
    content: editedContent,
    evaluations: editedEvaluations = [],
    question: editedQuestion
  } = edited;

  const token = localStorage.getItem("access_token");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (version) => {
    setError("");
    setSaving(true);

    try {
      const selectedId = version === "original" ? original.essayId : edited.essayId;
      const unselectedId = version === "original" ? edited.essayId : original.essayId;

      const resp = await authFetch(
        `http://localhost:8000/save-select/${selectedId}`,
        {
          method: "POST",
          body: JSON.stringify({
            essay_id: unselectedId,
          }),
        }
      );

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(
          `저장본 선택 실패 (${resp.status}): ${JSON.stringify(errJson)}`
        );
      }

      const finalEssay = await resp.json();

      const updatedEssays = allEssays.map(essay => {
        if (essay.id === original.id) {
          return {
            ...essay,
            id: finalEssay.essay_id,
            content: finalEssay.content,
            isRevision: finalEssay.isRevision,
            evaluations: version === 'edited' ? edited.evaluations : original.evaluations,
          };
        }
        return essay;
      });

      navigate("/output2", {
        state: {
          essays: updatedEssays,
          company_name: company_name,
          job_position: job_position,
        },
      });

    } catch (e) {
      // authFetch handles 401, this will catch other network or server errors.
      console.error(e);
      setError(e.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modify-page-layout">
      <Header />
      {error && (
        <div style={{ color: "red", padding: "10px 20px", textAlign: "center", background: "#ffe3e3" }}>
          {error}
        </div>
      )}
      <div className="comparison-container">
        <div className="version-column">
          <div className="version-content">
            <h3 className="version-question">{originalQuestion}</h3>
            <div className="essay-box">
              <span style={{fontWeight : "bold"}}>{originalTitle}</span>
              <br />
              <div className="essay-text">{originalContent}</div>
            </div>
            <div className="evaluation-section">
              <h4 className="evaluation-header">평가</h4>
              {originalEvaluations.map((evalItem, idx) => (
                <Evaluation key={idx} evaluations={[evalItem]} />
              ))}
            </div>
          </div>
          <div className="version-footer">
            <button className="save-button" onClick={() => handleSelect("original")} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {/* Right Column (Edited) */}
        <div className="version-column">
          <div className="version-content">
            <h3 className="version-question">{editedQuestion}</h3>
            <div className="essay-box">
              <span style={{fontWeight : "bold"}}>{originalTitle}</span>
              <br />
              <div className="essay-text">{editedContent}</div>
            </div>
            <div className="evaluation-section">
              <h4 className="evaluation-header">평가</h4>
              {editedEvaluations.map((evalItem, idx) => (
                <Evaluation key={idx} evaluations={[evalItem]} />
              ))}
            </div>
          </div>
          <div className="version-footer">
            <button className="save-button" onClick={() => handleSelect("edited")} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyPage2;