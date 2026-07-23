import { useEffect, useState } from 'react';
import {
  Settings, Sliders, Users, Award, Shield, UserPlus, Trash2,
  CheckCircle2, AlertCircle, Save, Building2, RefreshCw
} from 'lucide-react';
import {
  fetchHRSettings,
  updateAIWeights,
  addTeamMember,
  removeTeamMember
} from '../../../services/hrSettings.service.js';

export default function HRSettingsSection() {
  // Custom AI Scoring Weights State
  const [resumeWeight,    setResumeWeight]    = useState(20);
  const [githubWeight,    setGithubWeight]    = useState(20);
  const [codingWeight,    setCodingWeight]    = useState(15);
  const [portfolioWeight, setPortfolioWeight] = useState(12);
  const [projectWeight,   setProjectWeight]   = useState(18);
  const [certWeight,      setCertWeight]      = useState(15);

  // Team Members State
  const [teamMembers,     setTeamMembers]     = useState([]);
  const [newMemberName,   setNewMemberName]   = useState('');
  const [newMemberEmail,  setNewMemberEmail]  = useState('');
  const [newMemberRole,   setNewMemberRole]   = useState('Recruiter');

  // Loading & Toast State
  const [loading,         setLoading]         = useState(true);
  const [savingWeights,   setSavingWeights]   = useState(false);
  const [addingMember,    setAddingMember]    = useState(false);
  const [toast,           setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchHRSettings();
      const w = data.settings?.aiWeights || {};
      setResumeWeight(w.resumeWeight       ?? 20);
      setGithubWeight(w.githubWeight       ?? 20);
      setCodingWeight(w.codingWeight       ?? 15);
      setPortfolioWeight(w.portfolioWeight ?? 12);
      setProjectWeight(w.projectWeight     ?? 18);
      setCertWeight(w.certWeight           ?? 15);
      setTeamMembers(data.settings?.teamMembers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  // Compute total weights sum
  const totalWeight =
    Number(resumeWeight) +
    Number(githubWeight) +
    Number(codingWeight) +
    Number(portfolioWeight) +
    Number(projectWeight) +
    Number(certWeight);

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    try {
      await updateAIWeights({
        resumeWeight:    Number(resumeWeight),
        githubWeight:    Number(githubWeight),
        codingWeight:    Number(codingWeight),
        portfolioWeight: Number(portfolioWeight),
        projectWeight:   Number(projectWeight),
        certWeight:      Number(certWeight)
      });
      showToast('AI scoring weights updated successfully!');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update weights', 'error');
    } finally {
      setSavingWeights(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      return showToast('Please enter both name and email', 'error');
    }

    setAddingMember(true);
    try {
      const res = await addTeamMember({
        name:  newMemberName.trim(),
        email: newMemberEmail.trim(),
        role:  newMemberRole
      });
      setTeamMembers(res.teamMembers || []);
      setNewMemberName('');
      setNewMemberEmail('');
      showToast(`Invited ${newMemberName} to HR team!`);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add team member', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      const res = await removeTeamMember(email);
      setTeamMembers(res.teamMembers || []);
      showToast('Team member removed');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to remove team member', 'error');
    }
  };

  if (loading) {
    return (
      <div className='hr-card' style={{ padding: 48, textAlign: 'center' }}>
        <div className='hr-spinner' />
        <p style={{ marginTop: 14, color: '#6f6f68', fontWeight: 600 }}>Loading Admin Settings…</p>
      </div>
    );
  }

  return (
    <div className='hrs-section'>
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
          <p className='hr-section-eyebrow'>Module 10</p>
          <h2 className='hr-section-title'>Admin & Platform Settings</h2>
          <p className='hr-section-subtitle'>
            Customize AI scoring algorithm weights, manage HR team members and recruiter role permissions.
          </p>
        </div>
      </div>

      {/* ── 1. AI Scoring Weights Configuration Card ───────── */}
      <div className='hr-card hrs-card'>
        <div className='hrs-card-header'>
          <div className='hrs-card-title'>
            <Sliders size={18} className='hrs-icon' />
            <h3>Custom AI Candidate Scoring Weights</h3>
          </div>
          <div className={`hrs-weight-total-tag${totalWeight === 100 ? ' valid' : ' invalid'}`}>
            Total Weight: {totalWeight}% {totalWeight === 100 ? '✓ (100%)' : '(Must sum to 100%)'}
          </div>
        </div>

        <p className='hrs-card-desc'>
          Adjust how much weight each candidate evaluation category contributes to the Overall Talent Score (0–100).
        </p>

        <div className='hrs-weights-grid'>
          {/* Weight 1: Resume */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>📄 Resume Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-resume'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={resumeWeight}
                onChange={(e) => setResumeWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>

          {/* Weight 2: GitHub */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>🐙 GitHub Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-github'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={githubWeight}
                onChange={(e) => setGithubWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>

          {/* Weight 3: Coding Profile */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>💻 Coding Profile Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-coding'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={codingWeight}
                onChange={(e) => setCodingWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>

          {/* Weight 4: Portfolio */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>🌐 Portfolio Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-portfolio'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={portfolioWeight}
                onChange={(e) => setPortfolioWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>

          {/* Weight 5: Projects */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>🚀 Project Experience Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-project'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={projectWeight}
                onChange={(e) => setProjectWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>

          {/* Weight 6: Certifications */}
          <div className='csl-rule-item'>
            <label className='csl-rule-label'>🏆 Certifications Weight</label>
            <div className='csl-rule-input-wrap'>
              <input
                id='hrs-w-cert'
                type='number'
                min='0'
                max='100'
                className='csl-rule-input'
                value={certWeight}
                onChange={(e) => setCertWeight(e.target.value)}
              />
              <span className='csl-rule-unit'>%</span>
            </div>
          </div>
        </div>

        <div className='csl-config-footer'>
          <button
            type='button'
            id='hrs-save-weights-btn'
            className='hr-save-btn'
            disabled={savingWeights}
            onClick={handleSaveWeights}
          >
            {savingWeights ? <><span className='hr-btn-spinner' /> Saving…</> : <><Save size={15} /> Save AI Weights</>}
          </button>
        </div>
      </div>

      {/* ── 2. Manage HR Team Members Card ─────────────────── */}
      <div className='hr-card hrs-card'>
        <div className='hrs-card-header'>
          <div className='hrs-card-title'>
            <Users size={18} className='hrs-icon' />
            <h3>HR Team Members & Roles ({teamMembers.length})</h3>
          </div>
        </div>

        {/* Invite New Team Member Form */}
        <form onSubmit={handleAddMember} className='hrs-invite-form'>
          <input
            id='hrs-member-name'
            className='hr-field-input'
            placeholder='Full Name'
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />
          <input
            id='hrs-member-email'
            className='hr-field-input'
            placeholder='Email Address'
            type='email'
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <select
            id='hrs-member-role'
            className='crk-select'
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          >
            <option value='Admin'>Admin (Full Access)</option>
            <option value='Recruiter'>Recruiter (Evaluate/Shortlist)</option>
            <option value='Viewer'>Viewer (Read Only)</option>
          </select>
          <button type='submit' id='hrs-add-member-btn' className='hr-save-btn' disabled={addingMember}>
            {addingMember ? <span className='hr-btn-spinner' /> : <><UserPlus size={15} /> Invite Member</>}
          </button>
        </form>

        {/* Team Members List */}
        {teamMembers.length === 0 ? (
          <div className='ci-empty-table' style={{ padding: 24 }}>
            <p>No team members added yet</p>
            <small>Invite your recruiting team to collaborate on candidate shortlists</small>
          </div>
        ) : (
          <table className='ci-table' style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Added Date</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.email} className='ci-table-row'>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>
                    <span className='crk-exp-badge'>{m.role}</span>
                  </td>
                  <td>{new Date(m.addedAt || Date.now()).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type='button'
                      className='csl-remove-btn'
                      title='Remove team member'
                      onClick={() => handleRemoveMember(m.email)}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
