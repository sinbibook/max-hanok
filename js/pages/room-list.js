/**
 * Room List Page JavaScript
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

    // ============================================================================
    // GLOBAL FUNCTIONS
    // ============================================================================

    // Room selection function (room.html로 이동)
    window.selectRoom = function(roomId) {
        // room.html로 이동하면서 객실 ID를 파라미터로 전달
        window.location.href = `room.html?id=${roomId}`;
    };

    // Scroll animation
    function handleScrollAnimation() {
        const elements = document.querySelectorAll('.stylized-title-container, .room-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });

        // Banner image animation
        const bannerImage = document.querySelector('.room-list-banner-image');
        if (bannerImage) {
            const bannerTop = bannerImage.getBoundingClientRect().top;
            const bannerVisible = 200;

            if (bannerTop < window.innerHeight - bannerVisible) {
                bannerImage.classList.add('animate');
            }
        }
    }

    // ============================================================================
    // PAGE INITIALIZATION
    // ============================================================================

    // Make function globally available
    window.initHeroSlider = initHeroSlider;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // RoomListMapper 초기화
        if (typeof RoomListMapper !== 'undefined') {
            const roomListMapper = new RoomListMapper();
            await roomListMapper.initialize();

            // Initialize hero slider after mapper completes
            setTimeout(() => {
                initHeroSlider(true);
            }, 100);
        }

        // Initial animation check
        setTimeout(() => {
            handleScrollAnimation();
        }, 100);

        // Scroll event listener
        window.addEventListener('scroll', handleScrollAnimation);
    });

})();