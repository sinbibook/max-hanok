/**
 * Reservation Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hero Slider는 ReservationMapper에서 데이터 매핑 후 초기화됨
    // (슬라이드가 동적으로 생성되므로 여기서 호출하면 빈 슬라이더)

    // Initialize animations (정적 요소들에 대해)
    window.initReservationAnimations();

    // Initialize accordion if needed
    initAccordion();

    // Initialize scroll control for reservation content
    initScrollControl();
});

// 전역 변수로 interval 관리 (중복 호출 방지)
window._reservationHeroSliderInterval = null;

/**
 * Initialize Hero Slider
 * window에 노출하여 mapper에서 재초기화 가능
 */
window.initReservationHeroSlider = function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    // 기존 interval 클리어 (중복 호출 방지)
    if (window._reservationHeroSliderInterval) {
        clearInterval(window._reservationHeroSliderInterval);
        window._reservationHeroSliderInterval = null;
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
        window._reservationHeroSliderInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, slideInterval);
    }

    // Function to reset auto-play
    function resetAutoPlay() {
        clearInterval(window._reservationHeroSliderInterval);
        startAutoPlay();
    }

    // Navigation button handlers
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                clearInterval(window._reservationHeroSliderInterval);
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
                clearInterval(window._reservationHeroSliderInterval);
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
        clearInterval(window._reservationHeroSliderInterval);
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
window.initReservationAnimations = function initAnimations() {
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

/**
 * Initialize accordion for reservation info
 */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close all accordion items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Initialize scroll control for reservation content area
 */
function initScrollControl() {
    // Sticky positioning으로 자연스러운 스크롤 구현
    // CSS의 sticky가 자연스러운 스크롤을 처리하므로
    // JavaScript로 복잡한 스크롤 제어는 제거

    // 애니메이션 효과만 추가
    const imageSection = document.querySelector('.reservation-image-section img');
    if (imageSection) {
        // 이미지에 hover 효과와 유사한 스크롤 애니메이션
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.05;
            if (imageSection) {
                imageSection.style.transform = `translateY(${rate}px)`;
            }
        });
    }
}
