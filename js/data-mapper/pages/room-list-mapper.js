/**
 * Room List Page Data Mapper
 * room-list.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 목록 페이지 전용 기능 제공
 * 모든 객실을 표시 (그룹 필터링 제거)
 */
class RoomListMapper extends BaseDataMapper {
    constructor() {
        super();
        this.filteredRooms = [];
    }

    // ============================================================================
    // 🏠 ROOM LIST PAGE MAPPINGS
    // ============================================================================

    /**
     * 모든 객실 반환 (그룹 필터링 제거)
     */
    filterRoomsByGroup() {
        if (!this.isDataLoaded || !this.data.rooms) {
            console.error('Data not loaded or no rooms data available');
            return [];
        }

        // 항상 모든 객실 반환
        this.filteredRooms = this.data.rooms;
        return this.filteredRooms;
    }

    /**
     * Hero 섹션 매핑
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        // Hero 제목 매핑 - 항상 "ALL ROOMS" 표시
        const heroTitle = this.safeSelect('[data-customfield-room-list-hero-title]');
        if (heroTitle) {
            heroTitle.textContent = 'ALL ROOMS';
        }

        // Hero 이미지 매핑
        this.mapHeroImage();
    }

    /**
     * Hero 이미지 매핑 (기본값 유지 - JSON에 roomList 페이지 데이터 없음)
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        const heroImageElement = this.safeSelect('[data-customfield-room-list-hero-image-0]');
        if (!heroImageElement) return;

        // 첫 번째 객실의 exterior 이미지 사용 (isSelected 필터링 + sortOrder 정렬)
        if (this.data.rooms && this.data.rooms.length > 0) {
            const firstRoom = this.data.rooms[0];
            const exteriorImages = firstRoom.images?.[0]?.exterior || [];

            // isSelected: true인 이미지만 필터링 + sortOrder 정렬
            const selectedImages = exteriorImages
                .filter(img => img.isSelected)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            const firstExterior = selectedImages[0];

            if (firstExterior?.url) {
                heroImageElement.src = firstExterior.url;
                heroImageElement.alt = firstExterior.description || '객실 외부';
                heroImageElement.loading = 'eager';
                heroImageElement.classList.remove('empty-image-placeholder');
            } else {
                heroImageElement.src = ImageHelpers.EMPTY_IMAGE_SVG;
                heroImageElement.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * Title 섹션 매핑
     */
    mapTitleSection() {
        if (!this.isDataLoaded) return;

        // Main Title - 항상 "ALL ROOMS" 표시
        const mainTitle = this.safeSelect('[data-customfield-room-list-main-title]');
        if (mainTitle) {
            mainTitle.textContent = 'ALL ROOMS';
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

        // 객실 이미지 가져오기 (images[0].thumbnail 배열에서)
        const thumbnails = room.images?.[0]?.thumbnail || [];
        const sortedImages = thumbnails
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const imageUrl = sortedImages[0]?.url || ImageHelpers.EMPTY_IMAGE_SVG;
        const imageClass = sortedImages[0]?.url ? '' : ' empty-image-placeholder';

        // 객실 타입 (bedTypes 또는 roomStructures 사용)
        const roomType = room.bedTypes?.join(', ') || '-';

        // 객실 구성 (roomStructures 배열을 문자열로 변환)
        const roomFacilities = room.roomStructures?.join(', ') || '-';

        roomCard.innerHTML = `
            <div class="room-card-image" onclick="selectRoom('${room.id}')" style="cursor: pointer;">
                <img src="${imageUrl}" alt="${room.name}" loading="lazy" class="${imageClass}">
                <div class="room-overlay">
                    <div class="overlay-content">
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
                </div>
            </div>
            <div class="room-card-content">
                <div class="room-header">
                    <h3 class="room-title">${room.name}</h3>
                    <button class="room-btn" onclick="selectRoom('${room.id}')">
                        <span class="btn-text">VIEW</span>
                        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7,7 17,7 17,17"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="room-info">
                    <div class="room-info-item">
                        <span class="room-info-label">인원</span>
                        <span class="room-info-value">기준 ${room.baseOccupancy || '-'}명 / 최대 ${room.maxOccupancy || '-'}명</span>
                    </div>
                    <div class="room-info-item">
                        <span class="room-info-label">넓이</span>
                        <span class="info-value">${room.size || '-'}m²</span>
                    </div>
                </div>
            </div>
        `;

        // 애니메이션을 위한 지연시간 추가
        roomCard.style.transitionDelay = `${index * 0.1}s`;

        return roomCard;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

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
            console.log('✅ PreviewHandler detected, skipping auto-initialization');
            return;
        }

        // 일반 초기화 (JSON 파일 로드)
        const mapper = new RoomListMapper();
        window.baseMapper = mapper;
        mapper.initialize();
        console.log('✅ RoomListMapper initialized');
    }

    // DOMContentLoaded 이후에 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapper);
    } else {
        initMapper();
    }
})();
