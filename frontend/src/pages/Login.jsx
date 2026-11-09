import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username); formData.append('password', password);
      const res = await axios.post('http://127.0.0.1:8000/api/auth/login', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
      login(res.data.access_token); navigate('/');
    } catch (err) { setError('Invalid credentials. Access Denied.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soc-bg">
      <div className="bg-soc-panel p-8 rounded-xl border border-soc-border shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8"><Shield className="text-soc-accent mb-4" size={48} /><h1 className="text-2xl font-bold tracking-widest">SENTINEL-X</h1></div>
        {error && <div className="bg-red-900/30 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/50">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-sm text-soc-muted mb-1">Username</label>
            <div className="relative"><User className="absolute left-3 top-2.5 text-soc-muted" size={18} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-soc-bg border border-soc-border rounded p-2 pl-10 text-soc-text focus:border-soc-accent" placeholder="admin" required /></div></div>
          <div><label className="block text-sm text-soc-muted mb-1">Password</label>
            <div className="relative"><Lock className="absolute left-3 top-2.5 text-soc-muted" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-soc-bg border border-soc-border rounded p-2 pl-10 text-soc-text focus:border-soc-accent" placeholder="••••••••" required /></div></div>
          <button type="submit" className="w-full bg-soc-accent hover:bg-blue-600 text-white font-bold py-2 rounded mt-6">Authenticate</button>
        </form>
      </div>
    </div>
  );
};