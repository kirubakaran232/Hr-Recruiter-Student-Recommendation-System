import multer from 'multer';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
  'text/csv',
  'application/csv',
  'text/plain' // Some OS sends CSV as text/plain
];

const fileFilter = (_req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed');
    err.statusCode = 400;
    cb(err, false);
  }
};

export const candidateFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter
});
