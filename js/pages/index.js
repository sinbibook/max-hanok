/**
 * Index Page - With Hero Slider and Room Tabs
 */

(function() {
    'use strict';

    // Hero Slider with Navigation and Touch Support
    function initHeroSlider(skipDelay = false) {
        const slides = document.querySelectorAll('.hero-slide');
        const currentNum = document.querySelector('.hero-slider-current');
        const totalNum = document.querySelector('.hero-slider-total');
        const progressFill = document.querySelector('.hero-slider-line-fill');
        const prevButton = document.querySelector('#hero-prev');
        const nextButton = document.querySelector('#hero-next');
        const sliderElement = document.querySelector('#hero-slider') || document.querySelector('.hero-slider');

        if (slides.length === 0) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5초마다 전환
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
            if (progressFill) {
                progressFill.style.transition = 'none';
                progressFill.style.width = '0%';

                setTimeout(() => {
                    progressFill.style.transition = `width ${slideInterval}ms linear`;
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

            // Reset auto-slide timer
            resetAutoSlide();

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
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
            }
            autoSlideTimer = setInterval(nextSlide, slideInterval);
        }

        // Touch and Mouse Events
        function getClientX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        }

        function handleStart(e) {
            if (isTransitioning) return;

            isDragging = true;
            startX = getClientX(e);
            currentX = startX;

            // Pause auto-slide during interaction
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
            }

            e.preventDefault();
        }

        function handleMove(e) {
            if (!isDragging || isTransitioning) return;
            currentX = getClientX(e);
            e.preventDefault();
        }

        function handleEnd(e) {
            if (!isDragging || isTransitioning) return;

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
            } else {
                // 충분히 움직이지 않았으면 자동 슬라이드 재시작
                resetAutoSlide();
            }
        }

        // Button Navigation
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
            });
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

        // Initialize progress
        updateProgress();

        // 자동 슬라이드 시작 - 파라미터에 따라 다르게 처리
        const startDelay = skipDelay ? 0 : 5000; // skipDelay가 true면 즉시, 아니면 5초 후

        setTimeout(() => {
            resetAutoSlide();
        }, startDelay);
    }

    // Expose to window for data mapper
    window.initHeroSlider = initHeroSlider;
    window.initRoomImageSlider = initRoomImageSlider;
    window.initRoomPreviewAnimation = initRoomPreviewAnimation;
    window.initSignatureSlider = initSignatureSlider;

    // Room Image Slider
    function initRoomImageSlider() {
        const sliders = document.querySelectorAll('.room-image-slider');

        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.room-slide');
            const prevBtn = slider.querySelector('.room-slider-prev');
            const nextBtn = slider.querySelector('.room-slider-next');

            if (slides.length === 0) return;

            let currentSlide = 0;

            function showSlide(index) {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            function prevSlide() {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            }

            // Button events
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);

            // Auto-slide every 4 seconds
            setInterval(nextSlide, 4000);
        });
    }

    // Fallback signature data for UI testing
    const fallbackSignatureData = [
        {
            id: "signature-1",
            imageUrl: "images/special.jpg",
            description: "Special for you",
            sortOrder: 0
        },
        {
            id: "signature-2",
            imageUrl: "images/special2.jpg",
            description: "오션뷰 개별테라스에서 즐기는 BBQ",
            sortOrder: 1
        }
    ];

    // Fallback gallery data for UI testing
    const fallbackGalleryData = {
        title: "Special Offers",
        description: "지세다의 다양한 부대시설입니다.",
        images: [
            {
                id: "gallery-1",
                url: "images/ppool.jpg",
                description: "아름다운 남해 바다가 한눈에 들어오는 프라이빗 풀",
                title: "PRIVATE POOL",
                sortOrder: 0,
                isSelected: true
            },
            {
                id: "gallery-2",
                url: "images/spa.jpg",
                description: "프라이빗한 공간에서 즐기는 럭셔리 스파 서비스",
                title: "OCEAN VIEW SPA",
                sortOrder: 1,
                isSelected: true
            },
            {
                id: "gallery-3",
                url: "images/terrace.jpg",
                description: "객실마다 제공되는 프라이빗 오션뷰 테라스",
                title: "PRIVATE TERRACE",
                sortOrder: 2,
                isSelected: true
            },
            {
                id: "gallery-4",
                url: "images/pool.jpg",
                description: "루프탑 수영장에서 즐기는 럭셔리 수영 경험",
                title: "LOOFTOP POOL",
                sortOrder: 3,
                isSelected: true
            }
        ]
    };

    // Fallback room data for UI testing
    const fallbackRoomData = {
        title: "Building Guide",
        description: "지세다의 A동과 B동을 소개합니다.",
        rooms: [
            {
                id: "room-1",
                number: "01",
                name: "A동 미디어아트",
                description: "미디어아트와 함께 즐기는 특별한 휴식 공간입니다. 최신 미디어 기술을 활용한 예술 작품들을 감상하며 색다른 경험을 제공합니다.",
                images: [
                    { src: "images/deluxe.jpg", alt: "A동 미디어아트 1" },
                    { src: "images/premier.jpg", alt: "A동 미디어아트 2" },
                    { src: "images/suite.jpg", alt: "A동 미디어아트 3" }
                ]
            },
            {
                id: "room-2",
                number: "02",
                name: "B동 반려동물 동반",
                description: "반려동물과 함께할 수 있는 편안한 공간입니다. 반려동물을 위한 특별한 시설과 서비스를 제공하여 가족 모두가 편안하게 머물 수 있습니다.",
                images: [
                    { src: "images/suite premier.jpg", alt: "B동 반려동물 1" },
                    { src: "images/penthouse.jpg", alt: "B동 반려동물 2" },
                    { src: "images/deluxe.jpg", alt: "B동 반려동물 3" }
                ]
            }
        ]
    };

    // Generate room tabs dynamically
    function generateRoomContent(roomData = fallbackRoomData) {
        const tabsContainer = document.querySelector('[data-room-tabs]');
        const descriptionsContainer = document.querySelector('[data-room-descriptions]');
        const imagesContainer = document.querySelector('[data-room-images]');

        if (!tabsContainer || !descriptionsContainer || !imagesContainer) return;

        // Clear existing content
        tabsContainer.innerHTML = '';
        descriptionsContainer.innerHTML = '';
        imagesContainer.innerHTML = '';

        // Generate tabs, descriptions, and image sliders
        roomData.rooms.forEach((room, index) => {
            // Generate tab
            const tab = document.createElement('button');
            tab.className = `room-tab${index === 0 ? ' active' : ''}`;
            tab.setAttribute('data-room', room.id);
            tab.innerHTML = `
                <span class="room-tab-number">${room.number}</span>
                <span class="room-tab-name">${room.name}</span>
            `;
            tabsContainer.appendChild(tab);

            // Generate description
            const descItem = document.createElement('div');
            descItem.className = `room-desc-item${index === 0 ? ' active' : ''}`;
            descItem.setAttribute('data-room', room.id);
            descItem.innerHTML = `<p class="room-desc-text">${room.description}</p>`;
            descriptionsContainer.appendChild(descItem);

            // Generate image slider
            const imageItem = document.createElement('div');
            imageItem.className = `room-image-item${index === 0 ? ' active' : ''}`;
            imageItem.setAttribute('data-room', room.id);

            const sliderHTML = `
                <div class="room-image-slider">
                    <div class="room-slide-track">
                        ${room.images.map((img, imgIndex) => `
                            <div class="room-slide${imgIndex === 0 ? ' active' : ''}">
                                <img src="${img.src}" alt="${img.alt}">
                            </div>
                        `).join('')}
                    </div>
                    <div class="room-slider-controls">
                        <button class="room-slider-prev">‹</button>
                        <button class="room-slider-next">›</button>
                    </div>
                </div>
            `;
            imageItem.innerHTML = sliderHTML;
            imagesContainer.appendChild(imageItem);
        });
    }

    // Generate gallery content dynamically
    function generateGalleryContent(galleryData = fallbackGalleryData) {
        const titleElement = document.querySelector('[data-gallery-title]');
        const descriptionElement = document.querySelector('[data-gallery-description]');
        const imagesWrapper = document.querySelector('[data-gallery-images]');

        if (!imagesWrapper) return;

        // Update title and description
        if (titleElement) titleElement.textContent = galleryData.title;
        if (descriptionElement) descriptionElement.textContent = galleryData.description;

        // Clear existing content
        imagesWrapper.innerHTML = '';

        // Filter only selected images and sort by sortOrder
        const selectedImages = galleryData.images
            .filter(img => img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        if (selectedImages.length === 0) return;

        // Split images into left and right groups
        const midPoint = Math.ceil(selectedImages.length / 2);
        const leftImages = selectedImages.slice(0, midPoint);
        const rightImages = selectedImages.slice(midPoint);

        // Generate left accordion group
        const leftAccordion = document.createElement('div');
        leftAccordion.className = 'experience-accordion-left';
        leftImages.forEach(img => {
            const item = document.createElement('div');
            item.className = 'experience-accordion-item';
            item.innerHTML = `
                <img src="${img.url}" alt="${img.title}">
                <div class="experience-accordion-overlay">
                    <h4>${img.title}</h4>
                </div>
            `;
            leftAccordion.appendChild(item);
        });

        // Generate right accordion group
        const rightAccordion = document.createElement('div');
        rightAccordion.className = 'experience-accordion-right';
        rightImages.forEach(img => {
            const item = document.createElement('div');
            item.className = 'experience-accordion-item';
            item.innerHTML = `
                <img src="${img.url}" alt="${img.title}">
                <div class="experience-accordion-overlay">
                    <h4>${img.title}</h4>
                </div>
            `;
            rightAccordion.appendChild(item);
        });

        // Add to wrapper
        imagesWrapper.appendChild(leftAccordion);
        imagesWrapper.appendChild(rightAccordion);
    }

    // Generate signature content dynamically
    function generateSignatureContent(signatureData = fallbackSignatureData) {
        const slidesContainer = document.querySelector('[data-signature-slides]');

        if (!slidesContainer) return;

        // Clear existing content
        slidesContainer.innerHTML = '';

        // Sort by sortOrder and generate slides
        const sortedSlides = [...signatureData].sort((a, b) => a.sortOrder - b.sortOrder);

        sortedSlides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = `signature-slide${index === 0 ? ' active' : ''}`;
            slideElement.innerHTML = `
                <div class="signature-slide-image">
                    <img src="${slide.imageUrl}" alt="${slide.description}">
                </div>
                <div class="signature-slide-content">
                    <span class="quote-mark quote-top">"</span>
                    <h3 class="signature-slide-title">${slide.description}</h3>
                    <span class="quote-mark quote-bottom">"</span>
                </div>
            `;
            slidesContainer.appendChild(slideElement);
        });
    }

    // Room Tabs
    function initRoomTabs() {
        // First generate room content with fallback data
        generateRoomContent();

        const tabs = document.querySelectorAll('.room-tab');
        const images = document.querySelectorAll('.room-image-item');
        const descItems = document.querySelectorAll('.room-desc-item');

        if (tabs.length === 0 || images.length === 0) return;

        function activateTab(tab) {
            const roomType = tab.dataset.room;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active image
            images.forEach(img => {
                if (img.dataset.room === roomType) {
                    img.classList.add('active');
                } else {
                    img.classList.remove('active');
                }
            });

            // Update active description item
            descItems.forEach(item => {
                if (item.dataset.room === roomType) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        tabs.forEach(tab => {
            // Desktop: hover event
            tab.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    activateTab(tab);
                }
            });

            // Mobile: click/touch event
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                activateTab(tab);
            });

            // Touch event for iOS
            tab.addEventListener('touchstart', (e) => {
                // Prevent default touch behavior
                e.preventDefault();
                activateTab(tab);
            }, { passive: false });
        });

        // Set default active state on load
        const defaultTab = document.querySelector('.room-tab[data-room="standard"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
    }

    // Scroll-triggered animations
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        // Essence section animations
        document.querySelectorAll('.essence-left-image, .essence-center-content, .essence-right-image').forEach(el => {
            observer.observe(el);
        });

        // Room preview section animations
        document.querySelectorAll('.room-preview-left, .room-preview-right').forEach(el => {
            observer.observe(el);
        });

        // Special Offers section animations (header only)
        document.querySelectorAll('.experience-header').forEach(el => {
            observer.observe(el);
        });

        // Experience accordion items animations
        document.querySelectorAll('.experience-accordion-item').forEach(el => {
            observer.observe(el);
        });

        // General fade animations
        document.querySelectorAll('.fade-in-up, .fade-in-scale').forEach(el => {
            observer.observe(el);
        });
    }

    // Essence section border radius animation
    function initEssenceBorderAnimation() {
        const essenceSection = document.querySelector('.essence-section');
        const leftImage = document.querySelector('.essence-left-image img');
        const rightImage = document.querySelector('.essence-right-image img');

        if (!essenceSection || !leftImage || !rightImage) return;

        // 초기값 설정
        leftImage.style.borderTopLeftRadius = '0';
        rightImage.style.borderTopRightRadius = '0';

        // Track animation state
        let animationTriggered = false;

        // IntersectionObserver로 섹션 감지
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    // 섹션이 30% 이상 보일 때 애니메이션 실행
                    if (!animationTriggered) {
                        animationTriggered = true;
                        setTimeout(() => {
                            leftImage.style.borderTopLeftRadius = '100px';
                            rightImage.style.borderTopRightRadius = '100px';
                        }, 300); // 0.3초 딜레이 후 실행
                    }
                } else if (!entry.isIntersecting) {
                    // 섹션이 뷰포트에서 완전히 벗어나면 리셋
                    animationTriggered = false;
                    leftImage.style.borderTopLeftRadius = '0';
                    rightImage.style.borderTopRightRadius = '0';
                }
            });
        }, { threshold: [0, 0.3, 1] });

        observer.observe(essenceSection);
    }

    // Room preview section border radius animation
    function initRoomPreviewAnimation() {
        const roomSection = document.querySelector('.room-preview-section');
        const roomImages = document.querySelectorAll('.room-image-item img');

        if (!roomSection || roomImages.length === 0) return;

        // 초기값 설정
        roomImages.forEach(img => {
            img.style.borderTopLeftRadius = '0';
        });

        // IntersectionObserver로 섹션 감지
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    // 섹션이 30% 이상 보일 때 애니메이션 실행
                    setTimeout(() => {
                        roomImages.forEach(img => {
                            img.style.borderTopLeftRadius = '100px';
                        });
                    }, 300);
                } else if (!entry.isIntersecting) {
                    // 섹션이 뷰포트에서 벗어나면 리셋
                    roomImages.forEach(img => {
                        img.style.borderTopLeftRadius = '0';
                    });
                }
            });
        }, { threshold: [0.3] });

        observer.observe(roomSection);
    }

    // Experience Gallery Accordion
    function initExperienceAccordion() {
        // No active class needed anymore, pure CSS hover effect
        // JavaScript can be used for additional functionality if needed
    }

    // Hero Image Half Border Animation using IntersectionObserver
    function initHeroImageHalfAnimation() {
        const heroImageHalves = document.querySelectorAll('.hero-image-half');

        if (heroImageHalves.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // isIntersecting 값에 따라 'animate-in' 클래스를 토글합니다.
                // 뷰포트에 들어오면 클래스를 추가하고, 나가면 제거합니다.
                entry.target.classList.toggle('animate-in', entry.isIntersecting);
            });
        }, {
            threshold: 0.7 // 요소가 70% 보일 때 콜백 실행
        });

        heroImageHalves.forEach(imageHalf => {
            observer.observe(imageHalf);
        });
    }

    // Signature Section Border Animation
    function initSignatureBorderAnimation() {
        const signatureSection = document.querySelector('.signature-section');
        const itemGroups = document.querySelectorAll('.signature-item-group');

        if (!signatureSection || itemGroups.length === 0) return;

        // Track animation state for each item
        const animationStates = new Array(itemGroups.length).fill(false);

        function handleScroll() {
            // Animate each group individually based on its visibility
            itemGroups.forEach((group, index) => {
                const groupTop = group.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                const triggerPoint = windowHeight * 0.7; // Trigger earlier for better visibility

                const imagesArea = group.querySelector('.signature-images-area');
                if (!imagesArea) return;

                if (groupTop < triggerPoint && !animationStates[index]) {
                    animationStates[index] = true;

                    if (index % 2 === 0) {
                        // Even index (0, 2, 4...) - left-aligned
                        // First image gets top-left radius
                        const firstImage = imagesArea.querySelector('.signature-image:first-child img');
                        if (firstImage) {
                            firstImage.style.borderTopLeftRadius = '100px';
                        }
                    } else {
                        // Odd index (1, 3, 5...) - right-aligned
                        // Horizontal image gets top-right radius
                        const horizontalImage = imagesArea.querySelector('.signature-image.horizontal img');
                        if (horizontalImage) {
                            horizontalImage.style.borderTopRightRadius = '100px';
                        }
                    }
                } else if (groupTop > windowHeight && animationStates[index]) {
                    animationStates[index] = false;

                    // Reset animations
                    if (index % 2 === 0) {
                        // Reset first image
                        const firstImage = imagesArea.querySelector('.signature-image:first-child img');
                        if (firstImage) {
                            firstImage.style.borderTopLeftRadius = '0';
                        }
                    } else {
                        // Reset horizontal image
                        const horizontalImage = imagesArea.querySelector('.signature-image.horizontal img');
                        if (horizontalImage) {
                            horizontalImage.style.borderTopRightRadius = '0';
                        }
                    }
                }
            });

        }

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position
    }

    // Section Navigation
    function initSectionNavigation() {
        const dots = document.querySelectorAll('.section-dot');
        const sections = document.querySelectorAll('section');
        const nav = document.querySelector('.section-nav');
        const closingSection = document.querySelector('.index-closing');

        if (dots.length === 0 || sections.length === 0) return;

        // Dot click event
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.section);
                if (index >= 0 && index < sections.length) {
                    // For closing section, use normal scroll
                    if (sections[index] === closingSection) {
                        window.scrollTo({
                            top: sections[index].offsetTop,
                            behavior: 'smooth'
                        });
                    } else {
                        sections[index].scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Update active dot on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const index = Array.from(sections).indexOf(entry.target);

                    // Update active dot
                    dots.forEach(d => d.classList.remove('active'));
                    if (dots[index]) {
                        dots[index].classList.add('active');
                    }

                    // Change nav color for light sections
                    if (index === 1 || index === 2 || index === 3 || index === 4) {
                        nav.classList.add('dark');
                    } else {
                        nav.classList.remove('dark');
                    }
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Fullpage Scroll
    function initFullpageScroll() {
        const sections = document.querySelectorAll('section:not(.index-closing)'); // Exclude closing section
        const closingSection = document.querySelector('.index-closing');
        let currentSectionIndex = 0;
        let isScrolling = false;
        let normalScrollArea = false;

        function scrollToSection(index) {
            if (index < 0 || index >= sections.length || isScrolling) return;

            isScrolling = true;
            currentSectionIndex = index;

            sections[index].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }

        // Check if we're in normal scroll area (closing section and below)
        function checkScrollPosition() {
            if (!closingSection) return;

            const closingRect = closingSection.getBoundingClientRect();

            // If closing section is visible at all
            if (closingRect.top < window.innerHeight) {
                normalScrollArea = true;
            } else if (closingRect.top > window.innerHeight) {
                normalScrollArea = false;
            }
        }

        // Mouse wheel event
        let lastScrollTime = 0;
        const scrollThrottle = 1000; // Throttle scroll events

        window.addEventListener('wheel', (e) => {
            checkScrollPosition();

            // Allow normal scrolling in closing section and below
            if (normalScrollArea) {
                // If scrolling up and closing section is at the top of viewport
                const closingRect = closingSection.getBoundingClientRect();
                if (e.deltaY < 0 && closingRect.top >= 0 && closingRect.top < 10) {
                    e.preventDefault();
                    normalScrollArea = false;
                    scrollToSection(sections.length - 1);
                    return;
                }
                // Otherwise allow normal scrolling
                return;
            }

            e.preventDefault();

            const now = Date.now();
            if (now - lastScrollTime < scrollThrottle) return;
            lastScrollTime = now;

            if (e.deltaY > 0) {
                // Scroll down
                if (currentSectionIndex === sections.length - 1) {
                    // If at last fullpage section, allow normal scroll to closing
                    normalScrollArea = true;
                    window.scrollTo({
                        top: closingSection.offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    scrollToSection(currentSectionIndex + 1);
                }
            } else {
                // Scroll up
                scrollToSection(currentSectionIndex - 1);
            }
        }, { passive: false });

        // Touch events for mobile
        let touchStartY = 0;
        let touchEndY = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        window.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].clientY;

            const diff = touchStartY - touchEndY;
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    // Swipe up - scroll down
                    scrollToSection(currentSectionIndex + 1);
                } else {
                    // Swipe down - scroll up
                    scrollToSection(currentSectionIndex - 1);
                }
            }
        });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                scrollToSection(currentSectionIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                scrollToSection(currentSectionIndex - 1);
            }
        });

        // Update current section on scroll
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
                    if (index !== -1) {
                        currentSectionIndex = index;
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Signature Section Slider
    function initSignatureSlider() {
        const slides = document.querySelectorAll('.signature-slide');
        const signatureSection = document.querySelector('.signature-section');
        const slideImages = document.querySelectorAll('.signature-slide-image img');

        if (slides.length === 0) return;

        let currentSlide = 0;
        const slideInterval = 4000; // 4초마다 전환

        // 첫 번째 슬라이드 활성화
        slides[0].classList.add('active');

        // 초기값 설정
        slideImages.forEach(img => {
            img.style.borderTopLeftRadius = '0';
            img.style.transition = 'border-radius 0.8s ease';
        });

        function nextSlide() {
            // 현재 슬라이드 숨기기
            slides[currentSlide].classList.remove('active');

            // 다음 슬라이드 계산
            currentSlide = (currentSlide + 1) % slides.length;

            // 다음 슬라이드 보이기
            slides[currentSlide].classList.add('active');
        }

        // 자동 슬라이드 시작
        setInterval(nextSlide, slideInterval);

        // 스크롤 시 border-radius 애니메이션
        if (signatureSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                        // 섹션이 30% 이상 보일 때 애니메이션 실행
                        setTimeout(() => {
                            slideImages.forEach(img => {
                                img.style.borderTopLeftRadius = '100px';
                            });
                        }, 300);
                    } else if (!entry.isIntersecting) {
                        // 섹션이 뷰포트에서 벗어나면 리셋
                        slideImages.forEach(img => {
                            img.style.borderTopLeftRadius = '0';
                        });
                    }
                });
            }, { threshold: [0.3] });

            observer.observe(signatureSection);
        }
    }

    // Check if logo animation should be shown
    function shouldShowLogoAnimation() {
        // Check if this is a first visit (no session storage flag)
        const hasVisited = sessionStorage.getItem('hasVisitedHero');

        // Check if user came from another page (has referrer)
        const hasReferrer = document.referrer && document.referrer.includes(window.location.hostname);

        // Show animation only if user hasn't visited during this session AND it's not a navigation from another page
        if (!hasVisited && !hasReferrer) {
            sessionStorage.setItem('hasVisitedHero', 'true');
            return true;
        }

        return false;
    }

    // Initialize brand reveal animation
    function initBrandRevealAnimation() {
        const brandReveal = document.getElementById('hero-brand-reveal');
        const heroContent = document.getElementById('hero-content');
        const brandName = document.getElementById('brand-name');
        const heroImages = document.querySelectorAll('.hero-image');
        const heroOverlays = document.querySelectorAll('.hero-image-overlay');

        if (!brandReveal) return;

        const showAnimation = shouldShowLogoAnimation();

        if (!showAnimation) {
            // Skip brand reveal animation - hide it immediately
            brandReveal.style.display = 'none';

            // Show hero content immediately with smooth entrance animation
            if (heroContent) {
                heroContent.classList.remove('with-animation');
                heroContent.classList.add('no-animation');
                // Ensure content is visible
                heroContent.style.opacity = '1';
            }
            if (brandName) {
                brandName.classList.remove('with-animation');
                brandName.classList.add('no-animation');
                // Ensure brand name is visible
                brandName.style.opacity = '1';
                brandName.style.transform = 'none';
            }

            // Set hero images and overlays to appear immediately
            heroImages.forEach(image => {
                image.classList.remove('with-animation');
                image.classList.add('no-animation');
            });
            heroOverlays.forEach(overlay => {
                overlay.classList.remove('with-animation');
                overlay.classList.add('no-animation');
            });

            // Apply a subtle entrance animation for smooth transition
            requestAnimationFrame(() => {
                if (heroContent) {
                    heroContent.style.animation = 'fadeInQuick 0.6s ease-out forwards';
                }
                if (brandName) {
                    brandName.style.animation = 'slideInQuick 0.8s ease-out forwards';
                }
            });

            return false; // 애니메이션 없음을 반환

        } else {
            // Show full animation sequence
            brandReveal.style.display = 'flex';

            // Keep animation classes
            if (heroContent) {
                heroContent.classList.add('with-animation');
                heroContent.classList.remove('no-animation');
            }
            if (brandName) {
                brandName.classList.add('with-animation');
                brandName.classList.remove('no-animation');
            }

            // Set hero images and overlays to use full animation
            heroImages.forEach(image => {
                image.classList.add('with-animation');
                image.classList.remove('no-animation');
            });
            heroOverlays.forEach(overlay => {
                overlay.classList.add('with-animation');
                overlay.classList.remove('no-animation');
            });

            return true; // 애니메이션 있음을 반환
        }
    }

    // Expose content generators globally for testing
    window.updateRoomContent = function(newRoomData) {
        generateRoomContent(newRoomData);
        // Re-initialize tabs after updating content
        initRoomTabs();
        initRoomImageSlider();
    };

    window.updateGalleryContent = function(newGalleryData) {
        generateGalleryContent(newGalleryData);
    };

    window.updateSignatureContent = function(newSignatureData) {
        generateSignatureContent(newSignatureData);
        // Re-initialize signature slider after updating content
        initSignatureSlider();
    };

    // Also expose fallback data for reference
    window.fallbackRoomData = fallbackRoomData;
    window.fallbackGalleryData = fallbackGalleryData;
    window.fallbackSignatureData = fallbackSignatureData;

    // Console testing helpers
    window.testRoomData = {
        // Test with 3 rooms
        test3Rooms: function() {
            const testData = {
                title: "Test Building Guide",
                description: "테스트용 건물 가이드입니다.",
                rooms: [
                    {
                        id: "test-room-1",
                        number: "01",
                        name: "테스트 룸 A",
                        description: "첫 번째 테스트 룸입니다.",
                        images: [
                            { src: "images/deluxe.jpg", alt: "테스트 이미지 1" },
                            { src: "images/premier.jpg", alt: "테스트 이미지 2" }
                        ]
                    },
                    {
                        id: "test-room-2",
                        number: "02",
                        name: "테스트 룸 B",
                        description: "두 번째 테스트 룸입니다.",
                        images: [
                            { src: "images/suite.jpg", alt: "테스트 이미지 3" }
                        ]
                    },
                    {
                        id: "test-room-3",
                        number: "03",
                        name: "테스트 룸 C",
                        description: "세 번째 테스트 룸입니다.",
                        images: [
                            { src: "images/penthouse.jpg", alt: "테스트 이미지 4" },
                            { src: "images/deluxe.jpg", alt: "테스트 이미지 5" },
                            { src: "images/suite premier.jpg", alt: "테스트 이미지 6" }
                        ]
                    }
                ]
            };
            window.updateRoomContent(testData);
        },

        // Test with 1 room only
        test1Room: function() {
            const testData = {
                title: "Single Room Test",
                description: "한 개 룸 테스트입니다.",
                rooms: [
                    {
                        id: "single-room",
                        number: "01",
                        name: "싱글 룸",
                        description: "하나뿐인 특별한 룸입니다.",
                        images: [
                            { src: "images/suite.jpg", alt: "싱글 룸 이미지" }
                        ]
                    }
                ]
            };
            window.updateRoomContent(testData);
        },

        // Reset to default
        resetToDefault: function() {
            window.updateRoomContent(window.fallbackRoomData);
        }
    };

    // Gallery testing helpers
    window.testGalleryData = {
        // Test with 2 images only
        test2Images: function() {
            const testData = {
                title: "2개 이미지 테스트",
                description: "2개 이미지로 테스트 중입니다.",
                images: [
                    {
                        id: "test-1",
                        url: "images/deluxe.jpg",
                        description: "첫 번째 테스트 이미지",
                        title: "TEST IMAGE 1",
                        sortOrder: 0,
                        isSelected: true
                    },
                    {
                        id: "test-2",
                        url: "images/premier.jpg",
                        description: "두 번째 테스트 이미지",
                        title: "TEST IMAGE 2",
                        sortOrder: 1,
                        isSelected: true
                    }
                ]
            };
            window.updateGalleryContent(testData);
        },

        // Test with 6 images
        test6Images: function() {
            const testData = {
                title: "6개 이미지 테스트",
                description: "6개 이미지로 테스트 중입니다.",
                images: [
                    {
                        id: "test-1", url: "images/deluxe.jpg", description: "첫 번째",
                        title: "TEST 1", sortOrder: 0, isSelected: true
                    },
                    {
                        id: "test-2", url: "images/premier.jpg", description: "두 번째",
                        title: "TEST 2", sortOrder: 1, isSelected: true
                    },
                    {
                        id: "test-3", url: "images/suite.jpg", description: "세 번째",
                        title: "TEST 3", sortOrder: 2, isSelected: true
                    },
                    {
                        id: "test-4", url: "images/penthouse.jpg", description: "네 번째",
                        title: "TEST 4", sortOrder: 3, isSelected: true
                    },
                    {
                        id: "test-5", url: "images/ppool.jpg", description: "다섯 번째",
                        title: "TEST 5", sortOrder: 4, isSelected: true
                    },
                    {
                        id: "test-6", url: "images/spa.jpg", description: "여섯 번째",
                        title: "TEST 6", sortOrder: 5, isSelected: true
                    }
                ]
            };
            window.updateGalleryContent(testData);
        },

        // Reset to default gallery
        resetToDefault: function() {
            window.updateGalleryContent(window.fallbackGalleryData);
        }
    };


    // Initialize everything
    // Check if device is mobile or tablet
    function isMobileOrTablet() {
        return window.innerWidth <= 1024;
    }

    function init() {
        const hasAnimation = initBrandRevealAnimation();
        // initHeroSlider는 index-mapper.js에서 슬라이드 생성 후 호출됨
        // generateGalleryContent는 index-mapper.js에서 처리됨
        // generateSignatureContent는 index-mapper.js에서 처리됨
        // initRoomImageSlider와 initRoomTabs는 index-mapper.js에서 room 생성 후 호출됨
        initScrollAnimations();
        initEssenceBorderAnimation();
        // initRoomPreviewAnimation는 index-mapper.js에서 room 생성 후 호출됨
        initExperienceAccordion();
        initSignatureBorderAnimation();
        // initSignatureSlider는 index-mapper.js에서 슬라이드 생성 후 호출됨

        // Only enable section navigation and fullpage scroll on desktop
        if (!isMobileOrTablet()) {
            initSectionNavigation();
            initFullpageScroll();
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();