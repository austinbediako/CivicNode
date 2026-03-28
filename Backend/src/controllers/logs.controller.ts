import { Request, Response } from 'express';
import { ChatLog } from '../models/ChatLog.js';
import { Community } from '../models/Community.js';

// Maximum allowed length for sanitized chat text (500KB)
const MAX_TEXT_LENGTH = 500_000;

/**
 * Strip HTML tags from text to prevent stored XSS.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize chat log text: strip HTML and enforce length limits.
 */
function sanitizeText(raw: string): string {
  const stripped = stripHtml(raw);
  if (stripped.length > MAX_TEXT_LENGTH) {
    return stripped.slice(0, MAX_TEXT_LENGTH);
  }
  return stripped;
}

/**
 * Upload a community chat log.
 * Accepts either a text body field or a file upload (via multer).
 */
export async function uploadLog(req: Request, res: Response): Promise<void> {
  try {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401,
      });
      return;
    }

    const { communityId } = req.body as { communityId?: string };
    if (!communityId) {
      res.status(400).json({
        message: 'communityId is required',
        code: 'MISSING_COMMUNITY_ID',
        statusCode: 400,
      });
      return;
    }

    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({
        message: 'Community not found',
        code: 'COMMUNITY_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    // Get text from either file upload or body field
    let rawText: string | undefined;

    // Check if a file was uploaded via multer
    const file = req.file;
    if (file) {
      rawText = file.buffer.toString('utf-8');
    } else {
      rawText = (req.body as { text?: string }).text;
    }

    if (!rawText || rawText.trim().length === 0) {
      res.status(400).json({
        message: 'Chat log text is required (provide "text" field or upload a file)',
        code: 'MISSING_CHAT_TEXT',
        statusCode: 400,
      });
      return;
    }

    const sanitized = sanitizeText(rawText);

    const chatLog = await ChatLog.create({
      communityId,
      uploadedBy: walletAddress,
      sanitizedText: sanitized,
    });

    res.status(201).json({
      id: String(chatLog._id),
      communityId: String(chatLog.communityId),
      uploadedBy: chatLog.uploadedBy,
      sanitizedTextLength: chatLog.sanitizedText.length,
      uploadedAt: chatLog.uploadedAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[logs] uploadLog error: ${message}`);
    res.status(500).json({
      message: 'Failed to upload chat log',
      code: 'LOG_UPLOAD_ERROR',
      statusCode: 500,
    });
  }
}
