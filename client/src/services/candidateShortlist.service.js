import api from './api';

// ── Run Automated Shortlisting based on Recruiter Requirements ────────────────
export async function runAutoShortlisting(rules = {}) {
  const { data } = await api.post('/hr/candidates/shortlist/auto', rules);
  return data; // { success, message, evaluatedCount, autoShortlistedCount, totalShortlisted, rulePassStats, shortlist }
}

// ── Fetch Current Shortlisted Candidates ──────────────────────────────────────
export async function fetchShortlistedCandidates() {
  const { data } = await api.get('/hr/candidates/shortlist');
  return data; // { success, total, shortlist }
}

// ── Toggle Manual Shortlist for Candidate ─────────────────────────────────────
export async function toggleCandidateShortlist(id, shortlisted) {
  const { data } = await api.patch(`/hr/candidates/${id}/shortlist`, { shortlisted });
  return data; // { success, message, candidate }
}
