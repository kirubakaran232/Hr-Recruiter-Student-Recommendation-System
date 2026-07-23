import mongoose from 'mongoose';

const workSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const certSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    issuer: { type: String, trim: true, default: '' },
    year: { type: Number, default: null }
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    education: {
      college: { type: String, trim: true, default: '' },
      degree: { type: String, trim: true, default: '' },
      graduationYear: { type: Number, default: null },
      cgpa: { type: Number, min: 0, max: 10, default: null }
    },
    skills: [{ type: String, trim: true }],
    experience: [workSchema],
    internships: [workSchema],
    certifications: [certSchema],
    achievements: [{ type: String, trim: true }],
    links: {
      githubUrl: { type: String, trim: true, default: '' },
      linkedinUrl: { type: String, trim: true, default: '' },
      leetcodeUrl: { type: String, trim: true, default: '' },
      hackerrankUrl: { type: String, trim: true, default: '' },
      codechefUrl: { type: String, trim: true, default: '' },
      portfolioUrl: { type: String, trim: true, default: '' }
    },
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      originalName: { type: String, default: '' },
      uploadedAt: { type: Date, default: null }
    },
    resumeParsed: {
      skills: [{ type: String }],
      rawText: { type: String, default: '' },
      hasEducation: { type: Boolean, default: false },
      hasExperience: { type: Boolean, default: false },
      hasProjects: { type: Boolean, default: false },
      hasCertifications: { type: Boolean, default: false },
      wordCount: { type: Number, default: 0 }
    },
    scores: {
      resumeScore: { type: Number, default: 0, min: 0, max: 100 },
      githubScore: { type: Number, default: 0, min: 0, max: 100 },
      portfolioScore: { type: Number, default: 0, min: 0, max: 100 },
      codingScore: { type: Number, default: 0, min: 0, max: 100 },
      jobMatchScore: { type: Number, default: 0, min: 0, max: 100 }
    },
    aiAnalysis: {
      talentScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      breakdown: {
        resumeQuality: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        technicalSkills: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        projectQuality: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        githubActivity: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        codingPerformance: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        portfolioQuality: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        },
        certifications: {
          score: { type: Number, default: 0 },
          explanation: { type: String, default: '' }
        }
      },
      strengths: [{ type: String }],
      recommendations: [{ type: String }],
      summaryNarrative: { type: String, default: '' }
    },
    resumeIntelligence: {
      resumeScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      atsReadiness: { type: String, default: 'Needs Review' },
      checks: {
        structure: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        formatting: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        grammar: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        missingSections: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        skillsRepresentation: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        projectDescriptions: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        achievementImpact: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } }
      },
      suggestions: [
        {
          original: { type: String },
          improved: { type: String },
          reason: { type: String }
        }
      ],
      missingSectionList: [{ type: String }],
      topActionItems: [{ type: String }]
    },
    githubIntelligence: {
      githubScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      username: { type: String, default: '' },
      stats: {
        publicRepos: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        forks: { type: Number, default: 0 },
        followers: { type: Number, default: 0 }
      },
      repositoryQuality: {
        score: { type: Number, default: 0 },
        codeOrganization: { type: String, default: '' },
        documentation: { type: String, default: '' },
        cleanArchitecture: { type: String, default: '' },
        folderStructure: { type: String, default: '' }
      },
      developmentActivity: {
        score: { type: Number, default: 0 },
        commitFrequency: { type: String, default: '' },
        recentActivity: { type: String, default: '' },
        consistency: { type: String, default: '' }
      },
      technologies: [{ type: String }],
      topRepositories: [
        {
          name: { type: String },
          description: { type: String },
          language: { type: String },
          stars: { type: Number },
          forks: { type: Number },
          url: { type: String },
          qualityRating: { type: String }
        }
      ],
      suggestions: [{ type: String }]
    },
    portfolioIntelligence: {
      portfolioScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      url: { type: String, default: '' },
      deploymentStatus: { type: String, default: 'Live (SSL Certified)' },
      hostingProvider: { type: String, default: 'Vercel / Cloudflare' },
      checks: {
        uiDesign: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        responsiveness: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        performance: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        accessibility: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        projectPresentation: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        loadingSpeed: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } },
        deploymentStatus: { score: { type: Number, default: 0 }, feedback: { type: String, default: '' } }
      },
      suggestions: [{ type: String }]
    },
    codingIntelligence: {
      codingScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      totalSolved: { type: Number, default: 0 },
      difficulty: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
      },
      platforms: {
        leetcode: { connected: { type: Boolean, default: false }, solved: { type: Number, default: 0 }, rating: { type: Number, default: 0 }, rank: { type: String, default: '' } },
        hackerrank: { connected: { type: Boolean, default: false }, stars: { type: Number, default: 0 }, badges: { type: Number, default: 0 } },
        codechef: { connected: { type: Boolean, default: false }, rating: { type: Number, default: 0 }, stars: { type: String, default: '' } },
        hackerearth: { connected: { type: Boolean, default: false }, points: { type: Number, default: 0 }, rank: { type: String, default: '' } }
      },
      problemSolvingRating: { type: String, default: '' },
      feedback: [{ type: String }]
    },
    jobMatch: {
      matchScore: { type: Number, default: 0 },
      lastAnalyzedAt: { type: Date, default: null },
      lastJobDescription: { type: String, default: '' },
      jobTitle: { type: String, default: 'Java / Full Stack Developer' },
      matchingSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      recommendations: [{ type: String }]
    },
    skillGapAnalysis: {
      targetRole: { type: String, default: 'Full Stack Developer' },
      lastAnalyzedAt: { type: Date, default: null },
      readinessPercentage: { type: Number, default: 0 },
      currentSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      weeklyRoadmap: [
        {
          week: { type: Number },
          title: { type: String },
          description: { type: String },
          topics: [{ type: String }]
        }
      ]
    },
    assistantHistory: [
      {
        id: { type: String },
        sender: { type: String, enum: ['user', 'ai'] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
        structuredCard: {
          readinessScore: { type: Number },
          strengths: [{ type: String }],
          improvements: [{ type: String }]
        }
      }
    ],
    analyticsHistory: [
      {
        month: { type: String },
        talentScore: { type: Number },
        resumeScore: { type: Number },
        githubScore: { type: Number },
        codingScore: { type: Number },
        jobMatchScore: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

studentProfileSchema.methods.computeProfileCompletion = function computeProfileCompletion() {
  const checks = [
    Boolean(this.phone),
    Boolean(this.location),
    Boolean(this.bio),
    Boolean(this.education?.college),
    Boolean(this.education?.degree),
    Boolean(this.education?.graduationYear),
    Boolean(this.education?.cgpa),
    (this.skills?.length || 0) > 0,
    Boolean(this.links?.githubUrl),
    Boolean(this.links?.linkedinUrl),
    Boolean(this.links?.portfolioUrl),
    Boolean(this.resume?.url)
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / 12) * 100);
};

studentProfileSchema.methods.computeTalentScore = function computeTalentScore() {
  if (this.aiAnalysis?.talentScore) {
    return this.aiAnalysis.talentScore;
  }
  const completion = this.computeProfileCompletion();
  const r = this.scores?.resumeScore || 0;
  const g = this.scores?.githubScore || 0;
  const p = this.scores?.portfolioScore || 0;
  const c = this.scores?.codingScore || 0;
  const j = this.scores?.jobMatchScore || 0;
  return Math.round(completion * 0.20 + r * 0.25 + g * 0.20 + p * 0.15 + c * 0.10 + j * 0.10);
};

studentProfileSchema.methods.toProfileJSON = function toProfileJSON() {
  const profileCompletion = this.computeProfileCompletion();
  const talentScore = this.computeTalentScore();
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    phone: this.phone || '',
    location: this.location || '',
    bio: this.bio || '',
    education: {
      college: this.education?.college || '',
      degree: this.education?.degree || '',
      graduationYear: this.education?.graduationYear || null,
      cgpa: this.education?.cgpa || null
    },
    skills: this.skills || [],
    experience: this.experience || [],
    internships: this.internships || [],
    certifications: this.certifications || [],
    achievements: this.achievements || [],
    links: {
      githubUrl: this.links?.githubUrl || '',
      linkedinUrl: this.links?.linkedinUrl || '',
      leetcodeUrl: this.links?.leetcodeUrl || '',
      hackerrankUrl: this.links?.hackerrankUrl || '',
      codechefUrl: this.links?.codechefUrl || '',
      hackerearthUrl: this.links?.hackerearthUrl || '',
      portfolioUrl: this.links?.portfolioUrl || ''
    },
    resume: {
      url: this.resume?.url || '',
      publicId: this.resume?.publicId || '',
      originalName: this.resume?.originalName || '',
      uploadedAt: this.resume?.uploadedAt || null
    },
    resumeParsed: {
      skills: this.resumeParsed?.skills || [],
      hasEducation: this.resumeParsed?.hasEducation || false,
      hasExperience: this.resumeParsed?.hasExperience || false,
      hasProjects: this.resumeParsed?.hasProjects || false,
      hasCertifications: this.resumeParsed?.hasCertifications || false,
      wordCount: this.resumeParsed?.wordCount || 0
    },
    scores: {
      profileCompletion,
      talentScore,
      resumeScore: this.resumeIntelligence?.resumeScore || this.scores?.resumeScore || 0,
      githubScore: this.githubIntelligence?.githubScore || this.scores?.githubScore || 0,
      portfolioScore: this.portfolioIntelligence?.portfolioScore || this.scores?.portfolioScore || 0,
      codingScore: this.codingIntelligence?.codingScore || this.scores?.codingScore || 0,
      jobMatchScore: this.jobMatch?.matchScore || this.scores?.jobMatchScore || 0
    },
    aiAnalysis: this.aiAnalysis ? {
      talentScore: this.aiAnalysis.talentScore || talentScore,
      lastAnalyzedAt: this.aiAnalysis.lastAnalyzedAt || null,
      breakdown: {
        resumeQuality: {
          score: this.aiAnalysis.breakdown?.resumeQuality?.score || 0,
          explanation: this.aiAnalysis.breakdown?.resumeQuality?.explanation || ''
        },
        technicalSkills: {
          score: this.aiAnalysis.breakdown?.technicalSkills?.score || 0,
          explanation: this.aiAnalysis.breakdown?.technicalSkills?.explanation || ''
        },
        projectQuality: {
          score: this.aiAnalysis.breakdown?.projectQuality?.score || 0,
          explanation: this.aiAnalysis.breakdown?.projectQuality?.explanation || ''
        },
        githubActivity: {
          score: this.aiAnalysis.breakdown?.githubActivity?.score || 0,
          explanation: this.aiAnalysis.breakdown?.githubActivity?.explanation || ''
        },
        codingPerformance: {
          score: this.aiAnalysis.breakdown?.codingPerformance?.score || 0,
          explanation: this.aiAnalysis.breakdown?.codingPerformance?.explanation || ''
        },
        portfolioQuality: {
          score: this.aiAnalysis.breakdown?.portfolioQuality?.score || 0,
          explanation: this.aiAnalysis.breakdown?.portfolioQuality?.explanation || ''
        },
        certifications: {
          score: this.aiAnalysis.breakdown?.certifications?.score || 0,
          explanation: this.aiAnalysis.breakdown?.certifications?.explanation || ''
        }
      },
      strengths: this.aiAnalysis.strengths || [],
      recommendations: this.aiAnalysis.recommendations || [],
      summaryNarrative: this.aiAnalysis.summaryNarrative || ''
    } : null,
    resumeIntelligence: this.resumeIntelligence ? {
      resumeScore: this.resumeIntelligence.resumeScore || 0,
      lastAnalyzedAt: this.resumeIntelligence.lastAnalyzedAt || null,
      atsReadiness: this.resumeIntelligence.atsReadiness || 'Needs Review',
      checks: this.resumeIntelligence.checks || {},
      suggestions: this.resumeIntelligence.suggestions || [],
      missingSectionList: this.resumeIntelligence.missingSectionList || [],
      topActionItems: this.resumeIntelligence.topActionItems || []
    } : null,
    githubIntelligence: this.githubIntelligence ? {
      githubScore: this.githubIntelligence.githubScore || 0,
      lastAnalyzedAt: this.githubIntelligence.lastAnalyzedAt || null,
      username: this.githubIntelligence.username || '',
      stats: this.githubIntelligence.stats || {},
      repositoryQuality: this.githubIntelligence.repositoryQuality || {},
      developmentActivity: this.githubIntelligence.developmentActivity || {},
      technologies: this.githubIntelligence.technologies || [],
      topRepositories: this.githubIntelligence.topRepositories || [],
      suggestions: this.githubIntelligence.suggestions || []
    } : null,
    portfolioIntelligence: this.portfolioIntelligence ? {
      portfolioScore: this.portfolioIntelligence.portfolioScore || 0,
      lastAnalyzedAt: this.portfolioIntelligence.lastAnalyzedAt || null,
      url: this.portfolioIntelligence.url || '',
      deploymentStatus: this.portfolioIntelligence.deploymentStatus || 'Live (SSL Certified)',
      hostingProvider: this.portfolioIntelligence.hostingProvider || 'Vercel / Cloudflare',
      checks: this.portfolioIntelligence.checks || {},
      suggestions: this.portfolioIntelligence.suggestions || []
    } : null,
    codingIntelligence: this.codingIntelligence ? {
      codingScore: this.codingIntelligence.codingScore || 0,
      lastAnalyzedAt: this.codingIntelligence.lastAnalyzedAt || null,
      totalSolved: this.codingIntelligence.totalSolved || 0,
      difficulty: this.codingIntelligence.difficulty || {},
      platforms: this.codingIntelligence.platforms || {},
      problemSolvingRating: this.codingIntelligence.problemSolvingRating || '',
      feedback: this.codingIntelligence.feedback || []
    } : null,
    jobMatch: this.jobMatch ? {
      matchScore: this.jobMatch.matchScore || 0,
      lastAnalyzedAt: this.jobMatch.lastAnalyzedAt || null,
      lastJobDescription: this.jobMatch.lastJobDescription || '',
      jobTitle: this.jobMatch.jobTitle || 'Java / Full Stack Developer',
      matchingSkills: this.jobMatch.matchingSkills || [],
      missingSkills: this.jobMatch.missingSkills || [],
      recommendations: this.jobMatch.recommendations || []
    } : null,
    skillGapAnalysis: this.skillGapAnalysis ? {
      targetRole: this.skillGapAnalysis.targetRole || 'Full Stack Developer',
      lastAnalyzedAt: this.skillGapAnalysis.lastAnalyzedAt || null,
      readinessPercentage: this.skillGapAnalysis.readinessPercentage || 0,
      currentSkills: this.skillGapAnalysis.currentSkills || [],
      missingSkills: this.skillGapAnalysis.missingSkills || [],
      weeklyRoadmap: this.skillGapAnalysis.weeklyRoadmap || []
    } : null,
    assistantHistory: this.assistantHistory || [],
    analyticsHistory: this.analyticsHistory || [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
