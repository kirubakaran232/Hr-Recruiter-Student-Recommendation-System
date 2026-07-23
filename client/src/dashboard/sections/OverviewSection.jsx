import { useState } from 'react';
import {
  FileText, Github, Globe, Code2, Briefcase, Lightbulb, TrendingUp, BarChart3, LineChart, Award, Sparkles,
  RefreshCw, CheckCircle2, ShieldCheck, ArrowUpRight, Cpu, Layout
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OverviewSection({ onNavigate }) {
  const { scores, profileData, analyzeProfile, analyzing } = useProfile();
  const { profile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');

  const handleRunAIAnalysis = async () => {
    try {
      await analyzeProfile();
      setSuccessMsg('AI Profile Analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const aiAnalysis = profileData?.aiAnalysis;

  const historyData = profileData.analyticsHistory?.length > 0
    ? profileData.analyticsHistory
    : [
        { month: 'Current Evaluation', talentScore: scores.talentScore || 0, resumeScore: scores.resumeScore || 0, githubScore: scores.githubScore || 0, codingScore: scores.codingScore || 0, jobMatchScore: scores.jobMatchScore || 0 }
      ];

  const userSkillCount = profileData?.skills?.length || 0;
  const skillDist = userSkillCount > 0
    ? [
        { category: 'Frontend Development', pct: scores.talentScore > 0 ? Math.min(100, scores.talentScore + 5) : 0, label: scores.talentScore > 0 ? 'Evaluated' : 'Not Evaluated' },
        { category: 'Backend Development', pct: scores.resumeScore > 0 ? scores.resumeScore : 0, label: scores.resumeScore > 0 ? 'Evaluated' : 'Not Evaluated' },
        { category: 'Database & SQL', pct: scores.githubScore > 0 ? scores.githubScore : 0, label: scores.githubScore > 0 ? 'Evaluated' : 'Not Evaluated' },
        { category: 'DSA & Coding', pct: scores.codingScore > 0 ? scores.codingScore : 0, label: scores.codingScore > 0 ? 'Evaluated' : 'Not Evaluated' },
        { category: 'Cloud & DevOps', pct: scores.jobMatchScore > 0 ? scores.jobMatchScore : 0, label: scores.jobMatchScore > 0 ? 'Evaluated' : 'Not Evaluated' }
      ]
    : [
        { category: 'Frontend Development', pct: 0, label: 'Add skills in Profile' },
        { category: 'Backend Development', pct: 0, label: 'Add skills in Profile' },
        { category: 'Database & SQL', pct: 0, label: 'Add skills in Profile' },
        { category: 'DSA & Coding', pct: 0, label: 'Add skills in Profile' },
        { category: 'Cloud & DevOps', pct: 0, label: 'Add skills in Profile' }
      ];

  const unifiedCards = [
    {
      id: 'resume',
      label: 'Resume Quality & ATS',
      score: aiAnalysis?.breakdown?.resumeQuality?.score ?? scores.resumeScore ?? 0,
      icon: FileText,
      color: '#6366f1',
      connected: scores.resumeScore > 0 || Boolean(profileData.resume?.url),
      statusText: scores.resumeScore > 0 ? `${profileData.resumeParsed?.skills?.length || 0} skills detected` : 'Upload resume to analyze',
      explanation: aiAnalysis?.breakdown?.resumeQuality?.explanation || 'Upload your resume to receive ATS formatting and impact analysis.'
    },
    {
      id: 'github',
      label: 'GitHub Activity',
      score: aiAnalysis?.breakdown?.githubActivity?.score ?? scores.githubScore ?? 0,
      icon: Github,
      color: '#111111',
      connected: Boolean(profileData.links?.githubUrl),
      statusText: profileData.links?.githubUrl ? 'GitHub connected' : 'Add GitHub URL in Profile',
      explanation: aiAnalysis?.breakdown?.githubActivity?.explanation || 'Connect your GitHub profile to evaluate repositories and commit frequency.'
    },
    {
      id: 'portfolio',
      label: 'Portfolio Website',
      score: aiAnalysis?.breakdown?.portfolioQuality?.score ?? scores.portfolioScore ?? 0,
      icon: Globe,
      color: '#0ea5e9',
      connected: Boolean(profileData.links?.portfolioUrl),
      statusText: profileData.links?.portfolioUrl ? 'SSL Verified & Live' : 'Add Portfolio URL in Profile',
      explanation: aiAnalysis?.breakdown?.portfolioQuality?.explanation || 'Link your portfolio website to audit UI design, responsiveness, and performance.'
    },
    {
      id: 'coding',
      label: 'Coding Ability',
      score: aiAnalysis?.breakdown?.codingPerformance?.score ?? scores.codingScore ?? 0,
      icon: Code2,
      color: '#f59e0b',
      connected: Boolean(profileData.links?.leetcodeUrl || profileData.links?.hackerrankUrl || profileData.links?.codechefUrl || profileData.links?.hackerearthUrl),
      statusText: scores.codingScore > 0 ? 'Competitive platforms connected' : 'Connect LeetCode / HackerRank',
      explanation: aiAnalysis?.breakdown?.codingPerformance?.explanation || 'Connect competitive programming handles to track problems solved and ratings.'
    },
    {
      id: 'jobs',
      label: 'Job Match Suitability',
      score: scores.jobMatchScore ?? 0,
      icon: Briefcase,
      color: '#ec4899',
      connected: scores.jobMatchScore > 0,
      statusText: scores.jobMatchScore > 0 ? `Last Match: ${scores.jobMatchScore}%` : 'Paste JD to match suitability',
      explanation: 'Evaluates your technical stack suitability against target job descriptions.'
    },
    {
      id: 'profile',
      label: 'Technical Skills',
      score: aiAnalysis?.breakdown?.technicalSkills?.score ?? (profileData.skills?.length > 0 ? 75 : 0),
      icon: Cpu,
      color: '#10b981',
      connected: (profileData.skills?.length || 0) > 0,
      statusText: `${profileData.skills?.length || 0} skill(s) listed`,
      explanation: aiAnalysis?.breakdown?.technicalSkills?.explanation || 'Add your key skills in Profile to evaluate domain proficiency.'
    },
    {
      id: 'profile',
      label: 'Project Quality',
      score: aiAnalysis?.breakdown?.projectQuality?.score ?? (profileData.experience?.length > 0 ? 75 : 0),
      icon: Layout,
      color: '#8b5cf6',
      connected: (profileData.experience?.length || 0) > 0 || Boolean(profileData.links?.githubUrl),
      statusText: 'Evaluated from repository audit',
      explanation: aiAnalysis?.breakdown?.projectQuality?.explanation || 'Add projects or repositories to analyze clean architecture and documentation.'
    }
  ];

  return (
    <div className='overview-section'>
      {/* Hero Row */}
      <div className='overview-hero'>
        <div className='talent-score-card'>
          <div className='talent-score-ring'>
            <ScoreRing score={scores.talentScore} size={150} strokeWidth={14} color='#ffdc5d' />
          </div>
          <div className='talent-score-info'>
            <div className='talent-score-label'>Overall Talent Score</div>
            <p className='talent-score-desc'>
              Your score increases as you complete your profile, upload a resume, and connect your coding platforms.
            </p>
            <div className='talent-score-breakdown'>
              <div className='breakdown-item'><span>Resume</span><strong>{scores.resumeScore}%</strong></div>
              <div className='breakdown-item'><span>GitHub</span><strong>{scores.githubScore}%</strong></div>
              <div className='breakdown-item'><span>Portfolio</span><strong>{scores.portfolioScore}%</strong></div>
              <div className='breakdown-item'><span>Coding</span><strong>{scores.codingScore}%</strong></div>
            </div>
          </div>
        </div>

        <div className='profile-completion-card'>
          <div className='completion-card-header'>
            <TrendingUp size={20} color='#ffdc5d' />
            <span>Profile Completion</span>
          </div>
          <div className='completion-big-pct'>{scores.profileCompletion}%</div>
          <div className='completion-bar-outer'>
            <div className='completion-bar-inner' style={{ width: `${scores.profileCompletion}%` }} />
          </div>
          <div className='completion-checklist'>
            {[
              { label: 'Contact info', done: !!(profileData.phone && profileData.location) },
              { label: 'Education details', done: !!(profileData.education?.college && profileData.education?.degree) },
              { label: 'Skills added', done: (profileData.skills?.length || 0) > 0 },
              { label: 'Resume uploaded', done: !!profileData.resume?.url },
              { label: 'GitHub connected', done: !!profileData.links?.githubUrl },
              { label: 'Portfolio linked', done: !!profileData.links?.portfolioUrl }
            ].map((item) => (
              <div key={item.label} className={`checklist-item${item.done ? ' done' : ''}`}>
                <span className='check-dot' />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <button className='complete-profile-btn' onClick={() => onNavigate('profile')} type='button'>
            Complete Profile
          </button>
        </div>
      </div>

      {successMsg && (
        <div className='alert alert-success' style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* UNIFIED AI PROFILE ANALYSIS & SCORE BREAKDOWN SECTION */}
      <div className='ai-section-block'>
        <div className='section-block-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>
              <Sparkles size={22} className='text-amber' style={{ display: 'inline', marginRight: '8px' }} />
              AI Profile Analysis & Score Intelligence
            </h3>
            <span className='section-block-subtitle'>
              Unified evaluation incorporating empirical platform connection statuses, ATS scores, and AI narrative explanations.
            </span>
          </div>
          <button
            className='btn-primary ai-run-btn'
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            type='button'
          >
            {analyzing ? (
              <>
                <RefreshCw size={16} className='spin-icon' />
                <span>Analyzing Profile...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Re-Run AI Analysis</span>
              </>
            )}
          </button>
        </div>

        <div className='categories-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px', marginTop: '18px' }}>
          {unifiedCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className='category-card'
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={20} style={{ color: card.color }} />
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>{card.label}</h4>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background: card.connected ? '#d1fae5' : '#f1f5f9',
                      color: card.connected ? '#065f46' : '#64748b'
                    }}
                  >
                    {card.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: card.connected ? '#0f172a' : '#64748b' }}>
                    {card.score}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>/ 100</span>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${card.score}%`,
                      height: '100%',
                      background: card.score >= 80 ? '#10b981' : card.score >= 50 ? '#f59e0b' : '#cbd5e1',
                      borderRadius: '999px'
                    }}
                  />
                </div>

                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>
                  "{card.explanation}"
                </p>

                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span>{card.statusText}</span>
                  <button
                    type='button'
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
                    onClick={() => onNavigate(card.id)}
                  >
                    Manage →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD ANALYTICS SECTION */}
      <div className='overview-section-header'>
        <h2>
          <BarChart3 size={22} className='text-primary' style={{ display: 'inline', marginRight: '8px' }} />
          Dashboard Analytics
        </h2>
        <p>Visual historical score growth progression and candidate skill distribution metrics.</p>
      </div>

      <div className='analytics-charts-grid'>
        {/* Score Improvement History Chart */}
        <div className='analytics-card'>
          <div className='analytics-card-header'>
            <LineChart size={18} className='text-primary' />
            <h3>Score Improvement History</h3>
          </div>
          <p className='analytics-subtitle'>Track your Talent Score growth over recent evaluation milestones:</p>

          <div className='history-timeline-bars'>
            {historyData.map((item, idx) => (
              <div key={idx} className='history-bar-item'>
                <div className='bar-top-lbl'>
                  <span className='month-lbl'>{item.month}</span>
                  <strong className='score-val'>{item.talentScore} / 100</strong>
                </div>
                <div className='bar-track'>
                  <div
                    className='bar-fill'
                    style={{
                      width: `${item.talentScore}%`,
                      backgroundColor: item.talentScore >= 85 ? '#10b981' : item.talentScore >= 75 ? '#6366f1' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className='history-summary-note'>
            <Award size={14} className='text-success' />
            <span>Current Talent Score evaluation: <strong>{scores.talentScore || 0}/100</strong>. Evaluates automatically as you connect profiles.</span>
          </div>
        </div>

        {/* Skill Distribution Chart */}
        <div className='analytics-card'>
          <div className='analytics-card-header'>
            <BarChart3 size={18} className='text-amber' />
            <h3>Skill Distribution Analysis</h3>
          </div>
          <p className='analytics-subtitle'>Candidate technical domain mastery distribution:</p>

          <div className='skill-dist-list'>
            {skillDist.map((sk) => (
              <div key={sk.category} className='skill-dist-item'>
                <div className='dist-info'>
                  <span className='dist-name'>{sk.category}</span>
                  <span className='dist-pct'>{sk.pct}% ({sk.label})</span>
                </div>
                <div className='dist-bar-track'>
                  <div
                    className='dist-bar-fill'
                    style={{
                      width: `${sk.pct}%`,
                      backgroundColor: sk.pct >= 85 ? '#10b981' : '#6366f1'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
