import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CheckCircle, Upload, X, ExternalLink, User, Phone, MapPin, FileText, GraduationCap, Code2, Briefcase, Award, Star, Link } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className='profile-form-section'>
      <div className='pfs-header'>
        <Icon size={18} color='#ffdc5d' />
        <h3>{title}</h3>
      </div>
      <div className='pfs-body'>{children}</div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className='field-row'>
      <label className='field-label'>{label}</label>
      {children}
    </div>
  );
}

function WorkItem({ item, index, onChange, onRemove, fields }) {
  return (
    <div className='dynamic-item'>
      <button className='dynamic-item-remove' type='button' onClick={() => onRemove(index)}>
        <Trash2 size={14} />
      </button>
      <div className='dynamic-item-fields'>
        {fields.map((f) => (
          <input
            key={f.key}
            className='dash-input'
            placeholder={f.placeholder}
            value={item[f.key] || ''}
            onChange={(e) => onChange(index, f.key, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProfileSection() {
  const { profileData, scores, updateProfile, uploadResume, deleteResume } = useProfile();
  const { profile: authProfile } = useAuth();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (profileData) {
      setForm({
        phone: profileData.phone || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        education: { ...profileData.education },
        skills: [...(profileData.skills || [])],
        experience: profileData.experience?.map(e => ({ ...e })) || [],
        internships: profileData.internships?.map(i => ({ ...i })) || [],
        certifications: profileData.certifications?.map(c => ({ ...c })) || [],
        achievements: [...(profileData.achievements || [])],
        links: { ...profileData.links }
      });
    }
  }, [profileData]);

  if (!form) return <div className='dash-loading'>Loading profile…</div>;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setEdu = (key, value) => setForm((f) => ({ ...f, education: { ...f.education, [key]: value } }));
  const setLink = (key, value) => setForm((f) => ({ ...f, links: { ...f.links, [key]: value } }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
    setSkillInput('');
  };
  const removeSkill = (s) => set('skills', form.skills.filter((x) => x !== s));

  const addWorkItem = (key) => set(key, [...form[key], { title: '', company: '', duration: '', description: '' }]);
  const removeWorkItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));
  const updateWorkItem = (key, idx, field, val) => {
    const arr = [...form[key]];
    arr[idx] = { ...arr[idx], [field]: val };
    set(key, arr);
  };

  const addCert = () => set('certifications', [...form.certifications, { name: '', issuer: '', year: '' }]);
  const removeCert = (idx) => set('certifications', form.certifications.filter((_, i) => i !== idx));
  const updateCert = (idx, field, val) => {
    const arr = [...form.certifications];
    arr[idx] = { ...arr[idx], [field]: val };
    set('certifications', arr);
  };

  const addAchievement = () => set('achievements', [...form.achievements, '']);
  const removeAchievement = (idx) => set('achievements', form.achievements.filter((_, i) => i !== idx));
  const updateAchievement = (idx, val) => {
    const arr = [...form.achievements];
    arr[idx] = val;
    set('achievements', arr);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadResume(file);
    } catch (err) {
      alert(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Remove resume?')) return;
    try {
      await deleteResume();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove resume');
    }
  };

  const WORK_FIELDS = [
    { key: 'title', placeholder: 'Job title / Role' },
    { key: 'company', placeholder: 'Company / Organisation' },
    { key: 'duration', placeholder: 'Duration  e.g. Jan 2024 – May 2024' },
    { key: 'description', placeholder: 'Brief description' }
  ];

  return (
    <div className='profile-section'>
      <div className='profile-section-inner'>
        {/* Left sidebar card */}
        <div className='profile-side-card'>
          <div className='profile-avatar-large'>
            {authProfile?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className='profile-side-name'>{authProfile?.name}</div>
          <div className='profile-side-email'>{authProfile?.email}</div>
          <div className='profile-side-role'>Student</div>

          <div className='profile-side-stats'>
            <div className='side-stat'>
              <strong>{scores.profileCompletion}%</strong>
              <span>Profile Complete</span>
            </div>
            <div className='side-stat'>
              <strong>{scores.talentScore}</strong>
              <span>Talent Score</span>
            </div>
            <div className='side-stat'>
              <strong>{form.skills?.length || 0}</strong>
              <span>Skills</span>
            </div>
          </div>

          {/* Resume card */}
          <div className='resume-side-card'>
            <div className='resume-side-header'>
              <FileText size={16} />
              <span>Resume</span>
            </div>
            {profileData.resume?.url ? (
              <div className='resume-uploaded'>
                <a href={profileData.resume.url} target='_blank' rel='noreferrer' className='resume-filename'>
                  <ExternalLink size={12} /> {profileData.resume.originalName}
                </a>
                <button className='resume-delete-btn' type='button' onClick={handleDeleteResume}>
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <label className='resume-upload-label'>
                <input type='file' accept='.pdf,.docx' onChange={handleResumeUpload} hidden />
                <Upload size={16} />
                {uploading ? 'Uploading…' : 'Upload PDF or DOCX'}
              </label>
            )}
          </div>
        </div>

        {/* Right form */}
        <div className='profile-form-panel'>
          <FormSection title='Personal Information' icon={User}>
            <div className='field-grid-2'>
              <FieldRow label='Full Name'>
                <input className='dash-input' value={authProfile?.name || ''} disabled />
              </FieldRow>
              <FieldRow label='Email'>
                <input className='dash-input' value={authProfile?.email || ''} disabled />
              </FieldRow>
              <FieldRow label='Phone'>
                <input className='dash-input' placeholder='+91 9876543210' value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </FieldRow>
              <FieldRow label='Location'>
                <input className='dash-input' placeholder='City, Country' value={form.location} onChange={(e) => set('location', e.target.value)} />
              </FieldRow>
            </div>
            <FieldRow label='Bio'>
              <textarea
                className='dash-input dash-textarea'
                placeholder='A short intro about yourself…'
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
              />
            </FieldRow>
          </FormSection>

          <FormSection title='Education' icon={GraduationCap}>
            <div className='field-grid-2'>
              <FieldRow label='College / University'>
                <input className='dash-input' placeholder='MIT, IIT Bombay…' value={form.education.college} onChange={(e) => setEdu('college', e.target.value)} />
              </FieldRow>
              <FieldRow label='Degree'>
                <input className='dash-input' placeholder='B.E. Computer Science' value={form.education.degree} onChange={(e) => setEdu('degree', e.target.value)} />
              </FieldRow>
              <FieldRow label='Graduation Year'>
                <input className='dash-input' type='number' placeholder='2026' min='2000' max='2040' value={form.education.graduationYear || ''} onChange={(e) => setEdu('graduationYear', e.target.value ? Number(e.target.value) : null)} />
              </FieldRow>
              <FieldRow label='CGPA'>
                <input className='dash-input' type='number' placeholder='8.5' min='0' max='10' step='0.01' value={form.education.cgpa || ''} onChange={(e) => setEdu('cgpa', e.target.value ? Number(e.target.value) : null)} />
              </FieldRow>
            </div>
          </FormSection>

          <FormSection title='Skills' icon={Code2}>
            <div className='skill-tags-area'>
              {form.skills.map((s) => (
                <span key={s} className='skill-tag'>
                  {s}
                  <button type='button' onClick={() => removeSkill(s)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className='skill-input-row'>
              <input
                className='dash-input'
                placeholder='Type a skill and press Enter or +'
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button type='button' className='add-skill-btn' onClick={addSkill}>
                <Plus size={16} />
              </button>
            </div>
          </FormSection>

          <FormSection title='Experience' icon={Briefcase}>
            {form.experience.map((item, idx) => (
              <WorkItem key={idx} item={item} index={idx} fields={WORK_FIELDS} onChange={(i, f, v) => updateWorkItem('experience', i, f, v)} onRemove={(i) => removeWorkItem('experience', i)} />
            ))}
            <button type='button' className='add-dynamic-btn' onClick={() => addWorkItem('experience')}>
              <Plus size={14} /> Add Experience
            </button>
          </FormSection>

          <FormSection title='Internships' icon={Briefcase}>
            {form.internships.map((item, idx) => (
              <WorkItem key={idx} item={item} index={idx} fields={WORK_FIELDS} onChange={(i, f, v) => updateWorkItem('internships', i, f, v)} onRemove={(i) => removeWorkItem('internships', i)} />
            ))}
            <button type='button' className='add-dynamic-btn' onClick={() => addWorkItem('internships')}>
              <Plus size={14} /> Add Internship
            </button>
          </FormSection>

          <FormSection title='Certifications' icon={Award}>
            {form.certifications.map((item, idx) => (
              <div key={idx} className='dynamic-item'>
                <button className='dynamic-item-remove' type='button' onClick={() => removeCert(idx)}><Trash2 size={14} /></button>
                <div className='dynamic-item-fields'>
                  <input className='dash-input' placeholder='Certification name' value={item.name} onChange={(e) => updateCert(idx, 'name', e.target.value)} />
                  <input className='dash-input' placeholder='Issuing organisation' value={item.issuer} onChange={(e) => updateCert(idx, 'issuer', e.target.value)} />
                  <input className='dash-input' type='number' placeholder='Year' value={item.year || ''} onChange={(e) => updateCert(idx, 'year', e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>
            ))}
            <button type='button' className='add-dynamic-btn' onClick={addCert}>
              <Plus size={14} /> Add Certification
            </button>
          </FormSection>

          <FormSection title='Achievements' icon={Star}>
            {form.achievements.map((item, idx) => (
              <div key={idx} className='dynamic-item'>
                <button className='dynamic-item-remove' type='button' onClick={() => removeAchievement(idx)}><Trash2 size={14} /></button>
                <div className='dynamic-item-fields'>
                  <input className='dash-input' placeholder='e.g. Won national hackathon 2024' value={item} onChange={(e) => updateAchievement(idx, e.target.value)} />
                </div>
              </div>
            ))}
            <button type='button' className='add-dynamic-btn' onClick={addAchievement}>
              <Plus size={14} /> Add Achievement
            </button>
          </FormSection>

          <FormSection title='External Profiles' icon={Link}>
            <div className='field-grid-2'>
              <FieldRow label='GitHub'>
                <input className='dash-input' placeholder='https://github.com/username' value={form.links.githubUrl} onChange={(e) => setLink('githubUrl', e.target.value)} />
              </FieldRow>
              <FieldRow label='LinkedIn'>
                <input className='dash-input' placeholder='https://linkedin.com/in/username' value={form.links.linkedinUrl} onChange={(e) => setLink('linkedinUrl', e.target.value)} />
              </FieldRow>
              <FieldRow label='LeetCode'>
                <input className='dash-input' placeholder='https://leetcode.com/username' value={form.links.leetcodeUrl} onChange={(e) => setLink('leetcodeUrl', e.target.value)} />
              </FieldRow>
              <FieldRow label='HackerRank'>
                <input className='dash-input' placeholder='https://hackerrank.com/username' value={form.links.hackerrankUrl} onChange={(e) => setLink('hackerrankUrl', e.target.value)} />
              </FieldRow>
              <FieldRow label='CodeChef'>
                <input className='dash-input' placeholder='https://codechef.com/users/username' value={form.links.codechefUrl} onChange={(e) => setLink('codechefUrl', e.target.value)} />
              </FieldRow>
              <FieldRow label='Portfolio'>
                <input className='dash-input' placeholder='https://yourportfolio.com' value={form.links.portfolioUrl} onChange={(e) => setLink('portfolioUrl', e.target.value)} />
              </FieldRow>
            </div>
          </FormSection>

          {/* Save Bar */}
          <div className='profile-save-bar'>
            {saveError && <p className='save-error'>{saveError}</p>}
            {saved && (
              <div className='save-success'>
                <CheckCircle size={16} /> Saved successfully!
              </div>
            )}
            <button
              type='button'
              className='save-profile-btn'
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
