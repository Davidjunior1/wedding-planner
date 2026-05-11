import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Users, Plus, Edit3, Trash2, Check, X } from 'lucide-react';

export default function Convidados() {
  const { state, dispatch } = useApp();
  const { guests } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Amigos', status: 'pending', phone: '' });

  function resetForm() { setForm({ name: '', category: 'Amigos', status: 'pending', phone: '' }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_GUEST', payload: { id: editing, ...form } });
    } else {
      dispatch({ type: 'ADD_GUEST', payload: form });
    }
    resetForm();
  }

  function startEdit(guest) {
    setForm({ name: guest.name, category: guest.category, status: guest.status, phone: guest.phone || '' });
    setEditing(guest.id);
    setShowForm(true);
  }

  const categories = [...new Set(guests.map(g => g.category))];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><Users size={24} style={{ color: 'var(--rose)', verticalAlign: 'middle', marginRight: 8 }} /> Convidados</h1>
          <p>{guests.length} convidados · {guests.filter(g => g.status === 'confirmed').length} confirmados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Novo Convidado
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 16 }}>
          <div className="stat-value" style={{ fontSize: 22 }}>{guests.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 16 }}>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--success)' }}>{guests.filter(g => g.status === 'confirmed').length}</div>
          <div className="stat-label">Confirmados</div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 16 }}>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--warning)' }}>{guests.filter(g => g.status === 'pending').length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 16 }}>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--danger)' }}>{guests.filter(g => g.status === 'declined').length}</div>
          <div className="stat-label">Recusados</div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Novo'} Convidado</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Nome</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome completo" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Categoria</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Família</option><option>Amigos</option><option>Trabalho</option><option>Outros</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="declined">Recusado</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Telefone</label>
                  <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(11) 99999-0000" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>Categoria</th><th>Status</th><th>Telefone</th><th style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <>
                  <tr key={cat} style={{ background: 'var(--champagne-light)' }}>
                    <td colSpan={5} style={{ fontWeight: 600, fontSize: 13, color: 'var(--rose-dark)', padding: '8px 16px' }}>{cat}</td>
                  </tr>
                  {guests.filter(g => g.category === cat).map(guest => (
                    <tr key={guest.id}>
                      <td style={{ fontWeight: 500 }}>{guest.name}</td>
                      <td><span className={`tag tag-${guest.category === 'Família' ? 'rose' : guest.category === 'Amigos' ? 'sage' : 'gold'}`}>{guest.category}</span></td>
                      <td>
                        <span className={`badge badge-${guest.status === 'confirmed' ? 'success' : guest.status === 'pending' ? 'warning' : 'danger'}`}>
                          {guest.status === 'confirmed' ? <Check size={12} /> : guest.status === 'declined' ? <X size={12} /> : null}
                          {guest.status === 'confirmed' ? 'Confirmado' : guest.status === 'pending' ? 'Pendente' : 'Recusado'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray)' }}>{guest.phone || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(guest)}><Edit3 size={14} /></button>
                          <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_GUEST', payload: guest.id })}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
