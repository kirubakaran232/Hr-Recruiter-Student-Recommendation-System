import { useState } from 'react';
import {
  FileText, UploadCloud, Trash2, Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, Copy, ArrowRight, Wand2, ShieldCheck, Check, Info, FileCode
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function ResumeIntelligenceSection() {
  const {
    profileData,
    scores,
    uploadResume,
    deleteResume,
    runResumeIntelligence,
    rewriteBullet,
    analyzing
  } = useProfile();

  const [uploading, setUploading] = useState(false);
  const [customBullet, setCustomBullet] = useState('Created an e-commerce website');
  const [rewriting, setRewriting] = useState(false);
  const [activeRewriteResult, setActiveRewriteResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resume = profileData?.resume || {};
  const parsed = profileData?.resumeParsed || {};
  const intel = profileData?.resumeIntelligence || {};

  const resumeScore = intel.resumeScore ?? scores?.resumeScore ?? 0;
  const atsReadiness = intel.atsReadiness || (resumeScore >= 80 ? 'ATS Ready (Top Tier)' : 'Needs Review');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg('');
      await uploadResume(file);
      setSuccessMsg('Resume uploaded and parsed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      // Auto-trigger intelligence audit
      await runResumeIntelligence();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to upload resume. Please ensure it is a PDF or DOCX file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) return;
    try {
      setErrorMsg('');
      await deleteResume();
      setSuccessMsg('Resume removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to delete resume.');
    }
  };

  const handleRunAudit = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await runResumeIntelligence();
      setSuccessMsg('Resume Intelligence audit updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to run audit.');
    }
  };

  const handleRewriteCustomBullet = async () => {
    if (!customBullet.trim()) return;
    try {
      setRewriting(true);
      const res = await rewriteBullet(customBullet);
      if (res?.suggestion) {
        setActiveRewriteResult(res.suggestion);
      }
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setRewriting(false);
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const pillars = [
    { key: 'structure', label: 'Resume Structure', score: intel.checks?.structure?.score ?? 0, feedback: intel.checks?.structure?.feedback || 'Checks header clarity, section hierarchy, and logical order.' },
    { key: 'formatting', label: 'Formatting & ATS Readability', score: intel.checks?.formatting?.score ?? 0, feedback: intel.checks?.formatting?.feedback || 'Checks word count, font consistency, and margin layout.' },
    { key: 'grammar', label: 'Grammar & Active Voice', score: intel.checks?.grammar?.score ?? 0, feedback: intel.checks?.grammar?.feedback || 'Evaluates action verb density and tense consistency.' },
    { key: 'missingSections', label: 'Missing Sections Audit', score: intel.checks?.missingSections?.score ?? 0, feedback: intel.checks?.missingSections?.feedback || 'Identifies missing key ATS headings.' },
    { key: 'skillsRepresentation', label: 'Skills Representation', score: intel.checks?.skillsRepresentation?.score ?? 0, feedback: intel.checks?.skillsRepresentation?.feedback || 'Checks technical skill density and categorization.' },
    { key: 'projectDescriptions', label: 'Project Descriptions', score: intel.checks?.projectDescriptions?.score ?? 0, feedback: intel.checks?.projectDescriptions?.feedback || 'Measures architectural depth and tech stack framing.' },
    { key: 'achievementImpact', label: 'Achievement Impact & Metrics', score: intel.checks?.achievementImpact?.score ?? 0, feedback: intel.checks?.achievementImpact?.feedback || 'Detects percentages, numbers, and quantified outcomes.' }
  ];

  return (
    <div className='resume-intelligence-page'>
      {/* Header Banner */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>Resume Intelligence</span>
          </div>
          <h2 className='ai-header-title'>Resume Audit & AI Rewriter</h2>
          <p className='ai-header-subtitle'>
            Optimize your resume for ATS screening algorithms with 7-pillar structural audits and AI-powered bullet point transformation.
          </p>
        </div>

        <div className='ai-header-actions'>
          <button
            className='btn-primary ai-run-btn'
            onClick={handleRunAudit}
            disabled={analyzing}
            type='button'
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} className='spin-icon' />
                <span>Auditing Resume...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Run Resume Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className='alert alert-success'>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className='alert alert-danger'>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className='resume-hero-card'>
        <div className='resume-score-gauge'>
          <div className='score-badge-circle'>
            <span className='score-val'>{resumeScore}%</span>
            <span className='score-lbl'>Resume Score</span>
          </div>
          <div className='ats-status-chip'>
            <ShieldCheck size={16} />
            <span>{atsReadiness}</span>
          </div>
        </div>

        <div className='resume-upload-status-box'>
          <h3 className='upload-box-title'>
            <FileText size={20} />
            <span>Resume File Status</span>
          </h3>

          {resume.url ? (
            <div className='resume-file-info-row'>
              <div className='file-details'>
                <FileCode size={24} className='file-icon' />
                <div>
                  <strong className='file-name'>{resume.originalName || 'Uploaded_Resume.pdf'}</strong>
                  <span className='file-meta'>
                    Uploaded on {new Date(resume.uploadedAt || Date.now()).toLocaleDateString()} · {parsed.wordCount || 0} words parsed
                  </span>
                </div>
              </div>

              <div className='file-actions'>
                <a
                  href={resume.url}
                  target='_blank'
                  rel='noreferrer'
                  className='btn-secondary file-view-btn'
                >
                  View File
                </a>
                <button
                  className='btn-danger file-delete-btn'
                  onClick={handleDeleteResume}
                  title='Delete resume'
                  type='button'
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className='no-resume-dropzone'>
              <UploadCloud size={32} className='drop-icon' />
              <div className='drop-text'>
                <strong>No resume document uploaded</strong>
                <span>Upload your PDF or DOCX resume to run full ATS checks</span>
              </div>
              <label className='upload-trigger-btn'>
                {uploading ? 'Uploading...' : 'Browse Resume File'}
                <input
                  type='file'
                  accept='.pdf,.docx,.doc'
                  onChange={handleFileUpload}
                  disabled={uploading}
                  hidden
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 7-Pillar Resume Check Grid */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>7-Pillar Resume Quality Audit</h3>
          <span className='section-block-subtitle'>
            Evaluates structural layout, ATS readability, grammar, action verbs, and impact metrics.
          </span>
        </div>

        <div className='pillars-grid'>
          {pillars.map((p) => (
            <div key={p.key} className='pillar-card'>
              <div className='pillar-top'>
                <h4 className='pillar-title'>{p.label}</h4>
                <span className={`pillar-score-badge ${p.score >= 80 ? 'high' : p.score >= 60 ? 'med' : 'low'}`}>
                  {p.score}%
                </span>
              </div>
              <div className='pillar-progress-track'>
                <div
                  className='pillar-progress-fill'
                  style={{
                    width: `${p.score}%`,
                    backgroundColor: p.score >= 80 ? '#10b981' : p.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <p className='pillar-feedback'>"{p.feedback}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Bullet Point Enhancer (Core Feature Requirement) */}
      <div className='bullet-enhancer-container'>
        <div className='enhancer-header'>
          <div className='enhancer-title-wrap'>
            <Wand2 size={22} className='text-amber' />
            <div>
              <h3>AI Bullet Point Enhancer</h3>
              <p>Transforms simple or passive descriptions into high-impact, industry-standard resume bullets.</p>
            </div>
          </div>
        </div>



        {/* Interactive Custom Bullet Optimizer Widget */}
        <div className='interactive-optimizer-card'>
          <h4 className='optimizer-heading'>Try Custom Bullet Optimizer</h4>
          <p className='optimizer-sub'>Paste any line from your project or experience section to rewrite it into industry standard:</p>

          <div className='optimizer-input-row'>
            <input
              type='text'
              className='optimizer-input'
              value={customBullet}
              onChange={(e) => setCustomBullet(e.target.value)}
              placeholder='e.g. Worked on bug fixes and chat app UI'
            />
            <button
              className='btn-primary optimizer-btn'
              onClick={handleRewriteCustomBullet}
              disabled={rewriting || !customBullet.trim()}
              type='button'
            >
              {rewriting ? 'Optimizing...' : 'Optimize with AI'}
            </button>
          </div>

          {activeRewriteResult && (
            <div className='rewrite-result-card'>
              <div className='rewrite-card-header'>
                <Sparkles size={16} className='text-amber' />
                <span>AI Enhanced Industry Suggestion</span>
              </div>
              <p className='improved-bullet-text'>"{activeRewriteResult.improved}"</p>
              <div className='reason-note'>
                <Info size={14} />
                <span>Why this helps: {activeRewriteResult.reason}</span>
              </div>
              <button
                className='copy-suggestion-btn'
                onClick={() => handleCopyText(activeRewriteResult.improved, 999)}
                type='button'
              >
                {copiedIndex === 999 ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Suggestion</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations & Missing Sections */}
      <div className='ai-insights-grid'>
        <div className='insight-card'>
          <h3 className='insight-title'>
            <CheckCircle2 size={18} className='text-success' />
            <span>Top Recommended Action Items</span>
          </h3>
          <div className='recommendations-list'>
            {intel.topActionItems?.length > 0 ? (
              intel.topActionItems.map((item, idx) => (
                <div key={idx} className='rec-item'>
                  <ArrowRight size={16} className='rec-icon' />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className='rec-item'>
                <ArrowRight size={16} className='rec-icon' />
                <span>Run the resume audit to view personalized action items.</span>
              </div>
            )}
          </div>
        </div>

        <div className='insight-card'>
          <h3 className='insight-title'>
            <AlertTriangle size={18} className='text-amber' />
            <span>Missing Section Alerts</span>
          </h3>
          <div className='strengths-list'>
            {intel.missingSectionList?.length > 0 ? (
              intel.missingSectionList.map((sec, idx) => (
                <div key={idx} className='rec-item danger-item'>
                  <AlertTriangle size={16} className='rec-icon' />
                  <span>Missing section: <strong>{sec}</strong>. Adding this section will boost ATS keyword match.</span>
                </div>
              ))
            ) : (
              <div className='strength-item'>
                <CheckCircle2 size={16} className='str-icon' />
                <span>All standard ATS resume sections are present!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
