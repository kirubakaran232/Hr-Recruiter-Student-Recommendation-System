import { HRProfile } from '../models/HRProfile.js';

async function getOrCreateHRProfile(userId) {
  let profile = await HRProfile.findOne({ userId });
  if (!profile) {
    profile = new HRProfile({ userId });
    await profile.save();
  }
  return profile;
}

// ── GET /api/hr/settings ──────────────────────────────────────────────────────
export async function getHRSettings(req, res, next) {
  try {
    const profile = await getOrCreateHRProfile(req.user._id);

    res.status(200).json({
      success: true,
      settings: {
        aiWeights: profile.aiWeights || {
          resumeWeight:    20,
          githubWeight:    20,
          codingWeight:    15,
          portfolioWeight: 12,
          projectWeight:   18,
          certWeight:      15
        },
        hiringPreferences: profile.hiringPreferences || {
          scoreThreshold: 60,
          preferredSkills: [],
          preferredExperience: 'Any',
          hiringDepartments: []
        },
        teamMembers: profile.teamMembers || []
      }
    });
  } catch (error) {
    next(error);
  }
}

// ── PUT /api/hr/settings/ai-weights ──────────────────────────────────────────
export async function updateAIWeights(req, res, next) {
  try {
    const {
      resumeWeight,
      githubWeight,
      codingWeight,
      portfolioWeight,
      projectWeight,
      certWeight
    } = req.body || {};

    const profile = await getOrCreateHRProfile(req.user._id);

    profile.aiWeights = {
      resumeWeight:    Number(resumeWeight    ?? profile.aiWeights.resumeWeight),
      githubWeight:    Number(githubWeight    ?? profile.aiWeights.githubWeight),
      codingWeight:    Number(codingWeight    ?? profile.aiWeights.codingWeight),
      portfolioWeight: Number(portfolioWeight ?? profile.aiWeights.portfolioWeight),
      projectWeight:   Number(projectWeight   ?? profile.aiWeights.projectWeight),
      certWeight:      Number(certWeight      ?? profile.aiWeights.certWeight)
    };

    profile.markModified('aiWeights');
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'AI scoring weights updated successfully',
      aiWeights: profile.aiWeights
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/hr/settings/team-members ───────────────────────────────────────
export async function addTeamMember(req, res, next) {
  try {
    const { name, email, role = 'Recruiter' } = req.body || {};

    if (!name || !email) {
      const err = new Error('Name and email are required');
      err.statusCode = 400;
      throw err;
    }

    const profile = await getOrCreateHRProfile(req.user._id);

    // Check duplicate
    const exists = profile.teamMembers.some((m) => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const err = new Error('Team member with this email already added');
      err.statusCode = 400;
      throw err;
    }

    profile.teamMembers.push({
      name,
      email: email.toLowerCase(),
      role,
      addedAt: new Date()
    });

    profile.markModified('teamMembers');
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Team member ${name} invited`,
      teamMembers: profile.teamMembers
    });
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/hr/settings/team-members ─────────────────────────────────────
export async function removeTeamMember(req, res, next) {
  try {
    const { email } = req.body || {};
    const profile = await getOrCreateHRProfile(req.user._id);

    profile.teamMembers = profile.teamMembers.filter(
      (m) => m.email.toLowerCase() !== email.toLowerCase()
    );

    profile.markModified('teamMembers');
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Team member removed',
      teamMembers: profile.teamMembers
    });
  } catch (error) {
    next(error);
  }
}
