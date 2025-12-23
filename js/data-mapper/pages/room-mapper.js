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
     * 혼합 언어 텍스트를 언어별로 다른 폰트를 적용하여 렌더링 (XSS 방지)
     * @param {string} text - 처리할 텍스트
     * @returns {string} - 언어별 span으로 감싸진 HTML (개행 포함, XSS 안전)
     */
    renderMixedLanguageText(text) {
        if (!text) return '';

        // 1. XSS 방지를 위해 텍스트를 이스케이프 처리합니다.
        const tempDiv = document.createElement('div');
        tempDiv.textContent = text;
        const escapedText = tempDiv.innerHTML;

        // 2. 이스케이프된 텍스트에서 개행 문자를 <br> 태그로 변환합니다.
        const textWithBreaks = escapedText.replace(/\n/g, '<br>');

        // 3. <br> 태그를 기준으로 분리하고, 각 세그먼트를 처리한 후 다시 합칩니다.
        const segments = textWithBreaks.split(/(<br>)/i);

        const processedSegments = segments.map(segment => {
            if (segment.toLowerCase() === '<br>') {
                return segment; // <br> 태그는 그대로 유지
            }
            // 정규식을 사용하여 한글과 그 외 문자(공백 포함)를 분리합니다.
            const langSegments = segment.match(/([ㄱ-ㅎㅏ-ㅣ가-힣]+)|([^ㄱ-ㅎㅏ-ㅣ가-힣]+)/g) || [];
            return langSegments.map(langSegment => {
                if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(langSegment)) {
                    return `<span class="ko-title">${langSegment}</span>`;
                } else {
                    return `<span class="en-title">${langSegment}</span>`;
                }
            }).join('');
        });

        return processedSegments.join('');
    }

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

            // fallback 패턴 적용 및 혼합 언어 처리 (개행 포함)
            const description = heroTitle || '객실 히어로 타이틀';
            const renderedDescription = this.renderMixedLanguageText(description);
            descElement.innerHTML = renderedDescription;
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
            const selectedThumbnails = window.ImageHelpers.getSelectedImages(roomImagesData.thumbnail);

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

        // 갤러리 이미지 매핑 (Section 4)
        this.mapGalleryImages();
    }

    /**
     * Gallery images 매핑 (Section 4 - 최대 4개 이미지 동적 생성)
     */
    mapGalleryImages() {
        const room = this.getCurrentRoom();
        if (!room || !room.images || room.images.length === 0) {
            return;
        }

        const roomImagesData = room.images[0];
        const galleryImages = [];

        // 외부 이미지에서 선택된 이미지 수집 (최대 4개)
        if (roomImagesData && roomImagesData.exterior && roomImagesData.exterior.length > 0) {
            const selectedExterior = window.ImageHelpers.getSelectedImages(roomImagesData.exterior)
                .slice(0, 4); // 최대 4개
            galleryImages.push(...selectedExterior);
        }

        // 갤러리 컨테이너 찾기
        const galleryContainer = this.safeSelect('#room-gallery-container');
        if (!galleryContainer) {
            return;
        }

        // 기존 내용 지우기
        galleryContainer.innerHTML = '';

        // 동적으로 갤러리 아이템 생성
        const maxImages = galleryImages.length;
        for (let i = 0; i < maxImages; i++) {
            const image = galleryImages[i];
            const isEven = i % 2 === 1; // 두 번째, 네 번째 아이템 (홀수 인덱스)인 경우

            // 혼합 언어 텍스트 처리
            const description = image.description || 'Image Description';
            const renderedDescription = this.renderMixedLanguageText(description);

            // 갤러리 아이템 div 생성
            const galleryItem = document.createElement('div');
            galleryItem.className = `flex fade-in-up gallery-item${i === 0 ? ' gallery-item-first' : ''}`;
            galleryItem.style.animationDelay = `${i * 0.1}s`;

            if (isEven) {
                // 왼쪽 이미지, 오른쪽 텍스트
                const imageContainer = document.createElement('div');
                imageContainer.className = 'w-full md:w-3/5 p-4 md:p-6 gallery-item-text-container';

                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'aspect-[16/9] overflow-hidden rounded-lg';

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.description || `${room.name} View ${i + 1}`;
                img.className = 'w-full h-full object-cover transition-transform duration-300 hover:scale-105';
                img.setAttribute('data-room-exterior-image-' + i, '');

                imageWrapper.appendChild(img);
                imageContainer.appendChild(imageWrapper);

                const textContainer = document.createElement('div');
                textContainer.className = 'hidden md:flex w-2/5 items-center justify-center p-6';

                const h4 = document.createElement('h4');
                h4.className = 'text-2xl font-semibold';
                h4.style.color = 'var(--color-secondary)';
                h4.setAttribute('data-room-exterior-description-' + i, '');
                h4.innerHTML = renderedDescription;

                textContainer.appendChild(h4);

                galleryItem.appendChild(imageContainer);
                galleryItem.appendChild(textContainer);
            } else {
                // 오른쪽 이미지, 왼쪽 텍스트
                const textContainer = document.createElement('div');
                textContainer.className = 'hidden md:flex w-2/5 items-center justify-center p-6 gallery-item-text-container';

                const h4 = document.createElement('h4');
                h4.className = 'text-2xl font-semibold';
                h4.style.color = 'var(--color-secondary)';
                h4.setAttribute('data-room-exterior-description-' + i, '');
                h4.innerHTML = renderedDescription;

                textContainer.appendChild(h4);

                const imageContainer = document.createElement('div');
                imageContainer.className = 'w-full md:w-3/5 p-4 md:p-6';

                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'aspect-[16/9] overflow-hidden rounded-lg';

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.description || `${room.name} View ${i + 1}`;
                img.className = 'w-full h-full object-cover transition-transform duration-300 hover:scale-105';
                img.setAttribute('data-room-exterior-image-' + i, '');

                imageWrapper.appendChild(img);
                imageContainer.appendChild(imageWrapper);

                galleryItem.appendChild(textContainer);
                galleryItem.appendChild(imageContainer);
            }

            galleryContainer.appendChild(galleryItem);
        }

        // 이미지가 없는 경우 2개의 placeholder 처리
        if (maxImages === 0) {
            // 첫 번째 placeholder 아이템 (오른쪽 이미지, 왼쪽 텍스트)
            const placeholderItem1 = document.createElement('div');
            placeholderItem1.className = 'flex fade-in-up gallery-item gallery-item-first';
            placeholderItem1.style.animationDelay = '0s';

            const textContainer1 = document.createElement('div');
            textContainer1.className = 'hidden md:flex w-2/5 items-center justify-center p-6 gallery-item-text-container';

            const h4_1 = document.createElement('h4');
            h4_1.className = 'text-2xl font-semibold ko-title';
            h4_1.style.color = 'var(--color-secondary)';
            h4_1.setAttribute('data-room-exterior-description-0', '');
            h4_1.textContent = '이미지 설명';

            textContainer1.appendChild(h4_1);

            const imageContainer1 = document.createElement('div');
            imageContainer1.className = 'w-full md:w-3/5 p-4 md:p-6';

            const imageWrapper1 = document.createElement('div');
            imageWrapper1.className = 'aspect-[16/9] overflow-hidden rounded-lg relative empty-image-placeholder';
            imageWrapper1.style.background = '#d1d5db';

            const img1 = document.createElement('img');
            img1.src = '';
            img1.alt = `${room.name} View 1`;
            img1.className = 'w-full h-full object-cover';
            img1.style.opacity = '0';
            img1.setAttribute('data-room-exterior-image-0', '');

            imageWrapper1.appendChild(img1);
            imageContainer1.appendChild(imageWrapper1);

            placeholderItem1.appendChild(textContainer1);
            placeholderItem1.appendChild(imageContainer1);

            galleryContainer.appendChild(placeholderItem1);

            // 두 번째 placeholder 아이템 (왼쪽 이미지, 오른쪽 텍스트)
            const placeholderItem2 = document.createElement('div');
            placeholderItem2.className = 'flex fade-in-up gallery-item';
            placeholderItem2.style.animationDelay = '0.1s';

            const imageContainer2 = document.createElement('div');
            imageContainer2.className = 'w-full md:w-3/5 p-4 md:p-6 gallery-item-text-container';

            const imageWrapper2 = document.createElement('div');
            imageWrapper2.className = 'aspect-[16/9] overflow-hidden rounded-lg relative empty-image-placeholder';
            imageWrapper2.style.background = '#d1d5db';

            const img2 = document.createElement('img');
            img2.src = '';
            img2.alt = `${room.name} View 2`;
            img2.className = 'w-full h-full object-cover';
            img2.style.opacity = '0';
            img2.setAttribute('data-room-exterior-image-1', '');

            imageWrapper2.appendChild(img2);
            imageContainer2.appendChild(imageWrapper2);

            const textContainer2 = document.createElement('div');
            textContainer2.className = 'hidden md:flex w-2/5 items-center justify-center p-6';

            const h4_2 = document.createElement('h4');
            h4_2.className = 'text-2xl font-semibold ko-title';
            h4_2.style.color = 'var(--color-secondary)';
            h4_2.setAttribute('data-room-exterior-description-1', '');
            h4_2.textContent = 'Image Description';

            textContainer2.appendChild(h4_2);

            placeholderItem2.appendChild(imageContainer2);
            placeholderItem2.appendChild(textContainer2);

            galleryContainer.appendChild(placeholderItem2);
        }
    }

    /**
     * Slider images 매핑
     */
    mapSliderImages() {
        const room = this.getCurrentRoom();
        if (!room || !room.images || room.images.length === 0) {
            return;
        }

        // Extract only interior images from the categorized structure
        const interiorImages = [];
        const roomImagesData = room.images[0]; // First element contains the categories

        if (roomImagesData && roomImagesData.interior && roomImagesData.interior.length > 0) {
            // Add only interior images
            interiorImages.push(...roomImagesData.interior);
        }

        // 선택된 이미지만 필터링 및 정렬
        const validImages = window.ImageHelpers.getSelectedImages(interiorImages);

        if (window.roomSlider) {
            if (validImages.length > 0) {
                window.roomSlider.loadImages(validImages);
            } else {
                window.roomSlider.showPlaceholder();
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

        // 썸네일 이미지들 (isSelected 필터 적용된 interior 이미지만 사용)
        for (let i = 0; i < 3; i++) {
            const thumbElement = this.safeSelect(`[data-room-slider-thumb-${i}]`);
            if (thumbElement) {
                const image = validImages[i] || validImages[0];
                if (image) {
                    thumbElement.src = image.url;
                    thumbElement.alt = image.description || `${room.name} 썸네일 ${i + 1}`;
                    thumbElement.classList.remove('empty-image-placeholder');
                } else {
                    // 선택된 이미지가 없는 경우
                    thumbElement.src = '';
                    thumbElement.alt = '이미지 없음';
                    thumbElement.classList.add('empty-image-placeholder');
                }
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
                const selectedExterior = window.ImageHelpers.getSelectedImages(roomImagesData.exterior);
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

            // 편의시설 목록 생성 (한 줄에 3개씩, room-info와 같은 높이)
            const amenitiesContainer = document.createElement('div');
            amenitiesContainer.className = 'max-h-80 overflow-y-auto space-y-0';

            const itemsPerRow = 3; // 3개씩 배치

            for (let i = 0; i < room.amenities.length; i += itemsPerRow) {
                const rowDiv = document.createElement('div');
                const isLastRow = i + itemsPerRow >= room.amenities.length;
                rowDiv.className = `flex justify-between items-center py-3 ${!isLastRow ? 'border-b border-gray-100' : ''}`;

                const rowAmenities = room.amenities.slice(i, i + itemsPerRow);

                rowAmenities.forEach((amenity) => {
                    const amenityDiv = document.createElement('div');
                    amenityDiv.className = 'flex items-center space-x-1 flex-1';

                    const checkIcon = document.createElement('span');
                    checkIcon.className = 'text-sm font-medium flex-shrink-0';
                    checkIcon.style.color = 'var(--color-secondary)';
                    checkIcon.textContent = '✓';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'text-sm text-gray-600 ko-body truncate';
                    nameSpan.textContent = amenity.name || amenity;

                    amenityDiv.appendChild(checkIcon);
                    amenityDiv.appendChild(nameSpan);
                    rowDiv.appendChild(amenityDiv);
                });

                amenitiesContainer.appendChild(rowDiv);
            }

            amenitiesElement.appendChild(amenitiesContainer);
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