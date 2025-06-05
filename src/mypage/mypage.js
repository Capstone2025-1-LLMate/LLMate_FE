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
  const printRef = useRef(null);

  //조회용 팝업
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupEssayData, setPopupEssayData] = useState(null);


  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const itemsPerPage = 9;
  
  useEffect(() => {

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchEssays = async () => {
      try {
        const res = await fetch("http://localhost:8000/essay/my", {
          method: "GET",
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEssays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("자소서 불러오기 실패:", error);
      }
    };
    fetchEssays();
  }, [navigate]);

  const totalItems = essays.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = essays.slice(startIndex, endIndex);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };


  const handleSave = async () => {
    if (selectedItems.length === 0) return;
    try {
      const details = await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => res.json())
        )
      );
      setModalData(details);
      setShowModal(true);
    } catch (error) {
      console.error("상세 불러오기 실패:", error);
    }
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "DELETE",
             headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => {
            if (!res.ok) throw new Error(`삭제 실패: ${id}`);
          })
        )
      );
      setEssays((prev) => prev.filter((essay) => !selectedItems.includes(essay.essay_id)));
      setSelectedItems([]);
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    } finally {
      setIsDeleting(false);
    }
  };

const handlePDF = async () => {
  if (!printRef.current) return;

  // (1) 모달 내부 전체가 스크롤 없이 보이도록 스타일 잠시 변경
  const modalEl = printRef.current;
  const origOverflow = modalEl.style.overflow;
  const origMaxHeight = modalEl.style.maxHeight;
  const origHeight = modalEl.style.height;
  modalEl.style.overflow = "visible";
  modalEl.style.maxHeight = "none";
  modalEl.style.height = "auto";

  try {
    // (2) html2canvas로 전체 영역 캡처 (scale 옵션으로 해상도 높이기)
    const canvas = await html2canvas(modalEl, {
      scale: window.devicePixelRatio || 2,
      scrollX: 0,
      scrollY: 0,
      width: modalEl.scrollWidth,
      height: modalEl.scrollHeight,
      windowWidth: modalEl.scrollWidth,
      windowHeight: modalEl.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // (3) jsPDF 생성 (A4 포맷, 단위: pt)
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();   // A4 가로(pt)
    const pageHeight = pdf.internal.pageSize.getHeight(); // A4 세로(pt)

    // (4) 캔버스 픽셀 크기 → PDF pt 크기 비율 계산
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidthPt = pageWidth;
    const imgHeightPt = (imgProps.height * imgWidthPt) / imgProps.width;

    // (5) 이미지가 한 페이지 높이를 넘으면 분할해서 PDF에 추가
    const totalPages = Math.ceil(imgHeightPt / pageHeight);

    for (let page = 0; page < totalPages; page++) {
      const yOffset = -page * pageHeight;
      if (page > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        yOffset,
        imgWidthPt,
        imgHeightPt
      );
    }

    // (6) PDF 저장
    pdf.save("essays.pdf");
  } catch (err) {
    console.error("PDF 생성 중 오류:", err);
  } finally {
    // (7) 모달 스타일 원복
    modalEl.style.overflow = origOverflow;
    modalEl.style.maxHeight = origMaxHeight;
    modalEl.style.height = origHeight;
  }
};

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  //조회 팝업
  const handleCardClick = (essay) => {
    setPopupEssayData(essay);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupEssayData(null);
  };

  return (
    <div className="mypage-container">
      <LayoutAside>
        <div className="field">
          {/* <h3>자기소개서 목록</h3> */}
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
                onClick={() => handleCardClick(essay)} // 카드 클릭 시 팝업 열기
                style={{ cursor: "pointer" }}
              >
                <div className="note-icon">📄</div>
                <div className="item-header">
                  <span className="company">{essay.essay_question.company_name}</span>
                  <span className="position">{` (${essay.essay_question.job_position})`}</span>
                  {essay.isRevision && <span className="revision-badge">수정중</span>}
                </div>
                <div className="question">{essay.essay_question.question}</div>
                {/* <div className="content-text">{essay.content}</div> */}
                <div className="created-at">{new Date(essay.created_at).toLocaleString()}</div>
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
            <div className="popup-answer">
              {popupEssayData.content}
            </div>
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