import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle,
  AlertTriangle, X, Search, Filter, Trash2, Github, Linkedin,
  Globe, Code2, Users, RefreshCw, ChevronLeft, ChevronRight,
  ExternalLink, Info
} from 'lucide-react';
import {
  importCandidatesFile,
  fetchCandidates,
  fetchCandidateStats,
  downloadCandidateTemplate,
  deleteCandidate,
  clearCandidates
} from '../../../services/candidateImport.service.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',     bg: 'rgba(255,183,3,0.12)', color: '#b45309' },
  evaluated:  { label: 'Evaluated',  bg: 'rgba(99,102,241,0.12)', color: '#4338ca' },
  shortlisted:{ label: 'Shortlisted',bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
  rejected:   { label: 'Rejected',   bg: 'rgba(239,68,68,0.12)',  color: '#b91c1c' }
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ background: cfg.bg, color: cfg.color }}
      className='ci-status-chip'>
      {cfg.label}
    </span>
  );
}

function PlatformLinks({ candidate }) {
  const links = [
    { key: 'githubUrl',     icon: Github,        title: 'GitHub'     },
    { key: 'linkedinUrl',   icon: Linkedin,      title: 'LinkedIn'   },
    { key: 'portfolioUrl',  icon: Globe,         title: 'Portfolio'  },
    { key: 'leetcodeUrl',   icon: Code2,         title: 'LeetCode'   },
    { key: 'hackerrankUrl', icon: Code2,         title: 'HackerRank' },
    { key: 'codechefUrl',   icon: Code2,         title: 'CodeChef'   }
  ];
  const active = links.filter((l) => candidate[l.key]);
  if (!active.length) return <span className='ci-no-links'>—</span>;
  return (
    <div className='ci-platform-links'>
      {active.slice(0, 4).map(({ key, icon: Icon, title }) => (
        <a key={key} href={candidate[key]} target='_blank' rel='noopener noreferrer'
          className='ci-platform-link' title={title}>
          <Icon size={13} />
        </a>
      ))}
    </div>
  );
}

