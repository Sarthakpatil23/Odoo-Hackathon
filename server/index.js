const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const { authenticate } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected test route — returns decoded token payload from req.user
// Usage: GET /api/me with Authorization: Bearer <token>
app.get('/api/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  AssetFlow server running on http://localhost:${PORT}`);
});
