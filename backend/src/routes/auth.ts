import express from 'express';
import { DatabaseService } from '../database';

const router = express.Router();

export const createAuthRoutes = (database: DatabaseService) => {
  router.post('/login', async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const trimmedUsername = username.trim();
      
      // Try to get existing user
      let user = await database.getUserByUsername(trimmedUsername);
      
      // If user doesn't exist, create them
      if (!user) {
        user = await database.createUser(trimmedUsername);
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  router.get('/session', async (req, res) => {
    if (!req.session.userId) {
      return res.json({ authenticated: false });
    }

    try {
      const user = await database.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.json({ authenticated: false });
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Session check error:', error);
      res.status(500).json({ error: 'Failed to check session' });
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  return router;
};