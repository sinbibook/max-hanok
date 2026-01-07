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

        // Hero 배너 배경 이미지 매핑 (선택된 이미지 중 첫 번째)
        const heroBanner = this.safeSelect('[data-homepage-customFields-pages-reservation-sections-0-hero-images-0-url]');
        if (heroBanner) {
            // 선택된 이미지만 필터링 - ImageHelpers 사용
            const heroImages = reservationData.hero?.images || [];
            const firstSelectedImage = ImageHelpers.getFirstSelectedImage(heroImages);

            if (firstSelectedImage?.url) {
                const imageUrl = firstSelectedImage.url;
                heroBanner.style.background = `url("${imageUrl}") center/cover no-repeat fixed`;
                heroBanner.classList.remove('empty-image-placeholder');

                // 이미지 로드 실패 처리
                const img = new Image();
                img.onerror = () => {
                    heroBanner.style.background = `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}") center/cover no-repeat fixed`;
                    heroBanner.classList.add('empty-image-placeholder');
                };
                img.src = imageUrl;
            } else {
                // 선택된 이미지가 없으면 empty placeholder 사용
                heroBanner.style.background = `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}") center/cover no-repeat fixed`;
                heroBanner.classList.add('empty-image-placeholder');
            }
        }

        // Hero 제목 매핑
        const heroTitle = this.safeSelect('[data-homepage-customFields-pages-reservation-sections-0-hero-title]');
        if (heroTitle) {
            const title = reservationData.hero?.title || '';
            heroTitle.textContent = title;
        }
    }

    /**
     * 이용안내 섹션 매핑
     */
    mapUsageSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // property.usageGuide를 이용안내 규칙으로 매핑
        if (property.usageGuide) {
            this.mapUsageRules(property.usageGuide);
        }
    }

    /**
     * 예약안내 섹션 매핑
     */
    mapReservationGuideSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // property.reservationGuide를 예약안내 규칙으로 매핑
        if (property.reservationGuide) {
            this.mapReservationGuideRules(property.reservationGuide);
        }
    }

    /**
     * 체크인/체크아웃 섹션 매핑
     */
    mapCheckinCheckoutSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // property.checkInOutInfo를 체크인/체크아웃 안내로 매핑
        if (property.checkInOutInfo) {
            this.mapCheckinCheckout(property.checkInOutInfo);
        }
    }

    /**
     * 텍스트 규칙을 컨테이너에 매핑하는 공통 헬퍼 메서드
     * @private
     */
    _mapTextRulesToContainer(container, text) {
        if (!container || !text) return;

        container.innerHTML = '';

        const rules = text.split('\n').filter(rule => rule.trim());
        rules.forEach(rule => {
            const ruleElement = document.createElement('p');
            ruleElement.textContent = rule;
            container.appendChild(ruleElement);
        });
    }

    /**
     * 이용안내 규칙 매핑
     */
    mapUsageRules(usageGuide) {
        const usageRules = this.safeSelect('[data-property-usageGuide]');
        this._mapTextRulesToContainer(usageRules, usageGuide);
    }

    /**
     * 체크인/체크아웃 안내 매핑
     */
    mapCheckinCheckout(checkInOutInfo) {
        const checkinRules = this.safeSelect('[data-property-checkInOutInfo]');
        this._mapTextRulesToContainer(checkinRules, checkInOutInfo);
    }

    /**
     * 예약안내 규칙 매핑
     */
    mapReservationGuideRules(reservationGuide) {
        const reservationRules = this.safeSelect('[data-property-reservationGuide]');
        this._mapTextRulesToContainer(reservationRules, reservationGuide);
    }

    /**
     * 환불규정 섹션 매핑
     */
    mapRefundSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // property.refundSettings.customerRefundNotice를 환불 규칙으로 매핑
        if (property.refundSettings?.customerRefundNotice) {
            this.mapRefundRules(property.refundSettings.customerRefundNotice);
        }

        // property.refundPolicies를 취소 수수료 테이블로 매핑
        if (property.refundPolicies) {
            this.mapRefundPolicies(property.refundPolicies);
        }
    }

    /**
     * 환불 규칙 매핑 (customerRefundNotice)
     */
    mapRefundRules(customerRefundNotice) {
        const refundRules = this.safeSelect('[data-property-refundSettings-customerRefundNotice]');
        this._mapTextRulesToContainer(refundRules, customerRefundNotice);
    }

    /**
     * 환불 정책 테이블 매핑
     */
    mapRefundPolicies(refundPolicies) {
        const tableBody = this.safeSelect('.refundTableBody');
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
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapUsageSection();
        this.mapReservationGuideSection();
        this.mapCheckinCheckoutSection();
        this.mapRefundSection();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // Favicon 매핑
        this.mapFavicon();

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReservationMapper;
} else {
    window.ReservationMapper = ReservationMapper;
}

