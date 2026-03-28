import { Router, type IRouter } from 'express';
import multer from 'multer';
import { uploadLog } from '../controllers/logs.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

// Configure multer for in-memory file storage (text files only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    // Only accept text files
    if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only text files are accepted'));
    }
  },
});

/**
 * POST /api/logs/upload
 * Upload a community chat log (as text body or file attachment).
 * Requires authentication.
 */
router.post('/upload', authMiddleware, upload.single('file'), uploadLog);

export default router;
