/**
 * 공통 슬라이더 모듈 - 네비게이션 및 터치/드래그 기능 제공
 */

/**
 * 슬라이더 초기화
 * @param {string} sliderSelector - 슬라이더 컨테이너 선택자
 * @param {Object} options - 설정 옵션
 * @param {number} options.slideInterval - 자동 슬라이드 간격 (ms)
 * @param {boolean} options.autoPlay - 자동 재생 여부
 * @param {boolean} options.navigation - 네비게이션 버튼 표시 여부
 * @param {boolean} options.pagination - 페이지네이션 표시 여부
 * @param {boolean} options.touchEnabled - 터치/드래그 활성화 여부
 * @param {function} options.onSlideChange - 슬라이드 변경 콜백
 */
function initializeSlider(sliderSelector, options = {}) {
    const defaultOptions = {
        slideInterval: 5000,
        autoPlay: true,
        navigation: true,
        pagination: true,
        touchEnabled: true,
        skipInitialDelay: false,
        onSlideChange: null
    };

    const config = { ...defaultOptions, ...options };

    // 슬라이더 요소들
    const sliderContainer = document.querySelector(sliderSelector);
    if (!sliderContainer) return null;

    const slides = sliderContainer.querySelectorAll('.hero-slide');
    const currentNum = sliderContainer.parentElement.querySelector('.hero-slider-current');
    const totalNum = sliderContainer.parentElement.querySelector('.hero-slider-total');
    const progressFill = sliderContainer.parentElement.querySelector('.hero-slider-line-fill');
    const prevButton = sliderContainer.parentElement.querySelector('#hero-prev, .hero-slider-arrow.prev');
    const nextButton = sliderContainer.parentElement.querySelector('#hero-next, .hero-slider-arrow.next');

    if (slides.length === 0) return null;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideTimer = null;
    let isTransitioning = false;

    // Touch/Drag state
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    // Update total number
    if (totalNum) {
        totalNum.textContent = String(totalSlides).padStart(2, '0');
    }

    function updateProgress() {
        if (currentNum) {
            currentNum.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        // Reset progress bar to 0 and animate to 100%
        if (progressFill && config.autoPlay) {
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';

            setTimeout(() => {
                progressFill.style.transition = `width ${config.slideInterval}ms linear`;
                progressFill.style.width = '100%';
            }, 50);
        }
    }

    function goToSlide(index) {
        if (isTransitioning) return;

        isTransitioning = true;

        // 현재 슬라이드 숨기기
        slides[currentSlide].classList.remove('active');

        // 다음 슬라이드 계산
        currentSlide = (index + totalSlides) % totalSlides;

        // 다음 슬라이드 보이기
        slides[currentSlide].classList.add('active');

        // Update progress bar
        updateProgress();

        // 슬라이드 변경 콜백 호출
        if (config.onSlideChange) {
            config.onSlideChange(currentSlide);
        }

        // Reset auto-slide timer
        if (config.autoPlay) {
            resetAutoSlide();
        }

        // Reset transitioning flag
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetAutoSlide() {
        if (!config.autoPlay) return;

        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
        }
        autoSlideTimer = setInterval(nextSlide, config.slideInterval);
    }

    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    // Touch and Mouse Events
    function getClientX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    function handleStart(e) {
        if (!config.touchEnabled || isTransitioning) return;

        isDragging = true;
        startX = getClientX(e);
        currentX = startX;

        // Pause auto-slide during interaction
        if (config.autoPlay) {
            stopAutoSlide();
        }

        e.preventDefault();
    }

    function handleMove(e) {
        if (!config.touchEnabled || !isDragging || isTransitioning) return;
        currentX = getClientX(e);
        e.preventDefault();
    }

    function handleEnd(e) {
        if (!config.touchEnabled || !isDragging || isTransitioning) return;

        isDragging = false;
        const deltaX = currentX - startX;
        const threshold = 50; // 최소 드래그 거리

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                // 오른쪽으로 스와이프 - 이전 슬라이드
                prevSlide();
            } else {
                // 왼쪽으로 스와이프 - 다음 슬라이드
                nextSlide();
            }
        } else if (config.autoPlay) {
            // 충분히 움직이지 않았으면 자동 슬라이드 재시작
            resetAutoSlide();
        }
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        // Button Navigation
        if (config.navigation && prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
            });
        }

        if (config.navigation && nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
            });
        }

        // Touch Events
        if (config.touchEnabled) {
            sliderContainer.addEventListener('touchstart', handleStart, { passive: false });
            sliderContainer.addEventListener('touchmove', handleMove, { passive: false });
            sliderContainer.addEventListener('touchend', handleEnd, { passive: false });

            // Mouse Events (for desktop)
            sliderContainer.addEventListener('mousedown', handleStart);
            sliderContainer.addEventListener('mousemove', handleMove);
            sliderContainer.addEventListener('mouseup', handleEnd);
            sliderContainer.addEventListener('mouseleave', handleEnd);
        }
    }

    // 초기화
    function init() {
        // 첫 번째 슬라이드 활성화
        if (slides[0]) {
            slides[0].classList.add('active');
        }

        // 이벤트 리스너 설정
        setupEventListeners();

        // 프로그레스 초기화
        updateProgress();

        // 자동 슬라이드 시작
        if (config.autoPlay) {
            const startDelay = config.skipInitialDelay ? 0 : config.slideInterval;
            setTimeout(() => {
                resetAutoSlide();
            }, startDelay);
        }
    }

    // 초기화 실행
    init();

    // Public API 반환
    return {
        goToSlide,
        nextSlide,
        prevSlide,
        getCurrentSlide: () => currentSlide,
        getTotalSlides: () => totalSlides,
        stop: stopAutoSlide,
        start: resetAutoSlide,
        destroy: () => {
            stopAutoSlide();
            // 이벤트 리스너 제거는 필요시 추가 구현
        }
    };
}

// 전역에서 사용 가능하도록 설정
window.SliderModule = {
    initializeSlider
};