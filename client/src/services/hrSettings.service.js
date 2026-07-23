import api from './api';

export async function fetchHRSettings() {
  const { data } = await api.get('/hr/settings');
  return data; // { success, settings: { aiWeights, hiringPreferences, teamMembers } }
}

export async function updateAIWeights(weights) {
  const { data } = await api.put('/hr/settings/ai-weights', weights);
  return data;
}

export async function addTeamMember(member) {
  const { data } = await api.post('/hr/settings/team-members', member);
  return data;
}

export async function removeTeamMember(email) {
  const { data } = await api.delete('/hr/settings/team-members', { data: { email } });
  return data;
}
