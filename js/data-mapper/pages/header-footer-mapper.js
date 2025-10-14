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

        const property = this.data.property;

        // Header 로고 텍스트 매핑 (data-logo-text 속성 사용)
        const logoText = this.safeSelect('[data-logo-text]');
        if (logoText && property.name) {
            logoText.textContent = property.name;
        }

        // Header 로고 이미지 매핑 (data-logo 속성 사용)
        const logoImage = this.safeSelect('[data-logo]');
        if (logoImage) {
            const logoUrl = ImageHelpers.extractLogoUrl(this.data);

            if (logoUrl) {
                logoImage.onerror = () => {
                    console.warn('⚠️ 헤더 로고 이미지 로드 실패');
                    ImageHelpers.applyPlaceholder(logoImage);
                };
                logoImage.src = logoUrl;
                logoImage.alt = property.name || '로고';
                logoImage.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(logoImage);
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

        // 예약 버튼에 gpension_id 매핑
        this.mapReservationButtons();
    }

    /**
     * 예약 버튼에 gpension_id 매핑
     */
    mapReservationButtons() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        // gpension_id 찾기 (여러 경로 시도)
        const gpensionId = this.data.property.gpension_id ||
                          this.data.property.gpensionId ||
                          this.data.gpension_id;

        if (!gpensionId) {
            return;
        }

        // 모든 예약 버튼에 gpension_id 설정
        const reservationButtons = document.querySelectorAll('[data-booking-engine]');
        reservationButtons.forEach(button => {
            button.setAttribute('data-gpension-id', gpensionId);
        });
    }

    /**
     * 메인 메뉴 아이템 클릭 핸들러 설정
     */
    mapMainMenuItems() {
        // Spaces 메뉴 - 첫 번째 객실로 이동
        const spacesMenu = document.querySelector('[data-room-link]');
        if (spacesMenu) {
            const rooms = this.safeGet(this.data, 'rooms');
            if (rooms && rooms.length > 0) {
                spacesMenu.onclick = () => {
                    window.location.href = `../pages/room.html?id=${rooms[0].id}`;
                };
            }
        }

        // Specials 메뉴 - 첫 번째 시설로 이동
        const specialsMenu = document.querySelector('[data-facility-link]');
        if (specialsMenu) {
            const facilities = this.safeGet(this.data, 'property.facilities');
            if (facilities && facilities.length > 0) {
                specialsMenu.onclick = () => {
                    window.location.href = `../pages/facility.html?id=${facilities[0].id}`;
                };
            }
        }
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

            // 새로운 메뉴 아이템들 생성
            const displayItems = maxItems ? items.slice(0, maxItems) : items;
            displayItems.forEach((item, index) => {
                const menuItem = document.createElement('div');
                menuItem.className = `sub-menu-item ${classPrefix}${index + 1}`;
                menuItem.textContent = item.name || `${defaultNamePrefix}${index + 1}`;

                // 클릭 이벤트 추가
                menuItem.addEventListener('click', () => {
                    if (customClickHandler) {
                        customClickHandler(item.id);
                    } else {
                        window.location.href = `../pages/${urlTemplate}?id=${item.id}`;
                    }
                });

                desktopMenu.appendChild(menuItem);
            });
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
                        window.location.href = `../pages/${urlTemplate}?id=${item.id}`;
                    }
                });

                mobileContainer.appendChild(menuButton);
            });
        }
    }

    /**
     * 객실 메뉴 아이템 동적 생성
     */
    mapRoomMenuItems() {
        const roomData = this.safeGet(this.data, 'rooms');

        // 객실 전용 클릭 핸들러 (propertyDataMapper.navigateToRoom 지원)
        const roomClickHandler = (roomId) => {
            if (window.propertyDataMapper?.navigateToRoom) {
                window.propertyDataMapper.navigateToRoom(roomId);
            } else {
                window.location.href = `../pages/room.html?id=${roomId}`;
            }
        };

        this._createMenuItems(
            roomData,
            'sub-spaces-',
            'mobile-spaces-items',
            'room.html',
            '객실',
            null, // 최대 개수 제한 없음
            roomClickHandler
        );
    }

    /**
     * 시설 메뉴 아이템 동적 생성
     */
    mapFacilityMenuItems() {
        const facilityData = this.safeGet(this.data, 'property.facilities');

        this._createMenuItems(
            facilityData,
            'sub-specials-',
            'mobile-specials-items',
            'facility.html',
            '시설',
            3, // 최대 3개까지만 표시
            null // customClickHandler 없음
        );
    }

    // ============================================================================
    // 🦶 FOOTER MAPPINGS
    // ============================================================================

    /**
     * Footer 로고 매핑
     */
    mapFooterLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // Footer 로고 이미지 매핑 (data-footer-logo 속성 사용)
        const footerLogoImage = this.safeSelect('[data-footer-logo]');
        if (footerLogoImage) {
            const logoUrl = ImageHelpers.extractLogoUrl(this.data);

            if (logoUrl) {
                footerLogoImage.onerror = () => {
                    console.warn('⚠️ 푸터 로고 이미지 로드 실패');
                    ImageHelpers.applyPlaceholder(footerLogoImage);
                };
                footerLogoImage.src = logoUrl;
                footerLogoImage.alt = property.name || '로고';
                footerLogoImage.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(footerLogoImage);
            }
        }

        // Footer 로고 텍스트 매핑
        const footerLogoText = this.safeSelect('[data-footer-logo-text]');
        if (footerLogoText && property.name) {
            footerLogoText.textContent = property.name;
        }
    }

    /**
     * Footer 사업자 정보 매핑
     */
    mapFooterInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const businessInfo = this.data.property?.businessInfo;

        if (!businessInfo) {
            return;
        }

        // 전화번호 매핑
        const footerPhone = this.safeSelect('[data-footer-phone]');
        if (footerPhone && businessInfo.businessPhone) {
            footerPhone.textContent = `숙소 전화번호 : ${businessInfo.businessPhone}`;
        }

        // 주소 매핑
        const addressElement = this.safeSelect('[data-footer-address]');
        if (addressElement && businessInfo.businessAddress) {
            addressElement.textContent = `주소 : ${businessInfo.businessAddress}`;
        }

        // 사업자번호 매핑
        const businessNumberElement = this.safeSelect('[data-footer-business-number]');
        if (businessNumberElement && businessInfo.businessNumber) {
            businessNumberElement.textContent = `사업자번호 : ${businessInfo.businessNumber}`;
        }

        // 통신판매업신고번호
        const ecommerceElement = this.safeSelect('[data-footer-ecommerce]');
        if (ecommerceElement && businessInfo.eCommerceRegistrationNumber) {
            ecommerceElement.textContent = `통신판매업신고번호 : ${businessInfo.eCommerceRegistrationNumber}`;
        }

        // 저작권 정보 매핑
        const copyrightElement = this.safeSelect('[data-footer-copyright]');
        if (copyrightElement && businessInfo.businessName) {
            const currentYear = new Date().getFullYear();
            copyrightElement.textContent = `© ${currentYear} ${businessInfo.businessName}. All rights reserved.`;
        }
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

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
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
