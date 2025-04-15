import React from 'react';
import '../styles/modal.css';

const NoteDetailModal = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{note.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="note-content">
            {note.content}
          </div>
          <div className="note-meta">
            <span className="note-date">{note.date}</span>
            {note.aiAssisted && (
              <span className="ai-badge">AI Assisted</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailModal; 