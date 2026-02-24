/**
 * Index Page Script
 * - Scroll animations (IntersectionObserver)
 * - Parallax backgrounds
 * - Room preview carousel
 * - Smooth scroll
 */

(function() {
    'use strict';

    function init() {
        initScrollAnimations();
        initParallax();
        initRoomPreviewCarousel();
        initSmoothScroll();
        initSpecialSlideshow();
        initMainSlideshow();
    }

    // ==========================================
    // Scroll Animations (IntersectionObserver)
    // ==========================================
    function initScrollAnimations() {
        var animElements = document.querySelectorAll(
            '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale-in, .title-text'
        );

        if (!animElements.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        animElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ==========================================
    // Parallax Background on Scroll
    // ==========================================
    function initParallax() {
        var parallaxElements = [
            { selector: '.main-bg', speed: 0.3 }
        ];

        var items = [];
        parallaxElements.forEach(function(config) {
            var el = document.querySelector(config.selector);
            if (el) {
                items.push({ el: el, speed: config.speed, parent: el.parentElement });
            }
        });

        if (!items.length) return;

        var ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    var scrollY = window.pageYOffset;
                    items.forEach(function(item) {
                        var rect = item.parent.getBoundingClientRect();
                        var parentTop = rect.top + scrollY;
                        var offset = (scrollY - parentTop) * item.speed;
                        item.el.style.transform = 'translateY(' + offset + 'px)';
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==========================================
    // Room Preview Carousel
    // ==========================================
    function initRoomPreviewCarousel() {
        var track = document.querySelector('.room-scroll-track');
        if (!track) return;

        var prevBtn = document.querySelector('.nav-btn.prev');
        var nextBtn = document.querySelector('.nav-btn.next');

        var speed = 1;
        var position = 0;
        var halfWidth = 0;
        var cardWidth = 0;
        var isManualMoving = false;

        function measure() {
            halfWidth = track.scrollWidth / 2;
            var firstCard = track.querySelector('.room-card');
            if (firstCard) {
                cardWidth = firstCard.offsetWidth + 40;
            }
        }

        measure();

        function tick() {
            if (!isManualMoving) {
                position -= speed;
                if (position <= -halfWidth) {
                    position += halfWidth;
                }
                track.style.transform = 'translateX(' + position + 'px)';
            }
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);

        function manualMove(direction) {
            isManualMoving = true;
            var target = position + (direction * cardWidth);

            var start = position;
            var distance = target - start;
            var duration = 400;
            var startTime = null;

            function animate(time) {
                if (!startTime) startTime = time;
                var elapsed = time - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var ease = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;

                position = start + distance * ease;

                if (position <= -halfWidth) {
                    position += halfWidth;
                } else if (position > 0) {
                    position -= halfWidth;
                }

                track.style.transform = 'translateX(' + position + 'px)';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isManualMoving = false;
                }
            }

            requestAnimationFrame(animate);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!isManualMoving) manualMove(1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!isManualMoving) manualMove(-1);
            });
        }

        window.addEventListener('resize', measure);
    }

    // ==========================================
    // Smooth Scroll
    // ==========================================
    function initSmoothScroll() {
        var links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                var target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ==========================================
    // Special Slideshow (Content-3 Image Rolling)
    // ==========================================
    function initSpecialSlideshow() {
        var content3 = document.querySelector('.content-3');
        if (!content3) return;

        var slides = content3.querySelectorAll('.meditation-image .facility-slide');
        var total = slides.length;
        if (total === 0) return;

        var current = 0;
        var progress = content3.querySelector('.bar-progress');
        var barBtns = content3.querySelectorAll('.bar-controls button');

        function showSlide(index) {
            var containers = ['.meditation-image', '.meditation-info', '.special-right-image'];
            containers.forEach(function(sel) {
                content3.querySelectorAll(sel + ' .facility-slide').forEach(function(el, i) {
                    el.classList.toggle('active', i === index);
                });
            });
        }

        showSlide(0);

        if (progress) {
            progress.addEventListener('animationiteration', function() {
                current = (current + 1) % total;
                showSlide(current);
            });
        }

        function restartProgress() {
            if (!progress) return;
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }

        if (barBtns.length >= 2) {
            barBtns[0].addEventListener('click', function() {
                current = (current - 1 + total) % total;
                showSlide(current);
                restartProgress();
            });
            barBtns[1].addEventListener('click', function() {
                current = (current + 1) % total;
                showSlide(current);
                restartProgress();
            });
        }
    }

    // ==========================================
    // Main Hero Slideshow
    // ==========================================
    function initMainSlideshow() {
        var slides = document.querySelectorAll('.main-slide');
        if (slides.length === 0) return;

        // 슬라이드 1개: active만 붙이고 화살표 숨김 후 종료
        if (slides.length === 1) {
            slides[0].classList.add('active');
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    slides[0].classList.add('zoom-in');
                });
            });
            var arrow = document.querySelector('.main-arrow');
            if (arrow) arrow.style.display = 'none';
            return;
        }

        var bg = document.querySelector('.main-bg');
        var progress = document.querySelector('.title-divider .bar-progress');
        var arrowNums = document.querySelectorAll('.main-arrow .arrow-number');
        var arrowLeft = document.querySelector('.main-arrow .arrow-left');
        var arrowRight = document.querySelector('.main-arrow .arrow-right');
        var current = 0;
        var total = slides.length;

        function padNum(n) {
            return n < 10 ? '0' + n : '' + n;
        }

        function updateNumbers() {
            if (arrowNums.length >= 2) {
                arrowNums[0].textContent = padNum(current + 1);
                arrowNums[1].textContent = padNum(total);
            }
        }

        // 모바일: overflow-x scroll 컨테이너인지 확인
        function isMobileScroll() {
            return bg && bg.scrollWidth > bg.clientWidth;
        }

        function goTo(index) {
            slides[current].classList.remove('active');
            slides[current].classList.remove('zoom-in');
            current = (index + total) % total;
            slides[current].classList.add('active');
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    slides[current].classList.add('zoom-in');
                });
            });
            updateNumbers();
            // 모바일: CSS scroll snap 컨테이너를 직접 스크롤
            if (isMobileScroll()) {
                bg.scrollTo({ left: current * bg.offsetWidth, behavior: 'smooth' });
            }
        }

        function restartProgress() {
            if (!progress) return;
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }

        updateNumbers();

        slides[0].classList.add('active');
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                slides[0].classList.add('zoom-in');
            });
        });

        if (progress) {
            progress.addEventListener('animationiteration', function() {
                goTo(current + 1);
            });
        }

        // 모바일: 사용자 스와이프로 슬라이드 변경 시 current 동기화
        if (bg) {
            var scrollTimer;
            bg.addEventListener('scroll', function() {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(function() {
                    var snapped = Math.round(bg.scrollLeft / bg.offsetWidth);
                    if (snapped !== current && snapped >= 0 && snapped < total) {
                        slides[current].classList.remove('active', 'zoom-in');
                        current = snapped;
                        slides[current].classList.add('active', 'zoom-in');
                        updateNumbers();
                        restartProgress();
                    }
                }, 150);
            });
        }

        if (arrowLeft) {
            arrowLeft.style.cursor = 'pointer';
            arrowLeft.addEventListener('click', function() {
                goTo(current - 1);
                restartProgress();
            });
        }

        if (arrowRight) {
            arrowRight.style.cursor = 'pointer';
            arrowRight.addEventListener('click', function() {
                goTo(current + 1);
                restartProgress();
            });
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 매퍼에서 슬라이더 재초기화 시 사용
    window.initHeroSlider = initMainSlideshow;
    window.initRoomCarousel = initRoomPreviewCarousel;
    window.initFacilitySlideshow = initSpecialSlideshow;
})();
