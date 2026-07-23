import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { cloudinary } from '../config/cloudinary.js';

const TECH_SKILLS = [
  'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','Ruby','PHP',
  'Swift','Kotlin','Scala','R','Dart','Perl',
  'React','Vue','Angular','Next.js','Nuxt','Svelte','Express','FastAPI','Django',
  'Flask','Spring Boot','Laravel','Rails','NestJS','GraphQL',
  'Node.js','Deno','Bun',
  'MongoDB','PostgreSQL','MySQL','SQLite','Redis','Cassandra','DynamoDB','Firebase',
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','Jenkins','GitHub Actions','CI/CD',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy',
  'Git','Linux','Bash','HTML','CSS','Sass','Tailwind','Bootstrap','REST API',
  'Data Structures','Algorithms','System Design','Microservices','DevOps','Agile','Scrum'
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  return TECH_SKILLS.filter(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(lower);
  });
}

function detectSections(text) {
  const lower = text.toLowerCase();
  return {
    hasEducation: /\b(education|qualification|academic|university|college|degree|gpa|cgpa)\b/.test(lower),
    hasExperience: /\b(experience|employment|work history|professional|worked at|position)\b/.test(lower),
    hasProjects: /\b(project|projects|portfolio|built|developed|created|implemented)\b/.test(lower),
    hasCertifications: /\b(certification|certificate|certified|credential|course|issued by)\b/.test(lower)
  };
}

async function uploadToCloudinary(buffer, publicId, mimetype) {
  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'talentos-ai/resumes', public_id: publicId, overwrite: true },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
  } catch (err) {
    console.warn('Cloudinary upload failed, falling back to embedded URI:', err.message);
    const base64 = buffer.toString('base64');
    return {
      secure_url: `data:${mimetype};base64,${base64}`,
      public_id: publicId
    };
  }
}

async function extractText(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const parse = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
      const data = await parse(buffer);
      return data?.text || '';
    }
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || '';
  } catch (err) {
    console.warn('Resume text extraction failed:', err.message);
    // Fallback simple string extraction for text in buffer
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    const cleanText = str.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    return cleanText;
  }
}

function computeResumeScore(sections, skillCount, wordCount) {
  let score = 20;
  if (sections.hasExperience) score += 15;
  if (sections.hasEducation) score += 15;
  if (sections.hasProjects) score += 10;
  if (sections.hasCertifications) score += 10;
  if (skillCount >= 3) score += 15;
  if (wordCount >= 400) score += 15;
  return Math.min(100, score);
}

