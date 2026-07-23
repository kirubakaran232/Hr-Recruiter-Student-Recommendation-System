import api from './api';

// ── Fetch Candidate Rankings ──────────────────────────────────────────────────
export async function fetchCandidateRankings({
  sortBy = 'highest_score',
  search = '',
  status = '',
  page   = 1,
  limit  = 25
} = {}) {
  const params = new URLSearchParams();
  params.set('sortBy', sortBy);
  params.set('page',   page);
  params.set('limit',  limit);
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const { data } = await api.get(`/hr/candidates/ranking?${params}`);
  return data; // { rankings, stats, pagination }
}

// ── Update Candidate Status ───────────────────────────────────────────────────
export async function updateCandidateStatus(id, status) {
  const { data } = await api.patch(`/hr/candidates/${id}/status`, { status });
  return data; // { success, message, candidate }
}
