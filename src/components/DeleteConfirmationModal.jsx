import React from 'react';
import '../styles/modal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, noteTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Note</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete "{noteTitle}"? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="cancel-button"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="loading-spinner"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 