/**
 * Main Page Data Mapper
 * main.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 main 페이지 특화 기능 제공
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 MAIN PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Main 페이지 Hero 섹션 매핑 (텍스트 + 슬라이더)
     */
    mapMainHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        // Hero 텍스트 매핑
        this.mapMainHeroText();

        // Hero 슬라이더 이미지 매핑
        this.mapMainHeroSlider();
    }

    /**
     * Main 페이지 Hero 텍스트만 매핑 (제목, 설명)
     */
    mapMainHeroText() {
        if (!this.isDataLoaded || !this.data.property) return;


        // main 페이지의 hero 데이터 가져오기
        const mainHeroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');

        // data-main-title 매핑 (hero 섹션 제목)
        const mainTitleElement = this.safeSelect('[data-main-title]');
        if (mainTitleElement && mainHeroData && mainHeroData.title !== undefined) {
            mainTitleElement.textContent = mainHeroData.title;
        }

        // data-main-description 매핑 (hero 섹션 설명)
        const mainDescriptionElement = this.safeSelect('[data-main-description]');
        if (mainDescriptionElement && mainHeroData && mainHeroData.description !== undefined) {
            mainDescriptionElement.innerHTML = (mainHeroData.description || '').replace(/\n/g, '<br>');
        }

        // 펜션 이름 매핑 - main 페이지의 hero.title 사용
        const propertyNameElement = this.safeSelect('[data-main-property-name]');
        if (propertyNameElement && mainHeroData && mainHeroData.title !== undefined) {
            propertyNameElement.textContent = mainHeroData.title;
        }

        // Hero 설명 매핑 - main 페이지의 hero.description 사용
        const heroDescriptionElement = this.safeSelect('[data-main-hero-description]');
        if (heroDescriptionElement && mainHeroData && mainHeroData.description !== undefined) {
            heroDescriptionElement.innerHTML = mainHeroData.description.replace(/\n/g, '<br>');
        }
    }

    /**
     * Main 페이지 Hero 슬라이더 이미지 매핑 (index와 동일)
     */
    mapMainHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');
        if (!heroData) return;

        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        const images = heroData.images
            ? heroData.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        if (images.length === 0) {
            // 이미지가 없을 때 placeholder
            const slide = document.createElement('div');
            slide.className = 'hero-slide active';

            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Image Available';
            img.className = 'empty-image-placeholder';
            img.loading = 'lazy';

            slide.appendChild(img);
            heroSlider.appendChild(slide);
        } else {
            images.forEach((img, index) => {
                const slide = document.createElement('div');
                slide.className = `hero-slide${index === 0 ? ' active' : ''}`;
                slide.innerHTML = `<img src="${img.url}" alt="${img.description || 'Hero Image'}" loading="lazy">`;
                heroSlider.appendChild(slide);
            });
        }

        // 슬라이더 초기화 (index.js의 initHeroSlider 호출)
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider(true); // skipDelay=true
        }
    }

    /**
     * Main 페이지 콘텐츠 섹션 동적 생성
     */
    mapMainContentSections() {
        if (!this.isDataLoaded) return;

        // JSON의 about 섹션 데이터 가져오기
        const aboutSections = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');

        // 기존 하드코딩된 .main-content-wrapper 찾기 또는 생성
        let contentWrapper = document.querySelector('.main-content-wrapper');

        if (!contentWrapper) {
            // location-info-section 다음에 wrapper 삽입
            const locationSection = document.querySelector('.location-info-section');
            if (locationSection) {
                contentWrapper = document.createElement('div');
                contentWrapper.className = 'main-content-wrapper';
                locationSection.parentNode.insertBefore(contentWrapper, locationSection.nextSibling);
            }
        } else {
            // 기존 하드코딩된 섹션들 제거
            contentWrapper.innerHTML = '';
        }

        if (!contentWrapper) return;

        // DocumentFragment 사용으로 DOM 조작 최적화
        const fragment = document.createDocumentFragment();

        // 데이터가 없을 때 플레이스홀더 블록 2개 표시
        if (!aboutSections || !Array.isArray(aboutSections) || aboutSections.length === 0) {
            // 플레이스홀더 블록 2개 생성
            for (let i = 0; i < 2; i++) {
                const placeholderSection = this.createTextImageSection(
                    { title: '', description: '' },
                    { url: null, description: '' },
                    i
                );
                fragment.appendChild(placeholderSection);
            }
        } else {
            // 실제 데이터 렌더링
            let totalBlockCount = 0;

            aboutSections.forEach((aboutSection) => {
                const selectedImages = aboutSection.images
                    ? aboutSection.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
                    : [];

                // 이미지가 있는 경우: 각 이미지마다 텍스트 + 이미지 섹션 생성
                if (selectedImages.length > 0) {
                    selectedImages.forEach((img, imgIndex) => {
                        const textImageSection = this.createTextImageSection(aboutSection, img, totalBlockCount);
                        fragment.appendChild(textImageSection);
                        totalBlockCount++;
                    });
                } else {
                    // 이미지가 없는 경우: 플레이스홀더 블록 생성 (최소 2개)
                    const placeholderCount = 2;
                    for (let i = 0; i < placeholderCount; i++) {
                        const placeholderSection = this.createTextImageSection(
                            aboutSection,
                            { url: null, description: '' },
                            totalBlockCount
                        );
                        fragment.appendChild(placeholderSection);
                        totalBlockCount++;
                    }
                }
            });
        }

        contentWrapper.appendChild(fragment);
    }




    /**
     * 텍스트 + 이미지 섹션 생성 (새로운 레이아웃)
     */
    createTextImageSection(aboutSection, image, index) {
        const section = document.createElement('section');
        section.className = 'main-content-item';

        const title = aboutSection.title || '';
        // 이미지 description 우선, 없으면 aboutSection description 사용
        const description = image?.description || aboutSection.description || '';

        // Border top
        const borderTop = document.createElement('div');
        borderTop.className = 'main-content-border-top';
        section.appendChild(borderTop);

        // Main container
        const container = document.createElement('div');
        container.className = 'main-content-container';

        // Text section (왼쪽)
        const textSection = document.createElement('div');
        textSection.className = 'main-content-text';

        // Number
        const numberDiv = document.createElement('div');
        numberDiv.className = 'main-content-number';
        numberDiv.textContent = String(index + 1).padStart(2, '0');
        textSection.appendChild(numberDiv);

        // Description
        const descriptionP = document.createElement('p');
        descriptionP.className = 'main-content-description';
        descriptionP.textContent = description;
        textSection.appendChild(descriptionP);

        // Title
        const h2 = document.createElement('h2');
        h2.className = 'main-content-title';
        h2.textContent = title;
        textSection.appendChild(h2);

        // Image section (오른쪽)
        const imageSection = document.createElement('div');
        imageSection.className = 'main-content-image';

        const img = document.createElement('img');
        if (image?.url) {
            img.src = image.url;
            img.alt = image.description || title || '메인 콘텐츠 이미지';
        } else {
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Image Available';
            img.className = 'empty-image-placeholder';
        }
        imageSection.appendChild(img);

        container.appendChild(textSection);
        container.appendChild(imageSection);
        section.appendChild(container);

        // Border bottom
        const borderBottom = document.createElement('div');
        borderBottom.className = 'main-content-border-bottom';
        section.appendChild(borderBottom);

        return section;
    }

    /**
     * 단일 이미지 섹션 생성
     */
    createSingleImageSection(image) {
        const section = document.createElement('section');
        section.className = 'main-content-item main-content-full-image';

        // Border top
        const borderTop = document.createElement('div');
        borderTop.className = 'main-content-border-top';
        section.appendChild(borderTop);

        // Container
        const container = document.createElement('div');
        container.className = 'main-content-container';

        const imageSection = document.createElement('div');
        imageSection.className = 'main-content-image';

        const img = document.createElement('img');
        if (image?.url) {
            img.src = image.url;
            img.alt = image.description || '메인 콘텐츠 이미지';
        } else {
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Image Available';
            img.className = 'empty-image-placeholder';
        }
        imageSection.appendChild(img);

        container.appendChild(imageSection);
        section.appendChild(container);

        // Border bottom
        const borderBottom = document.createElement('div');
        borderBottom.className = 'main-content-border-bottom';
        section.appendChild(borderBottom);

        return section;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Property 정보 매핑 (이름, 영문명)
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

        // Map property name to all elements
        this.safeSelectAll('[data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        this.safeSelectAll('[data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    /**
     * 클로징 섹션 매핑 - property_exterior 이미지 사용
     */
    mapClosingSection() {
        if (!this.isDataLoaded) return;

        // property_exterior 이미지 가져오기 (isSelected: true만)
        const allImages = this.safeGet(this.data, "homepage.customFields.property.images") || [];
        const exteriorImages = allImages
            .filter(img => img.category === "property_exterior" && img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 페이지 인덱스 0 (main) - 순환 선택
        const pageIndex = 0;
        const selectedImage = exteriorImages.length > 0 ?
            exteriorImages[pageIndex % exteriorImages.length] : null;

        // 모든 클로징 이미지 매핑 (데스크탑 + 모바일)
        this.safeSelectAll('[data-closing-image]').forEach(img => {
            if (selectedImage?.url) {
                img.src = selectedImage.url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
                img.alt = 'No Image Available';
            }
        });
    }

    /**
     * Main 페이지 전체 매핑 실행 (base-mapper.js에서 자동 호출)
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map main page: data not loaded');
            return;
        }

        // Main 페이지 섹션들 순차 매핑
        this.mapPropertyInfo();
        this.mapMainHeroSection();
        this.mapMainContentSections();
        this.updateMetaTags();
        this.reinitializeScrollAnimations();
        this.mapClosingSection();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}

// 자동 초기화 및 window.baseMapper 등록
(function() {
    'use strict';

    // 페이지 로드 완료 후 매퍼 초기화
    function initMapper() {
        // PreviewHandler가 이미 존재하면 초기화하지 않음 (PreviewHandler가 처리)
        if (window.previewHandler) {
            return;
        }

        // 일반 초기화 (JSON 파일 로드)
        const mapper = new MainMapper();
        window.baseMapper = mapper;
        mapper.initialize();
    }

    // DOMContentLoaded 이후에 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapper);
    } else {
        initMapper();
    }
})();
