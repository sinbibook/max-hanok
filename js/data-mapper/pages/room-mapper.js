/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 페이지 전용 기능 제공
 * URL 파라미터로 ?index=0,1,2...를 받아서 동적으로 객실 정보 표시
 */
class RoomMapper extends BaseDataMapper {
    constructor(data = null) {
        super();
        this.currentRoom = null;
        this.currentRoomIndex = null;
        if (data) {
            this.data = data;
            this.isDataLoaded = true;
        }
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

        // URL에서 room 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id'); // ?id=room-001 형식
        const roomIndex = urlParams.get('index'); // ?index=0 형식 (호환성)

        let room = null;
        let index = -1;

        if (roomId) {
            // ID로 검색 (예: room-001)
            // rooms 배열에서 해당 ID의 객실 찾기
            for (let i = 0; i < this.data.rooms.length; i++) {
                if (this.data.rooms[i].id === roomId) {
                    room = this.data.rooms[i];
                    index = i;
                    break;
                }
            }

            if (!room) {
                return null;
            }
        } else if (roomIndex !== null) {
            // 인덱스로 검색 (레거시 지원)
            index = parseInt(roomIndex, 10);

            if (index < 0 || index >= this.data.rooms.length) {
                return null;
            }

            room = this.data.rooms[index];
        } else {
            return null;
        }

        this.currentRoom = room;
        this.currentRoomIndex = index;
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
        const roomIndex = urlParams.get('index');
        const index = roomIndex ? parseInt(roomIndex, 10) : null;

        if (index !== null && index >= 0 && index < this.data.rooms?.length) {
            this.currentRoomIndex = index;
            return index;
        }

        return null;
    }

    /**
     * Room basic info 매핑 (name, description, capacity, etc.)
     */
    mapRoomBasicInfo() {
        const room = this.getCurrentRoom();
        const roomIndex = this.getCurrentRoomIndex();
        if (!room || roomIndex === null) {
            return;
        }

        // Room name 매핑 (여러 요소에 적용)
        const nameElements = this.safeSelectAll('[data-room-name]');
        nameElements.forEach(element => {
            if (element && room.name) {
                element.textContent = room.name;
            }
        });

        // Room description 매핑 (hero.title 사용)
        const descElement = this.safeSelect('[data-room-description]');
        if (descElement) {
            // homepage.customFields.pages.room 배열에서 현재 room ID와 일치하는 항목 찾기
            const roomPageData = this.safeGet(this.data, 'homepage.customFields.pages.room');
            let heroTitle = '';

            if (Array.isArray(roomPageData)) {
                const currentRoomPage = roomPageData.find(r => r.id === room.id);
                if (currentRoomPage && currentRoomPage.sections && currentRoomPage.sections[0]) {
                    heroTitle = this.safeGet(currentRoomPage.sections[0], 'hero.title') || '';
                }
            }

            // fallback 패턴 적용
            const description = heroTitle || '객실 히어로 타이틀';
            descElement.innerHTML = description.replace(/\n/g, '<br>');
        }

        // 기준 인원
        const baseOccupancyElement = this.safeSelect('[data-room-base-occupancy]');
        if (baseOccupancyElement && room.baseOccupancy) {
            baseOccupancyElement.textContent = `${room.baseOccupancy}명`;
        }

        // 최대 인원
        const maxOccupancyElement = this.safeSelect('[data-room-max-occupancy]');
        if (maxOccupancyElement && room.maxOccupancy) {
            maxOccupancyElement.textContent = `${room.maxOccupancy}명`;
        }

        // 객실 크기
        const sizeElement = this.safeSelect('[data-room-size]');
        if (sizeElement && room.size) {
            sizeElement.textContent = room.size;
        }

        // 침대 타입
        const bedTypeElement = this.safeSelect('[data-room-bed-type]');
        if (bedTypeElement && room.bedTypes && room.bedTypes.length > 0) {
            bedTypeElement.textContent = room.bedTypes[0];
        }

        // 객실 타입
        const roomTypeElement = this.safeSelect('[data-room-type]');
        if (roomTypeElement && room.roomType) {
            roomTypeElement.textContent = room.roomType;
        } else if (roomTypeElement) {
            roomTypeElement.textContent = '프라이빗한 독채펜션';
        }

        // 객실 이용안내 (roomInfo) - 개행 처리
        const roomInfoElement = this.safeSelect('[data-room-info]');
        if (roomInfoElement && room.roomInfo) {
            const lines = room.roomInfo.split('\n').filter(line => line.trim());
            const htmlContent = lines.map(line => `<p class="ko-body">${line.trim()}</p>`).join('');
            roomInfoElement.innerHTML = htmlContent;
        }
    }

