import multer from 'multer';

const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024; //5MB de limite de tamanho de arquivo

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_IN_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  },
});

export default upload;
