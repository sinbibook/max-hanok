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

        // Hero 이미지 배열 가져오기 (isSelected: true만 필터링)
        const allHeroImages = reservationData.hero?.images || [];
        const heroImages = allHeroImages.filter(img => img.isSelected);

        // Hero 이미지 0번 매핑 (배경 이미지)
        const heroImage0 = this.safeSelect('[data-reservation-hero-image-0]');
        if (heroImage0) {
            if (heroImages.length > 0 && heroImages[0]?.url) {
                heroImage0.src = heroImages[0].url;
                heroImage0.alt = heroImages[0].description || '예약안내 배경';
                heroImage0.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(heroImage0);
            }
        }

        // Hero 이미지 1번 매핑 (배너 이미지)
        const heroImage1 = this.safeSelect('[data-reservation-hero-image-1]');
        if (heroImage1) {
            if (heroImages.length > 1 && heroImages[1]?.url) {
                heroImage1.src = heroImages[1].url;
                heroImage1.alt = heroImages[1].description || '예약안내 배너';
                heroImage1.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(heroImage1);
            }
        }

        // Hero 제목 매핑
        const heroTitle = this.safeSelect('[data-reservation-hero-title]');
        if (heroTitle) {
            const title = reservationData.hero?.title  || '예약안내';
            heroTitle.textContent = title;
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

        // 연락처 정보 매핑 (현재는 사용 안 함 - HTML에 연락처 섹션이 없음)
        // this.mapContactInfo(businessInfo);
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
        const property = this.data.property;
        // customFields 헬퍼 함수 사용
        const propertyName = this.getPropertyName();
        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const pageSEO = {
            title: propertyName ? `예약안내 - ${propertyName}` : 'SEO 타이틀',
            description: reservationData?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
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
