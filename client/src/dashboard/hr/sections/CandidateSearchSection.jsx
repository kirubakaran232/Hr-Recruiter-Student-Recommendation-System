import { useCallback, useEffect, useState } from 'react';
import {
  Sparkles, Search, Filter, RotateCcw, Building2, MapPin,
  DollarSign, GraduationCap, Code2, Sliders, CheckCircle2,
  ChevronLeft, ChevronRight, ExternalLink, Github, Linkedin,
  Globe, Briefcase, Zap, Tag, Info, ArrowUpRight
} from 'lucide-react';
import { searchCandidatesSmart } from '../../../services/candidateSearch.service.js';

// ── Sample Natural Language Queries ───────────────────────────────────────────
const SAMPLE_QUERIES = [
  'React developer with Docker experience',
  'Java backend developer with Spring Boot and PostgreSQL',
  'Full stack engineer with Python and AWS',
  'Senior engineer with Node.js and MongoDB'
];

function getMatchBadgeStyle(score) {
  if (score >= 85) return { bg: 'rgba(34,197,94,0.14)', color: '#15803d', border: 'rgba(34,197,94,0.3)' };
  if (score >= 65) return { bg: 'rgba(255,220,93,0.18)', color: '#92400e', border: 'rgba(255,183,3,0.4)' };
  return { bg: 'rgba(36,36,36,0.06)', color: '#6f6f68', border: 'rgba(36,36,36,0.1)' };
}

