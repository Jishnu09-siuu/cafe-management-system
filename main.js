/**
 * ============================================================
 * MOCHA & MISO — MAIN JAVASCRIPT
 * Premium Café Website
 * Libraries: GSAP, ScrollTrigger, Lenis, SplitType
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   0. CORE INIT & ANIMATION BOOTSTRAP
   ────────────────────────────────────────────────────────── */
function initCore() {
  initNav();            // Navigation scroll + mobile menu
  initMenuFilter();     // Menu category tabs
  initGuestsSelector(); // Guests +/- buttons
  initReservationForm();// Reservation form submission
}

function initAnimationsWhenReady() {
  // All scripts are loaded with `defer`, so they are guaranteed to be
  // available by DOMContentLoaded. No polling needed.
  // A 300ms safety delay handles any rare race conditions.
  setTimeout(() => {
    try {
      if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }
        initLoader();
        initCursor();
        initSignatureImageAnimations();
        initTestimonials();
      } else {
        // GSAP failed to load (CDN down) — show page without animations
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }
    } catch (err) {
      console.warn('Animation initialization notice:', err);
    }
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCore();
    initAnimationsWhenReady();
  });
} else {
  initCore();
  initAnimationsWhenReady();
}

/* ──────────────────────────────────────────────────────────
   1. PAGE LOADER
   ────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loader-fill');

  if (!loader || !fill) {
    initLenis();
    initAnimations();
    return;
  }

  // Animate progress bar
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      fill.style.width = '100%';

      // Hide loader and start page
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.classList.add('is-hidden');
            document.body.style.overflow = '';
            initLenis();
            initAnimations();
          }
        });
      }, 400);
    } else {
      fill.style.width = progress + '%';
    }
  }, 120);

  // Lock scroll during load
  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
   ────────────────────────────────────────────────────────── */
let lenisInstance;

function initLenis() {
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Connect Lenis with GSAP ticker (handles ScrollTrigger sync automatically)
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  // NOTE: Do NOT also call ScrollTrigger.update on Lenis scroll —
  // the GSAP ticker above already handles it, double-firing causes stutter.

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenisInstance.scrollTo(target, {
          offset: -80,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   3. ALL SCROLL ANIMATIONS (GSAP + ScrollTrigger + SplitType)
   ────────────────────────────────────────────────────────── */
function initAnimations() {
  // ---- A. HERO ENTRANCE ----
  animateHeroEntrance();

  // ---- B. SCROLL REVEAL — TEXT SPLIT ----
  initTextReveal();

  // ---- C. SCROLL REVEAL — FADE IN ----
  initFadeReveal();

  // ---- D. SCROLL REVEAL — SLIDE UP ----
  initSlideUpReveal();

  // ---- E. CLIP REVEAL (images) ----
  initClipReveal();

  // ---- F. HERO PARALLAX ----
  initHeroParallax();

  // ---- G. ATMOSPHERE PARALLAX ----
  initAtmosphereParallax();

  // ---- H. MAGNETIC BUTTONS ----
  initMagneticButtons();

  // ---- I. GALLERY STAGGER ----
  initGalleryReveal();

  // ---- J. MENU CARDS STAGGER ----
  initMenuCardsReveal();
}

/* ── A. Hero entrance ─────────────────────────────────────── */
function animateHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.1 });

  // Image scale in
  tl.fromTo('#hero-img',
    { scale: 1.12 },
    { scale: 1, duration: 1.8, ease: 'power3.out' }
  );

  // Overlay fade
  tl.fromTo('.hero-overlay',
    { opacity: 0 },
    { opacity: 1, duration: 1.2, ease: 'power2.out' },
    '-=1.8'
  );

  // Eyebrow
  tl.fromTo('.hero-eyebrow',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.6'
  );

  // Hero title lines — each word
  const titleLines = document.querySelectorAll('.hero-title-line');
  if (titleLines.length > 0) {
    const splits = [];
    titleLines.forEach(line => {
      const split = new SplitType(line, { types: 'words' });
      splits.push(split);
    });

    const words = document.querySelectorAll('.hero-title-line .word');
    tl.fromTo(words,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.06
      },
      '-=0.4'
    );
  }

  // Tagline
  tl.fromTo('.hero-tagline',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.5'
  );

  // CTA buttons
  tl.fromTo('.hero-cta .btn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
    '-=0.5'
  );

  // Scroll indicator
  tl.fromTo('#scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.3'
  );
}

