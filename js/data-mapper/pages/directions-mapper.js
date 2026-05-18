/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    // Kakao Map 설정 상수
    static KAKAO_MAP_ZOOM_LEVEL = 5;
    static SDK_WAIT_INTERVAL = 100; // ms

    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (슬라이더 이미지 생성 - index와 동일)
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
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

        // Hero 텍스트 매핑 (property name)
        this.mapHeroText();
    }

    /**
     * Hero 텍스트 매핑 (property name, brand title)
     */
    mapHeroText() {
        if (!this.isDataLoaded || !this.data.property) return;

        // Property 영문명 매핑 (brand-title)
        const brandTitle = this.safeSelect('[data-property-name-en]');
        if (brandTitle) {
            brandTitle.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * 위치 안내 원형 이미지 매핑 (hero 이미지 인덱스 1 사용)
     */
    mapLocationImage() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        if (!heroData) return;

        const images = heroData.images
            ? heroData.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        const locationImageEl = this.safeSelect('[data-directions-location-image]');
        if (locationImageEl) {
            if (images.length > 1) {
                // 인덱스 1번 이미지 사용
                locationImageEl.src = images[1].url;
                locationImageEl.classList.remove('empty-image-placeholder');
            } else {
                // 이미지가 부족하면 placeholder
                locationImageEl.src = ImageHelpers.EMPTY_IMAGE_SVG;
                locationImageEl.classList.add('empty-image-placeholder');
                locationImageEl.alt = 'No Image Available';
            }
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
        if (sectionTitleElement) {
            sectionTitleElement.textContent = `${this.getPropertyName()} 오시는길`;
        }

        // 섹션 설명 매핑
        const descriptionElement = this.safeSelect('[data-directions-description]');
        if (descriptionElement) {
            descriptionElement.textContent = `${this.getPropertyName()} 오시는 길 입니다.`;
        }

        // 도로명 주소 매핑
        const roadAddressElement = this.safeSelect('[data-directions-address]');
        if (roadAddressElement && property.address) {
            roadAddressElement.textContent = property.address;
        }

        // 지번 주소 매핑 - 향후 요구사항 변경 시 활성화 예정
        // const lotAddressElement = this.safeSelect('[data-directions-lot-address]');
        // if (lotAddressElement && property.address) {
        //     lotAddressElement.textContent = property.address;
        // }

        // 안내사항 매핑
        const noticeElement = this.safeSelect('[data-directions-notice]');
        if (noticeElement) {
            noticeElement.textContent = `네비게이션 검색 시 '${this.getPropertyName()}' 또는 주소를 이용해 주세요.`;
        }
    }

    /**
     * Notice 섹션 매핑 (customFields 기반)
     */
    mapNoticeSection() {
        if (!this.isDataLoaded) return;

        // directions 페이지 전용 섹션 데이터 가져오기
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        const noticeSection = this.safeSelect('[data-directions-notice-section]');
        const noticeWrap = this.safeSelect('.notice-wrap');
        const notice = directionsData?.notice;

        // notice 데이터가 없거나 title/description이 모두 비어있으면 섹션 숨김
        const hasTitle = notice?.title && notice.title.trim() !== '';
        const hasDescription = notice?.description && notice.description.trim() !== '';

        if (!notice || (!hasTitle && !hasDescription)) {
            if (noticeSection) noticeSection.style.display = 'none';
            // notice-wrap에서 has-notice 클래스 제거
            if (noticeWrap) noticeWrap.classList.remove('has-notice');
            return;
        }

        // notice 데이터가 있으면 섹션 표시
        if (noticeSection) noticeSection.style.display = '';

        // notice-wrap에 has-notice 클래스 추가 (border-top 표시)
        if (noticeWrap) noticeWrap.classList.add('has-notice');

        // Notice 제목 매핑
        const noticeTitle = this.safeSelect('[data-customfield-directions-notice-title]');
        if (noticeTitle) {
            noticeTitle.textContent = hasTitle ? notice.title : '';
        }

        // Notice 설명 매핑
        const noticeDescription = this.safeSelect('[data-customfield-directions-notice-description]');
        if (noticeDescription) {
            noticeDescription.innerHTML = ''; // 기존 콘텐츠 초기화 및 XSS 방지
            if (hasDescription) {
                // \n을 <br>로 변환하여 안전하게 줄바꿈 처리
                const lines = notice.description.split('\n');
                lines.forEach((line, index) => {
                    noticeDescription.appendChild(document.createTextNode(line));
                    if (index < lines.length - 1) {
                        noticeDescription.appendChild(document.createElement('br'));
                    }
                });
            }
        }
    }

    /**
     * 지도 섹션 매핑 (지도 제목)
     */
    mapMapSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        // 지도 제목 매핑
        const mapTitleElement = this.safeSelect('[data-directions-map-title]');
        if (mapTitleElement) {
            mapTitleElement.textContent = '위치 안내';
        }
    }

    /**
     * 카카오맵 초기화 및 표시
     */
    initKakaoMap() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        const property = this.data.property;
        const mapContainer = document.getElementById('kakao-map');

        if (!mapContainer) {
            return;
        }

        // 맵 좌표 데이터가 없을 때 플레이스홀더 표시
        if (!property.latitude || !property.longitude) {
            mapContainer.style.minHeight = '400px';
            mapContainer.style.backgroundColor = '#f0f0f0';
            mapContainer.style.borderRadius = '8px';
            mapContainer.style.display = 'flex';
            mapContainer.style.alignItems = 'center';
            mapContainer.style.justifyContent = 'center';
            mapContainer.innerHTML = `
                <div style="text-align: center; color: #999;">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 10px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                        <circle cx="11" cy="8" r="1"></circle>
                    </svg>
                    <p style="margin: 10px 0; font-size: 14px;">지도 영역</p>
                    <p style="font-size: 12px;">위치 정보를 추가해주세요</p>
                </div>
            `;
            return;
        }

        // 지도 생성 함수
        const createMap = () => {
            try {
                // 검색 쿼리 및 URL 생성 (한 번만)
                const searchQuery = property.address || this.getPropertyName() || '선택한 위치';
                const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent(searchQuery)}`;
                const openKakaoMap = () => window.open(kakaoMapUrl, '_blank');

                // 지도 중심 좌표
                const mapCenter = new kakao.maps.LatLng(property.latitude, property.longitude);

                // 지도 옵션
                const mapOptions = {
                    center: mapCenter,
                    level: DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL,
                    draggable: false,
                    scrollwheel: false,
                    disableDoubleClick: true,
                    disableDoubleClickZoom: true
                };

                // 지도 생성
                const map = new kakao.maps.Map(mapContainer, mapOptions);
                map.setZoomable(false);

                // 마커 생성 및 클릭 이벤트
                const marker = new kakao.maps.Marker({
                    position: mapCenter,
                    map: map
                });
                kakao.maps.event.addListener(marker, 'click', openKakaoMap);

                // 인포윈도우 콘텐츠 DOM 생성 및 이벤트 핸들러 연결
                const infowindowContent = document.createElement('div');
                infowindowContent.style.cssText = 'padding:5px; font-size:14px; cursor:pointer;';
                infowindowContent.innerHTML = `${this.getPropertyName()}<br/><small style="color:#666;">클릭하면 카카오맵으로 이동</small>`;
                infowindowContent.addEventListener('click', openKakaoMap);

                const infowindow = new kakao.maps.InfoWindow({
                    content: infowindowContent
                });
                infowindow.open(map, marker);
            } catch (error) {
                console.error('Failed to create Kakao Map:', error);
            }
        };

        // SDK 로드 확인 및 지도 생성
        const checkSdkAndLoad = (retryCount = 0) => {
            const MAX_RETRIES = 20; // 20 * 100ms = 2초
            if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
                // kakao.maps.load() 공식 API 사용
                window.kakao.maps.load(createMap);
            } else if (retryCount < MAX_RETRIES) {
                // SDK가 아직 로드되지 않았으면 대기
                setTimeout(() => checkSdkAndLoad(retryCount + 1), DirectionsMapper.SDK_WAIT_INTERVAL);
            } else {
                console.error('Failed to load Kakao Map SDK after multiple retries.');
            }
        };

        checkSdkAndLoad();
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

        // 지번 주소 매핑 - 향후 요구사항 변경 시 활성화 예정
        // const lotAddressElement = this.safeSelect('.address-item:last-of-type .address-details p:last-child');
        // if (lotAddressElement && property.address) {
        //     lotAddressElement.textContent = property.address;
        // }

        // 지도 콘텐츠 영역 주소 매핑
        const mapAddressElement = this.safeSelect('.map-content .address');
        if (mapAddressElement && property.address) {
            mapAddressElement.textContent = property.address;
        }

        // 지도 콘텐츠 영역 펜션명 매핑
        const mapPropertyNameElement = this.safeSelect('.map-content h4');
        if (mapPropertyNameElement) {
            mapPropertyNameElement.textContent = this.getPropertyName();
        }

        // 섹션 제목 매핑 (CSS 선택자 기반)
        const legacySectionTitleElement = this.safeSelect('.section-title');
        if (legacySectionTitleElement) {
            legacySectionTitleElement.textContent = `${this.getPropertyName()} 오시는길`;
        }

        // 안내 문구 매핑 (CSS 선택자 기반)
        const legacyNoticeElement = this.safeSelect('.info-notice p');
        if (legacyNoticeElement) {
            const originalText = legacyNoticeElement.textContent;
            const updatedText = originalText.replace('제주 포레스트', this.getPropertyName());
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
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapLocationImage(); // 위치 안내 원형 이미지 매핑
        this.mapAddressSection();
        this.mapNoticeSection(); // Notice 섹션 매핑 추가
        this.mapMapSection();
        this.initKakaoMap(); // 카카오맵 초기화 및 표시
        this.mapLegacySelectors();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        const propertyName = this.getPropertyName();
        const pageSEO = {
            title: `오시는길 - ${propertyName}`,
            description: directionsData?.description || this.data.property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 클로징 섹션 매핑
        this.mapClosingSection();
    }

    /**
     * 클로징 섹션 매핑 - property_exterior 이미지 및 숙소명 사용 (main과 동일한 방식, 다른 이미지)
     */
    mapClosingSection() {
        if (!this.isDataLoaded) return;

        // property_exterior 이미지 가져오기 (isSelected: true만)
        const allImages = this.safeGet(this.data, "homepage.customFields.property.images") || [];
        const exteriorImages = allImages
            .filter(img => img.category === "property_exterior" && img.isSelected)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 페이지 인덱스 1 (directions) - main(0)과 다른 이미지 순환 선택
        const pageIndex = 1;
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

        // 클로징 섹션 숙소명 매핑
        const propertyNameEn = this.safeSelect('.closing-property-name-en[data-property-name-en]');
        if (propertyNameEn && this.data.property) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
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