export default function CandidateSearchSection() {
  // Query state
  const [nlQuery,        setNlQuery]        = useState('');
  const [activeQuery,    setActiveQuery]    = useState('');

  // 8 Filters
  const [skills,         setSkills]         = useState('');
  const [minExperience,  setMinExperience]  = useState('');
  const [maxExperience,  setMaxExperience]  = useState('');
  const [college,        setCollege]        = useState('');
  const [location,       setLocation]       = useState('');
  const [technology,     setTechnology]     = useState('');
  const [maxSalary,      setMaxSalary]      = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [minTalentScore, setMinTalentScore] = useState('');

  // Sorting & Pagination
  const [sortBy,     setSortBy]     = useState('semantic_match');
  const [page,       setPage]       = useState(1);
  const [showFilter, setShowFilter] = useState(true);

  // Data state
  const [results,     setResults]     = useState([]);
  const [parsedTargets,setParsedTargets]= useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading,     setLoading]     = useState(true);

  // Execute search
  const executeSearch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await searchCandidatesSmart({
        query: activeQuery,
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        minExperience,
        maxExperience,
        college,
        location,
        technology,
        maxSalary,
        graduationYear,
        minTalentScore,
        page: p,
        limit: 25,
        sortBy
      });
      setResults(data.candidates || []);
      setParsedTargets(data.parsedTargets || []);
      setPagination(data.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeQuery, skills, minExperience, maxExperience, college, location, technology, maxSalary, graduationYear, minTalentScore, sortBy]);

  useEffect(() => {
    executeSearch(page);
  }, [page, sortBy, activeQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveQuery(nlQuery);
    setPage(1);
  };

  const handleSampleClick = (sample) => {
    setNlQuery(sample);
    setActiveQuery(sample);
    setPage(1);
  };

  const handleResetFilters = () => {
    setNlQuery('');
    setActiveQuery('');
    setSkills('');
    setMinExperience('');
    setMaxExperience('');
    setCollege('');
    setLocation('');
    setTechnology('');
    setMaxSalary('');
    setGraduationYear('');
    setMinTalentScore('');
    setSortBy('semantic_match');
    setPage(1);
  };

  return (
    <div className='scs-section'>
      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 5</p>
          <h2 className='hr-section-title'>AI Smart Candidate Search</h2>
          <p className='hr-section-subtitle'>
            Search candidates using natural language intent. The AI parses target technologies,
            roles, and experience expectations to return semantically matched candidates.
          </p>
        </div>
        <div className='hr-section-header-right'>
          <button
            type='button'
            className='ci-template-btn'
            onClick={() => setShowFilter((p) => !p)}
          >
            <Sliders size={14} /> {showFilter ? 'Hide Filters' : 'Show 8 Filters'}
          </button>
        </div>
      </div>

      {/* ── Natural Language Prompt Card ────────────────────── */}
      <div className='hr-card scs-prompt-card'>
        <form onSubmit={handleSearchSubmit} className='scs-prompt-form'>
          <div className='scs-prompt-input-wrap'>
            <Sparkles size={20} className='scs-prompt-icon' />
            <input
              id='scs-query-input'
              className='scs-prompt-input'
              placeholder='Try: "React developer with Docker experience" or "Java backend developer with Spring Boot"...'
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
            />
            {nlQuery && (
              <button
                type='button'
                className='scs-clear-query'
                onClick={() => { setNlQuery(''); setActiveQuery(''); }}
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
          <button type='submit' id='scs-search-btn' className='hr-save-btn scs-search-btn'>
            <Search size={16} /> Search
          </button>
        </form>

        {/* Sample Prompt Pills */}
        <div className='scs-samples'>
          <span className='scs-samples-label'>Sample AI Queries:</span>
          <div className='scs-sample-pills'>
            {SAMPLE_QUERIES.map((sample) => (
              <button
                key={sample}
                type='button'
                className={`scs-sample-chip${activeQuery === sample ? ' active' : ''}`}
                onClick={() => handleSampleClick(sample)}
              >
                <Sparkles size={11} /> {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8 Multi-Criteria Filter Panel ───────────────────── */}
      {showFilter && (
        <div className='hr-card scs-filter-card'>
          <div className='scs-filter-header'>
            <div className='scs-filter-title'>
              <Filter size={15} />
              <h3>Multi-Criteria Filters (8 Parameters)</h3>
            </div>
            <button
              type='button'
              className='scs-reset-btn'
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} /> Reset All
            </button>
          </div>

          <div className='scs-filter-grid'>
            {/* Filter 1: Skills */}
            <div className='hr-field'>
              <label className='hr-field-label'>1. Skills (Comma-separated)</label>
              <div className='hr-field-wrap'>
                <Code2 size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. React, Node.js, Docker'
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 2: Technology */}
            <div className='hr-field'>
              <label className='hr-field-label'>2. Technology Stack</label>
              <div className='hr-field-wrap'>
                <Tag size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. Spring Boot, PostgreSQL'
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 3: Experience Range */}
            <div className='hr-field'>
              <label className='hr-field-label'>3. Experience (Min - Max Yrs)</label>
              <div className='scs-dual-input'>
                <input
                  className='hr-field-input scs-num'
                  placeholder='Min yrs (0)'
                  type='number'
                  min='0'
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                />
                <span>-</span>
                <input
                  className='hr-field-input scs-num'
                  placeholder='Max yrs (10)'
                  type='number'
                  min='0'
                  value={maxExperience}
                  onChange={(e) => setMaxExperience(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 4: College */}
            <div className='hr-field'>
              <label className='hr-field-label'>4. College / University</label>
              <div className='hr-field-wrap'>
                <GraduationCap size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. MIT, Stanford, IIT'
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 5: Location */}
            <div className='hr-field'>
              <label className='hr-field-label'>5. Location</label>
              <div className='hr-field-wrap'>
                <MapPin size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. San Francisco, Bangalore'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 6: Expected Salary */}
            <div className='hr-field'>
              <label className='hr-field-label'>6. Max Expected Salary ($)</label>
              <div className='hr-field-wrap'>
                <DollarSign size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. 120000'
                  type='number'
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 7: Graduation Year */}
            <div className='hr-field'>
              <label className='hr-field-label'>7. Graduation Year</label>
              <div className='hr-field-wrap'>
                <GraduationCap size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. 2024'
                  type='number'
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
            </div>

            {/* Filter 8: Talent Score */}
            <div className='hr-field'>
              <label className='hr-field-label'>8. Min Talent Score (0–100)</label>
              <div className='hr-field-wrap'>
                <Zap size={15} className='hr-field-icon' />
                <input
                  className='hr-field-input'
                  placeholder='e.g. 70'
                  type='number'
                  min='0'
                  max='100'
                  value={minTalentScore}
                  onChange={(e) => setMinTalentScore(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className='scs-filter-footer'>
            <button type='button' className='hr-save-btn' onClick={() => executeSearch(1)}>
              Apply Filters & Search
            </button>
          </div>
        </div>
      )}

      {/* ── Active Query Highlights ─────────────────────────── */}
      {parsedTargets.length > 0 && (
        <div className='scs-targets-bar'>
          <span>AI Parsed Query Technologies:</span>
          {parsedTargets.map((t) => (
            <span key={t} className='scs-target-pill'>{t}</span>
          ))}
        </div>
      )}

      {/* ── Search Results List ─────────────────────────────── */}
      <div className='hr-card scs-results-card'>
        <div className='scs-results-header'>
          <h3>
            {activeQuery ? `Results for "${activeQuery}"` : 'All Candidates'}
            <span className='scs-count-badge'>{pagination.total ?? 0} found</span>
          </h3>

          <div className='scs-sort-wrap'>
            <label>Sort by:</label>
            <select
              className='crk-select'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value='semantic_match'>AI Semantic Match %</option>
              <option value='talent_score'>Talent Score</option>
              <option value='experience'>Experience (Highest)</option>
              <option value='expected_salary'>Salary (Lowest)</option>
              <option value='recently_added'>Recently Added</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='ci-table-loading'>
            <div className='hr-spinner' />
            <span>AI Semantic matching candidates…</span>
          </div>
        ) : results.length === 0 ? (
          <div className='ci-empty-table'>
            <Search size={36} className='ci-empty-icon' />
            <p>No candidates match your semantic search or filters</p>
            <small>Try broadening your query or clearing some filters</small>
          </div>
        ) : (
          <div className='scs-results-list'>
            {results.map((c) => {
              const badgeStyle = getMatchBadgeStyle(c.semanticMatch);

              return (
                <div key={c.id} className='scs-candidate-card'>
                  <div className='scs-cand-top'>
                    <div className='scs-cand-avatar'>
                      {c.name.charAt(0).toUpperCase()}
                    </div>

                    <div className='scs-cand-main'>
                      <div className='scs-cand-name-row'>
                        <h4 className='scs-cand-name'>{c.name}</h4>
                        <a href={`mailto:${c.email}`} className='scs-cand-email'>{c.email}</a>
                      </div>

                      <div className='scs-cand-meta-row'>
                        {c.college && (
                          <span className='scs-meta-item'>
                            <GraduationCap size={13} /> {c.college} {c.graduationYear ? `('${c.graduationYear})` : ''}
                          </span>
                        )}
                        {c.experienceYears != null && (
                          <span className='scs-meta-item'>
                            <Briefcase size={13} /> {c.experienceYears} yr{c.experienceYears !== 1 ? 's' : ''} exp
                          </span>
                        )}
                        {c.location && (
                          <span className='scs-meta-item'>
                            <MapPin size={13} /> {c.location}
                          </span>
                        )}
                        {c.expectedSalary && (
                          <span className='scs-meta-item green'>
                            <DollarSign size={13} /> ${c.expectedSalary.toLocaleString()}/yr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='scs-cand-scores'>
                      {/* AI Semantic Match Badge */}
                      <div
                        className='scs-match-badge'
                        style={{ background: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}
                      >
                        <Sparkles size={13} />
                        <strong>{c.semanticMatch}% Match</strong>
                      </div>

                      {/* Talent Score Pill */}
                      <div className='scs-talent-pill'>
                        <span>Talent Score</span>
                        <strong>{c.aiScore}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Skills Chips */}
                  {c.skills?.length > 0 && (
                    <div className='scs-skills-row'>
                      {c.skills.map((s) => {
                        const isQueryMatch = parsedTargets.some((t) => s.toLowerCase().includes(t));
                        return (
                          <span key={s} className={`scs-skill-chip${isQueryMatch ? ' matched' : ''}`}>
                            {isQueryMatch && <CheckCircle2 size={11} />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* AI Match Explanation Box */}
                  <div className='scs-explanation-box'>
                    <Info size={14} className='scs-exp-icon' />
                    <p><strong>AI Match Reasoning:</strong> {c.matchExplanation}</p>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='ci-pagination'>
                <button
                  type='button'
                  className='ci-page-btn'
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
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
                  onClick={() => setPage(pagination.page + 1)}
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
