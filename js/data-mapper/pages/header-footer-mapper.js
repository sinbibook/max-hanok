/**
 * Header & Footer Data Mapper
 * header.html, footer.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 header/footer 공통 기능 제공
 */
class HeaderFooterMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 HEADER MAPPINGS
    // ============================================================================

    /**
     * Favicon 매핑 (homepage.images.logo 데이터 사용)
     */
    mapFavicon() {
        if (!this.isDataLoaded) return;

        // ImageHelpers가 로드되었는지 확인
        if (typeof ImageHelpers === 'undefined') {
            console.warn('⚠️ ImageHelpers not loaded yet, skipping favicon mapping');
            return;
        }

        const logoUrl = ImageHelpers.extractLogoUrl(this.data);

        if (logoUrl) {
            // 기존 favicon 링크 찾기
            let faviconLink = document.querySelector('link[rel="icon"]');

            // 없으면 새로 생성
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }

            // favicon URL 설정
            faviconLink.href = logoUrl;
        }
    }

    /**
     * Header 로고 매핑 (텍스트 및 이미지)
     */
    mapHeaderLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        // customFields 헬퍼 함수 사용
        const propertyName = this.getPropertyName();

        // Header 로고 텍스트 매핑 (data-logo-text 속성 사용)
        const logoText = this.safeSelect('[data-logo-text]');
        if (logoText && propertyName) {
            logoText.textContent = propertyName;
        }

        // ImageHelpers가 로드되었는지 확인
        if (typeof ImageHelpers === 'undefined') {
            console.warn('⚠️ ImageHelpers not loaded yet, skipping logo image mapping');
            return;
        }

        // Header 로고 이미지 매핑 - JSON URL로 교체
        const logoImage = this.safeSelect('[data-logo]');
        if (logoImage) {
            const logoUrl = ImageHelpers.extractLogoUrl(this.data);

            if (logoUrl) {
                logoImage.src = logoUrl;
                logoImage.alt = propertyName || '로고';
                logoImage.classList.remove('empty-image-placeholder');
            } else {
                logoImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                logoImage.alt = '로고 없음';
                logoImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * Header 네비게이션 메뉴 동적 생성 (객실, 시설 메뉴 등)
     */
    mapHeaderNavigation() {
        if (!this.isDataLoaded) return;

        // 메인 메뉴 아이템 클릭 핸들러 설정
        this.mapMainMenuItems();

        // 객실 메뉴 동적 생성
        this.mapRoomMenuItems();

        // 시설 메뉴 동적 생성
        this.mapFacilityMenuItems();

        // 예약 버튼에 realtimeBookingId 매핑 및 클릭 이벤트 설정
        this.mapReservationButtons();

        // YBS 버튼에 ybsId 매핑 및 클릭 이벤트 설정
        this.mapYbsButtons();
    }

    /**
     * 예약 버튼에 realtimeBookingId 매핑 및 클릭 이벤트 설정
     * Admin에서 전체 URL을 입력받아 그대로 사용
     */
    mapReservationButtons() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        // 전체 예약 URL 가져오기 (Admin에서 전체 링크 입력)
        const realtimeBookingUrl = this.data.property.realtimeBookingId;

        if (!realtimeBookingUrl) {
            return;
        }

        // 모든 예약 버튼에 클릭 이벤트 설정
        const reservationButtons = document.querySelectorAll('[data-booking-engine]');
        reservationButtons.forEach(button => {
            button.setAttribute('data-realtime-booking-url', realtimeBookingUrl);
            button.addEventListener('click', () => {
                window.open(realtimeBookingUrl, '_blank');
            });
        });

        // 모바일 플로팅 예약 버튼에도 같은 링크 설정
        const floatingBookBtn = document.querySelector('.mobile-floating-book-btn');
        if (floatingBookBtn) {
            floatingBookBtn.setAttribute('data-realtime-booking-url', realtimeBookingUrl);
            floatingBookBtn.addEventListener('click', () => {
                window.open(realtimeBookingUrl, '_blank');
            });
        }
    }

    /**
     * YBS 버튼에 ybsId 매핑 및 클릭 이벤트 설정
     */
    mapYbsButtons() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        // YBS URL 상수
        const YBS_URL = 'https://rev.yapen.co.kr/external?ypIdx=';

        // ybsId 찾기
        const ybsId = this.data.property.ybsId;

        // 모든 YBS 버튼 찾기
        const ybsButtons = document.querySelectorAll('[data-ybs-button]');

        if (!ybsId) {
            // ybsId가 없으면 모든 YBS 버튼 숨김
            ybsButtons.forEach(button => {
                button.style.display = 'none';
            });
            return;
        }

        // ybsId가 있으면 버튼 표시 및 클릭 이벤트 설정
        ybsButtons.forEach(button => {
            button.style.display = '';
            button.setAttribute('data-ybs-id', ybsId);
            button.addEventListener('click', () => {
                window.open(`${YBS_URL}${ybsId}`, '_blank');
            });
        });
    }

    /**
     * 메인 메뉴 아이템 클릭 핸들러 설정
     * 비활성화: 메인 메뉴는 호버만, 서브메뉴에만 클릭 이벤트
     */
    mapMainMenuItems() {
        // 메인 메뉴 클릭 이벤트 제거됨
        // 호버로 서브메뉴만 표시, 서브메뉴 아이템만 클릭 가능
    }

    /**
     * 헬퍼 메서드: 메뉴 아이템들을 동적으로 생성
     * @param {Array} items - 메뉴 아이템 데이터 배열
     * @param {string} classPrefix - CSS 클래스 접두사 (sub-spaces-, sub-specials- 등)
     * @param {string} mobileContainerId - 모바일 메뉴 컨테이너 ID
     * @param {string} urlTemplate - URL 템플릿 (room.html, facility.html 등)
     * @param {string} defaultNamePrefix - 기본 이름 접두사 (객실, 시설 등)
     * @param {number} maxItems - 최대 표시할 아이템 수 (기본: 무제한)
     * @param {Function} customClickHandler - 커스텀 클릭 핸들러 (선택사항)
     */
    _createMenuItems(items, classPrefix, mobileContainerId, urlTemplate, defaultNamePrefix, maxItems = null, customClickHandler = null) {
        if (!items || !Array.isArray(items)) return;

        // Desktop 서브메뉴 업데이트
        const desktopMenu = document.querySelector('.sub-menus');
        if (desktopMenu) {
            // 기존 메뉴 아이템들 제거
            const existingItems = desktopMenu.querySelectorAll(`[class*="${classPrefix}"]`);
            existingItems.forEach(item => item.remove());

            // 메뉴 카테고리별 left 위치 정의
            const leftPositions = {
                'sub-about-': 15,
                'sub-spaces-': 121,
                'sub-specials-': 228,
                'sub-reservation-': 332
            };

            // 현재 카테고리의 left 위치 가져오기
            const leftPosition = leftPositions[classPrefix] || 0;

            // 새로운 메뉴 아이템들 생성
            const displayItems = maxItems ? items.slice(0, maxItems) : items;
            displayItems.forEach((item, index) => {
                const menuItem = document.createElement('div');
                menuItem.className = `sub-menu-item ${classPrefix}${index + 1}`;
                menuItem.textContent = item.name || `${defaultNamePrefix}${index + 1}`;

                // 동적으로 위치 계산 (첫 번째: 29px, 그 다음부터 34px씩 증가)
                const topPosition = 29 + (index * 34);
                menuItem.style.cssText = `left: ${leftPosition}px; top: ${topPosition}px;`;

                // 클릭 이벤트 추가
                menuItem.addEventListener('click', () => {
                    if (customClickHandler) {
                        customClickHandler(item.id);
                    } else {
                        window.location.href = `${urlTemplate}?id=${item.id}`;
                    }
                });

                desktopMenu.appendChild(menuItem);
            });

            // 서브메뉴 컨테이너 높이 동적 조정
            // 가장 많은 메뉴를 가진 카테고리 기준으로 높이 계산
            const allSubMenuItems = desktopMenu.querySelectorAll('.sub-menu-item');
            if (allSubMenuItems.length > 0) {
                // 각 메뉴 아이템 중 가장 아래에 있는 항목의 bottom 위치 계산
                let maxBottom = 0;
                allSubMenuItems.forEach(item => {
                    // inline style과 CSS로 정의된 top 값 모두 읽기
                    const computedTop = window.getComputedStyle(item).top;
                    const top = parseInt(computedTop) || parseInt(item.style.top) || 0;
                    const itemHeight = 34; // 각 메뉴 아이템 높이 (padding 포함)
                    const bottom = top + itemHeight;
                    if (bottom > maxBottom) {
                        maxBottom = bottom;
                    }
                });

                // 여유 공간 추가 (상단 9px + 하단 여유)
                const containerHeight = maxBottom + 10;
                desktopMenu.style.height = `${containerHeight}px`;
            }
        }

        // Mobile 서브메뉴 업데이트
        const mobileContainer = document.getElementById(mobileContainerId);
        if (mobileContainer) {
            mobileContainer.innerHTML = '';

            items.forEach((item, index) => {
                const menuButton = document.createElement('button');
                menuButton.className = 'mobile-sub-item';
                menuButton.textContent = item.name || `${defaultNamePrefix}${index + 1}`;

                // 클릭 이벤트 추가
                menuButton.addEventListener('click', () => {
                    if (customClickHandler) {
                        customClickHandler(item.id);
                    } else {
                        window.location.href = `${urlTemplate}?id=${item.id}`;
                    }
                });

                mobileContainer.appendChild(menuButton);
            });
        }
    }

    /**
     * 객실 메뉴 아이템 동적 생성
     * 모든 객실을 메뉴에 표시
     */
    mapRoomMenuItems() {
        const roomData = this.safeGet(this.data, 'rooms');

        if (!roomData || !Array.isArray(roomData) || roomData.length === 0) {
            return;
        }

        // Desktop 메뉴 업데이트 (모든 객실)
        const spacesMenu = document.querySelector('[data-menu="space"]');

        if (spacesMenu) {
            const desktopSubmenu = spacesMenu.closest('.menu-item-wrapper')?.querySelector('.submenu');

            if (desktopSubmenu) {
                desktopSubmenu.innerHTML = '';

                roomData.forEach(room => {
                    // customFields 헬퍼 함수 사용
                    const roomName = this.getRoomName(room);

                    const button = document.createElement('button');
                    button.className = 'submenu-item';
                    button.textContent = roomName;
                    button.onclick = () => {
                        window.location.href = `room.html?id=${encodeURIComponent(room.id)}`;
                    };
                    desktopSubmenu.appendChild(button);
                });
            }
        }

        // Mobile 메뉴 업데이트 (모든 객실)
        const mobileContainer = document.getElementById('mobile-spaces-items');

        if (mobileContainer) {
            mobileContainer.innerHTML = '';

            roomData.forEach(room => {
                // customFields 헬퍼 함수 사용
                const roomName = this.getRoomName(room);

                const button = document.createElement('button');
                button.className = 'mobile-sub-item';
                button.textContent = roomName;
                button.onclick = () => {
                    window.location.href = `room.html?id=${encodeURIComponent(room.id)}`;
                };
                mobileContainer.appendChild(button);
            });
        }
    }

    /**
     * 시설 메뉴 아이템 동적 생성
     */
    mapFacilityMenuItems() {
        const facilityData = this.safeGet(this.data, 'property.facilities');

        if (!facilityData || !Array.isArray(facilityData)) {
            return;
        }

        // displayOrder로 정렬
        const sortedFacilities = [...facilityData].sort((a, b) => a.displayOrder - b.displayOrder);

        // Desktop 메뉴 업데이트
        const specialsMenu = document.querySelector('[data-menu="specials"]');

        if (specialsMenu) {
            const desktopSubmenu = specialsMenu.closest('.menu-item-wrapper')?.querySelector('.submenu');

            if (desktopSubmenu) {
                desktopSubmenu.innerHTML = '';

                sortedFacilities.forEach(facility => {
                    const button = document.createElement('button');
                    button.className = 'submenu-item';
                    button.textContent = facility.name;
                    button.onclick = () => {
                        window.location.href = `facility.html?id=${facility.id}`;
                    };
                    desktopSubmenu.appendChild(button);
                });
            }
        }

        // Mobile 메뉴 업데이트
        const mobileContainer = document.getElementById('mobile-specials-items');

        if (mobileContainer) {
            mobileContainer.innerHTML = '';

            sortedFacilities.forEach(facility => {
                const button = document.createElement('button');
                button.className = 'mobile-sub-item';
                button.textContent = facility.name;
                button.onclick = () => {
                    window.location.href = `facility.html?id=${facility.id}`;
                };
                mobileContainer.appendChild(button);
            });
        }
    }

    // ============================================================================
    // 🦶 FOOTER MAPPINGS
    // ============================================================================

    /**
     * Footer 로고 매핑
     */
    mapFooterLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        // customFields 헬퍼 함수 사용
        const propertyName = this.getPropertyName();

        // ImageHelpers가 로드되었는지 확인
        if (typeof ImageHelpers === 'undefined') {
            console.warn('⚠️ ImageHelpers not loaded yet, skipping footer logo image mapping');

            // 텍스트는 그대로 매핑
            const footerLogoText = this.safeSelect('[data-footer-logo-text]');
            if (footerLogoText && propertyName) {
                footerLogoText.textContent = propertyName;
            }
            return;
        }

        // Footer 로고 이미지 매핑 - JSON URL로 교체
        const footerLogoImage = this.safeSelect('[data-footer-logo]');
        if (footerLogoImage) {
            const logoUrl = ImageHelpers.extractLogoUrl(this.data);

            if (logoUrl) {
                footerLogoImage.src = logoUrl;
                footerLogoImage.alt = propertyName || '로고';
                footerLogoImage.classList.remove('empty-image-placeholder');
            } else {
                footerLogoImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                footerLogoImage.alt = '로고 없음';
                footerLogoImage.classList.add('empty-image-placeholder');
            }
        }

        // Footer 로고 텍스트 매핑
        const footerLogoText = this.safeSelect('[data-footer-logo-text]');
        if (footerLogoText && propertyName) {
            footerLogoText.textContent = propertyName;
        }
    }

    /**
     * Footer 사업자 정보 매핑
     */
    mapFooterInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const businessInfo = property.businessInfo;

        if (!businessInfo) {
            return;
        }

        // 전화번호 매핑
        const footerPhone = this.safeSelect('[data-footer-phone]');
        if (footerPhone && property.contactPhone) {
            footerPhone.textContent = property.contactPhone;
        }

        // 이메일 매핑
        const footerEmail = this.safeSelect('[data-footer-email]');
        if (footerEmail && property.contactEmail) {
            footerEmail.textContent = property.contactEmail;
        }

        // 대표자명 매핑
        const representativeNameElement = this.safeSelect('[data-footer-representative-name]');
        if (representativeNameElement && businessInfo.representativeName) {
            representativeNameElement.textContent = businessInfo.representativeName;
        }

        // 주소 매핑
        const addressElement = this.safeSelect('[data-footer-address]');
        if (addressElement && businessInfo.businessAddress) {
            addressElement.textContent = businessInfo.businessAddress;
        }

        // 사업자번호 매핑
        const businessNumberElement = this.safeSelect('[data-footer-business-number]');
        if (businessNumberElement && businessInfo.businessNumber) {
            businessNumberElement.textContent = businessInfo.businessNumber;
        }

        // 통신판매업신고번호
        const ecommerceElement = this.safeSelect('[data-footer-ecommerce]');
        if (ecommerceElement && businessInfo.eCommerceRegistrationNumber) {
            ecommerceElement.textContent = businessInfo.eCommerceRegistrationNumber;
        }

        // 저작권 정보 매핑 - 신비서 하드코딩
        const copyrightElement = this.safeSelect('[data-footer-copyright]');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            copyrightElement.innerHTML = `<a href="https://www.sinbibook.com/" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">© ${currentYear} 신비서. All rights reserved.</a>`;
        }
    }

    /**
     * Footer 소셜 링크 매핑
     * socialLinks가 빈 객체면 전체 섹션 숨김
     * 값이 있는 링크만 표시
     */
    mapSocialLinks() {
        if (!this.isDataLoaded) return;

        const socialLinks = this.safeGet(this.data, 'homepage.socialLinks') || {};
        const socialSection = this.safeSelect('[data-social-links-section]');

        // socialLinks가 빈 객체인지 체크
        const hasSocialLinks = Object.keys(socialLinks).length > 0;

        if (!hasSocialLinks) {
            // 빈 객체면 전체 섹션 숨김
            if (socialSection) {
                socialSection.style.display = 'none';
            }
            return;
        }

        // 소셜 링크가 있으면 섹션 표시
        if (socialSection) {
            socialSection.style.display = 'block';
        }

        // 소셜 링크 설정 객체와 루프를 사용한 매핑
        const socialLinkConfig = [
            { type: 'instagram', selector: '[data-social-instagram]' },
            { type: 'facebook', selector: '[data-social-facebook]' },
            { type: 'blog', selector: '[data-social-blog]' }
        ];

        socialLinkConfig.forEach(({ type, selector }) => {
            const linkElement = this.safeSelect(selector);
            if (linkElement) {
                if (socialLinks[type]) {
                    linkElement.href = socialLinks[type];
                    linkElement.style.display = 'flex';
                } else {
                    linkElement.style.display = 'none';
                }
            }
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Header 전체 매핑 실행
     */
    async mapHeader() {
        if (!this.isDataLoaded) {
            console.error('Cannot map header: data not loaded');
            return;
        }

        // Favicon 매핑
        this.mapFavicon();

        // Header 매핑
        this.mapHeaderLogo();
        this.mapHeaderNavigation();
    }

    /**
     * Footer 전체 매핑 실행
     */
    async mapFooter() {
        if (!this.isDataLoaded) {
            console.error('Cannot map footer: data not loaded');
            return;
        }

        // Footer 매핑
        this.mapFooterLogo();
        this.mapFooterInfo();
        this.mapSocialLinks();
    }

    /**
     * Header & Footer 전체 매핑 실행
     */
    async mapHeaderFooter() {
        if (!this.isDataLoaded) {
            console.error('Cannot map header/footer: data not loaded');
            return;
        }

        // 동시에 실행
        await Promise.all([
            this.mapHeader(),
            this.mapFooter()
        ]);
    }

    /**
     * BaseMapper에서 요구하는 mapPage 메서드 구현
     */
    async mapPage() {
        return this.mapHeaderFooter();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderFooterMapper;
} else {
    window.HeaderFooterMapper = HeaderFooterMapper;
}

// 자동 초기화 (headerFooterLoaded 이벤트 기반)
if (typeof window !== 'undefined') {
    document.addEventListener('headerFooterLoaded', function() {
        const headerFooterMapper = new HeaderFooterMapper();
        headerFooterMapper.initialize();
    });
}