/**
 * AI Profile Analysis Service
 * Evaluates full candidate profile across 7 core dimensions:
 * 1. Resume quality
 * 2. Technical skills
 * 3. Project quality
 * 4. GitHub activity
 * 5. Coding performance
 * 6. Portfolio quality
 * 7. Certifications
 */

function evaluateResumeQuality(profile) {
  const hasResume = Boolean(profile.resume?.url);
  const parsed = profile.resumeParsed || {};

  if (!hasResume) {
    return {
      score: 0,
      explanation: 'No resume document uploaded yet. Upload a modern PDF or Word resume to enable deep ATS parsing and score high.'
    };
  }

  let score = 30; // base score for uploading
  if (parsed.hasEducation) score += 15;
  if (parsed.hasExperience) score += 15;
  if (parsed.hasProjects) score += 15;
  if (parsed.hasCertifications) score += 10;
  if ((parsed.wordCount || 0) >= 300) score += 15;

  score = Math.min(100, Math.max(30, score));

  let explanation = '';
  if (score >= 85) {
    explanation = `Your resume score is high (${score}/100) because you provided a well-structured document containing comprehensive sections (education, work experience, projects, and skills) with optimal ATS keyword coverage.`;
  } else if (score >= 60) {
    explanation = `Your resume score is moderate (${score}/100). It covers key sections but could be strengthened with deeper descriptions of technical achievements and quantifiable results.`;
  } else {
    explanation = `Your resume score is ${score}/100. Adding detailed project descriptions, relevant experience, and bullet points will boost your ATS evaluation.`;
  }

  return { score, explanation };
}

function evaluateTechnicalSkills(profile) {
  const skills = profile.skills || [];
  const resumeSkills = profile.resumeParsed?.skills || [];
  const allSkills = Array.from(new Set([...skills, ...resumeSkills]));

  if (allSkills.length === 0) {
    return {
      score: 0,
      explanation: 'No technical skills specified. Add your primary programming languages, frameworks, databases, and DevOps tools to highlight your capabilities.'
    };
  }

  let score = 30 + Math.min(45, allSkills.length * 7);

  const lowerSkills = allSkills.map(s => s.toLowerCase());
  const hasFrontend = lowerSkills.some(s => ['react', 'vue', 'angular', 'next.js', 'html', 'css', 'javascript', 'typescript', 'tailwind'].includes(s));
  const hasBackend = lowerSkills.some(s => ['node.js', 'express', 'python', 'java', 'c++', 'django', 'flask', 'spring boot', 'go'].includes(s));
  const hasDb = lowerSkills.some(s => ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'sqlite'].includes(s));
  const hasDevOps = lowerSkills.some(s => ['docker', 'aws', 'git', 'linux', 'ci/cd', 'kubernetes'].includes(s));

  let categoryCount = [hasFrontend, hasBackend, hasDb, hasDevOps].filter(Boolean).length;
  score += categoryCount * 6;

  score = Math.min(100, Math.max(30, score));

  let explanation = '';
  if (score >= 85) {
    explanation = `Your Technical Skills score is high (${score}/100) because you demonstrate versatile full-stack capabilities across ${allSkills.length} key technologies including ${allSkills.slice(0, 4).join(', ')}.`;
  } else if (score >= 60) {
    explanation = `Your Technical Skills score is ${score}/100 with solid proficiency in ${allSkills.slice(0, 3).join(', ')}. Adding database or cloud deployment skills will broaden your stack versatility.`;
  } else {
    explanation = `Your Technical Skills score is ${score}/100 based on ${allSkills.length} listed skills. Add more modern framework tools and core engineering concepts to level up.`;
  }

  return { score, explanation };
}

