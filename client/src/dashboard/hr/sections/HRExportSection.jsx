import { useState } from 'react';
import {
  Download, FileSpreadsheet, FileText, Share2, CheckCircle2,
  FileCheck, BarChart3, Users, Sparkles
} from 'lucide-react';
import { downloadExportFile } from '../../../services/hrExport.service.js';

const EXPORT_TARGETS = [
  {
    id:          'shortlist',
    title:       'Shortlisted Candidates',
    description: 'Export clean table of all candidate names, emails, scores, JD match %, skills, and platform links.',
    icon:        CheckCircle2,
    color:       '#22c55e'
  },
  {
    id:          'evaluation_reports',
    title:       'AI Evaluation Reports',
    description: 'Export category score breakdowns (Resume, GitHub, Coding, Portfolio, Projects), strengths, and AI narratives.',
    icon:        Sparkles,
    color:       '#6366f1'
  },
  {
    id:          'hiring_stats',
    title:       'Hiring Statistics & Metrics',
    description: 'Export aggregate recruitment velocity, total imported, selection rates, and average talent scores.',
    icon:        BarChart3,
    color:       '#ffdc5d'
  }
];

export default function HRExportSection() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (targetId, format) => {
    const key = `${targetId}_${format}`;
    setDownloading(key);
    try {
      await downloadExportFile(targetId, format);
    } catch (e) {
      console.error(e);
      alert('Export failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className='hre-section'>
      {/* ── Section Header ──────────────────────────────────── */}
      <div className='hr-section-header'>
        <div className='hr-section-header-left'>
          <p className='hr-section-eyebrow'>Module 9</p>
          <h2 className='hr-section-title'>Export & Data Sharing Hub</h2>
          <p className='hr-section-subtitle'>
            Download candidate intelligence data, shortlist tables, AI evaluation reports, and hiring statistics in Excel or CSV format.
          </p>
        </div>
      </div>

      {/* ── Export Target Cards Grid ─────────────────────────── */}
      <div className='hre-grid'>
        {EXPORT_TARGETS.map((target) => {
          const Icon = target.icon;

          return (
            <div key={target.id} className='hr-card hre-card'>
              <div className='hre-card-top'>
                <div className='hre-icon-wrap' style={{ background: `${target.color}1a`, color: target.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3>{target.title}</h3>
                  <p>{target.description}</p>
                </div>
              </div>

              <div className='hre-actions-row'>
                {/* Excel Export Button */}
                <button
                  type='button'
                  className='hr-save-btn hre-btn excel'
                  disabled={downloading === `${target.id}_excel`}
                  onClick={() => handleDownload(target.id, 'excel')}
                >
                  {downloading === `${target.id}_excel` ? (
                    <><span className='hr-btn-spinner' /> Exporting…</>
                  ) : (
                    <><FileSpreadsheet size={15} /> Export Excel (.xlsx)</>
                  )}
                </button>

                {/* CSV Export Button */}
                <button
                  type='button'
                  className='ci-template-btn hre-btn csv'
                  disabled={downloading === `${target.id}_csv`}
                  onClick={() => handleDownload(target.id, 'csv')}
                >
                  {downloading === `${target.id}_csv` ? (
                    <><span className='hr-btn-spinner' /> Exporting…</>
                  ) : (
                    <><FileText size={15} /> Export CSV (.csv)</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sharing & Integration Banner ───────────────────── */}
      <div className='hr-card hre-share-banner'>
        <div className='hre-share-left'>
          <Share2 size={22} className='hre-share-icon' />
          <div>
            <h4>Team Sharing & ATS Integration</h4>
            <p>All downloaded files are pre-formatted for seamless upload into Workday, Greenhouse, Lever, or BambooHR.</p>
          </div>
        </div>
        <div className='hre-share-right'>
          <span className='csl-rule-badge'>Supported Formats: Excel (.xlsx), CSV (.csv)</span>
        </div>
      </div>
    </div>
  );
}
