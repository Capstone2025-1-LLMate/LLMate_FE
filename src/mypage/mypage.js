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

  const itemsPerPage = 9;

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const res = await fetch("http://localhost:8000/essay/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": "Bearer " + localStorage.getItem("access_token"),
          },
        });
        const data = await res.json();
        setEssays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("자소서 불러오기 실패:", error);
      }
    };
    fetchEssays();
  }, []);

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
              // "Authorization": "Bearer " + localStorage.getItem("access_token"),
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

  const handleSave = async () => {
    if (selectedItems.length === 0) return;
    try {
      const details = await Promise.all(
        selectedItems.map((id) =>
          fetch(`http://localhost:8000/essay/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // "Authorization": "Bearer " + localStorage.getItem("access_token"),
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

  const handlePDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("essays.pdf");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  return (
    <div className="mypage-container">
      <LayoutAside>
        <div className="field">
          <h3>자소서 관리</h3>
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
              <div className="item-card">
                <div className="note-icon">📄</div>
                <div className="item-header">
                  <span className="company">{essay.essay_question.company_name}</span>
                  <span className="position">{` (${essay.essay_question.job_position})`}</span>
                  {essay.isRevision && <span className="revision-badge">수정중</span>}
                </div>
                <div className="question">{essay.essay_question.question}</div>
                <div className="content-text">{essay.content}</div>
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
    </div>
  );
}
