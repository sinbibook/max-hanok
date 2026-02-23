// Room 페이지 JavaScript
(function() {
    'use strict';

    // ==========================================
    // Main Hero Slideshow
    // ==========================================
    function initMainSlideshow() {
        var slides = document.querySelectorAll('.main-slide');
        if (slides.length === 0) return;

        // 슬라이드 1개: active + zoom-in 붙이고 화살표 숨김
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

    // ==========================================
    // Room Exterior Slider (이미지 + 탭 연동)
    // ==========================================
    function initRoomSlider() {
        var slides = document.querySelectorAll('.img-frame .room-slide');
        var tabs = document.querySelectorAll('.slider-tabs .tab-item');
        var progress = document.querySelector('.section-room .bar-progress');
        var prevBtn = document.querySelector('.room-prev');
        var nextBtn = document.querySelector('.room-next');

        if (slides.length === 0) return;

        // 슬라이드 1개: 화살표/프로그레스 숨김
        if (slides.length === 1) {
            slides[0].classList.add('active');
            if (tabs[0]) tabs[0].classList.add('active');
            var specialBar = document.querySelector('.special-bar');
            if (specialBar) specialBar.style.display = 'none';
            return;
        }

        var current = 0;
        var total = slides.length;

        function goTo(index) {
            slides[current].classList.remove('active');
            if (tabs[current]) tabs[current].classList.remove('active');
            current = (index + total) % total;
            slides[current].classList.add('active');
            if (tabs[current]) tabs[current].classList.add('active');
        }

        function restartProgress() {
            if (!progress) return;
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }

        if (progress) {
            progress.addEventListener('animationiteration', function() {
                goTo(current + 1);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                goTo(current - 1);
                restartProgress();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                goTo(current + 1);
                restartProgress();
            });
        }

        tabs.forEach(function(tab, index) {
            tab.addEventListener('click', function() {
                goTo(index);
                restartProgress();
            });
        });
    }

    // ==========================================
    // Room Preview Carousel (무한 루프)
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
    // Info Accordion (모바일 전용)
    // ==========================================
    function initInfoAccordion() {
        if (window.innerWidth > 768) return;

        var blocks = document.querySelectorAll('.section-info .info-block');
        blocks.forEach(function(block) {
            block.classList.add('active');
        });

        var titles = document.querySelectorAll('.section-info .block-title');
        titles.forEach(function(title) {
            title.addEventListener('click', function() {
                var block = this.closest('.info-block');
                block.classList.toggle('active');
            });
        });
    }

    // 매퍼에서 재초기화 시 사용
    window.initHeroSlider = initMainSlideshow;
    window.initRoomSlider = initRoomSlider;
    window.initRoomPreviewCarousel = initRoomPreviewCarousel;

    // DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initMainSlideshow();
        initRoomSlider();
        initRoomPreviewCarousel();
        initInfoAccordion();
    });
})();
