require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Connect DB ────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ─────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: 'Too many login attempts. Try again in an hour.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Routes ────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/opinions',  require('./routes/opinions'));
app.use('/api/wallet',    require('./routes/wallet'));
app.use('/api/brands',    require('./routes/brands'));
app.use('/api/admin',     require('./routes/admin'));

// ── Health check ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🟢 Opinifi API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ─────────────────────────────────
app.use(errorHandler);

// ── CRON Jobs ─────────────────────────────────────
// Every day at midnight: close expired opinions
cron.schedule('0 0 * * *', async () => {
  try {
    const Opinion = require('./models/Opinion');
    const result = await Opinion.updateMany(
      { status: 'active', expiresAt: { $lt: new Date() } },
      { $set: { status: 'closed' } }
    );
    console.log(`✅ Cron: Closed ${result.modifiedCount} expired opinions`);
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

// Every 1st of month: reset opinionsThisMonth counter
cron.schedule('0 0 1 * *', async () => {
  try {
    const User = require('./models/User');
    await User.updateMany({}, { $set: { opinionsThisMonth: 0 } });
    console.log('✅ Cron: Monthly opinion counter reset');
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

// ── Start ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Opinifi Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
