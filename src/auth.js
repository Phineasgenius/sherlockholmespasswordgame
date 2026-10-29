// ============================================================
//  AUTH — hashed credentials, never stored in plaintext
//  Admin password hash: SHA-256 of admin password
//  Admin username hash: SHA-256 of admin username
// ============================================================

// These are SHA-256 hashes — the plaintext is never in this file.
// Both admin username and password are the same value, so same hash.
const ADMIN_USER_HASH = 'b444ba51933168bd4e2455480afd51ae78ba4fe304f85d2e814ff6bcf9296dfc';
const ADMIN_PASS_HASH = 'b444ba51933168bd4e2455480afd51ae78ba4fe304f85d2e814ff6bcf9296dfc';

/**
 * Hash a string using SHA-256 via the Web Crypto API.
 * Returns a hex string.
 */
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify admin credentials using constant-time-equivalent hash comparison.
 * Returns true only if both username AND password hash match.
 */
export async function verifyAdminCredentials(username, password) {
  const [uHash, pHash] = await Promise.all([sha256(username), sha256(password)]);
  // Both must match — prevents partial-match attacks
  return uHash === ADMIN_USER_HASH && pHash === ADMIN_PASS_HASH;
}
