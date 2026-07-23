import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';

async function resolveUser(firebaseUid) {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

const EMPTY_SCORES = {
  profileCompletion: 0,
  talentScore: 0,
  resumeScore: 0,
  githubScore: 0,
  portfolioScore: 0,
  codingScore: 0,
  jobMatchScore: 0
};

export async function getProfile(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    const profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(200).json({ profile: null, scores: EMPTY_SCORES });
    }
    res.status(200).json({ profile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}

export async function upsertProfile(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);

    const {
      phone, location, bio,
      education, skills,
      experience, internships,
      certifications, achievements,
      links
    } = req.body;

    let profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (internships !== undefined) profile.internships = internships;
    if (certifications !== undefined) profile.certifications = certifications;
    if (achievements !== undefined) profile.achievements = achievements;

    if (education) {
      if (education.college !== undefined) profile.education.college = education.college;
      if (education.degree !== undefined) profile.education.degree = education.degree;
      if (education.graduationYear !== undefined) profile.education.graduationYear = education.graduationYear;
      if (education.cgpa !== undefined) profile.education.cgpa = education.cgpa;
    }

    if (links) {
      if (links.githubUrl !== undefined) profile.links.githubUrl = links.githubUrl;
      if (links.linkedinUrl !== undefined) profile.links.linkedinUrl = links.linkedinUrl;
      if (links.leetcodeUrl !== undefined) profile.links.leetcodeUrl = links.leetcodeUrl;
      if (links.hackerrankUrl !== undefined) profile.links.hackerrankUrl = links.hackerrankUrl;
      if (links.codechefUrl !== undefined) profile.links.codechefUrl = links.codechefUrl;
      if (links.hackerearthUrl !== undefined) profile.links.hackerearthUrl = links.hackerearthUrl;
      if (links.portfolioUrl !== undefined) profile.links.portfolioUrl = links.portfolioUrl;
    }

    // CROSS-MODULE AUTO SYNCHRONIZATION:
    // 1. Auto-trigger Portfolio Intelligence if link updated
    if (profile.links?.portfolioUrl) {
      try {
        const { performPortfolioIntelligenceAudit } = await import('../services/portfolioIntelligence.service.js');
        const pAudit = await performPortfolioIntelligenceAudit(profile, profile.links.portfolioUrl);
        profile.portfolioIntelligence = pAudit;
        profile.scores.portfolioScore = pAudit.portfolioScore;
        profile.markModified('portfolioIntelligence');
      } catch (pErr) {
        console.warn('Auto portfolio audit failed:', pErr.message);
      }
    } else {
      profile.scores.portfolioScore = 0;
    }

    // 2. Auto-trigger GitHub Intelligence if link updated
    if (profile.links?.githubUrl) {
      try {
        const { performGitHubIntelligenceAudit } = await import('../services/githubIntelligence.service.js');
        const ghAudit = await performGitHubIntelligenceAudit(profile.links.githubUrl);
        profile.githubIntelligence = ghAudit;
        profile.scores.githubScore = ghAudit.githubScore;
        profile.markModified('githubIntelligence');
      } catch (ghErr) {
        console.warn('Auto GitHub audit failed:', ghErr.message);
      }
    } else {
      profile.scores.githubScore = 0;
    }

    // 3. Auto-trigger Coding Intelligence if platform links updated
    const hasCodingLinks = Boolean(
      profile.links?.leetcodeUrl ||
      profile.links?.hackerrankUrl ||
      profile.links?.codechefUrl ||
      profile.links?.hackerearthUrl
    );

    if (hasCodingLinks) {
      try {
        const { performCodingIntelligenceAudit } = await import('../services/codingIntelligence.service.js');
        const cAudit = await performCodingIntelligenceAudit(profile, profile.links);
        profile.codingIntelligence = cAudit;
        profile.scores.codingScore = cAudit.codingScore;
        profile.markModified('codingIntelligence');
      } catch (cErr) {
        console.warn('Auto coding audit failed:', cErr.message);
      }
    } else {
      profile.scores.codingScore = 0;
    }

    // Recalculate Overall Talent Score across all connected modules
    const rScore = profile.scores.resumeScore || 0;
    const ghScore = profile.scores.githubScore || 0;
    const pScore = profile.scores.portfolioScore || 0;
    const cScore = profile.scores.codingScore || 0;
    const jScore = profile.scores.jobMatchScore || 0;

    const scoresList = [rScore, ghScore, pScore, cScore, jScore].filter(s => s > 0);
    profile.scores.talentScore = scoresList.length > 0
      ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length)
      : 0;

    profile.markModified('education');
    profile.markModified('links');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({ profile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}
