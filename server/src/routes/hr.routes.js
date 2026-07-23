import { Router } from 'express';
import { authenticateFirebase } from '../middlewares/authenticateFirebase.js';
import { requireHR } from '../middlewares/requireHR.js';
import { logoUpload } from '../middlewares/logoUpload.js';
import { candidateFileUpload } from '../middlewares/candidateUpload.js';
import {
  getHRProfile,
  upsertHRProfile,
  uploadLogo,
  deleteLogo
} from '../controllers/hrProfile.controller.js';
import {
  importCandidates,
  getCandidates,
  getCandidateStats,
  downloadTemplate,
  deleteCandidate,
  clearAllCandidates
} from '../controllers/candidateImport.controller.js';
import {
  evaluateSingleCandidate,
  evaluateAllCandidates,
  getCandidateEvaluation,
  getEvaluationSummary
} from '../controllers/candidateEvaluation.controller.js';
import {
  getCandidateRankings,
  updateCandidateStatus
} from '../controllers/candidateRanking.controller.js';
import {
  smartCandidateSearch
} from '../controllers/candidateSearch.controller.js';
import {
  autoShortlistCandidates,
  getShortlistedCandidates,
  toggleShortlist
} from '../controllers/candidateShortlist.controller.js';
import { getHRAnalytics } from '../controllers/hrAnalytics.controller.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from '../controllers/hrNotification.controller.js';
import {
  exportShortlist,
  exportEvaluationReports,
  exportHiringStats
} from '../controllers/hrExport.controller.js';
import {
  getHRSettings,
  updateAIWeights,
  addTeamMember,
  removeTeamMember
} from '../controllers/hrSettings.controller.js';

const router = Router();

// All HR routes require Firebase auth + HR role
router.use(authenticateFirebase, requireHR);

// ── Module 1: Company Profile ─────────────────────────────────────────────────
router.get('/company',         getHRProfile);
router.put('/company',         upsertHRProfile);
router.post('/company/logo',   logoUpload.single('logo'), uploadLogo);
router.delete('/company/logo', deleteLogo);

// ── Module 2: Candidate Import ────────────────────────────────────────────────
// Static sub-routes MUST be declared before /:id to avoid Express collision
router.get('/candidates/template',           downloadTemplate);
router.get('/candidates/stats',              getCandidateStats);
router.get('/candidates/evaluation-summary', getEvaluationSummary);
router.get('/candidates/ranking',            getCandidateRankings);
router.get('/candidates/search',             smartCandidateSearch);
router.get('/candidates/shortlist',          getShortlistedCandidates);
router.get('/candidates',                    getCandidates);
router.post('/candidates/import',            candidateFileUpload.single('file'), importCandidates);
router.post('/candidates/evaluate-all',      evaluateAllCandidates);
router.post('/candidates/shortlist/auto',    autoShortlistCandidates);
router.delete('/candidates',                 clearAllCandidates);

// ── Module 7: Reports & Analytics ─────────────────────────────────────────────
router.get('/analytics', getHRAnalytics);

// ── Module 8: Notifications ───────────────────────────────────────────────────
router.get('/notifications',          getNotifications);
router.patch('/notifications/read-all',markAllNotificationsAsRead);
router.patch('/notifications/:id/read',markNotificationAsRead);
router.delete('/notifications',       clearAllNotifications);

// ── Module 9: Export & Sharing ────────────────────────────────────────────────
router.get('/export/shortlist',          exportShortlist);
router.get('/export/evaluation-reports', exportEvaluationReports);
router.get('/export/hiring-stats',       exportHiringStats);

// ── Module 10: Admin Settings ─────────────────────────────────────────────────
router.get('/settings',                  getHRSettings);
router.put('/settings/ai-weights',       updateAIWeights);
router.post('/settings/team-members',    addTeamMember);
router.delete('/settings/team-members',  removeTeamMember);

// ── Parameterised Candidate Actions ────────────────────────────────────────────
router.post('/candidates/:id/evaluate',  evaluateSingleCandidate);
router.get('/candidates/:id/evaluation', getCandidateEvaluation);
router.patch('/candidates/:id/status',   updateCandidateStatus);
router.patch('/candidates/:id/shortlist',toggleShortlist);
router.delete('/candidates/:id',         deleteCandidate);

export default router;
