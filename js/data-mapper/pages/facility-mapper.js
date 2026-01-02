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
    }

    // ============================================================================
    // 🏢 FACILITY PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 시설 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data.property?.facilities) {
            return null;
        }

        // URL에서 facility id 추출
        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');

        if (!facilityId) {
            return null;
        }

        // facilities 배열에서 해당 id의 시설 찾기
        const facilityIndex = this.data.property.facilities.findIndex(facility => facility.id === facilityId);

        if (facilityIndex === -1) {
            return null;
        }

        const facility = this.data.property.facilities[facilityIndex];
        this.currentFacility = facility;
        this.currentFacilityIndex = facilityIndex; // 인덱스도 저장 (커스텀 필드 접근용)
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
        const facilityId = urlParams.get('id');

        if (!facilityId || !this.data?.property?.facilities) {
            return null;
        }

        // id로 인덱스 찾기
        const index = this.data.property.facilities.findIndex(facility => facility.id === facilityId);

        if (index !== -1) {
            this.currentFacilityIndex = index;
            return index;
        }

        return null;
    }

    /**
     * 기본 시설 정보 매핑 (con2 섹션)
     */
    mapFacilityBasicInfo() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const index = this.getCurrentFacilityIndex();
        if (index === null) return;

        // 커스텀 필드 찾기 (facility.id로 매칭)
        const facilityPages = this.safeGet(this.data, 'homepage.customFields.pages.facility');
        const facilityCustomField = Array.isArray(facilityPages)
            ? facilityPages.find(f => f.id === facility.id)
            : null;

        // 시설명 매핑 - data 속성 사용
        const nameElements = document.querySelectorAll("[data-facility-name]");
        nameElements.forEach(nameEl => {
            if (nameEl && facility.name) {
                nameEl.textContent = facility.name;
            }
        });

        // 시설 히어로 타이틀 매핑 - hero.title 사용
        const heroTitleElements = document.querySelectorAll("[data-facility-hero-title]");
        heroTitleElements.forEach(heroEl => {
            if (heroEl) {
                const heroTitle = this.safeGet(facilityCustomField, 'sections.0.hero.title');
                const sanitizedTitle = this.sanitizeText(heroTitle, this.sanitizeText(facility.description));
                // 빈 문자열('')도 업데이트하여 이전 값 제거
                heroEl.innerHTML = this._formatTextWithLineBreaks(sanitizedTitle);
            }
        })

        // 커스텀 필드 about.title 매핑 (상세 타이틀)
        const aboutTitleEl = this.safeSelect('[data-facility-about-title]');
        if (aboutTitleEl) {
            const aboutTitle = this.safeGet(facilityCustomField, 'sections.0.about.title');
            const sanitizedAboutTitle = this.sanitizeText(aboutTitle, this.sanitizeText(facility.description));
            // 빈 문자열('')도 업데이트하여 이전 값 제거
            aboutTitleEl.innerHTML = this._formatTextWithLineBreaks(sanitizedAboutTitle);
        }

        // 이용안내 매핑 (facility.usageGuide)
        const usageGuideEl = this.safeSelect('[data-facility-usage-guide]');
        if (usageGuideEl && facility.usageGuide) {
            usageGuideEl.innerHTML = this._formatTextWithLineBreaks(facility.usageGuide);
        }

        // 메인 이미지 매핑
        this.mapFacilityMainImage(facility);

        // 갤러리 이미지 매핑
        this.mapFacilityGallery(facility);
    }

    /**
     * 시설 메인 이미지 매핑
     */
    mapFacilityMainImage(facility) {
        const mainImageEl = this.safeSelect('.facility-main-image .imgGrpPic');
        if (!mainImageEl) return;

        // Get first selected image using ImageHelpers
        const firstImage = ImageHelpers.getFirstSelectedImage(facility.images);

        if (firstImage && firstImage.url) {
            mainImageEl.style.backgroundImage = `url('${firstImage.url}')`;
            mainImageEl.classList.remove('empty-image-placeholder');

            // 이미지 로드 실패 처리
            const img = new Image();
            img.onerror = () => {
                mainImageEl.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
                mainImageEl.classList.add('empty-image-placeholder');
            };
            img.src = firstImage.url;
        } else {
            // 이미지 데이터가 없으면 empty placeholder 사용
            mainImageEl.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            mainImageEl.classList.add('empty-image-placeholder');
        }
    }

    /**
     * 시설 갤러리 매핑
     * 이미지 개수에 따라 동적으로 grid 레이아웃 적용
     * 첫 번째 이미지는 메인 이미지에서 사용하므로 1번째부터 표시
     */
    mapFacilityGallery(facility) {
        const galleryList = this.safeSelect('.roomGalleryList');
        if (!galleryList) return;

        galleryList.innerHTML = '';

        // Get selected and sorted images using ImageHelpers
        const sortedImages = ImageHelpers.filterSelectedImages(facility.images);

        // 첫 번째 이미지 제외 (메인 이미지에서 이미 사용 중)
        const galleryImages = sortedImages.slice(1);
        const imageCount = galleryImages.length;

        // 이미지가 없으면 placeholder 3개 생성
        if (imageCount === 0) {
            this.applyGalleryLayout(galleryList, 3);
            for (let i = 0; i < 3; i++) {
                this.createGalleryItem(galleryList, null, facility.name, i, 3);
            }
            return;
        }

        // 동적 레이아웃 적용
        this.applyGalleryLayout(galleryList, imageCount);

        // 실제 이미지 표시 (1번째부터 표시)
        galleryImages.forEach((image, index) => {
            this.createGalleryItem(galleryList, image, facility.name, index, imageCount);
        });
    }

    /**
     * 이미지 개수에 따른 grid 레이아웃 동적 적용
     */
    applyGalleryLayout(galleryList, count) {
        // 기본 6열 grid
        galleryList.style.gridTemplateColumns = 'repeat(6, 1fr)';
        galleryList.style.maxWidth = '100%';
        galleryList.style.margin = '0 auto';

        // 개수별 규칙
        if (count === 1) {
            // 1개: 3열 그리드에서 3칸 전체 사용 (100% 너비)
            galleryList.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (count === 2) {
            // 2개: 2열
            galleryList.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else if (count === 4) {
            // 4개: 2x2
            galleryList.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            // 3개 이상: 6열 기반 (유연한 레이아웃)
            galleryList.style.gridTemplateColumns = 'repeat(6, 1fr)';
        }
    }

    /**
     * 갤러리 아이템 생성 헬퍼
     */
    createGalleryItem(galleryList, image, facilityName, index = 0, totalCount = 0) {
        const li = document.createElement('li');
        li.className = 'roomGalleryItem';

        // 동적 span 크기 적용
        const spanSize = this.calculateItemSpan(index, totalCount);
        li.style.gridColumn = `span ${spanSize}`;

        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'roomGalleryThumb';

        const img = document.createElement('img');

        if (image && image.url) {
            // 실제 이미지가 있는 경우
            img.src = image.url;
            img.alt = image.description || facilityName || '';
            img.loading = 'lazy';

            // 이미지 로드 실패시 placeholder로 변경
            img.onerror = function() {
                this.onerror = null;
                this.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                this.alt = '';
                this.classList.add('empty-image-placeholder');
            };
        } else {
            // 이미지가 없는 경우 placeholder 사용
            img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img.alt = '';
            img.loading = 'lazy';
            img.classList.add('empty-image-placeholder');
        }

        thumbDiv.appendChild(img);
        li.appendChild(thumbDiv);
        galleryList.appendChild(li);
    }

    /**
     * 아이템별 grid-column span 크기 계산
     * 규칙: 1행에 최대 3개 배치, 마지막 행 개수에 따라 크기 조절
     * - 마지막 행 1개: span 6 (큰 사이즈)
     * - 마지막 행 2개: span 3 (중간 사이즈)
     * - 마지막 행 3개: span 2 (작은 사이즈, 기본)
     */
    calculateItemSpan(index, totalCount) {
        // 특수 케이스: 1개
        if (totalCount === 1) return 3; // 3열 그리드에서 3칸 전체 사용 (100% 너비)

        // 특수 케이스: 2개
        if (totalCount === 2) return 1; // grid-template-columns가 repeat(2, 1fr)이므로

        // 특수 케이스: 4개는 2x2
        if (totalCount === 4) return 1; // grid-template-columns가 repeat(2, 1fr)이므로

        // 일반 규칙 (6열 grid 기반)
        const itemsPerFullRow = 3; // 1행에 최대 3개
        const fullRows = Math.floor(totalCount / itemsPerFullRow);
        const remainingItems = totalCount % itemsPerFullRow;

        // 마지막 행의 시작 인덱스
        const lastRowStartIndex = fullRows * itemsPerFullRow;

        // 마지막 행이 아니면 기본 span 2 (3개씩 배치)
        if (index < lastRowStartIndex) {
            return 2;
        }

        // 마지막 행 처리
        if (remainingItems === 0) {
            // 딱 떨어지면 기본 span 2 (3개 꽉 참)
            return 2;
        } else if (remainingItems === 1) {
            // 마지막 1개 → span 6 (큰 사이즈)
            return 6;
        } else if (remainingItems === 2) {
            // 마지막 2개 → span 3 (중간 사이즈)
            return 3;
        }

        // 기본값
        return 2;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Facility 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        const facility = this.getCurrentFacility();
        if (!facility) {
            return;
        }

        // 페이지 제목 업데이트
        this.updatePageTitle(facility);

        // 시설 기본 정보 매핑
        this.mapFacilityBasicInfo();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // Favicon 매핑
        this.mapFavicon();

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
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}