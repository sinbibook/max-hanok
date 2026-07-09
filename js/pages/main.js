/**
 * Main Page JavaScript - Scroll Animations
 */

(function() {
    'use strict';

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

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        initScrollAnimations();

        // Initialize MainMapper for data mapping
        if (typeof MainMapper !== 'undefined') {
            const mainMapper = new MainMapper();
            await mainMapper.initialize(); // initialize()가 자동으로 mapPage() 호출
        }
    });

})();