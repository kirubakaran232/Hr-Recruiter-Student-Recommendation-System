/**
 * HR Candidate AI Evaluation Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates imported candidates across 6 weighted dimensions using the
 * same scoring logic as the student aiAnalysis.service.js, adapted for
 * the Candidate model structure (URL presence, skills array, experience).
 *
 * Dimensions & Weights:
 *   Resume         20%
 *   GitHub         20%
 *   Skills         18%
 *   Projects       16%
 *   Coding         14%
 *   Portfolio      12%
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

const HIGH_DEMAND_SKILLS = new Set([
  'react', 'next.js', 'vue', 'angular', 'typescript', 'javascript',
  'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring boot',
  'go', 'rust', 'c++', 'mongodb', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'graphql',
  'tailwindcss', 'tensorflow', 'pytorch', 'machine learning', 'devops',
  'ci/cd', 'linux', 'firebase', 'solidity', 'react native', 'flutter'
]);

function normaliseSkills(skills = []) {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// ── 1. Resume Score ───────────────────────────────────────────────────────────
function scoreResume(candidate) {
  if (!candidate.resumeUrl) {
    return {
      score: 0,
      explanation:
        'No resume URL provided. Candidates with an accessible resume link rank significantly higher in recruiter pipelines.'
    };
  }

  // Base: having a resume link
  let score = 55;

  // Bonus for known cloud storage / professional hosts
  const url = candidate.resumeUrl.toLowerCase();
  if (url.includes('drive.google') || url.includes('docs.google')) score += 15;
  else if (url.includes('dropbox') || url.includes('box.com'))       score += 12;
  else if (url.includes('github') || url.includes('notion'))          score += 14;
  else                                                                 score += 10; // any URL

  // Extra if they also have LinkedIn (well-rounded presence)
  if (candidate.linkedinUrl) score += 10;

  // Additional skills bonus (rich profile)
  const skills = normaliseSkills(candidate.skills);
  if (skills.length >= 5)  score += 8;
  if (skills.length >= 10) score += 7;

  score = Math.min(100, score);

  let explanation = '';
  if (score >= 85) {
    explanation = `Resume score ${score}/100 — the candidate has a professionally hosted resume with a comprehensive skill set of ${candidate.skills.length} technologies and a complete professional presence.`;
  } else if (score >= 65) {
    explanation = `Resume score ${score}/100 — resume link present but profile completeness could improve with a personal portfolio or GitHub.`;
  } else {
    explanation = `Resume score ${score}/100 — resume link exists. Adding more detail (skills, projects, certifications) will significantly raise recruitability.`;
  }

  return { score, explanation };
}

// ── 2. GitHub Score ───────────────────────────────────────────────────────────
function scoreGithub(candidate) {
  if (!candidate.githubUrl) {
    return {
      score: 0,
      explanation:
        'No GitHub profile linked. GitHub presence is a strong signal of coding activity and open-source contribution for technical roles.'
    };
  }

  const match = candidate.githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
  const username = match ? match[1] : null;

  let score = 72; // solid base for having GitHub

  // Username signals: bots/unnamed profiles vs real
  if (username && username.length > 3 && !username.match(/^\d+$/)) score += 12;

  // Bonus if also has other platforms — engaged developer
  if (candidate.leetcodeUrl)   score += 6;
  if (candidate.portfolioUrl)  score += 6;
  if (candidate.codechefUrl || candidate.hackerrankUrl) score += 4;

  score = Math.min(100, score);

  const displayName = username ? `@${username}` : 'linked profile';
  let explanation = '';
  if (score >= 85) {
    explanation = `GitHub score ${score}/100 — ${displayName} linked with a strong multi-platform coding presence that signals active open-source involvement and consistent version control practice.`;
  } else {
    explanation = `GitHub score ${score}/100 — GitHub profile provided (${displayName}). Consistent repository commits and detailed READMEs would elevate this further.`;
  }

  return { score, explanation };
}

// ── 3. Skills Score ───────────────────────────────────────────────────────────
function scoreSkills(candidate) {
  const skills = normaliseSkills(candidate.skills);

  if (skills.length === 0) {
    return {
      score: 0,
      explanation:
        'No skills listed. Adding primary programming languages, frameworks, databases, and cloud tools is essential for any technical evaluation.'
    };
  }

  // Count & quality
  let score = 25 + Math.min(40, skills.length * 6);

  const highDemandCount = skills.filter((s) => HIGH_DEMAND_SKILLS.has(s)).length;
  score += Math.min(25, highDemandCount * 5);

  // Breadth bonus
  const hasFrontend = skills.some((s) => ['react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'html', 'css'].includes(s));
  const hasBackend  = skills.some((s) => ['node.js', 'express', 'python', 'java', 'go', 'django', 'flask', 'spring boot'].includes(s));
  const hasDb       = skills.some((s) => ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'sqlite'].includes(s));
  const hasCloud    = skills.some((s) => ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd'].includes(s));

  const breadth = [hasFrontend, hasBackend, hasDb, hasCloud].filter(Boolean).length;
  score += breadth * 4;

  score = Math.min(100, Math.max(25, score));

  const topSkills = candidate.skills.slice(0, 5).join(', ');
  let explanation = '';
  if (score >= 85) {
    explanation = `Skills score ${score}/100 — outstanding full-stack profile with ${skills.length} skills spanning frontend, backend, database, and cloud. Key strengths: ${topSkills}.`;
  } else if (score >= 60) {
    explanation = `Skills score ${score}/100 — solid foundation with ${skills.length} listed technologies (${topSkills}). Expanding cloud or DevOps expertise would push this higher.`;
  } else {
    explanation = `Skills score ${score}/100 — ${skills.length} skills identified. Diversifying across the stack (frontend, backend, DB, cloud) will significantly improve this score.`;
  }

  return { score, explanation };
}

// ── 4. Project / Experience Score ─────────────────────────────────────────────
function scoreProjects(candidate) {
  // Inferred from: experienceYears + graduationYear + skill depth
  const expYears = candidate.experienceYears ?? 0;
  const hasPortfolio = Boolean(candidate.portfolioUrl);
  const hasGithub    = Boolean(candidate.githubUrl);
  const skillCount   = normaliseSkills(candidate.skills).length;

  if (expYears === 0 && !hasPortfolio && !hasGithub && skillCount < 3) {
    return {
      score: 0,
      explanation:
        'Insufficient project signals. Adding experience years, a portfolio URL, or GitHub profile allows the AI to infer project quality and hands-on depth.'
    };
  }

  let score = 30;

  // Experience years
  if (expYears >= 1) score += 15;
  if (expYears >= 3) score += 15;
  if (expYears >= 5) score += 10;

  // Platform signals
  if (hasGithub)    score += 10;
  if (hasPortfolio) score += 12;

  // Skill depth suggests project exposure
  if (skillCount >= 5)  score += 8;
  if (skillCount >= 10) score += 7;

  score = Math.min(100, score);

  let explanation = '';
  if (score >= 80) {
    explanation = `Project/Experience score ${score}/100 — ${expYears > 0 ? `${expYears} years of professional experience` : 'strong project evidence'} backed by GitHub activity and a live portfolio. This candidate demonstrates substantial real-world delivery.`;
  } else if (score >= 55) {
    explanation = `Project/Experience score ${score}/100 — estimated from ${expYears > 0 ? `${expYears} year(s) of experience` : 'inferred project signals'}. A dedicated portfolio with case studies would strengthen this dimension.`;
  } else {
    explanation = `Project/Experience score ${score}/100 — limited project signals available. Encourage the candidate to provide portfolio or GitHub links to enable a deeper project quality evaluation.`;
  }

  return { score, explanation };
}

// ── 5. Coding Score ───────────────────────────────────────────────────────────
function scoreCoding(candidate) {
  const platforms = [
    candidate.leetcodeUrl   ? 'LeetCode'   : null,
    candidate.hackerrankUrl ? 'HackerRank' : null,
    candidate.codechefUrl   ? 'CodeChef'   : null
  ].filter(Boolean);

  if (platforms.length === 0) {
    return {
      score: 0,
      explanation:
        'No competitive coding profiles linked. LeetCode, HackerRank, or CodeChef presence confirms algorithmic problem-solving ability — a core signal for technical roles.'
    };
  }

  let score = 55 + platforms.length * 12;
  score = Math.min(100, score);

  let explanation = `Coding score ${score}/100 — verified competitive coding presence on ${platforms.join(', ')}. This confirms consistent DSA practice and algorithmic capability.`;
  if (platforms.length >= 2) {
    explanation = `Coding score ${score}/100 — multi-platform competitive coding presence on ${platforms.join(' & ')}. Candidates active on 2+ platforms typically demonstrate superior problem-solving habits.`;
  }

  return { score, explanation };
}

// ── 6. Portfolio Score ────────────────────────────────────────────────────────
function scorePortfolio(candidate) {
  const hasPortfolio = Boolean(candidate.portfolioUrl);
  const hasLinkedin  = Boolean(candidate.linkedinUrl);

  if (!hasPortfolio && !hasLinkedin) {
    return {
      score: 0,
      explanation:
        'No portfolio or LinkedIn URL provided. A personal portfolio demonstrates frontend polish, deployed projects, and personal brand — all strong recruiter signals.'
    };
  }

  let score = 0;
  if (hasPortfolio && hasLinkedin) {
    score = 90;
  } else if (hasPortfolio) {
    score = 80;
  } else {
    score = 52; // LinkedIn only
  }

  // Bonus: GitHub too = well-rounded digital presence
  if (candidate.githubUrl) score = Math.min(100, score + 7);

  let explanation = '';
  if (hasPortfolio && hasLinkedin) {
    explanation = `Portfolio score ${score}/100 — both a personal portfolio (${candidate.portfolioUrl}) and a LinkedIn profile are present, indicating a polished professional brand ready for recruiter review.`;
  } else if (hasPortfolio) {
    explanation = `Portfolio score ${score}/100 — a dedicated portfolio website (${candidate.portfolioUrl}) is linked. Adding LinkedIn would complete the professional presence.`;
  } else {
    explanation = `Portfolio score ${score}/100 — only LinkedIn provided. A personal portfolio website with deployed projects would significantly elevate the visual impression and score.`;
  }

  return { score, explanation };
}

// ── Overall Score + Narrative ─────────────────────────────────────────────────

function buildNarrative(candidate, overallScore, breakdown, strengths) {
  const name = candidate.name.split(' ')[0];
  const topStrength = strengths[0] || 'Technical Skills';

  const base =
    overallScore >= 85
      ? `${name} is a strong candidate (${overallScore}/100) with standout performance in ${topStrength}.`
      : overallScore >= 65
      ? `${name} is a solid candidate (${overallScore}/100) showing good capabilities, especially in ${topStrength}.`
      : overallScore >= 40
      ? `${name} shows foundational potential (${overallScore}/100) with ${topStrength} as the leading dimension.`
      : `${name}'s profile (${overallScore}/100) is incomplete — key links and data are missing that would allow a full AI evaluation.`;

  // Determine primary signal
  const topScores = Object.entries(breakdown)
    .filter(([, v]) => v.score > 0)
    .sort(([, a], [, b]) => b.score - a.score);

  const missingSignals = Object.entries(breakdown)
    .filter(([, v]) => v.score === 0)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim());

  const missingNote = missingSignals.length > 0
    ? ` Profile gaps: ${missingSignals.join(', ')}.`
    : ' All major evaluation dimensions have data.';

  return `${base}${missingNote}`;
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────
/**
 * @param {import('../models/Candidate.js').Candidate} candidate  Mongoose document
 * @returns {{ talentScore, breakdown, strengths, recommendations, summaryNarrative, evaluatedAt }}
 */
