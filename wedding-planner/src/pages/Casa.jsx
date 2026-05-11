import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Home, Plus, Edit3, Trash2, Check } from 'lucide-react';

export default function Casa() {
  const { state, dispatch } = useApp();
  const { houseItems } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ item: '', category: 'Sala', status: 'pending', priority: 'medium' });

  function resetForm() { setForm({ item: '', category: 'Sala', status: 'pending', priority: 'medium' }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.item.trim()) return;
    const payload = { item: form.item, category: form.category, status: form.status, priority: form.priority };
    if (editing) {
      dispatch({ type: 'UPDATE_HOUSE_ITEM', payload: { id: editing, ...payload } });
    } else {
      dispatch({ type: 'ADD_HOUSE_ITEM', payload });
    }
    resetForm();
  }

  function startEdit(h) {
    setForm({ item: h.item, category: h.category, status: h.status, priority: h.priority });
    setEditing(h.id);
    setShowForm(true);
  }

  const categories = [...new Set(houseItems.map(h => h.category))];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><Home size={24} style={{ color: 'var(--sage)', verticalAlign: 'middle', marginRight: 8 }} /> Itens para Casa</h1>
          <p>{houseItems.length} itens · {houseItems.filter(h => h.status === 'bought').length} comprados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Novo Item
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Novo'} Item</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Item</label>
                  <input className="input" value={form.item} onChange={e => setForm({...form, item: e.target.value})} placeholder="Nome do item" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Cômodo</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Sala</option><option>Sala de Jantar</option><option>Cozinha</option><option>Quarto</option><option>Banheiro</option><option>Escritório</option><option>Área Externa</option><option>Outros</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendente</option><option value="bought">Comprado</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Prioridade</label>
                  <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
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

      {categories.map(cat => {
        const items = houseItems.filter(h => h.category === cat);
        return (
          <div key={cat} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'var(--sage-light)', borderBottom: '1px solid var(--gray-bg)', fontWeight: 600, fontSize: 14, color: '#6B8F67' }}>
              {cat} <span style={{ fontWeight: 400, color: 'var(--gray)', fontSize: 12 }}>({items.filter(h => h.status === 'bought').length}/{items.length})</span>
            </div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--gray-bg)' }}>
                <button
                  onClick={() => dispatch({ type: 'UPDATE_HOUSE_ITEM', payload: { id: item.id, status: item.status === 'bought' ? 'pending' : 'bought' } })}
                  style={{
                    width: 22, height: 22, borderRadius: 4, border: `2px solid ${item.status === 'bought' ? 'var(--success)' : 'var(--gray-light)'}`,
                    background: item.status === 'bought' ? 'var(--success)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  {item.status === 'bought' && <Check size={14} color="white" />}
                </button>
                <span style={{ flex: 1, fontSize: 14, textDecoration: item.status === 'bought' ? 'line-through' : 'none', color: item.status === 'bought' ? 'var(--gray)' : 'var(--charcoal)' }}>
                  {item.item}
                </span>
                <span className={`badge badge-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'sage'}`}>
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
                <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(item)}><Edit3 size={14} /></button>
                <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_HOUSE_ITEM', payload: item.id })}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
