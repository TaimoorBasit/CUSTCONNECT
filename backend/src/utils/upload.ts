import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');
const CAFE_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'cafes');
const LOST_FOUND_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'lost-found');
const PRINT_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'prints');
const POST_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'posts');
const RESOURCE_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'resources');

// Create directories if they don't exist
export const ensureDirectories = () => {
  try {
    const dirs = [UPLOAD_BASE_DIR, CAFE_UPLOAD_DIR, LOST_FOUND_UPLOAD_DIR, PRINT_UPLOAD_DIR, POST_UPLOAD_DIR, RESOURCE_UPLOAD_DIR];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('✅ Created directory:', dir);
      }
    });
    return true;
  } catch (error: any) {
    console.error('❌ Failed to create upload directories:', error.message);
    return false;
  }
};

ensureDirectories();

const createStorage = (dir: string, prefix: string) => multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectories();
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${prefix}-${timestamp}-${random}${ext}`);
  }
});

const cafeStorage = createStorage(CAFE_UPLOAD_DIR, 'cafe');
const lostFoundStorage = createStorage(LOST_FOUND_UPLOAD_DIR, 'lost-found');
const postStorage = createStorage(POST_UPLOAD_DIR, 'post');
const resourceStorage = createStorage(RESOURCE_UPLOAD_DIR, 'resource');

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValidExt = allowedExts.includes(ext);

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowedExts.join(', ')}`));
  }
};

export const upload = multer({ storage: cafeStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
export const uploadLostFound = multer({ storage: lostFoundStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
export const uploadPost = multer({ storage: postStorage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });
export const uploadResource = multer({ storage: resourceStorage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter });

export const getFileUrl = (filename: string, type: 'cafe' | 'lost-found' | 'post' | 'resource' = 'cafe'): string => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  const cleanFilename = path.basename(filename);
  const uploadPath = type === 'resource' ? 'resources' : type === 'post' ? 'posts' : type === 'lost-found' ? 'lost-found' : 'cafes';
  return `/uploads/${uploadPath}/${cleanFilename}`;
};

export const verifyFileExists = (filename: string, type: 'cafe' | 'lost-found' | 'post' | 'resource' = 'cafe'): boolean => {
  const filePath = getFilePath(filename, type);
  return filePath ? fs.existsSync(filePath) : false;
};

export const getFilePath = (filename: string, type: 'cafe' | 'lost-found' | 'post' | 'resource' = 'cafe'): string => {
  if (!filename) return '';
  const cleanFilename = path.basename(filename);
  const dir = type === 'resource' ? RESOURCE_UPLOAD_DIR : type === 'post' ? POST_UPLOAD_DIR : type === 'lost-found' ? LOST_FOUND_UPLOAD_DIR : CAFE_UPLOAD_DIR;
  return path.join(dir, cleanFilename);
};
