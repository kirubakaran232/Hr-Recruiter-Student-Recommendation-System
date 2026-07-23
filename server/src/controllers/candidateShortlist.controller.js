import { Candidate } from '../models/Candidate.js';
import {
  runAutoShortlist,
  toggleCandidateShortlist
} from '../services/candidateShortlist.service.js';

// ── POST /api/hr/candidates/shortlist/auto ────────────────────────────────────
export async function autoShortlistCandidates(req, res, next) {
  try {
    const rules = req.body || {};
    const result = await runAutoShortlist(req.user._id, rules);

    res.status(200).json({
      success: true,
      message: `Automated shortlisting completed. ${result.autoShortlistedCount} candidate(s) newly shortlisted.`,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/candidates/shortlist ──────────────────────────────────────────
export async function getShortlistedCandidates(req, res, next) {
  try {
    const candidates = await Candidate.find({
      hrUserId: req.user._id,
      status:   'shortlisted'
    })
      .sort({ aiScore: -1 })
      .lean();

    res.status(200).json({
      success: true,
      total: candidates.length,
      shortlist: candidates.map((c) => ({
        id:              c._id.toString(),
        name:            c.name,
        email:           c.email,
        skills:          c.skills || [],
        college:         c.college || '',
        graduationYear:  c.graduationYear,
        cgpa:            c.cgpa,
        experienceYears: c.experienceYears,
        status:          c.status,
        aiScore:         c.aiScore ?? 0,
        jdMatchScore:    c.jdMatchScore ?? 0,
        categoryScores: {
          resume: c.aiEvaluation?.breakdown?.resume?.score ?? 0,
          github: c.aiEvaluation?.breakdown?.github?.score ?? 0,
          coding: c.aiEvaluation?.breakdown?.coding?.score ?? 0,
          skills: c.aiEvaluation?.breakdown?.skills?.score ?? 0
        },
        resumeUrl: c.resumeUrl,
        githubUrl: c.githubUrl,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

// ── PATCH /api/hr/candidates/:id/shortlist ────────────────────────────────────
export async function toggleShortlist(req, res, next) {
  try {
    const { shortlisted } = req.body;
    const candidate = await toggleCandidateShortlist(
      req.params.id,
      req.user._id,
      Boolean(shortlisted)
    );

    res.status(200).json({
      success: true,
      message: `Candidate ${candidate.name} ${shortlisted ? 'added to' : 'removed from'} shortlist`,
      candidate
    });
  } catch (error) {
    next(error);
  }
}
