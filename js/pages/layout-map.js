/**
 * Layout Map Page JavaScript
 */

(function() {
    'use strict';

    // Scroll to next section function
    function scrollToNextSection() {
        const contentSection = document.querySelector('.layout-map-container');

        if (contentSection) {
            const targetPosition = contentSection.offsetTop;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Make function globally available
    window.scrollToNextSection = scrollToNextSection;

    // Animate sections on scroll using IntersectionObserver
    function initScrollAnimations() {
        const sectionsToAnimate = document.querySelectorAll('.layout-map-intro');
        const itemsToAnimate = document.querySelectorAll('.layout-map-item, .layout-map-description-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                } else {
                    entry.target.classList.remove('animate');
                }
            });
        }, {
            threshold: 0.1
        });

        sectionsToAnimate.forEach(section => {
            observer.observe(section);
        });

        // Observe all items (images and descriptions) for animations
        itemsToAnimate.forEach(item => {
            observer.observe(item);
        });
    }

    // 동적으로 생성된 layout-map items에 대해 스크롤 애니메이션 재실행
    function reinitScrollAnimations() {
        initScrollAnimations();
    }

    // 전역 함수로 노출 (mapper 완료 후 호출)
    window._reinitScrollAnimations = reinitScrollAnimations;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize scroll animations
        initScrollAnimations();

        // 페이지 로드 시 enabled 상태 확인
        if (window.previewHandler && window.previewHandler.checkPageEnabled) {
            window.previewHandler.checkPageEnabled();
        }

        console.log('Layout Map page loaded');
    });

})();
