/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Property name 매핑
     */
    mapPropertyName() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        const nameEl = this.safeSelect('[data-property-name]');
        if (nameEl && property.name) {
            nameEl.textContent = property.name;
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
        const element = this.safeSelect('[data-homepage-customFields-pages-directions-sections-0-hero-images]');

        if (element) {
            let imageUrl = null;
            let hasImage = false;

            // Get first SELECTED hero image using helper
            const selectedImages = this._getSelectedAndSortedImages(heroImages);
            if (selectedImages.length > 0 && selectedImages[0].url) {
                imageUrl = selectedImages[0].url;
                hasImage = true;
            }

            // Use empty placeholder if no image found
            if (!imageUrl) {
                imageUrl = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                element.classList.add('empty-image-placeholder');
            } else {
                element.classList.remove('empty-image-placeholder');
            }

            let extra = element.dataset.bgExtra ? ` ${element.dataset.bgExtra}` : '';
            if (!extra && element.classList.contains('fBanner')) {
                extra = ' fixed';
            }

            const value = `url("${imageUrl}") center/cover no-repeat${extra}`.trim();
            element.style.background = value;

            // If it's a real image, add error handling
            if (hasImage) {
                const img = new Image();
                img.onerror = function() {
                    element.style.background = `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}") center/cover no-repeat${extra}`.trim();
                    element.classList.add('empty-image-placeholder');
                };
                img.src = imageUrl;
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

        // 순차적으로 각 섹션 매핑
        this.mapPropertyName();
        this.mapPropertyAddress();
        this.mapHeroImages();
        this.mapMapIframe();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // HTML title 매핑
        this.updatePageTitle();

        // Favicon 매핑
        this.mapFavicon();

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
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