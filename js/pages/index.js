/**
 * Index Page Functionality
 * 메인 페이지 스크롤 애니메이션 및 인터랙션
 */

// Smooth scroll to next section
function scrollToNextSection() {
    const nextSection = document.querySelector('.essence-section');
    if (nextSection) {
        nextSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Enhanced Intersection Observer with React-style Staggered Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Special handling for gallery items with staggered animation
                if (entry.target.classList.contains('gallery-item')) {
                    const galleryItems = Array.from(entry.target.parentElement.children);
                    const index = galleryItems.indexOf(entry.target);
                    const delays = [0, 0.2, 0.4, 0.6]; // React delay values

                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, (delays[index] || 0) * 1000);
                } else {
                    entry.target.classList.add('animate');
                }
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.fade-in-up, .fade-in-scale, .gallery-item, .signature-item, .featured-pool').forEach(el => {
        observer.observe(el);
    });

    // Special handling for closing hero text
    const closingHeroText = document.querySelector('.index-closing-text');
    if (closingHeroText) {
        observer.observe(closingHeroText);
    }
}

function initHeroSlider() {
    const sliderWrapper = document.querySelector('.heroSlider');
    if (!sliderWrapper || sliderWrapper.dataset.sliderInitialized === 'true') {
        return;
    }

    const sliderTrack = sliderWrapper.querySelector('.slider');
    const slides = sliderTrack ? Array.from(sliderTrack.querySelectorAll('.slide')) : [];
    if (!sliderTrack || slides.length === 0) {
        return;
    }

    sliderWrapper.dataset.sliderInitialized = 'true';

    // 단일 슬라이드인 경우
    if (slides.length <= 1) {
        slides.forEach((slide) => {
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.height = '100%';
            slide.style.opacity = '1';
        });
        return;
    }

    // fade 슬라이더를 위한 스타일 설정
    const FADE_DURATION_MS = 800;
    sliderTrack.style.position = 'relative';
    slides.forEach((slide, index) => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.height = '100%';
        slide.style.opacity = index === 0 ? '1' : '0';
        slide.style.transition = `opacity ${FADE_DURATION_MS / 1000}s ease-in-out`;
        slide.style.zIndex = index === 0 ? '2' : '1';
    });

    let currentIndex = 0;
    let autoSlideTimer = null;
    let isTransitioning = false;

    const prevButton = sliderWrapper.querySelector('.prev');
    const nextButton = sliderWrapper.querySelector('.next');

    const goToSlide = (index) => {
        if (isTransitioning) return;

        const newIndex = (index + slides.length) % slides.length;
        if (newIndex === currentIndex) return;

        isTransitioning = true;

        // 현재 슬라이드 숨기기
        slides[currentIndex].style.opacity = '0';
        slides[currentIndex].style.zIndex = '1';

        // 새 슬라이드 보이기
        slides[newIndex].style.opacity = '1';
        slides[newIndex].style.zIndex = '2';

        currentIndex = newIndex;

        setTimeout(() => {
            isTransitioning = false;
        }, FADE_DURATION_MS); // 트랜지션 시간과 맞춤
    };

    const nextSlide = () => {
        goToSlide(currentIndex + 1);
    };

    const prevSlide = () => {
        goToSlide(currentIndex - 1);
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            nextSlide();
        }, 5000);
    };

    const stopAutoSlide = () => {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    };

    prevButton?.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    nextButton?.addEventListener('click', () => {
        nextSlide();
        startAutoSlide();
    });

    // Desktop hover behavior
    sliderWrapper.addEventListener('mouseenter', () => {
        // Only stop auto-slide on desktop
        if (window.innerWidth > 768) {
            stopAutoSlide();
        }
    });
    sliderWrapper.addEventListener('mouseleave', () => {
        // Only restart on desktop
        if (window.innerWidth > 768) {
            startAutoSlide();
        }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                prevSlide();
            }
            // Keep auto-slide running on mobile
            if (window.innerWidth <= 768) {
                startAutoSlide();
            }
        }
    };

    // resize 이벤트에서는 특별한 처리가 필요하지 않음 (fade 방식)

    // 초기화
    startAutoSlide();
}