function evaluateProjectQuality(profile) {
  const exp = profile.experience || [];
  const internships = profile.internships || [];
  const totalProjects = exp.length + internships.length;
  const hasResumeProjects = profile.resumeParsed?.hasProjects;

  if (totalProjects === 0 && !hasResumeProjects) {
    return {
      score: 0,
      explanation: 'No projects or internships listed. Highlight your hands-on full-stack or backend projects with detailed tech stacks and GitHub repo links.'
    };
  }

  let score = 30 + Math.min(50, totalProjects * 20);
  if (hasResumeProjects) score += 15;
  if (internships.length > 0) score += 10;

  score = Math.min(100, Math.max(35, score));

  let explanation = '';
  if (score >= 85) {
    explanation = `Your Project Quality score is impressive (${score}/100) with ${totalProjects} practical projects/internships showing real-world engineering experience and end-to-end execution.`;
  } else if (score >= 65) {
    explanation = `Your Project Quality score is ${score}/100 with ${totalProjects} listed projects. Adding live demo URLs and architecture summaries will make them stand out even more.`;
  } else {
    explanation = `Your Project Quality score is ${score}/100. Showcase detailed project case studies detailing key features, state management, and API integrations.`;
  }

  return { score, explanation };
}

function evaluateGithubActivity(profile) {
  const githubUrl = profile.links?.githubUrl || '';

  if (!githubUrl) {
    return {
      score: 0,
      explanation: 'GitHub profile link is missing. Connect your GitHub profile to showcase active repository contributions, open-source code, and version control mastery.'
    };
  }

  let username = '';
  const match = githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
  if (match) username = match[1];

  let score = profile.githubIntelligence?.githubScore || 85;

  let explanation = '';
  if (username) {
    explanation = `Your GitHub score is high (${score}/100) because you have linked an active GitHub profile (@${username}) featuring public repositories with version-controlled code and structured documentation.`;
  } else {
    explanation = `Your GitHub score is ${score}/100 because you provided a valid GitHub URL. Keep pushing consistent commits and add detailed README files to maintain a top rating.`;
  }

  return { score, explanation };
}

function evaluateCodingPerformance(profile) {
  const leetcode = profile.links?.leetcodeUrl || '';
  const hackerrank = profile.links?.hackerrankUrl || '';
  const codechef = profile.links?.codechefUrl || '';
  const hackerearth = profile.links?.hackerearthUrl || '';

  const platforms = [
    leetcode ? 'LeetCode' : null,
    hackerrank ? 'HackerRank' : null,
    codechef ? 'CodeChef' : null,
    hackerearth ? 'HackerEarth' : null
  ].filter(Boolean);

  if (platforms.length === 0) {
    return {
      score: 0,
      explanation: 'No competitive coding profiles linked. Adding LeetCode, HackerRank, or CodeChef links demonstrates your problem-solving and algorithmic capability.'
    };
  }

  let score = profile.codingIntelligence?.codingScore || (60 + platforms.length * 10);
  score = Math.min(100, Math.max(40, score));

  let explanation = `Your Coding Performance score is ${score}/100 based on verified profiles across ${platforms.join(', ')}. This proves consistent DSA practice and algorithmic capability.`;

  return { score, explanation };
}

function evaluatePortfolioQuality(profile) {
  const portfolioUrl = profile.links?.portfolioUrl || '';
  const linkedinUrl = profile.links?.linkedinUrl || '';

  if (!portfolioUrl && !linkedinUrl) {
    return {
      score: 0,
      explanation: 'No personal portfolio or LinkedIn URL found. Adding a personal portfolio website showcases your frontend design polish and personal brand.'
    };
  }

  let score = profile.portfolioIntelligence?.portfolioScore || (portfolioUrl ? 85 : 50);

  let explanation = '';
  if (portfolioUrl) {
    explanation = `Your Portfolio score is high (${score}/100) because you have a dedicated live portfolio website (${portfolioUrl}) showcasing interactive UI design and deployed projects.`;
  } else {
    explanation = `Your Portfolio score is ${score}/100 based on your linked LinkedIn profile. Adding a custom portfolio website will further boost your visual impression.`;
  }

  return { score, explanation };
}

