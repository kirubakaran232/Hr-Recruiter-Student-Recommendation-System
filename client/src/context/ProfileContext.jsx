import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  fetchProfile,
  saveProfile,
  uploadResume as uploadResumeApi,
  removeResume,
  runAIAnalysis as runAIAnalysisApi,
  analyzeResumeIntelligence as analyzeResumeIntelligenceApi,
  rewriteResumeBullet as rewriteResumeBulletApi,
  analyzeGitHubIntelligence as analyzeGitHubIntelligenceApi,
  analyzePortfolioIntelligence as analyzePortfolioIntelligenceApi,
  analyzeCodingIntelligence as analyzeCodingIntelligenceApi,
  analyzeJobMatch as analyzeJobMatchApi,
  analyzeSkillGap as analyzeSkillGapApi,
  sendCareerAssistantMessage as sendCareerAssistantMessageApi,
  fetchDashboardAnalytics as fetchDashboardAnalyticsApi
} from '../services/profile.service.js';

const ProfileContext = createContext(null);

const DEFAULT_SCORES = {
  profileCompletion: 0,
  talentScore: 0,
  resumeScore: 0,
  githubScore: 0,
  portfolioScore: 0,
  codingScore: 0,
  jobMatchScore: 0
};

const DEFAULT_PROFILE = {
  phone: '',
  location: '',
  bio: '',
  education: { college: '', degree: '', graduationYear: null, cgpa: null },
  skills: [],
  experience: [],
  internships: [],
  certifications: [],
  achievements: [],
  links: { githubUrl: '', linkedinUrl: '', leetcodeUrl: '', hackerrankUrl: '', codechefUrl: '', hackerearthUrl: '', portfolioUrl: '' },
  resume: { url: '', publicId: '', originalName: '', uploadedAt: null },
  resumeParsed: { skills: [], hasEducation: false, hasExperience: false, hasProjects: false, hasCertifications: false, wordCount: 0 },
  aiAnalysis: null,
  resumeIntelligence: null,
  githubIntelligence: null,
  portfolioIntelligence: null,
  codingIntelligence: null,
  jobMatch: null,
  skillGapAnalysis: null,
  assistantHistory: [],
  analyticsHistory: []
};

export function ProfileProvider({ children }) {
  const { isAuthenticated, profile: authProfile } = useAuth();
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const applyResponse = useCallback((data) => {
    const p = data.profile;
    if (!p) {
      setProfileData(DEFAULT_PROFILE);
      setScores(data.scores || DEFAULT_SCORES);
      return;
    }
    const { scores: s, ...rest } = p;
    setProfileData(rest);
    setScores(s || DEFAULT_SCORES);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || authProfile?.role !== 'student') {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProfile()
      .then(applyResponse)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authProfile?.role, applyResponse]);

  const updateProfile = useCallback(async (payload) => {
    const data = await saveProfile(payload);
    applyResponse(data);
    return data;
  }, [applyResponse]);

  const uploadResume = useCallback(async (file) => {
    const data = await uploadResumeApi(file);
    applyResponse(data);
    return data;
  }, [applyResponse]);

  const deleteResume = useCallback(async () => {
    const data = await removeResume();
    applyResponse(data);
    return data;
  }, [applyResponse]);

  const analyzeProfile = useCallback(async () => {
    setAnalyzing(true);
    try {
      const data = await runAIAnalysisApi();
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const runResumeIntelligence = useCallback(async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeResumeIntelligenceApi();
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const rewriteBullet = useCallback(async (text) => {
    return await rewriteResumeBulletApi(text);
  }, []);

  const runGitHubIntelligence = useCallback(async (username) => {
    setAnalyzing(true);
    try {
      const data = await analyzeGitHubIntelligenceApi(username);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const runPortfolioIntelligence = useCallback(async (url) => {
    setAnalyzing(true);
    try {
      const data = await analyzePortfolioIntelligenceApi(url);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const runCodingIntelligence = useCallback(async (platformUrls) => {
    setAnalyzing(true);
    try {
      const data = await analyzeCodingIntelligenceApi(platformUrls);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const runJobMatch = useCallback(async (jobDescription) => {
    setAnalyzing(true);
    try {
      const data = await analyzeJobMatchApi(jobDescription);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const runSkillGap = useCallback(async (targetRole) => {
    setAnalyzing(true);
    try {
      const data = await analyzeSkillGapApi(targetRole);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const askAssistant = useCallback(async (message) => {
    setAnalyzing(true);
    try {
      const data = await sendCareerAssistantMessageApi(message);
      applyResponse(data);
      return data;
    } finally {
      setAnalyzing(false);
    }
  }, [applyResponse]);

  const loadAnalytics = useCallback(async () => {
    return await fetchDashboardAnalyticsApi();
  }, []);

  const value = useMemo(
    () => ({
      profileData,
      scores,
      loading,
      error,
      analyzing,
      updateProfile,
      uploadResume,
      deleteResume,
      analyzeProfile,
      runResumeIntelligence,
      rewriteBullet,
      runGitHubIntelligence,
      runPortfolioIntelligence,
      runCodingIntelligence,
      runJobMatch,
      runSkillGap,
      askAssistant,
      loadAnalytics
    }),
    [
      profileData,
      scores,
      loading,
      error,
      analyzing,
      updateProfile,
      uploadResume,
      deleteResume,
      analyzeProfile,
      runResumeIntelligence,
      rewriteBullet,
      runGitHubIntelligence,
      runPortfolioIntelligence,
      runCodingIntelligence,
      runJobMatch,
      runSkillGap,
      askAssistant,
      loadAnalytics
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
