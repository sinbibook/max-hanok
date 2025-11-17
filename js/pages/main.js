// Main Slider with Enhanced Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fullscreen slider using the reusable component
    const mainSlider = new FullscreenSlider('.fullscreen-slider-container', {
        slideDuration: 4000,
        autoplay: true,
        enableSwipe: true,
        enableKeyboard: true
    });

    // Initialize scroll animations
    setupScrollAnimations();
});

// 스크롤 애니메이션 설정
function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-element');

    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // 초기 체크
    checkScroll();

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', checkScroll);

    // 윈도우 리사이즈 시에도 체크
    window.addEventListener('resize', checkScroll);
}