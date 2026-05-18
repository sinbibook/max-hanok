/**
 * Room List Page Data Mapper
 * room-list.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 목록 페이지 전용 기능 제공
 * URL 파라미터로 ?group=그룹명을 받아서 해당 그룹 객실만 필터링
 */
class RoomListMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentGroup = null;
        this.filteredRooms = [];
    }

    // ============================================================================
    // 🏠 ROOM LIST PAGE MAPPINGS
    // ============================================================================

    /**
     * URL에서 group 파라미터 추출
     */
    getCurrentGroup() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('group');
    }

    /**
     * 그룹별로 객실 필터링
     */
    filterRoomsByGroup() {
        if (!this.isDataLoaded || !this.data.rooms) {
            console.error('Data not loaded or no rooms data available');
            return [];
        }

        this.currentGroup = this.getCurrentGroup();

        // group 파라미터가 없으면 전체 객실 반환
        if (!this.currentGroup) {
            this.filteredRooms = this.data.rooms;
            return this.filteredRooms;
        }

        // 해당 그룹의 객실만 필터링
        this.filteredRooms = this.data.rooms.filter(room => room.group === this.currentGroup);

        if (this.filteredRooms.length === 0) {
            console.warn(`No rooms found for group: ${this.currentGroup}`);
        }

        return this.filteredRooms;
    }

    /**
     * Hero 섹션 매핑
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        // 그룹별 객실 필터링
        this.filterRoomsByGroup();

        // Hero 텍스트 매핑 (property name)
        this.mapHeroText();

        // Hero 슬라이더 이미지 매핑
        this.mapHeroSlider();
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
     * Hero 슬라이더 이미지 매핑
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        // 그룹별 필터링된 객실들의 이미지 사용
        let images = [];

        if (this.filteredRooms && this.filteredRooms.length > 0) {
            // 필터링된 객실들의 exterior 이미지 수집
            this.filteredRooms.forEach((room, roomIndex) => {
                const selectedImages = this.getRoomImages(room, 'roomtype_exterior');
                selectedImages.forEach((img, imgIndex) => {
                    images.push({
                        url: img.url,
                        description: img.description || `${room.name} - 이미지`,
                        roomIndex: roomIndex
                    });
                });
            });
        }

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
                slide.innerHTML = `<img src="${img.url}" alt="${img.description}" loading="lazy">`;
                heroSlider.appendChild(slide);
            });
        }

        // 슬라이더 초기화
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider(true); // skipDelay=true
        }
    }

    /**
     * Title 섹션 매핑
     */
    mapTitleSection() {
        if (!this.isDataLoaded) return;

        // Main Title에 그룹명 매핑
        const mainTitle = this.safeSelect('[data-customfield-room-list-main-title]');
        if (mainTitle) {
            const currentGroup = this.getCurrentGroup();
            if (currentGroup) {
                // 그룹 파라미터가 있으면 그룹명 표시
                mainTitle.textContent = currentGroup;
            } else {
                // 그룹 파라미터가 없으면 "전체 객실" 표시
                mainTitle.textContent = '전체 객실';
            }
        }
    }

    /**
     * 객실 그리드 동적 생성
     */
    mapRoomGrid() {
        if (!this.isDataLoaded) return;

        const roomGrid = document.getElementById('room-grid');
        if (!roomGrid) return;

        // 그룹별로 필터링된 객실 가져오기
        const rooms = this.filterRoomsByGroup();

        if (rooms.length === 0) {
            roomGrid.innerHTML = '<p style="text-align: center; padding: 50px;">해당 그룹의 객실이 없습니다.</p>';
            return;
        }

        // 기존 콘텐츠 초기화
        roomGrid.innerHTML = '';

        // 각 객실 카드 생성
        rooms.forEach((room, index) => {
            const roomCard = this.createRoomCard(room, index);
            roomGrid.appendChild(roomCard);
        });
    }

    /**
     * 객실 카드 생성
     */
    createRoomCard(room, index) {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';

        // 객실명 가져오기 (customFields 우선)
        const roomName = this.getRoomName(room);

        // 객실 이미지 가져오기 (customFields 우선)
        const sortedImages = this.getRoomImages(room, 'roomtype_thumbnail');
        const firstThumbnail = sortedImages[0];

        let imageUrl, imageClass;
        if (firstThumbnail?.url) {
            imageUrl = firstThumbnail.url;
            imageClass = '';
        } else {
            imageUrl = ImageHelpers.EMPTY_IMAGE_SVG;
            imageClass = 'empty-image-placeholder';
        }

        // 객실 타입 (bedTypes 또는 roomStructures 사용)
        const roomType = room.bedTypes?.join(', ') || '-';

        // 객실 구성 (roomStructures 배열을 문자열로 변환)
        const roomFacilities = room.roomStructures?.join(', ') || '-';

        roomCard.innerHTML = `
            <div class="room-card-image" onclick="selectRoom('${room.id}')" style="cursor: pointer;">
                <img alt="${roomName}" loading="lazy">
                <button class="room-btn" onclick="selectRoom('${room.id}')">
                    <span class="btn-text">VIEW ROOM</span>
                    <svg class="arrow-icon" viewBox="0 0 24 24">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7,7 17,7 17,17"></polyline>
                    </svg>
                </button>
            </div>
            <div class="room-card-content">
                <div class="room-header">
                    <h3 class="room-title">${roomName}</h3>
                </div>
                <div class="overlay-info">
                    <div class="info-row">
                        <span class="info-label">객실 면적</span>
                        <span class="info-value">${room.size || '-'}m²</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">객실 타입</span>
                        <span class="info-value">${roomType}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">객실 인원</span>
                        <span class="info-value">기준 ${room.baseOccupancy || '-'}명 / 최대 ${room.maxOccupancy || '-'}명</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">객실 구성</span>
                        <span class="info-value">${roomFacilities}</span>
                    </div>
                </div>
            </div>
        `;

        // 이미지 src와 class를 DOM API로 설정 (data URI 파싱 문제 방지)
        const imgElement = roomCard.querySelector('.room-card-image img');
        if (imgElement) {
            imgElement.src = imageUrl;
            if (imageClass) {
                imgElement.classList.add(imageClass);
            }
        }

        // 애니메이션을 위한 지연시간 추가
        roomCard.style.transitionDelay = `${index * 0.1}s`;

        return roomCard;
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

        // 페이지 인덱스 2 (room-list) - 순환 선택
        const pageIndex = 2;
        const selectedImage = exteriorImages.length > 0 ?
            exteriorImages[pageIndex % exteriorImages.length] : null;

        // 배경 이미지 매핑 (데스크탑 parallax)
        const img = this.safeSelect('[data-closing-image]');
        if (img) {
            if (selectedImage?.url) {
                img.src = selectedImage.url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
                img.alt = 'No Image Available';
            }
        }

        // 모바일 이미지 매핑 (원형 구멍 안)
        const mobileImg = this.safeSelect('[data-closing-image-mobile]');
        if (mobileImg) {
            if (selectedImage?.url) {
                mobileImg.src = selectedImage.url;
                mobileImg.classList.remove('empty-image-placeholder');
            } else {
                mobileImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
                mobileImg.classList.add('empty-image-placeholder');
                mobileImg.alt = 'No Image Available';
            }
        }

        // 클로징 섹션 숙소명 매핑
        const propertyNameEn = this.safeSelect('.closing-property-name-en[data-property-name-en]');
        if (propertyNameEn && this.data.property) {
            propertyNameEn.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * Room List 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map room list page: data not loaded');
            return;
        }

        // Room List 페이지 섹션들 순차 매핑
        this.mapHeroSection();
        this.mapTitleSection();
        this.mapRoomGrid();
        this.updateMetaTags();

        // Scroll 애니메이션 재초기화
        if (typeof window.handleScrollAnimation === 'function') {
            setTimeout(() => {
                window.handleScrollAnimation();
            }, 100);
        }

        // 클로징 섹션 매핑
        this.mapClosingSection();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomListMapper;
} else {
    window.RoomListMapper = RoomListMapper;
}

// 자동 초기화 및 window.baseMapper 등록
(function() {
    'use strict';

    // 페이지 로드 완료 후 매퍼 초기화
    function initMapper() {
        // PreviewHandler가 이미 존재하면 초기화하지 않음 (PreviewHandler가 처리)
        if (window.previewHandler) {
            return;
        }

        // 일반 초기화 (JSON 파일 로드)
        const mapper = new RoomListMapper();
        window.baseMapper = mapper;
        mapper.initialize();
    }

    // DOMContentLoaded 이후에 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapper);
    } else {
        initMapper();
    }
})();
