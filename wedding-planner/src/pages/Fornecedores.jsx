import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Check } from 'lucide-react';

export default function Fornecedores() {
  const { state, dispatch } = useApp();
  const { vendors } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', service: '', contact: '', budget: '', hired: false });

  function resetForm() { setForm({ name: '', service: '', contact: '', budget: '', hired: false }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { name: form.name, service: form.service, contact: form.contact, budget: Number(form.budget) || 0, hired: form.hired };
    if (editing) {
      dispatch({ type: 'UPDATE_VENDOR', payload: { id: editing, ...payload } });
    } else {
      dispatch({ type: 'ADD_VENDOR', payload });
    }
    resetForm();
  }

  function startEdit(v) {
    setForm({ name: v.name, service: v.service, contact: v.contact, budget: String(v.budget), hired: v.hired });
    setEditing(v.id);
    setShowForm(true);
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><Briefcase size={24} style={{ color: 'var(--rose)', verticalAlign: 'middle', marginRight: 8 }} /> Fornecedores</h1>
          <p>{vendors.filter(v => v.hired).length} contratados de {vendors.length} fornecedores</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Novo Fornecedor
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Novo'} Fornecedor</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Nome</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome do fornecedor" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Serviço</label>
                  <input className="input" value={form.service} onChange={e => setForm({...form, service: e.target.value})} placeholder="Ex: Buffet, Fotografia" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Contato</label>
                  <input className="input" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Nome e telefone" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Orçamento (R$)</label>
                  <input className="input" type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="5000" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.hired} onChange={e => setForm({...form, hired: e.target.checked})} style={{ accentColor: 'var(--rose)' }} />
                  Já contratado
                </label>
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
                <th>Fornecedor</th><th>Serviço</th><th>Contato</th><th>Orçamento</th><th>Status</th><th style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td><span className="tag tag-rose">{v.service}</span></td>
                  <td style={{ color: 'var(--gray)' }}>{v.contact}</td>
                  <td>R$ {v.budget.toLocaleString('pt-BR')}</td>
                  <td>
                    <span className={`badge badge-${v.hired ? 'success' : 'warning'}`}>
                      {v.hired ? <Check size={12} /> : null}
                      {v.hired ? 'Contratado' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(v)}><Edit3 size={14} /></button>
                      <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_VENDOR', payload: v.id })}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