/* ── B. Text split reveal ────────────────────────────────── */
function initTextReveal() {
  // Get all .reveal-text NOT inside .hero (hero handles its own)
  const textEls = document.querySelectorAll('.reveal-text:not(.hero *)');

  textEls.forEach(el => {
    const splitType = el.dataset.split || 'words';
    const split = new SplitType(el, { types: splitType });
    const targets = splitType === 'chars' ? split.chars : split.words;

    if (!targets || targets.length === 0) return;

    // Wrap each char/word in overflow-hidden container
    targets.forEach(t => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';
      t.parentNode.insertBefore(wrapper, t);
      wrapper.appendChild(t);
    });

    gsap.fromTo(targets,
      { y: '110%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: splitType === 'chars' ? 0.025 : 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── C. Fade reveal ──────────────────────────────────────── */
function initFadeReveal() {
  const fadeEls = document.querySelectorAll('.reveal-fade:not(.hero *)');

  fadeEls.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── D. Slide-up reveal ─────────────────────────────────── */
function initSlideUpReveal() {
  const upEls = document.querySelectorAll('.reveal-up');

  upEls.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

/* ── E. Clip reveal (images) ────────────────────────────── */
function initClipReveal() {
  const clipEls = document.querySelectorAll('.clip-reveal');

  clipEls.forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );

    // Also scale up the inner image
    const img = el.querySelector('img');
    if (img) {
      gsap.fromTo(img,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    }
  });
}

/* ── F. Hero parallax ───────────────────────────────────── */
function initHeroParallax() {
  gsap.to('#hero-img-wrap', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    }
  });
}

/* ── G1. Signature dishes image animations ──────────────── */
function initSignatureImageAnimations() {
  const signatureItems = document.querySelectorAll('.signature-item');

  signatureItems.forEach(item => {
    const wrap = item.querySelector('.signature-image-wrap');
    const img  = item.querySelector('.signature-img');
    if (!wrap || !img) return;

    // Smooth Parallax Scroll Effect
    gsap.fromTo(img,
      { yPercent: -10, scale: 1.18 },
      {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });
}

/* ── H. Magnetic button effect ──────────────────────────── */
function initMagneticButtons() {
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach(el => {
    // Create ONE reusable quickTo tween per axis — avoids spawning hundreds
    // of new GSAP instances on every mousemove pixel
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    let rafId   = null;
    let targetX = 0;
    let targetY = 0;

    el.addEventListener('mousemove', (e) => {
      const rect    = el.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = e.clientX - cx;
      const dy      = e.clientY - cy;
      const maxDist = Math.max(rect.width, rect.height) * 0.7;
      const pull    = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / maxDist);
      targetX = dx * pull * 0.45;
      targetY = dy * pull * 0.45;

      // Throttle: only apply on the next animation frame
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          xTo(targetX);
          yTo(targetY);
          rafId = null;
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.5)' });
    });
  });
}

/* ── I. Gallery stagger reveal ──────────────────────────── */
function initGalleryReveal() {
  const galleryItems = document.querySelectorAll('.gallery-item');

  gsap.fromTo(galleryItems,
    { opacity: 0, y: 40, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.10,
      scrollTrigger: {
        trigger: '#gallery-masonry',
        start: 'top 85%',
        once: true
      }
    }
  );
}

/* ── J. Menu cards stagger ──────────────────────────────── */
function initMenuCardsReveal() {
  const cards = document.querySelectorAll('.menu-card');

  gsap.fromTo(cards,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '#menu-grid',
        start: 'top 88%',
        once: true
      }
    }
  );
}

