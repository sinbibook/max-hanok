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
            return null;
        }

        // URL에서 room id 추출
        const urlParams = new URLSearchParams(window.location.search);
        let roomId = urlParams.get('id');

        // id가 없으면 첫 번째 room으로 리다이렉트
        if (!roomId && this.data.rooms.length > 0) {
            window.location.href = `room.html?id=${this.data.rooms[0].id}`;
            return null;
        }

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
     * Hero Slider 섹션 매핑
     */
    mapHeroSlider() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const sliderContainer = this.safeSelect('[data-room-slider]');
        if (!sliderContainer) return;

        // interior 이미지 가져오기 (customFields 우선)
        const interiorImages = this.getRoomImages(room, 'roomtype_interior');

        // 기존 슬라이드 제거
        sliderContainer.innerHTML = '';

        // 이미지가 없으면 placeholder 처리
        const isDemo = this.dataSource === 'demo-filled.json';

        if (interiorImages.length === 0) {
            if (isDemo) {
                // 데모 모드: fallback 이미지 5개 생성
                const placeholderImages = [
                    './images/room.jpg',
                    './images/room2.jpg',
                    './images/room3.jpg',
                    './images/pool.jpg',
                    './images/pool2.jpg'
                ];

                placeholderImages.forEach((imgSrc, i) => {
                    const slide = document.createElement('div');
                    slide.className = 'room-slide';
                    slide.setAttribute('data-index', i);

                    if (i === 0) {
                        slide.classList.add('active');
                    } else if (i === 1) {
                        slide.classList.add('next');
                    } else if (i === 4) {
                        slide.classList.add('prev');
                    }

                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = `객실 이미지 ${i + 1}`;
                    img.loading = i === 0 ? 'eager' : 'lazy';

                    slide.appendChild(img);
                    sliderContainer.appendChild(slide);
                });

                const roomTotalPages = this.safeSelect('.room-total-pages');
                if (roomTotalPages) roomTotalPages.textContent = '05';
            } else {
                // 프로덕션 모드: empty placeholder 1개 생성
                const slide = document.createElement('div');
                slide.className = 'room-slide active';
                slide.setAttribute('data-index', 0);

                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');

                slide.appendChild(img);
                sliderContainer.appendChild(slide);

                const roomTotalPages = this.safeSelect('.room-total-pages');
                if (roomTotalPages) roomTotalPages.textContent = '01';

                // 슬라이드 1개일 때 네비게이션 버튼 숨기기
                const navButtons = document.querySelectorAll('.room-nav-btn, .room-nav-btn-mobile');
                navButtons.forEach(btn => btn.style.display = 'none');
            }
            return;
        }

        // 슬라이드 생성 (이미 필터링/정렬됨)
        interiorImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'room-slide';
            slide.setAttribute('data-index', index);

            // 첫 번째는 active, 두 번째는 next로 설정
            if (index === 0) {
                slide.classList.add('active');
            } else if (index === 1) {
                slide.classList.add('next');
            } else if (index === interiorImages.length - 1 && interiorImages.length > 2) {
                slide.classList.add('prev');
            }

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = this.sanitizeText(image.description, this.getRoomName(room) || '객실 이미지');
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });

        // Total 카운트 업데이트 (데스크탑 & 모바일)
        const roomTotalPages = this.safeSelect('.room-total-pages');
        if (roomTotalPages) {
            roomTotalPages.textContent = String(interiorImages.length).padStart(2, '0');
        }
        const roomTotalPagesMobile = this.safeSelect('.room-total-pages-mobile');
        if (roomTotalPagesMobile) {
            roomTotalPagesMobile.textContent = String(interiorImages.length).padStart(2, '0');
        }

        // 슬라이드 1개일 때 네비게이션 버튼 숨기기
        if (interiorImages.length <= 1) {
            const navButtons = document.querySelectorAll('.room-nav-btn, .room-nav-btn-mobile');
            navButtons.forEach(btn => btn.style.display = 'none');
        }

        // Hero Slider 초기화 (DOM이 완전히 로드된 후)
        setTimeout(() => {
            if (window.initRoomHeroSlider) {
                window.initRoomHeroSlider();
            }
        }, 100);
    }


    /**
     * 기본 정보 섹션 매핑 (객실명, 썸네일, 설명)
     */
    mapBasicInfo() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실명 가져오기 (customFields 우선)
        const roomNameText = this.getRoomName(room);

        // 객실명 매핑 (모든 [data-room-name] 요소들에 적용)
        const roomNameElements = document.querySelectorAll('[data-room-name]');
        roomNameElements.forEach(element => {
            element.textContent = roomNameText;
        });

        // 모바일 객실명 매핑
        const roomNameMobile = this.safeSelect('[data-room-name-mobile]');
        if (roomNameMobile) {
            roomNameMobile.textContent = roomNameText;
        }

        // Hero 섹션의 객실 설명 매핑 (시스템 데이터)
        const heroDescription = document.querySelector('.room-hero-text [data-room-info-description]');
        if (heroDescription) {
            heroDescription.innerHTML = this._formatTextWithLineBreaks(room.description, `${roomNameText}의 상세 정보입니다.`);
            // animate-on-scroll이 있으므로 visible 클래스 추가
            setTimeout(() => {
                heroDescription.classList.add('visible');
            }, 100);
        }

        // 썸네일 이미지 매핑 (customFields 우선)
        const roomThumbnail = this.safeSelect('[data-room-thumbnail]');
        if (roomThumbnail) {
            const thumbnailImages = this.getRoomImages(room, 'roomtype_thumbnail');
            const isDemo = this.dataSource === 'demo-filled.json';

            if (thumbnailImages.length > 0 && thumbnailImages[0]?.url) {
                roomThumbnail.src = thumbnailImages[0].url;
                roomThumbnail.alt = this.sanitizeText(thumbnailImages[0].description, roomNameText || '객실 썸네일');
                roomThumbnail.setAttribute('data-image-fallback', '');
                roomThumbnail.classList.remove('empty-image-placeholder');
            } else if (isDemo) {
                roomThumbnail.src = './images/room.jpg';
                roomThumbnail.alt = this.sanitizeText(roomNameText, '객실 썸네일');
                roomThumbnail.classList.remove('empty-image-placeholder');
            } else {
                roomThumbnail.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                roomThumbnail.alt = '이미지 없음';
                roomThumbnail.classList.add('empty-image-placeholder');
            }
        }

        // 객실 설명 매핑 (CUSTOM FIELD)
        const roomDescription = this.safeSelect('[data-room-description]');
        if (roomDescription) {
            const roomPageData = this.getCurrentRoomPageData();
            const heroTitle = roomPageData?.data?.sections?.[0]?.hero?.title;
            roomDescription.innerHTML = this._formatTextWithLineBreaks(heroTitle, '객실 히어로 타이틀');
        }
    }

    /**
     * 객실 정보 섹션 매핑 (Room Information 섹션)
     */
    mapRoomInfoSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실명 가져오기 (customFields 우선)
        const roomNameText = this.getRoomName(room);

        // 시스템 데이터: 객실 설명 매핑
        const roomInfoDescription = this.safeSelect('[data-room-info-description]');
        if (roomInfoDescription) {
            roomInfoDescription.innerHTML = this._formatTextWithLineBreaks(room.description, `${roomNameText}의 상세 정보입니다.`);
        }
    }

    /**
     * 객실 상세 정보 매핑
     */
    mapRoomDetails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실 크기 (시스템 데이터)
        const roomSize = this.safeSelect('[data-room-size]');
        if (roomSize) {
            roomSize.textContent = room.size ? `${room.size}㎡` : '-';
        }

        // 침대 타입 (시스템 데이터)
        const roomBedTypes = this.safeSelect('[data-room-bed-types]');
        if (roomBedTypes) {
            const bedTypes = room.bedTypes || [];
            roomBedTypes.textContent = bedTypes.length > 0 ? bedTypes.join(', ') : '-';
        }

        // 객실 구성 (시스템 데이터)
        const roomComposition = this.safeSelect('[data-room-composition]');
        if (roomComposition) {
            const roomStructures = room.roomStructures || [];
            roomComposition.textContent = roomStructures.length > 0 ? roomStructures.join(', ') : '-';
        }

        // 인원 (시스템 데이터)
        const roomCapacity = this.safeSelect('[data-room-capacity]');
        if (roomCapacity) {
            const capacity = `기준 ${room.baseOccupancy || 2}인 / 최대 ${room.maxOccupancy || 4}인`;
            roomCapacity.textContent = capacity;
        }

        // 체크인 (시스템 데이터)
        const roomCheckin = this.safeSelect('[data-room-checkin]');
        if (roomCheckin) {
            roomCheckin.textContent = room.timeSettings?.checkin || '-';
        }

        // 체크아웃 (시스템 데이터)
        const roomCheckout = this.safeSelect('[data-room-checkout]');
        if (roomCheckout) {
            roomCheckout.textContent = room.timeSettings?.checkout || '-';
        }

        // 객실 이용규칙/안내사항 (시스템 데이터)
        const roomGuide = this.safeSelect('[data-room-guide]');
        if (roomGuide) {
            const roomInfo = room.roomInfo || '편안한 휴식 공간';
            roomGuide.innerHTML = this._formatTextWithLineBreaks(roomInfo);
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

        // amenities-list 매핑 (편의시설 섹션)
        const amenitiesIcons = this.safeSelect('[data-room-amenities-icons]');
        if (amenitiesIcons) {
            amenitiesIcons.innerHTML = '';

            // 간단한 아이콘과 텍스트로 표시
            room.amenities.forEach(amenity => {
                const amenityName = amenity.name?.ko || amenity.name || amenity;
                const iconItem = document.createElement('div');
                iconItem.className = 'amenity-icon-item';

                iconItem.innerHTML = `
                    <svg class="amenity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>${amenityName}</span>
                `;

                amenitiesIcons.appendChild(iconItem);
            });
        }

        // 기존 그리드 방식도 유지 (있을 경우)
        const amenitiesGrid = this.safeSelect('[data-room-amenities-grid]');
        if (!amenitiesGrid) {
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

        // 어메니티 아이템들 생성 (기존 방식과 동일)
        room.amenities.forEach(amenity => {
            const amenityDiv = document.createElement('div');
            amenityDiv.className = 'feature-item';

            const amenityName = amenity.name?.ko || amenity.name || amenity;
            const iconPath = amenityIcons[amenityName] || amenityIcons['기본'];

            amenityDiv.innerHTML = `
                <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
                </svg>
                <span class="text-base md:text-lg text-gray-600">${amenityName}</span>
            `;

            amenitiesGrid.appendChild(amenityDiv);
        });
    }

    /**
     * Circular Text 매핑
     */
    mapCircularText() {
        // 숙소 영문명 가져오기 (customFields 우선)
        const propertyNameEn = this.getPropertyNameEn();

        // Hero circular text 매핑
        const heroCircularText = this.safeSelect('[data-hero-circular-property-text]');
        if (heroCircularText) {
            // 텍스트를 3번 반복하여 원 전체에 균등하게 분포
            const repeatedText = `${propertyNameEn.toUpperCase()} • ${propertyNameEn.toUpperCase()} • ${propertyNameEn.toUpperCase()} • `;
            heroCircularText.textContent = repeatedText;
        }

        // 모바일 Hero circular text 매핑
        const heroCircularTextMobile = this.safeSelect('[data-hero-circular-property-text-mobile]');
        if (heroCircularTextMobile) {
            // 텍스트를 3번 반복하여 원 전체에 균등하게 분포
            const repeatedText = `${propertyNameEn.toUpperCase()} • ${propertyNameEn.toUpperCase()} • ${propertyNameEn.toUpperCase()} • `;
            heroCircularTextMobile.textContent = repeatedText;
        }
    }

    /**
     * 객실 배너 이미지 매핑 (thumbnail 0번째)
     */
    mapBanner() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const bannerSection = this.safeSelect('[data-room-banner]');
        if (!bannerSection) return;

        // thumbnail 이미지 가져오기 (customFields 우선)
        const thumbnailImages = this.getRoomImages(room, 'roomtype_thumbnail');
        const firstThumbnail = thumbnailImages[0];
        const isDemo = this.dataSource === 'demo-filled.json';

        // 항상 스타일 적용 (이미지가 없어도 placeholder 표시)
        if (firstThumbnail?.url) {
            bannerSection.style.backgroundImage = `url('${firstThumbnail.url}')`;
            bannerSection.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            bannerSection.style.backgroundImage = `url('./images/room.jpg')`;
            bannerSection.classList.remove('empty-image-placeholder');
        } else {
            bannerSection.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            bannerSection.classList.add('empty-image-placeholder');
        }

        bannerSection.style.backgroundSize = 'cover';
        bannerSection.style.backgroundPosition = 'center';
        bannerSection.style.backgroundRepeat = 'no-repeat';
        bannerSection.style.backgroundAttachment = 'fixed';
        if (window.innerWidth <= 768) {
            bannerSection.style.height = '320px';
        }

        // animate-on-scroll 오버라이드
        bannerSection.style.opacity = '1';
        bannerSection.style.transform = 'none';

        // 또는 visible 클래스 추가
        setTimeout(() => {
            bannerSection.classList.add('visible');
        }, 100);

        // 배너 내 property name 매핑 (customFields 우선)
        const bannerPropertyText = bannerSection.querySelector('[data-property-name-en]');
        if (bannerPropertyText) {
            const propertyNameEn = this.getPropertyNameEn();
            bannerPropertyText.textContent = propertyNameEn;
        }
    }

    /**
     * 외부 갤러리 섹션 매핑 (exterior 이미지 1~6장 자동 그리드)
     */
    mapExteriorGallery() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 갤러리 제목 매핑 (CUSTOM FIELD)
        const galleryTitle = this.safeSelect('[data-room-gallery-title]');
        if (galleryTitle) {
            const roomPageData = this.getCurrentRoomPageData();
            const galleryTitleText = roomPageData?.data?.sections?.[0]?.gallery?.title;
            galleryTitle.innerHTML = this._formatTextWithLineBreaks(galleryTitleText || '객실 갤러리 타이틀');
        }

        // exterior 이미지 가져오기 (customFields 우선)
        const exteriorImages = this.getRoomImages(room, 'roomtype_exterior');

        // 최대 6장만 사용
        const galleryImages = exteriorImages.slice(0, 6);
        const imageCount = galleryImages.length;

        // 갤러리 래퍼 요소 찾기
        const galleryWrapper = this.safeSelect('[data-room-gallery]');
        if (!galleryWrapper) return;

        // 기존 내용 비우기
        galleryWrapper.innerHTML = '';
        const isDemo = this.dataSource === 'demo-filled.json';

        // 이미지가 없으면 플레이스홀더 표시
        if (imageCount === 0) {
            if (isDemo) {
                // 데모 모드: index.html 스타일 갤러리
                const placeholderImages = [
                    './images/exterior.jpg',
                    './images/exterior2.jpg',
                    './images/pool.jpg',
                    './images/pool2.jpg',
                    './images/pool3.jpg',
                    './images/sky.jpg'
                ];

                // 12개 이미지로 무한 스크롤 효과 생성 (6개 이미지를 2번 반복)
                for (let repeat = 0; repeat < 2; repeat++) {
                    placeholderImages.forEach((imgSrc, index) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'gallery-item';

                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = '갤러리 이미지';

                        itemDiv.appendChild(img);
                        galleryWrapper.appendChild(itemDiv);
                    });
                }
            } else {
                // 프로덕션 모드: empty placeholder 1개 생성
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = '이미지 없음';
                img.classList.add('empty-image-placeholder');

                itemDiv.appendChild(img);
                galleryWrapper.appendChild(itemDiv);
            }
        } else {
            // index.html 스타일 갤러리 - 모든 이미지를 직접 배치
            // 모든 이미지를 연속으로 배치 (최대 12개까지 반복하여 부드러운 무한 스크롤)
            const totalImages = Math.min(galleryImages.length, 6);
            const repeatCount = Math.ceil(12 / totalImages); // 최소 12개가 되도록 반복

            for (let repeat = 0; repeat < repeatCount; repeat++) {
                galleryImages.slice(0, totalImages).forEach((image, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'gallery-item';

                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = this.sanitizeText(image.description, this.getRoomName(room) || '갤러리 이미지');
                    img.setAttribute('data-image-fallback', '');

                    itemDiv.appendChild(img);
                    galleryWrapper.appendChild(itemDiv);
                });
            }
        }

        // 연속 슬라이딩 갤러리이므로 추가 애니메이션 불필요
    }

    /**
     * 갤러리 애니메이션 초기화 (연속 슬라이딩에서는 불필요)
     */
    initGalleryAnimations() {
        // 연속 슬라이딩 갤러리에서는 CSS 애니메이션으로 처리되므로 JavaScript 애니메이션 불필요
        return;
    }

    // ============================================================================
    // 🔄 MAIN ENTRY POINT
    // ============================================================================

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

        // 순차적으로 각 섹션 매핑
        this.mapHeroSlider();
        this.mapBasicInfo();
        this.mapRoomInfoSection();
        this.mapRoomDetails();
        this.mapCircularText();
        this.mapRoomAmenities();
        this.mapBanner();
        this.mapExteriorGallery();

        // 메타 태그 업데이트 (페이지별 SEO 적용, customFields 우선)
        const roomNameText = this.getRoomName(room);
        const propertyName = this.getPropertyName();
        const pageSEO = {
            title: `${roomNameText} - ${propertyName}`,
            description: room?.description || this.data.property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (객실 이미지 사용)
        this.updateOGImage(room);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }


    /**
     * OG 이미지 업데이트 (객실 이미지 사용, 없으면 로고)
     * @param {Object} room - 현재 객실 데이터
     */
    updateOGImage(room) {
        if (!this.isDataLoaded || !room) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // customFields에서 thumbnail, interior, exterior 순으로 첫 번째 이미지 찾기
        const imageSources = [
            this.getRoomImages(room, 'roomtype_thumbnail'),
            this.getRoomImages(room, 'roomtype_interior'),
            this.getRoomImages(room, 'roomtype_exterior'),
        ];

        const firstImageArray = imageSources.find(arr => arr.length > 0);
        const imageUrl = firstImageArray?.[0]?.url;

        // 우선순위: 객실 이미지 > 로고 이미지
        if (imageUrl) {
            ogImage.setAttribute('content', imageUrl);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// iframe 내부가 아닌 경우에만 자동 초기화 (preview-handler와 충돌 방지)
if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const roomMapper = new RoomMapper();

        try {
            // 데이터 로드
            await roomMapper.loadData();

            // 페이지 매핑 실행
            await roomMapper.mapPage();
        } catch (error) {
            console.error('RoomMapper initialization error:', error);
        }
    });
}
