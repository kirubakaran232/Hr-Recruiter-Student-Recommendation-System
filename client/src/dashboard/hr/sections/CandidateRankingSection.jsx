import { useCallback, useEffect, useState } from 'react';
import {
  Trophy, ArrowUpDown, Search, Filter, RefreshCw, Star,
  Award, CheckCircle2, XCircle, AlertCircle, ChevronLeft,
  ChevronRight, ExternalLink, Github, Code2, FileText, Globe,
  Briefcase, Users, Zap, Check, X
} from 'lucide-react';
import {
  fetchCandidateRankings,
  updateCandidateStatus
} from '../../../services/candidateRanking.service.js';

// ── Sorting Options ───────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'highest_score',  label: 'Highest Score'  },
  { value: 'lowest_score',   label: 'Lowest Score'   },
  { value: 'experience',     label: 'Experience'     },
  { value: 'github_score',   label: 'GitHub Score'   },
  { value: 'coding_score',   label: 'Coding Score'   },
  { value: 'resume_score',   label: 'Resume Score'   },
  { value: 'recently_added', label: 'Recently Added' }
];

// ── Status Options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '',            label: 'All Statuses'  },
  { value: 'evaluated',   label: 'Evaluated'    },
  { value: 'shortlisted', label: 'Shortlisted'  },
  { value: 'rejected',    label: 'Rejected'     },
  { value: 'pending',     label: 'Pending'      }
];

function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score > 0)   return '#ef4444';
  return '#94a3b8';
}

function getRankBadgeStyle(rank) {
  if (rank === 1) return { bg: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)', color: '#111111', icon: '👑' };
  if (rank === 2) return { bg: 'linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 100%)', color: '#111111', icon: '🥈' };
  if (rank === 3) return { bg: 'linear-gradient(135deg, #f4a76c 0%, #c86d3b 100%)', color: '#ffffff', icon: '🥉' };
  return { bg: 'rgba(36,36,36,0.06)', color: '#6f6f68', icon: null };
}