/* ──────────────────────────────────────────────────────────
   4. CUSTOM CURSOR
   ────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: hover)').matches) {
    cursor.style.display = 'block';

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Cache element refs ONCE — querying inside RAF runs 60 DOM
    // traversals per second for elements that never change.
    const dot  = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    // Smooth cursor follow
    function animateCursor() {
      dotX  += (mouseX - dotX) * 0.85;
      dotY  += (mouseY - dotY) * 0.85;
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      if (dot)  { dot.style.transform  = `translate(${dotX}px, ${dotY}px)`; }
      if (ring) { ring.style.transform = `translate(${ringX}px, ${ringY}px)`; }

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states
    const hoverTargets = 'a, button, .menu-tab, .btn, .menu-card, .gallery-item, .testimonial-btn, .guests-btn';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Text cursor
    document.querySelectorAll('p, h1, h2, h3, blockquote').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  } else {
    cursor.style.display = 'none';
  }
}

/* ──────────────────────────────────────────────────────────
   5. NAVIGATION
   ────────────────────────────────────────────────────────── */
function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn  = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!navbar) return;

  // Scroll behaviour — throttled with RAF to avoid layout thrash on every pixel
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = Array.from(document.querySelectorAll('.nav-link'));
  let scrollRAF   = null;
  let lastScrollY = -1;

  const handleScroll = () => {
    if (scrollRAF) return;             // already scheduled — skip
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      const y = window.scrollY;
      if (y === lastScrollY) return;   // nothing changed
      lastScrollY = y;

      // Scrolled state
      navbar.classList.toggle('scrolled', y > 60);

      // Active nav link — read getBoundingClientRect in one batch
      let current = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top < 200) {
          current = sections[i].id;
          break;
        }
      }
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Stagger menu links
  gsap.fromTo('.mobile-link',
    { opacity: 0, x: -24 },
    {
      opacity: 1, x: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.07,
      delay: 0.15
    }
  );
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger  = document.getElementById('nav-hamburger');
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger && hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────
   6. MENU FILTER TABS
   ────────────────────────────────────────────────────────── */
function initMenuFilter() {
  const tabs  = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('.menu-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      // Filter and animate
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.style.display = '';
          gsap.fromTo(card,
            { opacity: 0, y: 20, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: i * 0.04 }
          );
        } else {
          gsap.to(card, {
            opacity: 0, y: 10,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   7. TESTIMONIALS SLIDER
   ────────────────────────────────────────────────────────── */
function initTestimonials() {
  const track   = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonials-dots');

  if (!track) return;

  const cards  = track.querySelectorAll('.testimonial-card');
  const total  = cards.length;
  let current  = 0;
  let autoplayTimer;

  // Determine visible count
  const getVisible = () => window.innerWidth < 640 ? 1 : 2;

  // Create dots
  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const visible = getVisible();
    const totalSlides = Math.ceil(total / visible);
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Chuyển đến mục ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i * visible));
      dotsContainer.appendChild(dot);
    }
  };

  // Update dots
  const updateDots = () => {
    if (!dotsContainer) return;
    const visible = getVisible();
    const dots    = dotsContainer.querySelectorAll('.testimonial-dot');
    const activeIndex = Math.floor(current / visible);
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === activeIndex);
      d.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
    });
  };

  // Slide to index
  const goTo = (index) => {
    const visible = getVisible();
    const max = Math.max(0, total - visible);
    current = Math.min(Math.max(0, index), max);

    const cardWidth    = cards[0].offsetWidth;
    const gapStr       = getComputedStyle(track).columnGap;
    const gap          = parseFloat(gapStr) || 32;
    const offset       = current * (cardWidth + gap);

    gsap.to(track, {
      x: -offset,
      duration: 0.7,
      ease: 'power3.out'
    });

    updateDots();
  };

  // Prev / Next
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - getVisible()); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + getVisible()); resetAutoplay(); });

  // Autoplay
  const startAutoplay = () => {
    autoplayTimer = setInterval(() => {
      const visible = getVisible();
      const max = Math.max(0, total - visible);
      if (current + visible > max) {
        goTo(0);
      } else {
        goTo(current + visible);
      }
    }, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  // Touch/drag
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current + getVisible());
      else goTo(current - getVisible());
    }
    resetAutoplay();
  });

  // Init
  createDots();
  startAutoplay();

  // Debounce resize — createDots rebuilds the DOM and goTo reads layout;
  // firing on every resize pixel causes layout thrash at 50+ calls/sec.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      createDots();
      goTo(0);
    }, 150);
  });
}

