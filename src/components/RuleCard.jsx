import { useState } from 'react';
import { CATEGORY_META } from '../rules';

const statusIcon = (passing, index, activeRules) => {
  if (index >= activeRules) return '🔒';
  if (passing) return '✅';
  return '❌';
};

export default function RuleCard({ rule, index, activeRules, animateIn }) {
  const [showHint, setShowHint] = useState(false);
  const isLocked = index >= activeRules;
  const isPassing = rule.passing;
  const catMeta = CATEGORY_META[rule.category] || { label: rule.category, color: '#94a3b8', icon: '❓' };

  let cardClass = 'rule-card';
  if (isLocked) cardClass += ' locked';
  else if (isPassing) cardClass += ' passing';
  else cardClass += ' failing';

  if (animateIn) cardClass += ' animate-float-in';

  return (
    <div className={cardClass} style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Rule number */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: isLocked ? 'rgba(255,255,255,0.05)' : isPassing ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isLocked ? '#475569' : isPassing ? '#10b981' : '#ef4444',
              border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : isPassing ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {isLocked ? '🔒' : isPassing ? '✓' : rule.id}
          </div>

          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: catMeta.color }}>
                {catMeta.icon} {catMeta.label}
              </span>
              <span className="badge badge-purple text-xs">+{rule.reward}pts</span>
              {rule.timerBased && !isLocked && (
                <span className="badge badge-error text-xs timer-ring">⏰ Time-Limited</span>
              )}
              {rule.isDynamic && !isLocked && !rule.timerBased && (
                <span className="badge badge-warning text-xs">📅 Dynamic</span>
              )}
            </div>

            {/* Description */}
            <p className={`text-sm leading-relaxed ${isLocked ? 'text-[#475569]' : 'text-[#cbd5e1]'}`}>
              {isLocked ? `Rule ${rule.id} — Unlock by passing previous rules` : rule.descriptionText}
            </p>

            {/* Hint section */}
            {!isLocked && !isPassing && (
              <div className="mt-2">
                {showHint ? (
                  <div className="mt-2 p-3 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]">
                    <p className="text-xs text-[#f59e0b]">💡 {rule.hintText}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-[#6d28d9] hover:text-[#a78bfa] transition-colors cursor-pointer underline decoration-dotted"
                  >
                    Show hint
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0 text-xl">
          {statusIcon(isPassing, index, activeRules)}
        </div>
      </div>
    </div>
  );
}
