import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins safely on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroAnimationRefs {
  heroContainer: HTMLElement | null;
  logoWrapper: SVGSVGElement | null;
  letters: (SVGElement | null)[];
  blocks: (SVGElement | null)[];
  textElements: (HTMLElement | null)[];
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initializes the full GSAP timeline for the Just Born Hero section:
 * - Entrance sequence with staggered letter placement
 * - Toy number blocks pop-in
 * - Ambient micro-floating idle loop
 * - Mouse parallax with gsap.quickTo()
 * - ScrollTrigger scrub
 */
export function initJustBornHeroAnimation(refs: HeroAnimationRefs): () => void {
  const { heroContainer, logoWrapper, letters, blocks, textElements } = refs;
  if (!heroContainer || !logoWrapper) return () => {};

  const reducedMotion = prefersReducedMotion();

  // Create isolated GSAP Context for 100% clean teardown
  const ctx = gsap.context(() => {
    // ----------------------------------------------------
    // 1. REDUCED MOTION FALLBACK
    // ----------------------------------------------------
    if (reducedMotion) {
      gsap.set([heroContainer, logoWrapper, ...letters, ...blocks, ...textElements], {
        opacity: 1,
        visibility: 'visible',
      });
      return;
    }

    // ----------------------------------------------------
    // 2. INITIAL STATE SETUP
    // ----------------------------------------------------
    const validLetters = letters.filter(Boolean) as SVGElement[];
    const validBlocks = blocks.filter(Boolean) as SVGElement[];
    const validText = textElements.filter(Boolean) as HTMLElement[];

    // Set initial hidden transforms
    gsap.set(heroContainer, { opacity: 0 });
    gsap.set(logoWrapper, { opacity: 0, scale: 0.84, y: 50 });
    
    // Natural subtle storefront rotations for each letter
    const naturalRotations = [-2, 1, -1, 1.5, -1, 1, -1.2, 1];

    validLetters.forEach((el, i) => {
      const naturalRot = naturalRotations[i % naturalRotations.length];
      gsap.set(el, {
        opacity: 0,
        y: 70,
        scale: 0.88,
        rotation: naturalRot + (i % 2 === 0 ? -6 : 6),
        transformOrigin: '50% 50%',
      });
    });

    // Set initial block states
    if (validBlocks[0]) {
      gsap.set(validBlocks[0], { opacity: 0, x: -25, y: -35, rotation: -20, transformOrigin: '50% 50%' });
    }
    if (validBlocks[1]) {
      gsap.set(validBlocks[1], { opacity: 0, y: -45, rotation: 14, transformOrigin: '50% 50%' });
    }
    if (validBlocks[2]) {
      gsap.set(validBlocks[2], { opacity: 0, x: 30, y: -25, rotation: 22, transformOrigin: '50% 50%' });
    }

    gsap.set(validText, { opacity: 0, y: 24 });

    // ----------------------------------------------------
    // 3. MASTER ENTRANCE TIMELINE
    // ----------------------------------------------------
    const masterTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        // Start organic micro-floating idle loop once entrance completes
        startMicroFloating();
      }
    });

    // Phase 1: Background fades in
    masterTl.to(heroContainer, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, 0);

    // Phase 2: Logo container glides in
    masterTl.to(logoWrapper, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
    }, 0.15);

    // Phase 3: Staggered physical placement of letters onto the sign
    validLetters.forEach((letterEl, i) => {
      const naturalRot = naturalRotations[i % naturalRotations.length];
      masterTl.to(letterEl, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: naturalRot,
        duration: 0.95,
        ease: 'back.out(1.5)',
      }, 0.25 + i * 0.08);
    });

    // Phase 4: Number blocks pop in like toy cubes
    if (validBlocks[0]) {
      masterTl.to(validBlocks[0], {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: -14,
        duration: 0.85,
        ease: 'back.out(1.7)',
      }, 0.8);
    }
    if (validBlocks[1]) {
      masterTl.to(validBlocks[1], {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 8,
        duration: 0.85,
        ease: 'back.out(1.7)',
      }, 0.9);
    }
    if (validBlocks[2]) {
      masterTl.to(validBlocks[2], {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 16,
        duration: 0.85,
        ease: 'back.out(1.7)',
      }, 1.0);
    }

    // Phase 5: Tagline, CTAs and trust badges fade in
    masterTl.to(validText, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power2.out',
    }, 1.05);

    // ----------------------------------------------------
    // 4. MICRO FLOATING IDLE MOTION
    // ----------------------------------------------------
    function startMicroFloating() {
      // Gentle organic float on letters
      validLetters.forEach((letterEl, i) => {
        const floatDuration = 3.2 + (i % 3) * 0.7;
        const yOffset = (i % 2 === 0 ? 1 : -1) * (3 + (i % 3));
        const rotOffset = (i % 2 === 0 ? 0.4 : -0.4);

        gsap.to(letterEl, {
          y: `+=${yOffset}`,
          rotation: `+=${rotOffset}`,
          duration: floatDuration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: (i * 0.15) % 0.8,
        });
      });

      // Gentle floating on blocks
      validBlocks.forEach((blockEl, i) => {
        gsap.to(blockEl, {
          y: (i % 2 === 0 ? -4 : 4),
          rotation: (i === 0 ? -12 : i === 1 ? 11 : 18),
          duration: 2.8 + i * 0.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.2,
        });
      });
    }

    // ----------------------------------------------------
    // 5. MOUSE PARALLAX (Desktop only, 60fps with quickTo)
    // ----------------------------------------------------
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const logoQuickX = gsap.quickTo(logoWrapper, 'x', { duration: 0.6, ease: 'power2.out' });
      const logoQuickY = gsap.quickTo(logoWrapper, 'y', { duration: 0.6, ease: 'power2.out' });

      const blockQuickX = validBlocks.map(b => gsap.quickTo(b, 'x', { duration: 0.8, ease: 'power2.out' }));
      const blockQuickY = validBlocks.map(b => gsap.quickTo(b, 'y', { duration: 0.8, ease: 'power2.out' }));

      const handleMouseMove = (e: MouseEvent) => {
        const rect = heroContainer.getBoundingClientRect();
        const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        // Logo moves subtly
        logoQuickX(relX * 10);
        logoQuickY(relY * 7);

        // Blocks have slightly more float depth
        blockQuickX.forEach((fn, idx) => fn(relX * (14 + idx * 3)));
        blockQuickY.forEach((fn, idx) => fn(relY * (10 + idx * 2)));
      };

      const handleMouseLeave = () => {
        logoQuickX(0);
        logoQuickY(0);
        blockQuickX.forEach(fn => fn(0));
        blockQuickY.forEach(fn => fn(0));
      };

      heroContainer.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroContainer.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // ----------------------------------------------------
    // 6. SCROLLTRIGGER SCRUB (Subtle scale and rise on scroll)
    // ----------------------------------------------------
    ScrollTrigger.create({
      trigger: heroContainer,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress;
        // Smoothly scale down and lift logo as user scrolls down
        gsap.to(logoWrapper, {
          scale: 1 - progress * 0.16, // 1 -> 0.84
          y: -progress * 75,
          opacity: 1 - progress * 0.72, // 1 -> 0.28
          duration: 0.1,
          overwrite: 'auto',
        });
      },
    });

  }, heroContainer);

  return () => {
    ctx.revert(); // Full GSAP cleanup
  };
}
