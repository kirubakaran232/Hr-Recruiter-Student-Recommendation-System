import { Candidate } from '../models/Candidate.js';

// ── GET /api/hr/analytics ──────────────────────────────────────────────────────
export async function getHRAnalytics(req, res, next) {
  try {
    const hrUserId = req.user._id;

    // 1. Fetch overall candidate stats
    const candidates = await Candidate.find({ hrUserId }).lean();
    const totalCount = candidates.length;

    // 2. Score Distribution (Histogram)
    const distribution = {
      excellent: 0, // 80-100
      good:      0, // 60-79
      needsWork: 0, // <60
      unevaluated: 0
    };

    let totalScoreSum = 0;
    let evaluatedCount = 0;
    const skillCounts = {};
    const monthlyIntake = {};

    candidates.forEach((c) => {
      // Score distribution & average calculation
      if (c.aiScore != null && c.status !== 'pending') {
        evaluatedCount++;
        totalScoreSum += c.aiScore;
        if (c.aiScore >= 80)      distribution.excellent++;
        else if (c.aiScore >= 60) distribution.good++;
        else                      distribution.needsWork++;
      } else {
        distribution.unevaluated++;
      }

      // Top Skills counting
      (c.skills || []).forEach((skill) => {
        const clean = skill.trim();
        if (clean) skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      });

      // Monthly intake trends (e.g. "Jan 2026")
      const monthYear = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyIntake[monthYear] = (monthlyIntake[monthYear] || 0) + 1;
    });

    // 3. Top 10 Skills array
    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count, percentage: totalCount ? Math.round((count / totalCount) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Hiring Funnel Metrics
    const statusCounts = {
      pending:     0,
      evaluated:   0,
      shortlisted: 0,
      rejected:    0
    };
    candidates.forEach((c) => {
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
    });

    const shortlistedCount = statusCounts.shortlisted;
    const selectionRate = totalCount ? Math.round((shortlistedCount / totalCount) * 100) : 0;
    const avgTalentScore = evaluatedCount ? Math.round(totalScoreSum / evaluatedCount) : 0;

    // 5. Monthly Hiring Trends
    const monthlyTrends = Object.entries(monthlyIntake)
      .map(([month, count]) => ({ month, count }))
      .slice(-6); // last 6 months

    // 6. Applications / Jobs Overview (Mock data or real counts)
    const applicationsPerJob = [
      { jobTitle: 'Full Stack Engineer', applications: Math.round(totalCount * 0.45), shortlisted: Math.round(shortlistedCount * 0.5) },
      { jobTitle: 'Senior Frontend Developer', applications: Math.round(totalCount * 0.35), shortlisted: Math.round(shortlistedCount * 0.3) },
      { jobTitle: 'DevOps & Cloud Engineer', applications: Math.round(totalCount * 0.20), shortlisted: Math.round(shortlistedCount * 0.2) }
    ];

    res.status(200).json({
      success: true,
      analytics: {
        totalCandidates: totalCount,
        evaluatedCount,
        shortlistedCount,
        avgTalentScore,
        selectionRate,
        distribution,
        topSkills,
        funnel: [
          { stage: 'Imported', count: totalCount, color: '#ffdc5d' },
          { stage: 'Evaluated', count: evaluatedCount, color: '#6366f1' },
          { stage: 'Shortlisted', count: shortlistedCount, color: '#22c55e' }
        ],
        monthlyTrends,
        applicationsPerJob
      }
    });
  } catch (error) {
    next(error);
  }
}
