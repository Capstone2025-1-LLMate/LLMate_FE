// src/pages/mypage.js
import React, { useEffect, useState, useRef } from "react";
import LayoutAside from "../layout/layoutAside";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./mypage.css";

/**
 * 메일함(지메일) 스타일 + 무한 스크롤(30개 단위)
 * - 사이드바 고정
 * - 리스트는 한 줄씩 스택 형태
 * - 체크 후 "즐겨찾기 추가" 클릭 시 사이드바의 즐겨찾기 문서함에 추가 (로컬 전용)
 */

export default function MyPage() {
  const [essays, setEssays] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // 저장 모달(PDF)
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const printRef = useRef(null);

  // 조회 팝업
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupEssayData, setPopupEssayData] = useState(null);

  // 무한 스크롤
  const [visibleCount, setVisibleCount] = useState(30);
  const sentinelRef = useRef(null);
  const listWrapRef = useRef(null);

  // 즐겨찾기(로컬)
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("mypage_favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // ===== 데이터 로드 (로그인 토큰 확인 → 목록 조회, 최신순 정렬) =====
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        setEssays(Array.isArray(data) ? data : []);
        setVisibleCount(30); // 목록 바뀌면 초기 30개부터
      } catch (error) {
        console.error("자소서 불러오기 실패:", error);
      }
    };
    fetchEssays();
  }, [navigate]);

  // ===== 무한 스크롤: sentinel이 보이면 30개 더 보여주기 =====
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              const next = Math.min(prev + 30, essays.length || prev);
              return next;
            });
          }
        });
      },
      {
        root: listWrapRef.current || null, // 스크롤 컨테이너
        rootMargin: "0px 0px 300px 0px",  // 조금 일찍 로드
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [essays.length]);

  // ===== 선택/해제 =====
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 체크박스 클릭 시 행 클릭(팝업) 이벤트 전파 방지
  const stopRowClick = (e) => e.stopPropagation();

  // ===== 저장(선택 항목 상세 조회 → 모달에서 PDF 저장 가능) =====
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

  // ===== 삭제 =====
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
      setEssays((prev) =>
        prev.filter((essay) => !selectedItems.includes(essay.essay_id))
      );
      setSelectedItems([]);
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ===== 행 클릭 → 조회 팝업 =====
  const handleCardClick = (essay) => {
    setPopupEssayData(essay);
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupEssayData(null);
  };

  // ===== 즐겨찾기 추가(로컬) =====
  const handleAddFavorites = () => {
    if (selectedItems.length === 0) return;
    // 선택된 id를 즐겨찾기에 병합
    setFavorites((prev) => {
      const set = new Set(prev);
      selectedItems.forEach((id) => set.add(id));
      const next = Array.from(set);
      localStorage.setItem("mypage_favorites", JSON.stringify(next));
      return next;
    });
  };

  // ===== 모달(PDF) 저장 =====
  const handlePDF = async () => {
    if (!printRef.current) return;

    const containerEl = printRef.current;
    const origOverflow = containerEl.style.overflow;
    const origMaxHeight = containerEl.style.maxHeight;
    const origHeight = containerEl.style.height;

    containerEl.style.overflow = "visible";
    containerEl.style.maxHeight = "none";
    containerEl.style.height = "auto";

    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidthPt = pdf.internal.pageSize.getWidth();
      const pageHeightPt = pdf.internal.pageSize.getHeight();

      const sectionEls = containerEl.querySelectorAll(".pdf-section");
      let currentYPt = 0;

      for (let i = 0; i < sectionEls.length; i++) {
        const sectionEl = sectionEls[i];
        const sectionCanvas = await html2canvas(sectionEl, {
          scale: window.devicePixelRatio || 2,
          scrollX: 0,
          scrollY: 0,
          width: sectionEl.scrollWidth,
          height: sectionEl.scrollHeight,
          windowWidth: sectionEl.scrollWidth,
          windowHeight: sectionEl.scrollHeight,
        });

        const sectionWidthPx = sectionCanvas.width;
        const sectionHeightPx = sectionCanvas.height;
        const imgWidthPt = pageWidthPt;
        const imgHeightPt = (sectionHeightPx * imgWidthPt) / sectionWidthPx;

        const remainingPt = pageHeightPt - currentYPt;
        if (imgHeightPt <= remainingPt) {
          pdf.addImage(
            sectionCanvas.toDataURL("image/png"),
            "PNG",
            0,
            currentYPt,
            imgWidthPt,
            imgHeightPt
          );
          currentYPt += imgHeightPt;
        } else {
          if (imgHeightPt <= pageHeightPt) {
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
            if (currentYPt !== 0) {
              pdf.addPage();
              currentYPt = 0;
            }
            const pxPerPt = sectionWidthPx / pageWidthPt;
            const pageHeightPx = pageHeightPt * pxPerPt;
            const overlapPx = 20 * pxPerPt;
            const effectivePagePx = pageHeightPx - overlapPx;
            const totalSectionHeightPx = sectionHeightPx;
            const numPagesForSection = Math.ceil(
              (totalSectionHeightPx - overlapPx) / effectivePagePx
            );

            for (let p = 0; p < numPagesForSection; p++) {
              const srcY = Math.floor(p * effectivePagePx);
              const remainingPx = totalSectionHeightPx - srcY;
              const sliceHeightPx = Math.min(pageHeightPx, remainingPx);

              const sliceCanvas = document.createElement("canvas");
              sliceCanvas.width = sectionWidthPx;
              sliceCanvas.height = sliceHeightPx;
              const sliceCtx = sliceCanvas.getContext("2d");

              sliceCtx.drawImage(
                sectionCanvas,
                0,
                srcY,
                sectionWidthPx,
                sliceHeightPx,
                0,
                0,
                sectionWidthPx,
                sliceHeightPx
              );

              if (p > 0) pdf.addPage();

              const sliceHeightPt = (sliceHeightPx * imgWidthPt) / sectionWidthPx;
              pdf.addImage(
                sliceCanvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                imgWidthPt,
                sliceHeightPt
              );
              currentYPt = sliceHeightPt;
            }
          }
        }
      }
      pdf.save("essays.pdf");
    } catch (err) {
      console.error("PDF 생성 중 오류 발생:", err);
    } finally {
      containerEl.style.overflow = origOverflow;
      containerEl.style.maxHeight = origMaxHeight;
      containerEl.style.height = origHeight;
    }
  };

  // ===== 인라인 스타일(메일함 느낌) =====
  const styles = {
    listWrap: {
      width: "100%",
      maxWidth: 980,
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
      color: "#6b7280",
      fontSize: 13,
    },
    row: (selected) => ({
      display: "grid",
      gridTemplateColumns: "32px 24px 1.2fr 2fr 180px",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderBottom: "1px solid #f1f5f9",
      cursor: "pointer",
      background: selected ? "#f1f5ff" : "#fff",
      transition: "background 0.15s",
    }),
    checkbox: { width: 16, height: 16 },
    star: { fontSize: 16, color: "#c8c8c8" },
    company: { fontWeight: 600, color: "#111827" },
    position: { color: "#6b7280", marginLeft: 6 },
    question: {
      color: "#374151",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    date: { textAlign: "right", color: "#6b7280", fontSize: 13 },
    sentinel: { height: 1 },
    favAddBtn: {
      width: "100%",          // 두 버튼+여백 합친 가로 길이(사이드바 전체 폭)
      padding: "16px",        // 기존 .sidebar-btn과 동일 높이감
      backgroundColor: "#5984B0",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 18,
      fontWeight: "bold",
      cursor: "pointer",
      marginBottom: 10,       // 아래(삭제/저장)와 간격
      transition: "background-color 0.2s, transform 0.1s",
    },
  };

  // 보여줄 목록(무한 스크롤 수만큼)
  const visibleItems = essays.slice(0, visibleCount);

  // ... (상단 import, state, 함수 등은 동일)

  return (
    <div className="mypage-container">
      <LayoutAside>
        {/* 사이드바 상단 영역: 즐겨찾기 문서함 */}
        <div className="pinned-section">
          <div className="pinned-header">
            <span className="star-icon">★</span>
            <span className="section-title">즐겨찾기 문서함</span>
          </div>
          <div className="divider" />
          <div className="pinned-list">
            {favorites.length === 0 ? (
              <div className="no-pinned">즐겨찾기한 문서가 없습니다.</div>
            ) : (
              favorites
                .map((id) => essays.find((e) => e.essay_id === id))
                .filter(Boolean)
                .map((essay) => (
                  <div
                    key={`fav-${essay.essay_id}`}
                    className="pinned-item"
                    title={essay.essay_question.question}
                    onClick={() => handleCardClick(essay)}
                  >
                    {essay.essay_question.company_name} (
                    {essay.essay_question.job_position})
                  </div>
                ))
            )}
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="sidebar-footer" style={{ flexDirection: "column" }}>
          {/* 즐겨찾기 추가 버튼 (삭제/저장 위) */}
          <button
            className="sidebar-btn"
            style={{ width: "100%" }}
            onClick={handleAddFavorites}
            disabled={selectedItems.length === 0}
          >
            즐겨찾기 추가
          </button>

          {/* 삭제하기 & 저장하기 버튼 (가로로 나란히) */}
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
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
        </div>
      </LayoutAside>

      {/* ===== 메일함 스타일 리스트 ===== */}
      <div className="content" ref={listWrapRef}>
        <div style={styles.listWrap}>
          {/* 리스트 헤더 */}
          <div style={styles.header}>
            <span style={{ width: 32 }} />
            <span style={{ width: 24 }} />
            <span style={{ flex: 1.2 }}>회사 · 직무</span>
            <span style={{ flex: 2 }}>질문(미리보기)</span>
            <span style={{ width: 180, textAlign: "right" }}>작성일</span>
          </div>

          {/* 행들 */}
          {visibleItems.map((essay) => {
            const id = essay.essay_id;
            const selected = selectedItems.includes(id);
            const company = essay.essay_question.company_name;
            const position = essay.essay_question.job_position;
            const question = essay.essay_question.question;
            const created = new Date(essay.created_at).toLocaleString();

            return (
              <div
                key={id}
                style={styles.row(selected)}
                onClick={() => handleCardClick(essay)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = selected ? "#eef2ff" : "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = selected ? "#f1f5ff" : "#fff")
                }
              >
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={selected}
                  onClick={stopRowClick}
                  onChange={() => toggleSelectItem(id)}
                />
                <span style={styles.star} onClick={stopRowClick} title="즐겨찾기">
                  ☆
                </span>
                <div>
                  <span style={styles.company}>{company}</span>
                  <span style={styles.position}>({position})</span>
                </div>
                <div style={styles.question} title={question}>
                  {question}
                </div>
                <div style={styles.date}>{created}</div>
              </div>
            );
          })}

          {/* sentinel */}
          <div ref={sentinelRef} style={styles.sentinel} />
        </div>
      </div>

      {/* 모달/팝업 부분 동일 */}
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
