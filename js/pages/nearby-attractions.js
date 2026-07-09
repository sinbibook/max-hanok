/**
 * Nearby Attractions Page JavaScript
 */

(function() {
    'use strict';

    // Scroll to next section function
    function scrollToNextSection() {
        const contentSection = document.querySelector('.attractions-container');

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
        const sectionsToAnimate = document.querySelectorAll('.attractions-header, .attractions-grid');
        const itemsToAnimate = document.querySelectorAll('.attraction-item');

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

        // Observe attraction items for image border-radius animation
        itemsToAnimate.forEach(item => {
            observer.observe(item);
        });
    }

    // 동적으로 생성된 attraction items에 대해 스크롤 애니메이션 재실행
    function reinitScrollAnimations() {
        initScrollAnimations();
    }

    // 전역 함수로 노출 (mapper 완료 후 호출)
    window._reinitScrollAnimations = reinitScrollAnimations;

    // enabled 상태 확인 (preview-handler 데이터 업데이트 시)
    // preview-handler가 없으면 localhost이므로 체크 안 함
    function checkNearbyAttractionsEnabled() {
        if (!window.previewHandler) return;

        if (window.previewHandler.currentData) {
            const nearbyEnabled = window.previewHandler.currentData?.homepage?.customFields?.pages?.nearbyAttractions?.sections?.[0]?.enabled;
            if (nearbyEnabled === false) {
                window.location.href = '404.html';
                return;
            }
        }
    }
    window._checkPageEnabled = checkNearbyAttractionsEnabled;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize scroll animations
        initScrollAnimations();

        // 페이지 로드 시 enabled 상태 확인
        checkNearbyAttractionsEnabled();

        console.log('Nearby Attractions page loaded');
    });

})();
