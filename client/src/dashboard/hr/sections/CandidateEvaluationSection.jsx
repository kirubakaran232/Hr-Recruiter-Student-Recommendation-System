import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, RefreshCw, Users, Trophy, TrendingUp,
  FileText, Github, Code2, Globe, Terminal, Award,
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
  Zap, Star, BarChart3, Search, X
} from 'lucide-react';
import {
  evaluateCandidate,
  evaluateAllCandidates,
  fetchEvaluationSummary,
  getCandidateEvaluation
} from '../../../services/candidateEvaluation.service.js';
import { fetchCandidates } from '../../../services/candidateImport.service.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = [
  { key: 'resume',    label: 'Resume',    icon: FileText,  weight: '20%', color: '#f59e0b' },
  { key: 'github',    label: 'GitHub',    icon: Github,    weight: '20%', color: '#6366f1' },
  { key: 'skills',    label: 'Skills',    icon: Code2,     weight: '18%', color: '#0ea5e9' },
  { key: 'projects',  label: 'Projects',  icon: TrendingUp,weight: '16%', color: '#10b981' },
  { key: 'coding',    label: 'Coding',    icon: Terminal,  weight: '14%', color: '#8b5cf6' },
  { key: 'portfolio', label: 'Portfolio', icon: Globe,     weight: '12%', color: '#ec4899' }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score > 0)   return '#ef4444';
  return '#94a3b8';
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score > 0)   return 'Needs Work';
  return 'No Data';
}

// ── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, strokeWidth = 10, label }) {
  const r   = (size - strokeWidth) / 2;
  const c   = 2 * Math.PI * r;
  const pct = score / 100;
  const color = getScoreColor(score);

  return (
    <div className='cae-score-ring-wrap' style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill='none' stroke='rgba(36,36,36,0.08)'
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill='none' stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className='cae-score-ring-inner'>
        <strong style={{ color }}>{score}</strong>
        <span>{label || getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

// ── Category Score Bar ────────────────────────────────────────────────────────
function CategoryBar({ config, score, explanation }) {
  const [expanded, setExpanded] = useState(false);
  const Icon  = config.icon;
  const color = getScoreColor(score);

  return (
    <div className={`cae-cat-bar${expanded ? ' expanded' : ''}`}>
      <div
        className='cae-cat-bar-header'
        onClick={() => setExpanded((p) => !p)}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
      >
        <div className='cae-cat-icon-wrap' style={{ background: `${config.color}18`, color: config.color }}>
          <Icon size={14} />
        </div>
        <span className='cae-cat-label'>{config.label}</span>
        <span className='cae-cat-weight'>{config.weight}</span>
        <div className='cae-cat-bar-track'>
          <div
            className='cae-cat-bar-fill'
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <span className='cae-cat-score' style={{ color }}>{score}</span>
        <ChevronRight
          size={14}
          className='cae-cat-chevron'
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        />
      </div>
      {expanded && explanation && (
        <p className='cae-cat-explanation'>{explanation}</p>
      )}
    </div>
  );
}

// ── Candidate Card (list item) ────────────────────────────────────────────────
function CandidateCard({ candidate, onEvaluate, evaluating, onSelect, isSelected }) {
  const hasEval = candidate.status === 'evaluated' && candidate.aiScore != null;
  const color   = hasEval ? getScoreColor(candidate.aiScore) : '#94a3b8';

  return (
    <div
      className={`cae-cand-card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(candidate)}
    >
      <div className='cae-cand-avatar' style={{ background: hasEval ? '#111111' : 'rgba(36,36,36,0.08)' }}>
        {candidate.name.charAt(0).toUpperCase()}
      </div>

      <div className='cae-cand-info'>
        <strong>{candidate.name}</strong>
        <span>{candidate.email}</span>
        {candidate.college && <small>{candidate.college}</small>}
      </div>

      <div className='cae-cand-right'>
        {hasEval ? (
          <div className='cae-mini-score' style={{ color, borderColor: color }}>
            {candidate.aiScore}
          </div>
        ) : (
          <button
            type='button'
            id={`cae-eval-btn-${candidate.id}`}
            className='cae-eval-single-btn'
            disabled={evaluating === candidate.id}
            onClick={(e) => { e.stopPropagation(); onEvaluate(candidate.id); }}
          >
            {evaluating === candidate.id
              ? <span className='cae-mini-spinner' />
              : <><Sparkles size={12} /> Evaluate</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── Evaluation Detail Panel ───────────────────────────────────────────────────
function EvaluationPanel({ candidate, evaluation, loading, onClose, onEvaluate, evaluating }) {
  if (!candidate) {
    return (
      <div className='cae-panel cae-panel-empty'>
        <Sparkles size={40} className='cae-panel-empty-icon' />
        <p>Select a candidate to view their AI evaluation</p>
        <small>Click any candidate from the list, or run "Evaluate All" to process your entire pool at once</small>
      </div>
    );
  }

  const hasEval = evaluation && evaluation.breakdown;

  return (
    <div className='cae-panel'>
      <div className='cae-panel-header'>
        <div className='cae-panel-avatar'>
          {candidate.name.charAt(0).toUpperCase()}
        </div>
        <div className='cae-panel-name-block'>
          <h3>{candidate.name}</h3>
          <a href={`mailto:${candidate.email}`} className='cae-panel-email'>{candidate.email}</a>
          {candidate.college && (
            <span className='cae-panel-college'>{candidate.college}</span>
          )}
        </div>
        <button type='button' className='cae-panel-close' onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div className='cae-panel-loading'>
          <div className='hr-spinner' />
          <span>Running AI evaluation…</span>
        </div>
      ) : !hasEval ? (
        <div className='cae-panel-no-eval'>
          <AlertCircle size={28} className='cae-no-eval-icon' />
          <p>Not yet evaluated</p>
          <button
            type='button'
            className='hr-save-btn'
            id={`cae-run-eval-${candidate.id}`}
            disabled={evaluating === candidate.id}
            onClick={() => onEvaluate(candidate.id)}
          >
            {evaluating === candidate.id
              ? <><span className='hr-btn-spinner' /> Running…</>
              : <><Sparkles size={15} /> Run AI Evaluation</>
            }
          </button>
        </div>
      ) : (
        <div className='cae-panel-body'>
          {/* Overall Score */}
          <div className='cae-panel-score-hero'>
            <ScoreRing score={evaluation.talentScore} size={120} strokeWidth={10} />
            <div className='cae-panel-score-meta'>
              <p className='cae-overall-label'>Overall Talent Score</p>
              <p className='cae-narrative'>{evaluation.summaryNarrative}</p>

              {evaluation.strengths?.length > 0 && (
                <div className='cae-strengths'>
                  {evaluation.strengths.map((s) => (
                    <span key={s} className='cae-strength-chip'>
                      <Star size={11} /> {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Scores */}
          <div className='cae-categories'>
            <p className='cae-section-label'>Category Breakdown</p>
            {CATEGORY_CONFIG.map((cfg) => {
              const dim = evaluation.breakdown?.[cfg.key];
              return (
                <CategoryBar
                  key={cfg.key}
                  config={cfg}
                  score={dim?.score ?? 0}
                  explanation={dim?.explanation}
                />
              );
            })}
          </div>

          {/* Recommendations */}
          {evaluation.recommendations?.length > 0 && (
            <div className='cae-recommendations'>
              <p className='cae-section-label'>Recruiter Recommendations</p>
              <ul className='cae-rec-list'>
                {evaluation.recommendations.map((r, i) => (
                  <li key={i}>
                    <CheckCircle2 size={13} className='cae-rec-icon' />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Re-evaluate */}
          <button
            type='button'
            className='cae-re-eval-btn'
            id={`cae-rerun-${candidate.id}`}
            disabled={evaluating === candidate.id}
            onClick={() => onEvaluate(candidate.id)}
          >
            {evaluating === candidate.id
              ? <><span className='hr-btn-spinner' /> Re-evaluating…</>
              : <><RefreshCw size={14} /> Re-evaluate</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

// ── Top Candidates Leaderboard ────────────────────────────────────────────────
function Leaderboard({ topCandidates, summary }) {
  if (!topCandidates?.length) return null;
  return (
    <div className='cae-leaderboard'>
      <div className='cae-leaderboard-header'>
        <Trophy size={16} className='cae-lb-icon' />
        <h3>Top Candidates</h3>
      </div>

      {/* Distribution bar */}
      {summary && (
        <div className='cae-distribution'>
          <div className='cae-dist-bar'>
            <div
              className='cae-dist-fill excellent'
              style={{ flex: summary.distribution.excellent }}
              title={`Excellent (≥80): ${summary.distribution.excellent}`}
            />
            <div
              className='cae-dist-fill good'
              style={{ flex: summary.distribution.good }}
              title={`Good (60-79): ${summary.distribution.good}`}
            />
            <div
              className='cae-dist-fill needs'
              style={{ flex: summary.distribution.needsWork }}
              title={`Needs Work (<60): ${summary.distribution.needsWork}`}
            />
          </div>
          <div className='cae-dist-labels'>
            <span className='excellent'>Excellent {summary.distribution.excellent}</span>
            <span className='good'>Good {summary.distribution.good}</span>
            <span className='needs'>Needs Work {summary.distribution.needsWork}</span>
          </div>
          <div className='cae-dist-stats'>
            <div className='cae-dist-stat'><strong>{summary.avgScore}</strong><span>Avg Score</span></div>
            <div className='cae-dist-stat'><strong>{summary.maxScore}</strong><span>Highest</span></div>
            <div className='cae-dist-stat'><strong>{summary.total}</strong><span>Evaluated</span></div>
          </div>
        </div>
      )}

      <ol className='cae-lb-list'>
        {topCandidates.map((c, i) => (
          <li key={c.id} className='cae-lb-item'>
            <span className='cae-lb-rank' style={{ color: i === 0 ? '#ffdc5d' : i === 1 ? '#c0bdb4' : i === 2 ? '#cd7f32' : '#6f6f68' }}>
              #{i + 1}
            </span>
            <div className='cae-lb-info'>
              <strong>{c.name}</strong>
              <span>{c.skills?.slice(0, 3).join(', ')}</span>
            </div>
            <div className='cae-lb-score' style={{ color: getScoreColor(c.aiScore) }}>
              {c.aiScore}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function CandidateEvaluationSection() {
  const [candidates,      setCandidates]     = useState([]);
  const [listLoading,     setListLoading]    = useState(true);
  const [searchInput,     setSearchInput]    = useState('');
  const [search,          setSearch]         = useState('');

  const [selectedCand,   setSelectedCand]   = useState(null);
  const [evaluation,     setEvaluation]     = useState(null);
  const [panelLoading,   setPanelLoading]   = useState(false);

  const [evaluating,     setEvaluating]     = useState(null); // candidateId being evaluated
  const [bulkRunning,    setBulkRunning]    = useState(false);
  const [bulkResult,     setBulkResult]     = useState(null);

  const [leaderboard,    setLeaderboard]    = useState(null);
  const [lbLoading,      setLbLoading]      = useState(true);

  const [toast,          setToast]          = useState(null);

  // ── Load candidates ────────────────────────────────────────────────────────
  const loadCandidates = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchCandidates({ page: 1, limit: 100, search });
      setCandidates(data.candidates);
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [search]);

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const data = await fetchEvaluationSummary();
      setLeaderboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);
  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Select candidate ───────────────────────────────────────────────────────
  const handleSelect = async (candidate) => {
    setSelectedCand(candidate);
    setEvaluation(null);

    if (candidate.status === 'evaluated') {
      setPanelLoading(true);
      try {
        const data = await getCandidateEvaluation(candidate.id);
        setEvaluation(data.evaluation);
      } catch (e) {
        console.error(e);
      } finally {
        setPanelLoading(false);
      }
    }
  };

  // ── Evaluate single ────────────────────────────────────────────────────────
  const handleEvaluateSingle = async (candidateId) => {
    setEvaluating(candidateId);
    if (selectedCand?.id === candidateId) setPanelLoading(true);
    try {
      const data = await evaluateCandidate(candidateId);
      setEvaluation(data.evaluation);

      // Refresh candidate list item status
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, status: 'evaluated', aiScore: data.evaluation.talentScore }
            : c
        )
      );
      if (selectedCand?.id === candidateId) {
        setSelectedCand((p) => ({ ...p, status: 'evaluated', aiScore: data.evaluation.talentScore }));
      }
      showToast(`${data.message}`);
      loadLeaderboard();
    } catch (e) {
      showToast(e?.response?.data?.message || 'Evaluation failed', 'error');
    } finally {
      setEvaluating(null);
      setPanelLoading(false);
    }
  };

  // ── Bulk evaluate ──────────────────────────────────────────────────────────
  const handleEvaluateAll = async () => {
    setBulkRunning(true);
    setBulkResult(null);
    try {
      const data = await evaluateAllCandidates('pending');
      setBulkResult(data);
      showToast(`${data.evaluated} candidate(s) evaluated successfully`);
      await loadCandidates();
      await loadLeaderboard();
    } catch (e) {
      showToast(e?.response?.data?.message || 'Bulk evaluation failed', 'error');
    } finally {
      setBulkRunning(false);
    }
  };

  // ── Filtered candidates ────────────────────────────────────────────────────
  const pending   = candidates.filter((c) => c.status !== 'evaluated');
  const evaluated = candidates.filter((c) => c.status === 'evaluated');

  return (
    <div className='cae-section'>
      {/* Toast */}
      {toast && (
        <div className={`hr-toast ${toast.type === 'error' ? 'hr-toast-error' : 'hr-toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
          <button type='button' onClick={() => setToast(null)}><X size={13} /></button>
        </div>
      )}

      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 3</p>
          <h2 className='hr-section-title'>AI Candidate Evaluation</h2>
          <p className='hr-section-subtitle'>
            Automatically evaluate candidates across 6 weighted dimensions and
            generate an Overall Talent Score with AI-powered explanations.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            id='cae-evaluate-all-btn'
            type='button'
            className='hr-save-btn'
            disabled={bulkRunning || pending.length === 0}
            onClick={handleEvaluateAll}
          >
            {bulkRunning
              ? <><span className='hr-btn-spinner' /> Evaluating…</>
              : <><Zap size={15} /> Evaluate All ({pending.length})</>
            }
          </button>
        </div>
      </div>

      {/* ── Bulk Result Banner ───────────────────────────────── */}
      {bulkResult && (
        <div className='cae-bulk-result'>
          <CheckCircle2 size={16} />
          <span>
            <strong>{bulkResult.evaluated}</strong> candidates evaluated in this batch.
          </span>
          <button type='button' onClick={() => setBulkResult(null)}><X size={13} /></button>
        </div>
      )}

      {/* ── Main 3-column Layout ─────────────────────────────── */}
      <div className='cae-layout'>

        {/* LEFT: Candidate List */}
        <div className='cae-list-col'>
          <div className='cae-list-search'>
            <Search size={14} />
            <input
              id='cae-search'
              placeholder='Search candidates…'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {listLoading ? (
            <div className='cae-list-loading'><div className='hr-spinner' /></div>
          ) : candidates.length === 0 ? (
            <div className='cae-list-empty'>
              <Users size={28} />
              <p>No candidates yet</p>
              <small>Import candidates in Module 2 first</small>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className='cae-list-group'>
                  <p className='cae-list-group-label'>Pending ({pending.length})</p>
                  {pending.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      onEvaluate={handleEvaluateSingle}
                      evaluating={evaluating}
                      onSelect={handleSelect}
                      isSelected={selectedCand?.id === c.id}
                    />
                  ))}
                </div>
              )}
              {evaluated.length > 0 && (
                <div className='cae-list-group'>
                  <p className='cae-list-group-label'>Evaluated ({evaluated.length})</p>
                  {[...evaluated].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)).map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      onEvaluate={handleEvaluateSingle}
                      evaluating={evaluating}
                      onSelect={handleSelect}
                      isSelected={selectedCand?.id === c.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* CENTER: Evaluation Panel */}
        <div className='cae-panel-col'>
          <EvaluationPanel
            candidate={selectedCand}
            evaluation={evaluation}
            loading={panelLoading}
            onClose={() => { setSelectedCand(null); setEvaluation(null); }}
            onEvaluate={handleEvaluateSingle}
            evaluating={evaluating}
          />
        </div>

        {/* RIGHT: Leaderboard */}
        <div className='cae-lb-col'>
          {lbLoading ? (
            <div className='cae-lb-loading'><div className='hr-spinner' /></div>
          ) : (
            <Leaderboard
              topCandidates={leaderboard?.topCandidates}
              summary={leaderboard?.summary}
            />
          )}
        </div>
      </div>
    </div>
  );
}
