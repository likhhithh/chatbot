import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Plus, ChevronDown, Check, FileText, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { sendChatMessage, uploadPDF } from '../api/client';

const MODES = [
  { id: 'quick', label: 'Quick Revision', icon: '⚡' },
  { id: 'friendly', label: 'Friendly Explanation', icon: '🤝' },
  { id: '2min', label: '2-Minute Revision', icon: '⏱️' },
  { id: 'exam', label: 'Exam Questions', icon: '📝' },
  { id: 'simplify', label: 'Simplify Concept', icon: '🧩' },
];

const ChatInterface = () => {
  const { activeConversation, addMessage, replaceLastMessage, setMode } = useChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowModeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      await uploadPDF(file);
      setAttachedFile(file.name);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isTyping || !activeConversation) return;

    const userMessage = input.trim();
    setInput('');
    setAttachedFile(null);

    const msgId = Date.now();
    addMessage(activeConversation.id, {
      role: 'user',
      content: userMessage,
      timestamp: msgId
    });

    setIsTyping(true);

    try {
      const history = activeConversation.messages.map(m => ({
        role: m.role === 'user' ? 'human' : 'ai',
        content: m.content
      }));

      const response = await sendChatMessage(userMessage, activeConversation.mode, history);
      
      addMessage(activeConversation.id, {
        role: 'bot',
        content: response.response,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(activeConversation.id, {
        role: 'bot',
        content: '⚠️ Connection error. Please ensure the backend is running.',
        timestamp: Date.now(),
        isError: true
      });
    } finally {
      setIsTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMode = MODES.find(m => m.id === activeConversation?.mode) || MODES[1];

  return (
    <div className="chat-container">
      {/* Header with Mode Dropdown */}
      <div className="chat-header">
        <div className="mode-selector-wrapper" ref={dropdownRef}>
          <button 
            className="mode-dropdown-btn" 
            onClick={() => setShowModeDropdown(!showModeDropdown)}
          >
            <span className="mode-icon-small">{currentMode.icon}</span>
            <span className="mode-label-active">{currentMode.label}</span>
            <ChevronDown size={14} className={`chevron ${showModeDropdown ? 'open' : ''}`} />
          </button>
          
          {showModeDropdown && (
            <div className="mode-dropdown-menu">
              {MODES.map(mode => (
                <button 
                  key={mode.id} 
                  className={`mode-option ${activeConversation?.mode === mode.id ? 'selected' : ''}`}
                  onClick={() => {
                    setMode(mode.id);
                    setShowModeDropdown(false);
                  }}
                >
                  <span className="mode-icon-menu">{mode.icon}</span>
                  <span className="mode-text-menu">{mode.label}</span>
                  {activeConversation?.mode === mode.id && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {activeConversation?.messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>Last Minute Revision Buddy</h3>
            <p>Ready for your exams? Choose a mode and start revising!</p>
          </div>
        )}

        {activeConversation?.messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role} ${msg.isError ? 'error-message' : ''}`}>
            <div className="message-content-inner">
              <div className="avatar">
                {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
              </div>
              <div className="message-bubble">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.timestamp && (
                  <span className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message-content-inner">
              <div className="avatar"><Bot size={16} color="white" /></div>
              <div className="message-bubble typing-indicator">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with + button */}
      <div className="input-area">
        <div className="input-outer-container">
          {attachedFile && (
            <div className="attached-file-pill">
              <FileText size={14} />
              <span>{attachedFile}</span>
              <button onClick={() => setAttachedFile(null)}><X size={12} /></button>
            </div>
          )}
          <div className="input-container">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              style={{ display: 'none' }} 
            />
            <button 
              className="attach-btn" 
              onClick={handleFileClick}
              disabled={isUploading}
              title="Upload PDF Notes"
            >
              {isUploading ? (
                <div className="spinner-small" />
              ) : (
                <Plus size={20} />
              )}
            </button>
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="input-hint">Shift + Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatInterface;
