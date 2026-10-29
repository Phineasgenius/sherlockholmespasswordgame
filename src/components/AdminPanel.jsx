import { useState, useEffect, useCallback } from 'react';
import { getSubmissions, clearSubmissions, computeStats } from '../store';

export default function AdminPanel({ onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [sortBy, setSortBy]           = useState('score');
  const [clearing, setClearing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await getSubmissions();
    if (err) {
      setError('Failed to load submissions. Check your Supabase credentials.');
    } else {
      setSubmissions(data);
      setStats(computeStats(data));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClear = async () => {
    if (!window.confirm('Delete ALL submissions from the database? This cannot be undone.')) return;
    setClearing(true);
    const { error: err } = await clearSubmissions();
    if (err) {
      alert('Failed to clear: ' + err.message);
    } else {
      setSubmissions([]);
      setStats(null);
    }
    setClearing(false);
  };

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return '—';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  const sorted = [...submissions]
    .filter(s => s.username.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score')   return b.score - a.score;
      if (sortBy === 'pct')     return b.percent_score - a.percent_score;
      if (sortBy === 'recent')  return new Date(b.completed_at) - new Date(a.completed_at);
      return 0;
    });

  const exportCSV = () => {
    const headers = ['Rank', 'Username', 'Score', 'Max Score', '%', 'Rules Passed', 'Time', 'Submitted At'];
    const rows = sorted.map((s, i) => [
      i + 1,
      s.username,
      s.score,
      s.max_score,
      s.percent_score + '%',
      `${s.rules_passed}/${s.total_rules}`,
      formatTime(s.time_taken),
      formatDate(s.completed_at),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `sherlock_leaderboard_${Date.now()}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gradient">🛡️ Admin Dashboard</h1>
            <p className="text-xs text-[#94a3b8]">Sherlock Holmes Password Game · Live Leaderboard</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' }}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            <button onClick={exportCSV} className="btn-success text-sm py-2 px-3">
              📥 Export CSV
            </button>
            <button onClick={handleClear} disabled={clearing} className="btn-danger text-sm py-2 px-3">
              {clearing ? '⏳ Clearing...' : '🗑️ Clear All'}
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
            >
              ← Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 p-4 rounded-xl animate-float-in"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-[#ef4444] font-medium">⚠️ {error}</p>
            <p className="text-[#94a3b8] text-xs mt-1">
              Make sure <code className="text-[#a78bfa]">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-[#a78bfa]">VITE_SUPABASE_ANON_KEY</code> are set.
            </p>
          </div>
        )}

        {/* ── Stats Cards ── */}
        {stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-float-in">
            {[
              { label: 'Total Players',  value: stats.total,          color: '#a78bfa', icon: '👥' },
              { label: 'Average Score',  value: stats.averageScore,   color: '#3b82f6', icon: '📊' },
              { label: 'Top Score',      value: stats.topScore,       color: '#f59e0b', icon: '🏆' },
              { label: 'Perfect Runs',   value: stats.perfectPlayers, color: '#10b981', icon: '⭐' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#94a3b8] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-2 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-6 w-16 rounded mx-auto mb-1 animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 w-20 rounded mx-auto animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Search & Sort ── */}
        <div className="glass-card p-4 mb-4">
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="text"
              placeholder="🔍  Search by username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 min-w-48 bg-[rgba(10,10,15,0.9)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] outline-none"
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[rgba(10,10,15,0.9)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] outline-none cursor-pointer"
            >
              <option value="score">Highest Score</option>
              <option value="pct">% Complete</option>
              <option value="recent">Most Recent</option>
            </select>
            <span className="text-sm text-[#475569]">
              {sorted.length} player{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-[#94a3b8]">
              <div className="text-4xl mb-3 animate-pulse">⏳</div>
              <p>Loading leaderboard from Supabase...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 text-[#475569]">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">No submissions yet.</p>
              <p className="text-sm mt-1">Players will appear here once they submit scores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Rank', 'Username', 'Score', 'Completion', 'Rules', 'Time', 'Submitted'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((sub, i) => (
                    <tr
                      key={sub.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-[#475569]">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#e2e8f0]">{sub.username}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#a78bfa]">{sub.score}</span>
                        <span className="text-[#475569] text-xs"> /{sub.max_score}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${sub.percent_score}%`,
                                background: sub.percent_score >= 80 ? '#10b981' : sub.percent_score >= 50 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className={`badge ${sub.percent_score >= 80 ? 'badge-success' : sub.percent_score >= 50 ? 'badge-warning' : 'badge-error'}`}>
                            {sub.percent_score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#94a3b8]">{sub.rules_passed}/{sub.total_rules}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{formatTime(sub.time_taken)}</td>
                      <td className="px-4 py-3 text-[#475569] text-xs">{formatDate(sub.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
