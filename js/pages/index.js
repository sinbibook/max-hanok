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

    // Ensure each slide takes full width of the hero area
    slides.forEach((slide) => {
        slide.style.flex = '0 0 100%';
    });

    let currentIndex = 0;
    let autoSlideTimer = null;

    const prevButton = sliderWrapper.querySelector('.prev');
    const nextButton = sliderWrapper.querySelector('.next');

    const defaultTransition = 'transform 0.6s ease';
    const getSlideWidth = () => sliderWrapper.getBoundingClientRect().width;

    const applyTransform = (animate = true) => {
        sliderTrack.style.transition = animate ? defaultTransition : 'none';

        const slideWidth = getSlideWidth();
        sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        if (!animate) {
            // Allow layout to settle before restoring transition
            requestAnimationFrame(() => {
                sliderTrack.style.transition = defaultTransition;
            });
        }
    };

    // 초기 위치만 맞추면 되는 경우 (슬라이드가 1장 이하)
    if (slides.length <= 1) {
        applyTransform(false);
        return;
    }

    const goToSlide = (index) => {
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        currentIndex = (index + totalSlides) % totalSlides;
        sliderTrack.style.transition = sliderTrack.style.transition || 'transform 0.6s ease';
        applyTransform(true);
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
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
                goToSlide(currentIndex + 1);
            } else {
                // Swipe right - previous slide
                goToSlide(currentIndex - 1);
            }
            // Keep auto-slide running on mobile
            if (window.innerWidth <= 768) {
                startAutoSlide();
            }
        }
    };

    window.addEventListener('resize', () => {
        applyTransform(false);
    });

    // Initial positioning without animation
    applyTransform(false);
    startAutoSlide();
}

function initSpecialSlider() {
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

        const getVisibleCount = () => {
            return window.innerWidth <= 1024 ? 1 : (parseInt(container.dataset.visibleCount, 10) || 3);
        };

        if (originalSlides.length <= 1) {
            const visibleCount = getVisibleCount();
            originalSlides.forEach((slide) => {
                slide.style.flex = `0 0 ${100 / visibleCount}%`;
            });
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            container.dataset.specialSliderInitialized = 'true';
            return;
        }

        // 앞뒤로 1개씩만 복제
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

        track.appendChild(firstClone);
        track.insertBefore(lastClone, track.firstChild);

        const allSlides = Array.from(track.children);
        const totalSlides = allSlides.length;

        const updateSlideSizing = () => {
            const currentVisible = getVisibleCount();
            allSlides.forEach((slide) => {
                slide.style.flex = `0 0 ${100 / currentVisible}%`;
            });
        };

        updateSlideSizing();

        let currentIndex = 1; // 복제 후 첫 번째 원본 슬라이드
        let autoTimer = null;
        let isTransitioning = false;

        const getStep = () => {
            if (!allSlides[0]) return 0;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.columnGap || style.gap || '0');
            return allSlides[0].getBoundingClientRect().width + gap;
        };

        const updatePosition = (animate = true) => {
            track.style.transition = animate ? 'transform 0.6s ease' : 'none';
            const step = getStep();
            track.style.transform = `translateX(-${currentIndex * step}px)`;
        };

        updatePosition(false);

        const moveToNext = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex++;
            updatePosition(true);

            if (currentIndex >= totalSlides - 1) {
                setTimeout(() => {
                    currentIndex = 1;
                    updatePosition(false);
                    isTransitioning = false;
                }, 600);
            } else {
                setTimeout(() => {
                    isTransitioning = false;
                }, 600);
            }
        };

        const moveToPrev = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex--;
            updatePosition(true);

            if (currentIndex <= 0) {
                setTimeout(() => {
                    currentIndex = totalSlides - 2;
                    updatePosition(false);
                    isTransitioning = false;
                }, 600);
            } else {
                setTimeout(() => {
                    isTransitioning = false;
                }, 600);
            }
        };

        const stopAuto = () => {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        };

        const startAuto = () => {
            stopAuto();
            autoTimer = setInterval(() => {
                moveToNext();
            }, 5000);
        };

        prevButton?.addEventListener('click', () => {
            moveToPrev();
            startAuto();
        });

        nextButton?.addEventListener('click', () => {
            moveToNext();
            startAuto();
        });

        container.addEventListener('mouseenter', () => {
            if (window.innerWidth > 1024) {
                stopAuto();
            }
        });

        container.addEventListener('mouseleave', () => {
            if (window.innerWidth > 1024) {
                startAuto();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    moveToNext();
                } else {
                    moveToPrev();
                }
                if (window.innerWidth <= 1024) {
                    startAuto();
                }
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            updateSlideSizing();
            updatePosition(false);
        });

        updatePosition(false);
        container.dataset.specialSliderInitialized = 'true';

        startAuto();
    });
}

// 전역으로 노출
window.initHeroSlider = initHeroSlider;
window.initSpecialSlider = initSpecialSlider;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();

    // Initialize new IndexMapper only
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
});
