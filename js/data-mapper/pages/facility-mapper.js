/**
 * Facility Page Data Mapper
 * facility.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 시설 페이지 전용 기능 제공
 * URL 파라미터로 ?index=0,1,2...를 받아서 동적으로 시설 정보 표시
 */
class FacilityMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentFacility = null;
        this.currentFacilityIndex = null;
        this.currentFacilityPageData = null;
    }

    // ============================================================================
    // 🏢 FACILITY PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 시설 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            console.error('Data not loaded or no facilities data available');
            return null;
        }

        // URL에서 facility id 추출
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            console.error('Facility id not specified in URL');
            return null;
        }

        // facilities 배열에서 해당 id의 시설 찾기
        const facilityIndex = this.data.property.facilities.findIndex(facility => facility.id === facilityId);

        if (facilityIndex === -1) {
            console.error(`Facility with id ${facilityId} not found`);
            return null;
        }

        const facility = this.data.property.facilities[facilityIndex];
        this.currentFacility = facility;
        this.currentFacilityIndex = facilityIndex; // 인덱스도 저장 (페이지 데이터 접근용)
        return facility;
    }

    /**
     * 현재 시설 인덱스 가져오기
     */
    getCurrentFacilityIndex() {
        if (this.currentFacilityIndex !== null) {
            return this.currentFacilityIndex;
        }

        // getCurrentFacility()가 호출되지 않았을 경우를 위한 fallback
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (facilityId && this.data.property?.facilities) {
            const index = this.data.property.facilities.findIndex(facility => facility.id === facilityId);
            if (index !== -1) {
                this.currentFacilityIndex = index;
                return index;
            }
        }

        return null;
    }

    /**
     * Hero 슬라이더 매핑 (property.facilities 이미지 사용)
     */
    mapHeroSlider() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const heroSlider = this.safeSelect('#hero-slider');
        if (!heroSlider) return;

        // facility.images 배열에서 이미지 가져오기 (isSelected: true만 필터링 후 sortOrder로 정렬)
        const mainImages = facility.images || [];
        const selectedImages = mainImages
            .filter(img => img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        if (selectedImages.length === 0) {
            // 이미지가 없으면 빈 슬라이드 1개 생성
            this.createEmptyHeroSlide(heroSlider, facility.name);
            return;
        }

        // 슬라이드 생성
        heroSlider.innerHTML = '';
        selectedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || facility.name;
            img.loading = index === 0 ? 'eager' : 'lazy';

            slide.appendChild(img);
            heroSlider.appendChild(slide);
        });

        // 슬라이더 초기화 콜백 호출 (facility.js에서 설정)
        if (typeof window.initializeFacilitySlider === 'function') {
            window.initializeFacilitySlider();
        }
    }

    /**
     * 빈 히어로 슬라이드 생성
     */
    createEmptyHeroSlide(heroSlider, facilityName) {
        heroSlider.innerHTML = '';
        const slide = document.createElement('div');
        slide.className = 'hero-slide active';

        const img = document.createElement('img');
        img.src = ImageHelpers.EMPTY_IMAGE_SVG;
        img.alt = facilityName || '이미지 없음';
        img.className = 'empty-image-placeholder';
        img.loading = 'eager';

        slide.appendChild(img);
        heroSlider.appendChild(slide);

        // 슬라이더 초기화 콜백 호출
        if (typeof window.initializeFacilitySlider === 'function') {
            window.initializeFacilitySlider();
        }
    }

    /**
     * Hero 섹션 매핑
     */
    mapHeroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // Hero 이미지 매핑
        const heroImage = this.safeSelect('[data-facility-hero-image]');
        if (heroImage) {
            // facility.images 배열에서 이미지 가져오기 (isSelected: true만 필터링 후 sortOrder로 정렬)
            const mainImages = facility.images || [];
            const selectedImages = mainImages
                .filter(img => img.isSelected)
                .sort((a, b) => a.sortOrder - b.sortOrder);

            if (selectedImages.length > 0 && selectedImages[0]?.url) {
                heroImage.src = selectedImages[0].url;
                heroImage.alt = selectedImages[0].description || facility.name;
                heroImage.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(heroImage);
            }
        }

        // Hero 제목/설명 매핑
        const heroSubtitle = this.safeSelect('[data-facility-hero-subtitle]');
        if (heroSubtitle) {
            heroSubtitle.textContent = '특별한 부가서비스';
        }

        const heroTitle = this.safeSelect('[data-facility-hero-title]');
        if (heroTitle) {
            heroTitle.textContent = facility.name;
        }

        // Hero 페이지 상단 제목 매핑
        const heroPageTitle = this.safeSelect('[data-facility-hero-page-title]');
        if (heroPageTitle) {
            heroPageTitle.textContent = facility.name;
        }

        const heroDescription = this.safeSelect('[data-facility-hero-description]');
        if (heroDescription) {
            // hero.title 사용 - id로 매칭
            const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
            const facilityPageData = facilityPages?.find(page => page.id === facility.id);
            const description = facilityPageData?.sections?.[0]?.hero?.title || facility.description || `${facility.name}을 이용해보세요.`;
            heroDescription.textContent = description;
        }
    }

    /**
     * Facility Introduction 섹션 매핑
     */
    mapFacilityIntroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 시설명 매핑
        const facilityName = this.safeSelect('[data-facility-name]');
        if (facilityName) {
            facilityName.textContent = facility.name || 'BBQ';
        }

        // 시설 설명 매핑
        const facilityDescription = this.safeSelect('[data-facility-description]');
        if (facilityDescription) {
            // customFields에서 about.title 가져오기
            const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
            const facilityPageData = facilityPages?.find(page => page.id === facility.id);
            const description = facilityPageData?.sections?.[0]?.about?.title || facility.description || '시설 설명입니다.';
            facilityDescription.textContent = description;
        }
    }

    /**
     * 메인 콘텐츠 섹션 매핑
     */
    mapMainContentSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 로딩/에러 상태 숨기기
        const loadingMessage = this.safeSelect('[data-facility-loading-message]');
        const errorMessage = this.safeSelect('[data-facility-error-message]');
        const mainContent = this.safeSelect('[data-facility-main-content]');

        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';

        // 콘텐츠 제목/부제목 매핑
        const contentSubtitle = this.safeSelect('[data-facility-content-subtitle]');
        if (contentSubtitle) {
            contentSubtitle.textContent = '특별한 부가서비스';
        }

        const contentTitle = this.safeSelect('[data-facility-content-title]');
        if (contentTitle) {
            contentTitle.textContent = facility.name;
        }

        // 이미지 매핑
        this.mapFacilityImages(facility);

        // 시설 설명 매핑
        const facilityContent = this.safeSelect('[data-facility-content]');
        if (facilityContent) {
            // facility.about.title 사용 - id로 매칭
            const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
            const facilityPageData = facilityPages?.find(page => page.id === facility.id);
            const description = facilityPageData?.sections?.[0]?.about?.title || facility.description || `${facility.name}에 대한 설명입니다.`;
            facilityContent.innerHTML = description.replace(/\n/g, '<br>');
        }

        // 이용안내 매핑
        const usageGuideContent = this.safeSelect('[data-facility-usage-guide]');
        if (usageGuideContent && facility.usageGuide) {
            const formattedGuide = facility.usageGuide.replace(/\n/g, '<br>');
            usageGuideContent.innerHTML = formattedGuide;
        }
    }

    /**
     * 시설 이미지 매핑
     */
    mapFacilityImages(facility) {
        // facility.images 배열에서 이미지 가져오기 (isSelected: true만 필터링 후 sortOrder로 정렬)
        const mainImages = facility.images || [];
        const selectedImages = mainImages
            .filter(img => img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 이미지 적용 헬퍼 함수
        const applyImage = (element, image) => {
            if (element) {
                if (image?.url) {
                    element.src = image.url;
                    element.alt = image.description || facility.name;
                    element.classList.remove('empty-image-placeholder');
                } else {
                    ImageHelpers.applyPlaceholder(element);
                }
            }
        };

        // Small image (두 번째 이미지)
        const smallImage = this.safeSelect('[data-facility-small-image]');
        applyImage(smallImage, selectedImages.length > 1 ? selectedImages[1] : selectedImages[0]);

        // Large image (세 번째 이미지 또는 첫 번째)
        const largeImage = this.safeSelect('[data-facility-large-image]');
        applyImage(largeImage, selectedImages.length > 2 ? selectedImages[2] : selectedImages[0]);
    }


    /**
     * Experience 섹션 매핑 (주요 특징, 추가 정보, 이용 혜택)
     */
    mapExperienceSection() {
        this.mapExperienceFeatures();
        this.mapExperienceAdditionalInfos();
        this.mapExperienceBenefits();
    }

    /**
     * 주요 특징 섹션 매핑
     */
    mapExperienceFeatures() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-features-container]');
        if (!container) return;

        // customFields에서 experience.features 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const features = facilityPageData?.sections?.[0]?.experience?.features || [];

        if (features.length === 0) {
            // 데이터가 없으면 기존 하드코딩된 내용 유지
            return;
        }

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';
        features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'facility-feature-item';

            const title = document.createElement('h4');
            title.className = 'feature-title';
            title.textContent = feature.title || '';

            const description = document.createElement('p');
            description.className = 'feature-description';
            description.textContent = feature.description || '';

            featureItem.appendChild(title);
            featureItem.appendChild(description);
            container.appendChild(featureItem);
        });

        // 이미지 매핑 (현재 facility의 이미지 사용 - 뒤에서 0번째)
        const featureImage = this.safeSelect('[data-facility-features-image]');
        if (featureImage && facility) {
            const images = facility?.images || [];
            const selectedImages = images
                .filter(img => img.isSelected)
                .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
            if (selectedImages.length > 0 && selectedImages[0]?.url) {
                featureImage.src = selectedImages[0].url;
                featureImage.classList.remove('empty-image-placeholder');
            } else {
                featureImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                featureImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 추가 정보 섹션 매핑
     */
    mapExperienceAdditionalInfos() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-additionalinfos-container]');
        if (!container) return;

        // customFields에서 experience.additionalInfos 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const additionalInfos = facilityPageData?.sections?.[0]?.experience?.additionalInfos || [];

        if (additionalInfos.length === 0) {
            // 데이터가 없으면 기존 하드코딩된 내용 유지
            return;
        }

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';
        additionalInfos.forEach(info => {
            const infoItem = document.createElement('div');
            infoItem.className = 'facility-feature-item';

            const title = document.createElement('h4');
            title.className = 'feature-title';
            title.textContent = info.title || '';

            const description = document.createElement('p');
            description.className = 'feature-description';
            description.textContent = info.description || '';

            infoItem.appendChild(title);
            infoItem.appendChild(description);
            container.appendChild(infoItem);
        });

        // 이미지 매핑 (현재 facility의 이미지 사용 - 뒤에서 1번째)
        const additionalInfoImage = this.safeSelect('[data-facility-additionalinfos-image]');
        if (additionalInfoImage && facility) {
            const images = facility?.images || [];
            const selectedImages = images
                .filter(img => img.isSelected)
                .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
            if (selectedImages.length > 1 && selectedImages[1]?.url) {
                additionalInfoImage.src = selectedImages[1].url;
                additionalInfoImage.classList.remove('empty-image-placeholder');
            } else {
                additionalInfoImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                additionalInfoImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 이용 혜택 섹션 매핑
     */
    mapExperienceBenefits() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-benefits-container]');
        if (!container) return;

        // customFields에서 experience.benefits 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const benefits = facilityPageData?.sections?.[0]?.experience?.benefits || [];

        if (benefits.length === 0) {
            // 데이터가 없으면 기존 하드코딩된 내용 유지
            return;
        }

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';
        benefits.forEach(benefit => {
            const benefitItem = document.createElement('div');
            benefitItem.className = 'facility-feature-item';

            const title = document.createElement('h4');
            title.className = 'feature-title';
            title.textContent = benefit.title || '';

            const description = document.createElement('p');
            description.className = 'feature-description';
            description.textContent = benefit.description || '';

            benefitItem.appendChild(title);
            benefitItem.appendChild(description);
            container.appendChild(benefitItem);
        });

        // 이미지 매핑 (현재 facility의 이미지 사용 - 뒤에서 2번째)
        const benefitImage = this.safeSelect('[data-facility-benefits-image]');
        if (benefitImage && facility) {
            const images = facility?.images || [];
            const selectedImages = images
                .filter(img => img.isSelected)
                .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
            if (selectedImages.length > 2 && selectedImages[2]?.url) {
                benefitImage.src = selectedImages[2].url;
                benefitImage.classList.remove('empty-image-placeholder');
            } else {
                benefitImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                benefitImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 갤러리 섹션 매핑 (현재는 숨김 처리)
     */
    mapGallerySection() {
        const gallerySection = this.safeSelect('[data-facility-gallery-section]');
        if (gallerySection) {
            gallerySection.style.display = 'none';
        }
    }

    /**
     * 슬라이더 섹션 매핑 (데이터만 매핑)
     */
    mapSliderSection() {
        const facility = this.getCurrentFacility();
        const sliderSection = this.safeSelect('[data-facility-slider-section]');

        if (!facility || !sliderSection) {
            return;
        }

        // facility.images 배열에서 이미지 가져오기 (isSelected: true만 필터링 후 sortOrder로 역순 정렬)
        const mainImages = facility.images || [];
        const selectedImages = mainImages
            .filter(img => img.isSelected)
            .sort((a, b) => b.sortOrder - a.sortOrder);

        if (selectedImages.length === 0) {
            // 선택된 이미지가 없으면 빈 슬라이드 1개 표시
            sliderSection.style.display = 'block';
            this.createEmptySlide();
            return;
        }

        sliderSection.style.display = 'block';

        // 역순으로 변경 (마지막부터 첫 번째까지)
        const reversedImages = [...selectedImages].reverse();

        this.createSlides(reversedImages, facility.name);
        this.createIndicators(reversedImages);

        window.facilityTotalSlides = reversedImages.length;
    }

    /**
     * 빈 슬라이드 생성
     */
    createEmptySlide() {
        const slidesContainer = this.safeSelect('[data-facility-slides-container]');
        if (!slidesContainer) return;

        slidesContainer.innerHTML = '';
        const slide = document.createElement('div');
        slide.className = 'facility-slide active';

        const img = document.createElement('img');
        img.src = ImageHelpers.EMPTY_IMAGE_SVG;
        img.alt = '이미지 없음';
        img.className = 'empty-image-placeholder';
        img.loading = 'eager';

        slide.appendChild(img);
        slidesContainer.appendChild(slide);

        // 인디케이터 숨기기
        const indicatorsContainer = this.safeSelect('[data-facility-slide-indicators]');
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = '';
        }

        window.facilityTotalSlides = 1;
    }

    /**
     * 슬라이드 생성
     */
    createSlides(sortedImages, facilityName) {
        const slidesContainer = this.safeSelect('[data-facility-slides-container]');
        if (!slidesContainer) return;

        slidesContainer.innerHTML = '';
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `facility-slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || facilityName;
            img.loading = 'lazy';

            slide.appendChild(img);
            slidesContainer.appendChild(slide);
        });
    }

    /**
     * 인디케이터 생성
     */
    createIndicators(sortedImages) {
        const indicatorsContainer = this.safeSelect('[data-facility-slide-indicators]');
        if (!indicatorsContainer || sortedImages.length <= 1) return;

        indicatorsContainer.innerHTML = '';
        sortedImages.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `facility-indicator ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => window.goToFacilitySlide(index);
            indicatorsContainer.appendChild(indicator);
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Facility 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map facility page: data not loaded');
            return;
        }

        const facility = this.getCurrentFacility();
        if (!facility) {
            console.error('Cannot map facility page: facility not found');
            // 에러 메시지 표시
            const errorMessage = this.safeSelect('[data-facility-error-message]');
            const loadingMessage = this.safeSelect('[data-facility-loading-message]');
            if (errorMessage) errorMessage.style.display = 'block';
            if (loadingMessage) loadingMessage.style.display = 'none';
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSlider();
        this.mapHeroSection();
        this.mapFacilityIntroSection();
        this.mapMainContentSection();
        this.mapExperienceSection();
        this.mapGallerySection();
        this.mapSliderSection();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const pageSEO = {
            title: (facility?.name && property?.name) ? `${facility.name} - ${property.name}` : 'SEO 타이틀',
            description: facility?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * Facility 페이지 텍스트만 업데이트
     */
    mapFacilityText() {
        if (!this.isDataLoaded) return;

        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 텍스트 관련 섹션들만 업데이트
        this.mapHeroSection();
        this.mapMainContentSection();
        this.mapExperienceSection();
    }

    /**
     * 네비게이션 함수 설정
     */
    setupNavigation() {
        // 홈으로 이동 함수 설정
        window.navigateToHome = () => {
            window.location.href = './index.html';
        };
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}
