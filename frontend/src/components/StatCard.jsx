import React from 'react';
export const StatCard = ({ title, value, unit, icon: Icon, status }) => {
  const getStatusColor = () => {
    if (status === 'danger') return 'text-soc-danger border-soc-danger/30 bg-soc-danger/10 ring-1 ring-soc-danger/50';
    return 'text-soc-accent border-soc-accent/30 bg-soc-accent/10';
  };
  return (
    <div className={`bg-soc-panel border border-soc-border rounded-lg p-5 shadow-lg flex items-center justify-between ${status === 'danger' ? 'ring-1 ring-soc-danger/50' : ''}`}>
      <div>
        <p className="text-soc-muted text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-mono tracking-tight">{value}</h3>
          <span className="text-xs text-soc-muted">{unit}</span>
        </div>
      </div>
      <div className={`p-3 rounded-full border ${getStatusColor()}`}><Icon size={24} /></div>
    </div>
  );
};