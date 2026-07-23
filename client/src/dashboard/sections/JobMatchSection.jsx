import { useState } from 'react';
import {
  Briefcase, Sparkles, RefreshCw, CheckCircle2, XCircle, ArrowUpRight,
  Target, Calendar, Check, Layers, AlertCircle, FileText
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

const SAMPLE_JDS = {
  java: 'Looking for Java Developer with Spring Boot, SQL, AWS, and Microservices knowledge.',
  fullstack: 'We are seeking a Full Stack Developer experienced in React, Node.js, Express, MongoDB, Docker, AWS, and System Design.',
  backend: 'Hiring Backend Engineer proficient in Java, Spring Boot, PostgreSQL, Redis, Microservices, and CI/CD pipelines.'
};

export default function JobMatchSection() {
  const { profileData, scores, runJobMatch, runSkillGap, analyzing } = useProfile();
  const [activeTab, setActiveTab] = useState('jd-match');

  // Module 7 State
  const jMatch = profileData?.jobMatch || {};
  const matchScore = jMatch.matchScore ?? scores?.jobMatchScore ?? 0;
  const [jdText, setJdText] = useState(jMatch.lastJobDescription || '');

  // Module 8 State
  const sGap = profileData?.skillGapAnalysis || {};
  const [targetRole, setTargetRole] = useState(sGap.targetRole || 'Full Stack Developer');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunJobMatch = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await runJobMatch(jdText);
      setSuccessMsg('Job match analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to complete Job Match analysis.');
    }
  };

  const handleRunSkillGap = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await runSkillGap(targetRole);
      setSuccessMsg('Skill gap analysis and roadmap generated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to generate Skill Gap analysis.');
    }
  };

  const matchingSkills = jMatch.matchingSkills || [];
  const missingSkills = jMatch.missingSkills || [];
  const recommendations = jMatch.recommendations || [];

  const gapCurrent = sGap.currentSkills?.length > 0 ? sGap.currentSkills : (profileData?.skills || []);
  const gapMissing = sGap.missingSkills || [];
  const roadmap = sGap.weeklyRoadmap || [];

  return (
    <div className='job-match-page'>
      {/* Header Banner */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>Job Match & Skill Gap Engine</span>
          </div>
          <h2 className='ai-header-title'>Job Description Matching & Skill Growth Roadmap</h2>
          <p className='ai-header-subtitle'>
            Compare your profile against target Job Descriptions and analyze skill gaps for career milestone progression.
          </p>
        </div>

        {/* Tab Toggle Controls */}
        <div className='job-tab-controls'>
          <button
            className={`job-tab-btn ${activeTab === 'jd-match' ? 'active' : ''}`}
            onClick={() => setActiveTab('jd-match')}
            type='button'
          >
            <FileText size={16} />
            <span>JD Matcher</span>
          </button>
          <button
            className={`job-tab-btn ${activeTab === 'skill-gap' ? 'active' : ''}`}
            onClick={() => setActiveTab('skill-gap')}
            type='button'
          >
            <Target size={16} />
            <span>Skill Gap & Roadmap</span>
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
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: MODULE 7 - JOB DESCRIPTION MATCHING */}
      {activeTab === 'jd-match' && (
        <div className='tab-content-block'>
          <div className='jd-input-card'>
            <div className='jd-input-header'>
              <h4>Paste Job Description</h4>
              <div className='jd-presets'>
                <span className='preset-lbl'>Sample JDs:</span>
                <button type='button' className='btn-ghost preset-btn' onClick={() => setJdText(SAMPLE_JDS.java)}>
                  Java Dev
                </button>
                <button type='button' className='btn-ghost preset-btn' onClick={() => setJdText(SAMPLE_JDS.fullstack)}>
                  Full Stack
                </button>
                <button type='button' className='btn-ghost preset-btn' onClick={() => setJdText(SAMPLE_JDS.backend)}>
                  Backend
                </button>
              </div>
            </div>

            <textarea
              className='jd-textarea'
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder='Paste job description text here...'
            />

            <div className='jd-submit-row'>
              <button
                className='btn-primary ai-run-btn'
                onClick={handleRunJobMatch}
                disabled={analyzing}
                type='button'
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={18} className='spin-icon' />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <Briefcase size={18} />
                    <span>Analyze Job Match</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JD Match Score Hero Card */}
          <div className='talent-hero-card'>
            <div className='talent-score-gauge-container'>
              <div className='score-badge-circle'>
                <span className='score-val'>{matchScore}%</span>
                <span className='score-lbl'>JD Match</span>
              </div>
              <div className='talent-score-meta'>
                <span className='talent-score-label'>JD Match Score</span>
                <div className='talent-score-status score-badge-high'>
                  JD Match: {matchScore}%
                </div>
              </div>
            </div>

            <div className='talent-summary-box'>
              <h3 className='summary-title'>
                <CheckCircle2 size={18} className='text-success' />
                <span>Match Breakdown Summary</span>
              </h3>
              <p className='summary-text'>
                Your profile matches <strong>{matchScore}%</strong> of key technical requirements for this role.
              </p>

              <div className='skills-comparison-grid'>
                {/* Matching Skills */}
                <div className='skills-col matching-col'>
                  <h4 className='col-title text-success'>
                    <Check size={16} /> Matching Skills ({matchingSkills.length})
                  </h4>
                  <div className='skill-chips-row'>
                    {matchingSkills.map((sk, idx) => (
                      <span key={idx} className='skill-chip match-chip'>
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className='skills-col missing-col'>
                  <h4 className='col-title text-danger'>
                    <XCircle size={16} /> Missing Skills ({missingSkills.length})
                  </h4>
                  <div className='skill-chips-row'>
                    {missingSkills.map((sk, idx) => (
                      <span key={idx} className='skill-chip missing-chip'>
                        ✗ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className='insight-card'>
            <h3 className='insight-title'>
              <ArrowUpRight size={18} className='text-amber' />
              <span>Targeted AI Recommendations</span>
            </h3>
            <div className='recommendations-list'>
              {recommendations.map((rec, idx) => (
                <div key={idx} className='rec-item'>
                  <CheckCircle2 size={16} className='rec-icon' />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULE 8 - SKILL GAP ANALYSIS & LEARNING ROADMAP */}
      {activeTab === 'skill-gap' && (
        <div className='tab-content-block'>
          <div className='role-selector-card'>
            <div className='role-select-wrap'>
              <label htmlFor='target-role-select' className='role-label'>
                <Target size={18} className='text-primary' /> Select Target Role:
              </label>
              <select
                id='target-role-select'
                className='role-select'
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value='Full Stack Developer'>Full Stack Developer</option>
                <option value='Backend Engineer'>Backend Engineer</option>
                <option value='Frontend Engineer'>Frontend Engineer</option>
                <option value='DevOps Engineer'>DevOps Engineer</option>
              </select>
            </div>
            <button
              className='btn-primary ai-run-btn'
              onClick={handleRunSkillGap}
              disabled={analyzing}
              type='button'
            >
              {analyzing ? (
                <>
                  <RefreshCw size={18} className='spin-icon' />
                  <span>Building Roadmap...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Generate Skill Gap & Roadmap</span>
                </>
              )}
            </button>
          </div>

          {/* Skill Gap Comparison */}
          <div className='gap-comparison-card'>
            <div className='gap-col current-skills-col'>
              <h4 className='gap-col-title'>
                <CheckCircle2 size={18} className='text-success' /> Current Skills
              </h4>
              <div className='skill-chips-row'>
                {gapCurrent.map((sk, idx) => (
                  <span key={idx} className='skill-chip current-chip'>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className='gap-col missing-skills-col'>
              <h4 className='gap-col-title'>
                <XCircle size={18} className='text-amber' /> Missing Required Skills
              </h4>
              <div className='skill-chips-row'>
                {gapMissing.map((sk, idx) => (
                  <span key={idx} className='skill-chip missing-gap-chip'>
                    ✗ {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Learning Roadmap Timeline */}
          <div className='ai-section-block'>
            <div className='section-block-header'>
              <h3>Weekly Skill Gap Learning Roadmap</h3>
              <span className='section-block-subtitle'>
                Structured step-by-step 4-week learning path to bridge technical skill gaps for <strong>{targetRole}</strong>.
              </span>
            </div>

            <div className='roadmap-timeline'>
              {roadmap.map((step) => (
                <div key={step.week} className='roadmap-step-card'>
                  <div className='step-badge'>
                    <Calendar size={16} />
                    <span>Week {step.week}</span>
                  </div>
                  <div className='step-body'>
                    <h4 className='step-title'>{step.title}</h4>
                    <p className='step-desc'>{step.description}</p>
                    {step.topics && (
                      <div className='step-topics-row'>
                        {step.topics.map((top, tIdx) => (
                          <span key={tIdx} className='topic-pill'>
                            • {top}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
