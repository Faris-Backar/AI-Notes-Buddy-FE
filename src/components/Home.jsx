import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search } from 'lucide-react';
import Note from './Note';
import HistoryModal from './HistoryModal';
import NewNoteModal from './NewNoteModal';
import NoteDetailModal from './NoteDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Toast from './Toast';
import { createNote, getNotes, deleteNote, updateNote } from '../services/apiService';
import '../styles/home.css';

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteDetailOpen, setIsNoteDetailOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    const fetchNotes = async () => {
      console.log('Fetching notes - User:', user);
      if (user) {
        try {
          console.log('Starting to fetch notes...');
          setIsLoading(true);
          const fetchedNotes = await getNotes(user.uid);
          console.log('Fetched notes:', fetchedNotes);
          if (isMounted) {
            setNotes(fetchedNotes || []);
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
          showToast('Failed to fetch notes. Please try again.', 'error');
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        console.log('No user, clearing notes');
        setNotes([]);
        setIsLoading(false);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewNote = useCallback(() => {
    console.log('Opening new note modal');
    setSelectedNote(null); 
    setIsNewNoteOpen(true);
  }, []);

  const handleShowHistory = useCallback(() => {
    setIsHistoryOpen(true);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleNoteClick = useCallback((note) => {
    console.log('Note clicked:', note);
    setSelectedNote(note);
    setIsNewNoteOpen(true);
  }, []);

  const handleSaveNote = useCallback((noteData) => {
    return new Promise((resolve, reject) => {
      try {
        const data = {
          title: noteData.title || '',
          content: noteData.content || '',
          createUserName: user.displayName || 'Anonymous User',
          isActive: true,
          status: 'active',
          userUid: user.uid
        };
        
        console.log('Saving note with data:', data, 'Note ID:', noteData.id);
        
        if (user) {
          if (noteData.id) {
            console.log('Updating existing note with ID:', noteData.id);
            updateNote(noteData.id, data)
              .then(async (updatedNote) => {
                console.log('Note updated in backend:', updatedNote);
                showToast('Note updated successfully!', 'success');
                
                try {
                  const updatedNotes = await getNotes(user.uid);
                  setNotes(updatedNotes);
                } catch (error) {
                  console.error('Error refreshing notes:', error);
                }
                
                resolve(updatedNote);
              })
              .catch(error => {
                console.error('Failed to update note in backend:', error);
                showToast('Failed to update note. Please try again.', 'error');
                reject(error);
              });
          } else {
            console.log('Creating new note');
            createNote(data)
              .then(async (savedNote) => {
                console.log('Note saved to backend:', savedNote);
                showToast('Note saved successfully!', 'success');
                
                try {
                  const updatedNotes = await getNotes(user.uid);
                  setNotes(updatedNotes);
                } catch (error) {
                  console.error('Error refreshing notes:', error);
                }
                
                resolve(savedNote);
              })
              .catch(error => {
                console.error('Failed to save note to backend:', error);
                showToast('Failed to save note to server. Please try again.', 'error');
                reject(error);
              });
          }
        } else {
          showToast('Note saved locally.', 'info');
          resolve(noteData);
        }
      } catch (error) {
        console.error('Error in handleSaveNote:', error);
        showToast('An error occurred while saving the note.', 'error');
        reject(error);
      }
    });
  }, [user]);

  const handleCloseNewNote = useCallback(() => {
    setIsNewNoteOpen(false);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  const handleCloseNoteDetail = useCallback(() => {
    setIsNoteDetailOpen(false);
    setSelectedNote(null);
  }, []);

  const handleDeleteNote = useCallback((note) => {
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!noteToDelete) return;

    try {
      setIsDeleting(true);
      await deleteNote(noteToDelete.id);
      
      try {
        const updatedNotes = await getNotes(user.uid);
        setNotes(updatedNotes);
      } catch (error) {
        console.error('Error refreshing notes:', error);
      }
      
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Failed to delete note. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  }, [noteToDelete, user]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  }, []);

  const showLoading = isLoading && user;

  return (
    <div className="notes-container">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="profile-image"
            />
          )}
          <h1 className="app-title">AI Notes Buddy</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '1rem' }}>
          <button 
            onClick={handleSignOut}
            className="icon-button"
            aria-label="Sign out"
          >
            <LogOut size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="search-container">
        <Search size={20} strokeWidth={1.5} className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="note-count">
        <p>{filteredNotes.length} Notes</p>
      </div>

      <div className="notes-list">
        {showLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <p>No notes found. Create a new note to get started!</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => handleNoteClick(note)}
              className="note-item"
            >
              <Note 
                title={note.title}
                content={note.content}
                originalContent={note.originalContent}
                date={note.date}
                isAI={note.aiAssisted}
                onDelete={() => handleDeleteNote(note)}
              />
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={handleCreateNewNote}
        className="floating-button"
        aria-label="Create new note"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.75rem', height: '1.75rem' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={handleCloseHistory}
      />
      <NewNoteModal
        isOpen={isNewNoteOpen}
        onClose={handleCloseNewNote}
        onSave={handleSaveNote}
        note={selectedNote}
      />

      <NoteDetailModal
        isOpen={isNoteDetailOpen}
        onClose={handleCloseNoteDetail}
        note={selectedNote}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        noteTitle={noteToDelete?.title || ''}
        isDeleting={isDeleting}
      />

      <div className="toast-container">
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={hideToast}
          duration={3000}
        />
      </div>
    </div>
  );
};

export default Home;