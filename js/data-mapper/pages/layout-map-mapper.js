/**
 * Layout Map Page Data Mapper
 * layout-map.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 배치도 페이지 전용 기능 제공
 */
class LayoutMapMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ LAYOUT MAP PAGE MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (배경 이미지)
     * customFields.pages.layoutMap.sections[0].hero.images 사용
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        this.mapHeroImage();
    }

    /**
     * Hero 이미지 동적 매핑
     * customFields.pages.layoutMap.sections[0].hero.images 사용
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        // customFields hero 이미지 가져오기
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.hero.images');

        const heroImageElement = this.safeSelect('[data-layout-map-hero-image]');
        if (!heroImageElement) return;

        if (heroImages && heroImages.length > 0) {
            // 0번째 이미지만 사용
            const selectedImage = heroImages[0];

            if (selectedImage && selectedImage.url) {
                heroImageElement.src = selectedImage.url;
                heroImageElement.alt = selectedImage.description || '배치도 히어로 이미지';
                heroImageElement.loading = 'eager';
                heroImageElement.classList.remove('empty-image-placeholder');
                return;
            }
        }

        // 이미지가 없을 경우 placeholder
        if (typeof ImageHelpers !== 'undefined') {
            heroImageElement.src = ImageHelpers.EMPTY_IMAGE_SVG;
            heroImageElement.alt = '이미지 없음';
            heroImageElement.classList.add('empty-image-placeholder');
        }
    }

    /**
     * Intro 섹션 매핑 (title, description)
     * customFields.pages.layoutMap.sections[0].about.title/description
     */
    mapIntroSection() {
        if (!this.isDataLoaded) return;

        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        // 제목 매핑
        const titleEl = this.safeSelect('[data-layout-map-about-title]');
        if (titleEl && aboutData.title) {
            titleEl.textContent = this.sanitizeText(aboutData.title);
        }

        // 설명 매핑
        const descEl = this.safeSelect('[data-layout-map-about-description]');
        if (descEl && aboutData.description) {
            descEl.textContent = this.sanitizeText(aboutData.description);
        }
    }

    /**
     * 배치도 아이템 동적 생성 (이미지-설명이 교대로 추가)
     * isSelected === true인 항목만 생성
     */
    generateLayoutMapItems() {
        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        const images = aboutData.images || [];
        const container = this.safeSelect('.layout-map-content');

        if (!container) return;

        // 기존 동적 생성된 아이템 제거
        container.querySelectorAll('[data-generated="true"]').forEach(el => el.remove());

        // isSelected === true인 이미지만 필터링
        const selectedImages = images.filter(img => img.isSelected === true);

        // 2번째 선택된 이미지부터 동적 생성 (1번째는 HTML에 이미 있음)
        for (let i = 1; i < selectedImages.length; i++) {
            // 이미지 아이템 생성
            const imageItem = document.createElement('div');
            imageItem.className = 'layout-map-item animate';
            imageItem.setAttribute('data-generated', 'true');
            imageItem.innerHTML = `<img alt="배치도" class="layout-map-image" data-layout-map-image-${i}>`;
            container.appendChild(imageItem);

            // 설명 아이템 생성
            const descItem = document.createElement('div');
            descItem.className = 'layout-map-description-item animate';
            descItem.setAttribute('data-generated', 'true');
            descItem.innerHTML = `<p data-layout-map-description-${i}></p>`;
            container.appendChild(descItem);
        }
    }

    /**
     * 배치도 컨텐츠 매핑 (layoutMap.about.images[0~n] 각각에 대한 설명)
     * isSelected === true인 항목만 표시
     */
    mapLayoutMapContent() {
        if (!this.isDataLoaded) return;

        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        const images = aboutData.images || [];
        if (!Array.isArray(images)) return;

        // isSelected === true인 이미지만 필터링
        const selectedImages = images.filter(img => img.isSelected === true);

        // 필요한 아이템 생성
        this.generateLayoutMapItems();

        // 첫 번째 이미지 처리
        if (selectedImages.length > 0) {
            const firstImage = selectedImages[0];

            const imgEl = this.safeSelect('[data-layout-map-image-0]');
            if (imgEl && firstImage && firstImage.url) {
                imgEl.src = firstImage.url;
                imgEl.alt = firstImage.description || '배치도';
                imgEl.classList.remove('empty-image-placeholder');
            }

            const descEl = this.safeSelect('[data-layout-map-description-0]');
            if (descEl && firstImage && firstImage.description) {
                const sanitized = this.sanitizeText(firstImage.description);
                descEl.innerHTML = sanitized.replace(/\n/g, '<br>');
            }
        }

        // 2번째 이미지부터 매핑 (선택된 이미지 기반)
        for (let i = 1; i < selectedImages.length; i++) {
            const imageData = selectedImages[i];

            const imgEl = this.safeSelect(`[data-layout-map-image-${i}]`);
            if (imgEl && imageData && imageData.url) {
                imgEl.src = imageData.url;
                imgEl.alt = imageData.description || '배치도';
                imgEl.classList.remove('empty-image-placeholder');
            }

            const descEl = this.safeSelect(`[data-layout-map-description-${i}]`);
            if (descEl && imageData && imageData.description) {
                const sanitized = this.sanitizeText(imageData.description);
                descEl.innerHTML = sanitized.replace(/\n/g, '<br>');
            }
        }
    }

    /**
     * Closing Banner 섹션 매핑 (배경 이미지, 로고)
     */
    mapClosingBanner() {
        if (!this.isDataLoaded) return;

        // Closing 이미지 매핑
        this.mapClosingImage();

        // 로고 매핑
        this.mapLogo();
    }

    /**
     * Closing 배경 이미지 매핑
     * property.images.0.exterior 배열의 첫 번째 이미지 사용
     */
    mapClosingImage() {
        if (!this.isDataLoaded) return;

        const closingBgElement = this.safeSelect('[data-layout-map-closing-image-bg]');
        if (!closingBgElement) return;

        // 숙소 외경 이미지 데이터 가져오기
        const exteriorImages = this.safeGet(this.data, 'property.images.0.exterior');

        if (exteriorImages && exteriorImages.length > 0) {
            // sortOrder로 정렬
            const sortedImages = [...exteriorImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const selectedImage = sortedImages[0];

            if (selectedImage && selectedImage.url) {
                closingBgElement.style.backgroundImage = `url('${selectedImage.url}')`;
                return;
            }
        }

        // 이미지가 없을 경우 placeholder
        if (typeof ImageHelpers !== 'undefined') {
            closingBgElement.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_SVG}')`;
        }
    }

    /**
     * 로고 매핑
     */
    mapLogo() {
        if (!this.isDataLoaded) return;

        const logoElement = this.safeSelect('[data-closing-logo]');
        if (!logoElement) return;

        if (typeof ImageHelpers === 'undefined') {
            console.warn('⚠️ ImageHelpers not loaded yet, skipping logo mapping');
            return;
        }

        const logoUrl = ImageHelpers.extractLogoUrl(this.data);

        if (logoUrl) {
            logoElement.src = logoUrl;
            logoElement.alt = `${this.getPropertyName()} 로고`;
            logoElement.loading = 'eager';
            logoElement.classList.remove('empty-image-placeholder');
        } else {
            logoElement.src = ImageHelpers.EMPTY_IMAGE_SVG;
            logoElement.classList.add('empty-image-placeholder');
        }
    }

    /**
     * 속성명(숙소 한글명) 매핑
     */
    mapPropertyName() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameElements = this.safeSelectAll('[data-property-name]');

        propertyNameElements.forEach(element => {
            element.textContent = propertyName;
        });
    }

    // ============================================================================
    // 🔧 PAGE MAPPING & INITIALIZATION
    // ============================================================================

    /**
     * 전체 페이지 매핑 (preview-handler 연동용)
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            // enabled 확인 - false면 404로 리다이렉트
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.enabled');
            if (isEnabled === false) {
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + '/404.html';
                return;
            }

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapIntroSection();
            this.mapLayoutMapContent();
            this.mapClosingBanner();
            this.mapPropertyName();

            // 메타 태그 및 SEO 업데이트 (인증코드 포함, 전 페이지 공통)
            this.updateMetaTags();

            // 헤더, 푸터 매핑
            if (typeof window.HeaderFooterMapper !== 'undefined') {
                const headerFooterMapper = new window.HeaderFooterMapper();
                headerFooterMapper.data = this.data;
                headerFooterMapper.isDataLoaded = true;
                await headerFooterMapper.mapHeaderFooter();
            }

            // 스크롤 애니메이션 재실행
            if (typeof window._reinitScrollAnimations === 'function') {
                window._reinitScrollAnimations();
            }

        } catch (error) {
            console.error('LayoutMapMapper mapPage error:', error);
        }
    }

    /**
     * layout-map 페이지 전용 초기화 함수
     */
    async initialize() {
        try {
            // 데이터 로드
            if (!this.isDataLoaded) {
                await this.loadData();
            }

            // enabled 확인
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.enabled');
            if (isEnabled === false) {
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + '/404.html';
                return;
            }

            // 매핑 실행
            this.mapHeroSection();
            this.mapIntroSection();
            this.mapLayoutMapContent();
            this.mapClosingBanner();
            this.mapPropertyName();

            // 메타 태그 및 SEO 업데이트 (인증코드 포함, 전 페이지 공통)
            this.updateMetaTags();

            // 헤더, 푸터 매핑
            if (typeof window.HeaderFooterMapper !== 'undefined') {
                const headerFooterMapper = new window.HeaderFooterMapper();
                headerFooterMapper.data = this.data;
                headerFooterMapper.isDataLoaded = true;
                await headerFooterMapper.mapHeaderFooter();
            }

            // 스크롤 애니메이션 재실행
            if (typeof window._reinitScrollAnimations === 'function') {
                window._reinitScrollAnimations();
            }

            console.log('LayoutMapMapper initialized successfully');
        } catch (error) {
            console.error('LayoutMapMapper initialization error:', error);
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutMapMapper;
} else {
    window.LayoutMapMapper = LayoutMapMapper;
}
