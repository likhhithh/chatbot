import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const ChatContext = createContext(null);

const MAX_CONVERSATIONS = 15;

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createConversation = (mode = 'friendly') => ({
  id: generateId(),
  title: 'New Chat',
  mode,
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const ChatProvider = ({ children }) => {
  const { activeUser } = useUser();
  const storageKey = activeUser ? `revisionBuddy_chats_${activeUser.id}` : null;

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Load conversations when user changes
  useEffect(() => {
    if (!storageKey) {
      setConversations([]);
      setActiveConversationId(null);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (stored.length > 0) {
        setConversations(stored);
        setActiveConversationId(stored.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
      } else {
        const initial = createConversation();
        setConversations([initial]);
        setActiveConversationId(initial.id);
      }
    } catch {
      const initial = createConversation();
      setConversations([initial]);
      setActiveConversationId(initial.id);
    }
  }, [storageKey]);

  // Persist conversations when they change
  useEffect(() => {
    if (storageKey && conversations.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    }
  }, [conversations, storageKey]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const newChat = useCallback(() => {
    const newConv = createConversation(activeConversation?.mode || 'friendly');
    setConversations(prev => {
      if (prev.length >= MAX_CONVERSATIONS) {
        // Replace oldest
        const sorted = [...prev].sort((a, b) => a.updatedAt - b.updatedAt);
        return [...prev.filter(c => c.id !== sorted[0].id), newConv];
      }
      return [...prev, newConv];
    });
    setActiveConversationId(newConv.id);
  }, [activeConversation]);

  const selectConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        const fresh = createConversation();
        setActiveConversationId(fresh.id);
        return [fresh];
      }
      if (activeConversationId === id) {
        setActiveConversationId(updated.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
      }
      return updated;
    });
  }, [activeConversationId]);

  const setMode = useCallback((mode) => {
    if (!activeConversation) return;
    setConversations(prev =>
      prev.map(c => c.id === activeConversation.id ? { ...c, mode } : c)
    );
  }, [activeConversation]);

  const addMessage = useCallback((convId, message) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const isFirst = c.messages.length === 0 && message.role === 'user';
        const title = isFirst
          ? (message.content.length > 42 ? message.content.slice(0, 42) + '…' : message.content)
          : c.title;
        return { ...c, messages: [...c.messages, message], title, updatedAt: Date.now() };
      })
    );
  }, []);

  const replaceLastMessage = useCallback((convId, message) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        msgs[msgs.length - 1] = message;
        return { ...c, messages: msgs, updatedAt: Date.now() };
      })
    );
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      activeConversationId,
      maxConversations: MAX_CONVERSATIONS,
      newChat,
      selectConversation,
      deleteConversation,
      setMode,
      addMessage,
      replaceLastMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