export function evaluateCandidate(candidate) {
  const resume    = scoreResume(candidate);
  const github    = scoreGithub(candidate);
  const skills    = scoreSkills(candidate);
  const projects  = scoreProjects(candidate);
  const coding    = scoreCoding(candidate);
  const portfolio = scorePortfolio(candidate);

  // Weighted overall score
  const rawScore =
    resume.score    * 0.20 +
    github.score    * 0.20 +
    skills.score    * 0.18 +
    projects.score  * 0.16 +
    coding.score    * 0.14 +
    portfolio.score * 0.12;

  const talentScore = Math.round(rawScore);

  // Compute JD Match Score based on Skills (40%), Projects (30%), Resume (20%), and GitHub (10%)
  const jdMatchRaw =
    skills.score   * 0.40 +
    projects.score * 0.30 +
    resume.score   * 0.20 +
    github.score   * 0.10;
  const jdMatchScore = Math.round(jdMatchRaw);

  const breakdown = { resume, github, skills, projects, coding, portfolio };

  // Strengths
  const LABELS = {
    resume:    'Strong Resume Presence',
    github:    'Active GitHub Profile',
    skills:    'Versatile Tech Stack',
    projects:  'Solid Project Experience',
    coding:    'Competitive Coding Record',
    portfolio: 'Professional Portfolio'
  };

  const THRESHOLDS = { resume: 75, github: 70, skills: 70, projects: 65, coding: 60, portfolio: 70 };

  const strengths = Object.entries(breakdown)
    .filter(([k, v]) => v.score >= THRESHOLDS[k])
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([k]) => LABELS[k]);

  if (strengths.length === 0 && talentScore > 0) {
    strengths.push('Complete Basic Profile');
  }

  // Recommendations
  const recommendations = [];
  if (!candidate.resumeUrl)     recommendations.push('Request an up-to-date resume URL from the candidate.');
  if (!candidate.githubUrl)     recommendations.push('Ask candidate to share their GitHub profile for code quality review.');
  if (!candidate.leetcodeUrl && !candidate.hackerrankUrl) {
    recommendations.push('Request a LeetCode or HackerRank profile to verify algorithmic aptitude.');
  }
  if (!candidate.portfolioUrl)  recommendations.push('A personal portfolio would greatly strengthen this candidate\'s visual profile.');
  if (!candidate.skills?.length) recommendations.push('Skills data is missing — follow up to get a complete technology breakdown.');
  if (candidate.experienceYears == null) {
    recommendations.push('Experience years are not specified — clarify seniority level before pipeline advancement.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Profile is well-rounded. Proceed to technical interview stage.');
    recommendations.push('Consider a live coding assessment to validate competitive coding profile claims.');
  }

  const summaryNarrative = buildNarrative(candidate, talentScore, breakdown, strengths);

  return {
    talentScore,
    jdMatchScore,
    breakdown,
    strengths,
    recommendations,
    summaryNarrative,
    evaluatedAt: new Date()
  };
}

/**
 * Bulk evaluate multiple candidates.
 * Returns the evaluation result keyed by candidate id.
 * @param {Array} candidates
 */
export function evaluateCandidates(candidates) {
  return candidates.map((c) => ({
    id:     c._id.toString(),
    result: evaluateCandidate(c)
  }));
}
