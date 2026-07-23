import api from './api';

// ── Evaluate a single candidate ───────────────────────────────────────────────
export async function evaluateCandidate(candidateId) {
  const { data } = await api.post(`/hr/candidates/${candidateId}/evaluate`);
  return data; // { success, message, candidateId, evaluation }
}

// ── Get stored evaluation for a candidate ─────────────────────────────────────
export async function getCandidateEvaluation(candidateId) {
  const { data } = await api.get(`/hr/candidates/${candidateId}/evaluation`);
  return data; // { success, candidateId, name, email, aiScore, status, evaluation }
}

// ── Bulk evaluate all candidates ──────────────────────────────────────────────
export async function evaluateAllCandidates(status = 'pending') {
  const { data } = await api.post('/hr/candidates/evaluate-all', { status });
  return data; // { success, message, evaluated, summary[] }
}

// ── Get evaluation summary (leaderboard + distribution) ──────────────────────
export async function fetchEvaluationSummary() {
  const { data } = await api.get('/hr/candidates/evaluation-summary');
  return data; // { success, summary, topCandidates[] }
}
