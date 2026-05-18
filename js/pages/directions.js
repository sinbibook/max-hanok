/**
 * Directions Page JavaScript
 */

(function() {
    'use strict';

    // Hero Slider Initialization
    function initHeroSlider(skipDelay = false) {
        const slider = document.getElementById('hero-slider');
        if (!slider) return;

        const slides = slider.querySelectorAll('.hero-slide');
        const prevButton = document.querySelector('#hero-prev');
        const nextButton = document.querySelector('#hero-next');
        const progressFill = document.querySelector('.hero-slider-line-fill');
        const currentSpan = document.querySelector('.hero-slider-current');
        const totalSpan = document.querySelector('.hero-slider-total');

        if (slides.length <= 1) {
            // Hide controls if only one slide
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }

        let currentSlide = 0;
        let autoSlideTimer;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            updateProgress();
        }

        function updateProgress() {
            if (progressFill) {
                progressFill.style.transition = 'none';
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.transition = 'width 4000ms linear';
                    progressFill.style.width = '100%';
                }, 50);
            }

            // Update slide numbers
            if (currentSpan) {
                currentSpan.textContent = String(currentSlide + 1).padStart(2, '0');
            }
            if (totalSpan) {
                totalSpan.textContent = String(slides.length).padStart(2, '0');
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function startAutoSlide() {
            autoSlideTimer = setInterval(nextSlide, 4000);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        }

        // Button events
        if (prevButton) prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
        if (nextButton) nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });

        // Pause on hover
        if (slider) {
            slider.addEventListener('mouseenter', stopAutoSlide);
            slider.addEventListener('mouseleave', startAutoSlide);
        }

        // Initialize
        showSlide(0);
        startAutoSlide();
    }

    // Scroll to next section function (no parallax)
    function scrollToNextSection() {
        const mapSection = document.querySelector('.map-section');

        if (mapSection) {
            const targetPosition = mapSection.offsetTop;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Make function globally available
    window.scrollToNextSection = scrollToNextSection;

    // Dynamic notice section visibility
    function toggleNoticeSection() {
        const noticeSection = document.getElementById('directions-notice-section');

        // noticeSection이 없으면 함수 종료
        if (!noticeSection) return;

        const noticeContent = noticeSection.querySelector('[data-customfield-directions-notice-content]');

        // Check if data exists (not empty or default content)
        const hasContent = noticeContent && noticeContent.textContent.trim() &&
                          !noticeContent.textContent.includes('안내사항이 표시됩니다.');

        if (hasContent) {
            noticeSection.style.display = 'block';
        } else {
            noticeSection.style.display = 'none';
        }
    }

    // Image animation using IntersectionObserver
    function initImageAnimation() {
        const bannerImage = document.querySelector('.directions-banner-image');

        if (!bannerImage) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // 뷰포트에 들어오면 'animate' 클래스를 추가하고, 나가면 제거합니다.
                entry.target.classList.toggle('animate', entry.isIntersecting);
            });
        }, {
            threshold: 0.1 // 10% 이상 보일 때 트리거
        });

        observer.observe(bannerImage);
    }

    // Make function globally available
    window.initHeroSlider = initHeroSlider;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize DirectionsMapper for data mapping
        if (typeof DirectionsMapper !== 'undefined') {
            const directionsMapper = new DirectionsMapper();
            await directionsMapper.initialize(); // initialize()가 자동으로 mapPage() 호출

            // Initialize hero slider after mapper completes
            setTimeout(() => {
                initHeroSlider(true);
            }, 100);
        }

        // Simple initialization - no parallax effects
        toggleNoticeSection();
        initImageAnimation();
    });

})();