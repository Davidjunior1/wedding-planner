import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { DollarSign, Plus, Edit3, Trash2 } from 'lucide-react';

export default function Orcamento() {
  const { state, dispatch } = useApp();
  const { budget } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', estimated: '', spent: '' });

  const totalEstimated = budget.reduce((a, b) => a + b.estimated, 0);
  const totalSpent = budget.reduce((a, b) => a + b.spent, 0);
  const progress = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;

  function resetForm() { setForm({ category: '', estimated: '', spent: '' }); setEditing(null); setShowForm(false); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.category.trim()) return;
    const payload = { category: form.category, estimated: Number(form.estimated) || 0, spent: Number(form.spent) || 0 };
    if (editing) {
      dispatch({ type: 'UPDATE_BUDGET', payload: { id: editing, ...payload } });
    } else {
      dispatch({ type: 'ADD_BUDGET', payload });
    }
    resetForm();
  }

  function startEdit(item) {
    setForm({ category: item.category, estimated: String(item.estimated), spent: String(item.spent) });
    setEditing(item.id);
    setShowForm(true);
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1><DollarSign size={24} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: 8 }} /> Orçamento</h1>
          <p>R$ {totalSpent.toLocaleString('pt-BR')} gastos de R$ {totalEstimated.toLocaleString('pt-BR')} estimados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
          <span>Orçamento total</span>
          <span style={{ fontWeight: 600 }}>{progress}% utilizado</span>
        </div>
        <div style={{ height: 10, background: 'var(--gray-bg)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: progress > 90 ? 'var(--danger)' : progress > 70 ? 'var(--warning)' : 'var(--sage)', borderRadius: 5, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editing ? 'Editar' : 'Nova'} Categoria</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Categoria</label>
                  <input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Ex: Buffet, Decoração" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Valor Estimado (R$)</label>
                  <input className="input" type="number" value={form.estimated} onChange={e => setForm({...form, estimated: e.target.value})} placeholder="10000" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>Valor Gasto (R$)</label>
                  <input className="input" type="number" value={form.spent} onChange={e => setForm({...form, spent: e.target.value})} placeholder="5000" />
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
                <th>Categoria</th><th>Estimado</th><th>Gasto</th><th>Restante</th><th>Progresso</th><th style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {budget.map(item => {
                const remaining = item.estimated - item.spent;
                const pct = item.estimated > 0 ? Math.round((item.spent / item.estimated) * 100) : 0;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.category}</td>
                    <td>R$ {item.estimated.toLocaleString('pt-BR')}</td>
                    <td>R$ {item.spent.toLocaleString('pt-BR')}</td>
                    <td style={{ color: remaining < 0 ? 'var(--danger)' : remaining === 0 ? 'var(--gray)' : 'var(--success)', fontWeight: 500 }}>
                      R$ {remaining.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ width: 150 }}>
                      <div style={{ height: 6, background: 'var(--gray-bg)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--sage)', borderRadius: 3 }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn" style={{ padding: '4px 8px' }} onClick={() => startEdit(item)}><Edit3 size={14} /></button>
                        <button className="btn" style={{ padding: '4px 8px', color: 'var(--danger)' }} onClick={() => dispatch({ type: 'DELETE_BUDGET', payload: item.id })}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
