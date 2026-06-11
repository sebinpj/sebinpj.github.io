import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = 'power3.out';

function heroIntro() {
  const title = document.getElementById('hero-title');
  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });

  gsap
    .timeline({ defaults: { ease: EASE } })
    .from('#hero-kicker', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.1)
    .from(split.lines, { yPercent: 110, duration: 1.0, stagger: 0.09 }, 0.25)
    .from('.hero__sub', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.7)
    .from('.hero__scroll-cue', { autoAlpha: 0, duration: 0.9 }, 1.1);
}

function chapterReveals() {
  gsap.utils.toArray('.chapter:not(.chapter--hero)').forEach((section) => {
    const targets = section.querySelectorAll(
      [
        '.chapter__index',
        '.chapter__title',
        '.chapter__role',
        '.chapter__body p',
        '.stat-hero',
        '.merge-line',
        '.stat',
        '.chip',
        '.project-card',
        '.contact__email-wrap',
        '.contact__links li',
        '.colophon',
      ].join(','),
    );
    gsap.from(targets, {
      y: 26,
      autoAlpha: 0,
      duration: 0.9,
      ease: EASE,
      stagger: 0.07,
      scrollTrigger: { trigger: section, start: 'top 72%' },
    });
  });
}

function downloadsCounter() {
  const el = document.getElementById('downloads-counter');
  if (!el) return;
  const target = Number(el.dataset.target);
  const counter = { v: 0 };
  gsap.to(counter, {
    v: target,
    ease: 'none',
    scrollTrigger: { trigger: '#psctalks', start: 'top 80%', end: 'top 20%', scrub: 0.6 },
    onUpdate: () => {
      el.textContent = Math.round(counter.v).toLocaleString('en-US');
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
