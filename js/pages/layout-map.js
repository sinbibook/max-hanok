(function() {
    'use strict';

    /**
     * Scroll to content function
     */
    window.scrollToContent = function() {
        const target = document.querySelector('.scroll-target');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Setup scroll animations with IntersectionObserver
     */
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all animate-element and layout-map-item elements
        document.querySelectorAll('.animate-element, .layout-map-item')
            .forEach(el => {
                observer.observe(el);
            });

        return observer;
    }

    /**
     * Setup full banner animation
     */
    function setupFullBannerAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        const fullBanner = document.querySelector('.full-banner');
        if (fullBanner) {
            observer.observe(fullBanner);
        }
    }

    /**
     * Setup all animations (called by mapper)
     */
    window.setupLayoutMapAnimations = function() {
        setupScrollAnimations();
        setupFullBannerAnimation();
    };

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            setupFullBannerAnimation();
            setupScrollAnimations();
        }, 1000);
    });
})();
