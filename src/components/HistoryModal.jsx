import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNotes } from '../services/apiService';
import '../styles/modal.css';

const HistoryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isOpen && user) {
        try {
          setIsLoading(true);
          setError(null);
          const fetchedNotes = await getNotes(user.uid);
          console.log('Fetched notes:', fetchedNotes); // Debug log
          setNotes(fetchedNotes || []);
        } catch (error) {
          console.error('Error fetching history:', error);
          setError('Failed to load history. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">History</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>No history available</p>
            </div>
          ) : (
            <div className="history-list">
              {notes.map(note => (
                <div key={note.id} className="history-item">
                  <h3 className="history-item-title">{note.title || 'Untitled Note'}</h3>
                  <p className="history-item-date">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                  </p>
                  <p className="history-item-content">{note.content || 'No content'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal; 