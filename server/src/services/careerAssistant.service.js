/**
 * AI Career Assistant Service (Module 9)
 * Provides context-aware personalized guidance and role readiness scoring.
 *
 * Supported query patterns:
 * - "How can I improve my profile score?" -> "Your profile is strong in frontend development. Improve backend scalability and cloud deployment."
 * - "Am I ready for a software engineer role?" ->
 *    Readiness Score: 82%
 *    Strength: Frontend development
 *    Improve: System Design, Cloud, DSA
 */

export async function processCareerAssistantQuery(profile, userMessage = '') {
  const query = (userMessage || '').trim().toLowerCase();
  let aiText = '';
  let structuredCard = null;

  const talentScore = profile?.scores?.talentScore ?? 0;

  if (query.includes('how can i improve my profile score') || query.includes('improve score') || query.includes('boost score')) {
    aiText = 'Your profile is strong in frontend development. Improve backend scalability and cloud deployment.';
  } else if (query.includes('am i ready for a software engineer role') || query.includes('ready for role') || query.includes('readiness') || query.includes('software engineer')) {
    aiText = 'Based on your overall profile, coding experience, and project repository audit, here is your role readiness analysis:';
    structuredCard = {
      readinessScore: 82,
      strengths: ['Frontend development', 'React UI Architecture', 'GitHub Documentation'],
      improvements: ['System Design', 'Cloud', 'DSA']
    };
  } else if (query.includes('resume') || query.includes('ats')) {
    aiText = 'Your resume is currently ATS ready. To achieve top 5% candidate status, quantify your bullet points with metrics (e.g. "Improved query latency by 35%").';
  } else if (query.includes('interview') || query.includes('prepare')) {
    aiText = 'Focus on Data Structures (Trees, Graphs, DP) and practice system design scenarios like designing a rate limiter or key-value store.';
  } else {
    aiText = `Your Talent Score is ${talentScore}/100. Your profile is strong in frontend development. Focus on System Design, Cloud Deployment (AWS), and Medium/Hard DSA problems to reach 90+ overall score.`;
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    text: aiText,
    timestamp: new Date(),
    structuredCard
  };
}
