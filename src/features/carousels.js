/**
 * Hero Carousel + Scroll Reveal
 * Carregar na página inicial (index.html)
 */
(function () {
  'use strict';

  const HERO_AUTOPLAY_MS = 5500;

  function initHeroCarousel() {
    const carousel = document.getElementById('hero-carousel');
    const track = document.getElementById('hero-carousel-track');
    const slides = carousel?.querySelectorAll('.hero-carousel__slide') || [];
    const dots = carousel?.querySelectorAll('.hero-carousel__dot') || [];
    const btnPrev = document.getElementById('hero-carousel-prev');
    const btnNext = document.getElementById('hero-carousel-next');

    if (!track || !slides.length) return;

    let current = 0;
    let autoplayTimer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
      resetAutoplay();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function resetAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, HERO_AUTOPLAY_MS);
    }

    function pauseAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    btnNext?.addEventListener('click', () => { next(); });
    btnPrev?.addEventListener('click', () => { prev(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    carousel?.addEventListener('mouseenter', pauseAutoplay);
    carousel?.addEventListener('mouseleave', resetAutoplay);

    // Keyboard (apenas se não estiver num input)
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    // Touch swipe
    let touchStartX = 0;
    carousel?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel?.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) prev();
        else next();
      }
    }, { passive: true });

    resetAutoplay();
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initCardsCarouselNav() {
    const track = document.getElementById('cards-carousel-track');
    const btnLeft = document.getElementById('cards-carousel-prev');
    const btnRight = document.getElementById('cards-carousel-next');
    if (!track || (!btnLeft && !btnRight)) return;

    const cardWidth = 320 + 24; // card width + gap
    function scroll(direction) {
      track.scrollBy({ left: direction * cardWidth * 2, behavior: 'smooth' });
    }
    btnLeft?.addEventListener('click', () => scroll(-1));
    btnRight?.addEventListener('click', () => scroll(1));
  }

  function initHeaderScroll() {
    const header = document.querySelector('header[role="banner"]');
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || window.pageYOffset;
      if (y > 60) {
        header.classList.add('header-scrolled');
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        header.classList.remove('header-scrolled');
        header.style.boxShadow = '';
      }
      lastScroll = y;
    }, { passive: true });
  }

  function init() {
    initHeroCarousel();
    initScrollReveal();
    initCardsCarouselNav();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
