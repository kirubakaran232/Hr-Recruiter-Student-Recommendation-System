import mongoose from 'mongoose';

// ── Schema ─────────────────────────────────────────────────────────────────────
const candidateSchema = new mongoose.Schema(
  {
    // Who imported this candidate
    hrUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Core identity
    name:  { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true },

    // Profile links
    resumeUrl:     { type: String, trim: true, default: '' },
    githubUrl:     { type: String, trim: true, default: '' },
    linkedinUrl:   { type: String, trim: true, default: '' },
    portfolioUrl:  { type: String, trim: true, default: '' },
    leetcodeUrl:   { type: String, trim: true, default: '' },
    hackerrankUrl: { type: String, trim: true, default: '' },
    codechefUrl:   { type: String, trim: true, default: '' },

    // Academic / professional background
    experienceYears: { type: Number, default: null, min: 0, max: 60 },
    skills:          { type: [String], default: [] },
    college:         { type: String, trim: true, default: '' },
    graduationYear:  { type: Number, default: null },
    cgpa:            { type: Number, default: null, min: 0, max: 10 },
    location:        { type: String, trim: true, default: '' },
    expectedSalary:  { type: Number, default: null }, // annual salary in USD or local currency

    // Import metadata
    importSource: { type: String, default: '' }, // original filename

    // Workflow status
    status: {
      type: String,
      enum: ['pending', 'evaluated', 'shortlisted', 'rejected'],
      default: 'pending',
      index: true
    },

    // AI scoring (populated by Module 3+)
    aiScore:      { type: Number, default: null },
    jdMatchScore: { type: Number, default: null },
    aiEvaluation: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

// ── Compound unique index: one email per HR recruiter ────────────────────────
candidateSchema.index({ hrUserId: 1, email: 1 }, { unique: true });

// ── Helpers ───────────────────────────────────────────────────────────────────
candidateSchema.methods.toSummaryJSON = function () {
  return {
    id:              this._id.toString(),
    name:            this.name,
    email:           this.email,
    resumeUrl:       this.resumeUrl,
    githubUrl:       this.githubUrl,
    linkedinUrl:     this.linkedinUrl,
    portfolioUrl:    this.portfolioUrl,
    leetcodeUrl:     this.leetcodeUrl,
    hackerrankUrl:   this.hackerrankUrl,
    codechefUrl:     this.codechefUrl,
    experienceYears: this.experienceYears,
    skills:          this.skills,
    college:         this.college,
    graduationYear:  this.graduationYear,
    cgpa:            this.cgpa,
    location:        this.location,
    expectedSalary:  this.expectedSalary,
    importSource:    this.importSource,
    status:          this.status,
    aiScore:         this.aiScore,
    jdMatchScore:    this.jdMatchScore,
    createdAt:       this.createdAt
  };
};

/** Returns a flag map indicating which platform links are present. */
candidateSchema.methods.platformPresence = function () {
  return {
    hasResume:     Boolean(this.resumeUrl),
    hasGithub:     Boolean(this.githubUrl),
    hasLinkedIn:   Boolean(this.linkedinUrl),
    hasPortfolio:  Boolean(this.portfolioUrl),
    hasLeetCode:   Boolean(this.leetcodeUrl),
    hasHackerRank: Boolean(this.hackerrankUrl),
    hasCodeChef:   Boolean(this.codechefUrl)
  };
};

export const Candidate = mongoose.model('Candidate', candidateSchema);
