// OpenAI API service

// You'll need to add your API key to environment variables in a real app
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Common function to handle OpenAI API requests
const callOpenAI = async (messages) => {
  if (!API_KEY || API_KEY === 'your-openai-api-key-here') {
    console.warn('OpenAI API key is missing. Using mock data instead.');
    // Return mock data instead of throwing an error
    return generateMockResponse(messages);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API error:', errorData);
      // Use mock data instead of throwing error
      console.warn('Using mock data due to API error');
      return generateMockResponse(messages);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Use mock data instead of throwing error
    console.warn('Using mock data due to error:', error.message);
    return generateMockResponse(messages);
  }
};

// Generate mock responses for when the API can't be accessed
function generateMockResponse(messages) {
  const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
  
  if (userMessage.includes('Create a detailed note about')) {
    // Mock response for note generation
    return JSON.stringify({
      title: "Mock Note Title",
      content: "This is a mock note content generated because the OpenAI API key is missing or invalid. In a real application, this would be AI-generated content based on your prompt."
    });
  } else if (userMessage.includes('enhance the following note')) {
    // Mock response for note enhancement
    return "This is enhanced mock content. The original content would be improved by the AI if a valid API key was provided.";
  } else {
    // Generic mock response
    return "This is a mock response because the OpenAI API key is missing or invalid.";
  }
}

/**
 * Get AI-generated text completion
 * @param {string} prompt - The user's message
 * @param {string} context - Optional context or instructions
 * @returns {Promise<string>} - The AI response
 */
export const getAICompletion = async (prompt) => {
  console.log('Requesting AI completion for:', prompt);
  
  const messages = [
    { role: 'system', content: 'You are a helpful assistant that helps users enhance their notes with more details and better structure.' },
    { role: 'user', content: `Please enhance the following note: ${prompt}` }
  ];

  const result = await callOpenAI(messages);
  console.log('AI completion result:', result);
  return result;
};

/**
 * Get AI suggestions for a given note content
 * @param {string} noteContent - The current note content
 * @returns {Promise<string>} - Improved or extended note content
 */
export const getNoteSuggestion = async (noteContent) => {
  const prompt = `I'm writing a note about: "${noteContent}". Can you help me improve or extend this?`;
  return getAICompletion(prompt, 'Focus on improving the clarity and completeness of the note.');
};

/**
 * Generate a note based on a topic
 * @param {string} topic - The topic to write about
 * @returns {Promise<{title: string, content: string}>} - Generated note with title and content
 */
export const generateNoteFromTopic = async (topic) => {
  console.log('Generating note from topic:', topic);
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant that creates detailed notes based on topics. Return JSON format with title and content keys.'
    },
    { 
      role: 'user', 
      content: `Create a detailed note about: ${topic}. Format your response as JSON with "title" and "content" fields.` 
    }
  ];

  const result = await callOpenAI(messages);
  console.log('Generated note result:', result);
  
  try {
    // Check if result is already an object
    if (typeof result === 'object' && result !== null) {
      return result;
    }
    
    // Handle string response - try to parse it as JSON
    // First, try to extract the JSON if it's wrapped in markdown or code blocks
    let jsonString = result;
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }
    
    // Now parse the JSON
    const parsedResult = JSON.parse(jsonString);
    if (parsedResult.title && parsedResult.content) {
      return parsedResult;
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    console.log('Raw response:', result);
    
    // Return the raw result as is - let the modal component handle the formatting
    return {
      title: topic,
      content: result
    };
  }
}; 