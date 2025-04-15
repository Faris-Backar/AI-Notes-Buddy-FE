import React, { useState, useEffect } from 'react';
import { generateNoteFromTopic } from '../services/openaiService';
import '../styles/modal.css';

const QuickAIModal = ({ isOpen, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setError('');
      setSaveStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic or prompt for your note');
      return;
    }

    setIsLoading(true);
    setError('');
    setSaveStatus(null);
    
    try {
      const result = await generateNoteFromTopic(prompt);
      
      const newNote = {
        id: Date.now(),
        title: result.title,
        content: typeof result.content === 'object' 
          ? formatContentObject(result.content) 
          : result.content,
        date: new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'short',
          day: 'numeric',
        }),
        aiAssisted: true,
      };
      
      // Save the note with visual feedback
      setIsSaving(true);
      setIsLoading(false);
      
      Promise.resolve(onSave(newNote))
        .then(() => {
          setSaveStatus('success');
          setTimeout(() => {
            setPrompt('');
            onClose();
          }, 800);
        })
        .catch(error => {
          console.error('Error saving AI note:', error);
          setSaveStatus('error');
          setError('Failed to save the note. Please try again.');
        })
        .finally(() => {
          setIsSaving(false);
        });
      
    } catch (error) {
      console.error('Quick AI note generation error:', error);
      setError('Error generating AI note. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Helper function to format content object into readable text (copied from NewNoteModal)
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
          <h2 className="modal-title" style={{ color: 'white' }}>Quick AI Note</h2>
          <button 
            type="button"
            onClick={onClose}
            className="modal-close-button"
            style={{ color: 'white' }}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <p className="ai-prompt-help" style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#4b5563' }}>
            Tell the AI what kind of note you want to create, and it will generate it for you instantly.
          </p>
          
          <div className="form-group">
            <label className="ai-prompt-label">
              What would you like to create a note about?
            </label>
            <input
              type="text"
              placeholder="E.g., Meeting agenda for tomorrow, Weekly shopping list, Ideas for vacation"
              className="ai-prompt-input"
              style={{ padding: '0.75rem' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          {error && (
            <p className="ai-error-message">{error}</p>
          )}
          
          {saveStatus === 'success' && (
            <p className="save-success-message">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem', marginRight: '0.25rem', display: 'inline' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Note saved successfully!
            </p>
          )}
          
          <div className="button-group" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isLoading || isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || isSaving || !prompt.trim()}
              className={`ai-generate-button ${!prompt.trim() || isLoading || isSaving ? 'save-button-disabled' : ''}`}
              style={{ width: 'auto' }}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Generating...</span>
                </>
              ) : isSaving ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                  <span>Generate Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAIModal; 