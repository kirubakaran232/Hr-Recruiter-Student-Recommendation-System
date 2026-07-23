import { Candidate } from '../models/Candidate.js';
import {
  importCandidatesFromFile,
  generateTemplateBuffer
} from '../services/candidateImport.service.js';

// ── POST /api/hr/candidates/import ────────────────────────────────────────────
export async function importCandidates(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      throw err;
    }

    const result = await importCandidatesFromFile(
      req.file.buffer,
      req.file.originalname,
      req.user._id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/candidates ────────────────────────────────────────────────────
export async function getCandidates(req, res, next) {
  try {
    const {
      page   = 1,
      limit  = 20,
      search = '',
      status = ''
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { hrUserId: req.user._id };
    if (status && ['pending', 'evaluated', 'shortlisted', 'rejected'].includes(status)) {
      filter.status = status;
    }
    if (search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: re }, { email: re }, { college: re }, { skills: re }];
    }

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Candidate.countDocuments(filter)
    ]);

    res.status(200).json({
      candidates: candidates.map((c) => ({
        id:              c._id.toString(),
        name:            c.name,
        email:           c.email,
        resumeUrl:       c.resumeUrl,
        githubUrl:       c.githubUrl,
        linkedinUrl:     c.linkedinUrl,
        portfolioUrl:    c.portfolioUrl,
        leetcodeUrl:     c.leetcodeUrl,
        hackerrankUrl:   c.hackerrankUrl,
        codechefUrl:     c.codechefUrl,
        experienceYears: c.experienceYears,
        skills:          c.skills,
        college:         c.college,
        graduationYear:  c.graduationYear,
        importSource:    c.importSource,
        status:          c.status,
        aiScore:         c.aiScore,
        createdAt:       c.createdAt
      })),
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

// ── GET /api/hr/candidates/stats ──────────────────────────────────────────────
export async function getCandidateStats(req, res, next) {
  try {
    const [total, byStatus] = await Promise.all([
      Candidate.countDocuments({ hrUserId: req.user._id }),
      Candidate.aggregate([
        { $match: { hrUserId: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const stats = { total, pending: 0, evaluated: 0, shortlisted: 0, rejected: 0 };
    byStatus.forEach(({ _id, count }) => { stats[_id] = count; });

    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/candidates/template ──────────────────────────────────────────
export async function downloadTemplate(_req, res, next) {
  try {
    const buffer = generateTemplateBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="talentos_candidate_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/hr/candidates/:id ─────────────────────────────────────────────
export async function deleteCandidate(req, res, next) {
  try {
    const deleted = await Candidate.findOneAndDelete({
      _id:      req.params.id,
      hrUserId: req.user._id   // ensure the HR can only delete their own
    });

    if (!deleted) {
      const err = new Error('Candidate not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ message: 'Candidate deleted' });
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/hr/candidates (bulk clear) ────────────────────────────────────
export async function clearAllCandidates(req, res, next) {
  try {
    const { status } = req.query; // optional filter

    const filter = { hrUserId: req.user._id };
    if (status && ['pending', 'evaluated', 'shortlisted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const result = await Candidate.deleteMany(filter);
    res.status(200).json({ message: `${result.deletedCount} candidate(s) deleted` });
  } catch (error) {
    next(error);
  }
}
