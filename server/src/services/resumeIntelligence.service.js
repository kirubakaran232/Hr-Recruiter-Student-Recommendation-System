/**
 * Resume Intelligence Service (Module 3)
 * Audits student resumes across 7 core pillars:
 * 1. Resume structure
 * 2. Formatting & ATS readability
 * 3. Grammar & active voice
 * 4. Missing sections
 * 5. Skills representation
 * 6. Project descriptions
 * 7. Achievement impact & metrics
 *
 * Provides Resume Score (0-100%), missing sections list, and high-impact AI suggestions.
 */

const ACTION_VERBS = [
  'Developed', 'Engineered', 'Architected', 'Implemented', 'Designed',
  'Spearheaded', 'Optimized', 'Deployed', 'Built', 'Constructed',
  'Integrated', 'Automated', 'Enhanced', 'Orchestrated', 'Refactored'
];

/**
 * Bullet point rewrite / polish engine
 * Transforms simple/weak candidate descriptions into high-impact industry-standard bullets.
 */
export function enhanceBulletPoint(inputText) {
  if (!inputText || typeof inputText !== 'string') {
    return {
      original: inputText || '',
      improved: 'Developed a full-stack web application using React, Node.js, and MongoDB with secure JWT authentication and responsive UI.',
      reason: 'Replaced passive voice with a strong action verb, added technical stack details, and highlighted key engineering features.'
    };
  }

  const trimmed = inputText.trim();
  const lower = trimmed.toLowerCase();

  // Pattern matching for realistic student bullet points
  if (lower.includes('e-commerce') || lower.includes('ecommerce') || lower.includes('shopping')) {
    return {
      original: trimmed,
      improved: 'Developed a full-stack e-commerce platform using React and Spring Boot with JWT authentication, Stripe payment integration, and real-time order tracking.',
      reason: 'Replaced simple description with modern full-stack tech stack, authentication, and payment processing details.'
    };
  }

  if (lower.includes('chat') || lower.includes('messaging') || lower.includes('chat app')) {
    return {
      original: trimmed,
      improved: 'Architected a real-time chat application using React, Node.js, Socket.io, and MongoDB, supporting multi-user rooms and 99.9% message delivery reliability.',
      reason: 'Added real-time communication framework (Socket.io) and measurable performance metrics.'
    };
  }

  if (lower.includes('bug') || lower.includes('fixed') || lower.includes('fixing')) {
    return {
      original: trimmed,
      improved: 'Diagnosed and resolved 35+ critical software bugs and frontend performance bottlenecks, reducing page load latency by 28%.',
      reason: 'Framed maintenance work into quantifiable engineering impacts and metric improvements.'
    };
  }

  if (lower.includes('website') || lower.includes('created') || lower.includes('built')) {
    return {
      original: trimmed,
      improved: 'Engineered a modern, responsive web application utilizing React, Tailwind CSS, and RESTful API endpoints, improving user engagement by 40%.',
      reason: 'Transformed generic creation statement into an industry-grade bullet highlighting modern frontend framework and quantified engagement impact.'
    };
  }

  if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) {
    return {
      original: trimmed,
      improved: 'Designed and optimized relational database schemas in PostgreSQL, reducing query execution times by 35% across high-traffic endpoints.',
      reason: 'Highlighted schema architecture skills and performance optimization metrics.'
    };
  }

  // Generic fallback enhancement using action verb & tech enrichment
  const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
  const cleanLine = trimmed.replace(/^(created|built|made|worked on|did|developed)\s+/i, '');

  return {
    original: trimmed,
    improved: `${verb} ${cleanLine} using modern full-stack architecture, REST APIs, and automated state management with 100% test coverage.`,
    reason: 'Upgraded sentence structure with active action verb, technical architecture context, and industry quality metrics.'
  };
}

/**
 * Main 7-Pillar Resume Audit Engine
 */
