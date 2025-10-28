/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    constructor(data = null) {
        super();
        if (data) {
            this.data = data;
            this.isDataLoaded = true;
        }
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * SEO 메타태그 매핑
     */
    mapSEOTags() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        const seo = this.data.homepage.seo;
        if (!seo) return;

        // Title
        const titleEl = this.safeSelect('[data-homepage-seo-title]');
        if (titleEl && seo.title) {
            titleEl.textContent = seo.title;
        }

        // Description
        const descEl = this.safeSelect('[data-homepage-seo-description]');
        if (descEl && seo.description) {
            descEl.setAttribute('content', seo.description);
        }

        // Keywords
        const keywordsEl = this.safeSelect('[data-homepage-seo-keywords]');
        if (keywordsEl && seo.keywords) {
            keywordsEl.setAttribute('content', seo.keywords);
        }
    }

    /**
     * Property address 매핑
     */
    mapPropertyAddress() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        this.safeSelectAll('[data-property-address]').forEach((addressEl) => {
            if (addressEl && property.address) {
                addressEl.textContent = property.address;
            }
        });
    }

    /**
     * Hero 이미지 매핑 (directions hero images)
     */
    mapHeroImages() {
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero.images');

        // 선택된 이미지 필터링 및 정렬
        let selectedImages = [];
        if (Array.isArray(heroImages) && heroImages.length > 0) {
            selectedImages = heroImages
                .filter(img => img.isSelected === true && img.url)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        }

        // Hero section 0번째 이미지 매핑
        const heroElement = this.safeSelect('[data-homepage-customfields-pages-directions-sections-0-hero-images-0-url]');
        if (heroElement) {
            if (selectedImages.length > 0) {
                heroElement.src = selectedImages[0].url;
                heroElement.alt = selectedImages[0].description || '오시는길 히어로 이미지';
                heroElement.classList.remove('empty-image-placeholder');
            } else {
                heroElement.src = '';
                heroElement.alt = '이미지 없음';
                heroElement.classList.add('empty-image-placeholder');
            }
        }

        // Circular section 1번째 이미지 매핑
        const circularElement = this.safeSelect('[data-homepage-customfields-pages-directions-sections-0-hero-images-1-url]');
        if (circularElement) {
            if (selectedImages.length > 1) {
                circularElement.src = selectedImages[1].url;
                circularElement.alt = selectedImages[1].description || '오시는길 원형 이미지';
                circularElement.classList.remove('empty-image-placeholder');
            } else {
                circularElement.src = '';
                circularElement.alt = '이미지 없음';
                circularElement.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 안내사항 매핑 (1번째 이미지 description 사용)
     */
    mapDirectionsNotice() {
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero.images');
        const noticeElement = this.safeSelect('[data-homepage-customfields-pages-directions-sections-0-directions-notice]');

        if (noticeElement) {
            if (Array.isArray(heroImages) && heroImages.length > 1 && heroImages[1].description) {
                noticeElement.textContent = heroImages[1].description;
            } else {
                noticeElement.textContent = '정확한 위치 확인을 위해 도로명 주소를 사용해 주세요.';
            }
        }
    }



    /**
     * Map iframe 매핑 (좌표 기반 OpenStreetMap)
     */
    mapMapIframe() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const iframe = this.safeSelect('iframe[data-property-latitude][data-property-longitude]');

        if (iframe && property.latitude && property.longitude) {
            // OpenStreetMap embed URL 생성
            const lat = property.latitude;
            const lon = property.longitude;
            const zoom = 0.01; // bbox 범위

            const bbox = `${lon - zoom}%2C${lat - zoom}%2C${lon + zoom}%2C${lat + zoom}`;
            const marker = `${lat}%2C${lon}`;

            iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
            iframe.title = `${property.name} 위치`;
        }
    }

    /**
     * Property phone 매핑 (맵 하단 문의전화)
     */
    mapPropertyPhone() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const businessInfo = property?.businessInfo;

        // businessPhone이 있으면 우선 사용, 없으면 contactPhone 사용
        const phoneNumber = (businessInfo?.businessPhone && businessInfo.businessPhone.trim())
            ? businessInfo.businessPhone
            : property.contactPhone;

        const phoneElements = this.safeSelectAll('[data-property-phone]');
        phoneElements.forEach((phoneEl) => {
            if (phoneEl && phoneNumber) {
                phoneEl.textContent = phoneNumber;
            }
        });
    }



    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Directions 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        this.mapSEOTags();
        this.mapPropertyAddress();
        this.mapPropertyPhone();
        this.mapHeroImages();
        this.mapDirectionsNotice();
        this.mapMapIframe();
        this.updateMetaTags(this.data.property);
        this.updatePageTitle();
        this.updateFavicon();
    }

    /**
     * 페이지 제목 업데이트
     */
    updatePageTitle() {
        const property = this.data.property;
        const htmlTitle = this.safeSelect('title');

        if (htmlTitle && property?.name) {
            htmlTitle.textContent = `오시는길 - ${property.name}`;
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}