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
    hint: 'Expand the length of your sequence.',
    check: (p) => p.length >= 12,
    reward: 5,
  },
  {
    id: 2,
    category: 'basics',
    description: 'Your password must contain at least 2 uppercase letters and at least 2 lowercase letters.',
    hint: 'Combine both uppercase (A-Z) and lowercase (a-z) letters.',
    check: (p) => (p.match(/[A-Z]/g) || []).length >= 2 && (p.match(/[a-z]/g) || []).length >= 2,
    reward: 10,
  },
  {
    id: 3,
    category: 'basics',
    description: 'Your password must contain at least 2 special symbols (!@#$%^&*_-).',
    hint: 'Incorporate special symbols from standard keyboard punctuation (!@#$%^&*_-).',
    check: (p) => (p.match(/[!@#$%^&*_\-]/g) || []).length >= 2,
    reward: 10,
  },

  // ── Category 2: Mathematics (2 rules) ─────────────────────
  {
    id: 4,
    category: 'math',
    description: 'The sum of all digits in your password must be a prime number.',
    hint: 'Add together every digit present in your password. The resulting sum must be a number divisible only by 1 and itself.',
    check: (p) => isPrime(sumDigits(p)),
    reward: 15,
  },
  {
    id: 5,
    category: 'math',
    description: 'Your password must contain a two-digit perfect square.',
    hint: 'Think of an integer multiplied by itself whose product falls between 10 and 99.',
    check: (p) => /16|25|36|49|64|81/.test(p),
    reward: 15,
  },

  // ── Category 3: Encoding (2 rules) ────────────────────────
  {
    id: 6,
    category: 'encoding',
    description: 'Your password must contain the international distress signal in continuous Morse code.',
    hint: 'The universal maritime call for help: three dots, three dashes, three dots (without spaces).',
    check: (p) => p.includes('...---...'),
    reward: 15,
  },
  {
    id: 7,
    category: 'encoding',
    description: 'Your password must include a valid 6-digit hexadecimal color code.',
    hint: 'Begins with a hash (#) followed by six hexadecimal digits representing RGB color channels.',
    check: (p) => /#[0-9a-fA-F]{6}/.test(p),
    reward: 15,
  },

  // ── Category 4: Science (2 rules) ─────────────────────────
  {
    id: 8,
    category: 'science',
    description: 'Your password must include the chemical symbols of at least 3 distinct elements from the periodic table.',
    hint: 'Chemical notation is strictly case-sensitive: a single capital letter, or a capital followed by a lowercase letter.',
    check: (p) => {
      const found = Object.keys(PERIODIC).filter(sym => p.includes(sym));
      return new Set(found).size >= 3;
    },
    reward: 20,
  },
  {
    id: 9,
    category: 'science',
    description: 'Your password must include the mathematical constant π (pi) to at least 5 decimal places.',
    hint: 'Archimedes\' constant: start with 3 followed by its first 5 digits after the decimal point.',
    check: (p) => p.includes('3.14159'),
    reward: 15,
  },

  // ── Category 5: Programming (2 rules) ─────────────────────
  {
    id: 10,
    category: 'programming',
    description: 'Your password must contain a recognized Git version control command.',
    hint: 'Think of common version control operations used to stage, record, sync, or inspect changes.',
    check: (p) => /git[_\-]?(add|commit|push|pull|merge|rebase|stash|clone|diff|log)/i.test(p),
    reward: 20,
  },
  {
    id: 11,
    category: 'programming',
    description: 'Your password must include a standard 3-digit HTTP response status code.',
    hint: 'A standard three-digit server status indicator for success, redirection, client error, or server error.',
    check: (p) => /200|201|301|302|400|401|403|404|500|503/.test(p),
    reward: 15,
  },

  // ── Category 6: Ciphers (2 rules) ─────────────────────────
  {
    id: 12,
    category: 'cipher',
    description: 'Your password must contain the word "password" encrypted with the ROT13 cipher.',
    hint: 'Rotate every character in the lowercase word "password" forward by 13 positions in the Latin alphabet.',
    check: (p) => p.includes('cnffjbeq'),
    reward: 15,
  },
  {
    id: 13,
    category: 'cipher',
    description: 'Your password must contain the greeting "HELLO" encrypted with a classical Caesar cipher (shift 3).',
    hint: 'Shift each letter of "HELLO" 3 places forward in the uppercase alphabet (A becomes D).',
    check: (p) => p.includes('KHOOR'),
    reward: 15,
  },

  // ── Category 7: Time-Based (2 rules) ──────────────────────
  {
    id: 14,
    category: 'time',
    description: 'Your password must contain today\'s day of the month as a 2-digit number.',
    hint: 'Look at today\'s calendar date. If it is a single-digit day, pad it with a leading zero.',
    check: (p) => p.includes(String(new Date().getDate()).padStart(2, '0')),
    reward: 20,
    isDynamic: true,
  },
  {
    id: 15,
    category: 'time',
    description: 'Your password must contain the full, capitalized name of the current calendar month.',
    hint: 'Spell out the current month in English starting with an uppercase letter.',
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
    description: 'Your password must include an isolated group of Roman numerals whose values sum to exactly 42.',
    hint: 'Compose valid Roman numerals (I, V, X, L, C, D, M) that total 42. Separate them from adjacent Roman letters with underscores or symbols.',
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
    description: 'Your password must contain the current calendar year written in Roman numerals.',
    hint: 'Translate the four digits of the current calendar year into classic Roman numeral notation.',
    check: (p) => p.includes('MMXXVI'),
    reward: 20,
  },

  // ── Category 9: Advanced (3 rules) ────────────────────────
  {
    id: 18,
    category: 'advanced',
    description: 'Your password must contain a valid UUID version 4 identifier.',
    hint: 'A 36-character hyphenated string conforming to UUIDv4 specifications (with standard hex groups and version bits).',
    check: (p) => /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(p),
    reward: 30,
  },
  {
    id: 19,
    category: 'advanced',
    description: 'Your password must contain a continuous sequence of at least 16 lowercase hexadecimal characters.',
    hint: 'Sixteen uninterrupted characters drawn exclusively from 0-9 and a-f.',
    check: (p) => /[0-9a-f]{16}/.test(p),
    reward: 30,
  },
  {
    id: 20,
    category: 'advanced',
    description: 'FINAL BOSS: Your password must begin with "P@55w0rd", conclude with "!!END!!", and incorporate a palindrome of at least 5 characters.',
    hint: 'Start and end as instructed, and embed a symmetrical word or character sequence of length 5 or greater that reads identically in both directions.',
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
