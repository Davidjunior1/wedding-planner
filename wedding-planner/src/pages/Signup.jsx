import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Senhas não conferem'); return; }
    if (form.password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--rose-light), var(--champagne))',
      padding: 20
    }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Heart size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Criar Conta</h1>
          <p style={{ color: 'var(--gray)', fontSize: 14 }}>Comece a planejar seu casamento</p>
        </div>

        {error && <div style={{ background: '#FDE8E8', color: '#C44A4A', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Nome</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Seu nome" required style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="seu@email.com" required style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input className="input" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" required style={{ paddingLeft: 36 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input className="input" type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} placeholder="Repita a senha" required style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: 12, fontSize: 15, marginTop: 4 }}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--rose-dark)', fontWeight: 500 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
