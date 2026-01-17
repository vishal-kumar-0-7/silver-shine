import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';

const router = express.Router();

// Register
// Only admin can register new users, except for the very first user
router.post('/register', async (req, res, next) => {
  try {
    // Check if this is the first user
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count, 10);
    let isAdmin = false;
    let requester = null;
    if (userCount === 0) {
      // First user is always admin
      isAdmin = true;
    } else {
      // Require authentication for all other registrations
      authenticateToken(req, res, async (authErr) => {
        if (authErr) return; // authenticateToken already sent response
        requester = req.user;
        if (!requester || !requester.is_admin) {
          return res.status(403).json({ message: 'Only admin can register new users' });
        }
        await continueRegistration();
      });
      return;
    }
    await continueRegistration();

    async function continueRegistration() {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user exists
      const userCheck = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await pool.query(
        'INSERT INTO users (id, username, email, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, is_admin',
        [uuidv4(), username, email, hashedPassword, isAdmin]
      );

      // Generate token
      const token = generateToken(newUser.rows[0]);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: newUser.rows[0]
      });
    }
  } catch (error) {
    console.error('Register error:', error, req.body);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add /me endpoint to validate token and return user info
router.get('/me', authenticateToken, async (req, res) => {
  // req.user is set by authenticateToken middleware
  res.json({
    user: req.user
  });
});

export default router;
