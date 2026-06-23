/* ============================================================
   CJ Grande by Sterling Hotels & Resorts — MAIN JS
   Scroll Observer · Parallax · Navigation · Scroll Transitions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Add body class for entrance transition
  document.body.classList.add('page-transition-in');

  // --- NAVBAR SCROLL BEHAVIOR ---
  const nav = document.querySelector('.nav');
  const checkScroll = () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };
  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Initial check

  // --- MOBILE NAV TOGGLE ---
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      // Lock scroll when open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close via ✕ button inside the overlay
    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu when links are clicked
    mobileMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // --- ACTIVE LINK DECORATION ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // --- INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll(
    '.fade-up, .fade-in, .fade-left, .fade-right, .scale-in, .gold-divider, .img-reveal'
  );
  elementsToAnimate.forEach(el => animationObserver.observe(el));

  // --- PARALLAX EFFECT FOR HERO IMAGE ---
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      const speed = 0.4; // Speed ratio (0.1 - 0.5)
      heroBg.style.transform = `translateY(${scrollPos * speed}px)`;
    });
  }

  // --- STATS STRIP COUNTER ANIMATION ---
  const statsSection = document.querySelector('.stats-strip');
  if (statsSection) {
    const statsValues = document.querySelectorAll('.counter-value');
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    statsObserver.observe(statsSection);

    function animateCounters() {
      statsValues.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const isFloat = !Number.isInteger(target);
        
        if (isFloat) {
          const steps = 40; // Number of steps for float animation
          const stepTime = duration / steps;
          const increment = target / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target.toFixed(1);
              clearInterval(timer);
            } else {
              counter.textContent = current.toFixed(1);
            }
          }, stepTime);
        } else {
          const stepTime = Math.abs(Math.floor(duration / target));
          let current = 0;
          
          const timer = setInterval(() => {
            current += 1;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = current;
            }
          }, stepTime);
        }
      });
    }
  }
});
