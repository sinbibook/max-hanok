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

        // 전화번호 매핑
        const footerPhone = this.safeSelect('.footer-phone p');
        if (footerPhone && businessInfo.businessPhone) {
            footerPhone.textContent = `숙소 전화번호 : ${businessInfo.businessPhone}`;
        }

        // 사업자번호 매핑 (.footer-phone 다음 첫 번째 div)
        const businessNumberElement = this.safeSelect('.footer-info > div:nth-child(3)');
        if (businessNumberElement && businessInfo.businessNumber) {
            businessNumberElement.textContent = `사업자번호 : ${businessInfo.businessNumber}`;
        }

        // 주소 매핑 (.footer-phone 다음 두 번째 div)
        const addressElement = this.safeSelect('.footer-info > div:nth-child(4)');
        if (addressElement && businessInfo.businessAddress) {
            addressElement.textContent = `주소 : ${businessInfo.businessAddress}`;
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
     */
    mapSocialMediaLinks() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        const socialLinks = this.data.homepage.socialLinks;
        if (!socialLinks) return;

        // Facebook 링크
        const facebookLink = this.safeSelect('[data-homepage-socialLinks-facebook]');
        if (facebookLink && socialLinks.facebook) {
            facebookLink.href = socialLinks.facebook;
            facebookLink.style.display = 'inline';
        } else if (facebookLink) {
            facebookLink.style.display = 'none';
        }

        // Instagram 링크
        const instagramLink = this.safeSelect('[data-homepage-socialLinks-instagram]');
        if (instagramLink && socialLinks.instagram) {
            instagramLink.href = socialLinks.instagram;
            instagramLink.style.display = 'inline';
        } else if (instagramLink) {
            instagramLink.style.display = 'none';
        }

        // Blog 링크
        const blogLink = this.safeSelect('[data-homepage-socialLinks-blog]');
        if (blogLink && socialLinks.blog) {
            blogLink.href = socialLinks.blog;
            blogLink.style.display = 'inline';
        } else if (blogLink) {
            blogLink.style.display = 'none';
        }

        // YouTube 링크
        const youtubeLink = this.safeSelect('[data-homepage-socialLinks-youtube]');
        if (youtubeLink && socialLinks.youtube) {
            youtubeLink.href = socialLinks.youtube;
            youtubeLink.style.display = 'inline';
        } else if (youtubeLink) {
            youtubeLink.style.display = 'none';
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

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
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