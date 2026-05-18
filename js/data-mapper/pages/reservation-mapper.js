/**
 * Reservation Page Data Mapper
 * reservation.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 예약 페이지 전용 기능 제공
 */
class ReservationMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 📅 RESERVATION PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');
        if (!reservationData) return;

        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        // Hero 이미지 배열 가져오기 (isSelected: true만 필터링, sortOrder로 정렬)
        const images = reservationData.hero?.images
            ? reservationData.hero.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
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

        // 슬라이더 초기화
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
     * 예약 정보 섹션 매핑
     */
    mapReservationInfoSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');

        // 예약 정보 제목 매핑 (HTML: data-customfield-reservation-about-title)
        const infoTitle = this.safeSelect('[data-customfield-reservation-about-title]');
        if (infoTitle) {
            const title = reservationData?.about?.title || 'RESERVATION';
            infoTitle.textContent = title;
        }

        // 예약 정보 설명 매핑 (HTML: data-customfield-reservation-about-description)
        const infoDescription = this.safeSelect('[data-customfield-reservation-about-description]');
        if (infoDescription) {
            const description = reservationData?.about?.description || '편안한 휴식을 위한 예약 안내입니다.';
            infoDescription.innerHTML = description.replace(/\n/g, '<br>');
        }

        // Hero 이미지 2번째 이미지 매핑
        this.mapReservationHeroImage();

        // 연락처 정보 매핑 (현재는 사용 안 함 - HTML에 연락처 섹션이 없음)
        // this.mapContactInfo(businessInfo);
    }

    /**
     * 예약 페이지 Hero 이미지 매핑 (2번째 이미지)
     */
    mapReservationHeroImage() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');
        const images = reservationData?.hero?.images
            ? reservationData.hero.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        // 2번째 이미지 가져오기 (index 1)
        const secondImage = images.length > 1 ? images[1] : images.length > 0 ? images[0] : null;

        const circleImage = this.safeSelect('[data-reservation-hero-image-2]');
        if (circleImage) {
            if (secondImage?.url) {
                circleImage.src = secondImage.url;
                circleImage.alt = secondImage.description || '예약안내 이미지';
                circleImage.classList.remove('empty-image-placeholder');
            } else {
                circleImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                circleImage.alt = '이미지 없음';
                circleImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 연락처 정보 매핑
     */
    mapContactInfo(businessInfo) {
        if (!businessInfo) return;

        // 전화번호 매핑
        const phoneValue = document.querySelector('.contact-item:nth-child(2) .contact-value');
        if (phoneValue && businessInfo.businessPhone) {
            phoneValue.textContent = businessInfo.businessPhone;
        }

        // 계좌 정보 매핑
        const accountValue = document.querySelector('.contact-item:nth-child(3) .contact-value');
        if (accountValue && businessInfo.bankAccount) {
            const { bankName, accountNumber, accountHolder } = businessInfo.bankAccount;
            accountValue.textContent = `${bankName} ${accountNumber} (예금주 ${accountHolder})`;
        }
    }

    /**
     * 이용안내 섹션 매핑 (usage-content)
     */
    mapUsageGuideSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const usageContent = this.safeSelect('[data-reservation-usage-content]');

        if (!usageContent || !property.usageGuide) return;

        // 기존 내용 비우고 새로 생성
        usageContent.innerHTML = '';

        // property.usageGuide를 \n으로 분할해서 처리
        const rules = property.usageGuide.split('\n').filter(rule => rule.trim());
        rules.forEach(rule => {
            const p = document.createElement('p');
            p.className = 'accordion-text';
            p.textContent = rule;
            usageContent.appendChild(p);
        });
    }

    /**
     * 예약안내 섹션 매핑 (reservation-guide-content)
     */
    mapReservationGuideSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const reservationGuideContent = this.safeSelect('[data-reservation-guide-content]');

        if (!reservationGuideContent || !property.reservationGuide) return;

        // 기존 내용 비우고 새로 생성
        reservationGuideContent.innerHTML = '';

        // property.reservationGuide를 \n으로 분할해서 처리
        const rules = property.reservationGuide.split('\n').filter(rule => rule.trim());
        rules.forEach(rule => {
            const p = document.createElement('p');
            p.className = 'accordion-text';
            p.textContent = rule;
            reservationGuideContent.appendChild(p);
        });
    }

    /**
     * 입/퇴실 안내 섹션 매핑 (checkin-content)
     */
    mapCheckinCheckoutSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const checkinContent = this.safeSelect('[data-reservation-checkin-content]');

        if (!checkinContent || !property.checkInOutInfo) return;

        // 기존 내용 비우고 새로 생성
        checkinContent.innerHTML = '';

        // property.checkInOutInfo를 \n으로 분할해서 처리
        const rules = property.checkInOutInfo.split('\n').filter(rule => rule.trim());
        rules.forEach(rule => {
            const p = document.createElement('p');
            p.className = 'accordion-text';
            p.textContent = rule;
            checkinContent.appendChild(p);
        });
    }

    /**
     * 환불규정 섹션 매핑 (refund-content - 테이블)
     */
    mapRefundSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // property.refundPolicies를 환불규정 테이블로 매핑
        if (property.refundPolicies) {
            this.mapRefundPolicies(property.refundPolicies);
        }
    }

    /**
     * 취소수수료 섹션 매핑 (fee-content)
     */
    mapCancellationFeeSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const feeContent = this.safeSelect('[data-reservation-fee-content]');

        if (!feeContent || !property.refundSettings?.customerRefundNotice) return;

        // 기존 내용 비우고 새로 생성
        feeContent.innerHTML = '';

        // property.refundSettings.customerRefundNotice를 \n으로 분할해서 처리
        const rules = property.refundSettings.customerRefundNotice.split('\n').filter(rule => rule.trim());
        rules.forEach(rule => {
            const p = document.createElement('p');
            p.className = 'accordion-text';
            p.textContent = rule;
            feeContent.appendChild(p);
        });
    }

    /**
     * 환불 정책 테이블 매핑
     */
    mapRefundPolicies(refundPolicies) {
        const tableBody = this.safeSelect('.refund-table-body');
        if (!tableBody || !refundPolicies || !Array.isArray(refundPolicies)) return;

        tableBody.innerHTML = '';
        refundPolicies.forEach(policy => {
            const row = document.createElement('tr');

            // refundProcessingDays를 기반으로 취소 시점 텍스트 생성
            let period;
            if (policy.refundProcessingDays === 0) {
                period = '이용일 당일';
            } else if (policy.refundProcessingDays === 1) {
                period = '이용일 1일 전';
            } else {
                period = `이용일 ${policy.refundProcessingDays}일 전`;
            }

            // refundRate를 기반으로 환불율 텍스트 생성
            const refundRateText = policy.refundRate === 0 ? '환불 불가' : `${policy.refundRate}% 환불`;

            row.innerHTML = `
                <td>${period}</td>
                <td class="${policy.refundRate === 0 ? 'no-refund' : ''}">${refundRateText}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

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

        // 페이지 인덱스 4 (reservation) - 순환 선택
        const pageIndex = 4;
        const selectedImage = exteriorImages.length > 0 ?
            exteriorImages[pageIndex % exteriorImages.length] : null;

        // 배경 이미지 매핑 (데스크탑 parallax)
        const closingImages = document.querySelectorAll('[data-closing-image]');
        closingImages.forEach(img => {
            if (selectedImage?.url) {
                img.src = selectedImage.url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
                img.alt = 'No Image Available';
            }
        });

        // 모바일 이미지 매핑 (원형 구멍 안)
        const closingMobileImages = document.querySelectorAll('[data-closing-image-mobile]');
        closingMobileImages.forEach(mobileImg => {
            if (selectedImage?.url) {
                mobileImg.src = selectedImage.url;
                mobileImg.classList.remove('empty-image-placeholder');
            } else {
                mobileImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
                mobileImg.classList.add('empty-image-placeholder');
                mobileImg.alt = 'No Image Available';
            }
        });

        // 클로징 섹션 숙소명 매핑
        const propertyNameEn = this.safeSelect('.closing-property-name-en[data-property-name-en]');
        if (propertyNameEn && this.data.property) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * Reservation 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map reservation page: data not loaded');
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapReservationInfoSection();
        this.mapUsageGuideSection();
        this.mapReservationGuideSection();
        this.mapCheckinCheckoutSection();
        this.mapRefundSection();
        this.mapCancellationFeeSection();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const propertyName = this.getPropertyName();
        const pageSEO = {
            title: `예약안내 - ${propertyName}`,
            description: reservationData?.description || this.data.property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 클로징 섹션 매핑
        this.mapClosingSection();
    }

    /**
     * Reservation 페이지 텍스트만 업데이트
     */
    mapReservationText() {
        if (!this.isDataLoaded) return;

        // 순차적으로 각 섹션 텍스트 매핑
        this.mapHeroSection();
        this.mapReservationInfoSection();
        this.mapUsageGuideSection();
        this.mapReservationGuideSection();
        this.mapCheckinCheckoutSection();
        this.mapRefundSection();
        this.mapCancellationFeeSection();
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
    module.exports = ReservationMapper;
} else {
    window.ReservationMapper = ReservationMapper;
}
