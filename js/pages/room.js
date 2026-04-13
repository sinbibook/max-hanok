/**
 * Room Detail Page JavaScript
 */

(function() {
    'use strict';

    let currentSlideIndex = 0;
    let autoSlideInterval;
    let ticking = false;


    // Change slide
    function changeSlide(direction) {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        // Remove active class from current slide
        slides[currentSlideIndex].classList.remove('active');

        // Calculate new index
        currentSlideIndex += direction;

        if (currentSlideIndex >= slides.length) {
            currentSlideIndex = 0;
        } else if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
        }

        // Add active class to new slide
        slides[currentSlideIndex].classList.add('active');

        // Update page numbers and progress
        updatePageNumbers();
        updateProgressBar();
    }

    // Update page numbers
    function updatePageNumbers() {
        const currentPageEl = document.getElementById('hero-current');
        const totalPagesEl = document.getElementById('hero-total');
        const slides = document.querySelectorAll('.hero-slide');

        if (currentPageEl) {
            currentPageEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
        }

        if (totalPagesEl) {
            totalPagesEl.textContent = String(slides.length).padStart(2, '0');
        }
    }

    // Update progress bar like index.html
    function updateProgressBar() {
        const progressFill = document.getElementById('hero-progress-fill');
        if (progressFill) {
            // Reset progress bar to 0 and animate to 100% like index.html
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.transition = 'width 4000ms linear';
                progressFill.style.width = '100%';
            }, 50);
        }
    }

    // Start auto slide
    function startAutoSlide() {
        stopAutoSlide(); // Clear any existing interval
        autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, 4000); // 4초마다 자동 슬라이드
    }

    // Stop auto slide
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Navigation and Touch Support
    function initSliderNavigation() {
        const prevButton = document.querySelector('#hero-prev');
        const nextButton = document.querySelector('#hero-next');
        const sliderElement = document.querySelector('#hero-slider');

        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        // Button Navigation
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                changeSlide(-1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                changeSlide(1);
            });
        }

        // Touch and Mouse Events
        function getClientX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }

        function handleStart(e) {
            isDragging = true;
            startX = getClientX(e);
            currentX = startX;

            // Pause auto-slide during interaction
            stopAutoSlide();

            e.preventDefault();
        }

        function handleMove(e) {
            if (!isDragging) return;
            currentX = getClientX(e);
            e.preventDefault();
        }

        function handleEnd() {
            if (!isDragging) return;

            isDragging = false;
            const deltaX = currentX - startX;
            const threshold = 50; // 최소 드래그 거리

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    // 오른쪽으로 스와이프 - 이전 슬라이드
                    changeSlide(-1);
                } else {
                    // 왼쪽으로 스와이프 - 다음 슬라이드
                    changeSlide(1);
                }
            } else {
                // 충분히 움직이지 않았으면 자동 슬라이드 재시작
                startAutoSlide();
            }
        }

        // Touch Events
        if (sliderElement) {
            sliderElement.addEventListener('touchstart', handleStart, { passive: false });
            sliderElement.addEventListener('touchmove', handleMove, { passive: false });
            sliderElement.addEventListener('touchend', handleEnd, { passive: false });

            // Mouse Events (for desktop)
            sliderElement.addEventListener('mousedown', handleStart);
            sliderElement.addEventListener('mousemove', handleMove);
            sliderElement.addEventListener('mouseup', handleEnd);
            sliderElement.addEventListener('mouseleave', handleEnd);
        }
    }


    // Scroll animation and parallax effect with throttling
    function handleScrollAnimation() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const elements = document.querySelectorAll('.stylized-title-container, .room-card, .room-header-info, .room-images-section, .room-details-section, .room-large-image-section');

                elements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const elementVisible = 150;

                    if (elementTop < window.innerHeight - elementVisible) {
                        element.classList.add('animate');
                    }
                });

                // Gallery animation
                const gallerySection = document.querySelector('.room-gallery-section-wrap');
                if (gallerySection) {
                    const galleryTop = gallerySection.getBoundingClientRect().top;
                    const galleryVisible = 200;

                    if (galleryTop < window.innerHeight - galleryVisible) {
                        const mainImage = document.querySelector('.gallery-main-image');
                        const contentArea = document.querySelector('.gallery-content-area');

                        if (mainImage) mainImage.classList.add('animate');
                        if (contentArea) contentArea.classList.add('animate');
                    }
                }

                // New Parallax effect
                applyParallaxEffect();

                ticking = false;
            });
            ticking = true;
        }
    }

    // New simple parallax implementation
    function applyParallaxEffect() {
        const scrollY = window.scrollY;
        const heroSection = document.querySelector('.hero-slider-section');
        const mainSection = document.querySelector('.main-content-section');

        if (!heroSection || !mainSection) return;

        const heroHeight = heroSection.offsetHeight;

        // Hero moves slightly slower (parallax background effect)
        const heroTransform = scrollY * 0.3;
        heroSection.style.transform = `translateY(${heroTransform}px)`;

        // Main content moves up to cover hero when scrolling
        if (scrollY > heroHeight * 0.3) {
            const coverDistance = Math.min(scrollY - (heroHeight * 0.3), heroHeight * 0.7);
            const coverTransform = -(coverDistance * 0.5);
            mainSection.style.transform = `translateY(${coverTransform}px)`;
        } else {
            mainSection.style.transform = 'translateY(0)';
        }
    }

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }



    // Initialize accordion functionality
    function initializeAccordion() {
        const closeButtons = document.querySelectorAll('.accordion-close');

        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const targetId = this.getAttribute('data-target');
                const content = document.getElementById(targetId);

                if (content) {
                    content.classList.toggle('collapsed');
                }
            });
        });
    }

    // Initialize gallery thumbnail functionality
    function initializeGalleryThumbnails() {
        const thumbnails = document.querySelectorAll('.gallery-thumb');
        const mainImage = document.querySelector('.gallery-main-image img');

        if (!mainImage || thumbnails.length === 0) return;

        // Set first thumbnail as active by default
        thumbnails[0].classList.add('active');

        thumbnails.forEach((thumb) => {
            thumb.addEventListener('click', function() {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));

                // Add active class to clicked thumbnail
                this.classList.add('active');

                // Get the image source from the clicked thumbnail
                const thumbImg = this.querySelector('img');
                if (thumbImg && mainImage) {
                    // Add fade effect
                    mainImage.style.opacity = '0.3';

                    setTimeout(() => {
                        mainImage.src = thumbImg.src;
                        mainImage.alt = thumbImg.alt;
                        mainImage.style.opacity = '1';
                    }, 150);
                }
            });

            // Add keyboard support
            thumb.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });

            // Make thumbnails focusable
            thumb.setAttribute('tabindex', '0');
        });
    }

    // Export slider initialization function for RoomMapper
    window.initializeSlider = function() {
        updatePageNumbers();
        startAutoSlide();
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // RoomMapper 초기화
        if (typeof RoomMapper !== 'undefined') {
            const roomMapper = new RoomMapper();
            await roomMapper.initialize();
        }

        // Initialize slider navigation
        initSliderNavigation();

        // Initialize accordion
        initializeAccordion();

        // Initialize gallery thumbnails
        initializeGalleryThumbnails();

        // Initial animation check
        setTimeout(() => {
            handleScrollAnimation();
        }, 100);

        // Scroll event listener
        window.addEventListener('scroll', handleScrollAnimation);

        // Resize event listener to handle mobile detection
        window.addEventListener('resize', () => {
            if (isMobile()) {
                // Reset transforms on mobile
                const heroSection = document.querySelector('.hero-slider-section');
                const mainSection = document.querySelector('.main-content-section');

                if (heroSection) heroSection.style.transform = 'none';
                if (mainSection) mainSection.style.transform = 'none';
            }
        });
    });

})();