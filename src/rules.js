// ============================================================
//  PASSWORD GAME — RULES ENGINE
//  35 progressively harder technical rules
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

function charCode(str) {
  return [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function toMorse(char) {
  const table = {
    A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....', I:'..', J:'.---',
    K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-',
    U:'..-', V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
    '6':'-....','7':'--...','8':'---..','9':'----.',
  };
  return table[char.toUpperCase()] || '';
}

function encodeBase64(str) {
  try { return btoa(unescape(encodeURIComponent(str))); } catch { return ''; }
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

function toRoman(num) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

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

function caesarDecrypt(str, shift) {
  return str.replace(/[a-z]/g, c => String.fromCharCode(((c.charCodeAt(0) - 97 - shift + 26) % 26) + 97))
            .replace(/[A-Z]/g, c => String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65));
}

function countVowels(str) {
  return (str.match(/[aeiouAEIOU]/g) || []).length;
}

function countConsonants(str) {
  return (str.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
}

function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; }
  return b;
}

function isFib(n) {
  const FIBS = new Set([0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584]);
  return FIBS.has(n);
}

// Dynamic clue for rule 26 (time-based)
function getTimedNumber() {
  return new Date().getSeconds();
}

// ============================================================
//  RULES ARRAY  (id, description, check, hint, category)
// ============================================================
export const RULES = [
  // ── Tier 1: Basics ─────────────────────────────────────
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
    description: 'Your password must contain at least 2 uppercase letters.',
    hint: 'Mix CAPITAL letters in there.',
    check: (p) => (p.match(/[A-Z]/g) || []).length >= 2,
    reward: 5,
  },
  {
    id: 3,
    category: 'basics',
    description: 'Your password must contain at least 2 lowercase letters.',
    hint: 'Some small letters too.',
    check: (p) => (p.match(/[a-z]/g) || []).length >= 2,
    reward: 5,
  },
  {
    id: 4,
    category: 'basics',
    description: 'Your password must contain at least 3 digits.',
    hint: '123 is a start, but be creative.',
    check: (p) => (p.match(/\d/g) || []).length >= 3,
    reward: 5,
  },
  {
    id: 5,
    category: 'basics',
    description: 'Your password must contain at least 2 special characters (!@#$%^&*_-).',
    hint: 'Sprinkle in some !@#$ magic.',
    check: (p) => (p.match(/[!@#$%^&*_\-]/g) || []).length >= 2,
    reward: 10,
  },

  // ── Tier 2: Math ───────────────────────────────────────
  {
    id: 6,
    category: 'math',
    description: 'The sum of all digits in your password must be a prime number.',
    hint: `Sum the digits (e.g. "a3b5" → 8). Primes: 2,3,5,7,11,13,17,19,23,29,31...`,
    check: (p) => isPrime(sumDigits(p)),
    reward: 15,
  },
  {
    id: 7,
    category: 'math',
    description: 'Your password must contain a two-digit perfect square (16, 25, 36, 49, 64, 81).',
    hint: '16, 25, 36, 49, 64, or 81 must appear as a substring.',
    check: (p) => /16|25|36|49|64|81/.test(p),
    reward: 10,
  },
  {
    id: 8,
    category: 'math',
    description: 'Your password must include a Fibonacci number between 10 and 1000 (e.g. 13, 21, 34, 55, 89, 144, 233, 377, 610, 987).',
    hint: 'Fibonacci: 13, 21, 34, 55, 89, 144, 233, 377, 610, 987',
    check: (p) => /\d+/.test(p) && [...p.matchAll(/\d+/g)].some(m => {
      const n = parseInt(m[0]);
      return n >= 10 && n <= 1000 && isFib(n);
    }),
    reward: 15,
  },
  {
    id: 9,
    category: 'math',
    description: 'Your password length must be a prime number.',
    hint: `Current length must be prime. Next primes: 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47...`,
    check: (p) => isPrime(p.length),
    reward: 20,
  },
  {
    id: 10,
    category: 'math',
    description: 'The sum of ASCII values of all characters must be divisible by 7.',
    hint: 'Sum every character\'s ASCII code (charCodeAt). Total must be divisible by 7.',
    check: (p) => p.length > 0 && charCode(p) % 7 === 0,
    reward: 25,
  },

  // ── Tier 3: Encoding ───────────────────────────────────
  {
    id: 11,
    category: 'encoding',
    description: 'Your password must contain the Morse code for "SOS" (... --- ...).',
    hint: 'Include: ...---...   (no spaces needed)',
    check: (p) => p.includes('...---...'),
    reward: 15,
  },
  {
    id: 12,
    category: 'encoding',
    description: 'Your password must include a valid hexadecimal color code (# followed by 6 hex digits, e.g. #a3f0cc).',
    hint: 'Format: #RRGGBB — like #ff0000 (red) or #00ff00 (green).',
    check: (p) => /#[0-9a-fA-F]{6}/.test(p),
    reward: 15,
  },
  {
    id: 13,
    category: 'encoding',
    description: 'Your password must contain a valid IPv4 address (e.g. 192.168.1.1). Each octet must be 0–255.',
    hint: 'Format: A.B.C.D where each number is between 0 and 255.',
    check: (p) => {
      const matches = p.match(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g);
      if (!matches) return false;
      return matches.some(ip => ip.split('.').every(o => parseInt(o) <= 255));
    },
    reward: 20,
  },
  {
    id: 14,
    category: 'encoding',
    description: 'Your password, when Base64-encoded, must contain the letter "Z" (case-insensitive).',
    hint: 'Try encoding your password online to see its Base64 form. Tweak characters until "Z" or "z" appears in the result.',
    check: (p) => encodeBase64(p).toLowerCase().includes('z'),
    reward: 25,
  },
  {
    id: 15,
    category: 'encoding',
    description: 'Your password must contain a binary representation of a number (e.g. 01010101). The binary string must be 8 bits (exactly 8 consecutive 0s and 1s).',
    hint: 'Include any 8-bit binary like 01000001 (=65=A) or 11111111 (=255).',
    check: (p) => /[01]{8}/.test(p) && /(?<![01])[01]{8}(?![01])/.test(p),
    reward: 20,
  },

  // ── Tier 4: Chemistry / Science ────────────────────────
  {
    id: 16,
    category: 'science',
    description: 'Your password must include the chemical symbol of at least 3 different elements from the periodic table (e.g. Na, Fe, Au, Cl).',
    hint: `Elements: ${Object.keys(PERIODIC).slice(0, 20).join(', ')}... (case-sensitive!)`,
    check: (p) => {
      const found = Object.keys(PERIODIC).filter(sym => p.includes(sym));
      return new Set(found).size >= 3;
    },
    reward: 20,
  },
  {
    id: 17,
    category: 'science',
    description: 'Your password must contain the atomic number of the element "Gold" (Au = 79).',
    hint: 'Gold (Au) has atomic number 79. Include "79" in your password.',
    check: (p) => p.includes('79'),
    reward: 10,
  },
  {
    id: 18,
    category: 'science',
    description: 'Your password must include π (pi) to at least 5 decimal places: 3.14159',
    hint: 'Include the string "3.14159" in your password.',
    check: (p) => p.includes('3.14159'),
    reward: 15,
  },

  // ── Tier 5: Programming ────────────────────────────────
  {
    id: 19,
    category: 'programming',
    description: 'Your password must contain at least one git command (git add, git commit, git push, git pull, git merge, git rebase, git stash, git clone, git diff, git log).',
    hint: 'Include a git command like: git_add, git_commit, git_push...',
    check: (p) => /git[_\-]?(add|commit|push|pull|merge|rebase|stash|clone|diff|log)/i.test(p),
    reward: 20,
  },
  {
    id: 20,
    category: 'programming',
    description: 'Your password must include a valid semantic version number (e.g. v1.0.0, 2.13.7, v0.1.0-beta).',
    hint: 'Format: v?MAJOR.MINOR.PATCH (e.g. v2.3.1 or 1.0.0)',
    check: (p) => /v?\d+\.\d+\.\d+(-[a-z]+)?/.test(p),
    reward: 15,
  },
  {
    id: 21,
    category: 'programming',
    description: 'Your password must contain a valid regex metacharacter sequence: it must include at least one of: \\d, \\w, \\s, \\n, \\t, \\b, .*, .+, ^$',
    hint: 'Include regex like: \\d, \\w, .*, .+, ^$ etc.',
    check: (p) => /\\d|\\w|\\s|\\n|\\t|\\b|\.\*|\.\+|\^\$/.test(p),
    reward: 20,
  },
  {
    id: 22,
    category: 'programming',
    description: 'Your password must include a valid HTTP status code: 200, 201, 301, 302, 400, 401, 403, 404, 500, 503.',
    hint: 'Include one of: 200, 201, 301, 302, 400, 401, 403, 404, 500, 503',
    check: (p) => /200|201|301|302|400|401|403|404|500|503/.test(p),
    reward: 10,
  },
  {
    id: 23,
    category: 'programming',
    description: 'Your password must contain a valid CSS color in rgb() format, e.g. rgb(255,0,128).',
    hint: 'Include: rgb(R,G,B) where each value is 0-255. Spaces around commas are optional.',
    check: (p) => {
      const m = p.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (!m) return false;
      return [m[1],m[2],m[3]].every(v => parseInt(v) <= 255);
    },
    reward: 20,
  },

  // ── Tier 6: Ciphers ───────────────────────────────────
  {
    id: 24,
    category: 'cipher',
    description: 'Your password must contain the ROT13 of the word "password" (which is "cnffjbeq").',
    hint: 'ROT13("password") = "cnffjbeq". Include this exact string.',
    check: (p) => p.includes('cnffjbeq'),
    reward: 15,
  },
  {
    id: 25,
    category: 'cipher',
    description: 'Your password must contain a Caesar cipher (shift 3) decrypted word. Include the word "KHOOR" — its decrypted meaning is "HELLO".',
    hint: 'Caesar-3 cipher: KHOOR → HELLO. Include "KHOOR" in your password.',
    check: (p) => p.includes('KHOOR'),
    reward: 15,
  },

  // ── Tier 7: Time-based ────────────────────────────────
  {
    id: 26,
    category: 'time',
    description: () => `Your password must contain today's day of the month as a 2-digit number. Today is the ${new Date().getDate()}${['st','nd','rd'][((new Date().getDate()+90)%100-10)%10-1]||'th'}.`,
    hint: () => `Include "${String(new Date().getDate()).padStart(2,'0')}" in your password.`,
    check: (p) => p.includes(String(new Date().getDate()).padStart(2, '0')),
    reward: 20,
    isDynamic: true,
  },
  {
    id: 27,
    category: 'time',
    description: () => `Your password must contain the current minute as a 2-digit number. Right now: ${String(new Date().getMinutes()).padStart(2,'0')}. You have 60 seconds before this changes!`,
    hint: () => `Current minute: ${String(new Date().getMinutes()).padStart(2,'0')}. Include it — but hurry!`,
    check: (p) => p.includes(String(new Date().getMinutes()).padStart(2, '0')),
    reward: 30,
    isDynamic: true,
    timerBased: true,
  },

  // ── Tier 8: Roman Numerals ────────────────────────────
  {
    id: 28,
    category: 'roman',
    description: 'Your password must include Roman numerals that sum to exactly 42 (e.g. XL+II = XLII, or XXXX+II, or other combos that total 42).',
    hint: 'Include Roman numeral "XLII" (= 42) or any combo of Roman numerals summing to 42.',
    check: (p) => {
      const m = p.match(/[IVXLCDM]+/g);
      if (!m) return false;
      return m.some(token => parseRoman(token) === 42);
    },
    reward: 25,
  },
  {
    id: 29,
    category: 'roman',
    description: 'Your password must contain the Roman numeral for the current year (MMXXVI = 2026).',
    hint: `Include "MMXXVI" (= ${new Date().getFullYear()}) in your password.`,
    check: (p) => p.includes('MMXXVI'),
    reward: 20,
  },

  // ── Tier 9: Advanced Technical ────────────────────────
  {
    id: 30,
    category: 'advanced',
    description: 'Your password must contain a valid UUID v4 pattern (8-4-4-4-12 hex chars, e.g. 550e8400-e29b-41d4-a716-446655440000).',
    hint: 'Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (hex characters separated by dashes)',
    check: (p) => /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(p),
    reward: 30,
  },
  {
    id: 31,
    category: 'advanced',
    description: 'Your password must contain a valid JWT-like token structure (three base64url segments separated by dots, e.g. eyJ...xxx.eyJ...yyy.sig).',
    hint: 'Format: base64url.base64url.base64url — e.g. eyJhbGc.eyJzdWI.SflKxw',
    check: (p) => /[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/.test(p),
    reward: 30,
  },
  {
    id: 32,
    category: 'advanced',
    description: 'Your password must include a valid CIDR notation (e.g. 192.168.0.0/24, 10.0.0.0/8).',
    hint: 'Format: IP/prefix — like 192.168.1.0/24 or 10.0.0.0/8',
    check: (p) => {
      const m = p.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})/);
      if (!m) return false;
      return m.slice(1,5).every(o => parseInt(o) <= 255) && parseInt(m[5]) <= 32;
    },
    reward: 25,
  },
  {
    id: 33,
    category: 'advanced',
    description: 'Your password must contain a valid SHA-256-like hash prefix: exactly 16 consecutive lowercase hex characters.',
    hint: 'Include 16 consecutive hex chars: 0-9 and a-f only, e.g. "a3f0c1d2e4b56789"',
    check: (p) => /[0-9a-f]{16}/.test(p),
    reward: 30,
  },
  {
    id: 34,
    category: 'advanced',
    description: 'Your password must contain a valid cron expression (e.g. "* * * * *" or "0 9 * * 1").',
    hint: 'Format: "MIN HOUR DOM MON DOW" — like "0 9 * * 1" (every Monday 9am)',
    check: (p) => /(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)/.test(p),
    reward: 35,
  },
  {
    id: 35,
    category: 'advanced',
    description: 'FINAL BOSS: Your password must start with "P@55w0rd" AND end with "!!END!!" AND be palindrome-adjacent (contain a 5+ char palindrome substring, e.g. "abcba" or "racecar").',
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
    reward: 50,
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
