import React, { useState, useEffect } from 'react';
import { getNoteSuggestion, generateNoteFromTopic } from '../services/openaiService';
import '../styles/modal.css'; // Add a new CSS file for modals

const NewNoteModal = ({ isOpen, onClose, onSave, note }) => {
  console.log('NewNoteModal rendered with isOpen:', isOpen, 'note:', note);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAiAssistEnabled, setIsAiAssistEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiError, setAiError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  // Reset form when modal is opened with no note (new note) or when note changes
  useEffect(() => {
    if (isOpen) {
      if (!note) {
        // Clear form for new note
        setTitle('');
        setContent('');
      } else {
        // Set form for editing existing note
        setTitle(note.title || '');
        setContent(note.content || '');
      }
      setAiPrompt('');
      setAiError('');
      setIsLoading(false);
      setIsAiAssistEnabled(false);
      setSaveStatus(null);
    }
  }, [isOpen, note]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    
    const updatedNote = {
      ...note, // Preserve existing note data if editing
      id: note?.id || Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
      }),
      aiAssisted: isAiAssistEnabled,
    };
    
    // Call the onSave function and handle the promise it returns
    Promise.resolve(onSave(updatedNote))
      .then(() => {
        // Show success status briefly before closing
        setSaveStatus('success');
        setTimeout(() => {
          onClose();
        }, 800);
      })
      .catch(error => {
        console.error('Error saving note:', error);
        setSaveStatus('error');
        // Keep modal open when there's an error
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleAIAssist = async () => {
    if (!content.trim() && !aiPrompt.trim()) {
      setAiError('Please enter some content or a prompt for AI assistance');
      return;
    }

    setIsLoading(true);
    setAiError('');
    
    try {
      let result;
      
      if (aiPrompt.trim()) {
        // Generate new note based on prompt
        result = await generateNoteFromTopic(aiPrompt);
        console.log('AI generated result:', result);
        
        // If title is empty, set it from the result
        if (!title.trim() && result.title) {
          setTitle(result.title);
        }
        
        // Process content based on its type
        if (typeof result.content === 'object') {
          // Content is already an object
          const formattedContent = formatContentObject(result.content);
          setContent(formattedContent);
        } else if (typeof result.content === 'string') {
          // Try to parse content as JSON if it looks like JSON
          if (result.content.trim().startsWith('{') && result.content.trim().endsWith('}')) {
            try {
              const contentObj = JSON.parse(result.content);
              const formattedContent = formatContentObject(contentObj);
              setContent(formattedContent);
            } catch (error) {
              // If parsing fails, use the content as is
              console.error('Error parsing content as JSON:', error);
              setContent(result.content);
            }
          } else {
            // Use the content as is
            setContent(result.content);
          }
        } else {
          // Fallback if content is neither object nor string
          setContent(String(result.content || ''));
        }
      } else {
        // Enhance existing content
        result = await getNoteSuggestion(content);
        setContent(result);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      setAiError('Error getting AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format content object into readable text
  const formatContentObject = (contentObj) => {
    if (!contentObj) return '';
    
    let formattedText = '';
    
    // Process introduction
    if (contentObj.introduction) {
      formattedText += contentObj.introduction + '\n\n';
    }
    
    // Process ingredients
    if (contentObj.ingredients) {
      formattedText += 'Ingredients:\n\n';
      
      if (typeof contentObj.ingredients === 'object') {
        // Handle nested ingredients object
        Object.entries(contentObj.ingredients).forEach(([section, items]) => {
          formattedText += `For ${formatTitle(section)}:\n`;
          
          if (typeof items === 'object' && !Array.isArray(items)) {
            // Handle further nested ingredients
            Object.entries(items).forEach(([subSection, subItems]) => {
              if (typeof subItems === 'object' && !Array.isArray(subItems)) {
                formattedText += `${formatTitle(subSection)}:\n`;
                
                Object.entries(subItems).forEach(([item, amount]) => {
                  formattedText += `• ${formatTitle(item)}: ${amount}\n`;
                });
              } else {
                formattedText += `• ${formatTitle(subSection)}: ${subItems}\n`;
              }
            });
          } else if (Array.isArray(items)) {
            // Handle array of ingredients
            items.forEach(item => {
              formattedText += `• ${item}\n`;
            });
          } else {
            formattedText += `• ${items}\n`;
          }
          
          formattedText += '\n';
        });
      } else if (typeof contentObj.ingredients === 'string') {
        formattedText += contentObj.ingredients + '\n\n';
      }
    }
    
    // Process instructions
    if (contentObj.instructions) {
      formattedText += 'Instructions:\n\n';
      
      if (typeof contentObj.instructions === 'object' && !Array.isArray(contentObj.instructions)) {
        // Handle object with step_1, step_2, etc.
        const sortedSteps = Object.entries(contentObj.instructions).sort(([a], [b]) => {
          // Extract numbers from step_1, step_2, etc. and compare
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });
        
        sortedSteps.forEach(([step, instruction], index) => {
          const stepNumber = step.match(/\d+/)?.[0] || (index + 1);
          formattedText += `${stepNumber}. ${instruction}\n\n`;
        });
      } else if (Array.isArray(contentObj.instructions)) {
        // Handle array of instructions
        contentObj.instructions.forEach((instruction, index) => {
          formattedText += `${index + 1}. ${instruction}\n\n`;
        });
      } else {
        // Handle string
        formattedText += contentObj.instructions + '\n\n';
      }
    }
    
    // Process serving suggestions (handle both singular and plural forms)
    if (contentObj.serving_suggestions || contentObj.serving_suggestion) {
      formattedText += 'Serving Suggestions:\n\n';
      formattedText += (contentObj.serving_suggestions || contentObj.serving_suggestion) + '\n\n';
    }
    
    // Process tips
    if (contentObj.tips) {
      formattedText += 'Tips:\n\n';
      
      if (Array.isArray(contentObj.tips)) {
        contentObj.tips.forEach((tip, index) => {
          formattedText += `• ${tip}\n`;
        });
      } else {
        formattedText += contentObj.tips + '\n';
      }
    }
    
    // Process any remaining top-level properties
    Object.entries(contentObj).forEach(([key, value]) => {
      if (!['introduction', 'ingredients', 'instructions', 'serving_suggestions', 'serving_suggestion', 'tips'].includes(key)) {
        if (typeof value === 'string') {
          formattedText += `\n${formatTitle(key)}:\n\n${value}\n\n`;
        }
      }
    });
    
    return formattedText.trim();
  };
  
  // Helper to format snake_case or camelCase titles to human-readable format
  const formatTitle = (title) => {
    return title
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Function to handle test recipe formatting
  const handleTestRecipe = () => {
    setTitle(TEST_RECIPE_JSON.title);
    const formattedContent = formatContentObject(TEST_RECIPE_JSON.content);
    setContent(formattedContent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{note ? 'Edit Note' : 'Create New Note'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="note-title-input"
            />
          </div>
          
          <div className="form-group">
            <textarea
              placeholder="Note Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="note-content-input"
            ></textarea>
          </div>

          {/* AI Assist Toggle */}
          <div className="toggle-container">
            <label className="toggle-label">
              <div className="toggle-switch-container">
                <input 
                  type="checkbox" 
                  className="toggle-input" 
                  checked={isAiAssistEnabled}
                  onChange={() => setIsAiAssistEnabled(!isAiAssistEnabled)}
                />
                <div className={`toggle-switch ${isAiAssistEnabled ? 'toggle-switch-enabled' : ''}`}></div>
                <div className={`toggle-slider ${isAiAssistEnabled ? 'toggle-slider-enabled' : ''}`}></div>
              </div>
              <div className="toggle-text">
                AI Assist
              </div>
            </label>
          </div>

          {/* AI Assist Options (visible when enabled) */}
          {isAiAssistEnabled && (
            <div className="ai-assist-container">
              <div className="ai-prompt-container">
                <label className="ai-prompt-label">
                  Ask AI to help (optional)
                </label>
                <input
                  type="text"
                  placeholder="E.g., Write a grocery list, Meeting notes about project X"
                  className="ai-prompt-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <p className="ai-prompt-help">
                  Enter a topic to generate a new note, or leave empty to enhance current content
                </p>
              </div>
              
              <div className="button-group">
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isLoading}
                  className="ai-generate-button"
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
                
                {/* <button
                  type="button"
                  onClick={handleTestRecipe}
                  className="test-recipe-button"
                >
                  Test Recipe Format
                </button> */}
              </div>
              
              {aiError && (
                <p className="ai-error-message">{aiError}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {saveStatus === 'error' && (
            <p className="save-error-message">
              Failed to save note. Please try again.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className={`save-button ${saveStatus === 'success' ? 'save-button-success' : ''} ${isSaving ? 'save-button-disabled' : ''}`}
          >
            {isSaving ? (
              <>
                <span className="loading-spinner"></span>
                {note ? 'Updating...' : 'Saving...'}
              </>
            ) : note ? (
              'Update Note'
            ) : (
              'Save Note'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNoteModal; 