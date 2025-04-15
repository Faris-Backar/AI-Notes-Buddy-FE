# AI Notes App

A modern notes application with AI capabilities. Create, search, and manage your notes with AI assistance.

## Features

- Google authentication (OAuth 2.0)
- Note creation and management
- AI-assisted note writing using OpenAI's GPT-4o mini
- Quick AI note generation
- Modern, responsive UI

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root of the project and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## AI Features

### AI Writing Assistant

When creating a new note, toggle the "AI Assist" option to access AI capabilities:

- **Enhance Existing Content**: Write some initial content, then click "Generate with AI" to have the AI improve or expand your note.
- **Create from Prompt**: Enter a topic or prompt in the input field and click "Generate with AI" to have a complete note created for you.

### Quick AI Note

Click the floating AI button (blue star icon) at the bottom left to quickly generate a note on any topic:

1. Enter your topic or request
2. Click "Generate Note"
3. A complete note will be created and added to your list

## Environment Variables

- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## Technologies Used

- React
- Google OAuth 2.0
- OpenAI API
- Custom CSS for styling