    /**
     * Room images 매핑
     */
    mapRoomImages() {
        const room = this.getCurrentRoom();
        if (!room || !room.images || room.images.length === 0) {
            return;
        }

        // Extract all images from the categorized structure
        const allImages = [];
        const roomImagesData = room.images[0]; // First element contains the categories

        // Hero 이미지 (썸네일 우선 사용)
        const heroImageElement = this.safeSelect('[data-room-hero-image]');
        let heroImage = null;

        if (roomImagesData && roomImagesData.thumbnail && roomImagesData.thumbnail.length > 0) {
            // 선택된 이미지 필터링 및 정렬
            const selectedThumbnails = roomImagesData.thumbnail
                .filter(img => img.isSelected === true && img.url)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            if (selectedThumbnails.length > 0) {
                heroImage = selectedThumbnails[0];
            }
        }

        if (heroImageElement && heroImage && heroImage.url) {
            heroImageElement.onerror = () => {
                heroImageElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23d1d5db" width="800" height="600"/%3E%3C/svg%3E';
            };

            heroImageElement.src = heroImage.url;
            heroImageElement.alt = heroImage.description || room.name;
            heroImageElement.classList.remove('empty-image-placeholder');
        }

        if (roomImagesData) {
            // Add interior images
            if (roomImagesData.interior && roomImagesData.interior.length > 0) {
                allImages.push(...roomImagesData.interior);
            }
            // Add exterior images
            if (roomImagesData.exterior && roomImagesData.exterior.length > 0) {
                allImages.push(...roomImagesData.exterior);
            }
            // Add surrounding images
            if (roomImagesData.surrounding && roomImagesData.surrounding.length > 0) {
                allImages.push(...roomImagesData.surrounding);
            }
            // Add common area images
            if (roomImagesData.commonArea && roomImagesData.commonArea.length > 0) {
                allImages.push(...roomImagesData.commonArea);
            }
            // Add thumbnail
            if (roomImagesData.thumbnail && roomImagesData.thumbnail.length > 0) {
                allImages.push(...roomImagesData.thumbnail);
            }
        }

        // Wave 배경 이미지 매핑 (외경 이미지[0] 사용)
        this.mapWaveBackground();

        // 슬라이더 이미지 매핑
        this.mapSliderImages();
    }

