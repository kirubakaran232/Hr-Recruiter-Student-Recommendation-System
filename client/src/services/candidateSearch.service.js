import api from './api';

// ── Smart Candidate Search API Call ───────────────────────────────────────────
export async function searchCandidatesSmart({
  query          = '',
  skills         = [],
  minExperience  = null,
  maxExperience  = null,
  college        = '',
  location       = '',
  technology     = '',
  maxSalary      = null,
  graduationYear = null,
  minTalentScore = null,
  page           = 1,
  limit          = 25,
  sortBy         = 'semantic_match'
} = {}) {
  const params = new URLSearchParams();
  if (query)          params.set('query',          query);
  if (skills?.length) params.set('skills',         Array.isArray(skills) ? skills.join(',') : skills);
  if (minExperience  != null && minExperience  !== '') params.set('minExperience',  minExperience);
  if (maxExperience  != null && maxExperience  !== '') params.set('maxExperience',  maxExperience);
  if (college)        params.set('college',        college);
  if (location)       params.set('location',       location);
  if (technology)     params.set('technology',     technology);
  if (maxSalary      != null && maxSalary      !== '') params.set('maxSalary',      maxSalary);
  if (graduationYear != null && graduationYear !== '') params.set('graduationYear', graduationYear);
  if (minTalentScore != null && minTalentScore !== '') params.set('minTalentScore', minTalentScore);
  params.set('page',   page);
  params.set('limit',  limit);
  params.set('sortBy', sortBy);

  const { data } = await api.get(`/hr/candidates/search?${params}`);
  return data; // { query, parsedTargets, candidates, pagination }
}