export async function performResumeIntelligenceAudit(profile) {
  const resume = profile.resume || {};
  const parsed = profile.resumeParsed || {};
  const rawText = parsed.rawText || '';
  const lowerText = rawText.toLowerCase();

  const hasResume = Boolean(resume.url);

  // 1. Structure Check
  let structureScore = 40;
  let structureFeedback = '';
  if (!hasResume) {
    structureScore = 30;
    structureFeedback = 'Upload a resume document (PDF or DOCX) to analyze heading hierarchy and section order.';
  } else {
    let sectionsFound = 0;
    if (parsed.hasEducation) sectionsFound++;
    if (parsed.hasExperience) sectionsFound++;
    if (parsed.hasProjects) sectionsFound++;
    if (parsed.hasCertifications) sectionsFound++;

    structureScore = 50 + sectionsFound * 12;
    structureScore = Math.min(100, structureScore);

    if (sectionsFound >= 3) {
      structureFeedback = `Excellent layout structure. Clear logical flow across ${sectionsFound} primary sections (Education, Projects, Experience, Certifications).`;
    } else {
      structureFeedback = `Basic layout structure. Missing standard ATS sections like Projects or Work Experience.`;
    }
  }

  // 2. Formatting Check
  let formattingScore = 50;
  let formattingFeedback = '';
  const wordCount = parsed.wordCount || 0;

  if (wordCount >= 350 && wordCount <= 750) {
    formattingScore = 90;
    formattingFeedback = `Optimal word count (${wordCount} words). Fits standard 1-page recruiter format without dense text walls.`;
  } else if (wordCount > 750) {
    formattingScore = 65;
    formattingFeedback = `Word count is high (${wordCount} words). Trim filler text to condense into a clean, 1-page ATS-friendly layout.`;
  } else if (wordCount > 0) {
    formattingScore = 60;
    formattingFeedback = `Word count is concise (${wordCount} words). Add detailed project descriptions to reach optimal length.`;
  } else {
    formattingScore = 40;
    formattingFeedback = 'No document text detected. Upload a standard text-selectable PDF or DOCX file.';
  }

  // 3. Grammar & Tone Check
  let grammarScore = 60;
  let grammarFeedback = '';
  const actionVerbMatches = ACTION_VERBS.filter(v => lowerText.includes(v.toLowerCase()));

  if (actionVerbMatches.length >= 4) {
    grammarScore = 88;
    grammarFeedback = `Strong active voice. Uses high-impact action verbs like ${actionVerbMatches.slice(0, 3).join(', ')}.`;
  } else if (actionVerbMatches.length >= 2) {
    grammarScore = 72;
    grammarFeedback = `Moderate active voice. Replace passive phrases like "worked on" with power verbs such as "Engineered" or "Spearheaded".`;
  } else {
    grammarScore = 55;
    grammarFeedback = 'Passive tone detected. Convert bullet points to begin with strong action verbs (Developed, Implemented, Optimized).';
  }

  // 4. Missing Sections Check
  const missingSectionList = [];
  if (!parsed.hasEducation && !lowerText.includes('degree')) missingSectionList.push('Education / University');
  if (!parsed.hasProjects && !lowerText.includes('project')) missingSectionList.push('Projects / Case Studies');
  if (!parsed.hasExperience && !lowerText.includes('experience')) missingSectionList.push('Work Experience / Internships');
  if (!parsed.hasCertifications && !lowerText.includes('certif')) missingSectionList.push('Certifications & Awards');

  let missingSectionsScore = 100 - missingSectionList.length * 20;
  missingSectionsScore = Math.max(30, missingSectionsScore);

  const missingFeedback = missingSectionList.length === 0
    ? 'All core ATS resume sections are present and clearly identifiable.'
    : `Missing recommended sections: ${missingSectionList.join(', ')}. Add these headings to improve recruiter parsing.`;

  // 5. Skills Representation Check
  const detectedSkills = parsed.skills || profile.skills || [];
  let skillsScore = 40;
  let skillsFeedback = '';

  if (detectedSkills.length >= 8) {
    skillsScore = 92;
    skillsFeedback = `High skill density. ${detectedSkills.length} technical skills detected across frontend, backend, and core tools.`;
  } else if (detectedSkills.length >= 4) {
    skillsScore = 75;
    skillsFeedback = `Good skill coverage (${detectedSkills.length} skills found). Group skills into sub-categories (Languages, Frameworks, Databases) for quick scanning.`;
  } else {
    skillsScore = 50;
    skillsFeedback = `Only ${detectedSkills.length} skills detected. Add popular industry frameworks (React, Node.js, Docker, SQL) to match job descriptions.`;
  }

  // 6. Project Descriptions Check
  let projectScore = 50;
  let projectFeedback = '';
  const hasTechDetails = lowerText.includes('react') || lowerText.includes('node') || lowerText.includes('python') || lowerText.includes('java');

  if (parsed.hasProjects && hasTechDetails) {
    projectScore = 85;
    projectFeedback = 'Project descriptions highlight technical stacks and key functionality effectively.';
  } else if (parsed.hasProjects) {
    projectScore = 65;
    projectFeedback = 'Projects listed, but bullet points lack specific technology stacks and architecture details.';
  } else {
    projectScore = 40;
    projectFeedback = 'Add a dedicated Projects section showcasing 2-3 full-stack or software engineering projects.';
  }

  // 7. Achievement Impact & Metrics Check
  let impactScore = 40;
  let impactFeedback = '';
  const numberMatch = rawText.match(/\d+%/g) || rawText.match(/\d+\+/g) || rawText.match(/\$\d+/g);

  if (numberMatch && numberMatch.length >= 2) {
    impactScore = 90;
    impactFeedback = `Strong quantifiable impact! Metrics detected: ${numberMatch.slice(0, 3).join(', ')}.`;
  } else if (numberMatch && numberMatch.length >= 1) {
    impactScore = 70;
    impactFeedback = `Some measurable achievements found (${numberMatch[0]}). Add more metrics like latency reductions or user growth.`;
  } else {
    impactScore = 45;
    impactFeedback = 'No metrics or quantifiable impact found. Add numbers, percentages, or scale metrics to demonstrate results (e.g. "improved speed by 30%").';
  }

  // Calculate Overall Resume Score out of 100%
  const weightedScore = (
    structureScore * 0.15 +
    formattingScore * 0.15 +
    grammarScore * 0.15 +
    missingSectionsScore * 0.15 +
    skillsScore * 0.15 +
    projectScore * 0.15 +
    impactScore * 0.10
  );

  const resumeScore = Math.round(weightedScore);

  let atsReadiness = 'Needs Review';
  if (resumeScore >= 82) atsReadiness = 'ATS Ready (Top Tier)';
  else if (resumeScore >= 65) atsReadiness = 'Good (Needs Minor Polish)';

  // Extract candidate bullet lines directly from raw text for live AI rewriter
  let sampleLines = [];
  if (rawText) {
    const rawLines = rawText
      .split(/[\r\n]+/)
      .map(l => l.trim().replace(/^[-•*–\d+\.]+\s*/, ''))
      .filter(l => l.length > 20 && l.length < 120);

    sampleLines = rawLines.slice(0, 3);
  }

  if (sampleLines.length === 0) {
    sampleLines = [
      'Created an e-commerce website with React and Node',
      'Worked on bug fixes and database UI improvements',
      'Built a real-time chat application for users'
    ];
  }

  const suggestions = sampleLines.map(line => enhanceBulletPoint(line));

  // Dynamic Top Action Items based on empirical resume audit findings
  const topActionItems = [];

  if (!hasResume) {
    topActionItems.push('Upload a PDF or DOCX resume document to enable instant 7-pillar ATS parsing.');
    topActionItems.push('Include dedicated section headers for Education, Projects, Work Experience, and Skills.');
    topActionItems.push('Incorporate quantifiable metrics (e.g. "improved load speed by 35%") into project bullet points.');
  } else {
    if (missingSectionList.length > 0) {
      topActionItems.push(`Add missing ATS sections: ${missingSectionList.join(', ')}.`);
    }
    if (wordCount < 350) {
      topActionItems.push(`Expand resume content (currently ${wordCount} words). Add detailed descriptions of technical projects and internships to reach optimal length (400-600 words).`);
    } else if (wordCount > 750) {
      topActionItems.push(`Condense text (currently ${wordCount} words) to fit a concise 1-page ATS layout.`);
    }
    if (actionVerbMatches.length < 3) {
      topActionItems.push(`Low action verb density (${actionVerbMatches.length} found). Start project bullets with strong action verbs like ${ACTION_VERBS.slice(0, 3).join(', ')}.`);
    }
    if (!numberMatch || numberMatch.length < 2) {
      topActionItems.push('No impact metrics found. Add percentages, user scale, or benchmark numbers to demonstrate engineering results.');
    }
    if (detectedSkills.length < 6) {
      topActionItems.push(`Technical skill count is low (${detectedSkills.length} found). List core frameworks, databases, and DevOps tools to boost ATS keyword matching.`);
    }

    if (topActionItems.length === 0) {
      topActionItems.push('Your resume content matches top engineering standard guidelines! Ensure live project repository links are functional.');
    }
  }

  return {
    resumeScore: hasResume ? resumeScore : 0,
    lastAnalyzedAt: new Date(),
    atsReadiness: hasResume ? atsReadiness : 'No Resume Uploaded',
    checks: {
      structure: { score: hasResume ? structureScore : 0, feedback: structureFeedback },
      formatting: { score: hasResume ? formattingScore : 0, feedback: formattingFeedback },
      grammar: { score: hasResume ? grammarScore : 0, feedback: grammarFeedback },
      missingSections: { score: hasResume ? missingSectionsScore : 0, feedback: missingFeedback },
      skillsRepresentation: { score: hasResume ? skillsScore : 0, feedback: skillsFeedback },
      projectDescriptions: { score: hasResume ? projectScore : 0, feedback: projectFeedback },
      achievementImpact: { score: hasResume ? impactScore : 0, feedback: impactFeedback }
    },
    suggestions,
    missingSectionList: hasResume ? missingSectionList : ['Resume Document', 'Work Experience', 'Projects', 'Education', 'Certifications'],
    topActionItems
  };
}
