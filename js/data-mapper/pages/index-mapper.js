/**
 * Index Page Data Mapper
 * Extends BaseDataMapper for Index page specific mappings
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 메인 매핑 메서드
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            // SEO 메타 태그 업데이트
            this.updateMetaTags();

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapEssenceSection();
            this.mapRoomsSection();
            this.mapFacilitySection();
            this.mapClosingSection();

            // 슬라이더 재초기화
            this.reinitializeSliders();

        } catch (error) {
            console.error('IndexMapper mapPage error:', error);
        }
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSliders() {
        // Hero 슬라이더 재초기화
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider();
        }

        // Room Carousel 재초기화 (카드 동적 생성 후)
        if (typeof window.initRoomCarousel === 'function') {
            window.initRoomCarousel();
        }

        // Facility Slideshow 재초기화 (슬라이드 동적 생성 후)
        if (typeof window.initFacilitySlideshow === 'function') {
            window.initFacilitySlideshow();
        }
    }

    // ============================================================================
    // 🎯 HERO SECTION MAPPING
    // ============================================================================

    /**
     * Hero Section 매핑 (메인 소개 섹션)
     */
    mapHeroSection() {
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');

        // 데이터 없어도 슬라이더는 항상 생성 (empty placeholder 표시)
        this.mapHeroSlider(heroData?.images || []);

        if (!heroData) return;

        // 메인 소개 타이틀 매핑
        const heroTitleElement = this.safeSelect('[data-hero-title]');
        if (heroTitleElement) {
            heroTitleElement.textContent = this.sanitizeText(heroData?.title, '메인 히어로 타이틀');
        }

        // 메인 소개 설명 매핑
        const heroDescElement = this.safeSelect('[data-hero-description]');
        if (heroDescElement) {
            heroDescElement.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '메인 히어로 설명');
        }
    }

    /**
     * Hero Slider 이미지 매핑
     */
    mapHeroSlider(images) {
        const sliderContainer = this.safeSelect('[data-hero-slider]');
        if (!sliderContainer) return;

        // 이미지 배열 정규화 (isSelected:true 필터 + sortOrder 정렬)
        let normalizedImages = [];
        if (images && Array.isArray(images) && images.length > 0) {
            if (typeof images[0] === 'string') {
                normalizedImages = images.map(url => ({ url, description: '' }));
            } else {
                normalizedImages = images
                    .filter(img => img.isSelected === true)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map(img => ({ url: img.url, description: img.description || '' }));
            }
        }

        // 기존 슬라이드 초기화
        sliderContainer.innerHTML = '';

        if (normalizedImages.length === 0) {
            // 이미지 없을 때 empty-image-placeholder
            const slideDiv = document.createElement('div');
            slideDiv.className = 'main-slide';

            const imgElement = document.createElement('img');
            imgElement.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            imgElement.alt = '이미지 없음';
            imgElement.classList.add('empty-image-placeholder');

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
            return;
        }

        normalizedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'main-slide';

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, '히어로 이미지');
            imgElement.loading = index === 0 ? 'eager' : 'lazy';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
        });
    }

    // ============================================================================
    // 💎 ESSENCE SECTION MAPPING
    // ============================================================================

    /**
     * Essence Section 매핑 (핵심 메시지 섹션)
     */
    mapEssenceSection() {
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (!essenceData) return;

        // 설명 매핑
        const descElement = this.safeSelect('[data-essence-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(essenceData?.description, '핵심 메시지 섹션 설명');
        }

        // 이미지 매핑 (최대 4개, 개수에 따라 슬롯 show/hide)
        this.initEssenceImages(essenceData.images || []);
    }

    /**
     * Essence 이미지 초기화 (최대 4개, 개수에 따라 슬롯 동적 show/hide)
     */
    initEssenceImages(images) {
        // 이미지 정규화 (isSelected:true 필터 + sortOrder 정렬, 최대 4개)
        let normalizedImages = [];
        if (images && Array.isArray(images) && images.length > 0) {
            if (typeof images[0] === 'string') {
                normalizedImages = images.slice(0, 4).map(url => ({ url, description: '' }));
            } else {
                normalizedImages = images
                    .filter(img => img.isSelected === true)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .slice(0, 4)
                    .map(img => ({ url: img.url, description: img.description || '' }));
            }
        }

        // 슬롯 정의: imgSelector, hideTarget (이미지 없을 때 숨길 요소)
        const slots = [
            {
                imgSelector: '[data-essence-image-1]',
                hideTarget: '.content-group .content-image.large'
            },
            {
                imgSelector: '[data-essence-image-2]',
                hideTarget: '.con1-item.con1-1'
            },
            {
                imgSelector: '[data-essence-image-3]',
                hideTarget: '.con1-item.con1-3'
            },
            {
                imgSelector: '[data-essence-image-4]',
                hideTarget: '.con1-item.con1-4'
            }
        ];

        slots.forEach((slot, index) => {
            const imgEl = this.safeSelect(slot.imgSelector);
            const img = normalizedImages[index] || null;
            if (imgEl) {
                imgEl.src = img?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                imgEl.alt = this.sanitizeText(img?.description, '에센스 이미지');
                imgEl.loading = index === 0 ? 'eager' : 'lazy';
                if (!img?.url) imgEl.classList.add('empty-image-placeholder');
                else imgEl.classList.remove('empty-image-placeholder');
            }
        });

        // 이미지 설명 매핑 (1번: images[0], 2번: images[1])
        const descEl1 = this.safeSelect('[data-essence-image-description-1]');
        if (descEl1) {
            descEl1.innerHTML = this._formatTextWithLineBreaks(normalizedImages[0]?.description, '에센스 이미지 설명 1');
        }

        const descEl2 = this.safeSelect('[data-essence-image-description-2]');
        if (descEl2) {
            descEl2.innerHTML = this._formatTextWithLineBreaks(normalizedImages[1]?.description, '에센스 이미지 설명 2');
        }
    }

    // ============================================================================
    // 🏠 ROOMS SECTION MAPPING
    // ============================================================================

    /**
     * Rooms Section 매핑
     */
    mapRoomsSection() {
        const roomsData = this.safeGet(this.data, 'rooms');
        if (!roomsData || !Array.isArray(roomsData)) return;

        const roomsContainer = this.safeSelect('[data-rooms-container]');
        if (!roomsContainer) return;

        // 섹션 서브타이틀 (숙소명 + 하드코딩 문구)
        const subtitleEl = this.safeSelect('[data-rooms-subtitle]');
        if (subtitleEl) {
            subtitleEl.textContent = `${this.getPropertyName()}에서 나만의 특별한 공간을 찾아보세요.`;
        }

        // displayOrder 정렬
        const sortedRooms = [...roomsData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        roomsContainer.innerHTML = '';

        const createCard = (room) => {
            // roomtype_thumbnail 이미지 (base-mapper의 getRoomImages 사용)
            const thumbnails = this.getRoomImages(room, 'roomtype_thumbnail');
            const thumbnailUrl = thumbnails[0]?.url || null;

            const card = document.createElement('div');
            card.className = 'room-card';
            const roomName = this.getRoomName(room);
            card.innerHTML = `
                <div class="room-image">
                    <img alt="${roomName}" loading="lazy">
                </div>
                <div class="room-info">
                    <h3>${roomName}</h3>
                    <p>${this._formatTextWithLineBreaks(room.description, '객실 설명')}</p>
                    <button class="btn-more" onclick="navigateTo('room', '${room.id}')">View More</button>
                </div>
            `;

            // src 직접 할당 (data URI 깨짐 방지)
            const imgEl = card.querySelector('.room-image img');
            if (thumbnailUrl) {
                imgEl.src = thumbnailUrl;
            } else {
                imgEl.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                imgEl.classList.add('empty-image-placeholder');
            }

            return card;
        };

        // Set 1 + Set 2 생성 (무한 스크롤용)
        sortedRooms.forEach(room => roomsContainer.appendChild(createCard(room)));
        sortedRooms.forEach(room => roomsContainer.appendChild(createCard(room)));
    }

    // ============================================================================
    // 🏊 FACILITY SECTION MAPPING
    // ============================================================================

    /**
     * Facility Section 매핑 (부대시설 섹션)
     * - property.facilities를 displayOrder 정렬 후 전체 동적 생성
     */
    mapFacilitySection() {
        const facilities = this.safeGet(this.data, 'property.facilities');
        if (!facilities || !Array.isArray(facilities) || facilities.length === 0) return;

        const sortedFacilities = [...facilities]
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        const leftImagesEl = this.safeSelect('.meditation-image');
        const infoEl = this.safeSelect('.meditation-info');
        const rightImagesEl = this.safeSelect('.special-right-image');

        // 컨테이너 초기화
        if (leftImagesEl) leftImagesEl.innerHTML = '';
        if (infoEl) infoEl.innerHTML = '';

        // 오른쪽 이미지 컨테이너: .image-overlay 보존
        const overlay = rightImagesEl ? rightImagesEl.querySelector('.image-overlay') : null;
        if (rightImagesEl) rightImagesEl.innerHTML = '';

        sortedFacilities.forEach((facility) => {
            const images = (facility.images || [])
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            const firstImg = images[0] || null;
            const secondImg = images[1] || null;

            // 왼쪽 이미지 (.meditation-image)
            if (leftImagesEl) {
                const img = document.createElement('img');
                img.className = 'facility-slide';
                img.src = firstImg ? firstImg.url : ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(facility.name, '부대시설 이미지');
                if (!firstImg) img.classList.add('empty-image-placeholder');
                leftImagesEl.appendChild(img);
            }

            // 정보 슬라이드 (.meditation-info)
            if (infoEl) {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'facility-slide';

                const title = document.createElement('h3');
                title.className = 'meditation-title';
                title.textContent = this.sanitizeText(facility.name, '부대시설명');

                const desc = document.createElement('p');
                desc.className = 'meditation-text';
                desc.innerHTML = this._formatTextWithLineBreaks(facility.description, '부대시설 설명');

                const facilityId = facility.id;
                const btn = document.createElement('button');
                btn.className = 'btn-outline';
                btn.textContent = 'View More';
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.location.href = 'facility.html?id=' + facilityId;
                });

                slideDiv.appendChild(title);
                slideDiv.appendChild(desc);
                slideDiv.appendChild(btn);
                infoEl.appendChild(slideDiv);
            }

            // 오른쪽 이미지 (.special-right-image)
            if (rightImagesEl) {
                const img = document.createElement('img');
                img.className = 'facility-slide';
                // 두 번째 이미지 없으면 첫 번째 재사용
                const rightSrc = secondImg || firstImg;
                img.src = rightSrc ? rightSrc.url : ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(facility.name, '부대시설 이미지');
                if (!rightSrc) img.classList.add('empty-image-placeholder');
                rightImagesEl.appendChild(img);
            }
        });

        // overlay 복원
        if (rightImagesEl && overlay) rightImagesEl.appendChild(overlay);
    }

    // ============================================================================
    // 🎬 CLOSING SECTION MAPPING
    // ============================================================================

    /**
     * Closing Section 매핑 (마무리 섹션)
     */
    mapClosingSection() {
        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');

        // 배경 이미지 매핑 (div → background-image)
        const bgEl = this.safeSelect('[data-closing-image]');
        if (bgEl) {
            const selectedImages = (closingData?.images || [])
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            if (selectedImages.length > 0) {
                bgEl.style.backgroundImage = `url('${selectedImages[0].url}')`;
                bgEl.classList.remove('empty-image-placeholder');
            } else {
                bgEl.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
                bgEl.classList.add('empty-image-placeholder');
            }
        }

        // 타이틀 매핑
        const closingTitle = this.safeSelect('[data-closing-title]');
        if (closingTitle) {
            closingTitle.textContent = this.sanitizeText(closingData?.title, '마무리 섹션 타이틀');
        }

        // 설명 매핑
        const descElement = this.safeSelect('[data-closing-description]');
        if (descElement) {
            descElement.innerHTML = this._formatTextWithLineBreaks(
                closingData?.description,
                '마무리 섹션 설명'
            );
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화 (로컬 환경용, iframe 아닐 때만)
if (typeof window !== 'undefined' && window.parent === window) {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new IndexMapper();
        await mapper.initialize();
        // 매핑 완료 알림 (index.js에서 수신)
        window.dispatchEvent(new CustomEvent('mapperReady'));
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}
