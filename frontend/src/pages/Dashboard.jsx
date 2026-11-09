import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Wifi } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { connectWebSocket } from '../services/api';

export const Dashboard = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [currentStats, setCurrentStats] = useState({ pps: 0, bps: 0, status: 'NORMAL' });

  useEffect(() => {
    const socket = connectWebSocket((data) => {
      setCurrentStats({ pps: data.pps, bps: data.bps, status: data.status });
      setTelemetry((prev) => {
        const newData = [...prev, { time: new Date(data.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), pps: data.pps }];
        if (newData.length > 30) newData.shift();
        return newData;
      });
    });
    return () => socket.close();
  }, []);

  const isUnderAttack = currentStats.status === 'ALERT';

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Throughput" value={currentStats.pps.toLocaleString()} unit="PPS" icon={Activity} status={isUnderAttack ? 'danger' : 'normal'} />
        <StatCard title="Bandwidth" value={(currentStats.bps / 1024).toFixed(2)} unit="KB/s" icon={Wifi} status="normal" />
        <StatCard title="System Status" value={isUnderAttack ? 'UNDER ATTACK' : 'SECURE'} unit="" icon={ShieldAlert} status={isUnderAttack ? 'danger' : 'normal'} />
      </div>
      <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Real-Time Network Telemetry (PPS)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry}>
              <defs><linearGradient id="colorPps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="pps" stroke={isUnderAttack ? '#ef4444' : '#3b82f6'} strokeWidth={2} fillOpacity={1} fill="url(#colorPps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};