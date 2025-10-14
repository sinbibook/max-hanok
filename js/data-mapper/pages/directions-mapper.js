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
     * Hero 섹션 매핑 (배경 이미지, 제목) - customFields 활용
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        // directions 페이지 전용 hero 섹션 데이터 가져오기
        const directionsHeroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        // Hero 제목 매핑 (customFields에서 우선, 없으면 기본값)
        const heroTitleElement = this.safeSelect('[data-directions-hero-title]');
        if (heroTitleElement) {
            if (directionsHeroData?.title) {
                heroTitleElement.textContent = directionsHeroData.title;
            } else if (this.data.property?.name) {
                // fallback: 펜션명 + 오시는길
                heroTitleElement.textContent = `${this.data.property.name} 오시는길`;
            }
        }

        // Hero 배경 이미지 매핑 (JSON에서 동적으로)
        this.mapHeroImage();
    }

    /**
     * Hero 이미지 동적 매핑 (directions 전용 customFields 활용)
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        // directions 페이지 전용 hero 섹션 데이터 가져오기
        const directionsHeroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        const heroImageElement = this.safeSelect('[data-directions-hero-image]');

        if (!heroImageElement) return;

        const images = directionsHeroData?.images;

        // 이미지가 없으면 빈 이미지 표시
        if (!images || images.length === 0) {
            ImageHelpers.applyPlaceholder(heroImageElement);
            return;
        }

        // sortOrder로 정렬해서 첫 번째 이미지 사용
        const sortedImages = images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        const firstImage = sortedImages[0];

        if (firstImage?.url) {
            heroImageElement.src = firstImage.url;
            heroImageElement.alt = firstImage.description || `${this.data.property?.name} 오시는길`;
            heroImageElement.loading = 'eager';
            heroImageElement.classList.remove('empty-image-placeholder');
        } else {
            ImageHelpers.applyPlaceholder(heroImageElement);
        }
    }

    /**
     * 주소 정보 섹션 매핑
     */
    mapAddressSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // 섹션 제목 매핑
        const sectionTitleElement = this.safeSelect('[data-directions-section-title]');
        if (sectionTitleElement && property.name) {
            sectionTitleElement.textContent = `${property.name} 오시는길`;
        }

        // 도로명 주소 매핑
        const roadAddressElement = this.safeSelect('[data-directions-road-address]');
        if (roadAddressElement && property.address) {
            roadAddressElement.textContent = property.address;
        }

        // 지번 주소 매핑 (동일하게 address 사용)
        const lotAddressElement = this.safeSelect('[data-directions-lot-address]');
        if (lotAddressElement && property.address) {
            lotAddressElement.textContent = property.address;
        }

        // 안내사항 매핑
        const noticeElement = this.safeSelect('[data-directions-notice]');
        if (noticeElement && property.name) {
            noticeElement.textContent = `네비게이션 검색 시 '${property.name}' 또는 주소를 이용해 주세요.`;
        }
    }

    /**
     * 지도 섹션 매핑 (지도 제목, 펜션명, 주소, 버튼 기능)
     */
    mapMapSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // 지도 제목 매핑
        const mapTitleElement = this.safeSelect('[data-directions-map-title]');
        if (mapTitleElement) {
            mapTitleElement.textContent = '위치 안내';
        }

        // 펜션명 매핑
        const propertyNameElement = this.safeSelect('[data-directions-property-name]');
        if (propertyNameElement && property.name) {
            propertyNameElement.textContent = property.name;
        }

        // 지도 영역 주소 매핑
        const addressElement = this.safeSelect('[data-directions-address]');
        if (addressElement && property.address) {
            addressElement.textContent = property.address;
        }

        // 카카오맵 버튼 기능 설정
        this.setupKakaoMapButton();

        // Google 지도 버튼 기능 설정
        this.setupGoogleMapButton();
    }

    /**
     * 카카오맵 버튼 클릭 이벤트 설정
     */
    setupKakaoMapButton() {
        const property = this.data.property;
        const kakaoButton = this.safeSelect('.kakao-button');

        if (kakaoButton && property.latitude && property.longitude && property.name) {
            // 기존 이벤트 리스너 제거
            kakaoButton.onclick = null;

            // 새로운 이벤트 리스너 추가
            kakaoButton.addEventListener('click', () => {
                const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(property.name)},${property.latitude},${property.longitude}`;
                window.open(kakaoMapUrl, '_blank');
            });
        }
    }

    /**
     * Google 지도 버튼 클릭 이벤트 설정
     */
    setupGoogleMapButton() {
        const property = this.data.property;
        const googleButton = this.safeSelect('.google-button');

        if (googleButton && property.latitude && property.longitude) {
            // 기존 이벤트 리스너 제거
            googleButton.onclick = null;

            // 새로운 이벤트 리스너 추가
            googleButton.addEventListener('click', () => {
                const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
                window.open(googleMapUrl, '_blank');
            });
        }
    }

    /**
     * 레거시 CSS 선택자 기반 매핑 (기존 mapDirectionsPage 호환성)
     */
    mapLegacySelectors() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // 기존 CSS 선택자 기반 매핑들 (data 속성이 없는 요소들을 위해)

        // 도로명 주소 매핑 (첫 번째 주소 항목)
        const roadAddressElement = this.safeSelect('.address-item:first-of-type .address-details p:last-child');
        if (roadAddressElement && property.address) {
            roadAddressElement.textContent = property.address;
        }

        // 지번 주소 매핑 (마지막 주소 항목)
        const lotAddressElement = this.safeSelect('.address-item:last-of-type .address-details p:last-child');
        if (lotAddressElement && property.address) {
            lotAddressElement.textContent = property.address;
        }

        // 지도 콘텐츠 영역 주소 매핑
        const mapAddressElement = this.safeSelect('.map-content .address');
        if (mapAddressElement && property.address) {
            mapAddressElement.textContent = property.address;
        }

        // 지도 콘텐츠 영역 펜션명 매핑
        const mapPropertyNameElement = this.safeSelect('.map-content h4');
        if (mapPropertyNameElement && property.name) {
            mapPropertyNameElement.textContent = property.name;
        }

        // 섹션 제목 매핑 (CSS 선택자 기반)
        const legacySectionTitleElement = this.safeSelect('.section-title');
        if (legacySectionTitleElement && property.name) {
            legacySectionTitleElement.textContent = `${property.name} 오시는길`;
        }

        // 안내 문구 매핑 (CSS 선택자 기반)
        const legacyNoticeElement = this.safeSelect('.info-notice p');
        if (legacyNoticeElement && property.name) {
            const originalText = legacyNoticeElement.textContent;
            const updatedText = originalText.replace('제주 포레스트', property.name);
            legacyNoticeElement.textContent = updatedText;
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
            console.error('Cannot map directions page: data not loaded');
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapAddressSection();
        this.mapMapSection();
        this.mapLegacySelectors();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const pageSEO = property?.name ? { title: `오시는길 - ${property.name}` } : null;
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * Directions 페이지 텍스트만 업데이트
     */
    mapDirectionsText() {
        if (!this.isDataLoaded) return;

        // 텍스트 관련 섹션들만 업데이트
        this.mapHeroSection();
        this.mapLocationInfo();
        this.mapDirectionsInfo();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}