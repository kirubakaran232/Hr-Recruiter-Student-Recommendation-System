import { Router } from 'express';
import { authenticateFirebase } from '../middlewares/authenticateFirebase.js';
import { resumeUpload } from '../middlewares/upload.js';
import { getProfile, upsertProfile } from '../controllers/profile.controller.js';
import { uploadResume, deleteResume, analyzeResumeIntelligence, rewriteBulletPoint } from '../controllers/resume.controller.js';
import {
  analyzeProfile,
  getAIAnalysis,
  analyzeGitHubIntelligence,
  analyzePortfolioIntelligence,
  analyzeCodingIntelligence,
  analyzeJobMatch,
  analyzeSkillGap,
  askCareerAssistant,
  getDashboardAnalytics
} from '../controllers/aiAnalysis.controller.js';

const router = Router();

router.get('/', authenticateFirebase, getProfile);
router.put('/', authenticateFirebase, upsertProfile);
router.post('/resume', authenticateFirebase, resumeUpload.single('resume'), uploadResume);
router.delete('/resume', authenticateFirebase, deleteResume);
router.post('/resume/intelligence', authenticateFirebase, analyzeResumeIntelligence);
router.post('/resume/rewrite-bullet', authenticateFirebase, rewriteBulletPoint);
router.post('/analyze', authenticateFirebase, analyzeProfile);
router.get('/analysis', authenticateFirebase, getAIAnalysis);
router.post('/github/analyze', authenticateFirebase, analyzeGitHubIntelligence);
router.post('/portfolio/analyze', authenticateFirebase, analyzePortfolioIntelligence);
router.post('/coding/analyze', authenticateFirebase, analyzeCodingIntelligence);
router.post('/job-match/analyze', authenticateFirebase, analyzeJobMatch);
router.post('/skill-gap/analyze', authenticateFirebase, analyzeSkillGap);
router.post('/assistant/chat', authenticateFirebase, askCareerAssistant);
router.get('/analytics', authenticateFirebase, getDashboardAnalytics);

export default router;
