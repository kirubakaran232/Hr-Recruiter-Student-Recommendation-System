import XLSX from 'xlsx';
import { Candidate } from '../models/Candidate.js';

// ── GET /api/hr/export/shortlist ──────────────────────────────────────────────
export async function exportShortlist(req, res, next) {
  try {
    const { format = 'excel' } = req.query;
    const candidates = await Candidate.find({
      hrUserId: req.user._id,
      status:   'shortlisted'
    }).lean();

    const dataRows = candidates.map((c, idx) => ({
      'Rank':             idx + 1,
      'Candidate Name':   c.name,
      'Email':            c.email,
      'Overall Score':    c.aiScore ?? 0,
      'JD Match %':       c.jdMatchScore ?? 0,
      'Experience Yrs':   c.experienceYears ?? 0,
      'Skills':           (c.skills || []).join(', '),
      'College':          c.college || '',
      'Grad Year':        c.graduationYear || '',
      'GitHub Score':     c.aiEvaluation?.breakdown?.github?.score ?? 0,
      'Coding Score':     c.aiEvaluation?.breakdown?.coding?.score ?? 0,
      'Resume Score':     c.aiEvaluation?.breakdown?.resume?.score ?? 0,
      'Resume Link':      c.resumeUrl || '',
      'GitHub Link':      c.githubUrl || '',
      'LinkedIn Link':    c.linkedinUrl || ''
    }));

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(dataRows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="shortlisted_candidates.csv"');
      return res.send(csv);
    }

    // Default Excel (.xlsx)
    const ws = XLSX.utils.json_to_sheet(dataRows);
    ws['!cols'] = Object.keys(dataRows[0] || {}).map((k) => ({ wch: Math.max(k.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shortlisted Candidates');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="shortlisted_candidates.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/export/evaluation-reports ─────────────────────────────────────
export async function exportEvaluationReports(req, res, next) {
  try {
    const { format = 'excel' } = req.query;
    const candidates = await Candidate.find({ hrUserId: req.user._id }).lean();

    const dataRows = candidates.map((c) => ({
      'Candidate ID':     c._id.toString(),
      'Name':             c.name,
      'Email':            c.email,
      'Status':           c.status,
      'Overall Score':    c.aiScore ?? 0,
      'Resume Score':     c.aiEvaluation?.breakdown?.resume?.score ?? 0,
      'GitHub Score':     c.aiEvaluation?.breakdown?.github?.score ?? 0,
      'Coding Score':     c.aiEvaluation?.breakdown?.coding?.score ?? 0,
      'Skills Score':     c.aiEvaluation?.breakdown?.skills?.score ?? 0,
      'Projects Score':   c.aiEvaluation?.breakdown?.projects?.score ?? 0,
      'Portfolio Score':  c.aiEvaluation?.breakdown?.portfolio?.score ?? 0,
      'Strengths':        (c.aiEvaluation?.strengths || []).join('; '),
      'AI Summary':       c.aiEvaluation?.summaryNarrative || ''
    }));

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(dataRows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ai_evaluation_report.csv"');
      return res.send(csv);
    }

    const ws = XLSX.utils.json_to_sheet(dataRows);
    ws['!cols'] = Object.keys(dataRows[0] || {}).map((k) => ({ wch: Math.max(k.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evaluation Report');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ai_evaluation_report.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

// ── GET /api/hr/export/hiring-stats ───────────────────────────────────────────
export async function exportHiringStats(req, res, next) {
  try {
    const candidates = await Candidate.find({ hrUserId: req.user._id }).lean();
    const total = candidates.length;
    const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length;
    const evaluated   = candidates.filter((c) => c.status === 'evaluated').length;

    const statsData = [
      { Metric: 'Total Candidates Imported', Value: total },
      { Metric: 'Evaluated Candidates',     Value: evaluated },
      { Metric: 'Shortlisted Candidates',   Value: shortlisted },
      { Metric: 'Selection Rate',            Value: `${total ? Math.round((shortlisted / total) * 100) : 0}%` },
      { Metric: 'Average Talent Score',     Value: total ? Math.round(candidates.reduce((a, b) => a + (b.aiScore || 0), 0) / total) : 0 }
    ];

    const ws = XLSX.utils.json_to_sheet(statsData);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hiring Statistics');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="hiring_statistics.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}
