import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});


export const uploadLegalPdf = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Giới hạn 20MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('INVALID_FILE_TYPE: Chỉ chấp nhận file định dạng PDF'));
    }
  },
});
