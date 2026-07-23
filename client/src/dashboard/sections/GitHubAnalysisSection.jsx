import { useState } from 'react';
import {
  Github, Sparkles, RefreshCw, Star, GitFork, BookOpen, Layers,
  Activity, CheckCircle2, TrendingUp, ExternalLink, Cpu, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function GitHubAnalysisSection() {
  const { profileData, scores, runGitHubIntelligence, analyzing } = useProfile();

  const ghIntel = profileData?.githubIntelligence || {};
  const githubScore = ghIntel.githubScore ?? scores?.githubScore ?? 0;

  // Extract handle exclusively from profile link
  const githubUrl = profileData?.links?.githubUrl || '';
  let githubHandle = '';
  if (githubUrl) {
    const match = githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
    if (match) githubHandle = match[1];
    else if (!githubUrl.includes('://')) githubHandle = githubUrl.trim();
  }

  const isInvalidUser = ghIntel.invalidUser || Boolean(ghIntel.errorMessage);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunAnalysis = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await runGitHubIntelligence();
      setSuccessMsg('GitHub Intelligence analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to complete GitHub analysis.');
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'score-badge-high';
    if (score >= 70) return 'score-badge-med';
    return 'score-badge-low';
  };

  const stats = ghIntel.stats || { publicRepos: 0, stars: 0, forks: 0, followers: 0 };
  const repoQuality = ghIntel.repositoryQuality || {
    score: 0,
    codeOrganization: 'Connect GitHub URL in Profile to audit repository structure.',
    documentation: 'Connect GitHub URL in Profile to check README quality.',
    cleanArchitecture: 'Connect GitHub URL in Profile to analyze architecture.',
    folderStructure: 'Connect GitHub URL in Profile to inspect directory layout.'
  };
  const devActivity = ghIntel.developmentActivity || {
    score: 0,
    commitFrequency: 'Connect GitHub URL in Profile to track commit frequency.',
    recentActivity: 'Connect GitHub URL in Profile to check recent commits.',
    consistency: 'Connect GitHub URL in Profile to measure contribution streak.'
  };
  const technologies = ghIntel.technologies?.length > 0 ? ghIntel.technologies : [];
  const topRepos = ghIntel.topRepositories || [];

  return (
    <div className='github-analysis-page'>
      {/* Header Card */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>GitHub Intelligence</span>
          </div>
          <h2 className='ai-header-title'>GitHub Code & Activity Analysis</h2>
          <p className='ai-header-subtitle'>
            Evaluates repository code quality, documentation standards, commit consistency, and technology stack mastery.
          </p>
          {ghIntel.lastAnalyzedAt && (
            <div className='ai-last-updated'>
              Last evaluated: {new Date(ghIntel.lastAnalyzedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className='ai-header-actions'>
          <button
            className='btn-primary ai-run-btn'
            onClick={handleRunAnalysis}
            disabled={analyzing || !githubUrl}
            type='button'
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} className='spin-icon' />
                <span>Analyzing GitHub...</span>
              </>
            ) : (
              <>
                <Github size={18} />
                <span>Analyze GitHub Profile</span>
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

      {/* Invalid Username Alert in Red Color */}
      {isInvalidUser ? (
        <div className='alert alert-danger' style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', fontWeight: 800 }}>
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 800 }}>
            Invalid GitHub username ({githubHandle || 'unknown'}). Please enter a valid GitHub URL in your Profile.
          </span>
        </div>
      ) : !githubUrl ? (
        <div className='alert' style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Github size={18} className='text-primary' />
          <span>No GitHub URL connected. Go to the <strong>Profile</strong> section to add your GitHub URL.</span>
        </div>
      ) : null}

      {/* GitHub Score Hero Card */}
      <div className='talent-hero-card'>
        <div className='talent-score-gauge-container'>
          <div className='score-badge-circle'>
            <span className='score-val'>{githubScore}</span>
            <span className='score-lbl'>GitHub Score</span>
          </div>
          <div className='talent-score-meta'>
            <span className='talent-score-label'>GitHub Score</span>
            <div className={`talent-score-status ${getScoreBadgeClass(githubScore)}`}>
              {githubScore >= 85 ? 'Top 10% Developer' : 'Active Contributor'}
            </div>
          </div>
        </div>

        <div className='talent-summary-box'>
          <h3 className='summary-title'>
            <Github size={18} />
            <span>GitHub Profile Overview</span>
          </h3>
          <p className='summary-text'>
            Your GitHub score is high because you have multiple deployed full-stack applications with clean architecture, proper documentation, and active technology diversity.
          </p>

          <div className='quick-metrics-row'>
            <div className='quick-metric-chip'>
              <BookOpen size={16} className='text-primary' />
              <span className='qm-val'>{stats.publicRepos}</span>
              <span className='qm-lbl'>Public Repos</span>
            </div>
            <div className='quick-metric-chip'>
              <Star size={16} className='text-amber' />
              <span className='qm-val'>{stats.stars}</span>
              <span className='qm-lbl'>Stars</span>
            </div>
            <div className='quick-metric-chip'>
              <GitFork size={16} className='text-success' />
              <span className='qm-val'>{stats.forks}</span>
              <span className='qm-lbl'>Forks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Quality & Development Activity Grid */}
      <div className='ai-insights-grid'>
        {/* Repository Quality */}
        <div className='insight-card'>
          <div className='card-header-row'>
            <h3 className='insight-title'>
              <Layers size={18} className='text-primary' />
              <span>Repository Quality Evaluation</span>
            </h3>
            <span className='score-badge-high'>{repoQuality.score}/100</span>
          </div>

          <div className='audit-checklist-block'>
            <div className='audit-check-item'>
              <CheckCircle2 size={16} className='text-success' />
              <div>
                <strong>Code Organization:</strong>
                <p>{repoQuality.codeOrganization}</p>
              </div>
            </div>

            <div className='audit-check-item'>
              <CheckCircle2 size={16} className='text-success' />
              <div>
                <strong>README Documentation:</strong>
                <p>{repoQuality.documentation}</p>
              </div>
            </div>

            <div className='audit-check-item'>
              <CheckCircle2 size={16} className='text-success' />
              <div>
                <strong>Clean Architecture:</strong>
                <p>{repoQuality.cleanArchitecture}</p>
              </div>
            </div>

            <div className='audit-check-item'>
              <CheckCircle2 size={16} className='text-success' />
              <div>
                <strong>Folder Structure:</strong>
                <p>{repoQuality.folderStructure}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Activity */}
        <div className='insight-card'>
          <div className='card-header-row'>
            <h3 className='insight-title'>
              <Activity size={18} className='text-amber' />
              <span>Development Activity & Consistency</span>
            </h3>
            <span className='score-badge-high'>{devActivity.score}/100</span>
          </div>

          <div className='audit-checklist-block'>
            <div className='audit-check-item'>
              <Activity size={16} className='text-amber' />
              <div>
                <strong>Commit Frequency:</strong>
                <p>{devActivity.commitFrequency}</p>
              </div>
            </div>

            <div className='audit-check-item'>
              <TrendingUp size={16} className='text-success' />
              <div>
                <strong>Recent Activity:</strong>
                <p>{devActivity.recentActivity}</p>
              </div>
            </div>

            <div className='audit-check-item'>
              <ShieldCheck size={16} className='text-primary' />
              <div>
                <strong>Streak Consistency:</strong>
                <p>{devActivity.consistency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Analysis */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>Technology Analysis & Stack Identification</h3>
          <span className='section-block-subtitle'>
            Automatically identified technologies, frameworks, databases, and cloud tools detected across your repositories.
          </span>
        </div>

        <div className='tech-stack-pills-wrap'>
          {technologies.map((tech, idx) => (
            <div key={idx} className='tech-stack-pill'>
              <Cpu size={14} />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Repositories Showcase */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>Top Analyzed Repositories</h3>
        </div>

        <div className='repos-showcase-grid'>
          {topRepos.map((repo, idx) => (
            <div key={idx} className='repo-showcase-card'>
              <div className='repo-card-top'>
                <h4 className='repo-title'>
                  <BookOpen size={16} />
                  <span>{repo.name}</span>
                </h4>
                <a href={repo.url} target='_blank' rel='noreferrer' className='repo-link' title='Open on GitHub'>
                  <ExternalLink size={14} />
                </a>
              </div>

              <p className='repo-desc'>{repo.description}</p>

              <div className='repo-card-footer'>
                <span className='repo-lang-badge'>{repo.language}</span>
                <div className='repo-stats'>
                  <span><Star size={12} /> {repo.stars}</span>
                  <span><GitFork size={12} /> {repo.forks}</span>
                </div>
                <span className='repo-quality-tag'>{repo.qualityRating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className='insight-card'>
        <h3 className='insight-title'>
          <TrendingUp size={18} className='text-amber' />
          <span>Actionable GitHub Improvement Suggestions</span>
        </h3>
        <div className='recommendations-list'>
          {ghIntel.suggestions?.length > 0 ? (
            ghIntel.suggestions.map((sug, idx) => (
              <div key={idx} className='rec-item'>
                <CheckCircle2 size={16} className='rec-icon' />
                <span>{sug}</span>
              </div>
            ))
          ) : (
            <div className='rec-item'>
              <CheckCircle2 size={16} className='rec-icon' />
              <span>Pin your top full-stack repositories and ensure all main repos have structured README files.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
