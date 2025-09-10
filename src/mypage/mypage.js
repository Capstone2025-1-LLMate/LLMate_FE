import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./mypage.css";

/** 아이콘 (경로: src/mypage → src/asset) */
import pdfIcon from "../asset/save-icon.png";     // PDF 출력 아이콘
import deleteIcon from "../asset/delete-icon.png";

export default function MyPage() {
  /** ===== 탭 ===== */
  const [activeTab, setActiveTab] = useState("essays"); // "essays" | "experience"

  /** ===== 자기소개서(기존) ===== */
  const [essays, setEssays] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /** ===== PDF 모달 ===== */
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const printRef = useRef(null);

  /** ===== 미리보기 팝업 ===== */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupEssayData, setPopupEssayData] = useState(null);

  /** ===== 무한 스크롤 ===== */
  const [visibleCount, setVisibleCount] = useState(30);
  const sentinelRef = useRef(null);
  const listWrapRef = useRef(null);

  /** ===== 사이드바 즐겨찾기 ===== */
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("mypage_favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  /** ===== 내 경험 ===== */
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "경영대학로 플러스 디자인",
      period: "2023.3.20 ~ 2023.5.30",
      detail:
        "연구/아이디어: 타겟군의 기존 데이터 리서치 종합, 타겟 분석 및 전략 제안 주도\n배운 점/느낀 점: 소비자 인사이트 도출 과정의 중요성을 실감, 브랜드와 소비자 간 정서적 연결을 만드는 것이 마케팅의 핵심임을 체감",
      verified: true,
      use: true, // ✅ 체크박스로 답변에 사용할지 여부
    },
  ]);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newExp, setNewExp] = useState({ title: "", period: "", detail: "" });

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  /** ===== 데이터 로드 ===== */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/essay/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data))
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEssays(Array.isArray(data) ? data : []);
        setVisibleCount(30);
      } catch (e) {
        console.error("자소서 불러오기 실패:", e);
      }
    })();
  }, [navigate, token]);

  /** ===== 무한 스크롤(자소서 탭에서만) ===== */
  useEffect(() => {
    if (activeTab !== "essays" || !sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((prev) => Math.min(prev + 30, essays.length || prev));
        }
      },
      { root: listWrapRef.current || null, rootMargin: "0px 0px 300px 0px", threshold: 0.01 }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [essays.length, activeTab]);

  /** ===== 자소서 선택/해제 ===== */
  const toggleSelectItem = (id) =>
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const stopRowClick = (e) => e.stopPropagation();

  /** ===== 자소서: PDF 출력 모달 ===== */
  const handleOpenPdfModal = async () => {
    if (selectedItems.length === 0) return;
    try {
      const details = await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }).then((r) => r.json())
        )
      );
      setModalData(details);
      setShowModal(true);
    } catch (e) {
      console.error("상세 불러오기 실패:", e);
    }
  };

  /** ===== 자소서: 삭제 ===== */
  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }).then((res) => {
            if (!res.ok) throw new Error(`삭제 실패: ${id}`);
          })
        )
      );
      setEssays((prev) => prev.filter((e) => !selectedItems.includes(e.essay_id)));
      setSelectedItems([]);
    } catch (e) {
      console.error("삭제 중 오류:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  /** ===== 즐겨찾기 ===== */
  const handleAddFavorites = () => {
    if (selectedItems.length === 0) return;
    setFavorites((prev) => {
      const s = new Set(prev);
      selectedItems.forEach((id) => s.add(id));
      const next = Array.from(s);
      localStorage.setItem("mypage_favorites", JSON.stringify(next));
      return next;
    });
  };

  /** ===== 모달에서 실제 PDF 생성 ===== */
  const handlePDF = async () => {
    if (!printRef.current) return;
    const pdf = new jsPDF("p", "pt", "a4");
    try {
      const sections = printRef.current.querySelectorAll(".pdf-section");
      for (let i = 0; i < sections.length; i++) {
        const canvas = await html2canvas(sections[i], { scale: 2 });
        const img = canvas.toDataURL("image/png");
        const props = pdf.getImageProperties(img);
        const w = pdf.internal.pageSize.getWidth();
        const h = (props.height * w) / props.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, 0, w, h);
      }
      pdf.save("essays.pdf");
    } catch (e) {
      console.error("PDF 생성 오류:", e);
    }
  };

  /** ===== 내 경험: 추가/저장/삭제 + 사용여부 토글 ===== */
  const handleOpenAdd = () => setAddingOpen(true);
  const handleCancelAdd = () => {
    setAddingOpen(false);
    setNewExp({ title: "", period: "", detail: "" });
  };
  const handleChangeNewExp = (e) => {
    const { name, value } = e.target;
    setNewExp((s) => ({ ...s, [name]: value }));
  };
  const handleSaveNewExp = async () => {
    if (!newExp.title.trim() || !newExp.period.trim() || !newExp.detail.trim()) return;
    const newItem = { id: Date.now(), ...newExp, verified: true, use: true };
    setExperiences((prev) => [newItem, ...prev]);
    setAddingOpen(false);
    setNewExp({ title: "", period: "", detail: "" });

    /* // 서버 저장 예시(미구현)
    await fetch("http://localhost:8000/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newItem),
    });
    */
  };
  const handleDeleteExp = async (id) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    /* // 서버 삭제 예시(미구현)
    await fetch(`http://localhost:8000/experience/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    */
  };
  const handlePersistExp = async (id) => {
    const target = experiences.find((e) => e.id === id);
    console.log("Would persist experience:", target);
    /* // 서버 수정/저장 예시(미구현)
    await fetch(`http://localhost:8000/experience/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(target),
    });
    */
  };
  const toggleUseExp = (id) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, use: !e.use } : e)));
  };

  /** ===== 스타일 헬퍼 ===== */
  const styles = {
    listWrap: { width: "100%", maxWidth: 980, margin: "0 auto" },
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
      borderBottom: "1px solid #e5e7eb",
      cursor: "pointer",
      background: selected ? "#f5faff" : "#fff",
    }),
    checkbox: { width: 16, height: 16 },
    star: { fontSize: 16, color: "#bfc7d4" },
    company: { fontWeight: 600, color: "#1f2937" },
    position: { color: "#6b7280", marginLeft: 6 },
    question: { color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    date: { textAlign: "right", color: "#6b7280", fontSize: 13 },
    sentinel: { height: 1 },
  };

  const visibleItems = essays.slice(0, visibleCount);

  /** ===== 렌더 ===== */
  return (
    <div className="mypage-root">
      {/* 고정 사이드바 */}
      <aside className="fixed-sidebar" aria-label="사이드바">
        <div className="sb-profile">
          <div className="sb-avatar" />
          <div className="sb-name">김주현</div>
        </div>

        <nav className="sb-nav">
          <button
            className={`sb-nav-item ${activeTab === "essays" ? "active" : ""}`}
            onClick={() => setActiveTab("essays")}
          >
            자기소개서 모음
          </button>
          <button
            className={`sb-nav-item ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            내 경험
          </button>
        </nav>

        <div className="sb-footer">
          <button className="sb-cta" onClick={() => navigate("/write")}>자기소개서 제작하기</button>
        </div>
      </aside>

      {/* 오른쪽 컨텐츠 */}
      <main className="mypage-content" ref={listWrapRef}>
        {activeTab === "essays" ? (
          <>
            <div className="mypage-header">
              <h2 className="mypage-title">자기소개서 모음</h2>
              <div className="mypage-actions">
                <button className="icon-btn" onClick={handleOpenPdfModal} title="PDF 출력" disabled={selectedItems.length === 0}>
                  <img src={pdfIcon} alt="PDF 출력" />
                </button>
                <button className="icon-btn" onClick={handleDeleteItems} title="삭제" disabled={selectedItems.length === 0}>
                  <img src={deleteIcon} alt="삭제" />
                </button>
              </div>
            </div>

            <div style={styles.listWrap}>
              <div style={styles.header}>
                <span style={{ width: 32 }} />
                <span style={{ width: 24 }} />
                <span style={{ flex: 1.2 }}>회사 · 직무</span>
                <span style={{ flex: 2 }}>질문(미리보기)</span>
                <span style={{ width: 180, textAlign: "right" }}>작성일</span>
              </div>

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
                    onClick={() => {
                      setPopupEssayData(essay);
                      setIsPopupOpen(true);
                    }}
                  >
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selected}
                      onClick={stopRowClick}
                      onChange={() => toggleSelectItem(id)}
                    />
                    <span style={styles.star} onClick={stopRowClick} title="즐겨찾기">☆</span>
                    <div>
                      <span style={styles.company}>{company}</span>
                      <span style={styles.position}>({position})</span>
                    </div>
                    <div style={styles.question} title={question}>{question}</div>
                    <div style={styles.date}>{created}</div>
                  </div>
                );
              })}
              <div ref={sentinelRef} style={styles.sentinel} />
            </div>

            <div className="mp-pagination"><span>&lt;</span><span className="current">2</span><span>&gt;</span></div>
          </>
        ) : (
          <>
            {/* ===== 내 경험 뷰 ===== */}
            <div className="exp-header">
              <h2 className="exp-title">내 경험</h2>
              <p className="exp-tip">✨ 체크된 경험만 문항 답변에 사용됩니다.</p>
            </div>

            {experiences.map((exp) => (
              <div className={`exp-card ${exp.use ? "" : "exp-disabled"}`} key={exp.id}>
                <div className="exp-card-top">
                  <label className="exp-left">
                    <input
                      type="checkbox"
                      className="exp-use"
                      checked={!!exp.use}
                      onChange={() => toggleUseExp(exp.id)}
                      aria-label="이 경험 사용"
                    />
                    <span className="exp-badge">v</span>
                  </label>

                  <div className="exp-actions">
                    <button className="exp-save-btn" onClick={() => handlePersistExp(exp.id)}>저장하기</button>
                    <button className="exp-del-btn" onClick={() => handleDeleteExp(exp.id)} aria-label="삭제">
                      <img src={deleteIcon} alt="삭제" />
                    </button>
                  </div>
                </div>

                <div className="exp-body">
                  <div className="exp-line"><strong>활동명</strong> : {exp.title}</div>
                  <div className="exp-line"><strong>활동기간</strong> : {exp.period}</div>
                  <div className="exp-line"><strong>활동/기여도</strong> : {exp.detail.split("\n")[0]}</div>
                  <div className="exp-line"><strong>배운 점 / 느낀 점</strong> : {exp.detail.split("\n")[1]}</div>
                </div>
              </div>
            ))}

            {!addingOpen ? (
              <button className="exp-add-link" onClick={handleOpenAdd}>+ 추가하기</button>
            ) : (
              <div className="exp-add-form">
                <div className="row">
                  <label>활동명</label>
                  <input name="title" value={newExp.title} onChange={handleChangeNewExp} placeholder="예: 마케팅 서포터즈" />
                </div>
                <div className="row">
                  <label>활동기간</label>
                  <input name="period" value={newExp.period} onChange={handleChangeNewExp} placeholder="예: 2024.03 ~ 2024.08" />
                </div>
                <div className="row">
                  <label>상세</label>
                  <textarea name="detail" value={newExp.detail} onChange={handleChangeNewExp} placeholder="무엇을 했고 무엇을 배웠는지 작성해주세요." />
                </div>
                <div className="form-actions">
                  <button className="exp-save-btn" onClick={handleSaveNewExp}>저장하기</button>
                  <button className="exp-cancel-btn" onClick={handleCancelAdd}>취소</button>
                </div>
              </div>
            )}

            <div className="mp-pagination"><span>&lt;</span><span className="current">2</span><span>&gt;</span></div>
          </>
        )}
      </main>

      {/* PDF 모달 */}
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
            <button className="page-btn" onClick={handlePDF}>PDF 저장</button>
            <button className="page-btn" onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}

      {/* 자소서 미리보기 팝업 */}
      {isPopupOpen && popupEssayData && (
        <div className="popup-overlay">
          <div className="popup-container">
            <button className="popup-close" onClick={() => setIsPopupOpen(false)}>&times;</button>
            <h3 className="popup-title">
              {popupEssayData.essay_question.company_name} ({popupEssayData.essay_question.job_position})
            </h3>
            <p className="popup-question">질문: {popupEssayData.essay_question.question}</p>
            <div className="popup-answer">{popupEssayData.content}</div>
            <div className="popup-footer">
              <span>작성일: {new Date(popupEssayData.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
