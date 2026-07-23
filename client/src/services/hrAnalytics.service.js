import api from './api';

export async function fetchHRAnalytics() {
  const { data } = await api.get('/hr/analytics');
  return data; // { success, analytics }
}
