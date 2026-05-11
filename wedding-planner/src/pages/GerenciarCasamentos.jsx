import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Edit3, ArrowRight, Check, Calendar } from 'lucide-react';

export default function GerenciarCasamentos() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', coupleName: '', projectName: '', eventDate: '', phrase: '' });

  function handleCreate(e) {
    e.preventDefault();
    const id = Date.now().toString();
    const wedding = {
      id,
      name: form.name || form.coupleName || 'Novo Casamento',
      coupleName: form.coupleName || 'Casal',
      projectName: form.projectName || 'Nosso Casamento',
      eventDate: form.eventDate || '',
      phrase: form.phrase || '',
    };
    dispatch({ type: 'CREATE_WEDDING', payload: wedding });
    dispatch({ type: 'SET_ACTIVE_WEDDING', payload: id });
    setShowForm(false);
    setForm({ name: '', coupleName: '', projectName: '', eventDate: '', phrase: '' });
    navigate('/');
  }

  function handleSelect(id) {
    dispatch({ type: 'SET_ACTIVE_WEDDING', payload: id });
    navigate('/');
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (state.weddings.length <= 1) {
      alert('Você precisa ter pelo menos um casamento.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este casamento?')) return;
    dispatch({ type: 'DELETE_WEDDING', payload: id });
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><Users size={24} style={{ color: 'var(--rose)', verticalAlign: 'middle', marginRight: 8 }} /> Gerenciar Casamentos</h1>
          <p>{state.weddings.length} casamento(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Novo Casamento
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>Novo Casamento</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Nome do Casal</label>
                  <input className="input" value={form.coupleName} onChange={e => setForm({...form, coupleName: e.target.value})} placeholder="Ex: João & Maria" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Nome do Projeto</label>
                  <input className="input" value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})} placeholder="Ex: Nosso Grande Dia" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Data do Evento</label>
                  <input className="input" type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Frase Personalizada</label>
                  <input className="input" value={form.phrase} onChange={e => setForm({...form, phrase: e.target.value})} placeholder="Ex: O amor nunca falha." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Casamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-2">
        {state.weddings.map(w => {
          const isActive = w.id === state.activeWeddingId;
          return (
            <div
              key={w.id}
              className="card"
              onClick={() => handleSelect(w.id)}
              style={{
                cursor: 'pointer',
                border: isActive ? '2px solid var(--rose)' : '1px solid rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--rose)', color: 'white',
                  padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                }}>
                  Ativo
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--rose-light), var(--champagne))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  💍
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0 }}>{w.coupleName}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray)', margin: 0 }}>{w.projectName}</p>
                </div>
              </div>
              {w.eventDate && (
                <p style={{ fontSize: 13, color: 'var(--rose-dark)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <Calendar size={14} />
                  {new Date(w.eventDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => handleSelect(w.id)}>
                  {isActive ? 'Acessar' : 'Selecionar'} <ArrowRight size={14} />
                </button>
                <button className="btn" style={{ padding: '6px 10px', color: 'var(--danger)', fontSize: 12 }} onClick={(e) => handleDelete(w.id, e)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
