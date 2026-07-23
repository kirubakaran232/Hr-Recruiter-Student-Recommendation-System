import { Candidate } from '../models/Candidate.js';

// ── Known technology & keyword dictionary ──────────────────────────────────────
const TECH_DICTIONARY = [
  'react', 'react.js', 'reactjs', 'node', 'node.js', 'nodejs', 'express', 'express.js',
  'javascript', 'js', 'typescript', 'ts', 'python', 'django', 'flask', 'fastapi',
  'java', 'spring', 'spring boot', 'springboot', 'c++', 'c#', '.net', 'go', 'golang',
  'rust', 'ruby', 'rails', 'php', 'laravel', 'vue', 'vue.js', 'angular', 'next.js',
  'nextjs', 'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'devops', 'ci/cd',
  'mongodb', 'mongo', 'postgresql', 'postgres', 'mysql', 'sql', 'redis', 'firebase',
  'graphql', 'rest api', 'rest', 'html', 'css', 'tailwind', 'bootstrap', 'solidity',
  'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'scikit-learn', 'data science'
];

const ROLE_KEYWORDS = [
  'frontend', 'backend', 'fullstack', 'full stack', 'developer', 'engineer',
  'lead', 'senior', 'junior', 'intern', 'architect', 'mobile', 'devops', 'data scientist'
];

/**
 * Extracts target tech skills & role signals from a natural language query string.
 * @param {string} query  e.g. "React developer with Docker experience"
 */
function parseNaturalLanguageQuery(query = '') {
  const clean = query.toLowerCase().trim();
  if (!clean) return { targetTechs: [], roles: [], rawQuery: '' };

  const targetTechs = TECH_DICTIONARY.filter((t) => {
    // Escaped word boundary regex check
    const pattern = new RegExp(`(?:^|\\b|\\s)${t.replace('.', '\\.')}(?:$|\\b|\\s)`, 'i');
    return pattern.test(clean);
  });

  const roles = ROLE_KEYWORDS.filter((r) => clean.includes(r));

  return { targetTechs, roles, rawQuery: clean };
}

/**
 * Evaluates semantic match between a candidate and natural language query targets.
 * @param {import('../models/Candidate.js').Candidate} candidate
 * @param {{ targetTechs: string[], roles: string[], rawQuery: string }} parsedQuery
 */
function computeSemanticMatch(candidate, parsedQuery) {
  const { targetTechs, roles, rawQuery } = parsedQuery;
  if (!rawQuery) {
    return {
      matchScore: candidate.aiScore || 70,
      explanation: 'No query provided — default ranking applied based on Talent Score.'
    };
  }

  const candSkillsLower = (candidate.skills || []).map((s) => s.toLowerCase());
  const candText = `${candidate.name} ${candidate.college} ${candidate.skills.join(' ')} ${candidate.importSource}`.toLowerCase();

  // 1. Skill Match Score (Max 50 pts)
  let skillPoints = 0;
  const matchedSkills = [];
  if (targetTechs.length > 0) {
    targetTechs.forEach((tech) => {
      const isMatched = candSkillsLower.some((cs) => cs.includes(tech) || tech.includes(cs));
      if (isMatched) {
        matchedSkills.push(tech);
        skillPoints += 50 / targetTechs.length;
      }
    });
  } else {
    // If no specific tech detected in dictionary, do fuzzy text search against query words
    const queryWords = rawQuery.split(/\s+/).filter((w) => w.length > 2);
    const wordMatches = queryWords.filter((w) => candText.includes(w));
    skillPoints = queryWords.length ? (wordMatches.length / queryWords.length) * 45 : 30;
  }

  // 2. Text Keyword Relevance (Max 25 pts)
  let keywordPoints = 0;
  roles.forEach((r) => {
    if (candText.includes(r)) keywordPoints += 12;
  });
  keywordPoints = Math.min(25, keywordPoints + (matchedSkills.length > 0 ? 10 : 0));

  // 3. Experience & Profile Completeness Bonus (Max 15 pts)
  let expPoints = 0;
  if (candidate.experienceYears != null && candidate.experienceYears > 0) {
    expPoints += Math.min(10, candidate.experienceYears * 3);
  }
  if (candidate.githubUrl || candidate.portfolioUrl) expPoints += 5;

  // 4. Base Quality Score (Max 10 pts)
  const qualityPoints = Math.min(10, (candidate.aiScore || 50) * 0.1);

  const rawScore = skillPoints + keywordPoints + expPoints + qualityPoints;
  const matchScore = Math.min(99, Math.max(20, Math.round(rawScore)));

  // Generate Match Explanation
  let explanation = '';
  if (matchedSkills.length > 0) {
    explanation = `Matched ${matchedSkills.length}/${targetTechs.length || matchedSkills.length} target skills (${matchedSkills.join(', ')})`;
    if (candidate.experienceYears != null) {
      explanation += ` with ${candidate.experienceYears} yr(s) experience.`;
    } else {
      explanation += '.';
    }
  } else if (targetTechs.length > 0) {
    explanation = `Candidate lacks explicit query skills (${targetTechs.join(', ')}), but profile has foundational relevance.`;
  } else {
    explanation = `Semantic text match based on query terms: "${rawQuery}".`;
  }

  return { matchScore, explanation };
}

