import { HRProfile } from '../models/HRProfile.js';
import { cloudinary } from '../config/cloudinary.js';

// ── Helper: stream buffer to Cloudinary ──────────────────────────────────────
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// ── GET /api/hr/company ───────────────────────────────────────────────────────
export async function getHRProfile(req, res, next) {
  try {
    const profile = await HRProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(200).json({ hrProfile: null });
    }

    res.status(200).json({ hrProfile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}

// ── PUT /api/hr/company ───────────────────────────────────────────────────────
export async function upsertHRProfile(req, res, next) {
  try {
    const { company, contact, hiringPreferences } = req.body;

    let profile = await HRProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new HRProfile({ userId: req.user._id });
    }

    // ── Company fields (partial update) ──────────────────────────────────────
    if (company) {
      if (company.name        !== undefined) profile.company.name        = company.name.trim();
      if (company.industry    !== undefined) profile.company.industry    = company.industry.trim();
      if (company.description !== undefined) profile.company.description = company.description.trim();
      if (company.website     !== undefined) profile.company.website     = company.website.trim();
      if (company.location    !== undefined) profile.company.location    = company.location.trim();
    }

    // ── Contact fields (partial update) ──────────────────────────────────────
    if (contact) {
      if (contact.fullName    !== undefined) profile.contact.fullName    = contact.fullName.trim();
      if (contact.email       !== undefined) profile.contact.email       = contact.email.trim().toLowerCase();
      if (contact.phone       !== undefined) profile.contact.phone       = contact.phone.trim();
      if (contact.linkedinUrl !== undefined) profile.contact.linkedinUrl = contact.linkedinUrl.trim();
    }

    // ── Hiring preferences (partial update) ──────────────────────────────────
    if (hiringPreferences) {
      if (hiringPreferences.scoreThreshold      !== undefined) profile.hiringPreferences.scoreThreshold      = Number(hiringPreferences.scoreThreshold);
      if (hiringPreferences.preferredSkills     !== undefined) profile.hiringPreferences.preferredSkills     = hiringPreferences.preferredSkills;
      if (hiringPreferences.preferredExperience !== undefined) profile.hiringPreferences.preferredExperience = hiringPreferences.preferredExperience;
      if (hiringPreferences.hiringDepartments   !== undefined) profile.hiringPreferences.hiringDepartments   = hiringPreferences.hiringDepartments;
    }

    profile.markModified('company');
    profile.markModified('contact');
    profile.markModified('hiringPreferences');

    await profile.save();
    res.status(200).json({ hrProfile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/hr/company/logo ─────────────────────────────────────────────────
export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('No image file provided');
      err.statusCode = 400;
      throw err;
    }

    let profile = await HRProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new HRProfile({ userId: req.user._id });
    }

    // Delete old logo from Cloudinary if it exists
    if (profile.company.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(profile.company.logoPublicId);
      } catch (cleanupErr) {
        console.warn('Failed to delete old logo from Cloudinary:', cleanupErr.message);
      }
    }

    // Upload new logo
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder:         'talentos-ai/hr-logos',
      resource_type:  'image',
      transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }]
    });

    profile.company.logoUrl      = result.secure_url;
    profile.company.logoPublicId = result.public_id;
    profile.markModified('company');

    await profile.save();
    res.status(200).json({
      logoUrl:      result.secure_url,
      logoPublicId: result.public_id,
      hrProfile:    profile.toProfileJSON()
    });
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/hr/company/logo ───────────────────────────────────────────────
export async function deleteLogo(req, res, next) {
  try {
    const profile = await HRProfile.findOne({ userId: req.user._id });

    if (!profile || !profile.company.logoPublicId) {
      return res.status(200).json({ message: 'No logo to delete' });
    }

    await cloudinary.uploader.destroy(profile.company.logoPublicId);

    profile.company.logoUrl      = '';
    profile.company.logoPublicId = '';
    profile.markModified('company');

    await profile.save();
    res.status(200).json({ message: 'Logo deleted', hrProfile: profile.toProfileJSON() });
  } catch (error) {
    next(error);
  }
}
