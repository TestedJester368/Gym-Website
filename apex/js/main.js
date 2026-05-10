/* ============================================================
   APEX GYM — main.js
   Sections:
   1. Custom Cursor
   2. Smooth Nav Shrink on Scroll
   3. Scroll-triggered Fade-in (Intersection Observer)
   4. Mobile Nav Toggle (ready to wire up)
   5. Auth UI Management
============================================================ */


/* ============================================================
   1. CUSTOM CURSOR
   - Follows mouse position
   - Expands on hoverable elements
============================================================ */
const cursor = document.getElementById('cursor');

if (cursor) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Expand cursor on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .plan-card');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });
}


/* ============================================================
   2. NAV — SHRINK ON SCROLL
   Adds a `.scrolled` class to <nav> once the user scrolls
   past 60px. Hook extra styles in CSS with nav.scrolled {} 
============================================================ */
const nav = document.querySelector('nav');

if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}


/* ============================================================
   3. SCROLL-TRIGGERED FADE-IN
   Any element with class `.reveal` will fade up into view
   when it enters the viewport.

   Usage in HTML:  <div class="reveal"> ... </div>
   Add to CSS:
     .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
     .reveal.visible { opacity: 1; transform: translateY(0); }
============================================================ */
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}


/* ============================================================
   4. MOBILE NAV TOGGLE
   Wire this up when you add a hamburger button to the HTML.
============================================================ */

/*
const navToggle   = document.getElementById('navToggle');
const navLinks    = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.setAttribute(
      'aria-expanded',
      navLinks.classList.contains('open')
    );
  });
}
*/


/* ============================================================
   5. AUTH UI MANAGEMENT
   Handle login/join button redirects
============================================================ */

function initAuthUI() {
  // Skip auth UI setup if admin is logged in (admin pages have their own setup)
  const isAdmin = localStorage.getItem('adminToken');
  if (isAdmin) {
    return;
  }

  const isLoggedIn = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const navCta = document.querySelector('.nav-cta');
  
  if (navCta) {
    if (isLoggedIn && user) {
      // User is logged in
      navCta.textContent = `${user.fullName || user.email.split('@')[0]}`;
      navCta.href = '#';
      navCta.style.cursor = 'pointer';
      navCta.addEventListener('click', (e) => {
        e.preventDefault();
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
          logout();
        }
      });
    } else {
      // User not logged in
      navCta.textContent = 'Join Now';
      navCta.href = 'pages/login.html';
    }
  }

  // Handle all CTA buttons
  const ctaBtns = document.querySelectorAll('.btn-primary, .btn-ghost');
  ctaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Only redirect if not already a link to login
      if (!btn.href.includes('login') && btn.getAttribute('href') !== '#') {
        if (!isLoggedIn) {
          e.preventDefault();
          window.location.href = 'pages/login.html';
        }
      }
    });
  });
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.reload();
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
