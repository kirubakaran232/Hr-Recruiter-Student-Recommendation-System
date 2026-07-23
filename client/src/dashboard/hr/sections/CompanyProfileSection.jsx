import { useEffect, useRef, useState } from 'react';
import {
  Building2, Globe, MapPin, FileText, Image, Upload, Trash2,
  User, Mail, Phone, Linkedin, Target, Zap, Layers, Save,
  CheckCircle, AlertCircle, X, Plus, Briefcase
} from 'lucide-react';
import { useHRProfile } from '../../../context/HRProfileContext.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const EXPERIENCE_OPTIONS = [
  'Any', 'Fresher (0–1 yr)', '1–2 years', '2–5 years', '5–10 years', '10+ years'
];

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-Commerce',
  'Manufacturing', 'Media & Entertainment', 'Consulting', 'Retail', 'Logistics',
  'Real Estate', 'Government', 'Non-Profit', 'Other'
];

const DEPARTMENT_SUGGESTIONS = [
  'Engineering', 'Design', 'Product', 'Data Science', 'Marketing',
  'Sales', 'HR & Recruiting', 'Finance', 'Operations', 'Legal', 'Support'
];

// ── Sub-component: Tag Input ──────────────────────────────────────────────────
function TagInput({ id, tags, onChange, placeholder, suggestions = [] }) {
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const filtered = suggestions.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(inputVal.toLowerCase())
  );

  const addTag = (val) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
    setShowSuggestions(false);
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      addTag(inputVal);
    }
    if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className='hr-tag-input-root' onClick={() => inputRef.current?.focus()}>
      <div className='hr-tag-list'>
        {tags.map((tag) => (
          <span key={tag} className='hr-tag'>
            {tag}
            <button type='button' className='hr-tag-remove' onClick={() => removeTag(tag)}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          className='hr-tag-text-input'
          value={inputVal}
          placeholder={tags.length === 0 ? placeholder : ''}
          onChange={(e) => { setInputVal(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className='hr-tag-suggestions'>
          {filtered.slice(0, 6).map((s) => (
            <button key={s} type='button' className='hr-tag-suggestion-item' onMouseDown={() => addTag(s)}>
              <Plus size={10} /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Logo Uploader ──────────────────────────────────────────────
function LogoUploader({ logoUrl, onUpload, onDelete, saving }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(logoUrl || '');
  const [dragging, setDragging] = useState(false);

  useEffect(() => { setPreview(logoUrl || ''); }, [logoUrl]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div className='hr-logo-uploader'>
      <div
        className={`hr-logo-drop-zone${dragging ? ' dragging' : ''}${preview ? ' has-logo' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !saving && fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt='Company logo' className='hr-logo-preview' />
        ) : (
          <div className='hr-logo-placeholder'>
            <Image size={28} className='hr-logo-placeholder-icon' />
            <span>Drop logo here or <strong>click to browse</strong></span>
            <small>PNG, JPG, WebP · Max 2 MB</small>
          </div>
        )}
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <div className='hr-logo-actions'>
        <button
          type='button'
          className='hr-logo-btn upload'
          onClick={() => fileRef.current?.click()}
          disabled={saving}
        >
          <Upload size={14} /> Upload Logo
        </button>
        {preview && (
          <button
            type='button'
            className='hr-logo-btn delete'
            onClick={onDelete}
            disabled={saving}
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: Score Threshold Slider ─────────────────────────────────────
function ScoreSlider({ value, onChange }) {
  const pct = value;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#ffdc5d' : '#f97316';

  return (
    <div className='hr-score-slider-root'>
      <div className='hr-score-slider-header'>
        <span>Minimum Candidate Score</span>
        <strong style={{ color }}>{pct}/100</strong>
      </div>
      <input
        id='hr-score-threshold'
        type='range'
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='hr-score-slider'
        style={{ '--pct': `${pct}%`, '--color': color }}
      />
      <div className='hr-score-slider-labels'>
        <span>0 — Any</span>
        <span>50 — Mid</span>
        <span>100 — Top</span>
      </div>
    </div>
  );
}

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`hr-toast hr-toast-${type}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{message}</span>
      <button type='button' onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function CompanyProfileSection() {
  const { hrProfile, loading, saving, saveProfile, uploadLogo, deleteLogo } = useHRProfile();

  const [toast, setToast]         = useState(null);
  const [activeTab, setActiveTab] = useState('company');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [company, setCompany] = useState({
    name: '', industry: '', description: '', website: '', location: ''
  });
  const [contact, setContact] = useState({
    fullName: '', email: '', phone: '', linkedinUrl: ''
  });
  const [prefs, setPrefs] = useState({
    scoreThreshold: 60, preferredSkills: [], preferredExperience: 'Any', hiringDepartments: []
  });

  // ── Sync form from loaded profile ────────────────────────────────────────────
  useEffect(() => {
    if (!hrProfile) return;
    setCompany({
      name:        hrProfile.company?.name        || '',
      industry:    hrProfile.company?.industry    || '',
      description: hrProfile.company?.description || '',
      website:     hrProfile.company?.website     || '',
      location:    hrProfile.company?.location    || ''
    });
    setContact({
      fullName:    hrProfile.contact?.fullName    || '',
      email:       hrProfile.contact?.email       || '',
      phone:       hrProfile.contact?.phone       || '',
      linkedinUrl: hrProfile.contact?.linkedinUrl || ''
    });
    setPrefs({
      scoreThreshold:      hrProfile.hiringPreferences?.scoreThreshold      ?? 60,
      preferredSkills:     hrProfile.hiringPreferences?.preferredSkills     || [],
      preferredExperience: hrProfile.hiringPreferences?.preferredExperience || 'Any',
      hiringDepartments:   hrProfile.hiringPreferences?.hiringDepartments   || []
    });
  }, [hrProfile]);

  const showToast = (type, message) => setToast({ type, message });

  // ── Save handler ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveProfile({
        company,
        contact,
        hiringPreferences: prefs
      });
      showToast('success', 'Company profile saved successfully!');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ── Logo handlers ─────────────────────────────────────────────────────────────
  const handleLogoUpload = async (file) => {
    try {
      await uploadLogo(file);
      showToast('success', 'Logo uploaded successfully!');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleLogoDelete = async () => {
    try {
      await deleteLogo();
      showToast('success', 'Logo removed.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ── Completion indicator ──────────────────────────────────────────────────────
  const completedFields = [
    hrProfile?.company?.name,
    hrProfile?.company?.industry,
    hrProfile?.company?.description,
    hrProfile?.company?.website,
    hrProfile?.company?.location,
    hrProfile?.company?.logoUrl,
    hrProfile?.contact?.fullName,
    hrProfile?.contact?.email,
    hrProfile?.contact?.phone,
    (hrProfile?.hiringPreferences?.preferredSkills?.length ?? 0) > 0,
    (hrProfile?.hiringPreferences?.hiringDepartments?.length ?? 0) > 0
  ].filter(Boolean).length;
  const totalFields  = 11;
  const completion   = Math.round((completedFields / totalFields) * 100);

  if (loading) {
    return (
      <div className='hr-section-loading'>
        <div className='hr-spinner' />
        <span>Loading company profile…</span>
      </div>
    );
  }

  return (
    <div className='hr-company-section'>
      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 1</p>
          <h2 className='hr-section-title'>Company Profile & Hiring Config</h2>
          <p className='hr-section-subtitle'>
            Set up your company identity and configure default hiring preferences for intelligent candidate matching.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <div className='hr-completion-badge'>
            <div className='hr-completion-ring'>
              <svg viewBox='0 0 36 36' width='52' height='52'>
                <circle cx='18' cy='18' r='15.9' fill='none' stroke='rgba(36,36,36,0.08)' strokeWidth='3' />
                <circle
                  cx='18' cy='18' r='15.9' fill='none'
                  stroke='#ffdc5d' strokeWidth='3'
                  strokeDasharray={`${completion} ${100 - completion}`}
                  strokeLinecap='round'
                  transform='rotate(-90 18 18)'
                />
              </svg>
              <span className='hr-completion-pct'>{completion}%</span>
            </div>
            <div>
              <p className='hr-completion-label'>Profile</p>
              <p className='hr-completion-sublabel'>Completion</p>
            </div>
          </div>
          <button
            id='hr-save-profile-btn'
            type='button'
            className='hr-save-btn'
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><div className='hr-btn-spinner' /> Saving…</>
              : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div className='hr-tab-bar'>
        {[
          { id: 'company',  label: 'Company Info',       icon: Building2 },
          { id: 'contact',  label: 'HR Contact',         icon: User      },
          { id: 'hiring',   label: 'Hiring Preferences', icon: Target    }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`hr-tab-${id}`}
            type='button'
            className={`hr-tab-btn${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ─────────────────────────────────────────── */}
      <div className='hr-tab-content'>

        {/* ─── COMPANY INFO TAB ─────────────────────────────── */}
        {activeTab === 'company' && (
          <div className='hr-form-grid'>
            {/* Logo Column */}
            <div className='hr-form-col'>
              <div className='hr-card'>
                <div className='hr-card-header'>
                  <Image size={16} />
                  <h3>Company Logo</h3>
                </div>
                <LogoUploader
                  logoUrl={hrProfile?.company?.logoUrl}
                  onUpload={handleLogoUpload}
                  onDelete={handleLogoDelete}
                  saving={saving}
                />
              </div>
            </div>

            {/* Details Column */}
            <div className='hr-form-col wide'>
              <div className='hr-card'>
                <div className='hr-card-header'>
                  <Building2 size={16} />
                  <h3>Company Details</h3>
                </div>
                <div className='hr-fields-stack'>
                  {/* Company Name */}
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-company-name'>Company Name</label>
                    <div className='hr-field-wrap'>
                      <Building2 size={15} className='hr-field-icon' />
                      <input
                        id='hr-company-name'
                        className='hr-field-input'
                        placeholder='e.g. Acme Technologies'
                        value={company.name}
                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-company-industry'>Industry</label>
                    <div className='hr-field-wrap'>
                      <Layers size={15} className='hr-field-icon' />
                      <select
                        id='hr-company-industry'
                        className='hr-field-select'
                        value={company.industry}
                        onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                      >
                        <option value=''>Select industry…</option>
                        {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Two column: Website + Location */}
                  <div className='hr-fields-row'>
                    <div className='hr-field'>
                      <label className='hr-field-label' htmlFor='hr-company-website'>Website</label>
                      <div className='hr-field-wrap'>
                        <Globe size={15} className='hr-field-icon' />
                        <input
                          id='hr-company-website'
                          className='hr-field-input'
                          placeholder='https://acme.com'
                          value={company.website}
                          onChange={(e) => setCompany({ ...company, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className='hr-field'>
                      <label className='hr-field-label' htmlFor='hr-company-location'>Location</label>
                      <div className='hr-field-wrap'>
                        <MapPin size={15} className='hr-field-icon' />
                        <input
                          id='hr-company-location'
                          className='hr-field-input'
                          placeholder='e.g. Bengaluru, India'
                          value={company.location}
                          onChange={(e) => setCompany({ ...company, location: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-company-description'>Company Description</label>
                    <div className='hr-field-wrap textarea'>
                      <FileText size={15} className='hr-field-icon' style={{ marginTop: 4, alignSelf: 'flex-start' }} />
                      <textarea
                        id='hr-company-description'
                        className='hr-field-textarea'
                        placeholder='Briefly describe what your company does, your mission, and culture…'
                        rows={4}
                        maxLength={2000}
                        value={company.description}
                        onChange={(e) => setCompany({ ...company, description: e.target.value })}
                      />
                    </div>
                    <span className='hr-field-hint'>{company.description.length}/2000 characters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CONTACT TAB ─────────────────────────────────── */}
        {activeTab === 'contact' && (
          <div className='hr-form-single'>
            <div className='hr-card'>
              <div className='hr-card-header'>
                <User size={16} />
                <h3>HR Contact Details</h3>
                <span className='hr-card-desc'>
                  These details will be visible to shortlisted candidates.
                </span>
              </div>
              <div className='hr-fields-stack'>
                <div className='hr-fields-row'>
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-contact-name'>Full Name</label>
                    <div className='hr-field-wrap'>
                      <User size={15} className='hr-field-icon' />
                      <input
                        id='hr-contact-name'
                        className='hr-field-input'
                        placeholder='e.g. Priya Sharma'
                        value={contact.fullName}
                        onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-contact-email'>Email Address</label>
                    <div className='hr-field-wrap'>
                      <Mail size={15} className='hr-field-icon' />
                      <input
                        id='hr-contact-email'
                        type='email'
                        className='hr-field-input'
                        placeholder='hr@company.com'
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className='hr-fields-row'>
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-contact-phone'>Phone Number</label>
                    <div className='hr-field-wrap'>
                      <Phone size={15} className='hr-field-icon' />
                      <input
                        id='hr-contact-phone'
                        type='tel'
                        className='hr-field-input'
                        placeholder='+91 98765 43210'
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className='hr-field'>
                    <label className='hr-field-label' htmlFor='hr-contact-linkedin'>LinkedIn Profile</label>
                    <div className='hr-field-wrap'>
                      <Linkedin size={15} className='hr-field-icon' />
                      <input
                        id='hr-contact-linkedin'
                        className='hr-field-input'
                        placeholder='https://linkedin.com/in/priyasharma'
                        value={contact.linkedinUrl}
                        onChange={(e) => setContact({ ...contact, linkedinUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview card */}
            <div className='hr-contact-preview-card'>
              <p className='hr-contact-preview-title'>Candidate-facing preview</p>
              <div className='hr-contact-preview-inner'>
                <div className='hr-contact-preview-avatar'>
                  {contact.fullName?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div>
                  <strong>{contact.fullName || 'Your Name'}</strong>
                  <span>{contact.email || 'hr@company.com'}</span>
                  <span>{contact.phone || 'Phone number'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── HIRING PREFERENCES TAB ──────────────────────── */}
        {activeTab === 'hiring' && (
          <div className='hr-form-single'>
            <div className='hr-card'>
              <div className='hr-card-header'>
                <Target size={16} />
                <h3>Hiring Preferences</h3>
                <span className='hr-card-desc'>
                  These defaults will be used for AI-powered candidate matching across all job postings.
                </span>
              </div>
              <div className='hr-fields-stack'>

                {/* Score Threshold */}
                <div className='hr-field'>
                  <ScoreSlider
                    value={prefs.scoreThreshold}
                    onChange={(val) => setPrefs({ ...prefs, scoreThreshold: val })}
                  />
                </div>

                {/* Preferred Experience */}
                <div className='hr-field'>
                  <label className='hr-field-label' htmlFor='hr-pref-experience'>
                    <Briefcase size={13} style={{ display: 'inline', marginRight: 5 }} />
                    Preferred Experience Level
                  </label>
                  <div className='hr-experience-options'>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        id={`hr-exp-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                        type='button'
                        className={`hr-exp-chip${prefs.preferredExperience === opt ? ' active' : ''}`}
                        onClick={() => setPrefs({ ...prefs, preferredExperience: opt })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div className='hr-field'>
                  <label className='hr-field-label' htmlFor='hr-pref-skills'>
                    <Zap size={13} style={{ display: 'inline', marginRight: 5 }} />
                    Preferred Skills
                    <small className='hr-field-hint-inline'> — type and press Enter or comma to add</small>
                  </label>
                  <TagInput
                    id='hr-pref-skills'
                    tags={prefs.preferredSkills}
                    onChange={(tags) => setPrefs({ ...prefs, preferredSkills: tags })}
                    placeholder='e.g. React, Python, Machine Learning…'
                    suggestions={['React', 'Node.js', 'Python', 'Java', 'SQL', 'Machine Learning',
                      'AWS', 'Docker', 'Figma', 'TypeScript', 'Go', 'Kotlin', 'Swift', 'Excel']}
                  />
                </div>

                {/* Hiring Departments */}
                <div className='hr-field'>
                  <label className='hr-field-label' htmlFor='hr-pref-departments'>
                    <Layers size={13} style={{ display: 'inline', marginRight: 5 }} />
                    Hiring Departments
                  </label>
                  <TagInput
                    id='hr-pref-departments'
                    tags={prefs.hiringDepartments}
                    onChange={(tags) => setPrefs({ ...prefs, hiringDepartments: tags })}
                    placeholder='e.g. Engineering, Design, Data Science…'
                    suggestions={DEPARTMENT_SUGGESTIONS}
                  />
                </div>

              </div>
            </div>

            {/* Summary card */}
            <div className='hr-pref-summary-card'>
              <p className='hr-pref-summary-title'>Active Configuration</p>
              <div className='hr-pref-summary-grid'>
                <div className='hr-pref-summary-item'>
                  <Target size={14} />
                  <span>Score ≥ <strong>{prefs.scoreThreshold}</strong></span>
                </div>
                <div className='hr-pref-summary-item'>
                  <Briefcase size={14} />
                  <span><strong>{prefs.preferredExperience}</strong></span>
                </div>
                <div className='hr-pref-summary-item'>
                  <Zap size={14} />
                  <span><strong>{prefs.preferredSkills.length}</strong> skills tagged</span>
                </div>
                <div className='hr-pref-summary-item'>
                  <Layers size={14} />
                  <span><strong>{prefs.hiringDepartments.length}</strong> departments</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
