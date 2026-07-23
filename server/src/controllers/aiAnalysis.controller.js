import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { performAIProfileAnalysis } from '../services/aiAnalysis.service.js';

async function resolveUser(firebaseUid) {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

export async function analyzeProfile(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const aiResult = await performAIProfileAnalysis(profile);

    profile.aiAnalysis = aiResult;
    profile.scores.talentScore = aiResult.talentScore;
    profile.scores.resumeScore = aiResult.breakdown.resumeQuality.score;
    profile.scores.githubScore = aiResult.breakdown.githubActivity.score;
    profile.scores.portfolioScore = aiResult.breakdown.portfolioQuality.score;
    profile.scores.codingScore = aiResult.breakdown.codingPerformance.score;

    profile.markModified('aiAnalysis');
    profile.markModified('scores');
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'AI profile analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function getAIAnalysis(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
      await profile.save();
    }

    if (!profile.aiAnalysis || !profile.aiAnalysis.lastAnalyzedAt) {
      const aiResult = await performAIProfileAnalysis(profile);
      profile.aiAnalysis = aiResult;
      profile.scores.talentScore = aiResult.talentScore;
      profile.markModified('aiAnalysis');
      profile.markModified('scores');
      await profile.save();
    }

    res.status(200).json({
      success: true,
      aiAnalysis: profile.toProfileJSON().aiAnalysis
    });
  } catch (error) {
    next(error);
  }
}

function updateOverallTalentScore(profile) {
  const rScore = profile.scores.resumeScore || 0;
  const ghScore = profile.scores.githubScore || 0;
  const pScore = profile.scores.portfolioScore || 0;
  const cScore = profile.scores.codingScore || 0;
  const jScore = profile.scores.jobMatchScore || 0;
  const activeScores = [rScore, ghScore, pScore, cScore, jScore].filter(s => s > 0);

  profile.scores.talentScore = activeScores.length > 0
    ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
    : 0;
}

export async function analyzeGitHubIntelligence(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { username } = req.body || {};
    const { performGitHubIntelligenceAudit } = await import('../services/githubIntelligence.service.js');
    const intel = await performGitHubIntelligenceAudit(profile, username);

    profile.githubIntelligence = intel;
    profile.scores.githubScore = intel.githubScore;
    if (username && !profile.links.githubUrl) {
      profile.links.githubUrl = `https://github.com/${username}`;
      profile.markModified('links');
    }
    updateOverallTalentScore(profile);
    profile.markModified('githubIntelligence');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'GitHub intelligence analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzePortfolioIntelligence(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { url } = req.body || {};
    const { performPortfolioIntelligenceAudit } = await import('../services/portfolioIntelligence.service.js');
    const intel = await performPortfolioIntelligenceAudit(profile, url);

    profile.portfolioIntelligence = intel;
    profile.scores.portfolioScore = intel.portfolioScore;
    if (url && profile.links.portfolioUrl !== url) {
      profile.links.portfolioUrl = url;
      profile.markModified('links');
    }
    updateOverallTalentScore(profile);
    profile.markModified('portfolioIntelligence');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Portfolio intelligence analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeCodingIntelligence(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { platformUrls } = req.body || {};
    if (platformUrls) {
      if (platformUrls.leetcodeUrl !== undefined) profile.links.leetcodeUrl = platformUrls.leetcodeUrl;
      if (platformUrls.hackerrankUrl !== undefined) profile.links.hackerrankUrl = platformUrls.hackerrankUrl;
      if (platformUrls.codechefUrl !== undefined) profile.links.codechefUrl = platformUrls.codechefUrl;
      if (platformUrls.hackerearthUrl !== undefined) profile.links.hackerearthUrl = platformUrls.hackerearthUrl;
      profile.markModified('links');
    }

    const { performCodingIntelligenceAudit } = await import('../services/codingIntelligence.service.js');
    const intel = await performCodingIntelligenceAudit(profile, platformUrls || {});

    profile.codingIntelligence = intel;
    profile.scores.codingScore = intel.codingScore;
    updateOverallTalentScore(profile);
    profile.markModified('codingIntelligence');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Coding profile intelligence analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeJobMatch(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { jobDescription } = req.body || {};
    const { performJobMatchAudit } = await import('../services/jobMatch.service.js');
    const intel = await performJobMatchAudit(profile, jobDescription || '');

    profile.jobMatch = intel;
    profile.scores.jobMatchScore = intel.matchScore;
    updateOverallTalentScore(profile);
    profile.markModified('jobMatch');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Job match analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeSkillGap(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { targetRole } = req.body || {};
    const { performSkillGapAudit } = await import('../services/skillGap.service.js');
    const intel = await performSkillGapAudit(profile, targetRole || 'Full Stack Developer');

    profile.skillGapAnalysis = intel;
    profile.markModified('skillGapAnalysis');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Skill gap analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function askCareerAssistant(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { message } = req.body || {};
    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message || '',
      timestamp: new Date()
    };

    const { processCareerAssistantQuery } = await import('../services/careerAssistant.service.js');
    const aiMsgObj = await processCareerAssistantQuery(profile, message || '');

    if (!profile.assistantHistory) {
      profile.assistantHistory = [];
    }
    profile.assistantHistory.push(userMsgObj);
    profile.assistantHistory.push(aiMsgObj);
    profile.markModified('assistantHistory');

    await profile.save();
    res.status(200).json({
      success: true,
      userMessage: userMsgObj,
      aiMessage: aiMsgObj,
      assistantHistory: profile.assistantHistory,
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardAnalytics(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { fetchDashboardAnalytics: loadAnalytics } = await import('../services/analytics.service.js');
    const analytics = await loadAnalytics(profile);

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
}
