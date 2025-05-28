import React, { useEffect, useState } from "react";
import LayoutAside from "../layout/layoutAside";
import "./mypage.css";

const MyPage = () => {
  const [essays, setEssays] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEssayId, setEditingEssayId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  const itemsPerPage = 9;

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const res = await fetch("http://localhost:8000/essay", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
          }
        });
        const data = await res.json();
        setEssays(data);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  const handleEditClick = (essay) => {
    setEditingEssayId(essay.id);
    setEditForm({ title: essay.title, content: essay.content });
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8000/essay", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify({
          id: editingEssayId,
          ...editForm
        })
      });

      if (!res.ok) throw new Error("수정 실패");

      const updated = await res.json();
      setEssays((prev) =>
        prev.map((essay) => (essay.id === editingEssayId ? updated : essay))
      );

      setEditingEssayId(null);
      setEditForm({ title: "", content: "" });
    } catch (err) {
      console.error("수정 중 오류 발생:", err);
    }
  };

  const handleDeleteItems = async () => {
    try {
      for (const id of selectedItems) {
        const res = await fetch(`http://localhost:8000/essay/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
          }
        });
        if (!res.ok) {
          throw new Error(`자소서 ${id} 삭제 실패`);
        }
      }

      setEssays((prev) => prev.filter((essay) => !selectedItems.includes(essay.id)));
      setSelectedItems([]);
    } catch (err) {
      console.error("삭제 중 오류:", err);
    }
  };

  return (
    <div className="mypage-container">
      <LayoutAside>
        <div className="field">
          <h3>자소서 관리</h3>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={handleDeleteItems}>
            삭제하기
          </button>
        </div>
      </LayoutAside>

      <div className="content">
        <div className="grid-container">
          {currentItems.map((essay) => (
            <div key={essay.id} className="item-container">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(essay.id)}
                  onChange={() => toggleSelectItem(essay.id)}
                />
              </div>
              <div className="item-card">
                <div className="note-icon">📄</div>
                {editingEssayId === essay.id ? (
                  <>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="제목"
                    />
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      placeholder="내용"
                    />
                    <button onClick={handleEditSubmit}>저장</button>
                  </>
                ) : (
                  <>
                    <div className="item-title">{essay.title}</div>
                    <button onClick={() => handleEditClick(essay)}>수정하기</button>
                  </>
                )}
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
    </div>
  );
};

export default MyPage;
