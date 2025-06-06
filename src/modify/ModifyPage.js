// src/modify/ModifyPage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Qna from "../output/Qna";
import Evaluation from "../output/eval";
import "./modifys.css";

const ModifyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // state 에서 전달된 original, edited 객체가 없으면 빈 객체로 초기화
  const { original = {}, edited = {} } = state || {};

  // original 버전에 담겨 있는 값 해체
  const originalEssayId   = original.essayId   || "";  
  const originalContent   = original.content   || "";
  const originalQnaList   = original.qnaList   || [];
  const originalEvaluates = original.evaluations || [];

  // edited 버전에 담겨 있는 값 해체
  const editedEssayId    = edited.essayId      || "";
  const editedContent    = edited.content      || "";
  const editedQnaList    = edited.qnaList      || [];
  const editedEvaluates  = edited.evaluations  || [];

  // localStorage 에 저장된 JWT 토큰 가져오기
  const token = localStorage.getItem("access_token");

  // 저장(선택) 중 상태, 에러 메시지 상태
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  /**
   * “이 버전으로 저장” 버튼 클릭 시 호출되는 함수
   * 변경: 이전에는 PUT /essay/{id} 로 수정 저장을 했지만,
   *       이제는 “선택된 버전”을 확정하기 위해 POST /save-select/{essay_id} 를 호출하도록 함.
   */
  const handleSelect = async (version) => {
    setError("");
    setSaving(true);

    // 어떤 버전을 선택했는지 결정
    const selected =
      version === "original"
        ? {
            essayId: originalEssayId,
            content: originalContent,
            qnaList: originalQnaList,
            evaluations: originalEvaluates,
          }
        : {
            essayId: editedEssayId,
            content: editedContent,
            qnaList: editedQnaList,
            evaluations: editedEvaluates,
          };

    // 1) 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      setSaving(false);
      navigate("/login");
      return;
    }

    // 2) 변경: 이제 “선택된 버전”을 저장하기 위해 POST /save-select/{essay_id} 호출
    try {
      // Console에 token 값 찍어보기 (디버깅용)
      console.log("POST /save-select 전 토큰:", token);
      console.log("선택된 essayId:", selected.essayId);

      const resp = await fetch(
        `http://localhost:8000/save-select/${selected.essayId}`, // 변경: PUT → POST /save-select/{id}
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 헤더에 JWT를 반드시 실어서 보냄
          },
          // 변경: POST /save-select/{id} 는 Body 없이 동작하기 때문에 body 삭제
        }
      );

      if (!resp.ok) {
        // 에러가 발생한 경우 응답 바디에 담긴 JSON(detail 등)을 파싱
        const errJson = await resp.json();
        console.error("POST /save-select 오류:", resp.status, errJson);
        throw new Error(`저장본 선택에 실패했습니다. (${resp.status})\n${JSON.stringify(errJson)}`);
      }

      // 저장 성공 후 마이페이지로 이동하며 선택된 essayId만 state로 전달
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
      setError(e.message || "저장 선택 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modify-page">
      {/* 에러 메시지가 있으면 상단에 표시 */}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div className="compare-wrapper">
        {/* 수정 전(Original) 버전 보여주기 */}
        <div className="version-container before">
          <h3 className="version-title">수정 전 (Original)</h3>
          <div className="content-block">
            {/* 자기소개서 내용 */}
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
            {/* QnA 목록 렌더링 */}
            {originalQnaList.map((item, idx) => (
              <Qna
                key={idx}
                question={item.question}
                answer={item.answer}
                readOnly
              />
            ))}
            {/* LLM 평가 결과 컴포넌트 */}
            <Evaluation evaluations={originalEvaluates} />
          </div>
          {/* 저장 버튼 (Original 버전 선택) */}
          <button
            className="select-button"
            onClick={() => handleSelect("original")}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이 버전으로 저장"}
          </button>
        </div>

        {/* 수정 후(Edited) 버전 보여주기 */}
        <div className="version-container after">
          <h3 className="version-title">수정 후 (Edited)</h3>
          <div className="content-block">
            {/* 수정된 자기소개서 내용 */}
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
            {/* 수정 후 QnA 목록 */}
            {editedQnaList.map((item, idx) => (
              <Qna
                key={idx}
                question={item.question}
                answer={item.answer}
                readOnly
              />
            ))}
            {/* 수정 후 LLM 평가 결과 */}
            <Evaluation evaluations={editedEvaluates} />
          </div>
          {/* 저장 버튼 (Edited 버전 선택) */}
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
