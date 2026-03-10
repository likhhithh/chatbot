import React from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AuthScreen from './components/AuthScreen';
import './index.css';

function AppContent() {
  const { activeUser } = useUser();

  if (!activeUser) {
    return <AuthScreen />;
  }

  return (
    <ChatProvider>
      <div className="app-container">
        <Sidebar />
        <ChatInterface />
      </div>
    </ChatProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
