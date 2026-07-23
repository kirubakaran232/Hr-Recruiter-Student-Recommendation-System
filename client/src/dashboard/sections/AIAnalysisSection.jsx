import { useState } from 'react';
import {
  Sparkles, RefreshCw, FileText, Code2, FolderGit2, Github,
  Terminal, Globe, Award, CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function AIAnalysisSection() {
  const { profileData, scores, analyzeProfile, analyzing } = useProfile();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const aiAnalysis = profileData?.aiAnalysis;
  const talentScore = aiAnalysis?.talentScore ?? scores?.talentScore ?? 0;

  const handleRunAnalysis = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await analyzeProfile();
      setSuccessMsg('AI profile intelligence analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to complete AI analysis. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--score-high, #10b981)';
    if (score >= 60) return 'var(--score-med, #f59e0b)';
    return 'var(--score-low, #ef4444)';
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'score-badge-high';
    if (score >= 60) return 'score-badge-med';
    return 'score-badge-low';
  };

  const categoryConfigs = [
    {
      key: 'resumeQuality',
      label: 'Resume Quality',
      icon: FileText,
      score: aiAnalysis?.breakdown?.resumeQuality?.score ?? scores?.resumeScore ?? 0,
      explanation: aiAnalysis?.breakdown?.resumeQuality?.explanation || 'Evaluates ATS structure, completeness, readability, and content metrics.'
    },
    {
      key: 'technicalSkills',
      label: 'Technical Skills',
      icon: Code2,
      score: aiAnalysis?.breakdown?.technicalSkills?.score ?? 0,
      explanation: aiAnalysis?.breakdown?.technicalSkills?.explanation || 'Assesses modern programming languages, framework breadth, database, and cloud tool stack.'
    },
    {
      key: 'projectQuality',
      label: 'Project Quality',
      icon: FolderGit2,
      score: aiAnalysis?.breakdown?.projectQuality?.score ?? 0,
      explanation: aiAnalysis?.breakdown?.projectQuality?.explanation || 'Measures practical development experience, full-stack complexity, and internship work.'
    },
    {
      key: 'githubActivity',
      label: 'GitHub Activity',
      icon: Github,
      score: aiAnalysis?.breakdown?.githubActivity?.score ?? scores?.githubScore ?? 0,
      explanation: aiAnalysis?.breakdown?.githubActivity?.explanation || 'Analyzes repository structure, public code presence, commits, and project documentation.'
    },
    {
      key: 'codingPerformance',
      label: 'Coding Performance',
      icon: Terminal,
      score: aiAnalysis?.breakdown?.codingPerformance?.score ?? scores?.codingScore ?? 0,
      explanation: aiAnalysis?.breakdown?.codingPerformance?.explanation || 'Evaluates competitive problem-solving records across LeetCode, HackerRank, and CodeChef.'
    },
    {
      key: 'portfolioQuality',
      label: 'Portfolio Quality',
      icon: Globe,
      score: aiAnalysis?.breakdown?.portfolioQuality?.score ?? scores?.portfolioScore ?? 0,
      explanation: aiAnalysis?.breakdown?.portfolioQuality?.explanation || 'Measures live web portfolio presence, visual presentation, and personal branding.'
    },
    {
      key: 'certifications',
      label: 'Certifications',
      icon: Award,
      score: aiAnalysis?.breakdown?.certifications?.score ?? 0,
      explanation: aiAnalysis?.breakdown?.certifications?.explanation || 'Evaluates verified professional credentials, course achievements, and self-driven growth.'
    }
  ];

  return (
    <div className='ai-analysis-page'>
      {/* Header Banner */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>Profile Intelligence</span>
          </div>
          <h2 className='ai-header-title'>AI Profile Analysis</h2>
          <p className='ai-header-subtitle'>
            Comprehensive multi-dimensional evaluation of profile readiness, technical capability, and portfolio quality powered by TalentOS AI engine.
          </p>
          {aiAnalysis?.lastAnalyzedAt && (
            <div className='ai-last-updated'>
              Last evaluated: {new Date(aiAnalysis.lastAnalyzedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className='ai-header-actions'>
          <button
            className='btn-primary ai-run-btn'
            onClick={handleRunAnalysis}
            disabled={analyzing}
            type='button'
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} className='spin-icon' />
                <span>Evaluating Profile...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Profile with AI</span>
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
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className='talent-hero-card'>
        <div className='talent-score-gauge-container'>
          <div className='score-badge-circle'>
            <span className='score-val'>{talentScore}</span>
            <span className='score-lbl'>Talent Score</span>
          </div>
          <div className='talent-score-meta'>
            <span className='talent-score-label'>Overall Talent Score</span>
            <div className={`talent-score-status ${getScoreBadgeClass(talentScore)}`}>
              {talentScore >= 85 ? 'Top Rated Profile' : talentScore >= 70 ? 'Strong Contender' : 'Developing Profile'}
            </div>
          </div>
        </div>

        <div className='talent-summary-box'>
          <h3 className='summary-title'>
            <TrendingUp size={18} />
            <span>AI Executive Summary</span>
          </h3>
          <p className='summary-text'>
            {aiAnalysis?.summaryNarrative ||
              `Your profile yields a Talent Score of ${talentScore}/100 based on evaluated resume quality, technical skills, project portfolio, GitHub activity, competitive coding, and certifications. Re-run analysis anytime after updating your profile.`}
          </p>
          <div className='quick-metrics-row'>
            <div className='quick-metric-chip'>
              <span className='qm-val'>{profileData?.skills?.length || 0}</span>
              <span className='qm-lbl'>Skills Listed</span>
            </div>
            <div className='quick-metric-chip'>
              <span className='qm-val'>{(profileData?.experience?.length || 0) + (profileData?.internships?.length || 0)}</span>
              <span className='qm-lbl'>Projects & Exp</span>
            </div>
            <div className='quick-metric-chip'>
              <span className='qm-val'>{profileData?.resume?.url ? 'Uploaded' : 'Missing'}</span>
              <span className='qm-lbl'>Resume ATS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Category Breakdown Section */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>Category Breakdown (7 Evaluated Dimensions)</h3>
          <span className='section-block-subtitle'>
            AI evaluates each criterion out of 100 with detailed narrative explanations.
          </span>
        </div>

        <div className='category-grid'>
          {categoryConfigs.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className='category-card'>
                <div className='cat-card-top'>
                  <div className='cat-icon-pill'>
                    <Icon size={20} />
                  </div>
                  <div className='cat-title-wrap'>
                    <h4 className='cat-name'>{cat.label}</h4>
                  </div>
                  <div className={`cat-score-badge ${getScoreBadgeClass(cat.score)}`}>
                    {cat.score} / 100
                  </div>
                </div>

                <div className='cat-progress-bar-wrap'>
                  <div className='cat-progress-track'>
                    <div
                      className='cat-progress-fill'
                      style={{
                        width: `${cat.score}%`,
                        backgroundColor: getScoreColor(cat.score)
                      }}
                    />
                  </div>
                </div>

                <div className='cat-explanation-box'>
                  <p className='cat-explanation-text'>"{cat.explanation}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Recommendations Grid */}
      <div className='ai-insights-grid'>
        {/* Strengths */}
        <div className='insight-card strengths-card'>
          <h3 className='insight-title'>
            <CheckCircle2 size={18} className='text-success' />
            <span>Key Profile Strengths</span>
          </h3>
          <div className='strengths-list'>
            {aiAnalysis?.strengths?.length > 0 ? (
              aiAnalysis.strengths.map((str, idx) => (
                <div key={idx} className='strength-item'>
                  <Sparkles size={14} className='str-icon' />
                  <span>{str}</span>
                </div>
              ))
            ) : (
              <div className='strength-item'>
                <Sparkles size={14} className='str-icon' />
                <span>Run AI analysis above to generate customized profile strengths.</span>
              </div>
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className='insight-card recommendations-card'>
          <h3 className='insight-title'>
            <TrendingUp size={18} className='text-amber' />
            <span>Actionable Score Boosters</span>
          </h3>
          <div className='recommendations-list'>
            {aiAnalysis?.recommendations?.length > 0 ? (
              aiAnalysis.recommendations.map((rec, idx) => (
                <div key={idx} className='rec-item'>
                  <ArrowUpRight size={16} className='rec-icon' />
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <div className='rec-item'>
                <ArrowUpRight size={16} className='rec-icon' />
                <span>Click "Analyze Profile with AI" to generate step-by-step recommendations.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
