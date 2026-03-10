import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, LogOut, User as UserIcon } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const { conversations, activeConversation, activeConversationId, newChat, selectConversation, deleteConversation, maxConversations } = useChat();
  const { activeUser, logout } = useUser();
  const [hoveredId, setHoveredId] = useState(null);

  const conversationCount = conversations.length;
  const atLimit = conversationCount >= maxConversations;

  return (
    <div className="sidebar">
      <button 
        className="new-chat-btn" 
        onClick={newChat} 
        title={atLimit ? `Oldest chat removed at ${maxConversations}` : 'New chat'}
      >
        <Plus size={18} />
        <span>New Chat</span>
        {atLimit && <span className="limit-badge">{conversationCount}/{maxConversations}</span>}
      </button>

      <div className="conversations-list">
        {[...conversations]
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
              onClick={() => selectConversation(conv.id)}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <MessageSquare size={16} className="conv-icon" />
              <div className="conv-text">
                <span className="conv-title">{conv.title}</span>
              </div>
              {hoveredId === conv.id && (
                <button
                  className="delete-conv-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar" style={{ background: activeUser?.color }}>
            {activeUser?.initials}
          </div>
          <span className="user-name">{activeUser?.name}</span>
          <button className="logout-btn" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
