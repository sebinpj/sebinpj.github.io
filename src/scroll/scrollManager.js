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
  // Each section's approach scrubs its own 0→1 segment; chapterProgress is the
  // SUM of the segments. Tweens writing the shared value directly break on
  // multi-chapter jumps (anchor links, Home/End) — several scrubs animate at
  // once and the last one to finish wins. A sum is order-independent.
  const segs = sections.map(() => ({ v: 0 }));
  const lastHue = CHAPTER_HUES.length - 1;
  const syncState = () => {
    let cp = 0;
    for (let i = 1; i < segs.length; i += 1) cp += segs[i].v;
    glState.chapterProgress = cp;
    const ia = Math.min(Math.floor(cp), lastHue);
    const a = CHAPTER_HUES[ia];
    glState.accentH = a + (CHAPTER_HUES[Math.min(ia + 1, lastHue)] - a) * (cp - ia);
    root.style.setProperty('--accent-h', glState.accentH.toFixed(1));
  };
  sections.forEach((section, i) => {
    if (i === 0) return;
    // The final section can never scroll its top to 20% of the viewport —
    // the page ends first — so its scrub finishes higher up.
    const isLast = i === sections.length - 1;
    gsap.fromTo(
      segs[i],
      { v: 0 },
      {
        v: 1,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: isLast ? 'top 45%' : 'top 20%',
          scrub: 0.8,
        },
        onUpdate: syncState,
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
