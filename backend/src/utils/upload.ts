import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');
const CAFE_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'cafes');
const LOST_FOUND_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'lost-found');
const PRINT_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, 'prints');

// Create directories if they don't exist - EXPORTED for use in other modules
export const ensureDirectories = () => {
  try {
    if (!fs.existsSync(UPLOAD_BASE_DIR)) {
      fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
      console.log('✅ Created uploads base directory:', UPLOAD_BASE_DIR);
    }
    if (!fs.existsSync(CAFE_UPLOAD_DIR)) {
      fs.mkdirSync(CAFE_UPLOAD_DIR, { recursive: true });
      console.log('✅ Created cafes upload directory:', CAFE_UPLOAD_DIR);
    }
    if (!fs.existsSync(LOST_FOUND_UPLOAD_DIR)) {
      fs.mkdirSync(LOST_FOUND_UPLOAD_DIR, { recursive: true });
      console.log('✅ Created lost-found upload directory:', LOST_FOUND_UPLOAD_DIR);
    }
    if (!fs.existsSync(PRINT_UPLOAD_DIR)) {
      fs.mkdirSync(PRINT_UPLOAD_DIR, { recursive: true });
      console.log('✅ Created prints upload directory:', PRINT_UPLOAD_DIR);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Failed to create upload directories:', error.message);
    return false;
  }
};

// Initialize directories on module load
ensureDirectories();

// Multer storage configuration for cafes
const cafeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectories(); // Ensure directories exist before saving
    cb(null, CAFE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `cafe-${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

// Multer storage configuration for lost-found
const lostFoundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectories(); // Ensure directories exist before saving
    cb(null, LOST_FOUND_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `lost-found-${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValidExt = allowedExts.includes(ext);
  
  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`));
  }
};

// Create multer instances
export const upload = multer({
  storage: cafeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

export const uploadLostFound = multer({
  storage: lostFoundStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Generate URL path for uploaded file
export const getFileUrl = (filename: string, type: 'cafe' | 'lost-found' = 'cafe'): string => {
  if (!filename) return '';
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Remove any leading slashes
  const cleanFilename = filename.replace(/^\/+/, '');
  
  // If already includes uploads path, return with leading slash
  if (cleanFilename.startsWith('uploads/')) {
    return `/${cleanFilename}`;
  }
  
  // Otherwise, construct the path based on type
  const uploadPath = type === 'lost-found' ? 'lost-found' : 'cafes';
  return `/uploads/${uploadPath}/${cleanFilename}`;
};

// Verify file exists on disk
export const verifyFileExists = (filename: string): boolean => {
  if (!filename) return false;
  const cleanFilename = filename.replace(/^\/+/, '').replace('uploads/cafes/', '');
  const filePath = path.join(CAFE_UPLOAD_DIR, cleanFilename);
  return fs.existsSync(filePath);
};

// Get full file path
export const getFilePath = (filename: string): string => {
  if (!filename) return '';
  const cleanFilename = filename.replace(/^\/+/, '').replace('uploads/cafes/', '');
  return path.join(CAFE_UPLOAD_DIR, cleanFilename);
};
