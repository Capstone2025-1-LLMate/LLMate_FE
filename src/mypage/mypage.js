import React, { useState } from "react";
import LayoutAside from "../layout/layoutAside";
import "./mypage.css";

const MyPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const toggleSelectItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((item) => item !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handlePinItems = () => {
    setPinnedItems([...pinnedItems, ...selectedItems]);
    setSelectedItems([]);
  };

  const handleDeleteItems = () => {
    setPinnedItems(pinnedItems.filter((item) => !selectedItems.includes(item)));
    setSelectedItems([]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = Array.from({ length: totalItems }).slice(startIndex, endIndex);

  return (
    <div className="mypage-container">
      {/* 사이드바 */}
      <LayoutAside>
        <div className="field">
          <h3>자소서 관리</h3>
        </div>

        <div className="pinned-section">
          <div className="pinned-header">
            <span className="star-icon">⭐</span>
            <span className="section-title">즐겨찾기</span>
          </div>

          <div className="divider"></div>

          <div className="pinned-list">
            {pinnedItems.length > 0 ? (
              pinnedItems.map((item, index) => (
                <div key={index} className="pinned-item">
                  자소서 {item + 1}
                </div>
              ))
            ) : (
              <div className="no-pinned">고정된 자소서가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={handlePinItems}>
            고정하기
          </button>
          <button className="sidebar-btn" onClick={handleDeleteItems}>
            삭제하기
          </button>
        </div>
      </LayoutAside>

      {/* 메인 컨텐츠 */}
      <div className="content">
        <div className="grid-container">
          {currentItems.map((_, index) => (
            <div key={index} className="item-container">
              <div className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(startIndex + index)} 
                  onChange={() => toggleSelectItem(startIndex + index)} 
                />
              </div>

              <div className="item-card">
                <div className="note-icon">📄</div>
                <div className="item-title">자소서 {startIndex + index + 1}</div>
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
