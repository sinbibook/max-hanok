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
        const progressBar = document.querySelector('.hero-slider-progress');
        const prevButton = document.querySelector('#hero-prev');
        const nextButton = document.querySelector('#hero-next');
        const sliderElement = document.querySelector('#hero-slider') || document.querySelector('.hero-slider');

        if (slides.length === 0) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5초마다 전환
        const totalSlides = slides.length;
        let autoSlideTimer = null;
        let isTransitioning = false;

        // 이미지가 1개일 때 프로그레스바와 네비게이션 버튼 숨기기
        if (totalSlides === 1) {
            if (progressBar) {
                progressBar.style.display = 'none';
            }
            if (prevButton) {
                prevButton.style.display = 'none';
            }
            if (nextButton) {
                nextButton.style.display = 'none';
            }
        }

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
    window.initGallerySlider = initGallerySlider;

    // Room Image Slider
    function initRoomImageSlider() {
        const sliders = document.querySelectorAll('.room-image-slider');

        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.room-slide');
            const prevBtn = slider.querySelector('.room-slider-btn.prev') || slider.querySelector('.room-slider-prev');
            const nextBtn = slider.querySelector('.room-slider-btn.next') || slider.querySelector('.room-slider-next');

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
            if (nextBtn) nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
            });
            if (prevBtn) prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
            });

            // Auto-slide every 4 seconds
            setInterval(nextSlide, 4000);
        });
    }


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

            // Extract text content from room name (remove any HTML tags)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = room.name;
            const roomNameText = tempDiv.textContent || tempDiv.innerText;

            tab.innerHTML = `
                <span class="room-tab-number">${room.number}</span>
                <span class="room-tab-name">${roomNameText}</span>
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

    // 모바일 여부 확인
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Gallery Slider - 3세트 복제 + 인덱스 점프 무한 루프
    function initGallerySlider() {
        const wrapper = document.querySelector('.gallery-slider-wrapper');
        const track = document.querySelector('.gallery-slider-track');

        if (!track || track.children.length === 0) return;

        const isMobile = isMobileDevice();
        const gap = 40;
        const duration = 600;
        const autoInterval = 3000;
        const originalCount = parseInt(track.dataset.originalCount, 10) || 5;

        let currentIndex = originalCount; // 2번째 세트 첫 슬라이드부터 시작
        let timer = null;
        let busy = false;

        // 기본 슬라이드 너비 (active가 아닌 일반 슬라이드)
        function baseWidth() {
            return isMobile ? wrapper.offsetWidth * 0.9 : 300;
        }

        // active 슬라이드 너비
        function activeWidth() {
            return isMobile ? wrapper.offsetWidth * 0.9 : 480;
        }

        // 한 칸 이동 거리 (일반 슬라이드 기준, flex 레이아웃에서 일정)
        function stepSize() {
            return baseWidth() + gap;
        }

        // 특정 index를 중앙에 배치하는 translateX 계산
        // active의 왼쪽 가장자리 = index * stepSize() (앞의 슬라이드는 전부 baseWidth)
        // active의 중앙 = index * stepSize() + activeWidth() / 2
        function getTranslateX(index) {
            var center = wrapper.offsetWidth / 2;
            return center - (index * stepSize() + activeWidth() / 2);
        }

        // active 클래스 업데이트
        function updateActive(index) {
            var slides = track.children;
            for (var i = 0; i < slides.length; i++) {
                slides[i].classList.toggle('active', i === index);
            }
        }

        // track 위치 적용
        function applyPosition(animate) {
            var tx = getTranslateX(currentIndex);
            track.style.transition = animate ? 'transform ' + duration + 'ms ease' : 'none';
            track.style.transform = 'translateX(' + tx + 'px)';
        }

        // 모든 슬라이드의 CSS transition 비활성화 (점프 시 width 변화 숨기기)
        function freezeSlides() {
            var slides = track.children;
            for (var i = 0; i < slides.length; i++) {
                slides[i].style.transition = 'none';
            }
        }

        // 슬라이드 transition 복원 (CSS 기본값으로)
        function unfreezeSlides() {
            var slides = track.children;
            for (var i = 0; i < slides.length; i++) {
                slides[i].style.transition = '';
            }
        }

        // 세트 경계를 넘었으면 가운데 세트로 순간이동
        function wrapIfNeeded() {
            if (currentIndex >= originalCount * 2) {
                // 1) 슬라이드 transition 끄기 (width 480→300, 300→480 변화를 숨김)
                freezeSlides();
                // 2) 인덱스를 한 세트분 앞으로 이동
                currentIndex -= originalCount;
                // 3) active 클래스 즉시 이동
                updateActive(currentIndex);
                // 4) track 위치 즉시 이동 (translateX 차이 = originalCount * stepSize, 항상 일정)
                applyPosition(false);
                // 5) 브라우저에게 변경사항 즉시 반영 강제
                void track.offsetHeight;
                // 6) 다음 프레임에서 슬라이드 transition 복원
                requestAnimationFrame(function() {
                    unfreezeSlides();
                });
            }
        }

        function nextSlide() {
            if (busy) return;
            busy = true;

            currentIndex++;
            updateActive(currentIndex);
            applyPosition(true);

            setTimeout(function() {
                busy = false;
                wrapIfNeeded();
            }, duration + 50);
        }

        function start() {
            if (timer) clearInterval(timer);
            timer = setInterval(nextSlide, autoInterval);
        }

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        // 초기화
        updateActive(currentIndex);
        applyPosition(false);
        requestAnimationFrame(function() { start(); });

        wrapper.addEventListener('mouseenter', stop);
        wrapper.addEventListener('mouseleave', start);
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





    // Experience Gallery Accordion
    function initExperienceAccordion() {
        // No active class needed anymore, pure CSS hover effect
        // JavaScript can be used for additional functionality if needed
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


    // Also expose fallback data for reference
    window.fallbackRoomData = fallbackRoomData;
    window.fallbackGalleryData = fallbackGalleryData;

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


    // Closing Parallax Effect
    function initClosingParallax() {
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

            // 클로징 섹션이 뷰포트에 들어오기 시작했는지 확인
            const sectionBottom = sectionTop + sectionHeight;
            const isInView = scrollY + windowHeight > sectionTop && scrollY < sectionBottom;

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

    // Initialize everything
    function init() {
        // initHeroSlider는 index-mapper.js에서 슬라이드 생성 후 호출됨
        // generateGalleryContent는 index-mapper.js에서 처리됨
        // generateSignatureContent는 index-mapper.js에서 처리됨
        // initRoomImageSlider와 initRoomTabs는 index-mapper.js에서 room 생성 후 호출됨
        initScrollAnimations();
        // initRoomPreviewAnimation는 index-mapper.js에서 room 생성 후 호출됨
        initExperienceAccordion();
        initClosingParallax();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();