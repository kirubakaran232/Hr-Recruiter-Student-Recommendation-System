import XLSX from 'xlsx';
import { Candidate } from '../models/Candidate.js';

// ── Column header aliases → canonical field names ──────────────────────────────
const HEADER_MAP = {
  // Name
  'candidate name':   'name',
  'name':             'name',
  'full name':        'name',
  'fullname':         'name',
  'candidate':        'name',

  // Email
  'email':            'email',
  'email address':    'email',
  'e-mail':           'email',
  'mail':             'email',

  // Links
  'resume':           'resumeUrl',
  'resume url':       'resumeUrl',
  'resume link':      'resumeUrl',
  'cv':               'resumeUrl',
  'cv url':           'resumeUrl',

  'github':           'githubUrl',
  'github url':       'githubUrl',
  'github link':      'githubUrl',
  'github profile':   'githubUrl',

  'linkedin':         'linkedinUrl',
  'linkedin url':     'linkedinUrl',
  'linkedin link':    'linkedinUrl',
  'linkedin profile': 'linkedinUrl',

  'portfolio':        'portfolioUrl',
  'portfolio url':    'portfolioUrl',
  'portfolio link':   'portfolioUrl',
  'website':          'portfolioUrl',

  'leetcode':         'leetcodeUrl',
  'leetcode url':     'leetcodeUrl',
  'leet code':        'leetcodeUrl',

  'hackerrank':       'hackerrankUrl',
  'hackerrank url':   'hackerrankUrl',
  'hacker rank':      'hackerrankUrl',

  'codechef':         'codechefUrl',
  'codechef url':     'codechefUrl',
  'code chef':        'codechefUrl',

  // Background
  'experience':                'experienceYears',
  'experience (years)':        'experienceYears',
  'years of experience':       'experienceYears',
  'exp':                       'experienceYears',
  'exp (years)':               'experienceYears',
  'experience years':          'experienceYears',

  'skills':                    'skills',
  'skills (comma-separated)':  'skills',
  'key skills':                'skills',
  'technologies':              'skills',
  'tech stack':                'skills',

  'college':                   'college',
  'university':                'college',
  'institution':               'college',
  'school':                    'college',
  'college/university':        'college',

  'graduation year':           'graduationYear',
  'grad year':                 'graduationYear',
  'pass out year':             'graduationYear',
  'passing year':              'graduationYear',
  'year of graduation':        'graduationYear',

  'location':                  'location',
  'city':                      'location',
  'address':                   'location',

  'expected salary':           'expectedSalary',
  'salary':                    'expectedSalary',
  'salary expectation':        'expectedSalary',
  'ctc':                       'expectedSalary',

  'cgpa':                      'cgpa',
  'gpa':                       'cgpa',
  'grade':                     'cgpa'
};

// ── Email regex ────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Parse file buffer → array of raw row objects ──────────────────────────────
export function parseFileBuffer(buffer, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  const readOpts = ext === 'csv'
    ? { type: 'buffer', raw: false }
    : { type: 'buffer' };

  const workbook  = XLSX.read(buffer, readOpts);
  const sheetName = workbook.SheetNames[0];
  const sheet     = workbook.Sheets[sheetName];

  // sheet_to_json: first row treated as header; empty cells → ''
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

// ── Normalise a raw row → canonical field names ───────────────────────────────
function normaliseRow(rawRow) {
  const out = {};
  for (const [key, value] of Object.entries(rawRow)) {
    const canonical = HEADER_MAP[key.trim().toLowerCase()];
    if (canonical) {
      out[canonical] = String(value ?? '').trim();
    }
  }
  return out;
}

// ── Validate a normalised row → array of error strings (empty = valid) ────────
function validateRow(row) {
  const errors = [];
  if (!row.name)  errors.push('Missing candidate name');
  if (!row.email) errors.push('Missing email');
  else if (!EMAIL_REGEX.test(row.email)) errors.push(`Invalid email: "${row.email}"`);
  return errors;
}

// ── Convert normalised row to Candidate document fields ───────────────────────
function toDocumentFields(row, hrUserId, importSource) {
  const expRaw = parseFloat(row.experienceYears);
  const gradRaw = parseInt(row.graduationYear, 10);
  const salRaw = parseFloat(row.expectedSalary);
  const cgpaRaw = parseFloat(row.cgpa);

  const skillsRaw = row.skills || '';
  const skills = skillsRaw
    ? skillsRaw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    hrUserId,
    name:            row.name,
    email:           row.email.toLowerCase(),
    resumeUrl:       row.resumeUrl     || '',
    githubUrl:       row.githubUrl     || '',
    linkedinUrl:     row.linkedinUrl   || '',
    portfolioUrl:    row.portfolioUrl  || '',
    leetcodeUrl:     row.leetcodeUrl   || '',
    hackerrankUrl:   row.hackerrankUrl || '',
    codechefUrl:     row.codechefUrl   || '',
    experienceYears: isNaN(expRaw)  ? null : expRaw,
    skills,
    college:         row.college        || '',
    graduationYear:  isNaN(gradRaw) ? null : gradRaw,
    cgpa:            isNaN(cgpaRaw) ? null : cgpaRaw,
    location:        row.location       || '',
    expectedSalary:  isNaN(salRaw)  ? null : salRaw,
    importSource,
    status:          'pending'
  };
}