// ── Upload Drop Zone ──────────────────────────────────────────────────────────
function UploadZone({ onFile, uploading, progress }) {
  const fileRef  = useRef(null);
  const [drag, setDrag] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }
    setPickedFile(f);
    onFile(f);
  };

  return (
    <div
      className={`ci-drop-zone${drag ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => !uploading && fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type='file'
        accept='.xlsx,.xls,.csv'
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div className='ci-upload-progress'>
          <div className='ci-upload-spinner' />
          <p className='ci-upload-status-text'>Processing file…</p>
          <div className='ci-progress-bar-track'>
            <div className='ci-progress-bar-fill' style={{ width: `${progress}%` }} />
          </div>
          <span className='ci-progress-pct'>{progress}%</span>
        </div>
      ) : (
        <div className='ci-drop-content'>
          <div className='ci-drop-icon-wrap'>
            <FileSpreadsheet size={32} className='ci-drop-icon' />
          </div>
          {pickedFile ? (
            <p className='ci-drop-filename'>{pickedFile.name}</p>
          ) : (
            <>
              <p className='ci-drop-title'>Drop your file here or <strong>click to browse</strong></p>
              <p className='ci-drop-subtitle'>Excel (.xlsx, .xls) or CSV · Max 10 MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Import Result Card ────────────────────────────────────────────────────────
function ImportResultCard({ result, onDismiss }) {
  if (!result) return null;
  const { summary, errors, duplicates } = result;
  return (
    <div className='ci-result-card'>
      <div className='ci-result-header'>
        <CheckCircle size={16} className='ci-result-ok-icon' />
        <h3>Import Complete</h3>
        <button type='button' className='ci-result-close' onClick={onDismiss}><X size={14} /></button>
      </div>

      <div className='ci-result-stats'>
        <div className='ci-stat-pill green'>
          <strong>{summary.imported}</strong>
          <span>Imported</span>
        </div>
        <div className='ci-stat-pill amber'>
          <strong>{summary.duplicates}</strong>
          <span>Duplicate{summary.duplicates !== 1 ? 's' : ''}</span>
        </div>
        <div className='ci-stat-pill red'>
          <strong>{summary.errors}</strong>
          <span>Error{summary.errors !== 1 ? 's' : ''}</span>
        </div>
        <div className='ci-stat-pill gray'>
          <strong>{summary.totalRows}</strong>
          <span>Total Rows</span>
        </div>
      </div>

      {errors.length > 0 && (
        <details className='ci-result-details'>
          <summary>
            <AlertCircle size={13} /> {errors.length} row error{errors.length !== 1 ? 's' : ''}
          </summary>
          <ul className='ci-result-list'>
            {errors.map((e, i) => (
              <li key={i}>
                <span className='ci-row-badge'>Row {e.row}</span>
                {e.reasons.join(', ')}
              </li>
            ))}
          </ul>
        </details>
      )}

      {duplicates.length > 0 && (
        <details className='ci-result-details'>
          <summary>
            <AlertTriangle size={13} /> {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} skipped
          </summary>
          <ul className='ci-result-list'>
            {duplicates.map((d, i) => (
              <li key={i}>
                <span className='ci-row-badge amber'>
                  {d.row ? `Row ${d.row}` : d.email}
                </span>
                {d.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats, loading }) {
  if (loading) return <div className='ci-stats-bar skeleton' />;
  return (
    <div className='ci-stats-bar'>
      <div className='ci-stats-item'>
        <strong>{stats.total ?? 0}</strong>
        <span>Total</span>
      </div>
      <div className='ci-stats-item amber'>
        <strong>{stats.pending ?? 0}</strong>
        <span>Pending</span>
      </div>
      <div className='ci-stats-item purple'>
        <strong>{stats.evaluated ?? 0}</strong>
        <span>Evaluated</span>
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
  );
}

// ── Candidates Table ──────────────────────────────────────────────────────────
function CandidatesTable({ candidates, loading, onDelete, pagination, onPageChange }) {
  if (loading) {
    return (
      <div className='ci-table-loading'>
        <div className='hr-spinner' />
        <span>Loading candidates…</span>
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className='ci-empty-table'>
        <Users size={36} className='ci-empty-icon' />
        <p>No candidates found</p>
        <small>Import your first batch using the panel above</small>
      </div>
    );
  }

  return (
    <div className='ci-table-wrapper'>
      <table className='ci-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Candidate</th>
            <th>Skills</th>
            <th>Experience</th>
            <th>College</th>
            <th>Status</th>
            <th>Platforms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, idx) => {
            const rowNum = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={c.id} className='ci-table-row'>
                <td className='ci-td-num'>{rowNum}</td>
                <td className='ci-td-name'>
                  <div className='ci-candidate-avatar'>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{c.name}</strong>
                    <a href={`mailto:${c.email}`} className='ci-candidate-email'>{c.email}</a>
                  </div>
                </td>
                <td className='ci-td-skills'>
                  {c.skills?.slice(0, 3).map((s) => (
                    <span key={s} className='ci-skill-tag'>{s}</span>
                  ))}
                  {c.skills?.length > 3 && (
                    <span className='ci-skill-more'>+{c.skills.length - 3}</span>
                  )}
                  {!c.skills?.length && <span className='ci-no-links'>—</span>}
                </td>
                <td className='ci-td-exp'>
                  {c.experienceYears != null ? `${c.experienceYears} yr${c.experienceYears !== 1 ? 's' : ''}` : '—'}
                </td>
                <td className='ci-td-college'>
                  <span title={c.college}>{c.college || '—'}</span>
                  {c.graduationYear && <small>{c.graduationYear}</small>}
                </td>
                <td><StatusChip status={c.status} /></td>
                <td><PlatformLinks candidate={c} /></td>
                <td>
                  <button
                    type='button'
                    className='ci-delete-btn'
                    onClick={() => onDelete(c.id)}
                    title='Delete candidate'
                    id={`ci-delete-${c.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
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
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className='ci-page-info'>
            Page {pagination.page} of {pagination.totalPages}
            <small>({pagination.total} total)</small>
          </span>
          <button
            type='button'
            className='ci-page-btn'
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className='ci-modal-overlay'>
      <div className='ci-modal'>
        <AlertTriangle size={24} className='ci-modal-icon' />
        <p>{message}</p>
        <div className='ci-modal-actions'>
          <button type='button' className='ci-modal-cancel' onClick={onCancel}>Cancel</button>
          <button type='button' className='ci-modal-confirm' onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function CandidateImportSection() {
  // Upload state
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [uploadError,  setUploadError]  = useState('');

  // Candidates list state
  const [candidates,  setCandidates]  = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [searchInput, setSearchInput] = useState('');

  // Stats state
  const [stats,       setStats]      = useState({});
  const [statsLoading,setStatsLoading]= useState(true);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState(null); // { type, id?, message }

  // ── Load candidates + stats ────────────────────────────────────────────────
  const loadList = useCallback(async (page = 1) => {
    setListLoading(true);
    try {
      const data = await fetchCandidates({ page, limit: 20, search, status: statusFilter });
      setCandidates(data.candidates);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [search, statusFilter]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchCandidateStats();
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadList(1); }, [loadList]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Search debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileUpload = async (file) => {
    setUploading(true);
    setProgress(0);
    setUploadError('');
    setImportResult(null);
    try {
      const result = await importCandidatesFile(file, setProgress);
      setImportResult(result);
      // Refresh list + stats after import
      await Promise.all([loadList(1), loadStats()]);
    } catch (err) {
      setUploadError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ── Delete single ──────────────────────────────────────────────────────────
  const handleDeleteCandidate = (id) => {
    setConfirmModal({
      type:    'single',
      id,
      message: 'Delete this candidate? This cannot be undone.'
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal) return;
    try {
      if (confirmModal.type === 'single') {
        await deleteCandidate(confirmModal.id);
      } else {
        await clearCandidates(confirmModal.status);
      }
      setConfirmModal(null);
      await Promise.all([loadList(1), loadStats()]);
    } catch (e) {
      alert(e.message);
      setConfirmModal(null);
    }
  };

  // ── Template download ──────────────────────────────────────────────────────
  const handleTemplateDownload = async () => {
    try { await downloadCandidateTemplate(); }
    catch (e) { alert('Could not download template: ' + e.message); }
  };

  return (
    <div className='ci-section'>
      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 2</p>
          <h2 className='hr-section-title'>Candidate Import</h2>
          <p className='hr-section-subtitle'>
            Bulk-import candidates from Excel (.xlsx) or CSV files.
            The system validates, deduplicates, and stores candidates ready for AI evaluation.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            id='ci-refresh-btn'
            type='button'
            className='ci-refresh-btn'
            onClick={() => { loadList(1); loadStats(); }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────── */}
      <StatsBar stats={stats} loading={statsLoading} />

      {/* ── Upload + Result Grid ─────────────────────────────── */}
      <div className='ci-upload-grid'>

        {/* Upload Card */}
        <div className='hr-card ci-upload-card'>
          <div className='hr-card-header'>
            <Upload size={16} />
            <h3>Import Candidates</h3>
          </div>

          <UploadZone
            onFile={handleFileUpload}
            uploading={uploading}
            progress={progress}
          />

          {uploadError && (
            <div className='ci-upload-error'>
              <AlertCircle size={14} /> {uploadError}
            </div>
          )}

          <div className='ci-upload-actions'>
            <button
              id='ci-template-download-btn'
              type='button'
              className='ci-template-btn'
              onClick={handleTemplateDownload}
            >
              <Download size={14} /> Download Template
            </button>
            <div className='ci-format-hint'>
              <Info size={12} />
              <span>Supports .xlsx · .xls · .csv</span>
            </div>
          </div>

          {/* Column guide */}
          <div className='ci-column-guide'>
            <p className='ci-guide-title'>Expected columns</p>
            <div className='ci-guide-chips'>
              {['Candidate Name*', 'Email*', 'Resume URL', 'GitHub URL', 'LinkedIn URL',
                'Portfolio URL', 'LeetCode URL', 'HackerRank URL', 'CodeChef URL',
                'Experience (Years)', 'Skills', 'College', 'Graduation Year'
              ].map((col) => (
                <span key={col} className={`ci-guide-chip${col.endsWith('*') ? ' required' : ''}`}>
                  {col.replace('*', '')}
                  {col.endsWith('*') && <span className='ci-guide-required'>*</span>}
                </span>
              ))}
            </div>
            <p className='ci-guide-note'>* Required fields</p>
          </div>
        </div>

        {/* Result Card */}
        <div className='ci-result-panel'>
          {importResult
            ? <ImportResultCard result={importResult} onDismiss={() => setImportResult(null)} />
            : (
              <div className='ci-result-empty'>
                <FileSpreadsheet size={40} className='ci-result-empty-icon' />
                <p>Import results will appear here</p>
                <small>Upload a file to see success counts, duplicates, and errors</small>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Candidates Table ─────────────────────────────────── */}
      <div className='hr-card ci-table-card'>
        <div className='ci-table-toolbar'>
          <div className='ci-search-wrap'>
            <Search size={15} className='ci-search-icon' />
            <input
              id='ci-search-input'
              className='ci-search-input'
              placeholder='Search by name, email, college, skill…'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className='ci-toolbar-right'>
            <div className='ci-filter-wrap'>
              <Filter size={14} />
              <select
                id='ci-status-filter'
                className='ci-filter-select'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value=''>All Status</option>
                <option value='pending'>Pending</option>
                <option value='evaluated'>Evaluated</option>
                <option value='shortlisted'>Shortlisted</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>

            {pagination.total > 0 && (
              <button
                type='button'
                className='ci-clear-btn'
                id='ci-clear-all-btn'
                onClick={() => setConfirmModal({
                  type:    'bulk',
                  status:  statusFilter,
                  message: statusFilter
                    ? `Delete all "${statusFilter}" candidates? This cannot be undone.`
                    : 'Delete ALL candidates? This cannot be undone.'
                })}
              >
                <Trash2 size={14} /> Clear {statusFilter || 'All'}
              </button>
            )}
          </div>
        </div>

        <CandidatesTable
          candidates={candidates}
          loading={listLoading}
          onDelete={handleDeleteCandidate}
          pagination={pagination}
          onPageChange={(p) => loadList(p)}
        />
      </div>
    </div>
  );
}
