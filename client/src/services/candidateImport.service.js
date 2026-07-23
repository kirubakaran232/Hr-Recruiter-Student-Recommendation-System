import api from './api';

// ── Import candidates from file (multipart) ───────────────────────────────────
export async function importCandidatesFile(file, onProgress) {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post('/hr/candidates/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined
  });
  return data; // { summary, errors, duplicates, candidates }
}

// ── Fetch candidates (paginated) ──────────────────────────────────────────────
export async function fetchCandidates({ page = 1, limit = 20, search = '', status = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page',  page);
  params.set('limit', limit);
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const { data } = await api.get(`/hr/candidates?${params}`);
  return data; // { candidates, pagination }
}

// ── Fetch stats ───────────────────────────────────────────────────────────────
export async function fetchCandidateStats() {
  const { data } = await api.get('/hr/candidates/stats');
  return data; // { stats }
}

// ── Download xlsx template (triggers browser download) ────────────────────────
export async function downloadCandidateTemplate() {
  const response = await api.get('/hr/candidates/template', { responseType: 'blob' });
  const url  = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'talentos_candidate_template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Delete a single candidate ─────────────────────────────────────────────────
export async function deleteCandidate(id) {
  const { data } = await api.delete(`/hr/candidates/${id}`);
  return data;
}

// ── Clear all candidates (optional status filter) ─────────────────────────────
export async function clearCandidates(status = '') {
  const params = status ? `?status=${status}` : '';
  const { data } = await api.delete(`/hr/candidates${params}`);
  return data;
}

// Export aliases for backwards compatibility
export const uploadCandidateFile   = importCandidatesFile;
export const downloadTemplate      = downloadCandidateTemplate;
export const clearAllCandidates    = clearCandidates;
