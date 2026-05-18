/**
 * Layout Map Page JavaScript
 */

(function() {
    'use strict';

    /**
     * 페이지 초기화
     */
    async function initPage() {
        // 데이터 로드 완료 대기
        if (typeof window.layoutMapMapper === 'undefined') {
            console.error('LayoutMapMapper not found');
            return;
        }

        const mapper = window.layoutMapMapper;

        try {
            // preview-handler에서 데이터를 받지 않은 경우에만 로컬 데이터 로드
            if (!mapper.data) {
                await mapper.loadData();
            }

            // enabled 값 확인 - 비활성화된 페이지는 404로 리다이렉트
            const layoutMapData = mapper.safeGet(mapper.data, 'homepage.customFields.pages.layoutMap.sections.0');
            if (layoutMapData && !layoutMapData.enabled) {
                window.location.href = '404.html';
                return;
            }

            // 페이지 매핑
            mapper.mapPage();

            // 애니메이션 초기화
            initScrollAnimations();
        } catch (error) {
            console.error('Failed to initialize page:', error);
        }
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    function initScrollAnimations() {
        const layoutMapItems = document.querySelectorAll('.layout-map-item');

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
    }

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }
})();
