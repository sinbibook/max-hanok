/**
 * Facility Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hero Slider는 FacilityMapper에서 데이터 매핑 후 초기화됨
    // (슬라이드가 동적으로 생성되므로 여기서 호출하면 빈 슬라이더)

    // Initialize animations (정적 요소들에 대해)
    window.initFacilityAnimations();
});

// 전역 변수로 interval 관리 (중복 호출 방지)
window._facilityHeroSliderInterval = null;

/**
 * Initialize Hero Slider
 * window에 노출하여 mapper에서 재초기화 가능
 */
window.initFacilityHeroSlider = function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    // 기존 interval 클리어 (중복 호출 방지)
    if (window._facilityHeroSliderInterval) {
        clearInterval(window._facilityHeroSliderInterval);
        window._facilityHeroSliderInterval = null;
    }

    const slides = slider.querySelectorAll('.hero-slide');
    const currentSlideEl = document.querySelector('[data-current-slide]');
    const totalSlidesEl = document.querySelector('[data-total-slides]');
    const progressBar = document.querySelector('[data-hero-progress]');
    const prevBtn = document.querySelector('.hero-nav-prev');
    const nextBtn = document.querySelector('.hero-nav-next');

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideInterval = 5000; // 5 seconds per slide

    // 슬라이드가 1개 이하면 자동 재생 불필요
    if (totalSlides <= 1) {
        if (totalSlidesEl) {
            totalSlidesEl.textContent = totalSlides.toString().padStart(2, '0');
        }
        if (currentSlideEl) {
            currentSlideEl.textContent = '01';
        }
        return;
    }

    // Auto-play slider (전역 변수 사용)
    let isTransitioning = false;

    // Update total slides count
    if (totalSlidesEl) {
        totalSlidesEl.textContent = totalSlides.toString().padStart(2, '0');
    }

    // Function to show specific slide
    function showSlide(index, immediate = false) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update current slide number
        if (currentSlideEl) {
            currentSlideEl.textContent = (index + 1).toString().padStart(2, '0');
        }

        // Update progress bar - always fill to 100% for current slide
        if (progressBar) {
            // Reset to 0 then animate to 100%
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';

            // Start animation immediately or with minimal delay
            if (immediate) {
                // For first slide, start immediately
                setTimeout(() => {
                    progressBar.style.transition = `width ${slideInterval}ms linear`;
                    progressBar.style.width = '100%';
                }, 10);
            } else {
                // For subsequent slides
                progressBar.offsetHeight; // Force reflow
                progressBar.style.transition = `width ${slideInterval}ms linear`;
                progressBar.style.width = '100%';
            }
        }
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Function to go to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    // Start auto-play
    function startAutoPlay() {
        window._facilityHeroSliderInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, slideInterval);
    }

    // Function to reset auto-play
    function resetAutoPlay() {
        clearInterval(window._facilityHeroSliderInterval);
        startAutoPlay();
    }

    // Navigation button handlers
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                clearInterval(window._facilityHeroSliderInterval);
                nextSlide();
                setTimeout(() => {
                    isTransitioning = false;
                    resetAutoPlay();
                }, 100);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                clearInterval(window._facilityHeroSliderInterval);
                prevSlide();
                setTimeout(() => {
                    isTransitioning = false;
                    resetAutoPlay();
                }, 100);
            }
        });
    }

    // Pause on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(window._facilityHeroSliderInterval);
    });

    slider.addEventListener('mouseleave', () => {
        if (!isTransitioning) {
            startAutoPlay();
        }
    });

    // Initialize first slide with immediate animation and start auto-play
    showSlide(0, true);
    startAutoPlay();
}

/**
 * Initialize animations
 * window에 노출하여 mapper에서 재초기화 가능
 */
window.initFacilityAnimations = function initAnimations() {
    const animatedElements = document.querySelectorAll('.animate-element:not(.animate)');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}
