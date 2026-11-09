import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Activity, FileText, LogOut } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { MitigationCenter } from './pages/MitigationCenter';
import { IncidentHistory } from './pages/IncidentHistory';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navItems = [{ path: '/', name: 'SOC Dashboard', icon: LayoutDashboard }, { path: '/mitigation', name: 'Mitigation Center', icon: Shield }, { path: '/history', name: 'Incident Reports', icon: FileText }];
  return (
    <div className="w-64 bg-soc-panel border-r border-soc-border h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-soc-border"><Activity className="text-soc-accent" size={28} /><h1 className="text-xl font-bold tracking-wider">SENTINEL<span className="text-soc-accent">-X</span></h1></div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-soc-accent/10 text-soc-accent border border-soc-accent/20' : 'text-soc-muted hover:bg-soc-bg hover:text-soc-text'}`}>
            <item.icon size={20} /><span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-soc-border"><button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-soc-danger hover:bg-soc-danger/10 rounded-lg"><LogOut size={20} /> Logout</button></div>
    </div>
  );
};

const ProtectedLayout = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-soc-bg">
      <Sidebar />
      <div className="ml-64 flex-1">
        <header className="h-16 border-b border-soc-border bg-soc-panel/50 backdrop-blur flex items-center px-6 sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Security Operations Center</h2>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mitigation" element={<MitigationCenter />} />
            <Route path="/history" element={<IncidentHistory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;