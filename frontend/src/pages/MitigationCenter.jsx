import React, { useState } from 'react';
import { ShieldAlert, RotateCcw, Ban } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MitigationCenter = () => {
  const [ipToBlock, setIpToBlock] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  const handleEmergencyRollback = async () => {
    if (!window.confirm("CRITICAL: Remove ALL active firewall blocks?")) return;
    try {
      const res = await api.post('/api/mitigation/emergency-rollback', {}, { headers: { Authorization: `Bearer ${token}` }});
      setMessage(`SUCCESS: ${res.data.message}`);
    } catch (error) { setMessage('ERROR: Failed.'); }
  };

  const handleManualBlock = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/mitigation/manual-block', { ip_address: ipToBlock }, { headers: { Authorization: `Bearer ${token}` }});
      setMessage(`SUCCESS: ${res.data.message}`); setIpToBlock('');
    } catch (error) { setMessage(error.response?.data?.detail || 'ERROR'); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6"><ShieldAlert className="text-soc-danger" size={28} /><h2 className="text-2xl font-bold">Mitigation Control</h2></div>
        {message && <div className={`p-4 mb-6 rounded-lg border ${message.includes('ERROR') ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-green-900/30 border-green-500 text-green-200'}`}>{message}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-soc-border rounded-lg p-5 bg-soc-bg/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Ban size={20} className="text-soc-warning" /> Manual Block</h3>
            <form onSubmit={handleManualBlock} className="space-y-4">
              <input type="text" value={ipToBlock} onChange={(e) => setIpToBlock(e.target.value)} placeholder="IP Address (e.g., 192.168.1.50)" className="w-full bg-soc-panel border border-soc-border rounded p-2 text-soc-text font-mono" required />
              <button type="submit" className="w-full bg-soc-warning/20 text-soc-warning border border-soc-warning/50 rounded p-2 font-semibold hover:bg-soc-warning/30">Apply Temporary Block</button>
            </form>
          </div>
          <div className="border border-soc-border rounded-lg p-5 bg-soc-bg/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><RotateCcw size={20} className="text-soc-danger" /> Emergency Rollback</h3>
            <button onClick={handleEmergencyRollback} className="w-full bg-soc-danger/20 text-soc-danger border border-soc-danger/50 rounded p-2 font-semibold hover:bg-soc-danger/30 flex items-center justify-center gap-2"><ShieldAlert size={18} /> Flush All Rules</button>
          </div>
        </div>
      </div>
    </div>
  );
};