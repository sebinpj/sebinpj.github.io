import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { glState, CHAPTER_HUES } from './state.js';
import { initSectionReveals } from './sections.js';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const sections = gsap.utils.toArray('[data-chapter]');
  const dots = [...document.querySelectorAll('#chapter-dots span')];
  const root = document.documentElement;

  // --- Chapter morph driver -------------------------------------------------
  // Each section's approach scrubs chapterProgress from i-1 → i and slides the
  // accent hue with it. fromTo keeps every tween deterministic when scrubbing
  // backwards through the whole story.
  sections.forEach((section, i) => {
    if (i === 0) return;
    gsap.fromTo(
      glState,
      { chapterProgress: i - 1, accentH: CHAPTER_HUES[i - 1] },
      {
        chapterProgress: i,
        accentH: CHAPTER_HUES[i],
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 20%',
          scrub: 0.8,
        },
        onUpdate: () => root.style.setProperty('--accent-h', glState.accentH.toFixed(1)),
      },
    );
  });

  // Overall page progress, for slow global camera drift in the GL layer.
  ScrollTrigger.create({
    start: 0,
    end: () => ScrollTrigger.maxScroll(window),
    onUpdate: (self) => {
      glState.pageProgress = self.progress;
      glState.scrollVelocity = self.getVelocity() / 4000;
    },
  });

  // --- Progress dots --------------------------------------------------------
  sections.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) {
          dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
        }
      },
    });
  });

  initSectionReveals();

  // Font metrics shift trigger positions; re-measure once fonts settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