async function resolveUser(firebaseUid) {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      throw err;
    }

    const user = await resolveUser(req.firebaseUser.uid);
    const { buffer, mimetype, originalname } = req.file;
    const publicId = `${user._id}_resume`;

    const cloudResult = await uploadToCloudinary(buffer, publicId, mimetype);

    let rawText = '';
    try {
      rawText = await extractText(buffer, mimetype);
    } catch (parseErr) {
      console.warn('Resume text extraction failed:', parseErr.message);
    }

    const extractedSkills = extractSkills(rawText);
    const sections = detectSections(rawText);
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const resumeScore = computeResumeScore(sections, extractedSkills.length, wordCount);

    let profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    // Merge extracted skills into profile skills
    if (extractedSkills.length > 0) {
      const existingSet = new Set(profile.skills || []);
      extractedSkills.forEach(sk => existingSet.add(sk));
      profile.skills = Array.from(existingSet);
      profile.markModified('skills');
    }

    profile.resume = {
      url: cloudResult.secure_url,
      publicId: cloudResult.public_id,
      originalName: originalname,
      uploadedAt: new Date()
    };
    profile.resumeParsed = {
      skills: extractedSkills,
      rawText: rawText.slice(0, 5000),
      ...sections,
      wordCount
    };

    // Auto-run Resume Intelligence audit
    try {
      const { performResumeIntelligenceAudit } = await import('../services/resumeIntelligence.service.js');
      const intel = await performResumeIntelligenceAudit(profile);
      profile.resumeIntelligence = intel;
      profile.scores.resumeScore = intel.resumeScore;
      profile.markModified('resumeIntelligence');
    } catch (auditErr) {
      profile.scores.resumeScore = resumeScore;
    }

    // Recalculate Overall Talent Score
    const rScore = profile.scores.resumeScore || 0;
    const ghScore = profile.scores.githubScore || 0;
    const pScore = profile.scores.portfolioScore || 0;
    const cScore = profile.scores.codingScore || 0;
    const jScore = profile.scores.jobMatchScore || 0;
    const activeScores = [rScore, ghScore, pScore, cScore, jScore].filter(s => s > 0);

    profile.scores.talentScore = activeScores.length > 0
      ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
      : 0;

    // Auto-update overall AI Profile Analysis narrative & category scores
    try {
      const { performAIProfileAnalysis } = await import('../services/aiAnalysis.service.js');
      const aiRes = await performAIProfileAnalysis(profile);
      profile.aiAnalysis = aiRes;
      profile.markModified('aiAnalysis');
    } catch (aiErr) {
      console.warn('AI analysis auto update warning:', aiErr.message);
    }

    profile.markModified('resume');
    profile.markModified('resumeParsed');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({ profile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    const profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile || !profile.resume?.publicId) {
      const err = new Error('No resume found');
      err.statusCode = 404;
      throw err;
    }

    try {
      await cloudinary.uploader.destroy(profile.resume.publicId, { resource_type: 'raw' });
    } catch (cdnErr) {
      console.warn('Cloudinary delete failed:', cdnErr.message);
    }

    profile.resume = { url: '', publicId: '', originalName: '', uploadedAt: null };
    profile.resumeParsed = { skills: [], rawText: '', hasEducation: false, hasExperience: false, hasProjects: false, hasCertifications: false, wordCount: 0 };
    profile.resumeIntelligence = {
      resumeScore: 0,
      lastAuditedAt: new Date(),
      breakdown: {
        formattingATS: { score: 0, feedback: 'No resume uploaded' },
        impactQuantification: { score: 0, feedback: 'No resume uploaded' },
        keywordDensity: { score: 0, feedback: 'No resume uploaded' },
        sectionCompleteness: { score: 0, feedback: 'No resume uploaded' }
      },
      actionableSuggestions: ['Upload a PDF/DOCX resume to evaluate ATS readiness.']
    };
    profile.scores.resumeScore = 0;

    // Recalculate Overall Talent Score after removal
    const rScore = 0;
    const ghScore = profile.scores.githubScore || 0;
    const pScore = profile.scores.portfolioScore || 0;
    const cScore = profile.scores.codingScore || 0;
    const jScore = profile.scores.jobMatchScore || 0;
    const activeScores = [rScore, ghScore, pScore, cScore, jScore].filter(s => s > 0);

    profile.scores.talentScore = activeScores.length > 0
      ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
      : 0;

    // Auto-update overall AI Profile Analysis narrative & breakdown
    try {
      const { performAIProfileAnalysis } = await import('../services/aiAnalysis.service.js');
      const aiRes = await performAIProfileAnalysis(profile);
      profile.aiAnalysis = aiRes;
      profile.markModified('aiAnalysis');
    } catch (aiErr) {
      console.warn('AI analysis auto update warning:', aiErr.message);
    }

    profile.markModified('resume');
    profile.markModified('resumeParsed');
    profile.markModified('resumeIntelligence');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({ profile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}

export async function analyzeResumeIntelligence(req, res, next) {
  try {
    const user = await resolveUser(req.firebaseUser.uid);
    let profile = await StudentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: user._id });
    }

    const { performResumeIntelligenceAudit } = await import('../services/resumeIntelligence.service.js');
    const intel = await performResumeIntelligenceAudit(profile);

    profile.resumeIntelligence = intel;
    profile.scores.resumeScore = intel.resumeScore;
    profile.markModified('resumeIntelligence');
    profile.markModified('scores');

    await profile.save();
    res.status(200).json({
      success: true,
      message: 'Resume intelligence analysis completed successfully',
      profile: profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function rewriteBulletPoint(req, res, next) {
  try {
    const { text } = req.body;
    const { enhanceBulletPoint } = await import('../services/resumeIntelligence.service.js');
    const result = enhanceBulletPoint(text);
    res.status(200).json({
      success: true,
      suggestion: result
    });
  } catch (error) {
    next(error);
  }
}
