import React, { useState } from 'react';
import '../styles/home.css';
import { Trash2, ChevronDown, ChevronUp, Edit } from 'lucide-react';

const Note = ({ title, content, date, isAI, onDelete, onEdit, originalContent }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      let dateObj;
      
      if (typeof dateString === 'string') {
        dateObj = new Date(dateString);
        
        if (isNaN(dateObj.getTime())) {
          const timestamp = parseInt(dateString);
          if (!isNaN(timestamp)) {
            dateObj = new Date(timestamp);
          }
        }
      } else if (typeof dateString === 'number') {
        // Handle timestamp
        dateObj = new Date(dateString);
      } else if (dateString instanceof Date) {
        // Already a Date object
        dateObj = dateString;
      }

      // Check if we have a valid date
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'No date';
      }

      // Format the date
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'No date';
    }
  };

  // Make sure we stop event propagation for action buttons
  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    if (onDelete) onDelete(e);
  };

  const handleEdit = (e) => {
    if (e) e.stopPropagation();
    if (onEdit) onEdit(e);
  };

  const toggleOriginal = (e) => {
    e.stopPropagation();
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="note-card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="note-title">{title}</h3>
          <div className="note-content-container">
            <p className="note-content">{content}</p>
          </div>
          {originalContent && (
            <div className="original-content-container">
              <button 
                className="toggle-original-button"
                onClick={toggleOriginal}
              >
                {showOriginal ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Hide Original</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Show Original</span>
                  </>
                )}
              </button>
              {showOriginal && (
                <div className="original-content">
                  <p>{originalContent}</p>
                </div>
              )}
            </div>
          )}
          <p className="note-date">{formatDate(date)}</p>
        </div>
        <div className="note-actions">
          {isAI && (
            <span className="ai-badge" title="Created with AI">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </span>
          )}
          <button 
            className="delete-button"
            onClick={handleDelete}
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Note;