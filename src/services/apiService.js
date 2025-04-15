import { getIdToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createNote = async (noteData) => {
  try {
    const token = await getIdToken();
    console.log('Creating note with data:', {
      noteData,
      token: token.substring(0, 10) + '...' // Log partial token for security
    });
    
    const response = await fetch(`${API_BASE_URL}notes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to create note:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to create note: ${response.status} ${response.statusText}`);
    }

    const createdNote = await response.json();
    console.log('Note created successfully:', createdNote);
    return createdNote;
  } catch (error) {
    console.error('Error in createNote:', error);
    throw error;
  }
};

export const getNotes = async (userUid) => {
  try {
    console.log('getNotes called with userUid:', userUid);
    const token = await getIdToken();
    console.log('Token retrieved:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.error('No token available for getNotes');
      return [];
    }

    const url = `${API_BASE_URL}notes/get-all?user_uid=${userUid}`;
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to get notes:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url
      });
      return [];
    }

    const notes = await response.json();
    console.log('Successfully fetched notes:', notes);
    
    const formattedNotes = notes.map(note => ({
      ...note,
      title: note.title || '',
      content: note.content || '',
      date: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'
    }));
    
    return formattedNotes;
  } catch (error) {
    console.error('Error in getNotes:', error);
    return [];
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE_URL}notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.status} ${response.statusText}`);
    }

    const updatedNote = await response.json();
    return updatedNote;
  } catch (error) {
    console.error('Error in updateNote:', error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE_URL}notes/delete/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete note: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteNote:', error);
    throw error;
  }
};
