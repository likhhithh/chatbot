import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

const STORAGE_KEY = 'revisionBuddy_users';
const ACTIVE_USER_KEY = 'revisionBuddy_activeUser';

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });

  const [activeUser, setActiveUser] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (activeUser) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  }, [activeUser]);

  const AVATAR_COLORS = ['#5436da', '#10a37f', '#e05c2e', '#d4a017', '#b044b2', '#2e8ae0'];

  const signup = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return { error: 'Name cannot be empty.' };
    if (users.find(u => u.name.toLowerCase() === trimmed.toLowerCase())) {
      return { error: 'A user with this name already exists.' };
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name: trimmed,
      initials: trimmed.slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      createdAt: Date.now(),
    };
    setUsers(prev => [...prev, newUser]);
    setActiveUser(newUser);
    return { success: true };
  }, [users]);

  const login = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setActiveUser(user);
  }, [users]);

  const logout = useCallback(() => {
    setActiveUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ users, activeUser, signup, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
