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

        // 미리보기 모드인지 확인
        const isPreviewMode = window.previewHandler !== undefined;

        // URL에서 facility id 추출
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        // facilityId가 있으면 해당 facility 찾기, 없으면 -1
        const facilities = this.data.property.facilities;
        const facilityIndex = facilityId
            ? facilities.findIndex(facility => facility.id === facilityId)
            : -1;

        // facility를 찾지 못한 경우 (ID 없음 또는 ID 유효하지 않음)
        if (facilityIndex === -1) {
            // 미리보기 모드면 첫 번째 facility 사용
            if (isPreviewMode && facilities.length > 0) {
                const facility = facilities[0];
                this.currentFacility = facility;
                this.currentFacilityIndex = 0;
                return facility;
            }

            // 미리보기 모드가 아닐 때만 에러 출력
            if (!isPreviewMode) {
                const errorMsg = facilityId
                    ? `Facility with id ${facilityId} not found`
                    : 'Facility id not specified in URL';
                console.error(errorMsg);
            }
            return null;
        }

        // facility 찾은 경우
        const facility = facilities[facilityIndex];
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
     * Hero 섹션 매핑
     */
    mapHeroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // Hero 텍스트 매핑
        this.mapHeroText();

        // Hero 슬라이더 이미지 매핑
        this.mapHeroSlider();
    }

    /**
     * Hero 텍스트 섹션 매핑
     */
    mapHeroText() {
        // Hero 숙소 영문명 매핑 (brand-title)
        const propertyNameEn = this.safeSelect('[data-property-name-en]');
        if (propertyNameEn) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * Hero 이미지 슬라이더 매핑
     */
    mapHeroSlider() {
        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        const facility = this.getCurrentFacility();
        if (!facility) return;

        heroSlider.innerHTML = '';

        // 현재 시설의 이미지 가져오기
        const images = facility.images
            ? facility.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
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
    }

    /**
     * Facility Introduction 섹션 매핑
     */
    mapFacilityIntroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 시설 번호 매핑 (SPECIAL 01, 02, 03, 04...)
        const facilityNumber = document.getElementById('facility-number');
        if (facilityNumber && this.currentFacilityIndex !== null) {
            const facilityIndex = this.currentFacilityIndex + 1;
            facilityNumber.textContent = `SPECIAL ${String(facilityIndex).padStart(2, '0')}`;
        }

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

        // 1번째 이미지 매핑 (facility-images-1)
        const facilityImage1 = this.safeSelect('[data-facility-images-1]');
        if (facilityImage1 && facility.images && facility.images[1]) {
            facilityImage1.src = facility.images[1].url;
            facilityImage1.alt = facility.images[1].description || 'Facility Image';
            facilityImage1.classList.remove('empty-image-placeholder');
        } else if (facilityImage1) {
            facilityImage1.src = ImageHelpers.EMPTY_IMAGE_SVG;
            facilityImage1.alt = 'No Image Available';
            facilityImage1.className = 'empty-image-placeholder';
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

        // 세 탭 모두 비어있으면 Experience 섹션 전체 숨기기
        const experienceSection = this.safeSelect('.facility-experience-section');
        if (experienceSection) {
            const featuresContainer = this.safeSelect('[data-facility-features-container]');
            const additionalInfosContainer = this.safeSelect('[data-facility-additionalinfos-container]');
            const benefitsContainer = this.safeSelect('[data-facility-benefits-container]');

            const hasFeatures = featuresContainer && featuresContainer.children.length > 0;
            const hasAdditionalInfos = additionalInfosContainer && additionalInfosContainer.children.length > 0;
            const hasBenefits = benefitsContainer && benefitsContainer.children.length > 0;

            if (!hasFeatures && !hasAdditionalInfos && !hasBenefits) {
                experienceSection.style.display = 'none';
            }
        }
    }

    /**
     * 경험 섹션 이미지 매핑 헬퍼 함수
     * @param {string} selector - 이미지 엘리먼트 selector
     * @param {number} imageIndex - 사용할 이미지 인덱스 (0, 1, 2)
     * @private
     */
    _mapExperienceImage(selector, imageIndex) {
        const imageElement = this.safeSelect(selector);
        if (!imageElement) return;

        const facility = this.getCurrentFacility();
        const images = facility?.images || [];
        const selectedImages = images
            .filter(img => img.isSelected)
            .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));

        if (selectedImages.length > imageIndex && selectedImages[imageIndex]?.url) {
            imageElement.src = selectedImages[imageIndex].url;
            imageElement.classList.remove('empty-image-placeholder');
        } else {
            imageElement.src = ImageHelpers.EMPTY_IMAGE_SVG;
            imageElement.classList.add('empty-image-placeholder');
        }
    }

    /**
     * 주요 특징 섹션 매핑
     */
    mapExperienceFeatures() {
        // 이미지 매핑 (facility 없어도 실행)
        this._mapExperienceImage('[data-facility-features-image]', 0);

        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-features-container]');
        if (!container) return;

        // customFields에서 experience.features 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const features = facilityPageData?.sections?.[0]?.experience?.features || [];

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';

        if (features.length === 0) {
            // 데이터가 없으면 아무것도 추가하지 않음
        } else {
            features.forEach(feature => {
                const featureItem = document.createElement('div');
                featureItem.className = 'facility-feature-item';

                const titleText = (feature.title !== undefined && feature.title !== '')
                    ? feature.title
                    : '특징 타이틀';
                const descText = (feature.description !== undefined && feature.description !== '')
                    ? feature.description
                    : '특징 설명';

                const content = document.createElement('p');
                content.className = 'feature-content';
                content.innerHTML = `<strong>${titleText}</strong> : ${descText}`;

                featureItem.appendChild(content);
                container.appendChild(featureItem);
            });
        }
    }

    /**
     * 추가 정보 섹션 매핑
     */
    mapExperienceAdditionalInfos() {
        // 이미지 매핑 (facility 없어도 실행)
        this._mapExperienceImage('[data-facility-additionalinfos-image]', 1);

        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-additionalinfos-container]');
        if (!container) return;

        // customFields에서 experience.additionalInfos 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const additionalInfos = facilityPageData?.sections?.[0]?.experience?.additionalInfos || [];

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';

        if (additionalInfos.length === 0) {
            // 데이터가 없으면 아무것도 추가하지 않음
        } else {
            additionalInfos.forEach(info => {
                const infoItem = document.createElement('div');
                infoItem.className = 'facility-feature-item';

                const titleText = (info.title !== undefined && info.title !== '')
                    ? info.title
                    : '추가정보 타이틀';
                const descText = (info.description !== undefined && info.description !== '')
                    ? info.description
                    : '추가정보 설명';

                const content = document.createElement('p');
                content.className = 'feature-content';
                content.innerHTML = `<strong>${titleText}</strong> : ${descText}`;

                infoItem.appendChild(content);
                container.appendChild(infoItem);
            });
        }
    }

    /**
     * 이용 혜택 섹션 매핑
     */
    mapExperienceBenefits() {
        // 이미지 매핑 (facility 없어도 실행)
        this._mapExperienceImage('[data-facility-benefits-image]', 2);

        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-benefits-container]');
        if (!container) return;

        // customFields에서 experience.benefits 가져오기
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityPageData = facilityPages?.find(page => page.id === facility.id);
        const benefits = facilityPageData?.sections?.[0]?.experience?.benefits || [];

        // 컨테이너 비우고 동적으로 생성
        container.innerHTML = '';

        if (benefits.length === 0) {
            // 데이터가 없으면 아무것도 추가하지 않음
        } else {
            benefits.forEach(benefit => {
                const benefitItem = document.createElement('div');
                benefitItem.className = 'facility-feature-item';

                const titleText = (benefit.title !== undefined && benefit.title !== '')
                    ? benefit.title
                    : '혜택 타이틀';
                const descText = (benefit.description !== undefined && benefit.description !== '')
                    ? benefit.description
                    : '혜택 설명';

                const content = document.createElement('p');
                content.className = 'feature-content';
                content.innerHTML = `<strong>${titleText}</strong> : ${descText}`;

                benefitItem.appendChild(content);
                container.appendChild(benefitItem);
            });
        }
    }

    /**
     * 갤러리 섹션 매핑 (carousel 형식 - index 경험 갤러리 동일)
     */
    mapGallerySection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const galleryTrack = this.safeSelect('#facility-gallery-track');
        if (!galleryTrack) return;

        // selected 이미지만 필터링 후 정렬
        const selectedImages = facility.images
            ? facility.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        // 갤러리 비우기
        galleryTrack.innerHTML = '';

        if (selectedImages.length === 0) {
            // 이미지가 없으면 placeholder 5개 표시 (index.html처럼)
            for (let i = 0; i < 5; i++) {
                const item = document.createElement('div');
                item.className = i === 0 ? 'gallery-slide active' : 'gallery-slide';
                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = 'No Image Available';
                img.className = 'empty-image-placeholder';
                item.appendChild(img);
                galleryTrack.appendChild(item);
            }
        } else {
            // 슬라이드를 두 배로 복제 (무한 순환 효과)
            const duplicatedImages = [...selectedImages, ...selectedImages];

            duplicatedImages.forEach((image, index) => {
                const description = image.description || facility.name;
                const slide = document.createElement('div');
                slide.className = 'gallery-slide';

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = description;

                slide.appendChild(img);

                // caption 항상 추가
                const caption = document.createElement('div');
                caption.className = 'gallery-caption';
                const captionText = document.createElement('h4');
                captionText.textContent = description;
                caption.appendChild(captionText);
                slide.appendChild(caption);

                galleryTrack.appendChild(slide);
            });
        }

        // 슬라이더 초기화
        if (window.initializeFacilityCarousel) {
            window.initializeFacilityCarousel();
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
            // 미리보기 모드가 아닐 때만 에러 출력
            const isPreviewMode = window.previewHandler !== undefined;
            if (!isPreviewMode) {
                console.error('Cannot map facility page: facility not found');
            }
            // 에러 메시지 표시
            const errorMessage = this.safeSelect('[data-facility-error-message]');
            const loadingMessage = this.safeSelect('[data-facility-loading-message]');
            if (errorMessage) errorMessage.style.display = 'block';
            if (loadingMessage) loadingMessage.style.display = 'none';

            // facility 없어도 empty 이미지는 설정
            this.mapExperienceFeatures();
            this.mapExperienceAdditionalInfos();
            this.mapExperienceBenefits();
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
        const propertyName = this.getPropertyName();
        const pageSEO = {
            title: facility?.name ? `${facility.name} - ${propertyName}` : 'SEO 타이틀',
            description: facility?.description || this.data.property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 클로징 섹션 매핑
        this.mapClosingSection();
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

        // 페이지 인덱스 3 (facility) - 순환 선택
        const pageIndex = 3;
        const selectedImage = exteriorImages.length > 0 ?
            exteriorImages[pageIndex % exteriorImages.length] : null;

        // 배경 이미지 매핑 (데스크탑 parallax)
        const img = this.safeSelect('[data-closing-image]');
        if (img) {
            if (selectedImage?.url) {
                img.src = selectedImage.url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
                img.alt = 'No Image Available';
            }
        }

        // 모바일 이미지 매핑 (원형 구멍 안)
        const mobileImg = this.safeSelect('[data-closing-image-mobile]');
        if (mobileImg) {
            if (selectedImage?.url) {
                mobileImg.src = selectedImage.url;
                mobileImg.classList.remove('empty-image-placeholder');
            } else {
                mobileImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
                mobileImg.classList.add('empty-image-placeholder');
                mobileImg.alt = 'No Image Available';
            }
        }

        // 숙소 영문명 매핑
        const propertyNameEn = this.safeSelect('.closing-property-name-en[data-property-name-en]');
        if (propertyNameEn && this.data.property) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
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

// 자동 초기화 및 window.baseMapper 등록
(function() {
    'use strict';

    // 페이지 로드 완료 후 매퍼 초기화
    async function initMapper() {
        // PreviewHandler가 이미 존재하면 초기화하지 않음 (PreviewHandler가 처리)
        if (window.previewHandler) {
            return;
        }

        // 일반 초기화 (JSON 파일 로드)
        const mapper = new FacilityMapper();
        window.baseMapper = mapper;
        await mapper.initialize();
        await mapper.mapPage();
    }

    // DOMContentLoaded 이후에 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapper);
    } else {
        initMapper();
    }
})();
