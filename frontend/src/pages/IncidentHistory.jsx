import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const IncidentHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    api.get('/api/alerts', { headers: { Authorization: `Bearer ${token}` }}).then(res => setAlerts(res.data)).catch(console.error);
  }, [token]);

  const handleExport = async () => {
    try {
      const res = await api.get('/api/reports/export-alerts', { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'sentinel_x_incidents.csv'); link.click();
    } catch (err) { console.error("Export failed"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-soc-accent" /> Incident Reports</h2>
        <button onClick={handleExport} className="flex items-center gap-2 bg-soc-accent/10 border border-soc-accent/50 text-soc-accent px-4 py-2 rounded hover:bg-soc-accent/20"><Download size={18} /> Export CSV</button>
      </div>
      <div className="bg-soc-panel border border-soc-border rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead><tr className="bg-soc-bg/50 border-b border-soc-border text-soc-muted text-sm uppercase tracking-wider"><th className="p-4">ID</th><th className="p-4">Timestamp</th><th className="p-4">Type</th><th className="p-4">Severity</th><th className="p-4">Source</th><th className="p-4">Status</th></tr></thead>
          <tbody className="divide-y divide-soc-border">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-soc-bg/30">
                <td className="p-4 font-mono text-soc-muted">#{alert.id}</td><td className="p-4 text-sm">{new Date(alert.timestamp).toLocaleString()}</td>
                <td className="p-4 font-medium">{alert.alert_type}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{alert.severity}</span></td>
                <td className="p-4 font-mono text-sm">{alert.source_ip}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${alert.status === 'MITIGATED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{alert.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};