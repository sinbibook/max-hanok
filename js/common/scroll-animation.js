const applyScrollAnimationTargets = () => {
    const selectors = [
      'main section',
      'main .tableSection',
      'main .heroDescription',
      'main .gallery',
      'main .con2Top',
      'main .con2Bottom'
    ];
  
    const baseTargets = document.querySelectorAll(selectors.join(','));
    baseTargets.forEach(element => {
      if (element.tagName === 'SECTION' && element.querySelector('.fBanner')) {
        return;
      }
      if (!element.dataset.animate) {
        element.dataset.animate = 'fade-up';
      }
    });
  
    const staggerTargets = document.querySelectorAll('[data-gallery-stagger] .specialGalleryItem');
    staggerTargets.forEach((item, index) => {
      item.dataset.animate = 'fade-up';
      item.dataset.animateDelay = `${index * 80}`;
      item.style.transitionDelay = `${index * 80}ms`;
    });

    const roomGalleryItems = document.querySelectorAll('.roomGalleryItem');
    roomGalleryItems.forEach((item, index) => {
      item.dataset.animate = 'fade-up';
      item.dataset.animateDelay = `${index * 80}`;
      item.style.transitionDelay = `${index * 80}ms`;
    });
  };
  
  const initScrollAnimation = () => {
    applyScrollAnimationTargets();
    const animatedItems = document.querySelectorAll('[data-animate]');

    if (!animatedItems.length) return;

    if (!('IntersectionObserver' in window)) {
      animatedItems.forEach(element => {
        element.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    animatedItems.forEach(element => observer.observe(element));
  };

  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimation();

    // 동적으로 생성되는 요소를 위해 MutationObserver 추가
    const observeDOM = new MutationObserver(() => {
      initScrollAnimation();
    });

    observeDOM.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  