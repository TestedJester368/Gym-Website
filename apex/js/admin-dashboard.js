const API_URL = `${window.location.origin}/api/admin`;

function checkAdminAuth() {
  const token = localStorage.getItem('adminToken');
  const admin = localStorage.getItem('admin');

  if (!token || !admin) {
    window.location.href = 'admin-login.html';
    return null;
  }

  return JSON.parse(admin);
}

const currentAdmin = checkAdminAuth();

document.addEventListener('DOMContentLoaded', () => {
  if (!currentAdmin) return;

  setupNavigation();
  loadDashboardData();
  setupLogout();
});

function setupNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.admin-section');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;

      menuItems.forEach(m => m.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`${section}-section`).classList.add('active');

      if (section === 'users') {
        loadUsersData();
      } else if (section === 'plans') {
        loadPlansData();
      }
    });
  });
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load stats');
    }

    const stats = data.stats;

    document.getElementById('totalUsersCount').textContent = stats.totalUsers;
    document.getElementById('noPlanCount').textContent = stats.planBreakdown.noplan;
    document.getElementById('starterCount').textContent = stats.planBreakdown.starter;
    document.getElementById('proCount').textContent = stats.planBreakdown.pro;
    document.getElementById('eliteCount').textContent = stats.planBreakdown.elite;

    const regList = document.getElementById('recentRegistrations');
    if (stats.recentRegistrations.length === 0) {
      regList.innerHTML = '<p class="empty">No recent registrations</p>';
    } else {
      regList.innerHTML = stats.recentRegistrations.map(reg => `
        <div class="registration-item">
          <div>
            <div class="reg-name">${reg.fullName}</div>
            <div class="reg-email">${reg.email}</div>
          </div>
          <div class="reg-date">${new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      `).join('');
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    alert('Error loading dashboard data');
  }
}

async function loadUsersData() {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load users');
    }

    displayUsersTable(data.users);
    setupUserSearch(data.users);

  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersTableBody').innerHTML = `
      <tr><td colspan="5" class="error">Error loading users</td></tr>
    `;
  }
}

function displayUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td class="user-name">${user.fullName}</td>
      <td class="user-email">${user.email}</td>
      <td class="user-plan">
        <span class="plan-badge plan-${user.plan.toLowerCase()}">${user.plan}</span>
      </td>
      <td class="user-date">${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td class="user-actions">
        <button class="action-btn edit-btn" onclick="openEditPlanModal('${user.uid}', '${user.fullName}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteUser('${user.uid}', '${user.fullName}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function setupUserSearch(users) {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = users.filter(user =>
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
    displayUsersTable(filtered);
  });
}

async function loadPlansData() {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const stats = data.stats;

    document.getElementById('starterPlanCount').textContent = `${stats.planBreakdown.starter} users`;
    document.getElementById('proPlanCount').textContent = `${stats.planBreakdown.pro} users`;
    document.getElementById('elitePlanCount').textContent = `${stats.planBreakdown.elite} users`;

    const starterRevenue = stats.planBreakdown.starter * 999;
    const proRevenue = stats.planBreakdown.pro * 1999;
    const eliteRevenue = stats.planBreakdown.elite * 3499;
    const totalRevenue = starterRevenue + proRevenue + eliteRevenue;

    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

  } catch (error) {
    console.error('Error loading plans data:', error);
  }
}

const modal = document.getElementById('editPlanModal');
const closeBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelEdit');
const editForm = document.getElementById('editPlanForm');

let currentEditingUid = null;

function openEditPlanModal(uid, fullName) {
  currentEditingUid = uid;
  document.getElementById('editUserName').value = fullName;
  document.getElementById('editPlan').value = '';
  modal.classList.add('active');
}

closeBtn.addEventListener('click', () => modal.classList.remove('active'));
cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPlan = document.getElementById('editPlan').value;

  if (!newPlan) {
    alert('Please select a plan');
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_URL}/users/${currentEditingUid}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: newPlan })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update plan');
    }

    alert('✓ Plan updated successfully!');
    modal.classList.remove('active');
    loadUsersData();

  } catch (error) {
    console.error('Error updating plan:', error);
    alert('Error updating plan: ' + error.message);
  }
});

async function deleteUser(uid, fullName) {
  if (!confirm(`Are you sure you want to delete ${fullName}?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${API_URL}/users/${uid}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }

    alert('✓ User deleted successfully');
    loadUsersData();

  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user: ' + error.message);
  }
}

function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = 'admin-login.html';
    }
  });
}