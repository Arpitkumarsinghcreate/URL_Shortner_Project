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
  console.log('SQLite3 loaded successfully');
} catch (error) {
  console.error('Failed to load sqlite3:', error);
  process.exit(1);
}

const db = new sqlite3.Database(join(__dirname, 'urls.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
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
  )`, (err) => {
    if (err) {
      console.error('Error creating urls table:', err);
    } else {
      console.log('URLs table ready');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating logs table:', err);
    } else {
      console.log('Logs table ready');
    }
  });
});

// Routes
app.post('/api/shorten', async (req, res) => {
  console.log('Received shorten request:', req.body);
  try {
    const { longUrl, customCode } = req.body;
    
    if (!longUrl) {
      console.log('No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(longUrl);
    } catch {
      console.log('Invalid URL format:', longUrl);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let shortCode = customCode;
    
    if (!shortCode) {
      // Generate a unique short code with a limit to prevent infinite loops
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        shortCode = nanoid(8);
        const existing = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (!existing) break;
        attempts++;
        
        if (attempts >= maxAttempts) {
          console.error('Failed to generate unique short code after', maxAttempts, 'attempts');
          return res.status(500).json({ error: 'Failed to generate unique short code' });
        }
      } while (true);
    } else {
      // Check if custom code already exists
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        console.log('Custom code already exists:', shortCode);
        return res.status(400).json({ error: 'Custom code already exists' });
      }
    }

    // Insert new URL
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO urls (short_code, long_url) VALUES (?, ?)',
        [shortCode, longUrl],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log('URL shortened successfully:', { shortUrl, shortCode, longUrl });
    res.json({ shortUrl, shortCode, longUrl });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    console.log('Redirect request for:', shortCode);
    
    const url = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM urls WHERE short_code = ?',
        [shortCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!url) {
      console.log('URL not found:', shortCode);
      return res.status(404).json({ error: 'URL not found' });
    }

    // Increment click count
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
        [shortCode],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Redirecting to:', url.long_url);
    res.redirect(url.long_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    console.log('Stats request received');
    const urls = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM urls ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log('Stats returned:', urls.length, 'URLs');
    res.json(urls);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { type, message, data } = req.body;
    console.log('Log event:', type, message);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO logs (type, message, data) VALUES (?, ?, ?)',
        [type, message, JSON.stringify(data)],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 