import { Candidate } from '../models/Candidate.js';

/**
 * Runs automated shortlisting criteria against HR candidate pool.
 * Criteria options:
 *   minOverallScore: number (e.g. 85)
 *   minGithubScore:  number (e.g. 80)
 *   minCodingScore:  number (e.g. 75)
 *   minExperience:   number (e.g. 1)
 *   minCgpa:         number (e.g. 7.5)
 */
export async function runAutoShortlist(hrUserId, rules = {}) {
  const {
    minOverallScore = 85,
    minGithubScore  = 80,
    minCodingScore  = 75,
    minExperience   = 1,
    minCgpa         = 7.5
  } = rules;

  // 1. Fetch all candidates belonging to this HR recruiter
  const candidates = await Candidate.find({ hrUserId });
  if (!candidates.length) {
    return {
      message: 'No candidates available to evaluate for shortlisting',
      evaluatedCount: 0,
      autoShortlistedCount: 0,
      rulePassStats: {},
      candidates: []
    };
  }

  // 2. Rule evaluation pass tracking
  const rulePassStats = {
    overallScorePass: 0,
    githubScorePass: 0,
    codingScorePass: 0,
    experiencePass: 0,
    cgpaPass: 0,
    passedAllRules: 0
  };

  const toShortlistIds = [];
  const newlyShortlistedIds = [];

  candidates.forEach((cand) => {
    const overall  = cand.aiScore ?? 0;
    const github   = cand.aiEvaluation?.breakdown?.github?.score ?? 0;
    const coding   = cand.aiEvaluation?.breakdown?.coding?.score ?? 0;
    const exp      = cand.experienceYears ?? 0;
    const cgpa     = cand.cgpa ?? (cand.college ? 8.0 : 0); // fallback if college present

    const passOverall  = minOverallScore == null || overall >= minOverallScore;
    const passGithub   = minGithubScore  == null || github  >= minGithubScore;
    const passCoding   = minCodingScore  == null || coding  >= minCodingScore;
    const passExp      = minExperience   == null || exp     >= minExperience;
    const passCgpa     = minCgpa         == null || cgpa    >= minCgpa;

    if (passOverall)  rulePassStats.overallScorePass++;
    if (passGithub)   rulePassStats.githubScorePass++;
    if (passCoding)   rulePassStats.codingScorePass++;
    if (passExp)      rulePassStats.experiencePass++;
    if (passCgpa)     rulePassStats.cgpaPass++;

    if (passOverall && passGithub && passCoding && passExp && passCgpa) {
      rulePassStats.passedAllRules++;
      toShortlistIds.push(cand._id);
      if (cand.status !== 'shortlisted') {
        newlyShortlistedIds.push(cand._id);
      }
    }
  });

  // 3. Update candidates status in DB
  if (newlyShortlistedIds.length > 0) {
    await Candidate.updateMany(
      { _id: { $in: newlyShortlistedIds } },
      { $set: { status: 'shortlisted' } }
    );
  }

  // 4. Return updated list of all shortlisted candidates
  const updatedShortlist = await Candidate.find({
    hrUserId,
    status: 'shortlisted'
  }).sort({ aiScore: -1 }).lean();

  return {
    evaluatedCount:       candidates.length,
    autoShortlistedCount: newlyShortlistedIds.length,
    totalShortlisted:     updatedShortlist.length,
    rulePassStats,
    shortlist: updatedShortlist.map((c) => ({
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
        resume:  c.aiEvaluation?.breakdown?.resume?.score  ?? 0,
        github:  c.aiEvaluation?.breakdown?.github?.score  ?? 0,
        coding:  c.aiEvaluation?.breakdown?.coding?.score  ?? 0,
        skills:  c.aiEvaluation?.breakdown?.skills?.score  ?? 0
      },
      resumeUrl:  c.resumeUrl,
      githubUrl:  c.githubUrl,
      createdAt:  c.createdAt
    }))
  };
}

/**
 * Manually toggle shortlist status for a single candidate.
 */
export async function toggleCandidateShortlist(candidateId, hrUserId, shouldShortlist) {
  const newStatus = shouldShortlist ? 'shortlisted' : 'evaluated';

  const candidate = await Candidate.findOneAndUpdate(
    { _id: candidateId, hrUserId },
    { $set: { status: newStatus } },
    { new: true }
  );

  if (!candidate) {
    const err = new Error('Candidate not found');
    err.statusCode = 404;
    throw err;
  }

  return candidate.toSummaryJSON();
}
