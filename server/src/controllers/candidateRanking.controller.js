import { Candidate } from '../models/Candidate.js';

// ── GET /api/hr/candidates/ranking ───────────────────────────────────────────
export async function getCandidateRankings(req, res, next) {
  try {
    const {
      page     = 1,
      limit    = 25,
      search   = '',
      status   = '',
      sortBy   = 'highest_score'
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // 1. Build filter
    const filter = { hrUserId: req.user._id };
    if (status && ['pending', 'evaluated', 'shortlisted', 'rejected'].includes(status)) {
      filter.status = status;
    }
    if (search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: re }, { email: re }, { college: re }, { skills: re }];
    }

    // 2. Build sort map
    let sortObj = { aiScore: -1, createdAt: -1 };
    switch (sortBy) {
      case 'lowest_score':
        sortObj = { aiScore: 1, createdAt: -1 };
        break;
      case 'experience':
        sortObj = { experienceYears: -1, aiScore: -1 };
        break;
      case 'github_score':
        sortObj = { 'aiEvaluation.breakdown.github.score': -1, aiScore: -1 };
        break;
      case 'coding_score':
        sortObj = { 'aiEvaluation.breakdown.coding.score': -1, aiScore: -1 };
        break;
      case 'resume_score':
        sortObj = { 'aiEvaluation.breakdown.resume.score': -1, aiScore: -1 };
        break;
      case 'recently_added':
        sortObj = { createdAt: -1 };
        break;
      case 'highest_score':
      default:
        sortObj = { aiScore: -1, createdAt: -1 };
        break;
    }

    // 3. Query total count & candidates
    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Candidate.countDocuments(filter)
    ]);

    // 4. Compute overall rank (based on position in the full sorted list)
    // To ensure exact rank #1, #2, #3 regardless of pagination page:
    const rankedCandidates = candidates.map((c, idx) => {
      const globalRank = skip + idx + 1;
      const breakdown = c.aiEvaluation?.breakdown || {};
      const aiScore = c.aiScore ?? 0;
      const jdMatchScore = c.jdMatchScore ?? Math.round(aiScore * 0.95);

      return {
        id:              c._id.toString(),
        rank:            globalRank,
        name:            c.name,
        email:           c.email,
        college:         c.college,
        graduationYear:  c.graduationYear,
        experienceYears: c.experienceYears,
        skills:          c.skills || [],
        status:          c.status,
        overallScore:    aiScore,
        jdMatchScore:    jdMatchScore,
        categoryScores: {
          resume:    breakdown.resume?.score    ?? 0,
          github:    breakdown.github?.score    ?? 0,
          skills:    breakdown.skills?.score    ?? 0,
          projects:  breakdown.projects?.score  ?? 0,
          coding:    breakdown.coding?.score    ?? 0,
          portfolio: breakdown.portfolio?.score ?? 0
        },
        strengths:        c.aiEvaluation?.strengths || [],
        summaryNarrative: c.aiEvaluation?.summaryNarrative || '',
        createdAt:        c.createdAt
      };
    });

    // 5. Compute summary stats
    const [allStats] = await Candidate.aggregate([
      { $match: { hrUserId: req.user._id } },
      {
        $group: {
          _id:              null,
          totalCount:       { $sum: 1 },
          evaluatedCount:   { $sum: { $cond: [{ $eq: ['$status', 'evaluated'] }, 1, 0] } },
          shortlistedCount: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          rejectedCount:    { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          avgScore:         { $avg: '$aiScore' },
          topScore:         { $max: '$aiScore' }
        }
      }
    ]);

    const stats = allStats
      ? {
          total:       allStats.totalCount,
          evaluated:   allStats.evaluatedCount,
          shortlisted: allStats.shortlistedCount,
          rejected:    allStats.rejectedCount,
          avgScore:    Math.round(allStats.avgScore || 0),
          topScore:    allStats.topScore || 0
        }
      : { total: 0, evaluated: 0, shortlisted: 0, rejected: 0, avgScore: 0, topScore: 0 };

    res.status(200).json({
      success:    true,
      rankings:   rankedCandidates,
      stats,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
}

// ── PATCH /api/hr/candidates/:id/status ──────────────────────────────────────
export async function updateCandidateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'evaluated', 'shortlisted', 'rejected'].includes(status)) {
      const err = new Error('Invalid status option');
      err.statusCode = 400;
      throw err;
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, hrUserId: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!candidate) {
      const err = new Error('Candidate not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: `Candidate status updated to ${status}`,
      candidate: candidate.toSummaryJSON()
    });
  } catch (error) {
    next(error);
  }
}
