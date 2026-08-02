import React from 'react';
import { useState } from 'react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) return setError('Invalid owner email or password.');
    navigate('/admin');
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={login}>
        <div className="login-lock"><LockKeyhole size={28} /></div>
        <span className="section-kicker">PRIVATE AREA</span>
        <h1>Owner login</h1>
        <p>Review qualified applications and resumes.</p>
        {error && <div className="form-error">{error}</div>}
        <label className="field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="btn btn-dark" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Signing in…</> : 'Login'}</button>
      </form>
    </main>
  );
}
