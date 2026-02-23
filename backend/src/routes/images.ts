import express from 'express';
import path from 'path';
import fs from 'fs';
import { getFilePath, ensureDirectories } from '../utils/upload';

const router = express.Router();

// Ensure directories exist before serving
ensureDirectories();

// Serve cafe images
// Serve profile pictures (using lost-found directory for now)
router.get('/profiles/:filename', (req, res) => {
  const { filename } = req.params as any;

  // Security: Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ success: false, message: 'Invalid filename' });
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', 'lost-found', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Profile image not found: ${filePath}`);
    res.status(404).json({ success: false, message: 'Image not found' });
    return;
  }

  console.log(`✅ Serving profile image: ${filePath}`);

  // Get file extension for content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[ext] || 'image/jpeg';

  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

  res.sendFile(filePath);
});

// Serve lost-found images
router.get('/lost-found/:filename', (req, res) => {
  const { filename } = req.params as any;

  // Security: Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ success: false, message: 'Invalid filename' });
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', 'lost-found', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Lost-found image not found: ${filePath}`);
    res.status(404).json({ success: false, message: 'Image not found' });
    return;
  }

  console.log(`✅ Serving lost-found image: ${filePath}`);

  // Get file extension for content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[ext] || 'image/jpeg';

  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

  res.sendFile(filePath);
});

router.get('/cafes/:filename', (req, res) => {
  const { filename } = req.params as any;

  // Security: prevent directory traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    console.warn('❌ Invalid filename attempted:', filename);
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  // Ensure directories exist
  ensureDirectories();

  const filePath = getFilePath(filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`❌ Image not found: ${filePath}`);
    console.warn(`   Requested filename: ${filename}`);
    console.warn(`   Full path: ${path.resolve(filePath)}`);

    // Return 404 with proper headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.status(404).json({
      error: 'Image not found',
      filename,
      path: filePath,
      message: 'The requested image file does not exist on the server'
    });
    return;
    return;
  }

  // Get file extension for content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Set headers BEFORE sending file
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=31536000');

  // Get absolute path
  const absolutePath = path.resolve(filePath);

  // Verify file still exists (race condition check)
  if (!fs.existsSync(absolutePath)) {
    console.error('❌ File disappeared between check and send:', absolutePath);
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  // Send file
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.error('❌ Error sending image file:', err);
      console.error('   File path:', absolutePath);
      console.error('   Error code:', (err as any).code);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error serving image', details: err.message });
      }
    } else {
      console.log(`✅ Served image: ${filename} (${fs.statSync(absolutePath).size} bytes)`);
    }
  });
});

// Serve print documents
router.get('/prints/:filename', (req, res) => {
  const { filename } = req.params as any;

  // Security: Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ success: false, message: 'Invalid filename' });
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', 'prints', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Print file not found: ${filePath}`);
    res.status(404).json({ success: false, message: 'File not found' });
    return;
  }

  console.log(`✅ Serving print file: ${filePath}`);

  // Get file extension for content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.txt': 'text/plain'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  res.sendFile(filePath);
});

// Serve post images and videos
router.get('/posts/:filename', (req, res) => {
  const { filename } = req.params as any;

  // Security: Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ success: false, message: 'Invalid filename' });
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', 'posts', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Post file not found: ${filePath}`);
    res.status(404).json({ success: false, message: 'File not found' });
    return;
  }

  console.log(`✅ Serving post file: ${filePath}`);

  // Get file extension for content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

  res.sendFile(filePath);
});

export default router;

