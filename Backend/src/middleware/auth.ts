import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

/**
 * Shape of the decoded JWT payload attached to req.user.
 */
export interface JwtUserPayload {
  walletAddress: string;
  role: string;
  communityId: string;
  iat: number;
  exp: number;
}

/**
 * Extend Express Request to include the authenticated user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        message: 'Authorization header is missing',
        code: 'AUTH_MISSING_HEADER',
        statusCode: 401,
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        message: 'Authorization header must use Bearer scheme',
        code: 'AUTH_INVALID_SCHEME',
        statusCode: 401,
      });
      return;
    }

    const token = parts[1];
    const { JWT_SECRET } = getEnv();

    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    // Distinguish expired tokens from other verification failures
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: 'Token has expired',
        code: 'AUTH_TOKEN_EXPIRED',
        statusCode: 401,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: 'Invalid token',
        code: 'AUTH_TOKEN_INVALID',
        statusCode: 401,
      });
      return;
    }

    res.status(401).json({
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
      statusCode: 401,
    });
  }
}
