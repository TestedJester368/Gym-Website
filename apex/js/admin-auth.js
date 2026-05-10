const API_URL = 'http://localhost:3000/api/admin';

const adminLoginForm = document.getElementById('adminLoginForm');

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!email || !password) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    try {
      showStatus('Authenticating admin...', 'loading');

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      // Clear any existing user sessions
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Set admin tokens
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));

      showStatus('✓ Admin login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 800);

    } catch (error) {
      console.error('Admin login error:', error);
      showStatus(error.message || 'Admin login failed', 'error');
    }
  });
}

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
