const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../apex-gym.db');

// Initialize DB connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at', dbPath);
    initializeDB();
  }
});

// Run migrations to create tables
function initializeDB() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        plan TEXT DEFAULT NULL,
        role TEXT DEFAULT 'member',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admins table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens table (for token revocation)
    db.run(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Subscriptions/Plans table
    db.run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan TEXT NOT NULL,
        price REAL NOT NULL,
        startDate TEXT DEFAULT CURRENT_TIMESTAMP,
        endDate TEXT,
        status TEXT DEFAULT 'active',
        stripeSubscriptionId TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Seed admin if it doesn't exist (demo only)
    seedAdminIfNeeded();
  });
}

async function seedAdminIfNeeded() {
  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM admins', async (err, row) => {
      if (err) {
        console.error('Error checking admins:', err);
        resolve();
        return;
      }

      if (row.count === 0) {
        const bcrypt = require('bcryptjs');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@apex.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'ApexAdmin@2024';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        db.run(
          'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
          [adminEmail, hashedPassword, 'admin'],
          (err) => {
            if (err) {
              console.error('Error seeding admin:', err);
            } else {
              console.log('✅ Demo admin seeded:', adminEmail);
            }
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  });
}

// Promisified DB methods for async/await
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = { db, dbRun, dbGet, dbAll };
