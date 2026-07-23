import { executeSmartCandidateSearch } from '../services/candidateSearch.service.js';

// ── GET /api/hr/candidates/search ─────────────────────────────────────────────
export async function smartCandidateSearch(req, res, next) {
  try {
    const {
      query,
      skills,
      minExperience,
      maxExperience,
      college,
      location,
      technology,
      maxSalary,
      graduationYear,
      minTalentScore,
      page,
      limit,
      sortBy
    } = req.query;

    const result = await executeSmartCandidateSearch(req.user._id, {
      query,
      skills: skills ? (Array.isArray(skills) ? skills : String(skills).split(',')) : [],
      minExperience,
      maxExperience,
      college,
      location,
      technology,
      maxSalary,
      graduationYear,
      minTalentScore,
      page,
      limit,
      sortBy
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}