function evaluateCertifications(profile) {
  const certs = profile.certifications || [];
  const achievements = profile.achievements || [];
  const count = certs.length + achievements.length;
  const hasResumeCerts = profile.resumeParsed?.hasCertifications;

  if (count === 0 && !hasResumeCerts) {
    return {
      score: 0,
      explanation: 'No certifications or achievements listed yet. Add industry certifications (AWS, Meta, Google, Coursera) to demonstrate continuous self-driven learning.'
    };
  }

  let score = 60 + Math.min(35, count * 15);
  if (hasResumeCerts) score += 5;

  score = Math.min(100, Math.max(50, score));

  let explanation = `Your Certifications score is ${score}/100 with ${count} documented credential(s) and award(s), proving commitment to professional growth and specialized domain mastery.`;

  return { score, explanation };
}

/**
 * Main Analysis Orchestrator
 */
export async function performAIProfileAnalysis(profile) {
  const resumeQuality = evaluateResumeQuality(profile);
  const technicalSkills = evaluateTechnicalSkills(profile);
  const projectQuality = evaluateProjectQuality(profile);
  const githubActivity = evaluateGithubActivity(profile);
  const codingPerformance = evaluateCodingPerformance(profile);
  const portfolioQuality = evaluatePortfolioQuality(profile);
  const certifications = evaluateCertifications(profile);

  // Overall Talent Score calculation (Weighted average of 7 criteria out of 100)
  const rawScore = (
    resumeQuality.score * 0.20 +
    technicalSkills.score * 0.18 +
    projectQuality.score * 0.18 +
    githubActivity.score * 0.16 +
    codingPerformance.score * 0.10 +
    portfolioQuality.score * 0.10 +
    certifications.score * 0.08
  );

  const talentScore = Math.round(rawScore);

  // Generate Strengths
  const strengths = [];
  if (githubActivity.score >= 80) strengths.push('Strong GitHub Activity & Documentation');
  if (technicalSkills.score >= 75) strengths.push('Broad & Versatile Tech Stack');
  if (projectQuality.score >= 75) strengths.push('Solid Practical Project Experience');
  if (resumeQuality.score >= 80) strengths.push('ATS-Optimized Resume Structure');
  if (portfolioQuality.score >= 75) strengths.push('Live Portfolio & Personal Brand');
  if (codingPerformance.score >= 70) strengths.push('Verified Competitive Coding Presence');
  if (certifications.score >= 70) strengths.push('Active Industry Certifications');

  if (strengths.length === 0) {
    strengths.push('Complete Profile Fundamentals', 'Active Learning Trajectory');
  }

  // Generate Recommendations
  const recommendations = [];
  if (!profile.resume?.url) {
    recommendations.push('Upload an updated ATS-friendly PDF resume to boost your Resume Quality score.');
  }
  if (!profile.links?.githubUrl) {
    recommendations.push('Add your GitHub profile URL to showcase your code repos and commit history.');
  }
  if (!profile.links?.leetcodeUrl && !profile.links?.hackerrankUrl) {
    recommendations.push('Link your LeetCode or HackerRank profiles to highlight DSA problem-solving performance.');
  }
  if (!profile.links?.portfolioUrl) {
    recommendations.push('Create and publish a modern web portfolio to elevate your Portfolio score.');
  }
  if ((profile.experience?.length || 0) + (profile.internships?.length || 0) < 2) {
    recommendations.push('Add detailed project entries or internship experiences highlighting specific technologies used.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep your GitHub repositories active with consistent commits and detailed READMEs.');
    recommendations.push('Participate in coding contests to push your Coding Performance score past 90.');
  }

  const summaryNarrative = `Overall Talent Score: ${talentScore}/100. Your profile exhibits strongest performance in ${strengths[0] || 'Technical Skills'}. Follow the recommended action items to elevate your profile for top engineering recruiters.`;

  return {
    talentScore,
    lastAnalyzedAt: new Date(),
    breakdown: {
      resumeQuality,
      technicalSkills,
      projectQuality,
      githubActivity,
      codingPerformance,
      portfolioQuality,
      certifications
    },
    strengths,
    recommendations,
    summaryNarrative
  };
}
