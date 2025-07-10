import React, { useState } from 'react';
import { User } from '../types';

interface AuthHeaderProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  user,
  isAuthenticated,
  onLogin,
  onLogout
}) => {
  return (
    <div className="user-info">
      {isAuthenticated ? (
        <div className="user-controls">
          <span>Welcome, {user?.username}!</span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={onLogin} className="login-button">
          Login
        </button>
      )}
    </div>
  );
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  username: string;
  onUsernameChange: (username: string) => void;
  isLoggingIn: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  username,
  onUsernameChange,
  isLoggingIn
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Login to Contribute</h2>
          <button 
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>Please enter a username to start contributing to the world map.</p>
          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="Enter any username"
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={isLoggingIn || !username.trim()}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};