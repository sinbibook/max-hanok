/**
 * Nearby Attractions Page Data Mapper
 * nearby-attractions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 주변 명소 페이지 전용 기능 제공
 */
class NearbyAttractionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏞️ NEARBY ATTRACTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (background 이미지)
     * customFields.pages.nearbyAttractions.sections[0].hero.images 사용
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        // Hero 이미지 매핑
        this.mapHeroImage();
    }

    /**
     * Hero 이미지 동적 매핑
     * customFields.pages.nearbyAttractions.sections[0].hero.images 사용
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        // customFields hero 이미지 가져오기
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.hero.images');

        const heroImageElement = this.safeSelect('[data-nearby-hero-image]');
        if (!heroImageElement) return;

        if (heroImages && heroImages.length > 0) {
            // 0번째 이미지만 사용
            const selectedImage = heroImages[0];

            if (selectedImage && selectedImage.url) {
                heroImageElement.src = selectedImage.url;
                heroImageElement.alt = selectedImage.description || '주변 명소 히어로 이미지';
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
     * customFields.pages.nearbyAttractions.sections[0].hero.title/description
     */
    mapIntroSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.hero');
        if (!heroData) return;

        // 제목 매핑
        const titleEl = this.safeSelect('[data-nearby-attractions-about-title]');
        if (titleEl && heroData.title) {
            titleEl.textContent = this.sanitizeText(heroData.title);
        }

        // 설명 매핑
        const descEl = this.safeSelect('[data-nearby-attractions-about-description]');
        if (descEl && heroData.description) {
            descEl.textContent = this.sanitizeText(heroData.description);
        }
    }

    /**
     * 주변 명소 아이템 동적 생성 (grid 방식)
     * customFields.pages.nearbyAttractions.sections[0].about 배열 기반
     */
    mapAttractionsContent() {
        if (!this.isDataLoaded) return;

        const aboutItems = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.about') || [];
        const gridContainer = this.safeSelect('#attractions-grid-container');

        if (!gridContainer) return;

        // 기존 아이템 제거
        gridContainer.innerHTML = '';

        // aboutItems가 없으면 placeholder 아이템 하나 표시
        if (aboutItems.length === 0) {
            const placeholderItem = this._createAttractionItem(0, {
                title: '',
                description: '',
                images: []
            });
            gridContainer.appendChild(placeholderItem);
            return;
        }

        // 모든 아이템 생성
        aboutItems.forEach((item, index) => {
            const attractionItem = this._createAttractionItem(index, item);
            gridContainer.appendChild(attractionItem);

            // 마지막 항목을 제외하고 separator 추가
            if (index < aboutItems.length - 1) {
                const separator = document.createElement('hr');
                separator.className = 'attractions-item-separator';
                gridContainer.appendChild(separator);
            }
        });
    }

    /**
     * 헬퍼: Attraction Item DOM 생성
     * @private
     */
    _createAttractionItem(index, item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'attraction-item';

        // 이미지 요소 생성
        const imgEl = document.createElement('img');
        imgEl.className = 'attraction-item-image';
        imgEl.setAttribute('data-nearby-attractions-image-' + index, '');
        imgEl.alt = item.title || '주변 명소';

        // 이미지 처리 (isSelected === true인 이미지 찾기)
        const images = item.images || [];
        const selectedImage = images.find(img => img.isSelected) || images[0];

        if (selectedImage && selectedImage.url) {
            imgEl.src = selectedImage.url;
        } else {
            // 이미지가 없을 경우 placeholder 사용
            if (typeof ImageHelpers !== 'undefined') {
                imgEl.src = ImageHelpers.EMPTY_IMAGE_SVG;
            }
            imgEl.classList.add('empty-image-placeholder');
        }

        // 컨텐츠 영역 생성
        const contentDiv = document.createElement('div');
        contentDiv.className = 'attraction-item-content';

        const titleEl = document.createElement('h3');
        titleEl.className = 'attraction-item-title';
        titleEl.setAttribute('data-nearby-attractions-title-' + index, '');
        titleEl.textContent = this.sanitizeText(item.title || '');

        const dividerEl = document.createElement('div');
        dividerEl.className = 'attraction-item-divider';

        const descEl = document.createElement('p');
        descEl.className = 'attraction-item-description';
        descEl.setAttribute('data-nearby-attractions-description-' + index, '');
        descEl.innerHTML = this.sanitizeText(item.description || '').replace(/\n/g, '<br>');

        contentDiv.appendChild(titleEl);
        contentDiv.appendChild(dividerEl);
        contentDiv.appendChild(descEl);

        itemDiv.appendChild(imgEl);
        itemDiv.appendChild(contentDiv);

        return itemDiv;
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

        const closingBgElement = this.safeSelect('[data-nearby-closing-image-bg]');
        if (!closingBgElement) return;

        // 숙소 외경 이미지 데이터 가져오기
        const exteriorImages = this.safeGet(this.data, 'property.images.0.exterior');

        if (exteriorImages && exteriorImages.length > 0) {
            // sortOrder로 정렬
            const sortedImages = [...exteriorImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const selectedImage = sortedImages[0];

            if (selectedImage && selectedImage.url) {
                closingBgElement.style.backgroundImage = `url('${selectedImage.url}')`;
                closingBgElement.classList.remove('empty-image-placeholder');
                return;
            }
        }

        // 이미지가 없을 경우 placeholder
        if (typeof ImageHelpers !== 'undefined') {
            closingBgElement.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_SVG}')`;
        }
        closingBgElement.classList.add('empty-image-placeholder');
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
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.enabled');
            if (isEnabled === false) {
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + '/404.html';
                return;
            }

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapIntroSection();
            this.mapAttractionsContent();
            this.mapClosingBanner();
            this.mapPropertyName();

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
            console.error('NearbyAttractionsMapper mapPage error:', error);
        }
    }

    /**
     * nearby-attractions 페이지 전용 초기화 함수
     */
    async initialize() {
        try {
            // 데이터 로드
            if (!this.isDataLoaded) {
                await this.loadData();
            }

            // enabled 확인
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.enabled');
            if (isEnabled === false) {
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + '/404.html';
                return;
            }

            // 매핑 실행
            this.mapHeroSection();
            this.mapIntroSection();
            this.mapAttractionsContent();
            this.mapClosingBanner();
            this.mapPropertyName();

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

            console.log('NearbyAttractionsMapper initialized successfully');
        } catch (error) {
            console.error('NearbyAttractionsMapper initialization error:', error);
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NearbyAttractionsMapper;
} else {
    window.NearbyAttractionsMapper = NearbyAttractionsMapper;
}
