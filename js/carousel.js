/* ============================================================
   CJ Grande by Sterling Hotels & Resorts — TESTIMONIAL CAROUSEL
   Autoplay · Touch Swipe Support · Indicator Controls
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoplayInterval;
  const slideDuration = 6000; // 6 seconds

  // --- BUILD CAROUSEL DOTS ---
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial slide ${index + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.carousel-dot');

  const goToSlide = (index) => {
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
  };

  const nextSlide = () => {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    goToSlide(next);
  };

  const prevSlide = () => {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    goToSlide(prev);
  };

  // --- AUTOPLAY MANAGEMENT ---
  const startAutoplay = () => {
    autoplayInterval = setInterval(nextSlide, slideDuration);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  startAutoplay();

  // Pause on hover
  const carouselContainer = document.querySelector('.testimonial-carousel');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);
  }

  // --- SWIPE SUPPORT FOR MOBILE ---
  let touchStartX = 0;
  let touchEndX = 0;

  if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50; // pixels
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe Left -> Next
      nextSlide();
      resetAutoplay();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe Right -> Prev
      prevSlide();
      resetAutoplay();
    }
  }
});
