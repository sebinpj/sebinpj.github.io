import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Cartoon physics: everything overshoots a little, stickers pop.
const EASE_TEXT = 'back.out(1.4)';
const EASE_POP = 'back.out(2.2)';

// Copy blocks slide up with a small overshoot…
const TEXT_TARGETS = ['.chapter__title', '.chapter__body p', '.contact__email-wrap'];
// …while sticker-styled pieces pop in from scale 0 with a wiggle.
const POP_TARGETS = [
  '.chapter__index',
  '.chapter__role',
  '.stat-hero',
  '.merge-line > span',
  '.stat',
  '.chip',
  '.project-card',
  '.contact__links li',
  '.colophon',
];

function heroIntro() {
  const title = document.getElementById('hero-title');
  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });

  gsap
    .timeline()
    .from('#hero-kicker', { y: 16, autoAlpha: 0, duration: 0.7, ease: EASE_TEXT }, 0.1)
    .from(split.lines, { yPercent: 115, duration: 0.9, stagger: 0.09, ease: 'back.out(1.2)' }, 0.2)
    .from('.hero__sub', { y: 20, autoAlpha: 0, duration: 0.7, ease: EASE_TEXT }, 0.7)
    .from('.hero__scroll-cue', { scale: 0, rotation: -6, autoAlpha: 0, duration: 0.6, ease: EASE_POP }, 1.0);
}

function chapterReveals() {
  gsap.utils.toArray('.chapter:not(.chapter--hero)').forEach((section) => {
    const text = section.querySelectorAll(TEXT_TARGETS.join(','));
    const pops = section.querySelectorAll(POP_TARGETS.join(','));
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 72%' },
      defaults: { duration: 0.7 },
    });
    if (text.length) {
      tl.from(text, { y: 30, autoAlpha: 0, ease: EASE_TEXT, stagger: 0.09 }, 0);
    }
    if (pops.length) {
      tl.from(
        pops,
        {
          scale: 0,
          autoAlpha: 0,
          rotation: (i) => (i % 2 ? 7 : -7),
          transformOrigin: '50% 60%',
          ease: EASE_POP,
          stagger: 0.05,
          /* stickers keep their CSS resting tilt + hover transforms */
          clearProps: 'transform',
        },
        0.08,
      );
    }
  });
}

// The one time-based, non-scrubbed effect on the page: a confetti pop when
// the download counter lands on 500k. Everything else is a pure function of
// scroll, but a celebration that runs backwards isn't a celebration.
const CONFETTI = ['#f07a5f', '#f4b942', '#53b8b0', '#a672d8', '#f08bb8', '#6fb1ea'];

function confettiBurst(anchor) {
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 26; i += 1) {
    const bit = document.createElement('span');
    bit.className = 'confetti-bit';
    bit.style.background = CONFETTI[i % CONFETTI.length];
    if (i % 3 === 0) bit.style.borderRadius = '50%';
    bit.style.left = `${cx}px`;
    bit.style.top = `${cy}px`;
    document.body.appendChild(bit);
    const dx = gsap.utils.random(-170, 170);
    const dy = gsap.utils.random(-240, -90);
    gsap.to(bit, { x: dx, rotation: gsap.utils.random(-540, 540), duration: 1.35, ease: 'power1.out' });
    gsap.to(bit, { y: dy, duration: 0.5, ease: 'power2.out' });
    gsap.to(bit, {
      y: dy + 330,
      autoAlpha: 0,
      duration: 0.85,
      delay: 0.5,
      ease: 'power1.in',
      onComplete: () => bit.remove(),
    });
  }
}

function downloadsCounter() {
  const el = document.getElementById('downloads-counter');
  if (!el) return;
  const target = Number(el.dataset.target);
  const counter = { v: 0 };
  let celebrated = false;
  gsap.to(counter, {
    v: target,
    ease: 'none',
    scrollTrigger: { trigger: '#psctalks', start: 'top 80%', end: 'top 20%', scrub: 0.6 },
    onUpdate: () => {
      el.textContent = Math.round(counter.v).toLocaleString('en-US');
      if (!celebrated && counter.v >= target) {
        celebrated = true;
        confettiBurst(el);
      }
    },
  });
}

function pipelineSequence() {
  const steps = gsap.utils.toArray('#magnit-data .pipeline [data-step]');
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: '#magnit-data',
      start: `top ${62 - i * 14}%`,
      onEnter: () => step.classList.add('is-lit'),
      onLeaveBack: () => step.classList.remove('is-lit'),
    });
  });
}

export function initSectionReveals() {
  heroIntro();
  chapterReveals();
  downloadsCounter();
  pipelineSequence();
}
