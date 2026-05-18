/**
 * Reservation Page JavaScript
 */

(function() {
    'use strict';

    let ticking = false;

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

    // Scroll to next section function
    function scrollToNextSection() {
        const nextSection = document.querySelector('.reservation-info-section');

        if (nextSection) {
            const targetPosition = nextSection.offsetTop;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }


    // Make function globally available
    window.scrollToNextSection = scrollToNextSection;

    // Simple initialization - no animations needed for facility-style layout

    // Tab functionality
    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.reservation-tab-button');
        const tabContents = document.querySelectorAll('.reservation-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTabId = this.getAttribute('data-tab');

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(targetTabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Make function globally available
    window.initHeroSlider = initHeroSlider;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // ReservationMapper 초기화
        if (typeof ReservationMapper !== 'undefined') {
            const reservationMapper = new ReservationMapper();
            await reservationMapper.initialize();

            // Initialize hero slider after mapper completes
            setTimeout(() => {
                initHeroSlider(true);
            }, 100);
        }

        initializeTabs();
    });

})();