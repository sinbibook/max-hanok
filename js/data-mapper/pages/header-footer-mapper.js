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
     * Header 로고 텍스트 매핑 (펜션 이름)
     */
    mapHeaderLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // Header 로고 텍스트 매핑 (.logo-text)
        const logoText = this.safeSelect('.logo-text');
        if (logoText && property.name) {
            logoText.textContent = property.name;
        }

        // Property name 매핑 (data-property-name 속성)
        const propertyNameElements = this.safeSelectAll('[data-property-name]');
        propertyNameElements.forEach(element => {
            if (element && property.name) {
                element.textContent = property.name;
            }
        });

        // realtime_booking_id 매핑 (예약 링크)
        const realtimeBookingIdElements = this.safeSelectAll('[data-property-realtime-booking-id]');
        realtimeBookingIdElements.forEach(element => {
            if (element && property.realtimeBookingId && property.realtimeBookingId.trim() !== '') {
                const currentHref = element.getAttribute('href');
                if (currentHref && currentHref.includes('${realtimeBookingId}')) {
                    element.setAttribute('href', currentHref.replace('${realtimeBookingId}', property.realtimeBookingId));
                }
            } else {
                // realtimeBookingId가 없으면 링크를 숨겨 깨진 링크가 노출되지 않도록 합니다.
                element.style.display = 'none';
            }
        });
    }

    /**
     * SEO 메타태그 매핑
     */
    mapSEOMetaTags() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        const seoData = this.data.homepage.seo;
        if (!seoData) return;

        // 페이지 제목 매핑
        const titleElement = this.safeSelect('[data-homepage-seo-title]');
        if (titleElement && seoData.title) {
            titleElement.textContent = seoData.title;
        }

        // 메타 description 매핑
        const descriptionElement = this.safeSelect('[data-homepage-seo-description]');
        if (descriptionElement && seoData.description) {
            descriptionElement.setAttribute('content', seoData.description);
        }

        // 메타 keywords 매핑
        const keywordsElement = this.safeSelect('[data-homepage-seo-keywords]');
        if (keywordsElement && seoData.keywords) {
            keywordsElement.setAttribute('content', seoData.keywords);
        }
    }

    /**
     * Header 네비게이션 메뉴 동적 생성 (객실, 시설 메뉴 등)
     */
    mapHeaderNavigation() {
        if (!this.isDataLoaded) return;

        // 객실 메뉴 동적 생성
        this.mapRoomMenuItems();

        // 시설 메뉴 동적 생성
        this.mapFacilityMenuItems();
    }


    /**
     * 객실 메뉴 아이템 동적 생성
     */
    mapRoomMenuItems() {
        const roomData = this.safeGet(this.data, 'rooms');

        // Desktop Spaces 메뉴 (data-gnb="2")
        const spacesMenus = document.querySelectorAll('[data-gnb="2"] .subMenu');
        spacesMenus.forEach(submenu => {
            submenu.innerHTML = ''; // 기존 하드코딩된 내용 제거

            if (roomData && Array.isArray(roomData) && roomData.length > 0) {
                roomData.forEach((room, index) => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `room.html?id=${room.id}`;
                    a.textContent = room.name || `객실${index + 1}`;
                    li.appendChild(a);
                    submenu.appendChild(li);
                });
            }
        });

        // Mobile Spaces 메뉴
        const mobileSpacesContainer = document.getElementById('mobile-spaces-items');
        if (mobileSpacesContainer) {
            mobileSpacesContainer.innerHTML = ''; // 기존 내용 제거

            if (roomData && Array.isArray(roomData) && roomData.length > 0) {
                roomData.forEach((room, index) => {
                    const button = document.createElement('button');
                    button.className = 'mobile-sub-item';
                    button.type = 'button';
                    button.textContent = room.name || `객실${index + 1}`;
                    button.addEventListener('click', () => {
                        window.location.href = `room.html?id=${room.id}`;
                    });
                    mobileSpacesContainer.appendChild(button);
                });
            }
        }
    }

    /**
     * 시설 메뉴 아이템 동적 생성
     */
    mapFacilityMenuItems() {
        const facilityData = this.safeGet(this.data, 'property.facilities');

        // Desktop Specials 메뉴 (data-gnb="3")
        const specialsMenus = document.querySelectorAll('[data-gnb="3"] .subMenu');
        specialsMenus.forEach(submenu => {
            submenu.innerHTML = ''; // 기존 하드코딩된 내용 제거

            if (facilityData && Array.isArray(facilityData) && facilityData.length > 0) {
                // 최대 3개까지만 표시
                const displayFacilities = facilityData.slice(0, 3);
                displayFacilities.forEach((facility, index) => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `facility.html?id=${facility.id}`;
                    a.textContent = facility.name || `시설${index + 1}`;
                    li.appendChild(a);
                    submenu.appendChild(li);
                });
            }
        });

        // Mobile Specials 메뉴
        const mobileSpecialsContainer = document.getElementById('mobile-specials-items');
        if (mobileSpecialsContainer) {
            mobileSpecialsContainer.innerHTML = ''; // 기존 내용 제거

            if (facilityData && Array.isArray(facilityData) && facilityData.length > 0) {
                facilityData.forEach((facility, index) => {
                    const button = document.createElement('button');
                    button.className = 'mobile-sub-item';
                    button.type = 'button';
                    button.textContent = facility.name || `시설${index + 1}`;
                    button.addEventListener('click', () => {
                        window.location.href = `facility.html?id=${facility.id}`;
                    });
                    mobileSpecialsContainer.appendChild(button);
                });
            }
        }
    }

    // ============================================================================
    // 🦶 FOOTER MAPPINGS
    // ============================================================================

    /**
     * Footer 사업자 정보 매핑
     */
    mapFooterInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const businessInfo = this.data.property?.businessInfo;

        if (!businessInfo) {
            return;
        }

        // 펜션명 (로고 텍스트) - 숙소명 우선 사용
        const logoText = this.safeSelect('.footer-logo');
        if (logoText && this.data.property.name) {
            logoText.textContent = this.data.property.name;
        }

        // 전화번호 매핑 (기존 .footer-phone p는 비워둠)
        const footerPhone = this.safeSelect('.footer-phone p');
        if (footerPhone) {
            footerPhone.textContent = '';
        }

        // 대표자명 매핑
        const representativeElement = this.safeSelect('.footer-representative');
        if (representativeElement && businessInfo.representativeName) {
            representativeElement.textContent = `대표자 : ${businessInfo.representativeName}`;
        }

        // 숙소 전화번호 매핑
        const phoneElement = this.safeSelect('.footer-contact-phone');
        if (phoneElement && this.data.property.contactPhone) {
            phoneElement.textContent = `숙소 전화번호 : ${this.data.property.contactPhone}`;
        }

        // 사업자번호 매핑
        const businessNumberElement = this.safeSelect('.footer-business-number');
        if (businessNumberElement && businessInfo.businessNumber) {
            businessNumberElement.textContent = `사업자번호 : ${businessInfo.businessNumber}`;
        }

        // 주소 매핑
        const addressElement = this.safeSelect('.footer-address');
        if (addressElement && businessInfo.businessAddress) {
            addressElement.textContent = `주소 : ${businessInfo.businessAddress}`;
        }

        // 통신판매업신고번호 매핑 (.ecommerce-registration)
        const ecommerceElement = this.safeSelect('.ecommerce-registration');
        // JSON의 첫 번째 property.businessInfo.eCommerceRegistrationNumber에서 가져오기
        const ecommerceNumber = this.safeGet(this.data, 'property.businessInfo.eCommerceRegistrationNumber');

        if (ecommerceElement && ecommerceNumber) {
            ecommerceElement.textContent = `통신판매업신고번호 : ${ecommerceNumber}`;
        }

        // 저작권 정보 매핑
        const copyrightElement = this.safeSelect('.footer-copyright');
        if (copyrightElement && businessInfo.businessName) {
            const currentYear = new Date().getFullYear();
            copyrightElement.textContent = `© ${currentYear} ${businessInfo.businessName}. All rights reserved.`;
        }

        // 소셜미디어 링크 매핑
        this.mapSocialMediaLinks();
    }

    /**
     * 소셜미디어 링크 매핑
     * 각 링크 값이 없으면 해당 링크 미노출
     */
    mapSocialMediaLinks() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        const socialLinks = this.data.homepage.socialLinks || {};

        // 소셜 미디어 플랫폼 배열로 처리
        const socialMediaPlatforms = ['facebook', 'instagram', 'youtube', 'blog'];

        // 유효한 소셜 링크가 있는지 확인
        let hasAnySocialLink = false;

        socialMediaPlatforms.forEach(platform => {
            const linkElement = this.safeSelect(`[data-homepage-socialLinks-${platform}]`);
            if (linkElement) {
                const url = socialLinks[platform];
                if (url && url.trim()) {
                    linkElement.href = url;
                    linkElement.style.removeProperty('display');  // display 속성 제거하여 표시
                    hasAnySocialLink = true;
                } else {
                    linkElement.style.setProperty('display', 'none', 'important');
                }
            }
        });

        // 소셜 링크가 하나도 없으면 .social-links 컨테이너 숨기기
        const socialLinksContainer = this.safeSelect('.social-links');
        if (socialLinksContainer) {
            if (!hasAnySocialLink) {
                socialLinksContainer.style.setProperty('display', 'none', 'important');
            } else {
                socialLinksContainer.style.removeProperty('display');
            }
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
            return;
        }

        // Header 매핑
        this.mapHeaderLogo();
        this.mapHeaderNavigation();

        // SEO 메타태그 매핑
        this.mapSEOMetaTags();

        // SEO 데이터가 없을 때만 기존 메타 태그 업데이트
        if (!this.data.homepage?.seo) {
            this.updateMetaTags(this.data.property);
        }
    }

    /**
     * Footer 전체 매핑 실행
     */
    async mapFooter() {
        if (!this.isDataLoaded) {
            return;
        }

        // Footer 매핑
        this.mapFooterInfo();
    }

    /**
     * Header & Footer 전체 매핑 실행
     */
    async mapHeaderFooter() {
        if (!this.isDataLoaded) {
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