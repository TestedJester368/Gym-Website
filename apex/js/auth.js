/* ============================================================
   AUTHENTICATION SYSTEM
   - Email/Password login & registration
   - Token management
   - No Firebase dependency
============================================================ */

const API_URL = `${window.location.origin}/api/auth`; 

// ============================================================
// TAB SWITCHING
// ============================================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabBtns.length > 0) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = btn.dataset.tab;
      
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active to current
      btn.classList.add('active');
      const tabEl = document.getElementById(`${tabName}-tab`);
      if (tabEl) {
        tabEl.classList.add('active');
      }
    });
  });
}

// ============================================================
// EMAIL LOGIN
// ============================================================
const emailLoginForm = document.getElementById('emailLoginForm');

// EMAIL LOGIN (update redirect)
if (emailLoginForm) {
  emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
      showStatus('Please fill in all fields', 'error');
      return;
    }
    
    try {
      showStatus('Signing in...', 'loading');
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showStatus('✓ Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
      
    } catch (error) {
      console.error('Login error:', error);
      showStatus(error.message || 'Login failed', 'error');
    }
  });
}

// ============================================================
// EMAIL REGISTRATION
// ============================================================
const registerForm = document.getElementById('registerForm');

// EMAIL REGISTRATION (update redirect)
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!fullName || !email || !password || !confirmPassword) {
      showStatus('Please fill in all fields', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showStatus('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      showStatus('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      showStatus('Creating account...', 'loading');
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showStatus('✓ Account created!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
      
    } catch (error) {
      console.error('Registration error:', error);
      showStatus(error.message || 'Registration failed', 'error');
    }
  });
}

// ============================================================
// REGISTER/LOGIN TOGGLE (on login page)
// ============================================================
const switchToRegister = document.querySelectorAll('.switch-to-register');

switchToRegister.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const emailTab = document.getElementById('email-tab');
    if (emailTab) {
      const registerForm = emailTab.querySelector('#registerForm');
      const loginForm = emailTab.querySelector('#emailLoginForm');
      
      if (registerForm && loginForm) {
        loginForm.style.display = loginForm.style.display === 'none' ? 'flex' : 'none';
        registerForm.style.display = registerForm.style.display === 'none' ? 'flex' : 'none';
      }
    }
  });
});

// ============================================================
// STATUS MESSAGES
// ============================================================
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('authStatus');
  if (!statusEl) return;
  
  statusEl.textContent = message;
  statusEl.className = `auth-status ${type}`;
  statusEl.classList.remove('hidden');
  
  if (type !== 'loading') {
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 5000);
  }
}

// ============================================================
// CHECK AUTH STATE
// ============================================================
function checkAuthState() {
  const token = localStorage.getItem('authToken');
  return !!token;
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '../index.html';
}
