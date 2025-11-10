/**
 * Directions Page JavaScript
 */

(function() {
    'use strict';


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

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize DirectionsMapper for data mapping
        if (typeof DirectionsMapper !== 'undefined') {
            const directionsMapper = new DirectionsMapper();
            await directionsMapper.initialize(); // initialize()가 자동으로 mapPage() 호출
        }

        // Simple initialization - no parallax effects
        toggleNoticeSection();
        initImageAnimation();
        console.log('Directions page loaded');
    });

})();