/* ──────────────────────────────────────────────────────────
   8. GUESTS SELECTOR
   ────────────────────────────────────────────────────────── */
function initGuestsSelector() {
  const minusBtn     = document.getElementById('guests-minus');
  const plusBtn      = document.getElementById('guests-plus');
  const countDisplay = document.getElementById('guests-count');
  const hiddenInput  = document.getElementById('res-guests');

  if (!minusBtn || !plusBtn) return;

  let guests = 2;
  const MIN = 1, MAX = 12;

  const update = () => {
    countDisplay.textContent = guests;
    hiddenInput.value        = guests;
    minusBtn.disabled        = guests <= MIN;
    plusBtn.disabled         = guests >= MAX;

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(countDisplay,
        { scale: 1.3, color: '#5A3E36' },
        { scale: 1,   color: '#1C1410', duration: 0.3, ease: 'back.out(3)' }
      );
    }
  };

  minusBtn.addEventListener('click', (e) => { e.preventDefault(); if (guests > MIN) { guests--; update(); } });
  plusBtn.addEventListener('click',  (e) => { e.preventDefault(); if (guests < MAX) { guests++; update(); } });
}

/* ──────────────────────────────────────────────────────────
   9. RESERVATION FORM
   ────────────────────────────────────────────────────────── */
function initReservationForm() {
  const form    = document.getElementById('reservation-form');
  const success = document.getElementById('form-success');
  const submit  = document.getElementById('res-submit');

  if (!form || !success) return;

  // Set min date to today
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Clear existing error message
  const clearFormError = () => {
    const existingErr = form.querySelector('.form-error');
    if (existingErr) existingErr.remove();
  };

  // Display validation error message
  const showValidationError = (msg) => {
    clearFormError();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-error';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.textContent = msg;

    if (submit) {
      form.insertBefore(errorMsg, submit);
    } else {
      form.appendChild(errorMsg);
    }
  };

  // Helper to trigger success transition
  const showSuccessView = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0,
        y: -15,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          form.hidden = true;
          form.style.display = 'none';
          success.hidden = false;
          success.style.display = 'block';
          gsap.fromTo(success,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          );
          gsap.fromTo('.form-success-icon',
            { scale: 0, rotation: -30 },
            { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)', delay: 0.05 }
          );
        }
      });
    } else {
      form.hidden = true;
      form.style.display = 'none';
      success.hidden = false;
      success.style.display = 'block';
      success.style.opacity = '1';
    }
  };

  // "Book Another Table" button reset logic
  const resetFormView = () => {
    form.reset();
    clearFormError();
    form.hidden = false;
    form.style.display = 'flex';
    form.style.opacity = '1';
    success.hidden = true;
    success.style.display = 'none';
    if (submit) {
      submit.disabled = false;
      const btnText = submit.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Xác nhận đặt bàn';
    }
  };

  const anotherBtn = document.getElementById('res-another-btn');
  if (anotherBtn) {
    anotherBtn.addEventListener('click', resetFormView);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError();

    // Field validation
    const name  = document.getElementById('res-name');
    const email = document.getElementById('res-email');
    const date  = document.getElementById('res-date');
    const time  = document.getElementById('res-time');

    const fields = [
      { el: name, label: 'Họ và tên' },
      { el: email, label: 'Địa chỉ email' },
      { el: date, label: 'Ngày' },
      { el: time, label: 'Giờ' }
    ];

    const missingLabels = [];
    fields.forEach(({ el, label }) => {
      if (!el || !el.value || !el.value.trim()) {
        missingLabels.push(label);
        if (el) shakeField(el);
      }
    });

    if (missingLabels.length > 0) {
      showValidationError(`Vui lòng điền đầy đủ các trường bắt buộc: ${missingLabels.join(', ')}.`);
      return;
    }

    // Submit state UI (prevent duplicate submission)
    const btnText = submit ? submit.querySelector('.btn-text') : null;
    if (btnText) btnText.textContent = 'Đang xử lý…';
    if (submit) submit.disabled = true;

    const resId = 'RES-' + Math.floor(100000 + Math.random() * 900000);
    const nowIso = new Date().toISOString();

    const reservationData = {
      reservationId: resId,
      customerName: name.value.trim(),
      name: name.value.trim(),
      email: email.value.trim(),
      phone: document.getElementById('res-phone') ? document.getElementById('res-phone').value.trim() : '',
      date: date.value,
      time: time.value,
      guests: parseInt(document.getElementById('res-guests') ? document.getElementById('res-guests').value : '2', 10) || 2,
      specialRequest: document.getElementById('res-notes') ? document.getElementById('res-notes').value.trim() : '',
      notes: document.getElementById('res-notes') ? document.getElementById('res-notes').value.trim() : '',
      status: 'pending',
      emailStatus: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Save to local backup array
    try {
      const existing = JSON.parse(localStorage.getItem('mocha_reservations') || '[]');
      existing.push(reservationData);
      localStorage.setItem('mocha_reservations', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save warning:', err);
    }

    // Async dispatch to Firestore
    const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
    if (dbInstance && typeof dbInstance.collection === 'function') {
      dbInstance.collection('reservations').add(reservationData).then((docRef) => {
        const firestoreDocId = docRef ? docRef.id : null;
        if (firestoreDocId) {
          reservationData.reservationId = firestoreDocId;
          docRef.update({ reservationId: firestoreDocId }).catch(() => {});
        }
        sendEmailJS(reservationData, 'confirmation', firestoreDocId);
        showToast('Đã tạo yêu cầu đặt bàn! Email xác nhận đang được gửi đến bạn.', 'success');
        showSuccessView();
        openSuccessModal(reservationData);
      }).catch((error) => {
        console.warn('Firestore reservation write failed:', error);
        showToast('Không thể lưu yêu cầu lên hệ thống nên chưa ghi nhận đặt bàn. Vui lòng thử lại hoặc liên hệ quán.', 'error');
      }).finally(() => {
        if (submit) submit.disabled = false;
        if (btnText) btnText.textContent = 'Xác nhận đặt bàn';
      });
    } else {
      showToast('Chưa gửi được yêu cầu: không kết nối được Firestore. Vui lòng thử lại khi có mạng.', 'error');
      if (submit) submit.disabled = false;
      if (btnText) btnText.textContent = 'Xác nhận đặt bàn';
    }
  });
}

