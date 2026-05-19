/**
 * Layout Map Page JavaScript
 */

(function() {
    'use strict';

    /**
     * 페이지 초기화
     */
    async function initPage() {
        // enabled 값 확인 - 비활성화된 페이지는 404로 리다이렉트
        const layoutMapData = await getLayoutMapData();
        if (layoutMapData && !layoutMapData.enabled) {
            window.location.href = '404.html';
            return;
        }

        initScrollAnimations();

        // mapPage() 완료 후 초기화를 위해 전역 함수 노출
        // (preview-handler에서 mapPage() 후 호출)
        window._initLayoutMap = () => {
            // 추가 초기화 필요시 여기에 작성
        };
    }

    /**
     * Layout Map 데이터 가져오기 (preview-handler 또는 로컬 JSON)
     */
    async function getLayoutMapData() {
        // preview-handler에서 데이터를 받은 경우
        if (window.previewHandler && window.previewHandler.currentData) {
            return window.previewHandler.currentData?.homepage?.customFields?.pages?.layoutMap?.sections?.[0];
        }

        // 로컬 데이터 로드
        try {
            const response = await fetch('standard-template-data.json');
            const data = await response.json();
            return data?.homepage?.customFields?.pages?.layoutMap?.sections?.[0];
        } catch (error) {
            console.error('Failed to load layout map data:', error);
            return null;
        }
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    function initScrollAnimations() {
        const layoutMapItems = document.querySelectorAll('.layout-map-item');
        const animateElements = document.querySelectorAll('.animate-element');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        layoutMapItems.forEach(item => {
            observer.observe(item);
        });

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }
})();
