/**
 * Layout Map Page Data Mapper
 * layout-map.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 배치도 페이지 전용 기능 제공
 */
class LayoutMapMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 배치도 customFields 데이터 가져오기
     */
    getLayoutMapData() {
        return this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0');
    }

    /**
     * Hero 섹션 매핑 (customFields layoutMap.hero 이미지 사용)
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        const heroImg = this.safeSelect('[data-customfield-layout-map-hero-image-0]');
        if (!heroImg) return;

        const layoutMapData = this.getLayoutMapData();
        const heroImages = layoutMapData?.hero?.images;

        if (heroImages && Array.isArray(heroImages) && heroImages.length > 0) {
            const selectedImages = heroImages
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            if (selectedImages.length > 0) {
                heroImg.src = selectedImages[0].url;
                heroImg.alt = this.sanitizeText(selectedImages[0].description, '배치도 이미지');
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
     * 배치도 콘텐츠 매핑 (about 섹션)
     */
    mapLayoutMapContent() {
        if (!this.isDataLoaded) return;

        const layoutMapData = this.getLayoutMapData();
        const about = layoutMapData?.about;

        if (!about) return;

        const aboutTitle = document.querySelector('[data-layout-map-about-title]');
        if (aboutTitle && about?.title) {
            aboutTitle.textContent = about.title;
        }

        const aboutDesc = document.querySelector('[data-layout-map-about-description]');
        if (aboutDesc && about?.description) {
            aboutDesc.textContent = about.description;
        }

        const container = document.getElementById('layout-map-content');
        if (!container) return;

        container.innerHTML = '';

        const images = about?.images || [];
        const selectedImages = images.filter(img => img.isSelected === true);
        const itemsToRender = selectedImages.length > 0 ? selectedImages : [{}];

        itemsToRender.forEach((imageData) => {
            const item = document.createElement('div');
            item.className = 'layout-map-item';

            const img = document.createElement('img');
            img.className = 'layout-map-image';
            img.alt = '배치도';

            if (imageData?.url) {
                img.src = imageData.url;
                img.alt = this.sanitizeText(imageData.description, 'Layout Map Image');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');
            }

            const description = document.createElement('p');
            description.className = 'layout-map-image-description';
            description.textContent = imageData?.description || '';

            item.appendChild(img);
            item.appendChild(description);

            container.appendChild(item);
        });
    }

    /**
     * Full Banner 섹션 매핑
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
        const layoutMapData = this.getLayoutMapData();

        // 실제 배포 환경에서만 enabled 체크 (프리뷰는 preview-handler에서 처리)
        if (!window.previewHandler && layoutMapData && layoutMapData.enabled === false) {
            window.location.href = '404.html';
            return;
        }

        this.mapPropertyInfo();
        this.mapHeroSection();
        this.mapLayoutMapContent();
        this.mapClosingSection();
        this.updateMetaTags({ title: `배치도 - ${this.getPropertyName()}` });
        this.reinitializeScrollAnimations();
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.LayoutMapMapper = LayoutMapMapper;
}

// ES6 module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutMapMapper;
}
