// src/mypage/mypage.js

import React, { useEffect, useState, useRef } from "react";
import LayoutAside from "../layout/layoutAside";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./mypage.css";

export default function MyPage() {
  const [essays, setEssays] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);       // 팝업 오픈 상태
  const [popupEssayData, setPopupEssayData] = useState(null);  // 팝업에 표시할 에세이 데이터
  const printRef = useRef(null);
  const navigate = useNavigate();

  const itemsPerPage = 9;
  const token = localStorage.getItem("access_token"); // 토큰을 한 번만 가져옴

  // ───────────────────────────────────────────────────────────────────
  // 1) 컴포넌트 마운트 시 “내 전체 자기소개서(essay/my)”를 가져온다.
  useEffect(() => {
    if (!token) {
      console.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchEssays = async () => {
      try {
        // Authorization 헤더에 JWT 추가
        const res = await fetch("http://localhost:8000/essay/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });

        if (res.status === 401) {
          throw new Error("로그인이 필요합니다. (401 Unauthorized)");
        }
        if (!res.ok) {
          throw new Error(`자소서 불러오기 에러: ${res.status}`);
        }

        const data = await res.json();
        setEssays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("자소서 불러오기 실패:", error);
      }
    };

    fetchEssays();
  }, [token, navigate]);
  // ───────────────────────────────────────────────────────────────────

  // 페이지네이션 계산
  const totalItems = essays.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = essays.slice(startIndex, endIndex);

  // 체크박스 토글: 배열에서 선택/해제
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ───────────────────────────────────────────────────────────────────
  // 2) 삭제하기: 선택한 essay_id들을 DELETE /essay/{id} 로 보낸다
  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    setIsDeleting(true);
    try {
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 후 시도하세요.");
        navigate("/login");
        return;
      }

      await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }).then((res) => {
            if (res.status === 401) {
              throw new Error(`삭제 권한이 없습니다. (401 Unauthorized) ID: ${id}`);
            }
            if (!res.ok) {
              throw new Error(`삭제 실패: ${res.status} (ID: ${id})`);
            }
          })
        )
      );
      // 삭제된 아이디들은 상태에서 제거
      setEssays((prev) => prev.filter((essay) => !selectedItems.includes(essay.essay_id)));
      setSelectedItems([]);
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────────────────
  // 3) 저장하기: 선택한 아이디들 각각에 대해 GET /essay/{id} 해와서 모달에 띄움
  const handleSave = async () => {
    if (selectedItems.length === 0) return;
    try {
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 후 시도하세요.");
        navigate("/login");
        return;
      }

      const details = await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }).then((res) => {
            if (res.status === 401) {
              throw new Error(`조회 권한이 없습니다. (401 Unauthorized) ID: ${id}`);
            }
            if (!res.ok) {
              throw new Error(`상세 불러오기 실패: ${res.status} (ID: ${id})`);
            }
            return res.json();
          })
        )
      );
      setModalData(details);
      setShowModal(true);
    } catch (error) {
      console.error("상세 불러오기 실패:", error);
    }
  };
  // ───────────────────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────────────────
  // 4) PDF 저장: 모달 안 내용을 html2canvas → jsPDF로 내려받기
  const handlePDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("essays.pdf");
    } catch (error) {
      console.error("PDF 생성 오류:", error);
    }
  };
  // ───────────────────────────────────────────────────────────────────

  // 페이지 변경 시 선택된 체크박스 모두 초기화
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  // 조회 팝업 열기 함수
  const handleCardClick = (essay) => {
    setPopupEssayData(essay);
    setIsPopupOpen(true);
  };

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupEssayData(null);
  };

  return (
    <div className="mypage-container">
      <LayoutAside>
        <div className="field">
          <h3>자기소개서 목록</h3>
        </div>
        <div className="sidebar-footer">
          <button
            className="sidebar-btn"
            onClick={handleDeleteItems}
            disabled={isDeleting || selectedItems.length === 0}
          >
            {isDeleting ? "삭제 중..." : "삭제하기"}
          </button>
          <button
            className="sidebar-btn"
            onClick={handleSave}
            disabled={selectedItems.length === 0}
          >
            저장하기
          </button>
        </div>
      </LayoutAside>

      <div className="content">
        <div className="grid-container">
          {currentItems.map((essay) => (
            <div key={essay.essay_id} className="item-container">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(essay.essay_id)}
                  onChange={() => toggleSelectItem(essay.essay_id)}
                />
              </div>
              <div
                className="item-card"
                onClick={() => handleCardClick(essay)}
                style={{ cursor: "pointer" }}
              >
                <div className="note-icon">📄</div>
                <div className="item-header">
                  <span className="company">{essay.essay_question.company_name}</span>
                  <span className="position">{` (${essay.essay_question.job_position})`}</span>
                  {essay.isRevision && <span className="revision-badge">수정중</span>}
                </div>
                <div className="question">{essay.essay_question.question}</div>
                <div className="created-at">
                  {new Date(essay.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 모달: 저장 버튼(상세 보기) 클릭 후 뜨는 영역 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" ref={printRef}>
            {modalData.map((essay) => (
              <div key={essay.essay_id} className="pdf-section">
                <h4>{`${essay.essay_question.company_name} (${essay.essay_question.job_position})`}</h4>
                <p className="pdf-question">{essay.essay_question.question}</p>
                <p className="pdf-answer">{essay.content}</p>
                <hr />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="page-btn" onClick={handlePDF}>
              PDF 저장
            </button>
            <button className="page-btn" onClick={() => setShowModal(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 팝업: 카드 클릭 시 뜨는 조회 팝업 */}
      {isPopupOpen && popupEssayData && (
        <div className="popup-overlay">
          <div className="popup-container">
            <button className="popup-close" onClick={handleClosePopup}>
              &times;
            </button>
            <h3 className="popup-title">
              {popupEssayData.essay_question.company_name} (
              {popupEssayData.essay_question.job_position})
            </h3>
            <p className="popup-question">
              질문: {popupEssayData.essay_question.question}
            </p>
            <div className="popup-answer">{popupEssayData.content}</div>
            <div className="popup-footer">
              <span>
                작성일: {new Date(popupEssayData.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
