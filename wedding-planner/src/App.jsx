import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home, Heart, Users, CheckSquare, DollarSign, Briefcase, Gift, Home as HomeIcon, Printer, LayoutDashboard, Menu, X, LogOut, User as UserIcon, Share2 } from 'lucide-react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Casamento from './pages/Casamento';
import Convidados from './pages/Convidados';
import Checklist from './pages/Checklist';
import Orcamento from './pages/Orcamento';
import Fornecedores from './pages/Fornecedores';
import Presentes from './pages/Presentes';
import Casa from './pages/Casa';
import Impressao from './pages/Impressao';
import GerenciarCasamentos from './pages/GerenciarCasamentos';
import AcceptShare from './pages/AcceptShare';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ShareDialog from './components/ShareDialog';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { state } = useApp();
  const { user, logout } = useAuth();
  const activeWedding = state.weddings.find(w => w.id === state.activeWeddingId);
  const [showShare, setShowShare] = useState(false);

  const nav = [
    { to: '/', icon: Home, label: 'Dashboard', end: true },
    { to: '/casamento', icon: Heart, label: 'Casamento' },
    { to: '/convidados', icon: Users, label: 'Convidados' },
    { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
    { to: '/orcamento', icon: DollarSign, label: 'Orçamento' },
    { to: '/fornecedores', icon: Briefcase, label: 'Fornecedores' },
    { to: '/presentes', icon: Gift, label: 'Presentes' },
    { to: '/casa', icon: HomeIcon, label: 'Casa' },
    { to: '/impressao', icon: Printer, label: 'Impressão' },
  ];

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar no-print ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Heart size={22} style={{ color: 'var(--rose)' }} fill="var(--rose)" />
            <span className="sidebar-logo-text">{activeWedding?.coupleName || 'Casamento'}</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-section">
            <NavLink to="/gerenciar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard className="nav-icon" size={18} />
              <span>Meus Casamentos</span>
              <span className="nav-count">{state.weddings.length}</span>
            </NavLink>
          </div>
        </nav>
        {user && (
          <button className="btn btn-outline sidebar-share-btn" onClick={() => setShowShare(true)}>
            <Share2 size={16} /> Compartilhar
          </button>
        )}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <button className="sidebar-logout" onClick={logout} title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
      {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
    </>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, background: 'var(--warm-white)',
      fontFamily: 'var(--font-elegant)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--rose-light)', borderTopColor: 'var(--rose)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 18, color: 'var(--rose-dark)', fontStyle: 'italic' }}>Carregando...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (state.loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-layout">
      <button className="mobile-menu-btn no-print" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
        <Menu size={22} />
      </button>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/casamento" element={<Casamento />} />
          <Route path="/convidados" element={<Convidados />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/presentes" element={<Presentes />} />
          <Route path="/casa" element={<Casa />} />
          <Route path="/impressao" element={<Impressao />} />
          <Route path="/gerenciar" element={<GerenciarCasamentos />} />
          <Route path="/shared/:token" element={<AcceptShare />} />
        </Routes>
        <footer className="app-footer">
          Feito com <span style={{ color: 'var(--rose)' }}>♥</span> por{' '}
          <strong style={{ color: 'var(--rose-dark)', fontWeight: 600 }}>David e Isadora</strong>
        </footer>
      </main>
    </div>
  );
}
