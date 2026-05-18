/**
 * Facility Detail Page JavaScript
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

    // Update progress bar (0 to 100%)
    function updateProgressBar() {
        const progressFill = document.getElementById('hero-progress-fill');
        if (progressFill) {
            // Reset progress bar to 0 and animate to 100%
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

    // Initialize slider navigation
    function initSliderNavigation() {
        const prevButton = document.querySelector('#hero-prev');
        const nextButton = document.querySelector('#hero-next');
        const sliderElement = document.querySelector('#hero-slider');

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

        // Pause on hover
        if (sliderElement) {
            sliderElement.addEventListener('mouseenter', stopAutoSlide);
            sliderElement.addEventListener('mouseleave', startAutoSlide);
        }
    }

    // Scroll animation and parallax effect with throttling
    function handleScrollAnimation() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const elements = document.querySelectorAll('.facility-intro-section, .facility-images-section, .facility-usage-section, .facility-content-section, .facility-experience-section, .facility-gallery-section');

                elements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const elementVisible = 150;

                    if (elementTop < window.innerHeight - elementVisible) {
                        element.classList.add('animate');
                    }
                });

                // New Parallax effect
                applyParallaxEffect();

                ticking = false;
            });
            ticking = true;
        }
    }

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

    // Initialize usage grid functionality
    function initializeUsageGrid() {
        const gridContainer = document.getElementById('usage-grid-container');
        if (!gridContainer) return;

        // Count visible grid items
        const gridItems = gridContainer.querySelectorAll('.usage-grid-item');
        const visibleItems = Array.from(gridItems).filter(item =>
            item.style.display !== 'none' && !item.hasAttribute('hidden')
        );

        // Set data attribute for CSS grid adjustment
        gridContainer.setAttribute('data-items', visibleItems.length.toString());
    }

    // Function to add facility usage data dynamically
    function addUsageGridItem(title, features) {
        const gridContainer = document.getElementById('usage-grid-container');
        if (!gridContainer) return;

        const gridItem = document.createElement('div');
        gridItem.className = 'usage-grid-item';

        let featuresHTML = '';
        features.forEach(feature => {
            featuresHTML += `
                <div class="usage-feature-item">
                    <h4 class="feature-title">${feature.title}</h4>
                    <p class="feature-description">${feature.description}</p>
                </div>
            `;
        });

        gridItem.innerHTML = `
            <div class="usage-grid-header">
                <h3 class="usage-grid-title">${title}</h3>
            </div>
            <div class="usage-grid-content">
                ${featuresHTML}
            </div>
        `;

        gridContainer.appendChild(gridItem);

        // Update grid layout
        initializeUsageGrid();
    }

    // Function to remove usage grid item
    function removeUsageGridItem(index) {
        const gridContainer = document.getElementById('usage-grid-container');
        if (!gridContainer) return;

        const gridItems = gridContainer.querySelectorAll('.usage-grid-item');
        if (gridItems[index]) {
            gridItems[index].remove();
            // Update grid layout
            initializeUsageGrid();
        }
    }


    // Initialize experience tabs
    function initializeExperienceTabs() {
        const tabButtons = document.querySelectorAll('.facility-experience-tab-button');
        const tabContents = document.querySelectorAll('.facility-experience-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTabId = this.getAttribute('data-tab');

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(targetTabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Scroll image border-radius animation
    function initImageBorderAnimation() {
        const horizontalImages = document.querySelectorAll('.facility-img-horizontal');
        const verticalImages = document.querySelectorAll('.facility-img-vertical');
        const contentImages = document.querySelectorAll('.facility-content-img');

        // 초기값 설정
        horizontalImages.forEach(img => {
            img.style.borderTopLeftRadius = '0';
        });

        verticalImages.forEach(img => {
            img.style.borderTopRightRadius = '0';
        });

        contentImages.forEach(img => {
            img.style.borderTopLeftRadius = '0';
        });

        // IntersectionObserver로 각 이미지 감지
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    // 이미지가 30% 이상 보일 때 애니메이션 실행
                    setTimeout(() => {
                        if (img.classList.contains('facility-img-horizontal') || img.classList.contains('facility-content-img')) {
                            img.style.borderTopLeftRadius = '100px';
                        } else if (img.classList.contains('facility-img-vertical')) {
                            img.style.borderTopRightRadius = '100px';
                        }
                    }, 300);
                } else if (!entry.isIntersecting) {
                    // 이미지가 뷰포트에서 벗어나면 리셋
                    if (img.classList.contains('facility-img-horizontal') || img.classList.contains('facility-content-img')) {
                        img.style.borderTopLeftRadius = '0';
                    } else if (img.classList.contains('facility-img-vertical')) {
                        img.style.borderTopRightRadius = '0';
                    }
                }
            });
        }, { threshold: [0.3] });

        // 모든 이미지 관찰
        [...horizontalImages, ...verticalImages, ...contentImages].forEach(img => {
            observer.observe(img);
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // FacilityMapper 초기화
        if (typeof FacilityMapper !== 'undefined') {
            const facilityMapper = new FacilityMapper();
            await facilityMapper.initialize();
            await facilityMapper.mapPage();
        }

        // Initialize slider navigation and auto-slide
        initSliderNavigation();
        startAutoSlide();
        updatePageNumbers();
        updateProgressBar();

        // Initialize usage grid
        initializeUsageGrid();

        // Initialize experience tabs
        initializeExperienceTabs();

        // Initialize image border animation (disabled)
        // initImageBorderAnimation();

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

    // Facility Carousel Slider (index 경험 갤러리 스타일)
    window.initializeFacilityCarousel = function() {
        if (isMobile()) {
            initFacilityCarouselMobile();
        } else {
            initFacilityCarouselDesktop();
        }
    };

    function initFacilityCarouselMobile() {
        const wrapper = document.querySelector('.gallery-slider-wrapper');
        const track = document.querySelector('#facility-gallery-track');
        let slides = document.querySelectorAll('.gallery-slide');

        if (!track || !wrapper || slides.length === 0) {
            return;
        }

        const originalSlideCount = slides.length / 2;
        const gap = 40;
        let currentIndex = 0;
        let autoSlideTimer = null;
        const autoSlideInterval = 4000;

        function updatePosition(animate = true) {
            slides = document.querySelectorAll('.gallery-slide');
            const wrapperWidth = wrapper.offsetWidth;
            const slideWidth = wrapperWidth * 0.9;

            if (animate) {
                track.style.transition = 'transform 0.6s ease';
            } else {
                track.style.transition = 'none';
            }

            track.style.transform = `translateX(${-(currentIndex * (slideWidth + gap))}px)`;

            // Update active state and opacity
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                const originalIndex = index % originalSlideCount;
                const currentIndexModulo = currentIndex % originalSlideCount;
                if (originalIndex === currentIndexModulo) {
                    slide.classList.add('active');
                    slide.style.opacity = '1';
                } else {
                    slide.style.opacity = '0.4';
                }
            });
        }

        function nextSlide() {
            currentIndex++;
            if (currentIndex >= originalSlideCount * 2) {
                track.style.transition = 'none';
                currentIndex = originalSlideCount;
                updatePosition(false);

                setTimeout(() => {
                    track.style.transition = 'transform 0.6s ease';
                }, 50);
            } else {
                updatePosition(true);
            }
        }

        function startAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(nextSlide, autoSlideInterval);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        updatePosition(false);
        startAutoSlide();

        // Hover to pause/resume
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);
    }

    function initFacilityCarouselDesktop() {
        const wrapper = document.querySelector('.gallery-slider-wrapper');
        const track = document.querySelector('#facility-gallery-track');
        let slides = document.querySelectorAll('.gallery-slide');

        if (!track || !wrapper || slides.length === 0) {
            return;
        }

        const originalSlideCount = slides.length / 2;
        const slideWidth = 300;
        const activeSlideWidth = 480;
        const gap = 40;
        let currentIndex = 2;
        let autoSlideTimer = null;
        const autoSlideInterval = 4000;
        let isTransitioning = false;

        // Calculate slide position
        function calculatePosition(index) {
            const wrapperWidth = wrapper.offsetWidth;
            let totalWidth = 0;
            for (let i = 0; i < index; i++) {
                totalWidth += slideWidth + gap;
            }

            const sidePadding = (wrapperWidth - activeSlideWidth) / 2;
            return -(totalWidth - sidePadding);
        }

        // Update position
        function updatePosition(animate = true) {
            slides = document.querySelectorAll('.gallery-slide');
            const position = calculatePosition(currentIndex);

            if (animate) {
                track.style.transition = 'transform 0.6s ease';
                isTransitioning = true;
            } else {
                track.style.transition = 'none';
            }

            track.style.transform = `translateX(${position}px)`;

            // Update active state and opacity
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                const originalIndex = index % originalSlideCount;
                const currentIndexModulo = currentIndex % originalSlideCount;
                slide.style.opacity = (originalIndex === currentIndexModulo) ? '1' : '0.4';
            });

            const slideToActivate = slides[currentIndex];
            if (slideToActivate) {
                slideToActivate.classList.add('active');
            }

            if (animate) {
                setTimeout(() => {
                    isTransitioning = false;
                }, 600);
            }
        }

        // Next slide
        function nextSlide() {
            if (isTransitioning) return;

            currentIndex++;

            if (currentIndex >= originalSlideCount * 2) {
                track.style.transition = 'none';
                currentIndex = originalSlideCount;
                updatePosition(false);

                setTimeout(() => {
                    track.style.transition = 'transform 0.6s ease';
                }, 50);
            } else {
                updatePosition(true);
            }
        }

        function startAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(nextSlide, autoSlideInterval);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        // Initialize
        updatePosition(false);
        startAutoSlide();

        // Hover to pause/resume
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);
    }

    // Expose functions globally for external access
    window.facilityGrid = {
        addItem: addUsageGridItem,
        removeItem: removeUsageGridItem,
        refresh: initializeUsageGrid
    };

    // Slider initialization callback for FacilityMapper
    window.initializeFacilitySlider = function() {
        // Initialize slider using common module
        const sliderInstance = window.SliderModule.initializeSlider('#hero-slider', {
            slideInterval: 4000,
            autoPlay: true,
            navigation: true,
            pagination: true,
            touchEnabled: true,
            skipInitialDelay: false,
            onSlideChange: (slideIndex) => {
                currentSlideIndex = slideIndex;
                updatePageNumbers();
            }
        });

        return sliderInstance;
    };

})();