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

    // enabled 상태 확인 (preview-handler 데이터 업데이트 시)
    // preview-handler가 없으면 localhost이므로 체크 안 함
    function checkLayoutMapEnabled() {
        if (!window.previewHandler) return;

        if (window.previewHandler.currentData) {
            const layoutEnabled = window.previewHandler.currentData?.homepage?.customFields?.pages?.layoutMap?.sections?.[0]?.enabled;
            if (layoutEnabled === false) {
                window.location.href = '404.html';
                return;
            }
        }
    }
    window._checkPageEnabled = checkLayoutMapEnabled;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize scroll animations
        initScrollAnimations();

        // 페이지 로드 시 enabled 상태 확인
        checkLayoutMapEnabled();

        console.log('Layout Map page loaded');
    });

})();
