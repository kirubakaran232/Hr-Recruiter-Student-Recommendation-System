import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2, Sparkles, Filter, Sliders, XCircle, Trash2,
  Plus, Users, Trophy, Award, Github, Code2, GraduationCap,
  Briefcase, Zap, RefreshCw, ChevronRight, AlertCircle, FileText
} from 'lucide-react';
import {
  runAutoShortlisting,
  fetchShortlistedCandidates,
  toggleCandidateShortlist
} from '../../../services/candidateShortlist.service.js';
import { fetchCandidates } from '../../../services/candidateImport.service.js';

function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score > 0)   return '#ef4444';
  return '#94a3b8';
}

export default function CandidateShortlistSection() {
  // Configurable minimum requirements
  const [minOverallScore, setMinOverallScore] = useState(85);
  const [minGithubScore,  setMinGithubScore]  = useState(80);
  const [minCodingScore,  setMinCodingScore]  = useState(75);
  const [minExperience,   setMinExperience]   = useState(1);
  const [minCgpa,         setMinCgpa]         = useState(7.5);

  // Shortlist data & stats
  const [shortlist,     setShortlist]     = useState([]);
  const [ruleStats,     setRuleStats]     = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [runningAuto,   setRunningAuto]   = useState(false);
  const [activeTab,     setActiveTab]     = useState('shortlist'); // 'shortlist' | 'all'
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Shortlist
  const loadShortlistData = useCallback(async () => {
    setLoading(true);
    try {
      const [shortlistRes, allRes] = await Promise.all([
        fetchShortlistedCandidates(),
        fetchCandidates({ page: 1, limit: 100 })
      ]);
      setShortlist(shortlistRes.shortlist || []);
      setAllCandidates(allRes.candidates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadShortlistData(); }, [loadShortlistData]);

  // Run Automated Shortlisting
  const handleRunAutoShortlist = async () => {
    setRunningAuto(true);
    try {
      const result = await runAutoShortlisting({
        minOverallScore: Number(minOverallScore),
        minGithubScore:  Number(minGithubScore),
        minCodingScore:  Number(minCodingScore),
        minExperience:   Number(minExperience),
        minCgpa:         Number(minCgpa)
      });
      setShortlist(result.shortlist || []);
      setRuleStats(result.rulePassStats || null);
      showToast(`${result.autoShortlistedCount} candidate(s) newly added to shortlist!`);
      // Reload overall pool to sync status badges
      const allRes = await fetchCandidates({ page: 1, limit: 100 });
      setAllCandidates(allRes.candidates || []);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Automated shortlisting failed', 'error');
    } finally {
      setRunningAuto(false);
    }
  };

  // Manual toggle single candidate
  const handleToggleShortlist = async (candidateId, currentlyShortlisted) => {
    try {
      const targetState = !currentlyShortlisted;
      await toggleCandidateShortlist(candidateId, targetState);

      // Update state locally
      if (targetState) {
        // Add to shortlist
        const candObj = allCandidates.find((c) => c.id === candidateId);
        if (candObj) {
          setShortlist((prev) => [...prev.filter((c) => c.id !== candidateId), { ...candObj, status: 'shortlisted' }]);
        }
        showToast('Candidate added to shortlist');
      } else {
        // Remove from shortlist
        setShortlist((prev) => prev.filter((c) => c.id !== candidateId));
        showToast('Candidate removed from shortlist');
      }

      setAllCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: targetState ? 'shortlisted' : 'evaluated' } : c))
      );
    } catch (e) {
      showToast(e?.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <div className='csl-section'>
      {/* Toast */}
      {toast && (
        <div className={`hr-toast ${toast.type === 'error' ? 'hr-toast-error' : 'hr-toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 6</p>
          <h2 className='hr-section-title'>Automated Candidate Shortlisting</h2>
          <p className='hr-section-subtitle'>
            Configure recruiter minimum thresholds (Overall Score, GitHub, Coding, Experience, CGPA)
            to automatically generate your candidate shortlist, with full manual override control.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            type='button'
            className='ci-refresh-btn'
            onClick={loadShortlistData}
          >
            <RefreshCw size={15} /> Refresh Shortlist
          </button>
        </div>
      </div>

      {/* ── Threshold Configuration Card ────────────────────── */}
      <div className='hr-card csl-config-card'>
        <div className='csl-config-header'>
          <div className='csl-config-title'>
            <Sliders size={18} className='csl-config-icon' />
            <h3>Configure Shortlisting Threshold Rules</h3>
          </div>
          <span className='csl-rule-badge'>5 Requirement Rules</span>
        </div>

        <div className='csl-rules-grid'>
          {/* Rule 1: Overall Score */}
          <div className='csl-rule-item'>
            <div className='csl-rule-label'>
              <Award size={15} style={{ color: '#22c55e' }} />
              <span>Min Overall Score</span>
            </div>
            <div className='csl-rule-input-wrap'>
              <input
                id='csl-min-overall'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={minOverallScore}
                onChange={(e) => setMinOverallScore(e.target.value)}
              />
              <span className='csl-rule-unit'>/ 100</span>
            </div>
          </div>

          {/* Rule 2: GitHub Score */}
          <div className='csl-rule-item'>
            <div className='csl-rule-label'>
              <Github size={15} style={{ color: '#6366f1' }} />
              <span>Min GitHub Score</span>
            </div>
            <div className='csl-rule-input-wrap'>
              <input
                id='csl-min-github'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={minGithubScore}
                onChange={(e) => setMinGithubScore(e.target.value)}
              />
              <span className='csl-rule-unit'>/ 100</span>
            </div>
          </div>

          {/* Rule 3: Coding Score */}
          <div className='csl-rule-item'>
            <div className='csl-rule-label'>
              <Code2 size={15} style={{ color: '#8b5cf6' }} />
              <span>Min Coding Score</span>
            </div>
            <div className='csl-rule-input-wrap'>
              <input
                id='csl-min-coding'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={minCodingScore}
                onChange={(e) => setMinCodingScore(e.target.value)}
              />
              <span className='csl-rule-unit'>/ 100</span>
            </div>
          </div>

          {/* Rule 4: Experience */}
          <div className='csl-rule-item'>
            <div className='csl-rule-label'>
              <Briefcase size={15} style={{ color: '#f59e0b' }} />
              <span>Min Experience</span>
            </div>
            <div className='csl-rule-input-wrap'>
              <input
                id='csl-min-exp'
                type='number'
                min='0'
                max='20'
                step='0.5'
                className='csl-rule-input'
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
              />
              <span className='csl-rule-unit'>Years</span>
            </div>
          </div>

          {/* Rule 5: CGPA */}
          <div className='csl-rule-item'>
            <div className='csl-rule-label'>
              <GraduationCap size={15} style={{ color: '#0ea5e9' }} />
              <span>Min CGPA</span>
            </div>
            <div className='csl-rule-input-wrap'>
              <input
                id='csl-min-cgpa'
                type='number'
                min='0'
                max='10'
                step='0.1'
                className='csl-rule-input'
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
              />
              <span className='csl-rule-unit'>/ 10.0</span>
            </div>
          </div>
        </div>

        <div className='csl-config-footer'>
          <button
            type='button'
            id='csl-run-auto-btn'
            className='hr-save-btn csl-run-btn'
            disabled={runningAuto}
            onClick={handleRunAutoShortlist}
          >
            {runningAuto ? (
              <><span className='hr-btn-spinner' /> Evaluating Rules…</>
            ) : (
              <><Zap size={16} /> Run Automated Shortlisting</>
            )}
          </button>
        </div>
      </div>

      {/* ── Rule Evaluation Statistics Summary Banner ───────── */}
      {ruleStats && (
        <div className='csl-stats-card'>
          <h4><Sparkles size={15} /> Automated Shortlisting Rule Evaluation Report</h4>
          <div className='csl-stats-pills'>
            <div className='csl-stat-box green'>
              <strong>{ruleStats.passedAllRules}</strong>
              <span>Passed All Rules</span>
            </div>
            <div className='csl-stat-box'>
              <strong>{ruleStats.overallScorePass}</strong>
              <span>Passed Overall &gt; {minOverallScore}</span>
            </div>
            <div className='csl-stat-box'>
              <strong>{ruleStats.githubScorePass}</strong>
              <span>Passed GitHub &gt; {minGithubScore}</span>
            </div>
            <div className='csl-stat-box'>
              <strong>{ruleStats.codingScorePass}</strong>
              <span>Passed Coding &gt; {minCodingScore}</span>
            </div>
            <div className='csl-stat-box'>
              <strong>{ruleStats.experiencePass}</strong>
              <span>Passed Exp &gt; {minExperience} yr</span>
            </div>
            <div className='csl-stat-box'>
              <strong>{ruleStats.cgpaPass}</strong>
              <span>Passed CGPA &gt; {minCgpa}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Switcher: Shortlisted Candidates vs Pool ────── */}
      <div className='hr-tab-bar'>
        <button
          type='button'
          className={`hr-tab-btn${activeTab === 'shortlist' ? ' active' : ''}`}
          onClick={() => setActiveTab('shortlist')}
        >
          <CheckCircle2 size={15} /> Shortlisted Candidates ({shortlist.length})
        </button>
        <button
          type='button'
          className={`hr-tab-btn${activeTab === 'all' ? ' active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Users size={15} /> All Candidates Pool ({allCandidates.length})
        </button>
      </div>

      {/* ── Candidates Table ─────────────────────────────────── */}
      <div className='hr-card ci-table-card'>
        {loading ? (
          <div className='ci-table-loading'>
            <div className='hr-spinner' />
            <span>Loading candidates shortlist…</span>
          </div>
        ) : activeTab === 'shortlist' ? (
          /* SHORTLIST TAB */
          shortlist.length === 0 ? (
            <div className='ci-empty-table'>
              <CheckCircle2 size={38} className='ci-empty-icon' />
              <p>No candidates shortlisted yet</p>
              <small>Run automated shortlisting above or manually add candidates from the pool</small>
            </div>
          ) : (
            <div className='ci-table-wrapper'>
              <table className='ci-table'>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Shortlisted Candidate</th>
                    <th style={{ textAlign: 'center' }}>Overall Score</th>
                    <th style={{ textAlign: 'center' }}>GitHub</th>
                    <th style={{ textAlign: 'center' }}>Coding</th>
                    <th style={{ textAlign: 'center' }}>Experience</th>
                    <th style={{ textAlign: 'center' }}>CGPA</th>
                    <th>Skills</th>
                    <th style={{ textAlign: 'center' }}>Shortlist Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shortlist.map((c, idx) => {
                    const scoreColor = getScoreColor(c.aiScore);

                    return (
                      <tr key={c.id} className='ci-table-row'>
                        <td className='ci-td-num'>{idx + 1}</td>
                        <td className='ci-td-name'>
                          <div className='ci-candidate-avatar'>{c.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <strong>{c.name}</strong>
                            <span className='ci-candidate-email'>{c.email}</span>
                            {c.college && <small>{c.college}</small>}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className='crk-score-badge' style={{ color: scoreColor, borderColor: scoreColor }}>
                            {c.aiScore}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <strong>{c.categoryScores?.github ?? 0}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <strong>{c.categoryScores?.coding ?? 0}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span>{c.experienceYears != null ? `${c.experienceYears} yrs` : '—'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span>{c.cgpa != null ? c.cgpa : (c.college ? '8.0' : '—')}</span>
                        </td>
                        <td className='ci-td-skills'>
                          {c.skills?.slice(0, 3).map((s) => (
                            <span key={s} className='ci-skill-tag'>{s}</span>
                          ))}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type='button'
                            className='csl-remove-btn'
                            title='Remove candidate from shortlist'
                            onClick={() => handleToggleShortlist(c.id, true)}
                          >
                            <XCircle size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ALL CANDIDATES POOL TAB */
          <div className='ci-table-wrapper'>
            <table className='ci-table'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th style={{ textAlign: 'center' }}>Overall Score</th>
                  <th style={{ textAlign: 'center' }}>GitHub</th>
                  <th style={{ textAlign: 'center' }}>Coding</th>
                  <th style={{ textAlign: 'center' }}>Experience</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Manual Selection</th>
                </tr>
              </thead>
              <tbody>
                {allCandidates.map((c, idx) => {
                  const isShortlisted = c.status === 'shortlisted';
                  const scoreColor    = getScoreColor(c.aiScore);

                  return (
                    <tr key={c.id} className='ci-table-row'>
                      <td className='ci-td-num'>{idx + 1}</td>
                      <td className='ci-td-name'>
                        <div className='ci-candidate-avatar'>{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{c.name}</strong>
                          <span className='ci-candidate-email'>{c.email}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className='crk-score-badge' style={{ color: scoreColor, borderColor: scoreColor }}>
                          {c.aiScore ?? 0}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {c.aiEvaluation?.breakdown?.github?.score ?? '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {c.aiEvaluation?.breakdown?.coding?.score ?? '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {c.experienceYears != null ? `${c.experienceYears} yrs` : '—'}
                      </td>
                      <td>
                        <span className={`ci-status-chip ${c.status}`}>{c.status}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type='button'
                          className={`csl-toggle-btn${isShortlisted ? ' active' : ''}`}
                          onClick={() => handleToggleShortlist(c.id, isShortlisted)}
                        >
                          {isShortlisted ? (
                            <><XCircle size={14} /> Remove</>
                          ) : (
                            <><Plus size={14} /> Shortlist</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
