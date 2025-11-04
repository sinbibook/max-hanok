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
    }

    // ============================================================================
    // 🏊 FACILITY PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 시설 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data?.property?.facilities) {
            console.error('Data not loaded or no facilities data available');
            return null;
        }

        // URL에서 facility index 추출
        const urlParams = new URLSearchParams(window.location.search);
        const facilityIndex = urlParams.get('index');

        if (facilityIndex === null) {
            console.error('Facility index not specified in URL');
            return null;
        }

        // 인덱스 숫자로 변환
        const index = parseInt(facilityIndex, 10);

        // facilities 배열에서 해당 인덱스의 시설 가져오기
        if (index < 0 || index >= this.data.property.facilities.length) {
            console.error(`Facility index ${index} is out of range (0-${this.data.property.facilities.length - 1})`);
            return null;
        }

        const facility = this.data.property.facilities[index];
        this.currentFacility = facility;
        this.currentFacilityIndex = index; // 인덱스도 저장
        return facility;
    }

    /**
     * 현재 시설 인덱스 가져오기
     */
    getCurrentFacilityIndex() {
        if (this.currentFacilityIndex !== undefined) {
            return this.currentFacilityIndex;
        }

        // getCurrentFacility()이 호출되지 않았을 경우를 위한 fallback
        const urlParams = new URLSearchParams(window.location.search);
        const facilityIndex = urlParams.get('index');
        const index = facilityIndex ? parseInt(facilityIndex, 10) : null;

        if (index !== null && index >= 0 && index < this.data.property.facilities?.length) {
            this.currentFacilityIndex = index;
            return index;
        }

        return null;
    }

    /**
     * 현재 시설 페이지 데이터 가져오기 (캐시 포함)
     */
    getCurrentFacilityPageData() {
        // 캐시된 데이터가 있으면 바로 반환
        if (this.currentFacilityPageData) {
            return this.currentFacilityPageData;
        }

        const facilityIndex = this.getCurrentFacilityIndex();
        if (facilityIndex === null) {
            console.warn('Facility index not available');
            return null;
        }

        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        if (!facilityPages?.[facilityIndex]) {
            console.warn(`Facility page data not found for index ${facilityIndex}`);
            return null;
        }

        // 캐시 저장
        this.currentFacilityPageData = {
            index: facilityIndex,
            data: facilityPages[facilityIndex]
        };

        return this.currentFacilityPageData;
    }

    /**
     * Hero 섹션 매핑 (슬라이더, 텍스트)
     */
    mapHeroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // Hero 텍스트 매핑
        this.mapHeroText(facility);

        // Hero 이미지 슬라이더 초기화
        this.initializeHeroSlider(facility);
    }

    /**
     * Hero 텍스트 섹션 매핑
     */
    mapHeroText(facility) {
        // 시설 이름 매핑
        const facilityHeroName = this.safeSelect('[data-facility-hero-name]');
        if (facilityHeroName) {
            facilityHeroName.textContent = facility.name;
        }

        // Hero 설명 매핑 (JSON에서 sections[0].hero.title 찾기)
        const facilityHeroDescription = this.safeSelect('[data-facility-hero-description]');
        if (facilityHeroDescription) {
            const facilityPageData = this.getCurrentFacilityPageData();
            const heroDescription = facilityPageData?.data?.sections?.[0]?.hero?.title;

            if (heroDescription) {
                facilityHeroDescription.textContent = heroDescription;
            } else {
                // 기본값
                facilityHeroDescription.textContent = facility.description || `${facility.name}을(를) 경험해보세요.`;
            }
        }
    }

    /**
     * Hero 이미지 슬라이더 초기화
     */
    initializeHeroSlider(facility) {
        const slidesContainer = this.safeSelect('[data-facility-hero-slides-container]');

        // JSON 구조에 따라 main 이미지 배열 가져오기
        const mainImages = facility.images?.[0]?.main;

        if (!slidesContainer || !mainImages || mainImages.length === 0) {
            console.warn('No main images found for facility slider');
            return;
        }

        // 기존 슬라이드 제거
        slidesContainer.innerHTML = '';

        // sortOrder로 정렬
        const sortedImages = mainImages
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이드 생성
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img src="${image.url}"
                     alt="${image.description || facility.name}"
                     class="w-full h-full object-cover"
                     loading="${index === 0 ? 'eager' : 'lazy'}">
            `;
            slidesContainer.appendChild(slide);
        });

        // 슬라이드 인디케이터 업데이트
        this.updateSlideIndicators(sortedImages.length);

        // 슬라이더 기능 초기화
        this.initializeSliderControls(sortedImages.length);
    }

    /**
     * 슬라이드 인디케이터 업데이트
     */
    updateSlideIndicators(totalSlides) {
        const currentSlideElement = this.safeSelect('[data-facility-current-slide]');
        const totalSlidesElement = this.safeSelect('[data-facility-total-slides]');

        if (currentSlideElement) {
            currentSlideElement.textContent = '01';
        }

        if (totalSlidesElement) {
            totalSlidesElement.textContent = String(totalSlides).padStart(2, '0');
        }
    }

    /**
     * 슬라이더 컨트롤 초기화
     */
    initializeSliderControls(totalSlides) {
        if (totalSlides <= 1) return;

        // 클래스 내부 속성으로 상태 관리
        this.currentSlideIndex = 0;
        this.totalSlideCount = totalSlides;

        // DOM 요소에 이벤트 리스너 연결
        const nextBtn = this.safeSelect('.nav-button.next');
        const prevBtn = this.safeSelect('.nav-button.prev');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
    }

    /**
     * 다음 슬라이드로 이동
     */
    nextSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        slides[this.currentSlideIndex].classList.remove('active');
        this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
        slides[this.currentSlideIndex].classList.add('active');

        // 인디케이터 업데이트
        this.updateSlideIndicator();
    }

    /**
     * 이전 슬라이드로 이동
     */
    prevSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        slides[this.currentSlideIndex].classList.remove('active');
        this.currentSlideIndex = this.currentSlideIndex === 0 ? slides.length - 1 : this.currentSlideIndex - 1;
        slides[this.currentSlideIndex].classList.add('active');

        // 인디케이터 업데이트
        this.updateSlideIndicator();
    }

    /**
     * 슬라이드 인디케이터 업데이트
     */
    updateSlideIndicator() {
        const currentSlideElement = this.safeSelect('[data-facility-current-slide]');
        if (currentSlideElement) {
            currentSlideElement.textContent = String(this.currentSlideIndex + 1).padStart(2, '0');
        }
    }

    /**
     * About 섹션 매핑
     */
    mapAboutSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // About 제목 매핑 (sections[0].about.title)
        const aboutTitle = this.safeSelect('[data-facility-about-title]');
        if (aboutTitle) {
            const facilityPageData = this.getCurrentFacilityPageData();
            const aboutTitleText = facilityPageData?.data?.sections?.[0]?.about?.title;

            if (aboutTitleText) {
                // \n\n을 <br><br>로 변환하여 개행 처리
                const formattedText = aboutTitleText.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
                aboutTitle.innerHTML = formattedText;
            } else {
                // 기본값
                aboutTitle.innerHTML = `${facility.name}을(를) 소개합니다.`;
            }
        }

        // About 설명 매핑 (property.facilities[N].description)
        const aboutDescription = this.safeSelect('[data-facility-about-description]');
        if (aboutDescription) {
            aboutDescription.textContent = facility.description || '';
        }

        // About 이미지 매핑 (sections[0].about.images 또는 facility의 main 이미지)
        const aboutImage = this.safeSelect('[data-facility-about-image]');
        if (aboutImage) {
            const facilityPageData = this.getCurrentFacilityPageData();
            const aboutImages = facilityPageData?.data?.sections?.[0]?.about?.images;

            // about.images가 있으면 사용, 없으면 main 이미지의 두 번째 이미지 사용
            let imageUrl = null;
            if (aboutImages && aboutImages.length > 0) {
                const sortedImages = aboutImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                imageUrl = sortedImages[0]?.url;
            } else {
                // main 이미지의 두 번째 이미지 (index 1) 사용
                const mainImages = facility.images?.[0]?.main;
                if (mainImages && mainImages.length > 1) {
                    const sortedImages = mainImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                    imageUrl = sortedImages[1]?.url;
                }
            }

            if (imageUrl) {
                aboutImage.innerHTML = `
                    <img src="${imageUrl}"
                         alt="${facility.name}"
                         class="w-full h-full object-cover">
                `;
            }
        }
    }

    /**
     * Experience 섹션 매핑 (Features, Additional Info, Benefits)
     */
    mapExperienceSection() {
        const facilityPageData = this.getCurrentFacilityPageData();
        if (!facilityPageData) return;

        const experienceData = facilityPageData.data?.sections?.[0]?.experience;

        // Features 매핑
        this.mapExperienceFeatures(experienceData?.features);

        // Additional Info 매핑
        this.mapExperienceAdditionalInfo(experienceData?.additionalInfos);

        // Benefits 매핑
        this.mapExperienceBenefits(experienceData?.benefits);
    }

    /**
     * Experience Features 매핑
     */
    mapExperienceFeatures(features) {
        if (!features || features.length === 0) return;

        const featuresContainer = this.safeSelect('[data-facility-experience-features]');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = '';

        features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'experience-feature-item';
            featureItem.innerHTML = `
                <h4 class="feature-title">${feature.title}</h4>
                <p class="feature-description">${feature.description}</p>
            `;
            featuresContainer.appendChild(featureItem);
        });
    }

    /**
     * Experience Additional Info 매핑
     */
    mapExperienceAdditionalInfo(additionalInfos) {
        if (!additionalInfos || additionalInfos.length === 0) return;

        const additionalInfoContainer = this.safeSelect('[data-facility-experience-additional-info]');
        if (!additionalInfoContainer) return;

        additionalInfoContainer.innerHTML = '';

        additionalInfos.forEach(info => {
            const infoItem = document.createElement('div');
            infoItem.className = 'experience-info-item';
            infoItem.innerHTML = `
                <strong class="info-title">${info.title}:</strong>
                <span class="info-description">${info.description}</span>
            `;
            additionalInfoContainer.appendChild(infoItem);
        });
    }

    /**
     * Experience Benefits 매핑
     */
    mapExperienceBenefits(benefits) {
        if (!benefits || benefits.length === 0) return;

        const benefitsContainer = this.safeSelect('[data-facility-experience-benefits]');
        if (!benefitsContainer) return;

        benefitsContainer.innerHTML = '';

        benefits.forEach(benefit => {
            const benefitItem = document.createElement('div');
            benefitItem.className = 'experience-benefit-item';
            benefitItem.innerHTML = `
                <h4 class="benefit-title">${benefit.title}</h4>
                <p class="benefit-description">${benefit.description}</p>
            `;
            benefitsContainer.appendChild(benefitItem);
        });
    }

    /**
     * Gallery 섹션 매핑
     */
    mapGallerySection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const galleryContainer = this.safeSelect('[data-facility-gallery]');
        if (!galleryContainer) return;

        // main 이미지 배열 가져오기
        const mainImages = facility.images?.[0]?.main;
        if (!mainImages || mainImages.length === 0) return;

        // sortOrder로 정렬
        const sortedImages = mainImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 기존 갤러리 제거
        galleryContainer.innerHTML = '';

        // 모든 이미지 표시
        sortedImages.forEach((image) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'facility-gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.url}"
                     alt="${image.description || facility.name}"
                     class="w-full h-full object-cover"
                     loading="lazy">
            `;
            galleryContainer.appendChild(galleryItem);
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
            return;
        }

        // 페이지 제목 업데이트
        this.updatePageTitle(facility);

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapAboutSection();
        this.mapExperienceSection();
        this.mapGallerySection();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * 페이지 제목 업데이트
     */
    updatePageTitle(facility) {
        const property = this.data.property;

        // HTML title 업데이트
        document.title = `${facility.name} - ${property.name}`;

        // page-title 엘리먼트 업데이트
        const pageTitleElement = this.safeSelect('#page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = `${facility.name} - ${property.name}`;
        }
    }

    /**
     * 네비게이션 함수 설정
     */
    setupNavigation() {
        // 홈으로 이동 함수 설정
        window.navigateToHome = () => {
            window.location.href = 'index.html';
        };
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}

// Auto-initialize for facility.html
(function initializeFacilityMapper() {
    if (!window.location.pathname.includes('facility.html')) return;

    const init = async () => {
        try {
            const facilityMapper = new FacilityMapper();
            await facilityMapper.initialize();
            facilityMapper.setupNavigation();
        } catch (error) {
            console.error('Failed to initialize FacilityMapper:', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();