import api from './api';

export async function fetchProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function saveProfile(payload) {
  const { data } = await api.put('/profile', payload);
  return data;
}

export async function uploadResume(file) {
  const form = new FormData();
  form.append('resume', file);
  const { data } = await api.post('/profile/resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function removeResume() {
  const { data } = await api.delete('/profile/resume');
  return data;
}

export async function runAIAnalysis() {
  const { data } = await api.post('/profile/analyze');
  return data;
}

export async function analyzeResumeIntelligence() {
  const { data } = await api.post('/profile/resume/intelligence');
  return data;
}

export async function rewriteResumeBullet(text) {
  const { data } = await api.post('/profile/resume/rewrite-bullet', { text });
  return data;
}

export async function analyzeGitHubIntelligence(username) {
  const { data } = await api.post('/profile/github/analyze', { username });
  return data;
}

export async function analyzePortfolioIntelligence(url) {
  const { data } = await api.post('/profile/portfolio/analyze', { url });
  return data;
}

export async function analyzeCodingIntelligence(platformUrls) {
  const { data } = await api.post('/profile/coding/analyze', { platformUrls });
  return data;
}

export async function analyzeJobMatch(jobDescription) {
  const { data } = await api.post('/profile/job-match/analyze', { jobDescription });
  return data;
}

export async function analyzeSkillGap(targetRole) {
  const { data } = await api.post('/profile/skill-gap/analyze', { targetRole });
  return data;
}

export async function sendCareerAssistantMessage(message) {
  const { data } = await api.post('/profile/assistant/chat', { message });
  return data;
}

export async function fetchDashboardAnalytics() {
  const { data } = await api.get('/profile/analytics');
  return data;
}
