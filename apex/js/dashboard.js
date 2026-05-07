/* ============================================================
   DASHBOARD — User Profile & Fitness Tracking
============================================================ */

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }
  
  return JSON.parse(user);
}

const currentUser = checkAuth();

// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) return;
  
  initializeUserInfo();
  initializeGymStatus();
  initializeWorkouts();
  initializeVisits();
  setupWorkoutModal();
  setupLogout();
  updateDateTime();
  
  // Update gym status every 10 seconds
  setInterval(updateGymStatus, 10000);
});

// ============================================================
// USER INFO
// ============================================================

function initializeUserInfo() {
  document.getElementById('userName').textContent = currentUser.fullName || currentUser.email.split('@')[0];
  
  // Get the plan value from user object
  const rawPlan = currentUser.plan;
  console.log('Raw plan value:', rawPlan, 'Type:', typeof rawPlan);
  
  // Normalize the plan - convert any falsy value to null
  const plan = (rawPlan && rawPlan !== 'null' && rawPlan !== 'free' && rawPlan !== 'no_plan') ? rawPlan : null;
  console.log('Normalized plan:', plan);
  
  const planNames = {
    starter: 'Starter',
    pro: 'Pro',
    elite: 'Elite'
  };
  const planPrices = {
    starter: '₹999/month',
    pro: '₹1,999/month',
    elite: '₹3,499/month'
  };
  
  const membershipPlanEl = document.getElementById('membershipPlan');
  const membershipPriceEl = document.getElementById('membershipPrice');
  const planBadgeEl = document.getElementById('planBadge');
  const upgradeCardEl = document.getElementById('upgradeCard');
  
  // If plan is null/undefined/falsy = NO PLAN
  if (plan === null || plan === undefined) {
    console.log('✓ No plan - showing unassigned state');
    membershipPlanEl.textContent = 'No Plan Selected';
    membershipPlanEl.style.color = 'var(--muted)';
    membershipPriceEl.textContent = 'Register for a plan now!';
    membershipPriceEl.style.color = 'var(--acid)';
    planBadgeEl.textContent = 'UNASSIGNED';
    planBadgeEl.style.background = 'rgba(255, 193, 7, 0.15)';
    planBadgeEl.style.color = '#ffc107';
    upgradeCardEl.style.display = 'block';
  } else {
    // User HAS a plan
    console.log('✓ Plan exists:', plan);
    membershipPlanEl.textContent = planNames[plan] || 'Standard';
    membershipPlanEl.style.color = 'var(--white)';
    membershipPriceEl.textContent = planPrices[plan] || '₹999/month';
    membershipPriceEl.style.color = 'var(--white)';
    planBadgeEl.textContent = planNames[plan] || 'Standard';
    planBadgeEl.style.background = 'rgba(200, 245, 62, 0.12)';
    planBadgeEl.style.color = 'var(--acid)';
    
    // Show upgrade card if not elite
    if (plan !== 'elite') {
      upgradeCardEl.style.display = 'block';
    } else {
      upgradeCardEl.style.display = 'none';
    }
  }
  
  // Join date
  const joinDate = new Date();
  document.getElementById('joinDate').textContent = joinDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ============================================================
// GYM STATUS (Real-time simulation)
// ============================================================

function initializeGymStatus() {
  updateGymStatus();
}

function updateGymStatus() {
  // Simulate real-time gym occupancy (in real app, fetch from API)
  const hour = new Date().getHours();
  let occupancy;
  
  // Busy times: 6-8am, 5-7pm
  if ((hour >= 6 && hour < 8) || (hour >= 17 && hour < 19)) {
    occupancy = 60 + Math.random() * 30; // 60-90%
  }
  // Moderate times: 9am-4pm
  else if (hour >= 9 && hour < 17) {
    occupancy = 30 + Math.random() * 20; // 30-50%
  }
  // Early morning & late night
  else {
    occupancy = 10 + Math.random() * 15; // 10-25%
  }
  
  occupancy = Math.min(100, Math.round(occupancy));
  
  // Determine status
  let status, statusLabel, statusSub, colorClass;
  
  if (occupancy < 40) {
    status = '✓ FREE';
    statusLabel = 'Gym is Free';
    statusSub = 'Perfect time to work out! All equipment available';
    colorClass = 'green';
  } else if (occupancy < 70) {
    status = '⚠ MODERATE';
    statusLabel = 'Moderately Busy';
    statusSub = 'Some equipment may have short wait times';
    colorClass = 'yellow';
  } else {
    status = '🔴 BUSY';
    statusLabel = 'Very Busy';
    statusSub = 'Expect to wait for popular equipment';
    colorClass = 'red';
  }
  
  // Update UI
  const indicator = document.getElementById('statusIndicator');
  indicator.className = `status-indicator ${colorClass}`;
  indicator.textContent = status;
  
  document.getElementById('statusLabel').textContent = statusLabel;
  document.getElementById('statusSub').textContent = statusSub;
  document.getElementById('occupancyPercent').textContent = occupancy + '%';
  
  const capacityFill = document.getElementById('capacityFill');
  capacityFill.style.width = occupancy + '%';
  capacityFill.className = `capacity-fill ${colorClass}`;
  
  // Update time
  const now = new Date();
  document.getElementById('statusTime').textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================
// DATE & TIME
// ============================================================

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  document.getElementById('headerDate').textContent = now.toLocaleDateString('en-US', options);
}

// ============================================================
// WORKOUTS
// ============================================================

function initializeWorkouts() {
  loadWorkouts();
}

function loadWorkouts() {
  const workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.uid}`) || '[]');
  const today = new Date().toDateString();
  const todayWorkouts = workouts.filter(w => new Date(w.date).toDateString() === today);
  
  const list = document.getElementById('workoutsList');
  
  if (todayWorkouts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏃</div>
        <p>No workouts logged today</p>
        <p class="empty-sub">Start your first workout to track progress!</p>
      </div>
    `;
    updateStats();
    return;
  }
  
  list.innerHTML = todayWorkouts.map(w => `
    <div class="workout-item">
      <div style="display: flex; align-items: center; flex: 1;">
        <span class="workout-icon">${getWorkoutIcon(w.type)}</span>
        <div class="workout-info">
          <div class="workout-type">${capitalize(w.type)}</div>
          <div class="workout-meta">${new Date(w.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <div class="workout-stats">
        <div class="workout-stat">
          <div class="workout-stat-value">${w.duration}</div>
          <div class="workout-stat-label">Minutes</div>
        </div>
        <div class="workout-stat">
          <div class="workout-stat-value">${w.calories}</div>
          <div class="workout-stat-label">Calories</div>
        </div>
      </div>
    </div>
  `).join('');
  
  updateStats();
}

