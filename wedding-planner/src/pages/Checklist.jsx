import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { CheckSquare, Plus, Edit3, Trash2, Check } from 'lucide-react';

export default function Checklist() {
  const { state, dispatch } = useApp();
  const { checklist } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ task: '', category: 'Geral', priority: 'medium' });
  const [filter, setFilter] = useState('all');

  function resetForm() { setForm({ task: '', category: 'Geral', priority: 'medium' }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.task.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_CHECKLIST', payload: { id: editing, ...form } });
    } else {
      dispatch({ type: 'ADD_CHECKLIST', payload: form });
    }
    resetForm();
  }

  function startEdit(item) {
    setForm({ task: item.task, category: item.category, priority: item.priority });
    setEditing(item.id);
    setShowForm(true);
  }

  const filtered = filter === 'all' ? checklist : filter === 'done' ? checklist.filter(c => c.done) : checklist.filter(c => !c.done);
  const categories = [...new Set(checklist.map(c => c.category))];
  const progress = checklist.length > 0 ? Math.round((checklist.filter(c => c.done).length / checklist.length) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><CheckSquare size={24} style={{ color: 'var(--sage)', verticalAlign: 'middle', marginRight: 8 }} /> Checklist</h1>
          <p>{checklist.filter(c => c.done).length} de {checklist.length} tarefas concluídas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <span>Progresso geral</span>
          <span style={{ fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--gray-bg)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--rose), var(--sage))', borderRadius: 4, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'done', label: 'Concluídas' },
        ].map(f => (
          <button key={f.key} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Nova'} Tarefa</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Tarefa</label>
                  <input className="input" value={form.task} onChange={e => setForm({...form, task: e.target.value})} placeholder="Descreva a tarefa" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Categoria</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Geral</option><option>Cerimônia</option><option>Festa</option><option>Noiva</option><option>Noivo</option><option>Convidados</option><option>Viagem</option><option>Decoração</option>
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
        const items = filtered.filter(c => c.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', background: 'var(--champagne-light)', borderBottom: '1px solid var(--gray-bg)', fontWeight: 600, fontSize: 14, color: 'var(--rose-dark)' }}>
              {cat} <span style={{ fontWeight: 400, color: 'var(--gray)', fontSize: 12 }}>({items.filter(c => c.done).length}/{items.length})</span>
            </div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--gray-bg)' }}>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CHECKLIST', payload: item.id })}
                  style={{
                    width: 22, height: 22, borderRadius: 4, border: `2px solid ${item.done ? 'var(--success)' : 'var(--gray-light)'}`,
                    background: item.done ? 'var(--success)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  {item.done && <Check size={14} color="white" />}
                </button>
                <span style={{ flex: 1, fontSize: 14, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--gray)' : 'var(--charcoal)' }}>
                  {item.task}
                </span>
                <span className={`badge badge-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'sage'}`}>
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
                <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(item)}><Edit3 size={14} /></button>
                <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_CHECKLIST', payload: item.id })}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
