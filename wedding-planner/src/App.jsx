import { Routes, Route, NavLink } from 'react-router-dom';
import { Home, Heart, Users, CheckSquare, DollarSign, Briefcase, Gift, Home as HomeIcon, Printer, LayoutDashboard, Menu, X } from 'lucide-react';
import { useApp } from './context/AppContext';
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

function Sidebar() {
  const { state } = useApp();
  const activeWedding = state.weddings.find(w => w.id === state.activeWeddingId);

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
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <Heart size={22} style={{ color: 'var(--rose)' }} fill="var(--rose)" />
          {activeWedding?.coupleName || 'Casamento'}
        </div>
        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--gray-bg)', paddingTop: 8 }}>
            <NavLink to="/gerenciar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <LayoutDashboard className="nav-icon" size={18} />
              <span>Meus Casamentos</span>
              <span className="nav-count">{state.weddings.length}</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default function App() {
  const { state } = useApp();

  if (state.loading) {
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

  return (
    <div className="app-layout">
      <Sidebar />
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
        </Routes>
        <footer style={{
          textAlign: 'center',
          padding: '32px 0 16px',
          borderTop: '1px solid var(--gray-bg)',
          marginTop: 48,
          fontFamily: 'var(--font-elegant)',
          fontSize: 15,
          color: 'var(--gray)',
          letterSpacing: '0.5px',
        }}>
          Feito com <span style={{ color: 'var(--rose)' }}>♥</span> por{' '}
          <strong style={{ color: 'var(--rose-dark)', fontWeight: 600 }}>David e Isadora</strong>
        </footer>
      </main>
    </div>
  );
}
