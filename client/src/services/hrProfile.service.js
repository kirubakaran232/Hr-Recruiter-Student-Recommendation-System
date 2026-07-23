import api from './api';

// ── Fetch HR company profile ─────────────────────────────────────────────────
export async function fetchHRProfile() {
  const { data } = await api.get('/hr/company');
  return data; // { hrProfile: {...} | null }
}

// ── Save company info + contact + hiring preferences ─────────────────────────
export async function saveHRProfile(payload) {
  const { data } = await api.put('/hr/company', payload);
  return data; // { hrProfile: {...} }
}

// ── Upload company logo (multipart/form-data) ────────────────────────────────
export async function uploadCompanyLogo(file) {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await api.post('/hr/company/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data; // { logoUrl, logoPublicId, hrProfile }
}

// ── Delete company logo ───────────────────────────────────────────────────────
export async function deleteCompanyLogo() {
  const { data } = await api.delete('/hr/company/logo');
  return data; // { message, hrProfile }
}
