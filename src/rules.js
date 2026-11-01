// ============================================================
//  PASSWORD GAME — RULES ENGINE
//  20 progressively harder technical rules across 9 categories
// ============================================================

// Helper utilities
const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113];

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

function sumDigits(str) {
  return [...str].reduce((acc, c) => (/\d/.test(c) ? acc + parseInt(c) : acc), 0);
}

const PERIODIC = {
  H:'Hydrogen', He:'Helium', Li:'Lithium', Be:'Beryllium', B:'Boron', C:'Carbon', N:'Nitrogen',
  O:'Oxygen', F:'Fluorine', Ne:'Neon', Na:'Sodium', Mg:'Magnesium', Al:'Aluminum', Si:'Silicon',
  P:'Phosphorus', S:'Sulfur', Cl:'Chlorine', Ar:'Argon', K:'Potassium', Ca:'Calcium',
  Fe:'Iron', Cu:'Copper', Zn:'Zinc', Br:'Bromine', Kr:'Krypton', Ag:'Silver', Au:'Gold',
  Hg:'Mercury', Pb:'Lead', Pt:'Platinum', Cr:'Chromium', Mn:'Manganese', Co:'Cobalt',
  Ni:'Nickel', Se:'Selenium', Sr:'Strontium', Xe:'Xenon', Cs:'Cesium', Ba:'Barium',
  W:'Tungsten', Os:'Osmium', Ir:'Iridium', Ti:'Titanium', V:'Vanadium', Ga:'Gallium',
};

const ROMAN_VALUES = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

function parseRoman(str) {
  const m = str.match(/[IVXLCDM]+/gi);
  if (!m) return 0;
  return m.reduce((acc, token) => {
    const chars = [...token.toUpperCase()];
    return acc + chars.reduce((sum, c, i) => {
      const cur = ROMAN_VALUES[c] || 0;
      const next = ROMAN_VALUES[chars[i+1]] || 0;
      return sum + (cur < next ? -cur : cur);
    }, 0);
  }, 0);
}