// ── Smart Candidate Search Orchestrator ───────────────────────────────────────
/**
 * Executes AI Smart Search with natural language parsing + 8 filter criteria.
 */
export async function executeSmartCandidateSearch(hrUserId, params = {}) {
  const {
    query           = '',
    skills          = [],
    minExperience   = null,
    maxExperience   = null,
    college         = '',
    location        = '',
    technology      = '',
    maxSalary       = null,
    graduationYear  = null,
    minTalentScore  = null,
    page            = 1,
    limit           = 25,
    sortBy          = 'semantic_match'
  } = params;

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  // 1. Build MongoDB filter query for exact structured filters
  const mongoFilter = { hrUserId };

  // Filter: Skills (array or string)
  const skillList = Array.isArray(skills)
    ? skills.filter(Boolean)
    : String(skills || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);

  if (skillList.length > 0) {
    mongoFilter.skills = { $all: skillList.map((s) => new RegExp(s, 'i')) };
  }

  // Filter: Technology (keyword filter)
  if (technology && technology.trim()) {
    mongoFilter.skills = { $elemMatch: { $regex: technology.trim(), $options: 'i' } };
  }

  // Filter: Experience Range
  if (minExperience != null || maxExperience != null) {
    mongoFilter.experienceYears = {};
    if (minExperience != null && !isNaN(parseFloat(minExperience))) {
      mongoFilter.experienceYears.$gte = parseFloat(minExperience);
    }
    if (maxExperience != null && !isNaN(parseFloat(maxExperience))) {
      mongoFilter.experienceYears.$lte = parseFloat(maxExperience);
    }
  }

  // Filter: College
  if (college && college.trim()) {
    mongoFilter.college = new RegExp(college.trim(), 'i');
  }

  // Filter: Location
  if (location && location.trim()) {
    mongoFilter.location = new RegExp(location.trim(), 'i');
  }

  // Filter: Graduation Year
  if (graduationYear && !isNaN(parseInt(graduationYear, 10))) {
    mongoFilter.graduationYear = parseInt(graduationYear, 10);
  }

  // Filter: Expected Salary
  if (maxSalary != null && !isNaN(parseFloat(maxSalary))) {
    mongoFilter.expectedSalary = { $lte: parseFloat(maxSalary) };
  }

  // Filter: Min Talent Score
  if (minTalentScore != null && !isNaN(parseFloat(minTalentScore))) {
    mongoFilter.aiScore = { $gte: parseFloat(minTalentScore) };
  }

  // 2. Fetch all matching candidate documents for semantic scoring
  const rawCandidates = await Candidate.find(mongoFilter).lean();

  // 3. Parse natural language query
  const parsedQuery = parseNaturalLanguageQuery(query);

  // 4. Compute Semantic Match Score for each candidate
  let scoredCandidates = rawCandidates.map((c) => {
    const { matchScore, explanation } = computeSemanticMatch(c, parsedQuery);
    return {
      id:              c._id.toString(),
      name:            c.name,
      email:           c.email,
      skills:          c.skills || [],
      college:         c.college || '',
      graduationYear:  c.graduationYear,
      experienceYears: c.experienceYears,
      location:        c.location || '',
      expectedSalary:  c.expectedSalary,
      status:          c.status,
      aiScore:         c.aiScore ?? 0,
      jdMatchScore:    c.jdMatchScore ?? 0,
      semanticMatch:   matchScore,
      matchExplanation: explanation,
      resumeUrl:       c.resumeUrl,
      githubUrl:       c.githubUrl,
      linkedinUrl:     c.linkedinUrl,
      portfolioUrl:    c.portfolioUrl,
      createdAt:       c.createdAt
    };
  });

  // 5. Apply Sorting
  switch (sortBy) {
    case 'talent_score':
      scoredCandidates.sort((a, b) => b.aiScore - a.aiScore);
      break;
    case 'experience':
      scoredCandidates.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
      break;
    case 'expected_salary':
      scoredCandidates.sort((a, b) => (a.expectedSalary ?? Infinity) - (b.expectedSalary ?? Infinity));
      break;
    case 'recently_added':
      scoredCandidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'semantic_match':
    default:
      scoredCandidates.sort((a, b) => b.semanticMatch - a.semanticMatch || b.aiScore - a.aiScore);
      break;
  }

  // 6. Paginate results
  const total = scoredCandidates.length;
  const paginatedCandidates = scoredCandidates.slice(skip, skip + limitNum);

  return {
    query: query.trim(),
    parsedTargets: parsedQuery.targetTechs,
    candidates: paginatedCandidates,
    pagination: {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
}
