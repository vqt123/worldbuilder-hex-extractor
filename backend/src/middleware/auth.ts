import express from 'express';

// Extend session interface to include user
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};