// ── Podium Cards for Top 3 ────────────────────────────────────────────────────
function Podium({ topThree, onSelect }) {
  if (!topThree || topThree.length === 0) return null;
  const first  = topThree[0];
  const second = topThree[1];
  const third  = topThree[2];

  return (
    <div className='crk-podium-container'>
      {/* 2nd Place */}
      {second && (
        <div className='crk-podium-card silver' onClick={() => onSelect(second)}>
          <div className='crk-podium-rank'>#2</div>
          <div className='crk-podium-avatar'>{second.name.charAt(0).toUpperCase()}</div>
          <h4 className='crk-podium-name'>{second.name}</h4>
          <span className='crk-podium-college'>{second.college || second.email}</span>
          <div className='crk-podium-score-pill' style={{ color: getScoreColor(second.overallScore) }}>
            {second.overallScore} <small>Score</small>
          </div>
          <div className='crk-podium-jd'>JD Match: {second.jdMatchScore}%</div>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className='crk-podium-card gold' onClick={() => onSelect(first)}>
          <div className='crk-podium-crown'>👑 TOP PERFORMER</div>
          <div className='crk-podium-rank gold'>#1</div>
          <div className='crk-podium-avatar gold'>{first.name.charAt(0).toUpperCase()}</div>
          <h4 className='crk-podium-name'>{first.name}</h4>
          <span className='crk-podium-college'>{first.college || first.email}</span>
          <div className='crk-podium-score-pill gold'>
            {first.overallScore} <small>Score</small>
          </div>
          <div className='crk-podium-jd gold'>JD Match: {first.jdMatchScore}%</div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className='crk-podium-card bronze' onClick={() => onSelect(third)}>
          <div className='crk-podium-rank'>#3</div>
          <div className='crk-podium-avatar'>{third.name.charAt(0).toUpperCase()}</div>
          <h4 className='crk-podium-name'>{third.name}</h4>
          <span className='crk-podium-college'>{third.college || third.email}</span>
          <div className='crk-podium-score-pill' style={{ color: getScoreColor(third.overallScore) }}>
            {third.overallScore} <small>Score</small>
          </div>
          <div className='crk-podium-jd'>JD Match: {third.jdMatchScore}%</div>
        </div>
      )}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function CandidateDetailModal({ candidate, onClose, onStatusChange }) {
  if (!candidate) return null;
  const scoreColor = getScoreColor(candidate.overallScore);

  return (
    <div className='crk-modal-overlay' onClick={onClose}>
      <div className='crk-modal' onClick={(e) => e.stopPropagation()}>
        <button type='button' className='crk-modal-close' onClick={onClose}><X size={16} /></button>

        <div className='crk-modal-header'>
          <div className='crk-modal-avatar'>{candidate.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{candidate.name}</h2>
            <p>{candidate.email} • {candidate.college || 'N/A'}</p>
          </div>
          <div className='crk-modal-rank-badge'>Rank #{candidate.rank}</div>
        </div>

        <div className='crk-modal-scores-grid'>
          <div className='crk-modal-score-box'>
            <span className='crk-modal-score-val' style={{ color: scoreColor }}>{candidate.overallScore}</span>
            <span className='crk-modal-score-lbl'>Overall Talent Score</span>
          </div>
          <div className='crk-modal-score-box'>
            <span className='crk-modal-score-val' style={{ color: '#0ea5e9' }}>{candidate.jdMatchScore}%</span>
            <span className='crk-modal-score-lbl'>JD Match Score</span>
          </div>
          <div className='crk-modal-score-box'>
            <span className='crk-modal-score-val'>{candidate.experienceYears != null ? `${candidate.experienceYears} yrs` : 'N/A'}</span>
            <span className='crk-modal-score-lbl'>Experience</span>
          </div>
        </div>

        {/* Category Scores */}
        <div className='crk-modal-cat-grid'>
          <div className='crk-modal-cat-item'>
            <span><FileText size={13} /> Resume Score</span>
            <strong>{candidate.categoryScores?.resume ?? 0}</strong>
          </div>
          <div className='crk-modal-cat-item'>
            <span><Github size={13} /> GitHub Score</span>
            <strong>{candidate.categoryScores?.github ?? 0}</strong>
          </div>
          <div className='crk-modal-cat-item'>
            <span><Code2 size={13} /> Coding Score</span>
            <strong>{candidate.categoryScores?.coding ?? 0}</strong>
          </div>
          <div className='crk-modal-cat-item'>
            <span><Globe size={13} /> Portfolio Score</span>
            <strong>{candidate.categoryScores?.portfolio ?? 0}</strong>
          </div>
        </div>

        {/* Strengths & Narrative */}
        {candidate.summaryNarrative && (
          <div className='crk-modal-narrative'>
            <p><strong>AI Evaluation Summary:</strong> {candidate.summaryNarrative}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className='crk-modal-actions'>
          <span className='crk-modal-status-lbl'>Update Pipeline Status:</span>
          <div className='crk-status-buttons'>
            <button
              type='button'
              className={`crk-status-btn shortlist${candidate.status === 'shortlisted' ? ' active' : ''}`}
              onClick={() => onStatusChange(candidate.id, 'shortlisted')}
            >
              <CheckCircle2 size={14} /> Shortlist
            </button>
            <button
              type='button'
              className={`crk-status-btn reject${candidate.status === 'rejected' ? ' active' : ''}`}
              onClick={() => onStatusChange(candidate.id, 'rejected')}
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              type='button'
              className={`crk-status-btn evaluate${candidate.status === 'evaluated' ? ' active' : ''}`}
              onClick={() => onStatusChange(candidate.id, 'evaluated')}
            >
              <Zap size={14} /> Evaluated
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function CandidateRankingSection() {
  const [rankings,     setRankings]     = useState([]);
  const [stats,        setStats]        = useState({});
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading,      setLoading]      = useState(true);

  // Filters & Sort
  const [sortBy,       setSortBy]       = useState('highest_score');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');

  // Selected candidate modal
  const [selectedCand, setSelectedCand] = useState(null);

  // Load Rankings
  const loadRankings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchCandidateRankings({
        sortBy,
        search,
        status: statusFilter,
        page,
        limit: 25
      });
      setRankings(data.rankings);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sortBy, search, statusFilter]);

  useEffect(() => { loadRankings(1); }, [loadRankings]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Status Change handler
  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setRankings((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
      );
      if (selectedCand?.id === candidateId) {
        setSelectedCand((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Status update failed');
    }
  };

  const topThree = rankings.slice(0, 3);

  return (
    <div className='crk-section'>
      {/* Modal */}
      {selectedCand && (
        <CandidateDetailModal
          candidate={selectedCand}
          onClose={() => setSelectedCand(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 4</p>
          <h2 className='hr-section-title'>Candidate Ranking & Leaderboard</h2>
          <p className='hr-section-subtitle'>
            Automatically rank candidates based on AI evaluations. Quickly compare scores,
            JD match percentages, and experience to shortlist top talent.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            type='button'
            id='crk-refresh-btn'
            className='ci-refresh-btn'
            onClick={() => loadRankings(pagination.page)}
          >
            <RefreshCw size={15} /> Refresh Rankings
          </button>
        </div>
      </div>

      {/* ── Summary Stats Bar ───────────────────────────────── */}
      <div className='ci-stats-bar'>
        <div className='ci-stats-item'>
          <strong>{stats.total ?? 0}</strong>
          <span>Total Candidates</span>
        </div>
        <div className='ci-stats-item amber'>
          <strong>{stats.topScore ?? 0}</strong>
          <span>Top Score</span>
        </div>
        <div className='ci-stats-item purple'>
          <strong>{stats.avgScore ?? 0}</strong>
          <span>Avg Talent Score</span>
        </div>
        <div className='ci-stats-item green'>
          <strong>{stats.shortlisted ?? 0}</strong>
          <span>Shortlisted</span>
        </div>
        <div className='ci-stats-item red'>
          <strong>{stats.rejected ?? 0}</strong>
          <span>Rejected</span>
        </div>
      </div>

      {/* ── Top 3 Podium (shown when sorted by highest score) ─ */}
      {sortBy === 'highest_score' && !search && !statusFilter && rankings.length >= 2 && (
        <Podium topThree={topThree} onSelect={setSelectedCand} />
      )}

      {/* ── Filter & Sort Controls ─────────────────────────── */}
      <div className='hr-card crk-controls-card'>
        <div className='crk-controls-toolbar'>
          {/* Search */}
          <div className='ci-search-wrap crk-search-wrap'>
            <Search size={15} className='ci-search-icon' />
            <input
              id='crk-search-input'
              className='ci-search-input'
              placeholder='Search by candidate name, email, college, skills…'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Sort By Dropdown */}
          <div className='crk-control-group'>
            <label className='crk-control-label' htmlFor='crk-sort-select'>
              <ArrowUpDown size={14} /> Sort By:
            </label>
            <select
              id='crk-sort-select'
              className='crk-select'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className='crk-control-group'>
            <label className='crk-control-label' htmlFor='crk-status-select'>
              <Filter size={14} /> Status:
            </label>
            <select
              id='crk-status-select'
              className='crk-select'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Rankings Table ─────────────────────────────── */}
      <div className='hr-card ci-table-card crk-table-card'>
        {loading ? (
          <div className='ci-table-loading'>
            <div className='hr-spinner' />
            <span>Calculating rankings…</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className='ci-empty-table'>
            <Trophy size={36} className='ci-empty-icon' />
            <p>No candidates found matching your criteria</p>
            <small>Try adjusting your search or filters</small>
          </div>
        ) : (
          <div className='ci-table-wrapper'>
            <table className='ci-table crk-table'>
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>Rank</th>
                  <th>Candidate</th>
                  <th style={{ textAlign: 'center' }}>Overall Score</th>
                  <th style={{ textAlign: 'center' }}>JD Match</th>
                  <th style={{ textAlign: 'center' }}>Experience</th>
                  <th>Category Breakdown</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((c) => {
                  const rankStyle = getRankBadgeStyle(c.rank);
                  const scoreColor = getScoreColor(c.overallScore);

                  return (
                    <tr
                      key={c.id}
                      className='ci-table-row crk-table-row'
                      onClick={() => setSelectedCand(c)}
                    >
                      {/* Rank Badge */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          className='crk-rank-badge'
                          style={{ background: rankStyle.bg, color: rankStyle.color }}
                        >
                          {rankStyle.icon ? `${rankStyle.icon} ` : ''}#{c.rank}
                        </div>
                      </td>

                      {/* Candidate Details */}
                      <td className='ci-td-name'>
                        <div className='ci-candidate-avatar'>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{c.name}</strong>
                          <span className='ci-candidate-email'>{c.email}</span>
                          {c.college && <small>{c.college}</small>}
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td style={{ textAlign: 'center' }}>
                        <div className='crk-score-badge' style={{ color: scoreColor, borderColor: scoreColor }}>
                          {c.overallScore}
                        </div>
                      </td>

                      {/* JD Match Score */}
                      <td style={{ textAlign: 'center' }}>
                        <div className='crk-jd-pill'>
                          <strong>{c.jdMatchScore}%</strong>
                          <span>Match</span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td style={{ textAlign: 'center' }}>
                        <span className='crk-exp-badge'>
                          {c.experienceYears != null ? `${c.experienceYears} yr${c.experienceYears !== 1 ? 's' : ''}` : '—'}
                        </span>
                      </td>

                      {/* Category Breakdown Mini-Bars */}
                      <td>
                        <div className='crk-cat-minis'>
                          <span title={`Resume: ${c.categoryScores?.resume ?? 0}`}>
                            📄 {c.categoryScores?.resume ?? 0}
                          </span>
                          <span title={`GitHub: ${c.categoryScores?.github ?? 0}`}>
                            🐙 {c.categoryScores?.github ?? 0}
                          </span>
                          <span title={`Coding: ${c.categoryScores?.coding ?? 0}`}>
                            💻 {c.categoryScores?.coding ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Workflow Status Dropdown / Badge */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`crk-status-select-inline ${c.status}`}
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          <option value='pending'>Pending</option>
                          <option value='evaluated'>Evaluated</option>
                          <option value='shortlisted'>Shortlisted</option>
                          <option value='rejected'>Rejected</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div className='crk-row-actions'>
                          <button
                            type='button'
                            className='crk-action-btn'
                            title='View Full AI Breakdown'
                            onClick={() => setSelectedCand(c)}
                          >
                            <Award size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='ci-pagination'>
                <button
                  type='button'
                  className='ci-page-btn'
                  disabled={pagination.page <= 1}
                  onClick={() => loadRankings(pagination.page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className='ci-page-info'>
                  Page {pagination.page} of {pagination.totalPages}
                  <small>({pagination.total} candidates)</small>
                </span>
                <button
                  type='button'
                  className='ci-page-btn'
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadRankings(pagination.page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
