import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./mypage.css";

/** 아이콘 (프로젝트 구조에 맞춰 경로 확인)
 * 이미지 파일은 실제 프로젝트의 src/asset 폴더에 있어야 합니다.
 */
import pdfIcon from "../asset/save-icon.png";     // PDF 출력
import deleteIcon from "../asset/delete-icon.png";

export default function MyPage() {
  /** ================== 탭 스위치 ================== */
  const [activeTab, setActiveTab] = useState("essays"); // "essays" | "experience"

  /** ================== 자기소개서(기존) ================== */
  const [essays, setEssays] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const listWrapRef = useRef(null);
  const sentinelRef = useRef(null);

  /** PDF 모달 */
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const printRef = useRef(null);

  /** 팝업(미리보기) */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupEssayData, setPopupEssayData] = useState(null);

  /** ================== 내 경험(서버 연동: DB 스키마 맞춤) ================== */
  // DB 모델: experience_id, type, content, (user_id, essay_id)
  const [experiences, setExperiences] = useState([]);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newExp, setNewExp] = useState({ type: "experience", content: "" });

  // 단일 항목 편집
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ type: "experience", content: "" });

  /** 사용자 정보 (사이드바) */
  const [userInfo, setUserInfo] = useState(null);

  /** 공통 */
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  /* ================== 사용자 정보 로드 ================== */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const loadUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("사용자 정보 요청 실패");
        const data = await res.json();
        setUserInfo(data.user_info);
      } catch (err) {
        console.error("사용자 정보 가져오기 실패:", err);
      }
    };
    loadUser();
  }, [token, navigate]);

  /* ================== 자기소개서 로드 ================== */
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        // 내 자기소개서 목록 API
        // GET /essay/my
        const res = await fetch("http://localhost:8000/essay/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEssays(arr);
        setVisibleCount(30);
      } catch (e) {
        console.error("자기소개서 불러오기 실패:", e);
      }
    };
    load();
  }, [navigate, token]);

  /* ================== 내 경험 로드(READ) ================== */
  useEffect(() => {
    if (!token) return;
    const loadExperiences = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/essay-info/essay-experience", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("경험 목록 요청 실패");
        const data = await res.json();
        // 응답이 배열이거나 {items:[...]} 형태일 수 있어 방어적으로 처리
        const list = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        setExperiences(list);
      } catch (e) {
        console.error("경험 목록 불러오기 실패:", e);
      }
    };
    loadExperiences();
  }, [token]);

  /* ================== 무한 스크롤(자소서 탭에서만) ================== */
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

  /* ================== 자소서: 선택/모달/PDF/삭제 ================== */
  const toggleSelectItem = (id) =>
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const stopRowClick = (e) => e.stopPropagation();

  const handleOpenPdfModal = async () => {
    if (selectedItems.length === 0) return;
    try {
      // 단건 상세 조회 API: GET /essay/{essay_id}
      const details = await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).then((r) => r.json())
        )
      );
      setModalData(details);
      setShowModal(true);
    } catch (e) {
      console.error("상세 불러오기 실패:", e);
    }
  };

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

  const handleDeleteEssays = async () => {
    if (selectedItems.length === 0) return;
    try {
      // 삭제 API: DELETE /essay/{essay_id}
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      setEssays((prev) => prev.filter((e) => !selectedItems.includes(e.essay_id)));
      setSelectedItems([]);
    } catch (e) {
      console.error("삭제 중 오류:", e);
    }
  };

  /* ================== 내 경험: 추가/편집/삭제 ================== */
  const openAdd = () => setAddingOpen(true);
  const cancelAdd = () => {
    setAddingOpen(false);
    setNewExp({ type: "experience", content: "" });
  };

  const changeNew = (e) => {
    const { name, value } = e.target;
    setNewExp((s) => ({ ...s, [name]: value }));
  };

  const saveNew = async () => {
    const { type, content } = newExp;
    if (!content.trim()) return;
    try {
      const res = await fetch("http://localhost:8000/api/essay-info/essay-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, content }),
      });
      if (!res.ok) throw new Error("경험 추가 실패");
      const created = await res.json();
      setExperiences((prev) => [created, ...prev]);
      setAddingOpen(false);
      setNewExp({ type: "experience", content: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (exp) => {
    setEditingId(exp.experience_id);
    setEditDraft({ type: exp.type, content: exp.content ?? "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ type: "experience", content: "" });
  };

  const changeEdit = (e) => {
    const { name, value } = e.target;
    setEditDraft((s) => ({ ...s, [name]: value }));
  };

  const saveEdit = async (id) => {
    const idx = experiences.findIndex((e) => e.experience_id === id);
    if (idx < 0) return;

    // Optimistic UI
    const old = experiences[idx];
    const next = { ...old, ...editDraft };

    setExperiences((prev) => {
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setEditingId(null);

    try {
      const res = await fetch(`http://localhost:8000/api/essay-info/essay-experience/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: next.type, content: next.content }),
      });
      if (!res.ok) throw new Error("경험 수정 실패");
      const updated = await res.json();
      // 서버 정본으로 한번 더 싱크 (필요 시)
      setExperiences((prev) =>
        prev.map((e) => (e.experience_id === id ? updated : e))
      );
    } catch (e) {
      console.error(e);
      // rollback
      setExperiences((prev) =>
        prev.map((e) => (e.experience_id === id ? old : e))
      );
    }
  };

  const removeExp = async (id) => {
    const oldList = experiences;
    // Optimistic UI
    setExperiences((prev) => prev.filter((e) => e.experience_id !== id));

    try {
      const res = await fetch(`http://localhost:8000/api/essay-info/essay-experience/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("경험 삭제 실패");
    } catch (e) {
      console.error(e);
      // rollback
      setExperiences(oldList);
    }
  };

  /** 화면에 보이는 자기소개서 개수 */
  const visible = essays.slice(0, visibleCount);

  return (
    <div className="mypage-root">
      {/* ===== 고정 사이드바 ===== */}
      <aside className="fixed-sidebar">
        <div
          className="sb-profile"
        >
          <div
            className="sb-avatar"
            style={
              userInfo?.profile_image
                ? { backgroundImage: `url(${userInfo.profile_image})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div className="sb-name">{userInfo ? userInfo.name : "로딩 중..."}</div>
          <div className="sb-email">{userInfo ? userInfo.email : ""}</div>
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
          <button className="sb-cta" onClick={() => navigate("/write")}>
            자기소개서 제작하기
          </button>
        </div>
      </aside>

      {/* ===== 오른쪽 본문 ===== */}
      <main className="mypage-content" ref={listWrapRef}>
        {activeTab === "essays" ? (
          <>
            <div className="mypage-header">
              <h2 className="mypage-title">자기소개서 모음</h2>
              <div className="mypage-actions">
                <button
                  className="icon-btn"
                  onClick={handleOpenPdfModal}
                  disabled={selectedItems.length === 0}
                  title="PDF 출력"
                >
                  <img src={pdfIcon} alt="PDF" />
                </button>
                <button
                  className="icon-btn"
                  onClick={handleDeleteEssays}
                  disabled={selectedItems.length === 0}
                  title="삭제"
                >
                  <img src={deleteIcon} alt="삭제" />
                </button>
              </div>
            </div>

            {/* 리스트 헤더 */}
            <div className="list-wrap">
              <div className="list-head">
                <span style={{ width: 32 }} />
                <span style={{ width: 24 }} />
                <span style={{ flex: 1.2 }}>회사 · 직무</span>
                <span style={{ flex: 2 }}>질문(미리보기)</span>
                <span style={{ width: 180, textAlign: "right" }}>작성일</span>
              </div>

              {/* 리스트 */}
              {visible.map((essay) => {
                const id = essay.essay_id;
                const selected = selectedItems.includes(id);
                const company = essay.essay_question?.company_name ?? "-";
                const position = essay.essay_question?.job_position ?? "-";
                const question = essay.essay_question?.question ?? "-";
                const created = new Date(essay.created_at).toLocaleString();

                return (
                  <div
                    key={id}
                    className={`list-row ${selected ? "row-selected" : ""}`}
                    onClick={() => {
                      setPopupEssayData(essay);
                      setIsPopupOpen(true);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="row-check"
                      checked={selected}
                      onClick={stopRowClick}
                      onChange={() => toggleSelectItem(id)}
                    />
                    <span className="row-star" title="즐겨찾기">☆</span>
                    <div className="row-company">
                      <span className="c-name">{company}</span>
                      <span className="c-pos">({position})</span>
                    </div>
                    <div className="row-question" title={question}>{question}</div>
                    <div className="row-date">{created}</div>
                  </div>
                );
              })}

              <div ref={sentinelRef} style={{ height: 1 }} />
            </div>

          </>
        ) : (
          <>
            {/* ===== 내 경험 뷰 ===== */}
            <div className="exp-header">
              <h2 className="exp-title">내 경험</h2>
              <p className="exp-tip">✨ 유형(type)을 선택하고 내용을 입력해 저장하세요.</p>
            </div>

            {experiences.map((exp) => (
              <div key={exp.experience_id} className="exp-card">
                {editingId === exp.experience_id ? (
                  <div className="exp-edit">
                    <div className="row">
                      <label>유형</label>
                      <select name="type" value={editDraft.type} onChange={changeEdit}>
                        <option value="experience">경험</option>
                        <option value="strength">강점</option>
                        <option value="weakness">약점</option>
                        <option value="motivation">동기</option>
                        <option value="goal">목표</option>
                      </select>
                    </div>
                    <div className="row">
                      <label>내용</label>
                      <textarea
                        name="content"
                        value={editDraft.content}
                        onChange={changeEdit}
                        placeholder="경험 내용을 입력하세요"
                      />
                    </div>
                    <div className="form-actions">
                      <button className="exp-save-btn" onClick={() => saveEdit(exp.experience_id)}>저장</button>
                      <button className="exp-cancel-btn" onClick={cancelEdit}>취소</button>
                      <button className="exp-del-btn" onClick={() => removeExp(exp.experience_id)} aria-label="삭제">
                        <img src={deleteIcon} alt="삭제" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="exp-card-top" style={{ marginBottom: 8 }}>
                      <div className="exp-left">
                        <span className="exp-badge">{exp.type?.slice(0, 1).toUpperCase()}</span>
                        <strong style={{ textTransform: "capitalize" }}>{exp.type}</strong>
                      </div>
                      <div className="exp-actions">
                        <button className="exp-save-btn" onClick={() => startEdit(exp)}>편집</button>
                        <button className="exp-del-btn" onClick={() => removeExp(exp.experience_id)} aria-label="삭제">
                          <img src={deleteIcon} alt="삭제" />
                        </button>
                      </div>
                    </div>
                    <div className="exp-body">
                      <div className="exp-line">{exp.content}</div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!addingOpen ? (
              <button className="exp-add-link" onClick={() => setAddingOpen(true)}>+ 추가하기</button>
            ) : (
              <div className="exp-add-form">
                <div className="row">
                  <label>유형</label>
                  <select name="type" value={newExp.type} onChange={changeNew}>
                    <option value="experience">경험</option>
                    <option value="strength">강점</option>
                    <option value="weakness">약점</option>
                    <option value="motivation">동기</option>
                    <option value="goal">목표</option>
                  </select>
                </div>
                <div className="row">
                  <label>내용</label>
                  <textarea
                    name="content"
                    value={newExp.content}
                    onChange={changeNew}
                    placeholder="경험 내용을 입력하세요"
                  />
                </div>
                <div className="form-actions">
                  <button className="exp-save-btn" onClick={saveNew}>저장</button>
                  <button className="exp-cancel-btn" onClick={cancelAdd}>취소</button>
                </div>
              </div>
            )}

          </>
        )}
      </main>

      {/* ===== PDF 모달 ===== */}
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

      {/* ===== 자소서 미리보기 팝업 ===== */}
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
