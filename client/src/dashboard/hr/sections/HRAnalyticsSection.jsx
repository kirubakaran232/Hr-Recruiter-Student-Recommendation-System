import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Award, CheckCircle2,
  PieChart, Download, Sparkles, RefreshCw, Briefcase, Zap
} from 'lucide-react';
import { fetchHRAnalytics } from '../../../services/hrAnalytics.service.js';
import { downloadExportFile } from '../../../services/hrExport.service.js';

export default function HRAnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHRAnalytics();
      setAnalytics(data.analytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className='hr-card' style={{ padding: 48, textAlign: 'center' }}>
        <div className='hr-spinner' />
        <p style={{ marginTop: 14, color: '#6f6f68', fontWeight: 600 }}>Loading Recruitment Analytics & Insights…</p>
      </div>
    );
  }

  const {
    totalCandidates = 0,
    evaluatedCount  = 0,
    shortlistedCount= 0,
    avgTalentScore  = 0,
    selectionRate   = 0,
    distribution    = { excellent: 0, good: 0, needsWork: 0, unevaluated: 0 },
    topSkills       = [],
    funnel          = [],
    monthlyTrends   = [],
    applicationsPerJob = []
  } = analytics || {};

  return (
    <div className='hra-section'>
      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 7</p>
          <h2 className='hr-section-title'>Recruitment Reports & Analytics</h2>
          <p className='hr-section-subtitle'>
            Real-time talent metrics, score distributions, skill demand breakdown, and hiring funnel velocity.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            type='button'
            className='hr-save-btn'
            onClick={() => downloadExportFile('hiring_stats', 'excel')}
          >
            <Download size={15} /> Export Hiring Report
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ────────────────────────────── */}
      <div className='ci-stats-bar'>
        <div className='ci-stats-item'>
          <strong>{totalCandidates}</strong>
          <span>Total Candidates</span>
        </div>
        <div className='ci-stats-item amber'>
          <strong>{avgTalentScore}</strong>
          <span>Avg Talent Score</span>
        </div>
        <div className='ci-stats-item green'>
          <strong>{selectionRate}%</strong>
          <span>Selection Rate</span>
        </div>
        <div className='ci-stats-item purple'>
          <strong>{shortlistedCount}</strong>
          <span>Shortlisted</span>
        </div>
        <div className='ci-stats-item'>
          <strong>{evaluatedCount}</strong>
          <span>Evaluated</span>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className='hra-grid'>

        {/* 1. Score Distribution Histogram */}
        <div className='hr-card hra-card'>
          <div className='hra-card-header'>
            <Award size={18} className='hra-header-icon' />
            <h3>Candidate Score Distribution</h3>
          </div>
          <div className='hra-dist-bars'>
            <div className='hra-dist-row'>
              <div className='hra-dist-info'>
                <span className='hra-dot excellent' />
                <strong>Excellent (80–100)</strong>
                <span>{distribution.excellent} candidates</span>
              </div>
              <div className='hra-bar-track'>
                <div
                  className='hra-bar-fill excellent'
                  style={{ width: `${totalCandidates ? (distribution.excellent / totalCandidates) * 100 : 0}%` }}
                />
              </div>
              <strong className='hra-pct'>{totalCandidates ? Math.round((distribution.excellent / totalCandidates) * 100) : 0}%</strong>
            </div>

            <div className='hra-dist-row'>
              <div className='hra-dist-info'>
                <span className='hra-dot good' />
                <strong>Good (60–79)</strong>
                <span>{distribution.good} candidates</span>
              </div>
              <div className='hra-bar-track'>
                <div
                  className='hra-bar-fill good'
                  style={{ width: `${totalCandidates ? (distribution.good / totalCandidates) * 100 : 0}%` }}
                />
              </div>
              <strong className='hra-pct'>{totalCandidates ? Math.round((distribution.good / totalCandidates) * 100) : 0}%</strong>
            </div>

            <div className='hra-dist-row'>
              <div className='hra-dist-info'>
                <span className='hra-dot needs' />
                <strong>Needs Work (&lt;60)</strong>
                <span>{distribution.needsWork} candidates</span>
              </div>
              <div className='hra-bar-track'>
                <div
                  className='hra-bar-fill needs'
                  style={{ width: `${totalCandidates ? (distribution.needsWork / totalCandidates) * 100 : 0}%` }}
                />
              </div>
              <strong className='hra-pct'>{totalCandidates ? Math.round((distribution.needsWork / totalCandidates) * 100) : 0}%</strong>
            </div>
          </div>
        </div>

        {/* 2. Hiring Funnel Stages */}
        <div className='hr-card hra-card'>
          <div className='hra-card-header'>
            <TrendingUp size={18} className='hra-header-icon' />
            <h3>Hiring Funnel Velocity</h3>
          </div>
          <div className='hra-funnel-list'>
            {funnel.map((item, idx) => (
              <div key={item.stage} className='hra-funnel-step'>
                <div className='hra-funnel-step-header'>
                  <span className='hra-funnel-step-num'>Stage {idx + 1}</span>
                  <strong>{item.stage}</strong>
                  <span className='hra-funnel-count'>{item.count} candidates</span>
                </div>
                <div className='hra-bar-track'>
                  <div
                    className='hra-bar-fill'
                    style={{ width: `${totalCandidates ? (item.count / totalCandidates) * 100 : 0}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Top Skills Frequency */}
        <div className='hr-card hra-card hra-full'>
          <div className='hra-card-header'>
            <Sparkles size={18} className='hra-header-icon' />
            <h3>Top Candidate Skills & Technology Demand</h3>
          </div>
          <div className='hra-skills-grid'>
            {topSkills.map((sk) => (
              <div key={sk.name} className='hra-skill-card'>
                <div className='hra-skill-top'>
                  <strong>{sk.name}</strong>
                  <span>{sk.count} candidates ({sk.percentage}%)</span>
                </div>
                <div className='hra-bar-track'>
                  <div className='hra-bar-fill' style={{ width: `${sk.percentage}%`, background: '#ffdc5d' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Applications per Job Role */}
        <div className='hr-card hra-card hra-full'>
          <div className='hra-card-header'>
            <Briefcase size={18} className='hra-header-icon' />
            <h3>Applications & Shortlists per Active Job Role</h3>
          </div>
          <table className='ci-table'>
            <thead>
              <tr>
                <th>Job Role</th>
                <th style={{ textAlign: 'center' }}>Total Applications</th>
                <th style={{ textAlign: 'center' }}>Shortlisted Candidates</th>
                <th style={{ textAlign: 'center' }}>Role Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {applicationsPerJob.map((job) => {
                const conv = job.applications ? Math.round((job.shortlisted / job.applications) * 100) : 0;
                return (
                  <tr key={job.jobTitle} className='ci-table-row'>
                    <td><strong>{job.jobTitle}</strong></td>
                    <td style={{ textAlign: 'center' }}>{job.applications}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className='crk-exp-badge'>{job.shortlisted} shortlisted</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong style={{ color: '#15803d' }}>{conv}%</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
