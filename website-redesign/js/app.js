/* ─────────────────────────────────────────────
   6 to 9 Dental — app.js
   Scroll reveals · Mobile nav · Form handling
   ───────────────────────────────────────────── */

/* ── STICKY NAV ── */
const header = document.getElementById('site-header');

function updateNav() {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── MOBILE NAV TOGGLE ── */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);

  // Animate hamburger → X
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    const spans = navToggle.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ── SCROLL REVEAL ── */
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);

    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);

    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* ── CONTACT FORM ── */
const form        = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    // Simulate send (replace with real endpoint)
    await new Promise(resolve => setTimeout(resolve, 1200));

    formSuccess.classList.add('visible');
    form.querySelectorAll('input, textarea').forEach(el => {
      el.value = '';
    });

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Scroll to success message
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height'), 10) || 80;

    window.scrollTo({
      top: target.offsetTop - offset,
      behavior: 'smooth'
    });
  });
});

/* ── AWARD YEARS STAGGER ANIMATION ── */
const awardBadges = document.querySelectorAll('.award-year-badge');

if (awardBadges.length) {
  const badgeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      awardBadges.forEach((badge, i) => {
        setTimeout(() => {
          badge.style.opacity   = '1';
          badge.style.transform = 'scale(1)';
        }, i * 80);
      });

      badgeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  // Set initial hidden state
  awardBadges.forEach(badge => {
    badge.style.opacity   = '0';
    badge.style.transform = 'scale(0.8)';
    badge.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)';
  });

  badgeObserver.observe(awardBadges[0].closest('.award-streak'));
}

/* ── STAT COUNTER (the "6" in Dr. Humphrey section) ── */
function animateCounter(el, from, to, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statNumber = document.querySelector('.stat-number');
if (statNumber) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target, 0, 6, 1200);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  statNumber.textContent = '0';
  counterObserver.observe(statNumber);
}

/* ── TRUST BAR PAUSE ON HOVER (already via CSS, JS fallback) ── */
const trustTrack = document.querySelector('.trust-track');
if (trustTrack) {
  trustTrack.addEventListener('mouseenter', () => {
    trustTrack.style.animationPlayState = 'paused';
  });
  trustTrack.addEventListener('mouseleave', () => {
    trustTrack.style.animationPlayState = 'running';
  });
}
