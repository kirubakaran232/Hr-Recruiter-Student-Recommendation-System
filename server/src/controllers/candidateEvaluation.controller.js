import { Candidate } from '../models/Candidate.js';
import {
  evaluateCandidate,
  evaluateCandidates
} from '../services/candidateEvaluation.service.js';

// ── POST /api/hr/candidates/:id/evaluate ──────────────────────────────────────
/** Evaluate a single candidate and persist the result. */
export async function evaluateSingleCandidate(req, res, next) {
  try {
    const candidate = await Candidate.findOne({
      _id:      req.params.id,
      hrUserId: req.user._id
    });

    if (!candidate) {
      const err = new Error('Candidate not found');
      err.statusCode = 404;
      throw err;
    }

    const result = evaluateCandidate(candidate);

    candidate.aiScore      = result.talentScore;
    candidate.jdMatchScore = result.jdMatchScore;
    candidate.aiEvaluation = result;
    candidate.status       = 'evaluated';
    candidate.markModified('aiEvaluation');
    await candidate.save();

    res.status(200).json({
      success: true,
      message: `AI evaluation complete for ${candidate.name}`,
      candidateId: candidate._id.toString(),
      evaluation:  result
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/hr/candidates/evaluate-all ─────────────────────────────────────
/** Bulk evaluate all pending candidates (or optionally a status filter). */
export async function evaluateAllCandidates(req, res, next) {
  try {
    const { status = 'pending' } = req.body || {};

    const filter = { hrUserId: req.user._id };
    if (status !== 'all') filter.status = status;

    const candidates = await Candidate.find(filter);
    if (!candidates.length) {
      return res.status(200).json({
        success:   true,
        message:   'No matching candidates to evaluate',
        evaluated: 0
      });
    }

    const results = evaluateCandidates(candidates);

    // Bulk-write
    const bulkOps = candidates.map((c, i) => {
      const { result } = results[i];
      return {
        updateOne: {
          filter: { _id: c._id },
          update: {
            $set: {
              aiScore:      result.talentScore,
              jdMatchScore: result.jdMatchScore,
              aiEvaluation: result,
              status:       'evaluated'
            }
          }
        }
      };
    });

    await Candidate.bulkWrite(bulkOps, { ordered: false });

    // Return summary + per-candidate scores
    const summary = results.map(({ id, result }) => ({
      id,
      talentScore:      result.talentScore,
      summaryNarrative: result.summaryNarrative,
      strengths:        result.strengths.slice(0, 2)
    }));

    res.status(200).json({
      success:   true,
      message:   `${results.length} candidate(s) evaluated successfully`,
      evaluated: results.length,
      summary
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/candidates/:id/evaluation ─────────────────────────────────────
/** Retrieve the stored evaluation for a single candidate. */
export async function getCandidateEvaluation(req, res, next) {
  try {
    const candidate = await Candidate.findOne({
      _id:      req.params.id,
      hrUserId: req.user._id
    });

    if (!candidate) {
      const err = new Error('Candidate not found');
      err.statusCode = 404;
      throw err;
    }

    // Auto-evaluate if never done
    if (!candidate.aiEvaluation) {
      const result = evaluateCandidate(candidate);
      candidate.aiScore      = result.talentScore;
      candidate.aiEvaluation = result;
      candidate.status       = 'evaluated';
      candidate.markModified('aiEvaluation');
      await candidate.save();
    }

    res.status(200).json({
      success:    true,
      candidateId: candidate._id.toString(),
      name:       candidate.name,
      email:      candidate.email,
      aiScore:    candidate.aiScore,
      status:     candidate.status,
      evaluation: candidate.aiEvaluation
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/candidates/evaluation-summary ─────────────────────────────────
/** Aggregate evaluation stats across all candidates for this HR user. */
export async function getEvaluationSummary(req, res, next) {
  try {
    const [stats] = await Candidate.aggregate([
      { $match: { hrUserId: req.user._id, status: 'evaluated' } },
      {
        $group: {
          _id:      null,
          total:    { $sum: 1 },
          avgScore: { $avg: '$aiScore' },
          maxScore: { $max: '$aiScore' },
          minScore: { $min: '$aiScore' },
          above80:  { $sum: { $cond: [{ $gte: ['$aiScore', 80] }, 1, 0] } },
          above60:  { $sum: { $cond: [{ $and: [{ $gte: ['$aiScore', 60] }, { $lt: ['$aiScore', 80] }] }, 1, 0] } },
          below60:  { $sum: { $cond: [{ $lt: ['$aiScore', 60] }, 1, 0] } }
        }
      }
    ]);

    // Top candidates
    const topCandidates = await Candidate.find(
      { hrUserId: req.user._id, status: 'evaluated' },
      { name: 1, email: 1, aiScore: 1, skills: 1, aiEvaluation: 1 }
    )
      .sort({ aiScore: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      summary: stats
        ? {
            total:        stats.total,
            avgScore:     Math.round(stats.avgScore),
            maxScore:     stats.maxScore,
            minScore:     stats.minScore,
            distribution: {
              excellent: stats.above80,
              good:      stats.above60,
              needsWork: stats.below60
            }
          }
        : { total: 0, avgScore: 0, maxScore: 0, minScore: 0, distribution: { excellent: 0, good: 0, needsWork: 0 } },
      topCandidates: topCandidates.map((c) => ({
        id:               c._id.toString(),
        name:             c.name,
        email:            c.email,
        aiScore:          c.aiScore,
        skills:           c.skills,
        strengths:        c.aiEvaluation?.strengths?.slice(0, 2) || [],
        summaryNarrative: c.aiEvaluation?.summaryNarrative || ''
      }))
    });
  } catch (error) {
    next(error);
  }
}