// ============================================================
//  RULES ARRAY (20 rules, 9 categories)
// ============================================================
export const RULES = [
  // ── Category 1: Basics (3 rules) ──────────────────────────
  {
    id: 1,
    category: 'basics',
    description: 'Your password must be at least 12 characters long.',
    hint: 'Length matters. Aim for quality AND quantity.',
    check: (p) => p.length >= 12,
    reward: 5,
  },
  {
    id: 2,
    category: 'basics',
    description: 'Your password must contain at least 2 uppercase letters and at least 2 lowercase letters.',
    hint: 'Mix capital letters (A-Z) and lowercase letters (a-z).',
    check: (p) => (p.match(/[A-Z]/g) || []).length >= 2 && (p.match(/[a-z]/g) || []).length >= 2,
    reward: 10,
  },
  {
    id: 3,
    category: 'basics',
    description: 'Your password must contain at least 2 special characters (!@#$%^&*_-).',
    hint: 'Sprinkle in some !@#$ magic.',
    check: (p) => (p.match(/[!@#$%^&*_\-]/g) || []).length >= 2,
    reward: 10,
  },

  // ── Category 2: Mathematics (2 rules) ─────────────────────
  {
    id: 4,
    category: 'math',
    description: 'The sum of all digits in your password must be a prime number.',
    hint: 'Sum the digits (e.g. "a3b5" → 8). Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31...',
    check: (p) => isPrime(sumDigits(p)),
    reward: 15,
  },
  {
    id: 5,
    category: 'math',
    description: 'Your password must contain a two-digit perfect square (16, 25, 36, 49, 64, 81).',
    hint: '16, 25, 36, 49, 64, or 81 must appear as a substring.',
    check: (p) => /16|25|36|49|64|81/.test(p),
    reward: 15,
  },

  // ── Category 3: Encoding (2 rules) ────────────────────────
  {
    id: 6,
    category: 'encoding',
    description: 'Your password must contain the Morse code for "SOS" (... --- ...).',
    hint: 'Include: ...---... (no spaces needed)',
    check: (p) => p.includes('...---...'),
    reward: 15,
  },
  {
    id: 7,
    category: 'encoding',
    description: 'Your password must include a valid hexadecimal color code (# followed by 6 hex digits, e.g. #a3f0cc).',
    hint: 'Format: #RRGGBB — like #ff0000 (red) or #a3f0cc.',
    check: (p) => /#[0-9a-fA-F]{6}/.test(p),
    reward: 15,
  },

  // ── Category 4: Science (2 rules) ─────────────────────────
  {
    id: 8,
    category: 'science',
    description: 'Your password must include the chemical symbol of at least 3 different elements from the periodic table (e.g. Na, Fe, Au, Cl).',
    hint: `Elements: ${Object.keys(PERIODIC).slice(0, 16).join(', ')}... (case-sensitive!)`,
    check: (p) => {
      const found = Object.keys(PERIODIC).filter(sym => p.includes(sym));
      return new Set(found).size >= 3;
    },
    reward: 20,
  },
  {
    id: 9,
    category: 'science',
    description: 'Your password must include π (pi) to at least 5 decimal places: 3.14159',
    hint: 'Include the string "3.14159" in your password.',
    check: (p) => p.includes('3.14159'),
    reward: 15,
  },

  // ── Category 5: Programming (2 rules) ─────────────────────
  {
    id: 10,
    category: 'programming',
    description: 'Your password must contain at least one git command (git add, git commit, git push, git pull, git merge, git rebase, git stash, git clone, git diff, git log).',
    hint: 'Include a git command like: git_add, git_commit, git_push...',
    check: (p) => /git[_\-]?(add|commit|push|pull|merge|rebase|stash|clone|diff|log)/i.test(p),
    reward: 20,
  },
  {
    id: 11,
    category: 'programming',
    description: 'Your password must include a valid HTTP status code: 200, 201, 301, 302, 400, 401, 403, 404, 500, 503.',
    hint: 'Include one of: 200, 201, 301, 302, 400, 401, 403, 404, 500, 503',
    check: (p) => /200|201|301|302|400|401|403|404|500|503/.test(p),
    reward: 15,
  },

  // ── Category 6: Ciphers (2 rules) ─────────────────────────
  {
    id: 12,
    category: 'cipher',
    description: 'Your password must contain the ROT13 of the word "password" (which is "cnffjbeq").',
    hint: 'ROT13("password") = "cnffjbeq". Include this exact string.',
    check: (p) => p.includes('cnffjbeq'),
    reward: 15,
  },
  {
    id: 13,
    category: 'cipher',
    description: 'Your password must contain a Caesar cipher (shift 3) decrypted word. Include the word "KHOOR" — its decrypted meaning is "HELLO".',
    hint: 'Caesar-3 cipher: KHOOR → HELLO. Include "KHOOR" in your password.',
    check: (p) => p.includes('KHOOR'),
    reward: 15,
  },

  // ── Category 7: Time-Based (2 rules) ──────────────────────
  {
    id: 14,
    category: 'time',
    description: () => `Your password must contain today's day of the month as a 2-digit number. Today is the ${new Date().getDate()}${['st','nd','rd'][((new Date().getDate()+90)%100-10)%10-1]||'th'}.`,
    hint: () => `Include "${String(new Date().getDate()).padStart(2,'0')}" in your password.`,
    check: (p) => p.includes(String(new Date().getDate()).padStart(2, '0')),
    reward: 20,
    isDynamic: true,
  },
  {
    id: 15,
    category: 'time',
    description: () => {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `Your password must contain the current month name ("${monthNames[new Date().getMonth()]}").`;
    },
    hint: () => {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `Include "${monthNames[new Date().getMonth()]}" in your password.`;
    },
    check: (p) => {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return p.includes(monthNames[new Date().getMonth()]);
    },
    reward: 20,
    isDynamic: true,
  },

  // ── Category 8: Roman Numerals (2 rules) ──────────────────
  {
    id: 16,
    category: 'roman',
    description: 'Your password must include Roman numerals that sum to exactly 42 (e.g. XL+II = XLII, or combinations summing to 42).',
    hint: 'Include Roman numeral "XLII" (= 42) or any combo of Roman numerals summing to 42.',
    check: (p) => {
      const m = p.match(/[IVXLCDM]+/g);
      if (!m) return false;
      return m.some(token => parseRoman(token) === 42);
    },
    reward: 25,
  },
  {
    id: 17,
    category: 'roman',
    description: 'Your password must contain the Roman numeral for the current year (MMXXVI = 2026).',
    hint: `Include "MMXXVI" (= ${new Date().getFullYear()}) in your password.`,
    check: (p) => p.includes('MMXXVI'),
    reward: 20,
  },

  // ── Category 9: Advanced (3 rules) ────────────────────────
  {
    id: 18,
    category: 'advanced',
    description: 'Your password must contain a valid UUID v4 pattern (8-4-4-4-12 hex chars, e.g. 550e8400-e29b-41d4-a716-446655440000).',
    hint: 'Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (hex characters separated by dashes)',
    check: (p) => /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(p),
    reward: 30,
  },
  {
    id: 19,
    category: 'advanced',
    description: 'Your password must contain a valid SHA-256-like hash prefix: exactly 16 consecutive lowercase hex characters.',
    hint: 'Include 16 consecutive hex chars: 0-9 and a-f only, e.g. "a3f0c1d2e4b56789"',
    check: (p) => /[0-9a-f]{16}/.test(p),
    reward: 30,
  },
  {
    id: 20,
    category: 'advanced',
    description: 'FINAL BOSS: Your password must start with "P@55w0rd" AND end with "!!END!!" AND contain a 5+ character palindrome substring (e.g. "racecar" or "madam").',
    hint: 'Start with P@55w0rd, end with !!END!!, and include a palindrome like "racecar", "madam", "level", "abcba"',
    check: (p) => {
      if (!p.startsWith('P@55w0rd') || !p.endsWith('!!END!!')) return false;
      for (let i = 0; i < p.length - 4; i++) {
        for (let j = i + 5; j <= p.length; j++) {
          const sub = p.slice(i, j);
          if (sub === [...sub].reverse().join('')) return true;
        }
      }
      return false;
    },
    reward: 40,
  },
];

// Description and hint can be functions (for dynamic rules)
export function getDescription(rule) {
  return typeof rule.description === 'function' ? rule.description() : rule.description;
}

export function getHint(rule) {
  return typeof rule.hint === 'function' ? rule.hint() : rule.hint;
}

export function checkRule(rule, password) {
  try {
    return rule.check(password);
  } catch {
    return false;
  }
}

export function evaluateAll(password) {
  return RULES.map(rule => ({
    ...rule,
    passing: checkRule(rule, password),
    descriptionText: getDescription(rule),
    hintText: getHint(rule),
  }));
}

export function getTotalScore(results) {
  return results.filter(r => r.passing).reduce((acc, r) => acc + r.reward, 0);
}

export function getMaxScore() {
  return RULES.reduce((acc, r) => acc + r.reward, 0);
}

export const CATEGORY_META = {
  basics:      { label: 'Basics',        color: '#3b82f6', icon: '🔑' },
  math:        { label: 'Mathematics',   color: '#f59e0b', icon: '🔢' },
  encoding:    { label: 'Encoding',      color: '#8b5cf6', icon: '💻' },
  science:     { label: 'Science',       color: '#10b981', icon: '⚗️' },
  programming: { label: 'Programming',   color: '#06b6d4', icon: '👨‍💻' },
  cipher:      { label: 'Ciphers',       color: '#f97316', icon: '🔐' },
  time:        { label: 'Time-Based',    color: '#ef4444', icon: '⏰' },
  roman:       { label: 'Roman',         color: '#a78bfa', icon: '🏛️' },
  advanced:    { label: 'Advanced',      color: '#ec4899', icon: '🚀' },
};
