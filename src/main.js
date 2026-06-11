import './styles/tokens.css';
import './styles/typography.css';
import './styles/base.css';
import './styles/sections.css';

import { formatCareerDuration } from './utils/duration.js';
import { prefersReducedMotion, saveData, webgl2Supported, onIdle } from './utils/env.js';

document.documentElement.classList.add('js');

// Live experience counter (was moment.js on the old site).
const experienceEl = document.getElementById('experience');
if (experienceEl) experienceEl.textContent = formatCareerDuration();

// Header gains a backdrop once the hero is passed.
const header = document.getElementById('site-header');
let headerScrolled = false;
addEventListener(
  'scroll',
  () => {
    const scrolled = scrollY > innerHeight * 0.6;
    if (scrolled !== headerScrolled) {
      headerScrolled = scrolled;
      header.classList.toggle('is-scrolled', scrolled);
    }
  },
  { passive: true },
);

// Smooth in-page anchor navigation (CSS scroll-behavior is intentionally off).
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.hash);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
});

// Chapter progress dots (decorative, synced by the scroll manager).
const dotsNav = document.getElementById('chapter-dots');
const chapters = [...document.querySelectorAll('[data-chapter]')];
chapters.forEach(() => dotsNav.appendChild(document.createElement('span')));

// Motion layer (GSAP) — skipped entirely under reduced motion.
if (!prefersReducedMotion()) {
  import('./scroll/scrollManager.js').then(({ initScroll }) => initScroll());
}

// WebGL layer — lazy, idle, and only where it can actually run well.
if (!prefersReducedMotion() && !saveData() && webgl2Supported()) {
  onIdle(() => {
    import('./gl/Experience.js')
      .then(({ startExperience }) => startExperience(document.getElementById('gl')))
      .catch(() => {
        /* fallback nebula stays — page is fully usable without GL */
      });
  });
}
