import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Gift, Plus, Edit3, Trash2, Check } from 'lucide-react';

export default function Presentes() {
  const { state, dispatch } = useApp();
  const { gifts } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ item: '', store: '', price: '', status: 'pending' });

  function resetForm() { setForm({ item: '', store: '', price: '', status: 'pending' }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.item.trim()) return;
    const payload = { item: form.item, store: form.store, price: Number(form.price) || 0, status: form.status };
    if (editing) {
      dispatch({ type: 'UPDATE_GIFT', payload: { id: editing, ...payload } });
    } else {
      dispatch({ type: 'ADD_GIFT', payload });
    }
    resetForm();
  }

  function startEdit(g) {
    setForm({ item: g.item, store: g.store, price: String(g.price), status: g.status });
    setEditing(g.id);
    setShowForm(true);
  }

  const totalPrice = gifts.reduce((a, b) => a + b.price, 0);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><Gift size={24} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: 8 }} /> Presentes</h1>
          <p>{gifts.length} presentes · R$ {totalPrice.toLocaleString('pt-BR')} em valor</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Novo Presente
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Novo'} Presente</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Item</label>
                  <input className="input" value={form.item} onChange={e => setForm({...form, item: e.target.value})} placeholder="Nome do presente" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Loja</label>
                  <input className="input" value={form.store} onChange={e => setForm({...form, store: e.target.value})} placeholder="Onde comprar" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Preço (R$)</label>
                  <input className="input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="299" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendente</option><option value="bought">Comprado</option>
                  </select>
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
                <th>Item</th><th>Loja</th><th>Preço</th><th>Status</th><th style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500 }}>{g.item}</td>
                  <td style={{ color: 'var(--gray)' }}>{g.store || '—'}</td>
                  <td>R$ {g.price.toLocaleString('pt-BR')}</td>
                  <td>
                    <span className={`badge badge-${g.status === 'bought' ? 'success' : 'warning'}`}>
                      {g.status === 'bought' ? <Check size={12} /> : null}
                      {g.status === 'bought' ? 'Comprado' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(g)}><Edit3 size={14} /></button>
                      <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_GIFT', payload: g.id })}><Trash2 size={14} /></button>
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
