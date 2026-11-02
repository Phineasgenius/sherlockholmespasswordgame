import { useState } from 'react';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4'];

function ConfettiParticle({ x, color, delay }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x + '%',
        top: '-10px',
        width: '8px',
        height: '8px',
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animation: `confettiFall ${1.5 + Math.random()}s ease-in ${delay}s forwards`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export default function SubmitModal({ username, score, maxScore, rulesPassed, totalRules, onSubmit, onClose }) {
  const [done, setSaving]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [dbError, setDbError]   = useState('');
  const [copiedString, setCopiedString] = useState(false);

  const isComplete = rulesPassed === totalRules;

  const particles = isComplete
    ? Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 2,
      }))
    : [];

  const pct = Math.round((score / maxScore) * 100);

  const grade =
    pct >= 95 ? '🏆 LEGENDARY' :
    pct >= 80 ? '🥇 EXCELLENT' :
    pct >= 60 ? '🥈 GREAT'     :
    pct >= 40 ? '🥉 GOOD'      : '💪 KEEP TRYING';

  const handleConfirm = async () => {
    setSaving(true);
    setDbError('');
    const result = await onSubmit(username);
    setSaving(false);
    if (result?.error) {
      setDbError('Could not save score: ' + (result.error.message || 'Unknown error. Check Supabase config.'));
    } else {
      setSaved(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}

      <div className="glass-card p-8 w-full max-w-md text-center animate-float-in max-h-[90vh] overflow-y-auto">
        <div className="text-6xl mb-4">
          {isComplete ? '🏆' : pct >= 70 ? '🎯' : '🧩'}
        </div>
        <h2 className="text-3xl font-bold text-gradient mb-1">
          {saved ? 'Score Saved!' : isComplete ? 'Game Completed!' : 'Checkpoint Submission'}
        </h2>
        <p className="font-semibold mb-4" style={{ color: isComplete ? '#10b981' : '#f59e0b' }}>
          {grade}
        </p>

        {/* Player chip */}
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p className="text-xs text-[#94a3b8]">Player</p>
          <p className="text-lg font-bold text-[#a78bfa]">{username}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: `Score / ${maxScore}`, value: score,                         color: '#a78bfa' },
            { label: 'Completion',           value: pct + '%',                    color: '#10b981' },
            { label: 'Rules Passed',         value: `${rulesPassed}/${totalRules}`, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl" style={{ background: `${s.color}18`, border: `1px solid ${s.color}33` }}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#94a3b8]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Complete vs Incomplete flag status */}
        {isComplete ? (
          <div className="p-4 rounded-xl border border-[#a78bfa]/40 bg-[#7c3aed]/15 mb-5 text-center">
            <p className="text-xs font-semibold text-[#c4b5fd] mb-2 uppercase tracking-wide">
              This is your string to be pasted on the main site
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold tracking-wider px-3 py-1.5 bg-black/60 border border-[#a78bfa]/50 rounded-lg text-[#10b981] select-all">
                suinegsaenihp
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('suinegsaenihp');
                  setCopiedString(true);
                  setTimeout(() => setCopiedString(false), 2000);
                }}
                className="btn-primary py-1.5 px-2.5 text-xs"
              >
                {copiedString ? 'Copied! ✅' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🔒</span>
              <p className="text-sm font-bold text-amber-300">
                Secret Flag Locked
              </p>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              The secret string to be pasted on the main site will <span className="text-amber-200 font-semibold">only be unlocked when all {totalRules} rules are completed</span>.
            </p>
            <p className="text-xs text-[#94a3b8] mt-2">
              Current progress: <span className="text-amber-300 font-medium">{rulesPassed} of {totalRules} rules</span> conquered ({totalRules - rulesPassed} remaining).
            </p>
          </div>
        )}

        {/* Error */}
        {dbError && (
          <div className="mb-4 p-3 rounded-xl text-left" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-[#ef4444] text-sm">⚠️ {dbError}</p>
          </div>
        )}

        {!saved ? (
          <>
            <p className="text-sm text-[#94a3b8] mb-4">
              {isComplete
                ? `Save your final victory score to the leaderboard as ${username}?`
                : `Save your intermediate score (${score} pts) to the leaderboard as ${username}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={done}
                className="btn-primary flex-1"
              >
                {done ? '⏳ Saving...' : 'Save to Leaderboard 🏅'}
              </button>
              <button onClick={onClose} className="btn-danger px-4">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-[#10b981] font-semibold">✅ Saved to the leaderboard!</p>
            </div>
            <button onClick={onClose} className="btn-primary w-full">Close</button>
          </>
        )}
      </div>
    </div>
  );
}
