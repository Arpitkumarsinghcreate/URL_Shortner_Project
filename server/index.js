import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let sqlite3;
try {
  sqlite3 = require('sqlite3');
  console.log('✅ SQLite3 loaded successfully');
} catch (error) {
  console.error('❌ Failed to load sqlite3:', error);
  process.exit(1);
}

const db = new sqlite3.Database(join(__dirname, 'urls.db'), (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ---- Helper: Run DB query as Promise ----
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ---- Routes ----

// Health check (MUST be above shortCode route)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Shorten URL
app.post('/api/shorten', async (req, res) => {
  console.log('📩 Received shorten request:', req.body);

  try {
    const { longUrl, customCode } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(longUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let shortCode = customCode;

    if (shortCode) {
      // Check if custom code exists
      const existing = await getQuery(
        'SELECT id FROM urls WHERE short_code = ?',
        [shortCode]
      );
      if (existing) {
        return res.status(400).json({ error: 'Custom code already exists' });
      }
    } else {
      // Generate a unique short code
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        shortCode = nanoid(8);
        const existing = await getQuery(
          'SELECT id FROM urls WHERE short_code = ?',
          [shortCode]
        );
        if (!existing) break;
        attempts++;
      }
      if (attempts >= maxAttempts) {
        return res
          .status(500)
          .json({ error: 'Failed to generate unique short code' });
      }
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

    await runQuery('INSERT INTO urls (short_code, long_url) VALUES (?, ?)', [
      shortCode,
      longUrl,
    ]);

    console.log('✅ URL shortened:', { shortUrl, shortCode, longUrl });
    res.json({ shortUrl, shortCode, longUrl });
  } catch (error) {
    console.error('❌ Error in /api/shorten:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Stats
app.get('/api/stats', async (req, res) => {
  try {
    const urls = await allQuery('SELECT * FROM urls ORDER BY created_at DESC');
    res.json(urls);
  } catch (error) {
    console.error('❌ Error in /api/stats:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logs
app.post('/api/logs', async (req, res) => {
  try {
    const { type, message, data } = req.body;
    await runQuery(
      'INSERT INTO logs (type, message, data) VALUES (?, ?, ?)',
      [type, message, JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /api/logs:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect (must be last, otherwise it catches /api/*)
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    console.log('➡️ Redirect request for:', shortCode);

    const url = await getQuery('SELECT * FROM urls WHERE short_code = ?', [
      shortCode,
    ]);

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    await runQuery('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [
      shortCode,
    ]);

    console.log('🔗 Redirecting to:', url.long_url);
    res.redirect(url.long_url);
  } catch (error) {
    console.error('❌ Error in redirect:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
