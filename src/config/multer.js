import multer from 'multer';

const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024; //5MB de limite de tamanho de arquivo

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_IN_BYTES,
  },
});

export default upload;