    /**
     * Slider images 매핑
     */
    mapSliderImages() {
        const room = this.getCurrentRoom();
        if (!room || !room.images || room.images.length === 0) {
            return;
        }

        // Extract all images from the categorized structure
        const allImages = [];
        const roomImagesData = room.images[0]; // First element contains the categories

        if (roomImagesData) {
            // Add interior images
            if (roomImagesData.interior && roomImagesData.interior.length > 0) {
                allImages.push(...roomImagesData.interior);
            }
            // Add exterior images
            if (roomImagesData.exterior && roomImagesData.exterior.length > 0) {
                allImages.push(...roomImagesData.exterior);
            }
            // Add surrounding images
            if (roomImagesData.surrounding && roomImagesData.surrounding.length > 0) {
                allImages.push(...roomImagesData.surrounding);
            }
            // Add common area images
            if (roomImagesData.commonArea && roomImagesData.commonArea.length > 0) {
                allImages.push(...roomImagesData.commonArea);
            }
        }

        // 선택된 이미지만 필터링 및 정렬
        const validImages = allImages
            .filter(img => img && img.url && img.url.trim() !== '' && img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        if (window.roomSlider) {
            if (validImages.length > 0) {
                window.roomSlider.loadImages(validImages);
            } else {
                window.roomSlider.initializeFallback();
            }
        }

        // 메인 슬라이더 이미지
        const mainSliderElement = this.safeSelect('[data-room-slider-main]');
        if (mainSliderElement) {
            if (validImages.length > 0 && validImages[0] && validImages[0].url.trim() !== '') {
                mainSliderElement.src = validImages[0].url;
                mainSliderElement.alt = validImages[0].description || room.name;
                mainSliderElement.classList.remove('empty-image-placeholder');
            } else {
                mainSliderElement.src = '';
                mainSliderElement.alt = '이미지 없음';
                mainSliderElement.classList.add('empty-image-placeholder');
            }
        }

        // 썸네일 이미지들
        for (let i = 0; i < 3; i++) {
            const thumbElement = this.safeSelect(`[data-room-slider-thumb-${i}]`);
            if (thumbElement) {
                const image = allImages[i] || allImages[0]; // 이미지가 부족하면 첫 번째 이미지 재사용
                thumbElement.src = image.url;
                thumbElement.alt = image.description || `${room.name} 썸네일 ${i + 1}`;
            }
        }

    }

    /**
     * Wave 배경 이미지 매핑 (객실외관이미지[0] → 없으면 객실내부이미지[맨마지막])
     */
    mapWaveBackground() {
        const room = this.getCurrentRoom();
        if (!room) {
            return;
        }

        let backgroundImage = null;

        // 1순위: room의 외관 이미지 (선택된 것 중 첫 번째)
        if (room.images && room.images.length > 0) {
            const roomImagesData = room.images[0];
            if (roomImagesData && roomImagesData.exterior && roomImagesData.exterior.length > 0) {
                const selectedExterior = roomImagesData.exterior
                    .filter(img => img.isSelected === true && img.url)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                if (selectedExterior.length > 0) {
                    backgroundImage = selectedExterior[0];
                }
            }
        }

        // 2순위: room의 내부 이미지 (선택된 것 중 마지막)
        if (!backgroundImage && room.images && room.images.length > 0) {
            const roomImagesData = room.images[0];
            if (roomImagesData && roomImagesData.interior && roomImagesData.interior.length > 0) {
                const selectedInterior = roomImagesData.interior
                    .filter(img => img.isSelected === true && img.url)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                if (selectedInterior.length > 0) {
                    backgroundImage = selectedInterior[selectedInterior.length - 1]; // 마지막
                }
            }
        }

        // 3순위: property의 외경 이미지 (선택된 것 중 첫 번째)
        if (!backgroundImage && this.data && this.data.property && this.data.property.images) {
            for (const imageGroup of this.data.property.images) {
                if (imageGroup.exterior && imageGroup.exterior.length > 0) {
                    const selectedPropertyExterior = imageGroup.exterior
                        .filter(img => img.isSelected === true && img.url)
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                    if (selectedPropertyExterior.length > 0) {
                        backgroundImage = selectedPropertyExterior[0];
                        break;
                    }
                }
            }
        }

        const waveBackgroundElement = this.safeSelect('[data-room-wave-background]');

        if (waveBackgroundElement) {
            if (backgroundImage && backgroundImage.url) {
                // CSS background-image 스타일 업데이트
                const currentStyle = waveBackgroundElement.getAttribute('style') || '';
                const newStyle = currentStyle.replace(
                    /background-image:\s*url\([^)]*\)/,
                    `background-image: url('${backgroundImage.url}')`
                );
                waveBackgroundElement.setAttribute('style', newStyle);
                waveBackgroundElement.classList.remove('empty-image-placeholder');

            } else {
                // 이미지가 없을 때 placeholder 처리
                const currentStyle = waveBackgroundElement.getAttribute('style') || '';
                const newStyle = currentStyle.replace(
                    /background-image:\s*url\([^)]*\)/,
                    'background-image: none'
                );
                waveBackgroundElement.setAttribute('style', newStyle);
                waveBackgroundElement.classList.add('empty-image-placeholder');

            }
        }
    }

    /**
     * Room amenities 매핑
     */
    mapRoomAmenities() {
        const room = this.getCurrentRoom();
        if (!room || !room.amenities || room.amenities.length === 0) {
            return;
        }

        const amenitiesElement = this.safeSelect('[data-room-amenities]');
        if (amenitiesElement) {
            // 기존 내용 클리어
            amenitiesElement.innerHTML = '';

            // 편의시설 목록 생성 (grid 형태로)
            room.amenities.forEach(amenity => {
                const amenityDiv = document.createElement('div');
                amenityDiv.className = 'flex items-center space-x-2';

                const dot = document.createElement('div');
                dot.className = 'w-2 h-2 bg-gray-400 rounded-full';

                const span = document.createElement('span');
                span.className = 'text-gray-700 ko-body';
                span.textContent = amenity.name || amenity;

                amenityDiv.appendChild(dot);
                amenityDiv.appendChild(span);
                amenitiesElement.appendChild(amenityDiv);
            });
        }

    }

    /**
     * Room structure 매핑 (객실 구성)
     */
    mapRoomStructure() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const structureElement = this.safeSelect('[data-room-structure]');
        if (structureElement && room.totalRoomCount) {
            const { bedroom, bathroom, livingRoom } = room.totalRoomCount;
            let structureText = '';

            if (bedroom) structureText += `침실 ${bedroom}개`;
            if (bathroom) structureText += `${structureText ? ', ' : ''}화장실 ${bathroom}개`;
            if (livingRoom) structureText += `${structureText ? ', ' : ''}거실 ${livingRoom}개`;

            structureElement.textContent = structureText || '정보 없음';
        }

    }

    /**
     * Property info 매핑 (체크인/체크아웃 정보)
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded || !this.data?.property) {
            return;
        }

        const property = this.data.property;

        // 체크인 시간
        const checkinElement = this.safeSelect('[data-property-checkin]');
        if (checkinElement && property.checkin) {
            checkinElement.textContent = property.checkin.slice(0, 5); // HH:MM 형태로
        }

        // 체크아웃 시간
        const checkoutElement = this.safeSelect('[data-property-checkout]');
        if (checkoutElement && property.checkout) {
            checkoutElement.textContent = property.checkout.slice(0, 5); // HH:MM 형태로
        }

        // 체크인/체크아웃 안내
        const checkinInfoElement = this.safeSelect('[data-property-checkin-checkout-info]');
        if (checkinInfoElement && property.checkInOutInfo) {
            checkinInfoElement.innerHTML = property.checkInOutInfo.replace(/\n/g, '<br>');
        }

    }

    /**
     * SEO 정보 및 Favicon 업데이트
     */
    updateSEO() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 페이지 제목 업데이트
        document.title = `${room.name} - ${this.data.property.name}`;

        // Meta description 업데이트
        const metaDesc = this.safeSelect('meta[name="description"]');
        if (metaDesc && room.description) {
            metaDesc.setAttribute('content', `${room.name} - ${room.description}`);
        }

        // Favicon 업데이트 (homepage.images[0].logo에서 isSelected: true인 항목)
        if (this.data && this.data.homepage && this.data.homepage.images && this.data.homepage.images[0] && this.data.homepage.images[0].logo) {
            const selectedLogo = this.data.homepage.images[0].logo.find(logo => logo.isSelected === true);
            if (selectedLogo && selectedLogo.url) {
                const faviconElement = document.querySelector('[data-homepage-favicon]');
                if (faviconElement) {
                    faviconElement.href = selectedLogo.url;
                }
            }
        }
    }

    /**
     * 전체 페이지 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // 현재 객실 정보 확인
        const room = this.getCurrentRoom();
        if (!room) {
            return;
        }

        // 순차적으로 매핑 실행
        this.mapRoomBasicInfo();
        this.mapRoomImages();
        this.mapRoomAmenities();
        this.mapRoomStructure();
        this.mapPropertyInfo();
        this.updateSEO();

    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomMapper;
} else {
    // 브라우저 환경에서 전역 객체에 노출
    window.RoomMapper = RoomMapper;
}