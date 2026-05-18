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
    // 🗺️ NEARBY ATTRACTIONS PAGE SPECIFIC MAPPINGS
    // ============================================================================

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

        const heroImg = document.querySelector('[data-customfield-nearby-attractions-hero-image-0]');
        if (!heroImg) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const heroImage = nearbyAttractionsData?.hero?.images?.[0];

        if (heroImage?.url) {
            heroImg.src = heroImage.url;
            heroImg.alt = heroImage.description || 'Nearby Attractions Hero Image';
            heroImg.classList.remove('empty-image-placeholder');
        } else {
            heroImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
            heroImg.alt = 'No Image Available';
            heroImg.classList.add('empty-image-placeholder');
        }
    }

    /**
     * Hero 텍스트 매핑
     */
    mapHeroText() {
        if (!this.isDataLoaded) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const hero = nearbyAttractionsData?.hero;

        if (!hero) return;

        // attractions intro title 매핑
        const attractionsTitle = document.querySelector('[data-attractions-title]');
        if (attractionsTitle && hero.title) {
            attractionsTitle.textContent = hero.title;
        }

        // Hero title 매핑 (brand-subtitle)
        const heroTitle = document.querySelector('[data-nearby-attractions-hero-title]');
        if (heroTitle) {
            heroTitle.textContent = hero.title || 'NEARBY ATTRACTIONS';
        }

        // Hero description 매핑 (brand-description)
        const heroDesc = document.querySelector('[data-nearby-attractions-hero-description]');
        if (heroDesc && hero.description) {
            heroDesc.textContent = hero.description;
        }

        // Intro description 매핑 (attractions-description 영역)
        const introDesc = document.querySelector('[data-nearby-attractions-intro-description]');
        if (introDesc && hero.description) {
            introDesc.textContent = hero.description;
        }
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

        const closingImgs = document.querySelectorAll('[data-customfield-nearby-attractions-closing-image]');
        closingImgs.forEach(img => {
            if (imageUrl) {
                img.src = imageUrl;
                img.alt = imageAlt || 'Nearby Attractions Closing Image';
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
     * 주변 명소 정보 매핑 (customFields.pages.nearbyAttractions.sections[0].about[])
     * JSON의 개수만큼 동적으로 DOM 생성
     */
    mapAttractionsContent() {
        if (!this.isDataLoaded) return;

        const nearbyAttractionsData = this.getNearbyAttractionsData();
        const aboutArray = (nearbyAttractionsData?.about || []).filter(item => item.isSelected);

        if (!Array.isArray(aboutArray) || aboutArray.length === 0) return;

        const grid = document.getElementById('attractions-grid');
        if (!grid) return;

        // 기존 내용 초기화
        grid.innerHTML = '';

        // aboutArray가 비어있어도 최소 1개의 placeholder item 렌더링
        const itemsToRender = aboutArray.length > 0 ? aboutArray : [{}];

        // JSON 개수만큼 동적으로 생성
        itemsToRender.forEach((attraction, index) => {
            // left/right 클래스 번갈아가며 적용
            const layoutClass = index % 2 === 0 ? 'attraction-item-left' : 'attraction-item-right';

            const attractionItem = document.createElement('div');
            attractionItem.className = `attraction-item ${layoutClass}`;

            // 이미지 요소
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'attraction-item-image-wrapper';

            const img = document.createElement('img');
            img.className = 'attraction-item-image';
            img.alt = '주변 명소';

            const attractionImage = attraction.images?.[0];
            if (attractionImage?.url) {
                img.src = attractionImage.url;
                img.alt = attractionImage.description || attraction.title || 'Attraction Image';
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = 'No Image Available';
                img.classList.add('empty-image-placeholder');
            }

            imageWrapper.appendChild(img);

            // 콘텐츠 요소
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
        this.mapHeroText();
        this.mapAttractionsContent();
        this.mapClosingSection();
    }
}

// 전역 mapper 클래스 및 인스턴스 생성
if (typeof window !== 'undefined') {
    window.NearbyAttractionsMapper = NearbyAttractionsMapper;
    window.nearbyAttractionsMapper = new NearbyAttractionsMapper();
}
