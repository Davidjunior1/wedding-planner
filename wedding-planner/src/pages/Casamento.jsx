import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Heart, Music, Church, PartyPopper, Palette, UtensilsCrossed, Edit3, Save } from 'lucide-react';

export default function Casamento() {
  const { state, dispatch } = useApp();
  const { weddingPlanner } = state;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const sections = [
    { key: 'ceremony', icon: Church, label: 'Cerimônia', fields: [
      { key: 'church', label: 'Igreja' }, { key: 'time', label: 'Horário' }, { key: 'priest', label: 'Celebrante' }, { key: 'notes', label: 'Observações', type: 'textarea' }
    ]},
    { key: 'party', icon: PartyPopper, label: 'Festa', fields: [
      { key: 'venue', label: 'Local' }, { key: 'time', label: 'Horário' }, { key: 'guests', label: 'Convidados', type: 'number' }, { key: 'theme', label: 'Tema' }
    ]},
    { key: 'decoration', icon: Palette, label: 'Decoração', fields: [
      { key: 'colors', label: 'Cores' }, { key: 'style', label: 'Estilo' }, { key: 'flowers', label: 'Flores' }
    ]},
    { key: 'music', icon: Music, label: 'Música', fields: [
      { key: 'band', label: 'Banda' }, { key: 'dj', label: 'DJ' }, { key: 'songs', label: 'Músicas' }
    ]},
    { key: 'food', icon: UtensilsCrossed, label: 'Gastronomia', fields: [
      { key: 'starter', label: 'Entrada' }, { key: 'main', label: 'Prato Principal' }, { key: 'dessert', label: 'Sobremesa' }, { key: 'cake', label: 'Bolo' }
    ]},
  ];

  function startEdit(sectionKey) {
    setEditing(sectionKey);
    setForm({ ...weddingPlanner[sectionKey] });
  }

  function saveEdit() {
    dispatch({ type: 'UPDATE_WEDDING_PLANNER', payload: { [editing]: form } });
    setEditing(null);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><Heart size={24} style={{ color: 'var(--rose)', verticalAlign: 'middle', marginRight: 8 }} fill="var(--rose)" /> Planejamento do Casamento</h1>
        <p>Organize todos os detalhes da cerimônia e festa</p>
      </div>

      <div className="grid-2">
        {sections.map(section => {
          const Icon = section.icon;
          const data = weddingPlanner[section.key];
          const isEditing = editing === section.key;

          return (
            <div key={section.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color="var(--rose-dark)" />
                  </div>
                  <h3>{section.label}</h3>
                </div>
                {!isEditing ? (
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => startEdit(section.key)}>
                    <Edit3 size={14} /> Editar
                  </button>
                ) : (
                  <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12 }} onClick={saveEdit}>
                    <Save size={14} /> Salvar
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.fields.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 4, display: 'block' }}>{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea className="input" rows={3} value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})} />
                      ) : f.type === 'number' ? (
                        <input className="input" type="number" value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: Number(e.target.value)})} />
                      ) : (
                        <input className="input" value={Array.isArray(form[f.key]) ? form[f.key].join(', ') : form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.fields.map(f => {
                    const val = data[f.key];
                    const display = Array.isArray(val) ? val.join(', ') : val || '—';
                    return (
                      <div key={f.key} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                        <span style={{ color: 'var(--gray)', minWidth: 100 }}>{f.label}:</span>
                        <span style={{ color: 'var(--charcoal)' }}>{display}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
