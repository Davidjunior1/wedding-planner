import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, Trash2, Plus, Share2, Link } from 'lucide-react';

export default function ShareDialog({ onClose }) {
  const { authFetch } = useAuth();
  const { state } = useApp();
  const [links, setLinks] = useState([]);
  const [permission, setPermission] = useState('view');
  const [copiedId, setCopiedId] = useState(null);
  const [creating, setCreating] = useState(false);

  const projectId = state.activeWeddingId;

  useEffect(() => {
    if (!projectId) return;
    authFetch(`/api/share/links/${projectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(links => setLinks(links || []))
      .catch(() => {});
  }, [projectId, authFetch]);

  async function createLink() {
    if (!projectId) return;
    setCreating(true);
    try {
      const r = await authFetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, permission }),
      });
      const data = await r.json();
      if (r.ok) {
        setLinks(prev => [...prev, { id: Date.now().toString(), token: data.token, permission }]);
      }
    } catch {}
    setCreating(false);
  }

  async function deleteLink(id) {
    try {
      await authFetch(`/api/share/links/${id}`, { method: 'DELETE' });
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch {}
  }

  function copyLink(token, id) {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function permissionLabel(perm) {
    if (perm === 'view') return 'Visualizar';
    if (perm === 'comment') return 'Comentar';
    return 'Editar';
  }

  function permissionBadge(perm) {
    if (perm === 'view') return 'badge-sage';
    if (perm === 'comment') return 'badge-gold';
    return 'badge-rose';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header-row">
          <h2 style={{ margin: 0, fontSize: 22 }}>
            <Share2 size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Compartilhar
          </h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--gray)', marginBottom: 16 }}>
          Compartilhe este projeto com outras pessoas. Quem receber o link precisará criar uma conta.
        </p>

        <div className="share-create-row">
          <select
            className="input"
            value={permission}
            onChange={e => setPermission(e.target.value)}
          >
            <option value="view">Apenas visualizar</option>
            <option value="comment">Comentar</option>
            <option value="edit">Editar</option>
          </select>
          <button className="btn btn-primary" onClick={createLink} disabled={creating}>
            <Plus size={16} /> {creating ? 'Criando...' : 'Criar Link'}
          </button>
        </div>

        {links.length === 0 ? (
          <div className="share-empty">
            <Link size={32} style={{ color: 'var(--gray-light)', marginBottom: 8 }} />
            <p style={{ color: 'var(--gray-light)', fontSize: 14 }}>Nenhum link de compartilhamento criado ainda.</p>
          </div>
        ) : (
          <div className="share-links-list">
            {links.map(link => (
              <div key={link.id} className="share-link-row">
                <div className="share-link-url">
                  <Link size={14} style={{ color: 'var(--gray)', flexShrink: 0 }} />
                  <span className="share-link-text">{window.location.origin}/shared/{link.token}</span>
                </div>
                <span className={`badge ${permissionBadge(link.permission)}`}>
                  {permissionLabel(link.permission)}
                </span>
                <button className="share-action-btn" onClick={() => copyLink(link.token, link.id)} title="Copiar link">
                  {copiedId === link.id ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                </button>
                <button className="share-action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteLink(link.id)} title="Excluir link">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
