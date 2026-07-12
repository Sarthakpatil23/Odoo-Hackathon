const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../generated/prisma');

const router = express.Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '8h';

/**
 * Helper: sign a JWT token with userId and role
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

/**
 * POST /api/auth/signup
 * Accepts: { name, email, password }
 * - Hashes password with bcrypt
 * - Always assigns role = Employee (ignores any role in request body)
 * - Returns created user (without password) and a JWT
 */
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user — role is hardcoded to Employee, client cannot override it
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'Employee', // always hardcoded — do not use req.body.role
      },
    });

    // Sign token
    const token = signToken(user);

    // Return user without password
    const { password: _pw, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Account created successfully.',
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error('[signup error]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/login
 * Accepts: { email, password }
 * - Verifies password with bcrypt
 * - Rejects Inactive users with 403
 * - Returns JWT with { userId, role } and basic user info
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account is Active
    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact an administrator.' });
    }

    // Sign token
    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (err) {
    console.error('[login error]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
