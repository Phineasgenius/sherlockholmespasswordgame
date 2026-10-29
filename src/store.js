// ============================================================
//  Store — Supabase-backed persistence
//  Table: "submissions" (see SQL in the setup guide)
// ============================================================
import { supabase } from './supabase';

/**
 * Fetch all submissions, sorted by score descending.
 * Returns { data, error }
 */
export async function getSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('score', { ascending: false });
  return { data: data ?? [], error };
}

/**
 * Insert a new submission row.
 * Returns { data, error }
 */
export async function addSubmission({ username, score, maxScore, rulesPassed, totalRules, timeTaken }) {
  const row = {
    username:     username.trim() || 'Anonymous',
    score,
    max_score:    maxScore,
    rules_passed: rulesPassed,
    total_rules:  totalRules,
    time_taken:   timeTaken,
    percent_score: Math.round((score / maxScore) * 100),
  };
  const { data, error } = await supabase
    .from('submissions')
    .insert([row])
    .select()
    .single();
  return { data, error };
}

/**
 * Delete all rows from submissions (admin only action).
 * Returns { error }
 */
export async function clearSubmissions() {
  // Delete all rows — RLS policy on Supabase controls who can do this.
  const { error } = await supabase
    .from('submissions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows
  return { error };
}

/**
 * Compute aggregate stats from a list of submission objects.
 */
export function computeStats(submissions) {
  if (!submissions || submissions.length === 0) return null;
  const scores = submissions.map(s => s.score);
  return {
    total:          submissions.length,
    averageScore:   Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    topScore:       Math.max(...scores),
    perfectPlayers: submissions.filter(s => s.rules_passed === s.total_rules).length,
  };
}
