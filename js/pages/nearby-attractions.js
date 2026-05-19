/**
 * Nearby Attractions Page JavaScript
 */

(function() {
    'use strict';

    let currentSlideIndex = 0;
    let autoSlideInterval;
    let totalSlides = 0;
    const SLIDE_INTERVAL = 6000; // 6초

    /**
     * 스크롤 애니메이션 설정
     */
    function setupScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-element');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * 페이지 초기화
     */
    async function initPage() {
        // enabled 값 확인 - 비활성화된 페이지는 404로 리다이렉트
        const nearbyAttractionsData = await getNearbyAttractionsData();
        if (nearbyAttractionsData && !nearbyAttractionsData.enabled) {
            window.location.href = '404.html';
            return;
        }

        setupScrollAnimations();

        // mapPage() 완료 후 슬라이더 초기화를 위해 전역 함수 노출
        // (preview-handler에서 mapPage() 후 호출)
        window._initNearbyAttractionsSlider = () => {
            initSlider();
            startAutoSlide();
        };
    }

    /**
     * Nearby Attractions 데이터 가져오기 (preview-handler 또는 로컬 JSON)
     */
    async function getNearbyAttractionsData() {
        // preview-handler에서 데이터를 받은 경우
        if (window.previewHandler && window.previewHandler.currentData) {
            return window.previewHandler.currentData?.homepage?.customFields?.pages?.nearbyAttractions?.sections?.[0];
        }

        // 로컬 데이터 로드
        try {
            const response = await fetch('standard-template-data.json');
            const data = await response.json();
            return data?.homepage?.customFields?.pages?.nearbyAttractions?.sections?.[0];
        } catch (error) {
            console.error('Failed to load nearby attractions data:', error);
            return null;
        }
    }

    /**
     * 버튼 이벤트 바인딩
     */
    function bindSliderButtons() {
        const prevBtns = document.querySelectorAll('.attractions-prev');
        const nextBtns = document.querySelectorAll('.attractions-next');

        prevBtns.forEach(btn => {
            // 기존 리스너 제거
            btn.replaceWith(btn.cloneNode(true));
        });
        nextBtns.forEach(btn => {
            // 기존 리스너 제거
            btn.replaceWith(btn.cloneNode(true));
        });

        // 다시 선택
        const newPrevBtns = document.querySelectorAll('.attractions-prev');
        const newNextBtns = document.querySelectorAll('.attractions-next');

        newPrevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                changeSlide(-1);
                resetAutoSlide();
            });
        });

        newNextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                changeSlide(1);
                resetAutoSlide();
            });
        });
    }

    /**
     * 슬라이더 초기화
     */
    function initSlider() {
        // 모든 슬라이드 다시 조회 (동적 생성 후)
        const allSlides = document.querySelectorAll('.attractions-slide');
        totalSlides = allSlides.length;
        currentSlideIndex = 0;

        // 각 슬라이드에 번호 추가 (01, 02, 03, ...)
        allSlides.forEach((slide, index) => {
            const titleEl = slide.querySelector('.attraction-item-title');
            if (titleEl) {
                titleEl.setAttribute('data-number', String(index + 1).padStart(2, '0'));
            }
            // 첫 슬라이드만 active
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // 버튼 바인딩
        bindSliderButtons();
    }

    /**
     * 슬라이드 변경
     */
    function changeSlide(direction) {
        const currentSlides = document.querySelectorAll('.attractions-slide');
        if (currentSlides.length === 0) return;

        totalSlides = currentSlides.length;
        // 인덱스 업데이트
        currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides;

        // 모든 슬라이드의 active 클래스 제거
        currentSlides.forEach(slide => slide.classList.remove('active'));

        // 새로운 슬라이드에 active 클래스 추가
        currentSlides[currentSlideIndex].classList.add('active');
    }

    /**
     * 자동 슬라이더 시작
     */
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, SLIDE_INTERVAL);
    }

    /**
     * 자동 슬라이더 리셋
     */
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }
})();