// ── Main import pipeline ──────────────────────────────────────────────────────
/**
 * @param {Buffer}   buffer        Raw file buffer
 * @param {string}   originalName  Original filename (used to detect extension)
 * @param {ObjectId} hrUserId      The logged-in HR user's _id
 * @returns {{ summary, errors, duplicates, imported }}
 */
export async function importCandidatesFromFile(buffer, originalName, hrUserId) {
  // 1. Parse
  const rawRows = parseFileBuffer(buffer, originalName);
  if (!rawRows.length) {
    const err = new Error('The uploaded file is empty or has no data rows');
    err.statusCode = 400;
    throw err;
  }

  // 2. Normalise + validate each row
  const validDocs     = [];
  const errorRows     = [];
  const seenEmails    = new Set(); // detect in-file duplicates
  const inFileDups    = [];

  rawRows.forEach((rawRow, idx) => {
    const rowNum  = idx + 2; // +1 for 1-indexing, +1 for header row
    const row     = normaliseRow(rawRow);
    const errs    = validateRow(row);

    if (errs.length) {
      errorRows.push({ row: rowNum, reasons: errs });
      return;
    }

    // Check in-file duplicates
    const emailKey = row.email.toLowerCase();
    if (seenEmails.has(emailKey)) {
      inFileDups.push({ row: rowNum, email: row.email, reason: 'Duplicate within file' });
      return;
    }
    seenEmails.add(emailKey);

    validDocs.push(toDocumentFields(row, hrUserId, originalName));
  });

  // 3. Check DB duplicates for valid rows in one query
  const emailsToCheck = validDocs.map((d) => d.email);
  const existingDocs  = await Candidate.find(
    { hrUserId, email: { $in: emailsToCheck } },
    { email: 1 }
  );
  const existingEmails = new Set(existingDocs.map((d) => d.email));

  const toInsert   = [];
  const dbDups     = [];

  validDocs.forEach((doc) => {
    if (existingEmails.has(doc.email)) {
      dbDups.push({ email: doc.email, reason: 'Already imported previously' });
    } else {
      toInsert.push(doc);
    }
  });

  // 4. Bulk insert (ordered:false → continue on any residual error)
  let insertedDocs = [];
  if (toInsert.length > 0) {
    try {
      insertedDocs = await Candidate.insertMany(toInsert, { ordered: false });
    } catch (bulkErr) {
      // Some may succeed even if others fail (e.g. race-condition duplicates)
      if (bulkErr.insertedDocs) insertedDocs = bulkErr.insertedDocs;
      else if (bulkErr.result?.insertedIds) {
        // Partial success — mongoose returns partial results via writeErrors
        insertedDocs = toInsert.filter((_, i) =>
          !bulkErr.writeErrors?.find((we) => we.index === i)
        );
      }
    }
  }

  const allDuplicates = [...inFileDups, ...dbDups];

  // 5. Automatic AI Candidate Evaluation (Module 3 integration)
  if (insertedDocs.length > 0) {
    const { evaluateCandidate } = await import('./candidateEvaluation.service.js');
    const evalOps = insertedDocs.map((doc) => {
      const evalResult = evaluateCandidate(doc);
      doc.aiScore      = evalResult.talentScore;
      doc.jdMatchScore = evalResult.jdMatchScore;
      doc.aiEvaluation = evalResult;
      doc.status       = 'evaluated';
      return doc.save();
    });
    await Promise.all(evalOps);
  }

  return {
    summary: {
      totalRows:  rawRows.length,
      imported:   insertedDocs.length,
      duplicates: allDuplicates.length,
      errors:     errorRows.length,
      autoEvaluated: insertedDocs.length
    },
    errors:     errorRows,
    duplicates: allDuplicates,
    candidates: insertedDocs.map((d) => d.toSummaryJSON())
  };
}

// ── Generate XLSX template buffer ─────────────────────────────────────────────
export function generateTemplateBuffer() {
  const headers = [
    'Candidate Name',
    'Email',
    'Resume URL',
    'GitHub URL',
    'LinkedIn URL',
    'Portfolio URL',
    'LeetCode URL',
    'HackerRank URL',
    'CodeChef URL',
    'Experience (Years)',
    'Skills (comma-separated)',
    'College',
    'Graduation Year'
  ];

  // One sample row for guidance
  const sample = [
    'Jane Smith',
    'jane.smith@example.com',
    'https://drive.google.com/resume',
    'https://github.com/janesmith',
    'https://linkedin.com/in/janesmith',
    'https://janesmith.dev',
    'https://leetcode.com/janesmith',
    'https://hackerrank.com/janesmith',
    'https://codechef.com/users/janesmith',
    '2',
    'React, Node.js, Python',
    'MIT',
    '2023'
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, sample]);

  // Column widths
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 20) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
