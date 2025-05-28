import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ResumePopup.css';

/**
 * ResumePopup
 * - isOpen: 팝업 열림 여부
 * - onClose: 팝업 닫기 콜백
 * - qnaList: [{ question, answer }] 배열
 * - evaluations: [{ reviewer, text }] 배열 (선택)
 */
const ResumePopup = ({ isOpen, onClose, qnaList, evaluations = [] }) => {
  const printRef = useRef();

  const handleSavePDF = async () => {
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('resume.pdf');
  };

  if (!isOpen) return null;

  return (
    <div className="resume-overlay">
      <div className="resume-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="resume-content" ref={printRef}>
          <h2>자기소개서</h2>
          {qnaList.map((item, idx) => (
            <div key={idx} className="resume-section">
              <h4>{item.question}</h4>
              <p>{item.answer}</p>
            </div>
          ))}
          {evaluations.length > 0 && (
            <div className="resume-section">
              <h4>평가</h4>
              {evaluations.map(({ id, reviewer, text }) => (
                <div key={id} className="evaluation-item">
                  <strong>{reviewer}:</strong> <span>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="save-btn" onClick={handleSavePDF}>PDF 저장</button>
      </div>
    </div>
  );
};

export default ResumePopup;
