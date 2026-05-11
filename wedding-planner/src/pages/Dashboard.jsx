import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, CheckSquare, DollarSign, Briefcase, Gift, Home, Calendar, ArrowRight, Edit3, Save, X, LayoutDashboard, Camera } from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { project, guests, checklist, budget, vendors, gifts, houseItems } = state;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...project });
  const brideInput = useRef(null);
  const groomInput = useRef(null);

  const activeWedding = state.weddings.find(w => w.id === state.activeWeddingId);

  const stats = [
    { icon: Users, label: 'Convidados', value: guests.length, color: '#C97A7A', bg: '#FCE8E8', link: '/convidados' },
    { icon: CheckSquare, label: 'Checklist', value: `${checklist.filter(c => c.done).length}/${checklist.length}`, color: '#9AAF96', bg: '#E8F5E8', link: '/checklist' },
    { icon: DollarSign, label: 'Orçamento', value: budget.length > 0 ? `R$ ${budget.reduce((a,b) => a + b.spent, 0).toLocaleString('pt-BR')}` : 'R$ 0', color: '#C2A050', bg: '#FFF8DC', link: '/orcamento' },
    { icon: Briefcase, label: 'Fornecedores', value: vendors.filter(v => v.hired).length, color: '#C97A7A', bg: '#FCE8E8', link: '/fornecedores' },
    { icon: Gift, label: 'Presentes', value: gifts.length, color: '#9AAF96', bg: '#E8F5E8', link: '/presentes' },
    { icon: Home, label: 'Casa', value: `${houseItems.filter(h => h.status === 'bought').length}/${houseItems.length}`, color: '#C2A050', bg: '#FFF8DC', link: '/casa' },
  ];

  function handlePhoto(type, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (editing) {
        setForm(prev => ({ ...prev, [type === 'bride' ? 'bridePhoto' : 'groomPhoto']: dataUrl }));
      } else {
        dispatch({ type: 'UPDATE_PROJECT', payload: { [type === 'bride' ? 'bridePhoto' : 'groomPhoto']: dataUrl } });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProject(e) {
    e.preventDefault();
    dispatch({ type: 'UPDATE_PROJECT', payload: form });
    if (activeWedding) {
      dispatch({ type: 'UPDATE_WEDDING_META', payload: { id: state.activeWeddingId, data: form } });
    }
    setEditing(false);
  }

  const names = project.coupleName.split('&').map(s => s.trim());
  const brideName = names[0] || 'Noiva';
  const groomName = names[1] || 'Noivo';

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Olá, {brideName} & {groomName}!</h1>
          <p>Bem-vindos ao planejamento do {project.projectName}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => navigate('/gerenciar')} style={{ padding: '8px 16px' }}>
            <LayoutDashboard size={16} /> Casamentos
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/impressao')} style={{ padding: '8px 16px' }}>
            <PrinterIcon size={16} /> Imprimir
          </button>
        </div>
      </div>

      {/* Hero banner with photos */}
      <div style={{
        background: 'linear-gradient(135deg, var(--rose-light), var(--champagne))',
        borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 32,
      }}>
        {!editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Bride photo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid white', boxShadow: 'var(--shadow-md)',
                background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {project.bridePhoto ? (
                  <img src={project.bridePhoto} alt="Noiva" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Heart size={32} style={{ color: 'var(--rose)' }} fill="var(--rose-light)" />
                )}
              </div>
              <button className="btn" style={{ position: 'absolute', bottom: -4, right: -4, padding: 6, background: 'white', borderRadius: '50%', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-light)' }}
                onClick={() => brideInput.current?.click()}>
                <Camera size={14} />
              </button>
              <input ref={brideInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhoto('bride', e)} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 24 }}>{project.coupleName}</h2>
                <button className="btn" style={{ padding: '4px 8px' }} onClick={() => { setForm({ ...project }); setEditing(true); }}>
                  <Edit3 size={14} />
                </button>
              </div>
              <p style={{ color: 'var(--charcoal-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} />
                {project.eventDate ? new Date(project.eventDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data não definida'}
              </p>
              <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', color: 'var(--rose-dark)', marginTop: 8, fontSize: 18 }}>
                "{project.phrase}"
              </p>
            </div>

            {/* Groom photo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid white', boxShadow: 'var(--shadow-md)',
                background: 'var(--champagne-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {project.groomPhoto ? (
                  <img src={project.groomPhoto} alt="Noivo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Heart size={32} style={{ color: 'var(--gold)' }} fill="var(--gold-light)" />
                )}
              </div>
              <button className="btn" style={{ position: 'absolute', bottom: -4, right: -4, padding: 6, background: 'white', borderRadius: '50%', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-light)' }}
                onClick={() => groomInput.current?.click()}>
                <Camera size={14} />
              </button>
              <input ref={groomInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhoto('groom', e)} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Photo uploads */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid white', boxShadow: 'var(--shadow-md)', margin: '0 auto 8px',
                  background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }} onClick={() => brideInput.current?.click()}>
                  {form.bridePhoto ? (
                    <img src={form.bridePhoto} alt="Noiva" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={24} style={{ color: 'var(--gray)' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Foto da Noiva</span>
                <input ref={brideInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const r = new FileReader();
                  r.onload = (ev) => setForm(prev => ({ ...prev, bridePhoto: ev.target?.result }));
                  r.readAsDataURL(file);
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid white', boxShadow: 'var(--shadow-md)', margin: '0 auto 8px',
                  background: 'var(--champagne-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }} onClick={() => groomInput.current?.click()}>
                  {form.groomPhoto ? (
                    <img src={form.groomPhoto} alt="Noivo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={24} style={{ color: 'var(--gray)' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Foto do Noivo</span>
                <input ref={groomInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const r = new FileReader();
                  r.onload = (ev) => setForm(prev => ({ ...prev, groomPhoto: ev.target?.result }));
                  r.readAsDataURL(file);
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2, display: 'block' }}>Nome do Casal</label>
                <input className="input" value={form.coupleName} onChange={e => setForm({...form, coupleName: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2, display: 'block' }}>Nome do Projeto</label>
                <input className="input" value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2, display: 'block' }}>Data do Evento</label>
                <input className="input" type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2, display: 'block' }}>Frase</label>
                <input className="input" value={form.phrase} onChange={e => setForm({...form, phrase: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}><X size={14} /> Cancelar</button>
              <button type="submit" className="btn btn-success"><Save size={14} /> Salvar</button>
            </div>
          </form>
        )}
      </div>

      <div className="grid-3">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card" onClick={() => navigate(stat.link)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: stat.bg }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Próximas Tarefas</h3>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate('/checklist')}>
              Ver todas <ArrowRight size={14} />
            </button>
          </div>
          {checklist.filter(c => !c.done).slice(0, 5).map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-bg)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.priority === 'high' ? 'var(--danger)' : item.priority === 'medium' ? 'var(--warning)' : 'var(--sage)' }} />
              <span style={{ flex: 1, fontSize: 14 }}>{item.task}</span>
              <span className={`badge badge-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'sage'}`}>
                {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Orçamento Resumido</h3>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate('/orcamento')}>
              Ver detalhes <ArrowRight size={14} />
            </button>
          </div>
          {budget.slice(0, 4).map(b => {
            const pct = b.estimated > 0 ? Math.round((b.spent / b.estimated) * 100) : 0;
            return (
              <div key={b.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{b.category}</span>
                  <span>R$ {b.spent.toLocaleString('pt-BR')} / R$ {b.estimated.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ height: 6, background: 'var(--gray-bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--sage)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrinterIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
