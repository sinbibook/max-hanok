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
    // 🏗️ LAYOUT MAP PAGE SPECIFIC MAPPINGS
    // ============================================================================

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

        const heroImg = document.querySelector('[data-customfield-layout-map-hero-image-0]');
        if (!heroImg) return;

        const layoutMapData = this.getLayoutMapData();
        const heroImage = layoutMapData?.hero?.images?.[0];

        if (heroImage?.url) {
            heroImg.src = heroImage.url;
            heroImg.alt = heroImage.description || 'Layout Map Hero Image';
            heroImg.classList.remove('empty-image-placeholder');
        } else {
            heroImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
            heroImg.alt = 'No Image Available';
            heroImg.classList.add('empty-image-placeholder');
        }
    }

    /**
     * 배치도 콘텐츠 매핑 (about 섹션)
     * JSON의 about.images 개수만큼 동적으로 DOM 생성
     */
    mapLayoutMapContent() {
        if (!this.isDataLoaded) return;

        const layoutMapData = this.getLayoutMapData();
        const about = layoutMapData?.about;

        if (!about) return;

        // About title 매핑
        const aboutTitle = document.querySelector('[data-layout-map-about-title]');
        if (aboutTitle && about?.title) {
            aboutTitle.textContent = about.title;
        }

        // About description 매핑
        const aboutDesc = document.querySelector('[data-layout-map-about-description]');
        if (aboutDesc && about?.description) {
            aboutDesc.textContent = about.description;
        }

        const container = document.getElementById('layout-map-content');
        if (!container) return;

        // 기존 내용 초기화
        container.innerHTML = '';

        // about.images 중 isSelected가 true인 이미지들만 추출하여 렌더링
        const selectedImages = (about?.images || []).filter(img => img.isSelected);

        // selectedImages가 비어있어도 최소 1개의 placeholder item 렌더링
        const itemsToRender = selectedImages.length > 0 ? selectedImages : [{}];

        itemsToRender.forEach((imageData) => {
            const item = document.createElement('div');
            item.className = 'layout-map-item';

            // 이미지 요소
            const img = document.createElement('img');
            img.className = 'layout-map-image';
            img.alt = '배치도';

            if (imageData?.url) {
                img.src = imageData.url;
                img.alt = imageData.description || 'Layout Map Image';
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = 'No Image Available';
                img.classList.add('empty-image-placeholder');
            }

            // 설명 요소
            const description = document.createElement('p');
            description.className = 'layout-map-image-description';
            description.textContent = imageData?.description || '';

            item.appendChild(img);
            item.appendChild(description);

            container.appendChild(item);
        });
    }

    /**
     * 클로징 섹션 매핑 (Exterior 이미지 사용 - 1번째)
     */
    mapClosingSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const exteriorImages = this.getExteriorImages();
        let imageUrl = null;
        let imageAlt = '';

        if (exteriorImages.length > 0) {
            imageUrl = exteriorImages[0].url;
            imageAlt = exteriorImages[0].description;
        }

        const closingImgs = document.querySelectorAll('[data-customfield-layout-map-closing-image]');
        closingImgs.forEach(img => {
            if (imageUrl) {
                img.src = imageUrl;
                img.alt = imageAlt || 'Layout Map Closing Image';
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = 'No Image Available';
                img.classList.add('empty-image-placeholder');
            }
        });

        const propertyNameEn = document.querySelector('[data-property-name-en]');
        if (propertyNameEn) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * 외관 이미지 가져오기 (sortOrder로 정렬)
     */
    getExteriorImages() {
        const images = this.safeGet(this.data, 'property.images.0.exterior');
        if (!images || !Array.isArray(images)) {
            return [];
        }

        return images
            .filter(img => img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    /**
     * Property 정보 매핑 (모든 data-property-name-en 요소)
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

        // 모든 숙소명 요소 매핑
        document.querySelectorAll('[data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        // 모든 영문 숙소명 요소 매핑 (히어로 + closing)
        document.querySelectorAll('[data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    /**
     * 숙소명 가져오기
     */
    getPropertyName() {
        return this.safeGet(this.data, 'property.name') || '숙소명';
    }

    /**
     * 전체 페이지 매핑
     */
    mapPage() {
        this.mapPropertyInfo();
        this.mapHeroSection();
        this.mapLayoutMapContent();
        this.mapClosingSection();
    }
}

// 전역 mapper 클래스 및 인스턴스 생성
if (typeof window !== 'undefined') {
    window.LayoutMapMapper = LayoutMapMapper;
    window.layoutMapMapper = new LayoutMapMapper();
}
