import mongoose from 'mongoose';

// ── Contact sub-schema ────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema(
  {
    fullName:    { type: String, trim: true, maxlength: 120, default: '' },
    email:       { type: String, trim: true, lowercase: true, default: '' },
    phone:       { type: String, trim: true, maxlength: 30, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

// ── Company sub-schema ────────────────────────────────────────────────────────
const companySchema = new mongoose.Schema(
  {
    name:          { type: String, trim: true, maxlength: 200, default: '' },
    logoUrl:       { type: String, default: '' },
    logoPublicId:  { type: String, default: '' }, // Cloudinary public_id for deletion
    industry:      { type: String, trim: true, maxlength: 100, default: '' },
    description:   { type: String, trim: true, maxlength: 2000, default: '' },
    website:       { type: String, trim: true, default: '' },
    location:      { type: String, trim: true, maxlength: 200, default: '' }
  },
  { _id: false }
);

// ── Hiring Preferences sub-schema ─────────────────────────────────────────────
const hiringPreferencesSchema = new mongoose.Schema(
  {
    scoreThreshold:      { type: Number, min: 0, max: 100, default: 60 },
    preferredSkills:     { type: [String], default: [] },
    preferredExperience: {
      type: String,
      enum: ['Any', 'Fresher (0–1 yr)', '1–2 years', '2–5 years', '5–10 years', '10+ years'],
      default: 'Any'
    },
    hiringDepartments: { type: [String], default: [] }
  },
  { _id: false }
);

// ── AI Weights sub-schema (Module 10) ─────────────────────────────────────────
const aiWeightsSchema = new mongoose.Schema(
  {
    resumeWeight:       { type: Number, min: 0, max: 100, default: 20 },
    githubWeight:       { type: Number, min: 0, max: 100, default: 20 },
    codingWeight:       { type: Number, min: 0, max: 100, default: 15 },
    portfolioWeight:    { type: Number, min: 0, max: 100, default: 12 },
    projectWeight:      { type: Number, min: 0, max: 100, default: 18 },
    certWeight:         { type: Number, min: 0, max: 100, default: 15 }
  },
  { _id: false }
);

// ── Team Member sub-schema (Module 10) ────────────────────────────────────────
const teamMemberSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    role:     { type: String, enum: ['Admin', 'Recruiter', 'Viewer'], default: 'Recruiter' },
    addedAt:  { type: Date, default: Date.now }
  },
  { _id: false }
);

// ── Root schema ───────────────────────────────────────────────────────────────
const hrProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    company:           { type: companySchema,           default: () => ({}) },
    contact:           { type: contactSchema,           default: () => ({}) },
    hiringPreferences: { type: hiringPreferencesSchema, default: () => ({}) },
    aiWeights:         { type: aiWeightsSchema,         default: () => ({}) },
    teamMembers:       { type: [teamMemberSchema],       default: [] }
  },
  { timestamps: true }
);

// ── Serialisation helper ──────────────────────────────────────────────────────
hrProfileSchema.methods.toProfileJSON = function toProfileJSON() {
  return {
    id:                this._id.toString(),
    userId:            this.userId.toString(),
    company:           this.company,
    contact:           this.contact,
    hiringPreferences: this.hiringPreferences,
    aiWeights:         this.aiWeights,
    teamMembers:       this.teamMembers,
    createdAt:         this.createdAt,
    updatedAt:         this.updatedAt
  };
};

export const HRProfile = mongoose.model('HRProfile', hrProfileSchema);
