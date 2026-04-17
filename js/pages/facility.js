/**
 * Facility Detail Page JavaScript
 */

(function() {
    'use strict';

    let currentSlideIndex = 0;
    let autoSlideInterval;
    let ticking = false;

    // Update page numbers (callback for slider module)
    function updatePageNumbers() {
        const currentPageEl = document.getElementById('hero-current');
        const totalPagesEl = document.getElementById('hero-total');
        const slides = document.querySelectorAll('.hero-slide'); // Dynamic count

        if (currentPageEl) {
            currentPageEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
        }

        if (totalPagesEl) {
            totalPagesEl.textContent = String(slides.length).padStart(2, '0');
        }
    }

    // Scroll animation and parallax effect with throttling
    function handleScrollAnimation() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const elements = document.querySelectorAll('.facility-intro-section, .facility-images-section, .facility-usage-section, .facility-content-section');

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
        }

        // Initialize usage grid
        initializeUsageGrid();

        // Initialize image border animation
        initImageBorderAnimation();

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