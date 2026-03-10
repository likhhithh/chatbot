import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const AuthScreen = () => {
  const { users, signup, login } = useUser();
  const [tab, setTab] = useState(users.length > 0 ? 'login' : 'signup');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    const result = signup(name);
    if (result.error) setError(result.error);
  };

  const handleLogin = (userId) => {
    login(userId);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🎓</span>
          <h1 className="auth-title">Revision Buddy</h1>
          <p className="auth-subtitle">Your AI-powered exam preparation partner</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
            disabled={users.length === 0}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <label className="auth-label">Your Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. Arjun, Priya, Alex…"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoFocus
              maxLength={40}
            />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit-btn" type="submit" disabled={!name.trim()}>
              Get Started →
            </button>
            {users.length > 0 && (
              <p className="auth-switch-text">
                Already have an account?{' '}
                <button type="button" className="auth-link" onClick={() => setTab('login')}>
                  Sign in
                </button>
              </p>
            )}
          </form>
        )}

        {tab === 'login' && (
          <div className="auth-user-list">
            {users.length === 0 ? (
              <p className="auth-empty">No accounts yet. Create one to get started!</p>
            ) : (
              <>
                <p className="auth-label">Choose your account</p>
                {users.map(user => (
                  <button
                    key={user.id}
                    className="auth-user-btn"
                    onClick={() => handleLogin(user.id)}
                  >
                    <div className="auth-user-avatar" style={{ background: user.color }}>
                      {user.initials}
                    </div>
                    <div className="auth-user-info">
                      <span className="auth-user-name">{user.name}</span>
                      <span className="auth-user-meta">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className="auth-arrow">→</span>
                  </button>
                ))}
                <p className="auth-switch-text" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  New here?{' '}
                  <button type="button" className="auth-link" onClick={() => { setTab('signup'); setError(''); }}>
                    Create account
                  </button>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
