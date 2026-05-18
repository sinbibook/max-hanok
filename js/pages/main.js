/**
 * Main Page JavaScript - Scroll Animations & Hero Slider
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

    // Initialize scroll animations
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        // Get all sections except the first one
        const sections = document.querySelectorAll('section.main-content-fade-in');

        sections.forEach((section, index) => {
            // Add scroll-animate class to elements that need animation
            const imageHalves = section.querySelectorAll('.hero-image-half');
            const textHalves = section.querySelectorAll('.hero-text-half');
            const fullImages = section.querySelectorAll('.hero-bottom-section > img');

            imageHalves.forEach(element => {
                element.classList.add('scroll-animate');
                observer.observe(element);
            });

            textHalves.forEach(element => {
                element.classList.add('scroll-animate');
                observer.observe(element);
            });

            fullImages.forEach(element => {
                element.classList.add('scroll-animate');
                observer.observe(element);
            });
        });
    }

    // Scroll to next section function
    function scrollToNextSection() {
        const nextSection = document.querySelector('.location-info-section');

        if (nextSection) {
            const targetPosition = nextSection.offsetTop;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Make functions globally available
    window.scrollToNextSection = scrollToNextSection;
    window.initScrollAnimations = initScrollAnimations;
    window.initHeroSlider = initHeroSlider;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        initScrollAnimations();

        // Initialize MainMapper for data mapping
        if (typeof MainMapper !== 'undefined') {
            const mainMapper = new MainMapper();
            await mainMapper.initialize(); // initialize()가 자동으로 mapPage() 호출

            // Initialize hero slider after mapper completes
            setTimeout(() => {
                initHeroSlider(true);
            }, 100);
        }
    });

})();