function getWorkoutIcon(type) {
  const icons = {
    cardio: '🏃',
    strength: '🏋️',
    yoga: '🧘',
    crossfit: '⚡',
    swimming: '🏊',
    other: '💪'
  };
  return icons[type] || '🏋️';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateStats() {
  const workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.uid}`) || '[]');
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart);
  const weekHours = Math.round(weekWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60);
  const weekCalories = weekWorkouts.reduce((sum, w) => sum + w.calories, 0);
  
  document.getElementById('weekWorkouts').textContent = weekWorkouts.length;
  document.getElementById('weekHours').textContent = weekHours;
  document.getElementById('weekCalories').textContent = weekCalories;
}

// ============================================================
// VISITS
// ============================================================

function initializeVisits() {
  loadVisits();
}

function loadVisits() {
  const visits = JSON.parse(localStorage.getItem(`visits_${currentUser.uid}`) || '[]');
  
  if (visits.length === 0) {
    document.getElementById('visitsList').innerHTML = `
      <div class="empty-state">
        <p>No gym visits yet</p>
        <p class="empty-sub">Your visit history will appear here</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('visitsList').innerHTML = visits.slice(0, 7).map(v => `
    <div class="visit-item">
      <div class="visit-date">${new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      <div class="visit-details">
        <div class="visit-day">${new Date(v.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
        <div class="visit-time">${v.time}</div>
      </div>
      <div class="visit-duration">${v.duration} mins</div>
    </div>
  `).join('');
}

// ============================================================
// WORKOUT MODAL
// ============================================================

function setupWorkoutModal() {
  const modal = document.getElementById('workoutModal');
  const addBtn = document.getElementById('addWorkoutBtn');
  const closeBtn = document.getElementById('closeWorkoutModal');
  const cancelBtn = document.getElementById('cancelWorkout');
  const form = document.getElementById('workoutForm');
  
  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workout = {
      type: document.getElementById('workoutType').value,
      duration: parseInt(document.getElementById('duration').value),
      calories: parseInt(document.getElementById('calories').value),
      notes: document.getElementById('notes').value,
      date: new Date().toISOString()
    };
    
    const workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.uid}`) || '[]');
    workouts.unshift(workout);
    localStorage.setItem(`workouts_${currentUser.uid}`, JSON.stringify(workouts));
    
    // Add visit record
    const visits = JSON.parse(localStorage.getItem(`visits_${currentUser.uid}`) || '[]');
    visits.unshift({
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: workout.duration
    });
    localStorage.setItem(`visits_${currentUser.uid}`, JSON.stringify(visits));
    
    form.reset();
    modal.classList.remove('active');
    loadWorkouts();
    loadVisits();
    
    showNotification('Workout logged successfully! 🎉');
  });
}

// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }
  });
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: rgba(168, 196, 40, 0.15);
    border: 1px solid rgba(168, 196, 40, 0.3);
    color: #a0c428;
    padding: 16px 24px;
    border-radius: 4px;
    font-size: 0.9rem;
    z-index: 2000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
