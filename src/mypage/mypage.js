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
        if (Array.isArray(data)) {
        // created_at 기준 내림차순 정렬
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
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
const handlePDF = async () => {
    if (!printRef.current) return;

    const containerEl = printRef.current;
    // 1) 원래 스타일을 백업
    const origOverflow = containerEl.style.overflow;
    const origMaxHeight = containerEl.style.maxHeight;
    const origHeight = containerEl.style.height;

    // 2) 전체 내용을 스크롤 없이 다 노출되도록 잠시 스타일 변경
    containerEl.style.overflow = "visible";
    containerEl.style.maxHeight = "none";
    containerEl.style.height = "auto";

    try {
      // 3) jsPDF 인스턴스 생성 (A4, 단위: pt)
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidthPt = pdf.internal.pageSize.getWidth();   // A4 가로(pt)
      const pageHeightPt = pdf.internal.pageSize.getHeight(); // A4 세로(pt)

      // 4) 각 “.pdf-section” 요소를 순서대로 가져와서 처리
      const sectionEls = containerEl.querySelectorAll(".pdf-section");
      let currentYPt = 0;  // 현재 PDF 페이지 상에서 쓰여진 높이(단위: pt)

      for (let i = 0; i < sectionEls.length; i++) {
        const sectionEl = sectionEls[i];

        // (a) 해당 섹션을 html2canvas로 캡처
        const sectionCanvas = await html2canvas(sectionEl, {
          scale: window.devicePixelRatio || 2,
          scrollX: 0,
          scrollY: 0,
          width: sectionEl.scrollWidth,
          height: sectionEl.scrollHeight,
          windowWidth: sectionEl.scrollWidth,
          windowHeight: sectionEl.scrollHeight,
        });

        // (b) 캔버스의 픽셀 크기를 PDF pt 단위로 환산
        const imgProps = pdf.getImageProperties(sectionCanvas.toDataURL("image/png"));
        // “이미지의 전체 픽셀 너비”가 PDF 페이지 너비(pageWidthPt)와 매핑되도록 비율 계산
        const sectionWidthPx = sectionCanvas.width;
        const sectionHeightPx = sectionCanvas.height;
        const imgWidthPt = pageWidthPt;
        const imgHeightPt = (sectionHeightPx * imgWidthPt) / sectionWidthPx;

        // (c) 만약 이 섹션 전체 높이(imgHeightPt)가 페이지 남은 영역(remainingPt)보다 크다면,
        //     - 페이지가 꽉 찼으므로 새 페이지를 추가하거나, 
        //     - 섹션이 페이지 하나보다 더 클 경우, 내부를 페이지 단위로 잘라서 삽입
        const remainingPt = pageHeightPt - currentYPt;
        if (imgHeightPt <= remainingPt) {
          // “한 페이지 안에 섹션 전체가 들어갈 수 있다” → 그냥 현재 페이지에 넣기
          pdf.addImage(
            sectionCanvas.toDataURL("image/png"),
            "PNG",
            0,
            currentYPt, 
            imgWidthPt,
            imgHeightPt
          );
          currentYPt += imgHeightPt; // 그려넣은 만큼 Y 좌표 이동
        } else {
          // 페이지에 다 들어가지 않는 경우
          if (imgHeightPt <= pageHeightPt) {
            // (1) 페이지 한 장 분량보다 섹션 전체가 작음 → “현재 페이지가 꽉 찼으니” 새 페이지에서 삽입
            pdf.addPage();
            pdf.addImage(
              sectionCanvas.toDataURL("image/png"),
              "PNG",
              0,
              0, 
              imgWidthPt,
              imgHeightPt
            );
            currentYPt = imgHeightPt;
          } else {
            // (2) 섹션 자체가 한 페이지 높이보다 높음 → “섹션 내부를 또 나눠서” 페이지마다 삽입
            //     (예: very long section) → 페이지 단위로 캔버스를 잘라내서 넣기

            // 우선 현재 페이지가 비어 있지 않다면 “새 페이지”를 만듭니다.
            if (currentYPt !== 0) {
              pdf.addPage();
              currentYPt = 0;
            }

            // 섹션을 “페이지 높이(pt)만큼씩” 잘라서 추가
            const pxPerPt = sectionWidthPx / pageWidthPt;       // 1pt가 몇 px에 해당?
            const pageHeightPx = pageHeightPt * pxPerPt;        // 한 페이지 높이(px)
            const overlapPx = 20 * pxPerPt;                     // 오버랩: 20pt 정도 (줄 잘림 방지)
            const effectivePagePx = pageHeightPx - overlapPx;
            const totalSectionHeightPx = sectionHeightPx;
            const numPagesForSection = Math.ceil(
              (totalSectionHeightPx - overlapPx) / effectivePagePx
            );

            for (let p = 0; p < numPagesForSection; p++) {
              // (i) 자를 영역 계산
              const srcY = Math.floor(p * effectivePagePx);
              const remainingPx = totalSectionHeightPx - srcY;
              const sliceHeightPx = Math.min(pageHeightPx, remainingPx);

              // (ii) 잘라낼 임시 캔버스 생성
              const sliceCanvas = document.createElement("canvas");
              sliceCanvas.width = sectionWidthPx;
              sliceCanvas.height = sliceHeightPx;
              const sliceCtx = sliceCanvas.getContext("2d");

              // (iii) 원본 섹션 캔버스에서 Y=srcY부터 sliceHeightPx 만큼 복사
              sliceCtx.drawImage(
                sectionCanvas,
                0,               // sx
                srcY,            // sy
                sectionWidthPx,  // sWidth
                sliceHeightPx,   // sHeight
                0,               // dx
                0,               // dy
                sectionWidthPx,  // dWidth
                sliceHeightPx    // dHeight
              );

              // (iv) 첫 번째 페이지가 아니라면 새 페이지 추가
              if (p > 0) pdf.addPage();

              // (v) 잘라낸 캔버스를 PDF에 그리기
              const sliceHeightPt = (sliceHeightPx * imgWidthPt) / sectionWidthPx;
              pdf.addImage(
                sliceCanvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                imgWidthPt,
                sliceHeightPt
              );

              currentYPt = sliceHeightPt; // 현재 페이지에 그려진 높이(pt)
            }
          }
        }
      }

      // 5) 모든 섹션을 추가한 뒤 PDF 저장
      pdf.save("essays.pdf");
    } catch (err) {
      console.error("PDF 생성 중 오류 발생:", err);
    } finally {
      // 6) 스타일 원복
      containerEl.style.overflow = origOverflow;
      containerEl.style.maxHeight = origMaxHeight;
      containerEl.style.height = origHeight;
    }
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
              className={`page-btn ${currentPage === i + 1 ? "" : "active"}`}
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