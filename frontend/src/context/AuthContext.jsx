import React, { createContext, useState, useContext } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('sentinel_token'));
  const login = (newToken) => { localStorage.setItem('sentinel_token', newToken); setToken(newToken); };
  const logout = () => { localStorage.removeItem('sentinel_token'); setToken(null); };
  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);