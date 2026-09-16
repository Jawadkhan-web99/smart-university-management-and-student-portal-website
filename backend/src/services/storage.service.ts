import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadBaseDir = path.join(process.cwd(), 'uploads');
const submissionsDir = path.join(uploadBaseDir, 'submissions');
const avatarsDir = path.join(uploadBaseDir, 'avatars');

[uploadBaseDir, submissionsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for assignment submissions
const submissionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, submissionsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `submission-${uniqueSuffix}${ext}`);
  },
});

// Allowed document types: PDF, DOC, DOCX, PPT, PPTX, ZIP
const documentFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${ext}". Allowed types: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

export const submissionUpload = multer({
  storage: submissionStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

// Storage configuration for profile avatars
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// Allowed image types: JPG, JPEG, PNG, WEBP
const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid image format "${ext}". Allowed image types: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
});