function initSpecialSlider() {
    // 상수 정의
    const MOBILE_BREAKPOINT = 1024;
    const MOBILE_VISIBLE_SLIDES = 1;
    const DESKTOP_VISIBLE_SLIDES = 3;
    const AUTO_SLIDE_INTERVAL_MS = 3000;
    const SINGLE_SLIDE_THRESHOLD = 1;

    const containers = document.querySelectorAll('.specialSlider');

    containers.forEach((container) => {
        if (!container || container.dataset.specialSliderInitialized === 'true') {
            return;
        }

        const track = container.querySelector('.slider');
        if (!track) return;

        const originalSlides = Array.from(track.children);
        if (originalSlides.length === 0) return;

        const prevButton = container.querySelector('.prev');
        const nextButton = container.querySelector('.next');

        // 유효한 이미지가 있는 슬라이드만 필터링 (empty-image-placeholder는 포함)
        const validSlides = originalSlides.filter(slide => {
            const img = slide.querySelector('img');
            if (!img || !img.src || img.src === '') return false;

            // empty-image-placeholder는 유효한 슬라이드로 처리
            if (img.classList.contains('empty-image-placeholder')) return true;

            // 빈 이미지나 플레이스홀더 제외 (empty-image-placeholder 제외)
            const invalidPatterns = [
                'placeholder',
                'about:blank',
                'data:image/gif;base64,R0lGOD', // 빈 gif
                'undefined'
            ];

            // data:image/svg+xml이지만 empty-image-placeholder가 아닌 경우만 제외
            if (img.src.includes('data:image/svg+xml') && !img.classList.contains('empty-image-placeholder')) {
                return false;
            }

            return !invalidPatterns.some(pattern => img.src.includes(pattern)) &&
                   (img.src.startsWith('http') || img.classList.contains('empty-image-placeholder'));
        });

        // 슬라이드가 없어도 컨테이너는 숨기지 않음 (empty placeholder가 표시되어야 하므로)
        if (validSlides.length === 0) {
            // 모든 슬라이드가 유효하지 않은 경우에만 숨김
            return;
        }

        // 단일 슬라이드인 경우
        if (validSlides.length <= SINGLE_SLIDE_THRESHOLD) {
            track.innerHTML = '';
            track.appendChild(validSlides[0].cloneNode(true));
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            container.dataset.specialSliderInitialized = 'true';
            return;
        }

        // 기본 슬라이더 설정
        track.innerHTML = '';
        validSlides.forEach(slide => {
            track.appendChild(slide.cloneNode(true));
        });

        const slides = Array.from(track.children);
        let currentIndex = 0;
        let autoSlideTimer = null;

        // 반응형 슬라이드 설정
        const getVisibleSlidesCount = () => window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_VISIBLE_SLIDES : DESKTOP_VISIBLE_SLIDES;

        const updateSlideLayout = () => {
            const visibleSlides = getVisibleSlidesCount();

            slides.forEach(slide => {
                slide.style.flex = `0 0 calc(100% / ${visibleSlides})`;
                slide.style.minWidth = 0;
            });

            return visibleSlides;
        };

        const goToSlide = (index) => {
            const visibleSlides = updateSlideLayout();
            currentIndex = Math.max(0, Math.min(index, slides.length - visibleSlides));
            const slideWidth = container.getBoundingClientRect().width / visibleSlides;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            updateButtonStates();
        };

        const updateButtonStates = () => {
            const visibleSlides = getVisibleSlidesCount();

            if (prevButton) {
                prevButton.style.opacity = currentIndex === 0 ? '0.3' : '1';
                prevButton.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            }

            if (nextButton) {
                nextButton.style.opacity = currentIndex >= slides.length - visibleSlides ? '0.3' : '1';
                nextButton.style.pointerEvents = currentIndex >= slides.length - visibleSlides ? 'none' : 'auto';
            }
        };

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                const visibleSlides = getVisibleSlidesCount();
                if (currentIndex >= slides.length - visibleSlides) {
                    goToSlide(0);
                } else {
                    goToSlide(currentIndex + 1);
                }
            }, AUTO_SLIDE_INTERVAL_MS);
        };

        const stopAutoSlide = () => {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        };

        prevButton?.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            startAutoSlide();
        });

        nextButton?.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            startAutoSlide();
        });

        // 호버 시 자동 슬라이드 멈춤
        container.addEventListener('mouseenter', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) stopAutoSlide();
        });

        container.addEventListener('mouseleave', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) startAutoSlide();
        });

        // 모바일 터치 스와이프
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
                }
            }
            startAutoSlide();
        }, { passive: true });

        // 창 크기 변경 시 재조정
        window.addEventListener('resize', () => {
            goToSlide(currentIndex);
        });

        // 초기화
        goToSlide(0);
        startAutoSlide();
        container.dataset.specialSliderInitialized = 'true';
    });
}

// 전역으로 노출
window.initHeroSlider = initHeroSlider;
window.initSpecialSlider = initSpecialSlider;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();

    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (!window.APP_CONFIG.isInIframe()) {
        // 일반 환경: IndexMapper가 직접 초기화
        const indexMapper = new IndexMapper();
        indexMapper.initialize()
            .then(() => {
                initHeroSlider();
                initSpecialSlider();
            })
            .catch(() => {
                initHeroSlider();
                initSpecialSlider();
            });
    }
    // iframe 환경에서는 PreviewHandler가 initHeroSlider/initSpecialSlider 호출
});
