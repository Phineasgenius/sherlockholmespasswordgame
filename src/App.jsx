import { useState, useEffect, useRef } from 'react';
import { evaluateAll, RULES, getMaxScore, CATEGORY_META } from './rules';
import { addSubmission } from './store';
import LandingPage from './components/LandingPage';
import RuleCard from './components/RuleCard';
import SubmitModal from './components/SubmitModal';
import AdminPanel from './components/AdminPanel';
import './index.css';

const MAX_SCORE = getMaxScore();
const TOTAL_RULES = RULES.length;

// Progressive unlock: next group unlocks when previous failing rules are beaten
function getActiveRules(results) {
  let active = 5;
  for (let i = 0; i < results.length; i++) {
    if (i < active && results[i].passing) {
      if (i >= active - 3) active = Math.min(i + 4, TOTAL_RULES);
    }
  }
  return Math.max(5, active);
}

function CategoryTab({ id, active, onClick }) {
  const meta = id === 'all'
    ? { label: 'All', color: '#a78bfa', icon: '📋' }
    : CATEGORY_META[id];
  if (!meta) return null;
  return (
    <button
      onClick={() => onClick(id)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
      style={{
        background: active ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? meta.color + '55' : 'rgba(255,255,255,0.06)'}`,
        color: active ? meta.color : '#94a3b8',
      }}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </button>
  );
}

export default function App() {
  // ── Routing state ────────────────────────────────────────
  // 'landing' | 'game' | 'admin'
  const [view, setView] = useState('landing');
  const [participantName, setParticipantName] = useState('');

  // ── Game state ───────────────────────────────────────────
  const [password, setPassword] = useState('');
  const [results, setResults] = useState(() => evaluateAll(''));
  const [activeRules, setActiveRules] = useState(5);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [prevActiveRules, setPrevActiveRules] = useState(5);
  const [gameWon, setGameWon] = useState(false);
  const [minuteTick, setMinuteTick] = useState(new Date().getMinutes());
  const [submitted, setSubmitted] = useState(false);

  // Tick every second for dynamic rules
  useEffect(() => {
    const id = setInterval(() => setMinuteTick(new Date().getMinutes()), 1000);
    return () => clearInterval(id);
  }, []);

  // Re-evaluate on password / tick change
  useEffect(() => {
    if (view !== 'game') return;
    const evaluated = evaluateAll(password);
    const newActive = getActiveRules(evaluated);
    const newScore = evaluated.filter(r => r.passing).reduce((acc, r) => acc + r.reward, 0);
    if (newActive > prevActiveRules) setPrevActiveRules(newActive);
    setResults(evaluated);
    setActiveRules(newActive);
    setScore(newScore);
    if (evaluated.every(r => r.passing) && !gameWon) setGameWon(true);
  }, [password, minuteTick, view]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (!gameStarted && val.length > 0) setGameStarted(true);
  };

  const handleSubmit = async (username) => {
    const rulesPassed = results.filter(r => r.passing).length;
    const { error } = await addSubmission({
      username,
      score,
      maxScore: MAX_SCORE,
      rulesPassed,
      totalRules: TOTAL_RULES,
      timeTaken: Date.now() - startTime,
    });
    if (!error) setSubmitted(true);
    return { error };
  };

  const passingCount = results.filter(r => r.passing).length;
  const pct = (score / MAX_SCORE) * 100;
  const categories = ['all', ...Object.keys(CATEGORY_META)];

  const visibleResults = results.filter(r =>
    categoryFilter === 'all' || r.category === categoryFilter
  );

  const getStrengthColor = () => {
    if (pct === 0) return '#475569';
    if (pct < 30) return '#ef4444';
    if (pct < 60) return '#f59e0b';
    if (pct < 90) return '#3b82f6';
    return '#10b981';
  };

  const strengthLabel = () => {
    if (pct === 0) return '';
    if (pct < 20) return 'Weak';
    if (pct < 40) return 'Getting There';
    if (pct < 60) return 'Decent';
    if (pct < 80) return 'Strong';
    if (pct < 100) return 'Very Strong';
    return '🏆 PERFECT!';
  };

  // ── VIEWS ────────────────────────────────────────────────

  if (view === 'landing') {
    return (
      <LandingPage
        onParticipant={(name) => {
          setParticipantName(name);
          setView('game');
        }}
        onAdmin={() => setView('admin')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        onClose={() => setView('landing')}
        onLogout={() => setView('landing')}
      />
    );
  }

  // ── GAME VIEW ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gradient">🔐 Sherlock Holmes Password Game</h1>
            <p className="text-xs text-[#94a3b8]">
              Playing as <span className="text-[#a78bfa] font-semibold">{participantName}</span>
              {' '}· 35 rules · {MAX_SCORE} pts max
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold" style={{ color: getStrengthColor() }}>
                {score} / {MAX_SCORE} pts
              </div>
              <div className="text-xs text-[#94a3b8]">{passingCount}/{TOTAL_RULES} rules</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome / Hero */}
        {!gameStarted && (
          <div className="text-center mb-8 animate-float-in">
            <div className="text-6xl mb-3">🕵️</div>
            <h2 className="text-3xl font-black text-gradient mb-2">Welcome, {participantName}!</h2>
            <p className="text-[#94a3b8] text-base max-w-md mx-auto">
              Craft a password that satisfies all 35 progressively unlocking rules.
              Rules span math, encoding, chemistry, programming, ciphers, and more.
            </p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {Object.values(CATEGORY_META).map(m => (
                <span key={m.label} className="badge badge-purple">{m.icon} {m.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Password Input */}
        <div className="glass-card p-5 mb-5 animate-glow-pulse">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">
            Your password:
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Start crafting your legendary password..."
              className="password-input pr-16"
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
            <button
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors text-lg cursor-pointer"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#94a3b8]">{password.length} chars</span>
              {strengthLabel() && (
                <span className={`badge ${pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-error'}`}>
                  {strengthLabel()}
                </span>
              )}
            </div>
            {passingCount > 0 && !submitted && (
              <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2 px-4">
                {gameWon ? '🏆 Submit Winner!' : '📤 Submit Score'}
              </button>
            )}
            {submitted && (
              <span className="badge badge-success">✅ Score saved!</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="progress-bar mt-3">
            <div
              className="progress-fill"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${getStrengthColor()}, #7c3aed)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#475569] mt-1">
            <span>0</span>
            <span className="text-[#94a3b8] font-medium">{Math.round(pct)}% complete</span>
            <span>{MAX_SCORE}</span>
          </div>
        </div>

        {/* Stats mini-bar */}
        {gameStarted && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="badge badge-success">✅ {passingCount} passing</span>
            <span className="badge badge-error">❌ {activeRules - passingCount} failing</span>
            <span className="badge badge-info">🔒 {TOTAL_RULES - activeRules} locked</span>
            <span className="badge badge-warning ml-auto">
              ⏰ {String(new Date().getMinutes()).padStart(2,'0')}:{String(new Date().getSeconds()).padStart(2,'0')}
            </span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <CategoryTab
              key={cat}
              id={cat}
              active={categoryFilter === cat}
              onClick={setCategoryFilter}
            />
          ))}
        </div>

        {/* Rules List */}
        <div>
          {visibleResults.map((rule) => {
            const globalIndex = results.findIndex(r => r.id === rule.id);
            return (
              <RuleCard
                key={rule.id}
                rule={rule}
                index={globalIndex}
                activeRules={activeRules}
                animateIn={globalIndex >= prevActiveRules - 3}
              />
            );
          })}
        </div>

        {/* Win Banner */}
        {gameWon && (
          <div
            className="glass-card p-6 mt-4 text-center animate-float-in"
            style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.06)' }}
          >
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-bold text-[#10b981] mb-2">LEGENDARY! You did it, {participantName}!</h3>
            <p className="text-[#94a3b8]">All 35 rules satisfied. You are truly the greatest detective.</p>
            {!submitted && (
              <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
                🎉 Claim Your Victory!
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-10 py-5 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-xs text-[#2d2d3a]">
            Sherlock Holmes Password Game · Extreme Edition · {TOTAL_RULES} rules · {MAX_SCORE} pts
          </p>
        </footer>
      </main>

      {/* Submit Modal */}
      {showModal && (
        <SubmitModal
          username={participantName}
          score={score}
          maxScore={MAX_SCORE}
          rulesPassed={passingCount}
          totalRules={TOTAL_RULES}
          timeTaken={Date.now() - startTime}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
