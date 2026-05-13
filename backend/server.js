const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { QuickDB } = require('quick.db');
const { Database } = require('quickmongo');
dotenv.config();
const app = express();
const db = new Database(process.env.MONGO_URI);
// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500', '*'],
  credentials: true
}));
app.use(express.json());

// Serve frontend
const frontendPath = path.join(__dirname, '../apex');
app.use(express.static(frontendPath));

// In-memory database (replace with real DB later)
const users = new Map();
db.on("ready", () => {
    console.log("Connected to the database");
    doStuff().then(console.log("Data set in the database"));
});
db.connect()
async function doStuff() {
await db.set("userInfo", { name: "John Doe", email: "john.doe@example.com" });
}
// ============================================================
// AUTH ROUTES
// ============================================================

// Email/Password Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = `user_${Date.now()}`;

    const newUser = {
      uid,
      email,
      password: hashedPassword,
      fullName,
      plan: null,
      createdAt: new Date(),
      role: 'member'
    };

    users.set(email, newUser);

    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET || 'your_secret_key_change_this', {
      expiresIn: '7d'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { 
        uid, 
        email, 
        fullName, 
        plan: null
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Email/Password Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ uid: user.uid, email }, process.env.JWT_SECRET || 'your_secret_key_change_this', {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        uid: user.uid, 
        email: user.email, 
        fullName: user.fullName, 
        plan: user.plan || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Current User (Protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = Array.from(users.values()).find(u => u.uid === req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        fullName: user.fullName, 
        plan: user.plan 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: '🚀 APEX Gym Auth Backend is running',
    endpoints: {
      health: 'GET /health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getCurrentUser: 'GET /api/auth/me (requires token)',
      logout: 'POST /api/auth/logout (requires token)'
    }
  });
});

// ============================================================
// ADMIN ROUTES
// ============================================================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Hardcoded admin credentials (in production, use database)
    const ADMIN_EMAIL = 'admin@apex.com';
    const ADMIN_PASSWORD = 'ApexAdmin@2024';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET || 'your_secret_key_change_this', {
      expiresIn: '24h'
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: { email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Users (Admin Only)
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  try {
    const allUsers = Array.from(users.values()).map(user => ({
      uid: user.uid,
      email: user.email,
      fullName: user.fullName,
      plan: user.plan || 'No Plan',
      createdAt: user.createdAt,
      role: user.role
    }));

    res.json({
      success: true,
      totalUsers: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Admin Dashboard Stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const allUsers = Array.from(users.values());
    
    const stats = {
      totalUsers: allUsers.length,
      planBreakdown: {
        noplan: allUsers.filter(u => !u.plan || u.plan === 'null').length,
        starter: allUsers.filter(u => u.plan === 'starter').length,
        pro: allUsers.filter(u => u.plan === 'pro').length,
        elite: allUsers.filter(u => u.plan === 'elite').length
      },
      recentRegistrations: allUsers
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(u => ({
          email: u.email,
          fullName: u.fullName,
          createdAt: u.createdAt
        }))
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Plan (Admin Only)
app.put('/api/admin/users/:uid/plan', authenticateAdmin, (req, res) => {
  try {
    const { uid } = req.params;
    const { plan } = req.body;

    const user = Array.from(users.values()).find(u => u.uid === uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.plan = plan;
    users.set(user.email, user);

    res.json({
      success: true,
      message: `User plan updated to ${plan}`,
      user: {
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User (Admin Only)
app.delete('/api/admin/users/:uid', authenticateAdmin, (req, res) => {
  try {
    const { uid } = req.params;

    const user = Array.from(users.values()).find(u => u.uid === uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.delete(user.email);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// MIDDLEWARE
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_this', (err, user) => {
    if (err) {
      console.error('Token error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// ============================================================
// MIDDLEWARE - AUTHENTICATE ADMIN
// ============================================================

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_this', (err, user) => {
    if (err) {
      console.error('Admin token error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
}

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3000;
// Frontend routes
app.get('/pages/:page', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', req.params.page));
});

app.listen(PORT, () => {
  console.log(`\n✅ Auth server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health\n`);
});