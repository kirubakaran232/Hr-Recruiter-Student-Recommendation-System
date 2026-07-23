import { useCallback, useEffect, useState } from 'react';
import {
  Upload, Sparkles, Trophy, CheckCircle2, Download,
  Users, Layers, ArrowRight, FileSpreadsheet, Zap,
  FileText, RefreshCw, AlertCircle, Search, Filter,
  ArrowUpDown, Star, Award, X, ChevronLeft, ChevronRight,
  XCircle, Check, HelpCircle
} from 'lucide-react';
import {
  uploadCandidateFile,
  fetchCandidates,
  downloadTemplate,
  clearAllCandidates,
  deleteCandidate
} from '../../../services/candidateImport.service.js';
import {
  evaluateCandidate,
  evaluateAllCandidates,
  fetchEvaluationSummary,
  getCandidateEvaluation
} from '../../../services/candidateEvaluation.service.js';
import {
  fetchCandidateRankings,
  updateCandidateStatus
} from '../../../services/candidateRanking.service.js';
import CandidateShortlistSection from './CandidateShortlistSection.jsx';
import HRExportSection from './HRExportSection.jsx';

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

export default function CandidateMasterSection() {
  // Main Module Active Tab
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'shortlist' | 'export'

  // Upload state (Module 2)
  const [dragOver,       setDragOver]       = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult,   setImportResult]   = useState(null);
  const [uploadError,    setUploadError]    = useState('');
  const [selectedFile,   setSelectedFile]   = useState(null);

  // Ranking & Candidate Pool State (Module 4)
  const [rankings,     setRankings]     = useState([]);
  const [stats,        setStats]        = useState({});
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading,      setLoading]      = useState(true);

  // Search & Filter
  const [sortBy,       setSortBy]       = useState('highest_score');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');

  // Selected candidate detail modal
  const [selectedCand, setSelectedCand] = useState(null);
  const [candEvalDetail, setCandEvalDetail] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load candidate rankings
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
      setRankings(data.rankings || []);
      setStats(data.stats || {});
      setPagination(data.pagination || {});
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

  // ── Combined File Upload Handler (Module 2 + 3 + 4) ───────────────────────
  const handleFileUpload = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setUploadError('Invalid file type. Only .xlsx, .xls, and .csv files are supported.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadError('');
    setImportResult(null);
    setSelectedFile(file);

    try {
      setUploadProgress(40);
      const res = await uploadCandidateFile(file, (pct) => {
        setUploadProgress(40 + Math.round(pct * 0.5));
      });
      setUploadProgress(95);

      setImportResult(res);
      showToast(`Imported ${res.summary.imported} candidates & ran AI Evaluation automatically!`);

      // Refresh rankings & leaderboard immediately
      await loadRankings(1);
    } catch (err) {
      const msg = err?.response?.data?.message || 'File upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  // Dropzone drag handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

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
      showToast(`Candidate status updated to ${newStatus}`);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Status update failed', 'error');
    }
  };

  // Open Candidate Detail Modal with full evaluation
  const handleSelectCandidate = async (candidate) => {
    setSelectedCand(candidate);
    setCandEvalDetail(null);
    try {
      const data = await getCandidateEvaluation(candidate.id);
      setCandEvalDetail(data.evaluation);
    } catch (e) {
      console.error(e);
    }
  };

  const topThree = rankings.slice(0, 3);

  return (
    <div className='cmm-master-container'>
      {/* Toast */}
      {toast && (
        <div className={`hr-toast ${toast.type === 'error' ? 'hr-toast-error' : 'hr-toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Combined Module Header ──────────────────────────── */}
      <div className='cmm-header-card'>
        <div className='cmm-header-left'>
          <div className='cmm-badge'>
            <Sparkles size={14} />
            <span>Modules 2 + 3 + 4 Unified Pipeline</span>
          </div>
          <h2 className='cmm-title'>Candidate Import, AI Evaluation & Leaderboard</h2>
          <p className='cmm-subtitle'>
            Upload candidates via Excel/CSV → Deduplication & AI Evaluation auto-executed across 6 dimensions → Live Candidate Ranking & Leaderboard updated instantly.
          </p>
        </div>
      </div>

      {/* ── Sub-Module Navigation Tabs ──────────────────────── */}
      <div className='cmm-tabs-bar'>
        <button
          type='button'
          className={`cmm-tab-item${activeTab === 'pipeline' ? ' active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <div className='cmm-tab-icon-wrap'><Upload size={16} /></div>
          <div className='cmm-tab-text'>
            <span className='cmm-tab-label'>Import, AI Eval & Ranking</span>
            <span className='cmm-tab-module'>Modules 2, 3, 4</span>
          </div>
        </button>

        <button
          type='button'
          className={`cmm-tab-item${activeTab === 'shortlist' ? ' active' : ''}`}
          onClick={() => setActiveTab('shortlist')}
        >
          <div className='cmm-tab-icon-wrap'><CheckCircle2 size={16} /></div>
          <div className='cmm-tab-text'>
            <span className='cmm-tab-label'>Shortlisting Rules</span>
            <span className='cmm-tab-module'>Module 6</span>
          </div>
        </button>

        <button
          type='button'
          className={`cmm-tab-item${activeTab === 'export' ? ' active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <div className='cmm-tab-icon-wrap'><Download size={16} /></div>
          <div className='cmm-tab-text'>
            <span className='cmm-tab-label'>Export & Sharing</span>
            <span className='cmm-tab-module'>Module 9</span>
          </div>
        </button>
      </div>

      {/* ── MAIN TAB: PIPELINE (Combined Modules 2, 3, 4) ──── */}
      {activeTab === 'pipeline' && (
        <div className='cmm-pipeline-body'>

          {/* 1. Upload & Duplicate Removal Box (Module 2) */}
          <div className='hr-card ci-upload-card'>
            <div
              className={`ci-drop-zone${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && document.getElementById('cmm-file-input').click()}
            >
              <input
                id='cmm-file-input'
                type='file'
                accept='.xlsx,.xls,.csv'
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />

              {uploading ? (
                <div className='ci-upload-progress'>
                  <div className='ci-upload-spinner' />
                  <p className='ci-upload-status-text'>
                    Uploading, Deduplicating & Running AI Evaluation…
                  </p>
                  <div className='ci-progress-bar-track'>
                    <div className='ci-progress-bar-fill' style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className='ci-progress-pct'>{uploadProgress}%</span>
                </div>
              ) : (
                <div className='ci-drop-content'>
                  <div className='ci-drop-icon-wrap'>
                    <Upload size={28} className='ci-drop-icon' />
                  </div>
                  <p className='ci-drop-title'>
                    <strong>Click to upload</strong> or drag and drop candidate file
                  </p>
                  <p className='ci-drop-subtitle'>Supports Excel (.xlsx, .xls) and CSV (.csv) up to 10MB</p>
                  {selectedFile && <p className='ci-drop-filename'>📁 {selectedFile.name}</p>}
                </div>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className='ci-upload-error'>
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload Actions & Column Guide */}
            <div className='ci-upload-actions'>
              <button type='button' className='ci-template-btn' onClick={downloadTemplate}>
                <FileSpreadsheet size={15} /> Download Excel Template (.xlsx)
              </button>
              <span className='ci-format-hint'>Auto-Deduplication & AI Scoring Enabled</span>
            </div>
          </div>

          {/* 2. Import & Auto-AI Evaluation Result Card */}
          {importResult && (
            <div className='ci-result-card'>
              <div className='ci-result-header'>
                <CheckCircle2 size={20} className='ci-result-ok-icon' />
                <h3>Import & AI Evaluation Complete!</h3>
                <button type='button' className='ci-result-close' onClick={() => setImportResult(null)}>
                  <X size={15} />
                </button>
              </div>

              <div className='ci-result-stats'>
                <div className='ci-stat-pill green'>
                  <strong>{importResult.summary.imported}</strong>
                  <span>Auto-Evaluated</span>
                </div>
                <div className='ci-stat-pill amber'>
                  <strong>{importResult.summary.duplicates}</strong>
                  <span>Duplicates Removed</span>
                </div>
                <div className='ci-stat-pill red'>
                  <strong>{importResult.summary.errors}</strong>
                  <span>Errors</span>
                </div>
                <div className='ci-stat-pill gray'>
                  <strong>{importResult.summary.totalRows}</strong>
                  <span>Total Rows</span>
                </div>
              </div>

              {/* Duplicates Detail */}
              {importResult.duplicates?.length > 0 && (
                <details className='ci-result-details'>
                  <summary>View Duplicates Removed ({importResult.duplicates.length})</summary>
                  <ul className='ci-result-list'>
                    {importResult.duplicates.map((d, i) => (
                      <li key={i}>
                        <span className='ci-row-badge amber'>Dup</span>
                        {d.email} — <em>{d.reason}</em>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* 3. Overall Pool Summary Stats Bar */}
          <div className='ci-stats-bar'>
            <div className='ci-stats-item'>
              <strong>{stats.total ?? 0}</strong>
              <span>Total Candidates</span>
            </div>
            <div className='ci-stats-item amber'>
              <strong>{stats.topScore ?? 0}</strong>
              <span>Top Talent Score</span>
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

          {/* 4. Top 3 Podium Cards (Module 4) */}
          {sortBy === 'highest_score' && !search && !statusFilter && rankings.length >= 2 && (
            <div className='crk-podium-container'>
              {/* 2nd Place */}
              {topThree[1] && (
                <div className='crk-podium-card silver' onClick={() => handleSelectCandidate(topThree[1])}>
                  <div className='crk-podium-rank'>#2</div>
                  <div className='crk-podium-avatar'>{topThree[1].name.charAt(0).toUpperCase()}</div>
                  <h4 className='crk-podium-name'>{topThree[1].name}</h4>
                  <span className='crk-podium-college'>{topThree[1].college || topThree[1].email}</span>
                  <div className='crk-podium-score-pill' style={{ color: getScoreColor(topThree[1].overallScore) }}>
                    {topThree[1].overallScore} <small>Score</small>
                  </div>
                  <div className='crk-podium-jd'>JD Match: {topThree[1].jdMatchScore}%</div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className='crk-podium-card gold' onClick={() => handleSelectCandidate(topThree[0])}>
                  <div className='crk-podium-crown'>👑 TOP PERFORMER</div>
                  <div className='crk-podium-rank gold'>#1</div>
                  <div className='crk-podium-avatar gold'>{topThree[0].name.charAt(0).toUpperCase()}</div>
                  <h4 className='crk-podium-name'>{topThree[0].name}</h4>
                  <span className='crk-podium-college'>{topThree[0].college || topThree[0].email}</span>
                  <div className='crk-podium-score-pill gold'>
                    {topThree[0].overallScore} <small>Score</small>
                  </div>
                  <div className='crk-podium-jd gold'>JD Match: {topThree[0].jdMatchScore}%</div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className='crk-podium-card bronze' onClick={() => handleSelectCandidate(topThree[2])}>
                  <div className='crk-podium-rank'>#3</div>
                  <div className='crk-podium-avatar'>{topThree[2].name.charAt(0).toUpperCase()}</div>
                  <h4 className='crk-podium-name'>{topThree[2].name}</h4>
                  <span className='crk-podium-college'>{topThree[2].college || topThree[2].email}</span>
                  <div className='crk-podium-score-pill' style={{ color: getScoreColor(topThree[2].overallScore) }}>
                    {topThree[2].overallScore} <small>Score</small>
                  </div>
                  <div className='crk-podium-jd'>JD Match: {topThree[2].jdMatchScore}%</div>
                </div>
              )}
            </div>
          )}

          {/* 5. Search, Filter & Sort Controls Bar */}
          <div className='hr-card crk-controls-card'>
            <div className='crk-controls-toolbar'>
              <div className='ci-search-wrap crk-search-wrap'>
                <Search size={15} className='ci-search-icon' />
                <input
                  id='cmm-search-input'
                  className='ci-search-input'
                  placeholder='Search candidates by name, email, college, skills…'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className='crk-control-group'>
                <label className='crk-control-label' htmlFor='cmm-sort-select'>
                  <ArrowUpDown size={14} /> Sort By:
                </label>
                <select
                  id='cmm-sort-select'
                  className='crk-select'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className='crk-control-group'>
                <label className='crk-control-label' htmlFor='cmm-status-select'>
                  <Filter size={14} /> Status:
                </label>
                <select
                  id='cmm-status-select'
                  className='crk-select'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value=''>All Statuses</option>
                  <option value='evaluated'>Evaluated</option>
                  <option value='shortlisted'>Shortlisted</option>
                  <option value='rejected'>Rejected</option>
                  <option value='pending'>Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Main Candidate Ranking & Leaderboard Table */}
          <div className='hr-card ci-table-card crk-table-card'>
            {loading ? (
              <div className='ci-table-loading'>
                <div className='hr-spinner' />
                <span>Ranking & evaluating candidates…</span>
              </div>
            ) : rankings.length === 0 ? (
              <div className='ci-empty-table'>
                <Trophy size={36} className='ci-empty-icon' />
                <p>No candidates found</p>
                <small>Upload an Excel or CSV file to automatically import, evaluate & rank candidates</small>
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
                          onClick={() => handleSelectCandidate(c)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <div className='crk-rank-badge' style={{ background: rankStyle.bg, color: rankStyle.color }}>
                              {rankStyle.icon ? `${rankStyle.icon} ` : ''}#{c.rank}
                            </div>
                          </td>

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
                              {c.overallScore}
                            </div>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <div className='crk-jd-pill'>
                              <strong>{c.jdMatchScore}%</strong>
                              <span>Match</span>
                            </div>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span className='crk-exp-badge'>
                              {c.experienceYears != null ? `${c.experienceYears} yr${c.experienceYears !== 1 ? 's' : ''}` : '—'}
                            </span>
                          </td>

                          <td>
                            <div className='crk-cat-minis'>
                              <span title={`Resume: ${c.categoryScores?.resume ?? 0}`}>📄 {c.categoryScores?.resume ?? 0}</span>
                              <span title={`GitHub: ${c.categoryScores?.github ?? 0}`}>🐙 {c.categoryScores?.github ?? 0}</span>
                              <span title={`Coding: ${c.categoryScores?.coding ?? 0}`}>💻 {c.categoryScores?.coding ?? 0}</span>
                            </div>
                          </td>

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

                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div className='crk-row-actions'>
                              <button
                                type='button'
                                className='crk-action-btn'
                                title='View Full AI Evaluation'
                                onClick={() => handleSelectCandidate(c)}
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
      )}

      {/* ── TAB: SHORTLISTING RULES (Module 6) ────────────────── */}
      {activeTab === 'shortlist' && <CandidateShortlistSection />}

      {/* ── TAB: EXPORT & SHARING (Module 9) ──────────────────── */}
      {activeTab === 'export' && <HRExportSection />}

      {/* ── Candidate Detail Modal (Module 3 & 4) ─────────────── */}
      {selectedCand && (
        <div className='crk-modal-overlay' onClick={() => setSelectedCand(null)}>
          <div className='crk-modal' onClick={(e) => e.stopPropagation()}>
            <button type='button' className='crk-modal-close' onClick={() => setSelectedCand(null)}>
              <X size={16} />
            </button>

            <div className='crk-modal-header'>
              <div className='crk-modal-avatar'>{selectedCand.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{selectedCand.name}</h2>
                <p>{selectedCand.email} • {selectedCand.college || 'N/A'}</p>
              </div>
              <div className='crk-modal-rank-badge'>Rank #{selectedCand.rank}</div>
            </div>

            <div className='crk-modal-scores-grid'>
              <div className='crk-modal-score-box'>
                <span className='crk-modal-score-val' style={{ color: getScoreColor(selectedCand.overallScore) }}>
                  {selectedCand.overallScore}
                </span>
                <span className='crk-modal-score-lbl'>Overall Talent Score</span>
              </div>
              <div className='crk-modal-score-box'>
                <span className='crk-modal-score-val' style={{ color: '#0ea5e9' }}>
                  {selectedCand.jdMatchScore}%
                </span>
                <span className='crk-modal-score-lbl'>JD Match Score</span>
              </div>
              <div className='crk-modal-score-box'>
                <span className='crk-modal-score-val'>
                  {selectedCand.experienceYears != null ? `${selectedCand.experienceYears} yrs` : 'N/A'}
                </span>
                <span className='crk-modal-score-lbl'>Experience</span>
              </div>
            </div>

            {/* Category Scores */}
            <div className='crk-modal-cat-grid'>
              <div className='crk-modal-cat-item'>
                <span>📄 Resume Score</span>
                <strong>{selectedCand.categoryScores?.resume ?? 0}</strong>
              </div>
              <div className='crk-modal-cat-item'>
                <span>🐙 GitHub Score</span>
                <strong>{selectedCand.categoryScores?.github ?? 0}</strong>
              </div>
              <div className='crk-modal-cat-item'>
                <span>💻 Coding Score</span>
                <strong>{selectedCand.categoryScores?.coding ?? 0}</strong>
              </div>
              <div className='crk-modal-cat-item'>
                <span>🌐 Portfolio Score</span>
                <strong>{selectedCand.categoryScores?.portfolio ?? 0}</strong>
              </div>
            </div>

            {/* Strengths & Narrative */}
            {candEvalDetail?.summaryNarrative && (
              <div className='crk-modal-narrative'>
                <p><strong>AI Evaluation Summary:</strong> {candEvalDetail.summaryNarrative}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className='crk-modal-actions'>
              <span className='crk-modal-status-lbl'>Update Pipeline Status:</span>
              <div className='crk-status-buttons'>
                <button
                  type='button'
                  className={`crk-status-btn shortlist${selectedCand.status === 'shortlisted' ? ' active' : ''}`}
                  onClick={() => handleStatusChange(selectedCand.id, 'shortlisted')}
                >
                  <CheckCircle2 size={14} /> Shortlist
                </button>
                <button
                  type='button'
                  className={`crk-status-btn reject${selectedCand.status === 'rejected' ? ' active' : ''}`}
                  onClick={() => handleStatusChange(selectedCand.id, 'rejected')}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  type='button'
                  className={`crk-status-btn evaluate${selectedCand.status === 'evaluated' ? ' active' : ''}`}
                  onClick={() => handleStatusChange(selectedCand.id, 'evaluated')}
                >
                  <Zap size={14} /> Evaluated
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
