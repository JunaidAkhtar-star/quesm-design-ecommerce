import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('quesm_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('quesm_admin_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const activityTimeoutRef = useRef(null);

  // Inactivity timeout: 30 minutes
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

  const resetInactivityTimer = () => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (admin) {
      activityTimeoutRef.current = setTimeout(() => {
        logout('Session expired due to inactivity. Please log in again.');
      }, INACTIVITY_LIMIT_MS);
    }
  };

  useEffect(() => {
    const handleUserActivity = () => resetInactivityTimer();

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, [admin]);

  // Check auth status on load
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdmin(data.admin);
          localStorage.setItem('quesm_admin', JSON.stringify(data.admin));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Auth check error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, totpCode) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode })
      });

      const data = await res.json();

      if (data.requires2FA) {
        return { success: false, requires2FA: true, message: data.message };
      }

      if (data.success && data.token) {
        setToken(data.token);
        setAdmin(data.admin);
        localStorage.setItem('quesm_admin_token', data.token);
        localStorage.setItem('quesm_admin', JSON.stringify(data.admin));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error. Try again.' };
    }
  };

  const logout = async (alertMsg) => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // ignore
    } finally {
      setAdmin(null);
      setToken(null);
      localStorage.removeItem('quesm_admin');
      localStorage.removeItem('quesm_admin_token');
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (alertMsg) {
        alert(alertMsg);
      }
    }
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
