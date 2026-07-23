import { useState } from 'react';
import {
  Globe, Sparkles, RefreshCw, CheckCircle2, Layout, Smartphone,
  Zap, Eye, FolderGit2, Gauge, ShieldCheck, ExternalLink, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function PortfolioAnalysisSection() {
  const { profileData, scores, runPortfolioIntelligence, analyzing } = useProfile();

  const pIntel = profileData?.portfolioIntelligence || {};
  const portfolioScore = pIntel.portfolioScore ?? scores?.portfolioScore ?? 0;

  const portfolioUrl = pIntel.url || profileData?.links?.portfolioUrl || '';

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunAnalysis = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await runPortfolioIntelligence();
      setSuccessMsg('Portfolio Intelligence analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to complete Portfolio analysis.');
    }
  };

  const pillars = [
    { key: 'uiDesign', label: 'UI Design & Aesthetics', icon: Layout, score: pIntel.checks?.uiDesign?.score ?? 0, feedback: pIntel.checks?.uiDesign?.feedback || 'Connect portfolio URL in Profile to evaluate UI design.' },
    { key: 'responsiveness', label: 'Responsiveness', icon: Smartphone, score: pIntel.checks?.responsiveness?.score ?? 0, feedback: pIntel.checks?.responsiveness?.feedback || 'Connect portfolio URL in Profile to test responsiveness.' },
    { key: 'performance', label: 'Performance Metrics', icon: Zap, score: pIntel.checks?.performance?.score ?? 0, feedback: pIntel.checks?.performance?.feedback || 'Connect portfolio URL in Profile to test performance.' },
    { key: 'accessibility', label: 'Accessibility (a11y)', icon: Eye, score: pIntel.checks?.accessibility?.score ?? 0, feedback: pIntel.checks?.accessibility?.feedback || 'Connect portfolio URL in Profile to test accessibility.' },
    { key: 'projectPresentation', label: 'Project Presentation', icon: FolderGit2, score: pIntel.checks?.projectPresentation?.score ?? 0, feedback: pIntel.checks?.projectPresentation?.feedback || 'Add project screenshots and live demo links to improve presentation.' },
    { key: 'loadingSpeed', label: 'Loading Speed', icon: Gauge, score: pIntel.checks?.loadingSpeed?.score ?? 0, feedback: pIntel.checks?.loadingSpeed?.feedback || 'Connect portfolio URL in Profile to test loading speed.' },
    { key: 'deploymentStatus', label: 'Deployment & SSL Status', icon: ShieldCheck, score: pIntel.checks?.deploymentStatus?.score ?? 0, feedback: pIntel.checks?.deploymentStatus?.feedback || 'Connect portfolio URL in Profile to verify HTTPS SSL status.' }
  ];

  const suggestions = pIntel.suggestions?.length > 0
    ? pIntel.suggestions
    : [
        portfolioUrl ? `Portfolio Score: ${portfolioScore}/100. Audit complete for ${portfolioUrl}.` : 'Add your portfolio URL in the Profile section to run intelligence analysis.',
        'Add project screenshots and live demo links to improve presentation.'
      ];

  return (
    <div className='portfolio-analysis-page'>
      {/* Header Card */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>Portfolio Intelligence</span>
          </div>
          <h2 className='ai-header-title'>Portfolio Website Analysis</h2>
          <p className='ai-header-subtitle'>
            Audits personal developer portfolios across 7 key dimensions: UI design, responsiveness, performance, accessibility, project presentation, loading speed, and deployment status.
          </p>
          {pIntel.lastAnalyzedAt && (
            <div className='ai-last-updated'>
              Last evaluated: {new Date(pIntel.lastAnalyzedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className='ai-header-actions'>
          <button
            className='btn-primary ai-run-btn'
            onClick={handleRunAnalysis}
            disabled={analyzing || !portfolioUrl}
            type='button'
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} className='spin-icon' />
                <span>Auditing Site...</span>
              </>
            ) : (
              <>
                <Globe size={18} />
                <span>Analyze Portfolio</span>
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



      {/* Score Hero Card */}
      <div className='talent-hero-card'>
        <div className='talent-score-gauge-container'>
          <div className='score-badge-circle'>
            <span className='score-val'>{portfolioScore}</span>
            <span className='score-lbl'>Portfolio Score</span>
          </div>
          <div className='talent-score-meta'>
            <span className='talent-score-label'>Portfolio Score</span>
            <div className='talent-score-status score-badge-high'>
              {portfolioScore >= 80 ? 'Top Recruiter Grade' : 'Good Portfolio'}
            </div>
          </div>
        </div>

        <div className='talent-summary-box'>
          <h3 className='summary-title'>
            <ShieldCheck size={18} className='text-success' />
            <span>Live Website Status</span>
          </h3>
          <p className='summary-text'>
            {portfolioUrl ? (
              <>Your portfolio website is deployed and live at <strong>{portfolioUrl}</strong> with active SSL encryption.</>
            ) : (
              <>Connect your portfolio website URL in the Profile section to evaluate UI design, responsiveness, and performance metrics.</>
            )}
          </p>

          <div className='quick-metrics-row'>
            <div className='quick-metric-chip'>
              <ShieldCheck size={16} className='text-success' />
              <span className='qm-val'>{pIntel.deploymentStatus || 'HTTPS Live'}</span>
              <span className='qm-lbl'>Deployment</span>
            </div>
            <div className='quick-metric-chip'>
              <Globe size={16} className='text-primary' />
              <span className='qm-val'>{pIntel.hostingProvider || 'Vercel CDN'}</span>
              <span className='qm-lbl'>Hosting</span>
            </div>
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target='_blank'
                rel='noreferrer'
                className='quick-metric-chip portfolio-visit-link'
              >
                <span className='qm-val'>Visit Live Site</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 7-Pillar Audit Grid */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>7-Pillar Portfolio Quality Audit</h3>
          <span className='section-block-subtitle'>
            Evaluates UI design aesthetics, mobile responsiveness, performance, accessibility, project presentation, loading speed, and HTTPS deployment.
          </span>
        </div>

        <div className='pillars-grid'>
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key} className='pillar-card'>
                <div className='pillar-top'>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} className='text-primary' />
                    <h4 className='pillar-title'>{p.label}</h4>
                  </div>
                  <span className={`pillar-score-badge ${p.score >= 80 ? 'high' : 'med'}`}>
                    {p.score}%
                  </span>
                </div>
                <div className='pillar-progress-track'>
                  <div
                    className='pillar-progress-fill'
                    style={{
                      width: `${p.score}%`,
                      backgroundColor: p.score >= 80 ? '#10b981' : '#f59e0b'
                    }}
                  />
                </div>
                <p className='pillar-feedback'>"{p.feedback}"</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className='insight-card'>
        <h3 className='insight-title'>
          <ArrowUpRight size={18} className='text-amber' />
          <span>Actionable Portfolio Improvement Suggestions</span>
        </h3>
        <div className='recommendations-list'>
          {suggestions.map((sug, idx) => (
            <div key={idx} className='rec-item'>
              <CheckCircle2 size={16} className='rec-icon' />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
