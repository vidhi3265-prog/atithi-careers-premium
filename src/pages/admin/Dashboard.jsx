import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { Download, LogOut, RefreshCw, Search, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('All');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('applications').select('*').in('work_status', ['citizen', 'pr']).order('created_at', { ascending: false });
    if (!error) setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => applications.filter((a) => {
    const matchesText = `${a.full_name} ${a.email} ${a.phone}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (position === 'All' || a.position === position);
  }), [applications, query, position]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (!error) setApplications((items) => items.map((a) => a.id === id ? { ...a, status } : a));
  };

  const openResume = async (path) => {
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(path, 60);
    if (error) return alert('Could not open resume.');
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const positions = ['All', ...new Set(applications.map((a) => a.position))];

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><span className="brand-mini">ATITHI</span><h1>Applications</h1><p>Citizens and Permanent Residents only</p></div>
        <button className="icon-button" onClick={() => supabase.auth.signOut()}><LogOut size={18} /> Logout</button>
      </header>

      <section className="admin-stats">
        <article><Users /><div><strong>{applications.length}</strong><span>Total qualified</span></div></article>
        <article><div><strong>{applications.filter((a) => a.status === 'New').length}</strong><span>New applications</span></div></article>
        <article><div><strong>{applications.filter((a) => a.status === 'Accepted').length}</strong><span>Accepted</span></div></article>
      </section>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <label className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or phone" /></label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}>{positions.map((p) => <option key={p}>{p}</option>)}</select>
          <button className="icon-button" onClick={load}><RefreshCw size={18} /> Refresh</button>
        </div>

        {loading ? <div className="empty-state">Loading applications…</div> : filtered.length === 0 ? <div className="empty-state">No applications found.</div> : (
          <div className="application-list">
            {filtered.map((app) => (
              <article className="candidate-card" key={app.id}>
                <div className="candidate-main">
                  <div className="avatar">{app.full_name?.charAt(0)}</div>
                  <div><h3>{app.full_name}</h3><p>{app.position} • {app.experience_years} year(s)</p><small>{app.email} • {app.phone} • {app.city}</small></div>
                </div>
                <div className="candidate-meta">
                  <span className="work-badge">{app.work_status === 'pr' ? 'Permanent Resident' : 'Canadian Citizen'}</span>
                  <StatusBadge value={app.status} />
                  <span className="date-text">{new Date(app.created_at).toLocaleDateString('en-CA')}</span>
                </div>
                {app.message && <p className="candidate-message">“{app.message}”</p>}
                <div className="candidate-actions">
                  <button onClick={() => openResume(app.resume_path)}><Download size={17} /> View Resume</button>
                  <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}>
                    <option>New</option><option>Reviewing</option><option>Accepted</option><option>Rejected</option>
                  </select>
                  <a href={`tel:${app.phone.replace(/\s/g, '')}`}>Call</a>
                  <a href={`mailto:${app.email}`}>Email</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
