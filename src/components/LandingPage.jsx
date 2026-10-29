import { useState } from 'react';
import { verifyAdminCredentials } from '../auth';

export default function LandingPage({ onParticipant, onAdmin }) {
  const [mode, setMode] = useState(null); // null | 'participant' | 'admin'
  const [username, setUsername] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleParticipantStart = () => {
    const name = username.trim();
    if (!name) { setError('Please enter a username.'); return; }
    if (name.length < 2) { setError('Username must be at least 2 characters.'); return; }
    if (name.length > 30) { setError('Username must be 30 characters or less.'); return; }
    onParticipant(name);
  };

  const handleAdminLogin = async () => {
    if (!adminUser.trim() || !adminPass.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    // Small deliberate delay to deter brute-forcing
    await new Promise(r => setTimeout(r, 600));
    const ok = await verifyAdminCredentials(adminUser.trim(), adminPass);
    setLoading(false);
    if (ok) {
      onAdmin();
    } else {
      setError('Invalid credentials. Access denied.');
      setAdminPass('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-float-in">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🔐</div>
          <h1 className="text-4xl font-black text-gradient mb-2">
            Sherlock Holmes
          </h1>
          <h2 className="text-2xl font-bold text-[#e2e8f0] mb-3">Password Game</h2>
          <p className="text-[#94a3b8] text-base max-w-sm mx-auto">
            35 diabolically hard rules. Only the most technical minds will crack them all.
          </p>
        </div>

        {/* Mode selector */}
        {!mode && (
          <div className="glass-card p-6">
            <p className="text-center text-sm text-[#94a3b8] mb-5 font-medium uppercase tracking-wider">
              Select your role
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setMode('participant'); setError(''); }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '2px solid rgba(59,130,246,0.25)',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'}
              >
                <span className="text-4xl">🎮</span>
                <div className="text-center">
                  <div className="font-bold text-[#e2e8f0] text-lg">Participant</div>
                  <div className="text-xs text-[#94a3b8] mt-1">Play the game</div>
                </div>
              </button>

              <button
                onClick={() => { setMode('admin'); setError(''); }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '2px solid rgba(124,58,237,0.25)',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'}
              >
                <span className="text-4xl">🛡️</span>
                <div className="text-center">
                  <div className="font-bold text-[#e2e8f0] text-lg">Admin</div>
                  <div className="text-xs text-[#94a3b8] mt-1">View leaderboard</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Participant Form */}
        {mode === 'participant' && (
          <div className="glass-card p-6 animate-float-in">
            <button
              onClick={() => { setMode(null); setError(''); setUsername(''); }}
              className="text-[#94a3b8] hover:text-[#e2e8f0] text-sm mb-4 cursor-pointer transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            <div className="text-center mb-5">
              <span className="text-4xl">🎮</span>
              <h3 className="text-xl font-bold text-[#e2e8f0] mt-2">Join as Participant</h3>
              <p className="text-sm text-[#94a3b8] mt-1">Your name will appear on the leaderboard</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Your Name / Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. SherlockFan42"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleParticipantStart()}
                maxLength={30}
                className="w-full bg-[rgba(10,10,15,0.9)] border border-[rgba(59,130,246,0.4)] rounded-xl px-4 py-3 text-[#e2e8f0] text-base outline-none transition-all"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
                autoFocus
              />
              <div className="flex justify-between mt-1">
                {error && <p className="text-[#ef4444] text-xs">{error}</p>}
                <p className="text-[#475569] text-xs ml-auto">{username.length}/30</p>
              </div>
            </div>

            <button
              onClick={handleParticipantStart}
              disabled={!username.trim()}
              className="btn-primary w-full"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              Start Playing 🕵️
            </button>
          </div>
        )}

        {/* Admin Form */}
        {mode === 'admin' && (
          <div className="glass-card p-6 animate-float-in">
            <button
              onClick={() => { setMode(null); setError(''); setAdminUser(''); setAdminPass(''); }}
              className="text-[#94a3b8] hover:text-[#e2e8f0] text-sm mb-4 cursor-pointer transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            <div className="text-center mb-5">
              <span className="text-4xl">🛡️</span>
              <h3 className="text-xl font-bold text-[#e2e8f0] mt-2">Admin Access</h3>
              <p className="text-sm text-[#94a3b8] mt-1">Restricted to authorized personnel only</p>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Username</label>
              <input
                type="text"
                placeholder="Admin username"
                value={adminUser}
                onChange={e => { setAdminUser(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && !loading && handleAdminLogin()}
                className="w-full bg-[rgba(10,10,15,0.9)] border border-[rgba(124,58,237,0.4)] rounded-xl px-4 py-3 text-[#e2e8f0] text-base outline-none transition-all"
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  placeholder="Admin password"
                  value={adminPass}
                  onChange={e => { setAdminPass(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleAdminLogin()}
                  className="w-full bg-[rgba(10,10,15,0.9)] border border-[rgba(124,58,237,0.4)] rounded-xl px-4 py-3 pr-12 text-[#e2e8f0] text-base outline-none transition-all"
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#e2e8f0] cursor-pointer"
                >
                  {showAdminPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[#ef4444] text-sm">🚫 {error}</p>
              </div>
            )}

            <button
              onClick={handleAdminLogin}
              disabled={loading || !adminUser.trim() || !adminPass.trim()}
              className="btn-primary w-full"
            >
              {loading ? '⏳ Verifying...' : 'Login →'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#2d2d3a] mt-6">
          Sherlock Holmes Password Game · Extreme Edition
        </p>
      </div>
    </div>
  );
}
