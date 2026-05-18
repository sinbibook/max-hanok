// Common JavaScript functions
(function() {
    'use strict';

    // Page load animation for main content sections
    function initPageLoadAnimation() {
        // Add fade-in animation to main content elements
        setTimeout(() => {
            const fadeElements = document.querySelectorAll('.main-content-fade-in');
            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate');
                }, 300 + (index * 150)); // Start after page fade-in
            });
        }, 100);
    }

    // Also trigger animations on scroll for better UX
    function handleScrollAnimations() {
        const fadeElements = document.querySelectorAll('.main-content-fade-in:not(.animate)');

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // Scroll to next section function
    window.scrollToNextSection = function() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const nextSection = heroSection.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    // Initialize mobile floating book button
    // Note: The actual booking link will be set by header-footer-mapper.js
    function initMobileFloatingBookButton() {
        // Placeholder function - the actual click handler is set in header-footer-mapper.js
        // This ensures the button uses the correct realtime booking ID
    }

    // Closing Parallax Effect (공통)
    function initClosingParallax() {
        // index.html은 별도 parallax 함수 사용 (index.js)
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            return;
        }

        const closingSection = document.querySelector('.index-closing');
        const closingBg = document.querySelector('.closing-bg-parallax');
        const closingBgImage = document.querySelector('.closing-bg-parallax img');

        if (!closingSection || !closingBg || !closingBgImage) return;

        // 모바일에서는 parallax 비활성화
        if (window.innerWidth <= 1024) {
            closingBg.style.position = 'absolute';
            closingBg.style.opacity = '1';
            return;
        }

        function updateParallax() {
            const scrollY = window.scrollY;
            const sectionTop = closingSection.offsetTop;
            const sectionHeight = closingSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // 클로징 섹션 상단이 거의 화면 상단에 도달했을 때만 이미지 표시
            // 300px 여유를 두어 자연스럽게 나타나고 사라지도록
            const sectionBottom = sectionTop + sectionHeight;
            const isInView = scrollY >= sectionTop - 300 && scrollY < sectionBottom;

            if (isInView) {
                // 배경 보이기
                closingBg.classList.add('visible');

                // 섹션 내에서의 스크롤 진행도 계산 (0~1)
                const scrollStart = sectionTop - windowHeight;
                const scrollRange = sectionHeight + windowHeight;
                const scrollProgress = Math.max(0, Math.min(1, (scrollY - scrollStart) / scrollRange));

                // Parallax 효과: 중앙 정렬 유지하면서 천천히 이동
                // -10%부터 +10%까지 이동 (총 20% 범위, 중앙 기준)
                const translateY = (scrollProgress - 0.5) * 20; // -10% ~ +10%
                closingBgImage.style.transform = `translate(-50%, calc(-50% + ${translateY}%))`;
            } else {
                // 배경 숨기기
                closingBg.classList.remove('visible');
            }
        }

        // 스크롤 이벤트에 쓰로틀링 적용
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 초기 실행
        updateParallax();
    }

    // Initialize page load animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPageLoadAnimation();
            initMobileFloatingBookButton();
            initClosingParallax();
            window.addEventListener('scroll', handleScrollAnimations);
        });
    } else {
        initPageLoadAnimation();
        initMobileFloatingBookButton();
        initClosingParallax();
        window.addEventListener('scroll', handleScrollAnimations);
    }

})();