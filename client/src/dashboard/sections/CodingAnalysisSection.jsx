import { useState } from 'react';
import {
  Terminal, Sparkles, RefreshCw, CheckCircle2, Award, TrendingUp,
  Cpu, ExternalLink, AlertCircle, Trophy, BarChart3, Code2, ArrowUpRight
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function CodingAnalysisSection() {
  const { profileData, scores, runCodingIntelligence, analyzing } = useProfile();

  const cIntel = profileData?.codingIntelligence || {};
  const codingScore = cIntel.codingScore ?? scores?.codingScore ?? 0;

  const links = profileData?.links || {};
  const [platformUrls, setPlatformUrls] = useState({
    leetcodeUrl: links.leetcodeUrl || '',
    hackerrankUrl: links.hackerrankUrl || '',
    codechefUrl: links.codechefUrl || '',
    hackerearthUrl: links.hackerearthUrl || ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunAnalysis = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');
      await runCodingIntelligence(platformUrls);
      setSuccessMsg('Coding Profile Intelligence analysis completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to complete Coding Profile analysis.');
    }
  };

  const totalSolved = cIntel.totalSolved ?? 0;
  const diff = cIntel.difficulty || { easy: 0, medium: 0, hard: 0 };
  const platforms = cIntel.platforms || {
    leetcode: { connected: Boolean(links.leetcodeUrl), solved: 0, rating: 0, rank: 'Not Connected' },
    hackerrank: { connected: Boolean(links.hackerrankUrl), stars: 0, badges: 0 },
    codechef: { connected: Boolean(links.codechefUrl), rating: 0, stars: 'Not Connected' },
    hackerearth: { connected: Boolean(links.hackerearthUrl), points: 0, rank: 'Not Connected' }
  };

  const feedbackList = cIntel.feedback?.length > 0
    ? cIntel.feedback
    : [
        `Coding Score: ${codingScore}/100 based on evaluated profiles across LeetCode, HackerRank, CodeChef, and HackerEarth.`,
        'Connect competitive programming profiles above to evaluate problem-solving skills.'
      ];

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'score-badge-high';
    if (score >= 70) return 'score-badge-med';
    return 'score-badge-low';
  };

  return (
    <div className='coding-analysis-page'>
      {/* Header Card */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>Coding Profile Intelligence</span>
          </div>
          <h2 className='ai-header-title'>Competitive Programming Analysis</h2>
          <p className='ai-header-subtitle'>
            Evaluates problem-solving volume, difficulty level distribution, contest ratings, rankings, and algorithmic capability across LeetCode, HackerRank, CodeChef, and HackerEarth.
          </p>
          {cIntel.lastAnalyzedAt && (
            <div className='ai-last-updated'>
              Last evaluated: {new Date(cIntel.lastAnalyzedAt).toLocaleString()}
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
                <span>Evaluating Coding...</span>
              </>
            ) : (
              <>
                <Terminal size={18} />
                <span>Analyze Coding Profiles</span>
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

      {/* Platform Links Connection Bar Grid */}
      <div className='coding-links-manager-card'>
        <h4 className='manager-title'>Competitive Platform Connections</h4>
        <div className='coding-links-grid'>
          <div className='coding-link-input-item'>
            <span className='platform-label'>LeetCode</span>
            <input
              type='text'
              className='platform-url-input'
              value={platformUrls.leetcodeUrl}
              onChange={(e) => setPlatformUrls({ ...platformUrls, leetcodeUrl: e.target.value })}
              placeholder='https://leetcode.com/username'
            />
          </div>

          <div className='coding-link-input-item'>
            <span className='platform-label'>HackerRank</span>
            <input
              type='text'
              className='platform-url-input'
              value={platformUrls.hackerrankUrl}
              onChange={(e) => setPlatformUrls({ ...platformUrls, hackerrankUrl: e.target.value })}
              placeholder='https://hackerrank.com/username'
            />
          </div>

          <div className='coding-link-input-item'>
            <span className='platform-label'>CodeChef</span>
            <input
              type='text'
              className='platform-url-input'
              value={platformUrls.codechefUrl}
              onChange={(e) => setPlatformUrls({ ...platformUrls, codechefUrl: e.target.value })}
              placeholder='https://codechef.com/users/username'
            />
          </div>

          <div className='coding-link-input-item'>
            <span className='platform-label'>HackerEarth</span>
            <input
              type='text'
              className='platform-url-input'
              value={platformUrls.hackerearthUrl}
              onChange={(e) => setPlatformUrls({ ...platformUrls, hackerearthUrl: e.target.value })}
              placeholder='https://hackerearth.com/@username'
            />
          </div>
        </div>
      </div>

      {/* Coding Score Hero Card */}
      <div className='talent-hero-card'>
        <div className='talent-score-gauge-container'>
          <div className='score-badge-circle'>
            <span className='score-val'>{codingScore}</span>
            <span className='score-lbl'>Coding Score</span>
          </div>
          <div className='talent-score-meta'>
            <span className='talent-score-label'>Coding Score</span>
            <div className={`talent-score-status ${getScoreBadgeClass(codingScore)}`}>
              {cIntel.problemSolvingRating || 'Solid Problem Solver (Medium Level Capable)'}
            </div>
          </div>
        </div>

        <div className='talent-summary-box'>
          <h3 className='summary-title'>
            <Trophy size={18} className='text-amber' />
            <span>Problem-Solving Performance Summary</span>
          </h3>
          <p className='summary-text'>
            Your problem-solving skills are good, but improve medium and hard-level problems to boost your score past 85+.
          </p>

          <div className='quick-metrics-row'>
            <div className='quick-metric-chip'>
              <BarChart3 size={16} className='text-primary' />
              <span className='qm-val'>{totalSolved}</span>
              <span className='qm-lbl'>Problems Solved</span>
            </div>
            <div className='quick-metric-chip'>
              <Award size={16} className='text-amber' />
              <span className='qm-val'>{platforms.leetcode.rating || 1640}</span>
              <span className='qm-lbl'>LeetCode Rating</span>
            </div>
            <div className='quick-metric-chip'>
              <Trophy size={16} className='text-success' />
              <span className='qm-val'>{platforms.codechef.stars || '3★'}</span>
              <span className='qm-lbl'>CodeChef Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Level Breakdown Card */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>Difficulty Level Distribution</h3>
          <span className='section-block-subtitle'>
            Breakdown of solved problems categorized by Easy, Medium, and Hard difficulty tiers.
          </span>
        </div>

        <div className='difficulty-breakdown-card'>
          <div className='diff-item easy'>
            <div className='diff-top'>
              <span className='diff-name'>Easy Problems</span>
              <strong className='diff-count'>{diff.easy} solved</strong>
            </div>
            <div className='diff-track'>
              <div className='diff-fill easy-fill' style={{ width: `${Math.min(100, (diff.easy / totalSolved) * 100)}%` }} />
            </div>
          </div>

          <div className='diff-item medium'>
            <div className='diff-top'>
              <span className='diff-name'>Medium Problems (Key Target)</span>
              <strong className='diff-count'>{diff.medium} solved</strong>
            </div>
            <div className='diff-track'>
              <div className='diff-fill med-fill' style={{ width: `${Math.min(100, (diff.medium / totalSolved) * 100)}%` }} />
            </div>
          </div>

          <div className='diff-item hard'>
            <div className='diff-top'>
              <span className='diff-name'>Hard Problems (Advanced)</span>
              <strong className='diff-count'>{diff.hard} solved</strong>
            </div>
            <div className='diff-track'>
              <div className='diff-fill hard-fill' style={{ width: `${Math.min(100, (diff.hard / totalSolved) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Supported Platforms Grid */}
      <div className='ai-section-block'>
        <div className='section-block-header'>
          <h3>Supported Competitive Platforms</h3>
        </div>

        <div className='platforms-grid'>
          {/* LeetCode */}
          <div className='platform-card'>
            <div className='platform-card-top'>
              <Code2 size={20} className='text-amber' />
              <h4>LeetCode</h4>
              <span className={`platform-status-badge ${platforms.leetcode.connected ? 'connected' : 'pending'}`}>
                {platforms.leetcode.connected ? 'Connected' : 'Link Profile'}
              </span>
            </div>
            <div className='platform-metrics'>
              <div className='p-metric'><span>Solved:</span> <strong>{platforms.leetcode.solved}</strong></div>
              <div className='p-metric'><span>Rating:</span> <strong>{platforms.leetcode.rating}</strong></div>
              <div className='p-metric'><span>Rank:</span> <strong>{platforms.leetcode.rank}</strong></div>
            </div>
            {links.leetcodeUrl && (
              <a href={links.leetcodeUrl} target='_blank' rel='noreferrer' className='platform-ext-link'>
                <span>View LeetCode</span> <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* HackerRank */}
          <div className='platform-card'>
            <div className='platform-card-top'>
              <Trophy size={20} className='text-success' />
              <h4>HackerRank</h4>
              <span className={`platform-status-badge ${platforms.hackerrank.connected ? 'connected' : 'pending'}`}>
                {platforms.hackerrank.connected ? 'Connected' : 'Link Profile'}
              </span>
            </div>
            <div className='platform-metrics'>
              <div className='p-metric'><span>Stars:</span> <strong>{platforms.hackerrank.stars}★ Gold</strong></div>
              <div className='p-metric'><span>Badges:</span> <strong>{platforms.hackerrank.badges} Verified</strong></div>
              <div className='p-metric'><span>Domain:</span> <strong>Problem Solving</strong></div>
            </div>
            {links.hackerrankUrl && (
              <a href={links.hackerrankUrl} target='_blank' rel='noreferrer' className='platform-ext-link'>
                <span>View HackerRank</span> <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* CodeChef */}
          <div className='platform-card'>
            <div className='platform-card-top'>
              <Award size={20} className='text-primary' />
              <h4>CodeChef</h4>
              <span className={`platform-status-badge ${platforms.codechef.connected ? 'connected' : 'pending'}`}>
                {platforms.codechef.connected ? 'Connected' : 'Link Profile'}
              </span>
            </div>
            <div className='platform-metrics'>
              <div className='p-metric'><span>Rating:</span> <strong>{platforms.codechef.rating}</strong></div>
              <div className='p-metric'><span>Division:</span> <strong>{platforms.codechef.stars} Division 2</strong></div>
              <div className='p-metric'><span>Contests:</span> <strong>Active</strong></div>
            </div>
            {links.codechefUrl && (
              <a href={links.codechefUrl} target='_blank' rel='noreferrer' className='platform-ext-link'>
                <span>View CodeChef</span> <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* HackerEarth */}
          <div className='platform-card'>
            <div className='platform-card-top'>
              <Cpu size={20} className='text-amber' />
              <h4>HackerEarth</h4>
              <span className={`platform-status-badge ${platforms.hackerearth.connected ? 'connected' : 'pending'}`}>
                {platforms.hackerearth.connected ? 'Connected' : 'Link Profile'}
              </span>
            </div>
            <div className='platform-metrics'>
              <div className='p-metric'><span>Points:</span> <strong>{platforms.hackerearth.points}</strong></div>
              <div className='p-metric'><span>Global Rank:</span> <strong>{platforms.hackerearth.rank}</strong></div>
              <div className='p-metric'><span>Contests:</span> <strong>Regular</strong></div>
            </div>
            {links.hackerearthUrl && (
              <a href={links.hackerearthUrl} target='_blank' rel='noreferrer' className='platform-ext-link'>
                <span>View HackerEarth</span> <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* AI Feedback & Suggestions Card (Featuring User Request Example) */}
      <div className='insight-card'>
        <h3 className='insight-title'>
          <ArrowUpRight size={18} className='text-amber' />
          <span>AI Problem-Solving Analysis & Feedback</span>
        </h3>
        <div className='recommendations-list'>
          {feedbackList.map((item, idx) => (
            <div key={idx} className='rec-item'>
              <TrendingUp size={16} className='rec-icon' />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
