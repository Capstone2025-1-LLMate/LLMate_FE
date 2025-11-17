import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./mypage.css";
import { Link } from "react-router-dom";
import Header from "../layout/headers";

import pdfIcon from "../asset/save-icon.png";
import deleteIcon from "../asset/delete-icon.png";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("essays");

  // 그룹 상태
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // 그룹 선택
  const [visibleCount, setVisibleCount] = useState(30);
  const listWrapRef = useRef(null);
  const sentinelRef = useRef(null);

  // 그룹 모달
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalData, setGroupModalData] = useState(null);

  // PDF 모달(선택 그룹의 모든 에세이)
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const printRef = useRef(null);

  // 경험
  const [experiences, setExperiences] = useState([]);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newExp, setNewExp] = useState({ type: "experience", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ type: "experience", content: "" });

  // 사용자
  const [userInfo, setUserInfo] = useState(null);

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // 사용자 정보
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
        console.error(err);
      }
    };
    loadUser();
  }, [token, navigate]);

  // 프런트 그룹화 로드
  useEffect(() => {
    if (!token) return;

    const groupByGroupId = (rows) => {
      const map = new Map();
      for (const e of Array.isArray(rows) ? rows : []) {
        const gid = e?.essay_question?.group_id ?? `orphan-${e.essay_id}`;
        if (!map.has(gid)) {
          map.set(gid, {
            group_id: e?.essay_question?.group_id ?? null,
            questions: [],
            created_at: e.created_at, // 임시
          });
        }
        map.get(gid).questions.push(e);
      }

      // 문항 정렬 및 그룹 대표시간 최신으로
      for (const g of map.values()) {
        g.questions.sort((a, b) => {
          const qa = a?.essay_question?.question_no ?? 0;
          const qb = b?.essay_question?.question_no ?? 0;
          if (qa !== qb) return qa - qb;
          return new Date(a.created_at) - new Date(b.created_at);
        });
        const latest = g.questions.reduce((mx, x) => Math.max(mx, +new Date(x.created_at)), 0);
        g.created_at = latest ? new Date(latest).toISOString() : g.created_at;
      }

      const arr = [...map.values()];
      arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      return arr;
    };

    const load = async () => {
      try {
        const res = await fetch("http://localhost:8000/essay/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const grouped = groupByGroupId(data);
        setGroups(grouped);
        setVisibleCount(30);
      } catch (e) {
        console.error("자기소개서 불러오기 실패:", e);
      }
    };
    load();
  }, [token]);

  // 경험 로드
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
        const list = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        setExperiences(list);
      } catch (e) {
        console.error(e);
      }
    };
    loadExperiences();
  }, [token]);

  // 무한 스크롤(그룹 기준)
  useEffect(() => {
    if (activeTab !== "essays" || !sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((prev) => Math.min(prev + 30, groups.length || prev));
        }
      },
      { root: listWrapRef.current || null, rootMargin: "0px 0px 300px 0px", threshold: 0.01 }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [groups.length, activeTab]);

  // 그룹 행 선택/해제
  const toggleSelectGroup = (gid) => {
    setSelectedGroupIds((prev) =>
      prev.includes(gid) ? prev.filter((x) => x !== gid) : [...prev, gid]
    );
  };
  const stopRowClick = (e) => e.stopPropagation();

  // 그룹 클릭 → 모달로 해당 그룹의 모든 에세이 보기
  const openGroupModal = (group) => {
    setGroupModalData(group);
    setIsGroupModalOpen(true);
  };

  // 선택 그룹 PDF 모달 열기
  const openPdfForSelectedGroups = () => {
    if (selectedGroupIds.length === 0) return;
    const essays = groups
      .filter((g) => selectedGroupIds.includes(g.group_id ?? `orphan-${g.questions[0].essay_id}`))
      .flatMap((g) => g.questions);
    setPdfData(essays);
    setShowPdfModal(true);
  };

  // PDF 생성
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

  // 선택 그룹 삭제(해당 그룹의 모든 에세이 삭제)
  const handleDeleteGroups = async () => {
    if (selectedGroupIds.length === 0) return;
    try {
      const targets = groups.filter((g) =>
        selectedGroupIds.includes(g.group_id ?? `orphan-${g.questions[0].essay_id}`)
      );
      const essayIds = targets.flatMap((g) => g.questions.map((e) => e.essay_id));

      await Promise.all(
        essayIds.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      setGroups((prev) =>
        prev.filter((g) => !selectedGroupIds.includes(g.group_id ?? `orphan-${g.questions[0].essay_id}`))
      );
      setSelectedGroupIds([]);
    } catch (e) {
      console.error("삭제 중 오류:", e);
    }
  };

  // 경험 CRUD
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
      setExperiences((prev) => prev.map((e) => (e.experience_id === id ? updated : e)));
    } catch (e) {
      console.error(e);
      setExperiences((prev) => prev.map((e) => (e.experience_id === id ? old : e)));
    }
  };
  const removeExp = async (id) => {
    const oldList = experiences;
    setExperiences((prev) => prev.filter((e) => e.experience_id !== id));
    try {
      const res = await fetch(`http://localhost:8000/api/essay-info/essay-experience/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("경험 삭제 실패");
    } catch (e) {
      console.error(e);
      setExperiences(oldList);
    }
  };

  const visibleGroups = groups.slice(0, visibleCount);

  const displayCompany = (g) => {
    const setCmp = new Set(g.questions.map((e) => e.essay_question?.company_name || "-"));
    const setPos = new Set(g.questions.map((e) => e.essay_question?.job_position || "-"));
    const c = [...setCmp];
    const p = [...setPos];
    if (c.length === 1 && p.length === 1) return `${c[0]} (${p[0]})`;
    return `${c[0]} 외 ${c.length - 1}개`;
  };

  const displayQuestionPreview = (g) => {
    const first = g.questions[0]?.essay_question?.question || "-";
    const count = g.questions.length;
    return count > 1 ? `문항 ${count}개 · ${first}` : first;
  };

  const groupKey = (g, idx) => g.group_id ?? `orphan-${g.questions[0].essay_id}-${idx}`;
  const groupIdForSelect = (g) => g.group_id ?? `orphan-${g.questions[0].essay_id}`;

  return (
    <>
      <Header />
      <div className="mypage-root">

        <aside className="fixed-sidebar">
          <div className="sb-profile">
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
            <button className={`sb-nav-item ${activeTab === "essays" ? "active" : ""}`} onClick={() => setActiveTab("essays")}>
              자기소개서 모음
            </button>
            <button className={`sb-nav-item ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}>
              내 경험
            </button>
          </nav>

          <div className="sb-footer">
            <button className="sb-cta" onClick={() => navigate("/input2")}>자기소개서 제작하기</button>
          </div>
        </aside>

        <main className="mypage-content" ref={listWrapRef}>
          {activeTab === "essays" ? (
            <>
              <div className="mypage-header">
                <h2 className="mypage-title">자기소개서 모음</h2>
                <div className="mypage-actions">
                  <button className="icon-btn" onClick={openPdfForSelectedGroups} disabled={selectedGroupIds.length === 0} title="PDF 출력">
                    <img src={pdfIcon} alt="PDF" />
                  </button>
                  <button className="icon-btn" onClick={handleDeleteGroups} disabled={selectedGroupIds.length === 0} title="삭제">
                    <img src={deleteIcon} alt="삭제" />
                  </button>
                </div>
              </div>

              <div className="list-wrap">
                <div className="list-head">
                  <span style={{ width: 32 }} />
                  <span style={{ width: 24 }} />
                  <span style={{ flex: 1.2 }}>회사 · 직무(그룹)</span>
                  <span style={{ flex: 2 }}>질문(그룹 미리보기)</span>
                  <span style={{ width: 180, textAlign: "right" }}>작성일</span>
                </div>

                {visibleGroups.map((g, gi) => {
                  const gid = groupIdForSelect(g);
                  const selected = selectedGroupIds.includes(gid);
                  const created = new Date(g.created_at).toLocaleString();
                  return (
                    <div
                      key={groupKey(g, gi)}
                      className={`list-row ${selected ? "row-selected" : ""}`}
                      onClick={() => openGroupModal(g)}
                    >
                      <input
                        type="checkbox"
                        className="row-check"
                        checked={selected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectGroup(gid)}
                      />
                      <span className="row-star" title="즐겨찾기">☆</span>
                      <div className="row-company">
                        <span className="c-name">{displayCompany(g)}</span>
                      </div>
                      <div className="row-question" title={displayQuestionPreview(g)}>{displayQuestionPreview(g)}</div>
                      <div className="row-date">{created}</div>
                    </div>
                  );
                })}

                <div ref={sentinelRef} style={{ height: 1 }} />
              </div>
            </>
          ) : (
            <>
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
                        <textarea name="content" value={editDraft.content} onChange={changeEdit} placeholder="경험 내용을 입력하세요" />
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
                    <textarea name="content" value={newExp.content} onChange={changeNew} placeholder="경험 내용을 입력하세요" />
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

        {/* 그룹 상세 모달: 해당 그룹 모든 에세이 */}
        {isGroupModalOpen && groupModalData && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 900 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {(() => {
                  const companies = Array.from(
                    new Set(groupModalData.questions.map(e => e?.essay_question?.company_name).filter(Boolean))
                  );
                  const positions = Array.from(
                    new Set(groupModalData.questions.map(e => e?.essay_question?.job_position).filter(Boolean))
                  );
                  const title =
                    companies.length === 1 && positions.length === 1
                      ? `${companies[0]} (${positions[0]})`
                      : `${companies[0]} 외 ${companies.length - 1}개`;
                  return (
                    <h3 style={{ margin: 0 }}>
                      {title} · 문항 {groupModalData.questions.length}개
                    </h3>
                  );
                })()}
                <button className="page-btn" onClick={() => setIsGroupModalOpen(false)}>닫기</button>
              </div>
              <hr />
              <div ref={printRef}>
                {groupModalData.questions.map((essay) => (
                  <div key={essay.essay_id} className="pdf-section" style={{ marginBottom: 24 }}>
                    <p className="pdf-question" style={{ fontWeight: 600 }}>
                      질문: {essay.essay_question.question}
                    </p>
                    <p className="pdf-answer">{essay.content}</p>
                    <div style={{ textAlign: "right", color: "#888" }}>
                      작성일: {new Date(essay.created_at).toLocaleString()}
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="page-btn" onClick={handlePDF}>PDF 저장</button>
              </div>
            </div>
          </div>
        )}

        {/* 선택 그룹 PDF 모달 */}
        {showPdfModal && (
          <div className="modal-overlay">
            <div className="modal-content" ref={printRef}>
              {pdfData.map((essay) => (
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
              <button className="page-btn" onClick={() => setShowPdfModal(false)}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
