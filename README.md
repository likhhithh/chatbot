# Last Minute Revision Buddy 🎓

An AI-powered revision chatbot designed to help college students quickly revise topics and clarify doubts before exams.

## Features
- **5 Custom Study Modes**: Quick Revision, Friendly Explanation, 2-Minute Revision, Exam Questions, and Concept Simplification.
- **Upload Notes (RAG)**: Upload PDF study materials, and the AI will answer queries specifically based on your documents.
- **Beautiful UI**: Built with React, Vite, and modern glassmorphism UI.
- **Fast and Powerful**: Backend powered by FastAPI, FAISS vector embeddings, and the Groq Llama-3-70B API.

## Project Architecture

1. **Frontend**: React + Vite + Vanilla CSS
2. **Backend**: Python FastAPI
3. **AI Core**: LangChain + PyPDFLoader + FAISS + HuggingFace Embeddings + Groq Llama3

## Installation Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A Groq API Key

### 1. Backend Setup
Open a terminal and run the following:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder and add your Groq key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:
```bash
uvicorn main:app --reload
```
The FastAPI backend will now be running on `http://localhost:8000`

### 2. Frontend Setup
Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```
Access the web app at `http://localhost:5173`.

## How to Use
1. Open the web interface.
2. (Optional) Drag and drop a PDF on the Sidebar to provide custom context.
3. Select your desired Study Mode from the Sidebar.
4. Type your question or topic in the Chat Input and hit send!

## Deployment

**Backend (Render/Railway)**:
- Create a web service.
- Build command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add `GROQ_API_KEY` to environment variables.

**Frontend (Vercel/Netlify)**:
- Change `API_URL` in `frontend/src/api/client.js` to your deployed backend URL.
- Build command: `npm run build`
- Output directory: `dist`
