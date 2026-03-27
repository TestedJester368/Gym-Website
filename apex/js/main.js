/* ============================================================
   APEX GYM — main.js
   Sections:
   1. Custom Cursor
   2. Smooth Nav Shrink on Scroll
   3. Scroll-triggered Fade-in (Intersection Observer)
   4. Mobile Nav Toggle (ready to wire up)
============================================================ */


/* ============================================================
   1. CUSTOM CURSOR
   - Follows mouse position
   - Expands on hoverable elements
============================================================ */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Expand cursor on interactive elements
const hoverTargets = document.querySelectorAll('a, button, .plan-card');

hoverTargets.forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
});


/* ============================================================
   2. NAV — SHRINK ON SCROLL
   Adds a `.scrolled` class to <nav> once the user scrolls
   past 60px. Hook extra styles in CSS with nav.scrolled {} 
============================================================ */
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});


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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing once revealed (one-time animation)
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));


/* ============================================================
   4. MOBILE NAV TOGGLE
   Wire this up when you add a hamburger button to the HTML.

   HTML to add inside <nav>:
     <button class="nav-hamburger" id="navToggle" aria-label="Toggle menu">☰</button>

   Then uncomment the block below:
============================================================ */

/*
const navToggle   = document.getElementById('navToggle');
const navLinks    = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute(
    'aria-expanded',
    navLinks.classList.contains('open')
  );
});
*/
