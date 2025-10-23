/**
 * Index Page Data Mapper
 * index.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 index 페이지 특화 기능 제공
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 INDEX PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (index.html 전용)
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // index.html 스타일 hero 섹션 매핑 (data 속성 사용)
        const brandTitle = this.safeSelect('[data-property-name]');
        if (brandTitle && property.name) {
            brandTitle.textContent = property.name;
        }


        // 새로운 구조: homepage.customFields.pages.index.sections[0].hero
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');

        const taglineMain = this.safeSelect('[data-hero-title]');
        if (taglineMain && heroData && heroData.title) {
            taglineMain.textContent = heroData.title;
        }


        // Hero description 섹션 매핑 - index 페이지의 essence 데이터 사용
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (essenceData) {
            const heroDescriptionTitle = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-title]');
            if (heroDescriptionTitle && essenceData.title) {
                heroDescriptionTitle.innerHTML = essenceData.title;
            }

            const heroDescriptionBody = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-description]');
            if (heroDescriptionBody && essenceData.description) {
                heroDescriptionBody.innerHTML = essenceData.description;
            }
        } else {
            // fallback으로 property.description 사용
            const heroDescriptionTitle = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-title]');
            const heroDescriptionBody = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-description]');

            if (heroDescriptionTitle && this.data.property?.name) {
                heroDescriptionTitle.innerHTML = this.data.property.name;
            }

            if (heroDescriptionBody && this.data.property?.description) {
                heroDescriptionBody.innerHTML = this.data.property.description;
            }
        }

        // Hero slider 동적 생성
        const heroSliderContainer = this.safeSelect('.index-hero-slider-wrapper');
        if (heroSliderContainer) {
            // 컨테이너 초기화
            heroSliderContainer.innerHTML = '';

            // hero 이미지 데이터만 수집
            const heroImages = (heroData && Array.isArray(heroData.images)) ? heroData.images : [];

            // hero 이미지에 대해서만 슬라이드 생성
            if (heroImages.length > 0) {
                // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
                const selectedImages = heroImages
                    .filter(img => img.isSelected)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                if (selectedImages.length > 0) {
                    selectedImages.forEach((image, index) => {
                        const slide = document.createElement('div');
                        slide.className = 'slide';

                        const img = document.createElement('img');
                        img.setAttribute(`data-homepage-customFields-pages-index-sections-0-hero-images-${index}`, '');

                        // ImageHelpers를 사용하여 이미지 처리
                        ImageHelpers.applyImageOrPlaceholder(img, [image]);

                        slide.appendChild(img);
                        heroSliderContainer.appendChild(slide);
                    });
                } else {
                    // 선택된 이미지가 없으면 placeholder 추가
                    this._createEmptySlide(heroSliderContainer);
                }
            } else {
                // 이미지 데이터가 없는 경우 empty placeholder 추가
                this._createEmptySlide(heroSliderContainer);
            }

            // 슬라이더 재초기화
            this._reinitializeHeroSlider();
        }
    }

    /**
     * 히어로 슬라이더 재초기화
     */
    _reinitializeHeroSlider() {
        // 기존 초기화 플래그 제거
        const sliderWrapper = document.querySelector('.heroSlider');
        if (sliderWrapper) {
            delete sliderWrapper.dataset.sliderInitialized;
        }

        // 슬라이더 재초기화
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider();
        }
    }

    /**
     * Empty 슬라이드 생성 헬퍼
     */
    _createEmptySlide(container) {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const img = document.createElement('img');
        img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
        img.alt = '';
        img.classList.add('empty-image-placeholder');

        slide.appendChild(img);
        container.appendChild(slide);
    }

    /**
     * Essence 섹션 매핑 (index.html 전용)
     * heroDescription 영역의 essence 데이터 매핑
     */
    mapEssenceSection() {
        if (!this.isDataLoaded) return;

        // 새로운 구조: homepage.customFields.pages.index.sections[0].essence
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');

        if (essenceData) {
            // heroDescription 영역의 essence 데이터 매핑
            const heroDescriptionTitle = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-title]');
            if (heroDescriptionTitle && essenceData.title) {
                heroDescriptionTitle.innerHTML = essenceData.title;
            }

            const heroDescriptionBody = this.safeSelect('[data-homepage-customFields-pages-index-sections-0-essence-description]');
            if (heroDescriptionBody && essenceData.description) {
                heroDescriptionBody.innerHTML = essenceData.description;
            }
        }
    }




    mapRoomsSection() {
        const rooms = this.safeGet(this.data, 'rooms');
        if (!Array.isArray(rooms) || rooms.length === 0) {
            return;
        }

        // Rooms 섹션 내의 property name 매핑
        const roomsSectionPropertyName = this.safeSelect('.con2.mobilemt [data-property-name]');
        if (roomsSectionPropertyName && this.data.property && this.data.property.name) {
            roomsSectionPropertyName.textContent = this.data.property.name;
        }

        // rooms 컨테이너 찾기
        const roomsContainer = this.safeSelect('.rooms');
        if (!roomsContainer) {
            return;
        }

        // 컨테이너 초기화
        roomsContainer.innerHTML = '';

        // 동적으로 rooms 생성 (최대 2개만 표시)
        rooms.slice(0, 2).forEach((room, index) => {
            const roomNumber = String(index + 1).padStart(2, '0');
            const isEven = index % 2 === 0;

            // 이미지 URL 가져오기
            const thumbnailImage = this.safeGet(room, 'images.0.thumbnail.0');
            const interiorImages = this.safeGet(room, 'images.0.interior') || [];
            const interior0 = interiorImages[0];  // interior 첫 번째 이미지

            // 이미지 없을 때 empty placeholder 사용
            const thumbnailUrl = thumbnailImage?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            const interiorUrl = interior0?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;

            // 이미지 없을 때 클래스 추가
            const thumbnailClass = !thumbnailImage?.url ? 'empty-image-placeholder' : '';
            const interiorClass = !interior0?.url ? 'empty-image-placeholder' : '';

            if (isEven) {
                // 짝수 인덱스: con2Top 레이아웃
                const roomHtml = `
                    <div class="con2Top room">
                        <aside class="left">
                            <div class="imgGrp imgGrp01"
                                 data-rooms-${index}-images-0-thumbnail-0>
                                <img data-src-placeholder="thumbnail-${index}" alt="${room.name || 'Room'}" class="imgGrpPic imgGrpPic01 ${thumbnailClass}" />
                            </div>
                        </aside>
                        <aside class="right">
                            <div class="txtGrp txtGrp01">
                                <div class="txtGrpTxt">
                                    <div>
                                        <span class="featureSubtitle isActive">#${roomNumber}</span>
                                    </div>
                                    <div>
                                        <h2 class="featureSubtitle isActive" data-rooms-${index}-name>
                                            ${room.name || 'Room'}
                                        </h2>
                                    </div>
                                    <div>
                                        <span class="mt5 featureDescription" data-rooms-${index}-description>
                                            ${room.description || ''}
                                        </span>
                                    </div>
                                    <div>
                                        <a href="room.html?id=${room.id}" class="btnBorder" data-rooms-${index}-id>
                                            바로가기
                                        </a>
                                    </div>
                                </div>
                                <div class="txtGrpImg txtGrpImg01"
                                     data-rooms-${index}-images-0-interior-0>
                                    <img data-src-placeholder="interior-${index}" alt="${room.name || 'Room'} Interior" class="${interiorClass}" />
                                </div>
                            </div>
                        </aside>
                    </div>
                `;
                roomsContainer.insertAdjacentHTML('beforeend', roomHtml);

                // Set image sources after DOM insertion to avoid encoding issues
                const lastRoom = roomsContainer.lastElementChild;
                const thumbnailImg = lastRoom.querySelector('img[data-src-placeholder="thumbnail-' + index + '"]');
                const interiorImg = lastRoom.querySelector('img[data-src-placeholder="interior-' + index + '"]');

                if (thumbnailImg) {
                    thumbnailImg.src = thumbnailUrl;
                    thumbnailImg.removeAttribute('data-src-placeholder');
                }
                if (interiorImg) {
                    interiorImg.src = interiorUrl;
                    interiorImg.removeAttribute('data-src-placeholder');
                }
            } else {
                // 홀수 인덱스: con2Bottom 레이아웃
                const roomHtml = `
                    <div class="con2Bottom">
                        <aside class="left">
                            <div class="txtGrp txtGrp02">
                                <div class="txtGrpTxt">
                                    <div>
                                        <span class="featureSubtitle isActive">#${roomNumber}</span>
                                    </div>
                                    <div>
                                        <h2 class="featureSubtitle isActive" data-rooms-${index}-name>
                                            ${room.name || 'Room'}
                                        </h2>
                                    </div>
                                    <div>
                                        <span class="mt5 featureDescription" data-rooms-${index}-description>
                                            ${room.description || ''}
                                        </span>
                                    </div>
                                    <div>
                                        <a href="room.html?id=${room.id}" class="btnBorder" data-rooms-${index}-id>
                                            바로가기
                                        </a>
                                    </div>
                                </div>
                                <div class="txtGrpImg txtGrpImg02"
                                     data-rooms-${index}-images-0-interior-1>
                                    <img data-src-placeholder="interior-odd-${index}" alt="${room.name || 'Room'} Interior" class="${interiorClass}" />
                                </div>
                            </div>
                        </aside>
                        <aside class="right">
                            <div class="imgGrp imgGrp02"
                                 data-rooms-${index}-images-0-thumbnail-0>
                                <img data-src-placeholder="thumbnail-odd-${index}" alt="${room.name || 'Room'}" class="imgGrpPic imgGrpPic02 ${thumbnailClass}" />
                            </div>
                        </aside>
                    </div>
                `;
                roomsContainer.insertAdjacentHTML('beforeend', roomHtml);

                // Set image sources after DOM insertion to avoid encoding issues
                const lastRoom = roomsContainer.lastElementChild;
                const interiorImg = lastRoom.querySelector('img[data-src-placeholder="interior-odd-' + index + '"]');
                const thumbnailImg = lastRoom.querySelector('img[data-src-placeholder="thumbnail-odd-' + index + '"]');

                if (interiorImg) {
                    interiorImg.src = interiorUrl;
                    interiorImg.removeAttribute('data-src-placeholder');
                }
                if (thumbnailImg) {
                    thumbnailImg.src = thumbnailUrl;
                    thumbnailImg.removeAttribute('data-src-placeholder');
                }
            }
        });

        // 애니메이션 재초기화
        this.reinitializeScrollAnimations();
    }

    mapSpecialsSection() {
        // Specials 섹션 내의 property name 매핑
        const specialsSectionPropertyName = this.safeSelect('.specialsSection [data-property-name]');
        if (specialsSectionPropertyName && this.data.property && this.data.property.name) {
            specialsSectionPropertyName.textContent = this.data.property.name;
        }

        const slider = this.safeSelect('.specialsSection .slider');
        if (!slider) return;

        // 컨테이너가 숨겨져 있을 수 있으므로 명시적으로 표시
        const container = this.safeSelect('.specialsSection .specialSlider');
        if (container) {
            container.style.display = '';
        }

        slider.innerHTML = '';

        const collectedImages = [];

        const facilities = this.safeGet(this.data, 'property.facilities');
        if (Array.isArray(facilities)) {
            facilities
                .slice()
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                .forEach((facility, facilityIndex) => {
                    // facility.images는 직접 배열 (images[0].main이 아님)
                    const facilityImages = facility.images || [];
                    if (!Array.isArray(facilityImages)) return;

                    // isSelected가 true인 이미지 중 최대 2개까지 가져오기
                    const selectedImages = facilityImages
                        .filter(img => img.isSelected)
                        .slice(0, 2);

                    selectedImages.forEach((image, imageIndex) => {
                        if (!image?.url) return;
                        collectedImages.push({
                            url: image.url,
                            description: image.description || facility.name || '시설 이미지',
                            sortOrder: image.sortOrder ?? 0,
                            displayOrder: facility.displayOrder ?? 0,
                            facilityIndex: facilityIndex,
                            imageIndex: imageIndex
                        });
                    });
                });
        }

        const seen = new Set();

        collectedImages
            .sort((a, b) => (a.displayOrder - b.displayOrder) || (a.sortOrder - b.sortOrder))
            .forEach((image) => {
                if (!image.url || seen.has(image.url)) return;
                seen.add(image.url);

                const slide = document.createElement('div');
                slide.className = 'slide';

                slide.innerHTML = `
                    <img data-property-facilities-${image.facilityIndex}-images-${image.imageIndex}
                         src="${image.url}"
                         alt="${image.description}"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='${ImageHelpers.EMPTY_IMAGE_WITH_ICON}'; this.classList.add('empty-image-placeholder');"
                         class="${!image.url ? 'empty-image-placeholder' : ''}">
                `;
                slider.appendChild(slide);
            });

        if (!slider.children.length) {
            // 이미지가 없을 때 3개의 empty placeholder 생성
            for (let i = 0; i < 3; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'slide';
                placeholder.innerHTML = `
                    <img src="${ImageHelpers.EMPTY_IMAGE_WITH_ICON}"
                         alt=""
                         class="empty-image-placeholder"
                         loading="lazy">
                `;
                slider.appendChild(placeholder);
            }
        }

        // 스페셜 슬라이더 재초기화
        this._reinitializeSpecialSlider();
    }

    /**
     * 스페셜 슬라이더 재초기화
     */
    _reinitializeSpecialSlider() {
        // 기존 초기화 플래그 제거
        const specialSliders = document.querySelectorAll('.specialSlider');
        specialSliders.forEach(slider => {
            delete slider.dataset.specialSliderInitialized;
        });

        // 슬라이더 재초기화
        if (typeof window.initSpecialSlider === 'function') {
            window.initSpecialSlider();
        }
    }

    mapReservationSection() {
        const reservationHero = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        if (!reservationHero) return;

        const titleEl = this.safeSelect('[data-index-reservation-title]');
        if (titleEl && reservationHero.title) {
            titleEl.textContent = reservationHero.title;
        }

        const descriptionEl = this.safeSelect('[data-index-reservation-description]');
        if (descriptionEl && reservationHero.description) {
            descriptionEl.innerHTML = reservationHero.description.replace(/\n/g, '<br>');
        }

        const heroTextEl = this.safeSelect('[data-index-reservation-hero]');
        if (heroTextEl && reservationHero.description) {
            heroTextEl.innerHTML = reservationHero.description.replace(/\n/g, '<br>');
        }

        const bannerEl = this.safeSelect('[data-homepage-customFields-pages-reservation-sections-0-hero-images-0]');
        if (bannerEl) {
            const heroImage = Array.isArray(reservationHero.images) ? reservationHero.images[0] : null;
            const imageUrl = heroImage?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;

            bannerEl.style.backgroundImage = `url("${imageUrl}")`;

            if (heroImage?.description) {
                bannerEl.setAttribute('aria-label', heroImage.description);
            } else {
                bannerEl.setAttribute('aria-label', '');
            }

            // Add empty-image-placeholder class if no image
            if (!heroImage?.url) {
                bannerEl.classList.add('empty-image-placeholder');
            } else {
                bannerEl.classList.remove('empty-image-placeholder');
                // Add the actual URL as a data attribute for reference
                bannerEl.setAttribute('data-homepage-customFields-pages-reservation-sections-0-hero-images-0-url', heroImage.url);
            }
        }
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Index 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // Index 페이지 섹션 순차 매핑
        this.mapHeroSection();
        this.mapEssenceSection();
        this.mapSpecialsSection();
        this.mapRoomsSection();
        this.mapReservationSection();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // SEO 정보 업데이트 (인덱스 페이지용)
        const indexSEO = this.safeGet(this.data, 'homepage.customFields.pages.index.seo');
        if (indexSEO) {
            this.updateSEOInfo(indexSEO);
        }

        // Favicon 매핑
        this.mapFavicon();

        // 애니메이션 재초기화
        this.reinitializeScrollAnimations();

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}
