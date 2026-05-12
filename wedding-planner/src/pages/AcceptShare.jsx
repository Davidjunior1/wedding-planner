import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AcceptShare() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { authFetch, user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?redirect=/shared/${token}`);
      return;
    }

    async function accept() {
      try {
        const r = await authFetch(`/api/share/accept/${token}`);
        if (!r.ok) {
          const data = await r.json();
          setErrorMsg(data.error || 'Link inválido ou expirado');
          setStatus('error');
          return;
        }
        const data = await r.json();
        setStatus('success');
        // Navigate to the project after a brief moment
        setTimeout(() => navigate(`/?project=${data.projectId}`), 1500);
      } catch {
        setErrorMsg('Erro ao acessar link de compartilhamento');
        setStatus('error');
      }
    }
    accept();
  }, [token, authLoading, user]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--rose-light), var(--champagne))',
      padding: 20
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: 40, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Loader size={40} style={{ color: 'var(--rose)', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px', display: 'block' }} />
            <p style={{ fontSize: 16, color: 'var(--gray)' }}>Aceitando convite...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Convite Aceito!</h2>
            <p style={{ color: 'var(--gray)', fontSize: 14 }}>Você agora tem acesso a este projeto. Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Erro</h2>
            <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Ir para o Dashboard</button>
          </>
        )}
      </div>
    </div>
  );
}
