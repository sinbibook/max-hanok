/**
 * Nearby Attractions Page Data Mapper
 * nearby-attractions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 주변 명소 페이지 전용 기능 제공
 */
class NearbyAttractionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 주변 명소 customFields 데이터 가져오기
     */
    getNearbyAttractionsData() {
        return this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0');
    }

    /**
     * Hero 섹션 매핑 (customFields nearbyAttractions.hero 이미지 사용)
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        const heroImg = this.safeSelect('[data-customfield-nearby-attractions-hero-image-0]');
        if (!heroImg) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const heroImages = nearbyAttractionsData?.hero?.images;

        if (heroImages && Array.isArray(heroImages) && heroImages.length > 0) {
            const selectedImages = heroImages
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            if (selectedImages.length > 0) {
                heroImg.src = selectedImages[0].url;
                heroImg.alt = this.sanitizeText(selectedImages[0].description, '주변 명소 이미지');
                heroImg.classList.remove('empty-image-placeholder');
                return;
            }
        }

        // No image fallback
        heroImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
        heroImg.alt = '이미지 없음';
        heroImg.classList.add('empty-image-placeholder');
    }

    /**
     * Hero 텍스트 매핑
     */
    mapHeroText() {
        if (!this.isDataLoaded) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const hero = nearbyAttractionsData?.hero;

        if (!hero) return;

        const titleElement = this.safeSelect('[data-attractions-title]');
        if (titleElement && hero.title) {
            titleElement.textContent = hero.title;
        }

        const descElement = this.safeSelect('[data-nearby-attractions-hero-description]');
        if (descElement && hero.description) {
            descElement.textContent = hero.description;
        }
    }

    /**
     * 주변 명소 정보 매핑 (about 배열)
     * JSON의 개수만큼 동적으로 DOM 생성
     */
    mapAttractionsContent() {
        if (!this.isDataLoaded) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const aboutArray = nearbyAttractionsData?.about;

        if (!Array.isArray(aboutArray)) return;

        const grid = document.getElementById('attractions-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const itemsToRender = aboutArray && aboutArray.length > 0 ? aboutArray : [{}];

        itemsToRender.forEach((attraction, index) => {
            const layoutClass = index % 2 === 0 ? 'attraction-item-left' : 'attraction-item-right';

            const attractionItem = document.createElement('div');
            attractionItem.className = `attraction-item ${layoutClass} visible`;

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'attraction-item-image-wrapper';

            // isSelected가 true인 이미지만 필터링 후 첫 번째 표시
            const selectedImages = (attraction.images && Array.isArray(attraction.images))
                ? attraction.images.filter(img => img.isSelected === true)
                : [];
            const imageData = selectedImages.length > 0 ? selectedImages[0] : null;

            const img = document.createElement('img');
            img.className = 'attraction-item-image';
            img.alt = '주변 명소';

            if (imageData?.url) {
                img.src = imageData.url;
                img.alt = this.sanitizeText(imageData.description, attraction.title || 'Attraction Image');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');
            }

            imageWrapper.appendChild(img);

            const content = document.createElement('div');
            content.className = 'attraction-item-content';

            const title = document.createElement('h3');
            title.className = 'attraction-item-title';
            title.textContent = attraction.title || '';

            const divider = document.createElement('div');
            divider.className = 'attraction-item-divider';

            const description = document.createElement('p');
            description.className = 'attraction-item-description';
            description.textContent = attraction.description || '';

            content.appendChild(title);
            content.appendChild(divider);
            content.appendChild(description);

            attractionItem.appendChild(imageWrapper);
            attractionItem.appendChild(content);

            grid.appendChild(attractionItem);
        });
    }

    /**
     * Full Banner 섹션 매핑 (customFields property_exterior 이미지 사용)
     */
    mapClosingSection() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-main-banner]');
        if (!banner) return;

        const isDemo = this.dataSource === 'demo-filled.json';

        const exteriorImages = this.getPropertyImages('property_exterior');
        const targetImage = exteriorImages[0];

        const existingPlaceholder = banner.querySelector('.banner-placeholder-img');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }

        if (targetImage && targetImage.url) {
            banner.style.backgroundImage = `url('${targetImage.url}')`;
            banner.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            banner.style.backgroundImage = `url('./images/exterior.jpg')`;
            banner.classList.remove('empty-image-placeholder');
        } else {
            banner.style.backgroundImage = 'none';
            banner.classList.add('empty-image-placeholder');

            const placeholderImg = document.createElement('img');
            placeholderImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            placeholderImg.alt = '이미지 없음';
            placeholderImg.className = 'banner-placeholder-img empty-image-placeholder';
            placeholderImg.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
            banner.style.position = 'relative';
            banner.insertBefore(placeholderImg, banner.firstChild);
        }

        if (targetImage?.url || isDemo) {
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }

        const propertyNameEn = this.getPropertyNameEn();
        const closingPropertyName = banner.querySelector('[data-closing-property-name]');
        if (closingPropertyName) {
            closingPropertyName.textContent = propertyNameEn;
        }
    }

    /**
     * Property 정보 매핑
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

        document.querySelectorAll('[data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        document.querySelectorAll('[data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    /**
     * 전체 페이지 매핑
     */
    async mapPage() {
        const nearbyAttractionsData = this.getNearbyAttractionsData();

        // 실제 배포 환경에서만 enabled 체크 (프리뷰는 preview-handler에서 처리)
        if (!window.previewHandler && nearbyAttractionsData && nearbyAttractionsData.enabled === false) {
            window.location.href = '404.html';
            return;
        }

        this.mapPropertyInfo();
        this.mapHeroSection();
        this.mapHeroText();
        this.mapAttractionsContent();
        this.mapClosingSection();
        this.updateMetaTags({ title: `주변 명소 - ${this.getPropertyName()}` });
        this.reinitializeScrollAnimations();
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.NearbyAttractionsMapper = NearbyAttractionsMapper;
}

// ES6 module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NearbyAttractionsMapper;
}