/**
 * sendEmailJS — dispatches a transactional email via EmailJS (no backend needed).
 * Updates Firestore emailStatus to 'Sent' or 'Failed' after every attempt.
 *
 * @param {Object}      res    Reservation data object
 * @param {string}      type   'confirmation' | 'confirmed' | 'cancelled' | 'custom'
 * @param {string|null} docId  Firestore document ID — used to update emailStatus
 * @param {string}      [customBody]  Custom message body (for Reply modal)
 */
function sendEmailJS(res, type, docId, customBody) {
  const cfg = window.EMAILJS_CONFIG;
  if (!cfg || cfg.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
    console.info('[EmailJS] Credentials not configured yet — skipping email send.');
    return;
  }

  const subjectMap = {
    confirmation: 'Đã nhận yêu cầu đặt bàn — Mocha & Miso Café',
    confirmed:    'Đặt bàn đã được xác nhận — Mocha & Miso Café',
    cancelled:    'Đặt bàn đã bị hủy — Mocha & Miso Café',
    custom:       'Tin nhắn từ Mocha & Miso Café'
  };

  const bodyMap = {
    confirmation: 'Cảm ơn bạn đã chọn Mocha & Miso! Chúng tôi đã nhận yêu cầu đặt bàn và sẽ sớm xác nhận.',
    confirmed:    'Tin vui! Đội ngũ của chúng tôi đã xác nhận đặt bàn. Rất mong được đón tiếp bạn!',
    cancelled:    'Rất tiếc, yêu cầu đặt bàn của bạn đã bị hủy. Vui lòng liên hệ với chúng tôi nếu bạn muốn đặt lại.',
    custom:       customBody || ''
  };

  const templateParams = {
    to_email:        res.email || '',
    customer_name:   res.customerName || res.name || 'Quý khách',
    reservation_id:  res.reservationId || res.id || 'N/A',
    date:            res.date || 'TBD',
    time:            formatTime(res.time) || res.time || 'TBD',
    guests:          String(res.guests || 2),
    special_request: res.specialRequest || res.notes || 'Không có',
    subject:         subjectMap[type] || subjectMap.confirmation,
    message_body:    bodyMap[type] || bodyMap.confirmation,
    cafe_address:    '124 Artisan Alley, Craft District',
    cafe_phone:      '(555) 234-5678',
    maps_link:       'https://maps.google.com/?q=124+Artisan+Alley+Craft+District'
  };

  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);

  function updateEmailStatus(status) {
    if (docId && !String(docId).startsWith('local_') && dbInstance && typeof dbInstance.collection === 'function') {
      dbInstance.collection('reservations').doc(docId).update({
        emailStatus: status,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    }
  }

  emailjs.send(cfg.serviceId, cfg.templateId, templateParams)
    .then(() => {
      console.log('[EmailJS] Email sent to', res.email);
      updateEmailStatus('Sent');
    })
    .catch(err => {
      console.warn('[EmailJS] Email send failed (reservation still saved):', err);
      updateEmailStatus('Failed');
    });
}

// Expose globally so admin.js can also call it
window.sendEmailJS = sendEmailJS;

// Global Helper Functions for Modal & Toast Notifications
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hourText, minuteText] = timeStr.includes(':')
    ? timeStr.split(':')
    : [timeStr.substring(0, 2), timeStr.substring(2)];
  const hours = Number.parseInt(hourText, 10);
  if (!Number.isFinite(hours) || !/^\d{2}$/.test(minuteText)) return timeStr;

  const period = hours < 11 ? 'sáng' : hours < 13 ? 'trưa' : hours < 18 ? 'chiều' : 'tối';
  return `${hours % 12 || 12}:${minuteText} ${period}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  toast.innerHTML = `
    <span style="font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openSuccessModal(res) {
  const modal = document.getElementById('reservation-success-modal');
  if (!modal) return;

  const resIdEl = document.getElementById('modal-res-id');
  const nameEl = document.getElementById('modal-res-name');
  const dateEl = document.getElementById('modal-res-date');
  const timeEl = document.getElementById('modal-res-time');
  const guestsEl = document.getElementById('modal-res-guests');

  if (resIdEl) resIdEl.textContent = res.reservationId || res.id || 'CONFIRMED';
  if (nameEl) nameEl.textContent = res.customerName || res.name || 'Quý khách';
  if (dateEl) dateEl.textContent = res.date || 'Hôm nay';
  if (timeEl) timeEl.textContent = formatTime(res.time) || res.time || '';
  if (guestsEl) guestsEl.textContent = `${res.guests || 2} khách`;

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  const closeIcon = document.getElementById('res-modal-close-icon');
  const viewBtn = document.getElementById('res-modal-view-btn');
  const homeBtn = document.getElementById('res-modal-home-btn');

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeIcon) closeIcon.onclick = closeModal;
  if (viewBtn) {
    viewBtn.onclick = () => {
      closeModal();
      const resSec = document.getElementById('reservation');
      if (resSec) resSec.scrollIntoView({ behavior: 'smooth' });
    };
  }
  if (homeBtn) {
    homeBtn.onclick = () => {
      closeModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}

// Field shake animation on validation error
function shakeField(field) {
  field.style.borderColor = '#B85C50';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(field,
      { x: 0 },
      {
        x: 8,
        duration: 0.07,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 5
      }
    );
  }
  const clearBorder = () => { field.style.borderColor = ''; };
  field.addEventListener('input', clearBorder, { once: true });
  field.addEventListener('change', clearBorder, { once: true });
}

/* ──────────────────────────────────────────────────────────
   10. MISC: DATE INPUT minimum date set
   ────────────────────────────────────────────────────────── */
// (Already handled inside initReservationForm)
