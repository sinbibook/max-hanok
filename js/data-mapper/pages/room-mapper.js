/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 페이지 전용 기능 제공
 * URL 파라미터로 ?index=0,1,2...를 받아서 동적으로 객실 정보 표시
 */
class RoomMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentRoom = null;
        this.currentRoomIndex = null;
        this.currentRoomPageData = null;
    }

    // ============================================================================
    // 🏠 ROOM PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 객실 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentRoom() {
        if (!this.isDataLoaded || !this.data.rooms) {
            console.error('Data not loaded or no rooms data available');
            return null;
        }

        // URL에서 room id 추출
        const urlParams = new URLSearchParams(window.location.search);
        let roomId = urlParams.get('id');

        // id가 없으면 첫 번째 room으로 리다이렉트
        if (!roomId && this.data.rooms.length > 0) {
            console.warn('Room id not specified, redirecting to first room');
            window.location.href = `room.html?id=${this.data.rooms[0].id}`;
            return null;
        }

        if (!roomId) {
            console.error('Room id not specified in URL and no rooms available');
            return null;
        }

        // rooms 배열에서 해당 id의 객실 찾기
        const roomIndex = this.data.rooms.findIndex(room => room.id === roomId);

        if (roomIndex === -1) {
            console.error(`Room with id ${roomId} not found`);
            return null;
        }

        const room = this.data.rooms[roomIndex];
        this.currentRoom = room;
        this.currentRoomIndex = roomIndex; // 인덱스도 저장 (페이지 데이터 접근용)
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

        if (roomId && this.data.rooms) {
            const index = this.data.rooms.findIndex(room => room.id === roomId);
            if (index !== -1) {
                this.currentRoomIndex = index;
                return index;
            }
        }

        return null;
    }

    /**
     * 현재 객실 페이지 데이터 가져오기 (캐시 포함)
     */
    getCurrentRoomPageData() {
        // 현재 room을 먼저 가져와서 캐시가 유효한지 확인
        const room = this.getCurrentRoom();
        if (!room || !room.id) {
            return null;
        }

        // 캐시된 데이터가 있고 같은 room이면 바로 반환
        if (this.currentRoomPageData && this.currentRoomPageData.id === room.id) {
            return this.currentRoomPageData;
        }

        const roomPages = this.safeGet(this.data, 'homepage.customFields.pages.room');
        if (!roomPages || !Array.isArray(roomPages)) {
            return null;
        }

        // pages.room 배열에서 현재 room.id와 일치하는 페이지 데이터 찾기
        const pageData = roomPages.find(page => page.id === room.id);
        if (!pageData) {
            return null;
        }

        // 캐시 저장
        this.currentRoomPageData = {
            id: room.id,
            data: pageData
        };

        return this.currentRoomPageData;
    }

    /**
     * Hero 섹션 매핑 (슬라이더, 텍스트)
     */
    mapHeroSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // Hero 텍스트 매핑
        this.mapHeroText(room);

        // Hero 이미지 슬라이더 초기화
        this.initializeHeroSlider(room);
    }



    /**
     * Hero 텍스트 섹션 매핑
     */
    mapHeroText(room) {
        // customFields 헬퍼 함수 사용
        const roomName = this.getRoomName(room);

        // Hero 객실명 매핑
        const roomHeroName = this.safeSelect('[data-room-hero-name]');
        if (roomHeroName) {
            roomHeroName.textContent = roomName;
        }

        // Hero 설명 매핑 (JSON에서 roomPage.hero.title 찾기)
        const roomHeroDescription = this.safeSelect('[data-room-hero-description]');
        if (roomHeroDescription) {
            const roomPageData = this.getCurrentRoomPageData();
            const heroDescription = roomPageData?.data?.sections?.[0]?.hero?.title;

            if (heroDescription) {
                // \n을 <br>로 변환하여 줄바꿈 처리
                const formattedText = heroDescription.replace(/\n/g, '<br>');
                roomHeroDescription.innerHTML = formattedText;
            } else {
                // 기본값
                roomHeroDescription.textContent = `${roomName}에서 편안한 휴식을 즐기세요.`;
            }
        }
    }


    /**
     * Hero 이미지 슬라이더 초기화
     */
    initializeHeroSlider(room) {
        const slidesContainer = this.safeSelect('[data-room-hero-slides-container]');

        if (!slidesContainer) return;

        // customFields 헬퍼 함수 사용
        const roomName = this.getRoomName(room);

        // customFields에서 인테리어 이미지 가져오기
        const sortedImages = this.getRoomImages(room, 'roomtype_interior');

        // 이미지가 없으면 빈 이미지 표시
        if (sortedImages.length === 0) {
            slidesContainer.innerHTML = `
                <div class="hero-slide active">
                    <img class="w-full h-full object-cover" alt="이미지 없음" loading="eager">
                </div>
            `;
            const img = slidesContainer.querySelector('img');
            ImageHelpers.applyPlaceholder(img);

            const totalSlidesElement = this.safeSelect('[data-room-total-slides]');
            if (totalSlidesElement) {
                totalSlidesElement.textContent = '01';
            }
            return;
        }

        // 기존 슬라이드 제거
        slidesContainer.innerHTML = '';

        // 슬라이드 생성
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || roomName;
            img.className = 'w-full h-full object-cover';
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');

            slide.appendChild(img);
            slidesContainer.appendChild(slide);
        });

        // Total slides 인디케이터 업데이트
        const totalSlidesElement = this.safeSelect('[data-room-total-slides]');
        if (totalSlidesElement) {
            totalSlidesElement.textContent = String(sortedImages.length).padStart(2, '0');
        }

        // 전역 슬라이더 초기화 함수 호출 (room.js의 initializeSlider)
        if (typeof window.initializeSlider === 'function') {
            window.initializeSlider();
        }
    }

    /**
     * 객실 정보 섹션 매핑
     */
    mapRoomInfoSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // customFields 헬퍼 함수 사용
        const roomName = this.getRoomName(room);

        // 객실명 매핑
        const roomInfoName = this.safeSelect('[data-room-info-name]');
        if (roomInfoName) {
            roomInfoName.textContent = roomName;
        }

        // 객실 상세 설명 매핑
        const roomInfoDescription = this.safeSelect('[data-room-info-description]');
        if (roomInfoDescription) {
            const roomDescriptions = this.safeGet(this.data, 'homepage.customFields.roomPage.roomDescriptions');
            const roomDesc = roomDescriptions?.find(desc => desc.roomtypeId === room.id);
            const infoDescription = roomDesc?.infoDescription;

            if (infoDescription) {
                roomInfoDescription.textContent = infoDescription;
            } else {
                // 기본값
                roomInfoDescription.textContent = room.description || `${roomName}의 상세 정보입니다.`;
            }
        }

        // 객실 면적 매핑
        const roomSize = this.safeSelect('[data-room-size]');
        if (roomSize) {
            roomSize.textContent = `${room.size || '-'}m²`;
        }

        // 수용인원 매핑
        const roomCapacity = this.safeSelect('[data-room-capacity]');
        if (roomCapacity) {
            const capacity = `기준 ${room.baseOccupancy || 2}인 / 최대 ${room.maxOccupancy || 4}인`;
            roomCapacity.textContent = capacity;
        }

        // 뷰 정보 매핑 (현재 room의 roomViews 배열의 모든 뷰 표시)
        const roomView = this.safeSelect('[data-room-view]');
        if (roomView) {
            const roomViews = room.roomViews || [];
            const viewInfo = roomViews.length > 0 ? roomViews.join(', ') : '객실 뷰';
            roomView.textContent = viewInfo;
        }

        // 침대 타입 매핑 (현재 room의 bedTypes 배열의 모든 타입 표시)
        const roomBedType = this.safeSelect('[data-room-bed-type]');
        if (roomBedType) {
            const bedTypes = room.bedTypes || [];
            const bedTypeInfo = bedTypes.length > 0 ? bedTypes.join(', ') : '킹사이즈 침대';
            roomBedType.textContent = bedTypeInfo;
        }

        // 체크인/체크아웃 정보 매핑
        const roomCheckinCheckout = this.safeSelect('[data-room-checkin-checkout]');
        if (roomCheckinCheckout) {
            const ts = room.timeSettings;
            roomCheckinCheckout.textContent = `체크인 ${ts?.checkin || '-'} / 체크아웃 ${ts?.checkout || '-'}`;
        }

        // 객실 구조 매핑 (현재 room의 roomStructures 배열의 모든 구조 표시)
        const roomStructure = this.safeSelect('[data-room-structure]');
        if (roomStructure) {
            const roomStructures = room.roomStructures || [];
            const structureInfo = roomStructures.length > 0 ? roomStructures.join(', ') : '침실 1개, 화장실 1개';
            roomStructure.textContent = structureInfo;
        }

        // 객실 이용안내 매핑 (roomInfo 필드 사용, 줄바꿈 처리)
        const roomAdditionalInfo = this.safeSelect('[data-room-additional-info]');
        if (roomAdditionalInfo) {
            const roomInfo = room.roomInfo || '편안한 휴식 공간';
            // \n을 <br>로 변환해서 HTML에 표시
            roomAdditionalInfo.innerHTML = roomInfo.replace(/\n/g, '<br>');
        }

        // Accordion sections 매핑
        this.mapRoomTypeAccordion(room);
        this.mapRoomInfoAccordion(room);

        // Room Images Section 매핑
        this.mapRoomImagesSection(room);
    }

    /**
     * Room Type Accordion 섹션 매핑
     */
    mapRoomTypeAccordion(room) {
        const roomTypeElement = this.safeSelect('[data-room-type]');
        if (!roomTypeElement) return;

        const bedTypes = room.bedTypes || [];
        const bedTypeInfo = bedTypes.length > 0 ? bedTypes.join(', ') : '-';

        roomTypeElement.textContent = bedTypeInfo;
    }

    /**
     * Room Info Accordion 섹션 매핑
     */
    mapRoomInfoAccordion(room) {
        const roomInfoElement = this.safeSelect('[data-room-info]');
        if (!roomInfoElement) return;

        const infoLines = [];

        // 객실 면적
        if (room.size) {
            infoLines.push(`면적: ${room.size}m²`);
        }

        // 수용 인원
        const capacity = `인원: 기준 ${room.baseOccupancy || 2}인 / 최대 ${room.maxOccupancy || 4}인`;
        infoLines.push(capacity);

        // 뷰 정보
        const roomViews = room.roomViews || [];
        if (roomViews.length > 0) {
            infoLines.push(`뷰: ${roomViews.join(', ')}`);
        }

        // 객실 구조
        const roomStructures = room.roomStructures || [];
        if (roomStructures.length > 0) {
            infoLines.push(`구성: ${roomStructures.join(', ')}`);
        }

        // 체크인/체크아웃
        const ts = room.timeSettings;
        infoLines.push(`체크인: ${ts?.checkin || '-'} / 체크아웃: ${ts?.checkout || '-'}`);

        roomInfoElement.innerHTML = infoLines.join('<br>');
    }

    /**
     * Room Images Section 매핑 (interior 2번째, 3번째)
     */
    mapRoomImagesSection(room) {
        if (!room) return;

        // customFields 헬퍼 함수 사용
        const roomName = this.getRoomName(room);
        const sortedImages = this.getRoomImages(room, 'roomtype_interior');

        // 3번째 이미지 (horizontal)
        const horizontalImage = this.safeSelect('[data-room-interior-image-0]');
        if (horizontalImage) {
            if (sortedImages[2]) {
                horizontalImage.src = sortedImages[2].url;
                horizontalImage.alt = sortedImages[2].description || `${roomName} Interior 3`;
                horizontalImage.setAttribute('data-image-fallback', '');
                horizontalImage.classList.remove('empty-image-placeholder');
            } else {
                horizontalImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                horizontalImage.classList.add('empty-image-placeholder');
            }
        }

        // 4번째 이미지 (vertical)
        const verticalImage = this.safeSelect('[data-room-interior-image-1]');
        if (verticalImage) {
            if (sortedImages[3]) {
                verticalImage.src = sortedImages[3].url;
                verticalImage.alt = sortedImages[3].description || `${roomName} Interior 4`;
                verticalImage.setAttribute('data-image-fallback', '');
                verticalImage.classList.remove('empty-image-placeholder');
            } else {
                verticalImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
                verticalImage.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * 객실 편의시설/특징 매핑
     */
    mapRoomAmenities() {
        const room = this.getCurrentRoom();

        if (!room || !room.amenities || room.amenities.length === 0) {
            return;
        }

        const amenitiesGrid = this.safeSelect('[data-room-amenities-grid]');
        if (!amenitiesGrid) {
            // grid가 없어도 accordion은 실행
            this.mapAmenitiesAccordion(room);
            return;
        }

        // 기존 어메니티 제거
        amenitiesGrid.innerHTML = '';

        // JSON 데이터의 실제 어메니티들에 맞춘 아이콘 매핑 (기존 방식 유지)
        const amenityIcons = {
            // JSON에서 나오는 실제 어메니티들
            '간이 주방': 'M3 6h18M3 6l3-3h12l3 3M3 6v15a2 2 0 002 2h14a2 2 0 002-2V6M10 12h4',
            '냉장고': 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM12 8h.01M12 16h.01',
            '전자레인지': 'M3 7h18v10H3V7zM7 7V3a1 1 0 011-1h8a1 1 0 011 1v4M9 12h6',
            '인덕션': 'M8 12a4 4 0 118 0 4 4 0 01-8 0zM12 8v8M8 12h8',
            '조리도구': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            '그릇': 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM8 12h8',
            '정수기': 'M12 2v20M8 5h8M6 12h12M8 19h8',
            '와이파이': 'M2 7h20M2 12h20M2 17h20',
            '에어컨': 'M3 12h18M3 8h18M3 16h18M12 3v18',
            '침구류': 'M3 7h18v10H3V7zM7 3h10v4H7V3z',
            '수건': 'M3 12h18M6 7h12M6 17h12',
            '어메니티': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '청소용품': 'M6 2l3 6 5-4-8 13 4-7 6 2z',
            '헤어드라이어': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '기본': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };

        // 어메니티 아이템들 생성
        room.amenities.forEach(amenity => {
            const amenityDiv = document.createElement('div');
            amenityDiv.className = 'feature-item';

            const amenityName = amenity; // 문자열 배열
            const iconPath = amenityIcons[amenityName] || amenityIcons['기본'];

            amenityDiv.innerHTML = `
                <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
                </svg>
                <span class="text-base md:text-lg text-gray-600">${amenityName}</span>
            `;

            amenitiesGrid.appendChild(amenityDiv);
        });

        // Accordion section도 매핑
        this.mapAmenitiesAccordion(room);
    }

    /**
     * Amenities Accordion 섹션 매핑
     */
    mapAmenitiesAccordion(room) {
        const amenitiesElement = this.safeSelect('[data-room-amenities]');

        if (!amenitiesElement) {
            return;
        }

        if (!room || !room.amenities || room.amenities.length === 0) {
            amenitiesElement.textContent = '편의시설 정보가 없습니다.';
            return;
        }

        // 문자열 배열을 쉼표로 구분하여 표시
        amenitiesElement.textContent = room.amenities.join(', ');
    }

    /**
     * 갤러리 아이템 생성 헬퍼 함수
     * @param {Object|null} image - 이미지 객체 (없으면 null)
     * @param {string} roomName - 객실명
     * @returns {HTMLElement} 생성된 갤러리 아이템
     */
    _createGalleryItem(image, roomName) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const img = document.createElement('img');
        img.loading = 'lazy';

        if (image) {
            img.src = image.url;
            img.alt = image.description || roomName;
            img.className = 'w-full h-full object-cover';
            img.setAttribute('data-image-fallback', '');
        } else {
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = '이미지 없음';
            img.className = 'w-full h-full object-cover empty-image-placeholder';
        }

        galleryItem.appendChild(img);
        return galleryItem;
    }

    /**
     * 객실 갤러리 매핑
     */
    mapRoomGallery() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const gallerySection = this.safeSelect('[data-room-gallery-grid]');
        if (!gallerySection) {
            return;
        }

        // customFields 헬퍼 함수 사용
        const roomName = this.getRoomName(room);
        const sortedExterior = this.getRoomImages(room, 'roomtype_exterior');

        // Main large image - exterior 첫 번째 이미지 사용 (썸네일 첫 번째와 동일)
        const mainImage = gallerySection.querySelector('.gallery-main-image img');
        if (mainImage && sortedExterior[0]) {
            mainImage.src = sortedExterior[0].url;
            mainImage.alt = sortedExterior[0].description || `${roomName} Exterior`;
            mainImage.setAttribute('data-image-fallback', '');
            mainImage.classList.remove('empty-image-placeholder');
        } else if (mainImage) {
            mainImage.src = ImageHelpers.EMPTY_IMAGE_SVG;
            mainImage.classList.add('empty-image-placeholder');
        }

        // Thumbnails 매핑 (최대 3개, exterior 이미지)
        const thumbnails = gallerySection.querySelectorAll('.gallery-thumb img');
        thumbnails.forEach((thumb, index) => {
            if (sortedExterior[index]) {
                thumb.src = sortedExterior[index].url;
                thumb.alt = sortedExterior[index].description || `${roomName} Exterior ${index + 1}`;
                thumb.setAttribute('data-image-fallback', '');
                thumb.classList.remove('empty-image-placeholder');
            } else {
                thumb.src = ImageHelpers.EMPTY_IMAGE_SVG;
                thumb.classList.add('empty-image-placeholder');
            }
        });

        // Gallery description 매핑 (customFields의 pages.room.sections.gallery.title)
        const galleryDescription = this.safeSelect('[data-customfield-room-gallery-description]');
        if (galleryDescription) {
            const customFieldRooms = this.safeGet(this.data, 'homepage.customFields.pages.room') || [];
            const customFieldRoom = customFieldRooms.find(r => r.id === room.id);
            const galleryTitle = customFieldRoom?.sections?.[0]?.gallery?.title;

            // 빈 문자열이 아니면 매핑
            if (galleryTitle && galleryTitle.trim() !== '') {
                galleryDescription.innerHTML = galleryTitle.replace(/\n/g, '<br>');
            }
        }

        // Property English name 매핑
        const propertyNameEn = this.safeSelect('[data-property-nameEn]');
        if (propertyNameEn) {
            const nameEn = this.safeGet(this.data, 'property.nameEn');
            if (nameEn) {
                propertyNameEn.textContent = nameEn;
            }
        }
    }


    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Room 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map room page: data not loaded');
            return;
        }

        const room = this.getCurrentRoom();
        if (!room) {
            console.error('Cannot map room page: room not found');
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapRoomInfoSection();
        this.mapRoomAmenities();
        this.mapRoomGallery();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        // customFields 헬퍼 함수 사용
        const propertyName = this.getPropertyName();
        const roomName = this.getRoomName(room);
        const pageSEO = {
            title: (roomName && propertyName) ? `${roomName} - ${propertyName}` : 'SEO 타이틀',
            description: room?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
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
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}
