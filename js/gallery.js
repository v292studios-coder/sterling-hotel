/* ============================================================
   Sterling Hotels and Resorts — GALLERY & LIGHTBOX ENGINE
   Masonry Filter · Lightbox Navigation · Key Controls
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.gallery-grid__item, .gallery-strip__item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (!lightbox) return;

  let currentIndex = 0;
  let activeImages = [];

  // Populate activeImages list from DOM elements
  const updateActiveImages = () => {
    // Collect visible images in current layout
    activeImages = Array.from(document.querySelectorAll('.gallery-grid__item:not([style*="display: none"]), .gallery-strip__item')).map(item => {
      const img = item.querySelector('img');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || 'Sterling Hotels and Resorts Gallery'
      };
    });
  };

  const showImage = (index) => {
    if (index < 0) index = activeImages.length - 1;
    if (index >= activeImages.length) index = 0;
    currentIndex = index;

    const data = activeImages[currentIndex];
    if (data) {
      lightboxImg.setAttribute('src', data.src);
      lightboxImg.setAttribute('alt', data.alt);
      if (lightboxCaption) {
        lightboxCaption.textContent = data.alt;
      }
    }
  };

  const openLightbox = (src) => {
    updateActiveImages();
    const index = activeImages.findIndex(img => img.src === src);
    if (index !== -1) {
      showImage(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Bind click event to gallery items
  document.body.addEventListener('click', (e) => {
    const galleryItem = e.target.closest('.gallery-grid__item, .gallery-strip__item');
    if (galleryItem) {
      e.preventDefault();
      const img = galleryItem.querySelector('img');
      if (img) {
        openLightbox(img.getAttribute('src'));
      }
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
  
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  // --- GALLERY PAGE FILTERS ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryGridItems = document.querySelectorAll('.gallery-grid__item');

  if (filterButtons.length > 0 && galleryGridItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Toggle active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        galleryGridItems.forEach(item => {
          const categories = item.getAttribute('data-category').split(' ');
          if (filter === 'all' || categories.includes(filter)) {
            item.style.display = 'block';
            // Trigger animation on visible items
            setTimeout(() => {
              item.classList.add('animated');
            }, 50);
          } else {
            item.style.display = 'none';
          }
        });
        updateActiveImages();
      });
    });
  }
});
