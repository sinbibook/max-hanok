/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 페이지 전용 기능 제공
 * URL 파라미터로 ?id={room.id}를 받아서 동적으로 객실 정보 표시
 */
class RoomMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentRoom = null;
    }

    // ============================================================================
    // 🏠 ROOM PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 객실 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentRoom() {
        if (!this.isDataLoaded || !this.data?.rooms) {
            return null;
        }

        // URL에서 room id 추출
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (!roomId) {
            return null;
        }

        // rooms 배열에서 해당 id의 객실 찾기
        const roomIndex = this.data.rooms.findIndex(room => room.id === roomId);

        if (roomIndex === -1) {
            return null;
        }

        const room = this.data.rooms[roomIndex];
        this.currentRoom = room;
        this.currentRoomIndex = roomIndex; // 인덱스도 저장 (다른 메서드에서 사용)
        return room;
    }

    /**
     * 현재 객실 인덱스 가져오기
     */
    getCurrentRoomIndex() {
        if (this.currentRoomIndex !== undefined) {
            return this.currentRoomIndex;
        }

        // getCurrentRoom()이 호출되지 않았을 경우를 위한 fallback
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (!roomId || !this.data?.rooms) {
            return null;
        }

        // id로 인덱스 찾기
        const index = this.data.rooms.findIndex(room => room.id === roomId);

        if (index !== -1) {
            this.currentRoomIndex = index;
            return index;
        }

        return null;
    }

    /**
     * Room basic info 매핑 (name, description, capacity, bedTypes, views, checkin/checkout, structures)
     */
    mapRoomBasicInfo() {
        const room = this.getCurrentRoom();
        const roomIndex = this.getCurrentRoomIndex();
        if (!room || roomIndex === null) return;

        // Room name 매핑
        const nameEl = this.safeSelect('[data-room-name]');
        if (nameEl && room.name) {
            nameEl.textContent = room.name;
        }

        // Property name 매핑 (subNav 영역)
        const propertyNameEl = this.safeSelect('[data-property-name]');
        if (propertyNameEl && this.data.property?.name) {
            propertyNameEl.textContent = this.data.property.name;
        }

        // Room type 매핑 (subNav 영역)
        const roomTypeEl = this.safeSelect('[data-room-type]');
        if (roomTypeEl && room.name) {
            roomTypeEl.textContent = room.name;
        }

        // Room hero title 매핑 (homepage.customFields.pages.room)
        const heroTitleEl = this.safeSelect('[data-homepage-customFields-pages-room-0-sections-0-hero-title]');
        if (heroTitleEl) {
            const roomPages = this.safeGet(this.data, 'homepage.customFields.pages.room');
            if (Array.isArray(roomPages)) {
                // room.id로 해당 객실의 customFields 찾기
                const roomCustomField = roomPages.find(r => r.id === room.id);
                const heroTitle = this.safeGet(roomCustomField, 'sections.0.hero.title');
                const sanitizedTitle = this.sanitizeText(heroTitle);
                // 빈 문자열('')도 업데이트하여 이전 값 제거
                heroTitleEl.innerHTML = this._formatTextWithLineBreaks(sanitizedTitle);
            }
        }

        // Room description 매핑
        const descriptionEl = this.safeSelect('[data-room-description]');
        if (descriptionEl && room.description) {
            descriptionEl.innerHTML = this._formatTextWithLineBreaks(room.description);
        }

        // 기준/최대 인원 통합 표시
        const capacityEl = this.safeSelect('[data-room-base-occupancy][data-room-max-occupancy]');
        if (capacityEl) {
            const baseOccupancy = room.baseOccupancy || 2;
            const maxOccupancy = room.maxOccupancy || 4;
            capacityEl.textContent = `기준 ${baseOccupancy}인 / 최대 ${maxOccupancy}인`;
        }

        // 침대 타입 매핑
        const bedTypesEl = this.safeSelect('[data-room-bed-types]');
        if (bedTypesEl) {
            const bedTypes = room.bedTypes || [];
            bedTypesEl.textContent = bedTypes.length > 0 ? bedTypes.join(', ') : '침대 정보 없음';
        }

        // 뷰 타입 매핑
        const roomViewsEl = this.safeSelect('[data-room-views]');
        if (roomViewsEl) {
            const roomViews = room.roomViews || [];
            roomViewsEl.textContent = roomViews.length > 0 ? roomViews.join(', ') : '뷰 정보 없음';
        }

        // 체크인/체크아웃 통합 표시
        const checkinCheckoutEl = this.safeSelect('[data-property-checkin][data-property-checkout]');
        if (checkinCheckoutEl) {
            const checkin = this.data.property?.checkin || '15:00:00';
            const checkout = this.data.property?.checkout || '11:00:00';
            checkinCheckoutEl.textContent = `${checkin.substring(0, 5)} / ${checkout.substring(0, 5)}`;
        }

        // 객실 구조 매핑
        const roomStructuresEl = this.safeSelect('[data-room-structures]');
        if (roomStructuresEl) {
            const roomStructures = room.roomStructures || [];
            roomStructuresEl.textContent = roomStructures.length > 0 ? roomStructures.join(', ') : '구조 정보 없음';
        }

        // 객실 크기 매핑
        const sizeEl = this.safeSelect('[data-room-size]');
        if (sizeEl && room.size) {
            sizeEl.textContent = `${room.size}㎡`;
        }

        // 객실 편의시설 매핑
        const amenitiesEl = this.safeSelect('[data-room-amenities]');
        if (amenitiesEl) {
            const amenities = room.amenities || [];
            if (amenities.length > 0) {
                amenitiesEl.innerHTML = '';
                amenities.forEach((amenity, index) => {
                    const span = document.createElement('span');
                    span.className = 'amenityItem';
                    span.textContent = amenity;
                    amenitiesEl.appendChild(span);

                    // 마지막 항목이 아니면 쉼표 추가
                    if (index < amenities.length - 1) {
                        const comma = document.createTextNode(', ');
                        amenitiesEl.appendChild(comma);
                    }
                });
            } else {
                amenitiesEl.innerHTML = '<span class="amenityItem">편의시설 정보 없음</span>';
            }
        }

        // 객실 이용안내 매핑
        const roomInfoEl = this.safeSelect('[data-room-roomInfo]');
        if (roomInfoEl && room.roomInfo) {
            roomInfoEl.innerHTML = this._formatTextWithLineBreaks(room.roomInfo);
        }

        // 객실 외관 이미지 동적 생성 (최대 4개, 아코디언) - isSelected 필터링 적용
        const allExteriorImages = this.safeGet(room, 'images.0.exterior') || [];
        const exteriorImages = ImageHelpers.filterSelectedImages(allExteriorImages);
        const accordionContainer = this.safeSelect('#exteriorAccordionContainer');

        if (accordionContainer) {
            // 컨테이너 초기화
            accordionContainer.innerHTML = '';

            // 이미지가 있는 경우 최대 4개까지 표시
            if (exteriorImages.length > 0) {
                const maxImages = Math.min(exteriorImages.length, 4);

                for (let i = 0; i < maxImages; i++) {
                    const src = exteriorImages[i]?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                    const alt = exteriorImages[i]?.alt || `객실 외관 ${i + 1}`;
                    const isPlaceholder = !exteriorImages[i]?.url;

                    const accordionItem = this._createAccordionItem(src, alt, isPlaceholder);
                    accordionContainer.appendChild(accordionItem);
                }

                // 이미지 개수에 따라 클래스 추가 (CSS 스타일링용)
                accordionContainer.setAttribute('data-image-count', maxImages);
            } else {
                // 이미지가 없는 경우 placeholder 3개 표시
                for (let i = 0; i < 3; i++) {
                    const accordionItem = this._createAccordionItem(ImageHelpers.EMPTY_IMAGE_WITH_ICON, '', true);
                    accordionContainer.appendChild(accordionItem);
                }

                accordionContainer.setAttribute('data-image-count', 3);
            }
        }
    }

    /**
     * 아코디언 아이템 생성 헬퍼 함수
     */
    _createAccordionItem(src, alt, isPlaceholder = false) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordionItem';

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;

        if (isPlaceholder) {
            img.classList.add('empty-image-placeholder');
        }

        accordionItem.appendChild(img);
        return accordionItem;
    }

    /**
     * Room slider and thumbnails 동적 생성 (data-rooms-0-images-0-interior 기반)
     */
    mapRoomSliderAndThumbnails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // interior 이미지 배열 가져오기 - isSelected 필터링 적용
        const allInteriorImages = this.safeGet(room, 'images.0.interior') || [];
        const interiorImages = ImageHelpers.filterSelectedImages(allInteriorImages);
        const roomName = room.name || '객실';

        // 1. 슬라이더 생성
        const slideWrapper = this.safeSelect('.room-slide-wrapper');
        if (slideWrapper) {
            slideWrapper.innerHTML = '';

            // 이미지가 없는 경우 empty placeholder 5개 표시
            if (!Array.isArray(interiorImages) || interiorImages.length === 0) {
                for (let i = 0; i < 5; i++) {
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    const img = document.createElement('img');
                    img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                    img.alt = '';
                    img.loading = i === 0 ? 'eager' : 'lazy';
                    img.classList.add('empty-image-placeholder');
                    slide.appendChild(img);
                    slideWrapper.appendChild(slide);
                }
            } else {
                interiorImages.forEach((image, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    const img = document.createElement('img');

                    if (image.url && image.url !== '') {
                        img.src = image.url;
                        img.alt = roomName + ' ' + (image.caption || `인테리어 ${index + 1}`);
                    } else {
                        img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                        img.alt = '';
                        img.classList.add('empty-image-placeholder');
                    }

                    img.loading = index === 0 ? 'eager' : 'lazy';
                    slide.appendChild(img);
                    slideWrapper.appendChild(slide);
                });
            }
        }

        // 2. 썸네일 갤러리 생성
        const thumbnailWrapper = this.safeSelect('.room-thumbnail-wrapper');
        if (thumbnailWrapper) {
            // 썸네일 네비게이션 버튼 추가
            const thumbnailContainer = thumbnailWrapper.parentElement;
            if (thumbnailContainer && !thumbnailContainer.querySelector('.thumbnailNav')) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'thumbnailNav thumbnailNav--prev';
                prevBtn.setAttribute('aria-label', 'Previous thumbnail');
                thumbnailContainer.appendChild(prevBtn);

                const nextBtn = document.createElement('button');
                nextBtn.className = 'thumbnailNav thumbnailNav--next';
                nextBtn.setAttribute('aria-label', 'Next thumbnail');
                thumbnailContainer.appendChild(nextBtn);

                // 썸네일 스크롤 이벤트
                const THUMBNAIL_SCROLL_RATIO = 0.8;
                const scrollThumbnails = (direction) => {
                    const scrollAmount = thumbnailWrapper.clientWidth * THUMBNAIL_SCROLL_RATIO;
                    thumbnailWrapper.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
                };

                prevBtn.addEventListener('click', () => scrollThumbnails(-1));
                nextBtn.addEventListener('click', () => scrollThumbnails(1));
            }

            thumbnailWrapper.innerHTML = '';

            // 이미지가 없는 경우 empty placeholder 5개 표시
            if (!Array.isArray(interiorImages) || interiorImages.length === 0) {
                // 썸네일 개수 속성 설정 (placeholder도 5개)
                thumbnailWrapper.setAttribute('data-thumbnail-count', '5');

                for (let i = 0; i < 5; i++) {
                    const li = document.createElement('li');
                    li.className = 'roomGalleryItem';
                    li.setAttribute('data-slide-index', i);

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'roomGalleryThumb';

                    const img = document.createElement('img');
                    img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                    img.alt = '';
                    img.loading = 'lazy';
                    img.classList.add('empty-image-placeholder');

                    button.appendChild(img);
                    li.appendChild(button);
                    thumbnailWrapper.appendChild(li);
                }
            } else {
                // 썸네일 개수 속성 설정 (전체 이미지 개수)
                thumbnailWrapper.setAttribute('data-thumbnail-count', interiorImages.length);

                interiorImages.forEach((image, index) => {
                    const li = document.createElement('li');
                    li.className = 'roomGalleryItem';
                    li.setAttribute('data-slide-index', index);

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'roomGalleryThumb';

                    const img = document.createElement('img');

                    if (image.url && image.url !== '') {
                        img.src = image.url;
                        img.alt = roomName + ' ' + (image.caption || `썸네일 ${index + 1}`);
                    } else {
                        img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                        img.alt = '';
                        img.classList.add('empty-image-placeholder');
                    }

                    img.loading = 'lazy';

                    button.appendChild(img);
                    li.appendChild(button);
                    thumbnailWrapper.appendChild(li);
                });
            }
        }

        // 3. 슬라이더 초기화 및 이벤트 리스너 설정
        this.initializeRoomSlider();
    }

    /**
     * Room slider 초기화 및 이벤트 설정
     */
    initializeRoomSlider() {
        const sliderContainer = this.safeSelect('#roomStandardHeroSlider');
        if (!sliderContainer) return;

        const slides = sliderContainer.querySelectorAll('.slide');
        const prevBtn = sliderContainer.querySelector('.prev');
        const nextBtn = sliderContainer.querySelector('.next');
        const thumbnails = document.querySelectorAll('.roomGalleryThumb');

        if (slides.length === 0) return;

        let currentSlide = 0;
        let autoSlideTimer = null;

        // 슬라이더 업데이트 함수
        const updateSlider = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });

            // 썸네일 active 상태 업데이트
            thumbnails.forEach((thumb, i) => {
                thumb.closest('.roomGalleryItem').classList.toggle('is-active', i === index);
            });

            // 썸네일 스크롤 동기화
            const thumbnailWrapper = this.safeSelect('.room-thumbnail-wrapper');
            if (thumbnailWrapper && thumbnails[index]) {
                const activeThumb = thumbnails[index].closest('.roomGalleryItem');
                if (activeThumb) {
                    // 썸네일을 중앙에 위치시키기
                    const scrollLeft = activeThumb.offsetLeft - (thumbnailWrapper.clientWidth / 2) + (activeThumb.clientWidth / 2);
                    thumbnailWrapper.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }

            currentSlide = index;
        };

        // 자동 슬라이드
        const startAutoSlide = () => {
            const autoplayDelay = parseInt(sliderContainer.dataset.autoplay) || 5000;
            if (slides.length > 1) {
                autoSlideTimer = setInterval(() => {
                    const nextIndex = (currentSlide + 1) % slides.length;
                    updateSlider(nextIndex);
                }, autoplayDelay);
            }
        };

        const resetAutoSlide = () => {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
            }
            startAutoSlide();
        };

        // 이전 버튼
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
                updateSlider(prevIndex);
                resetAutoSlide();
            });
        }

        // 다음 버튼
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const nextIndex = (currentSlide + 1) % slides.length;
                updateSlider(nextIndex);
                resetAutoSlide();
            });
        }

        // 썸네일 클릭 이벤트
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                updateSlider(index);
                resetAutoSlide();
            });
        });

        // 초기화
        updateSlider(0);
        startAutoSlide();
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION

    /**
     * Room 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        const room = this.getCurrentRoom();
        if (!room) {
            return;
        }

        // 페이지 제목 업데이트
        this.updatePageTitle(room);

        // 순차적으로 각 섹션 매핑
        this.mapRoomBasicInfo();
        this.mapRoomSliderAndThumbnails();

        // 메타 태그 업데이트
        this.updateMetaTags(this.data.property);

        // Favicon 매핑
        this.mapFavicon();

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * 페이지 제목 업데이트
     */
    updatePageTitle(room) {
        const property = this.data.property;

        // HTML title 업데이트
        document.title = `${room.name} - ${property.name}`;

        // page-title 엘리먼트 업데이트
        const pageTitleElement = this.safeSelect('#page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = `${room.name} - ${property.name}`;
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}