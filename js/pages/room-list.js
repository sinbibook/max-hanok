/**
 * Room List Page JavaScript
 */

(function() {
    'use strict';

    // ============================================================================
    // LEGACY DATA - RoomListMapper로 대체됨
    // ============================================================================
    // Room data - 각 호실별 정보 (현재는 JSON 파일에서 로드)
    /* DEPRECATED - 이제 RoomListMapper가 JSON에서 데이터를 가져옵니다
    const roomsData = [
        {
            number: "101",
            type: "디럭스",
            floor: 1,
            title: "디럭스 101호",
            description: "편안한 휴식을 위한 기본 객실. 모던한 인테리어와 편리한 시설을 갖추고 있습니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "102",
            type: "디럭스",
            floor: 1,
            title: "디럭스 102호",
            description: "넓은 공간과 세련된 인테리어로 편안한 숙박을 제공합니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "103",
            type: "디럭스",
            floor: 1,
            title: "디럭스 103호",
            description: "넓은 창문과 자연 채광이 아름다운 편안한 객실입니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "104",
            type: "디럭스",
            floor: 1,
            title: "디럭스 104호",
            description: "모던한 디자인과 편안함을 동시에 만족시키는 객실입니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "105",
            type: "디럭스",
            floor: 1,
            title: "디럭스 105호",
            description: "조용하고 안락한 분위기의 디럭스 객실입니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "106",
            type: "디럭스",
            floor: 1,
            title: "디럭스 106호",
            description: "세련된 인테리어와 최신 시설을 갖춘 프리미엄 디럭스 객실입니다.",
            image: "images/deluxe.jpg",
            features: ["킹베드", "시티뷰", "WiFi", "미니바"],
            capacity: "기준 2명 / 최대 4명",
            sizeSqm: "66m²",
            roomType: "트리플룸 (킹, 슈퍼싱글)",
            facilities: "거실, 침실1, 화장실1, 욕실1, 테라스"
        },
        {
            number: "201",
            type: "스위트",
            floor: 2,
            title: "스위트 201호",
            description: "거실과 침실이 분리된 넓은 구조로 특별한 순간을 위한 럭셔리 공간입니다.",
            image: "images/suite.jpg",
            features: ["킹베드", "거실", "오션뷰", "WiFi", "미니바", "욕조"],
            capacity: "4명"
        },
        {
            number: "202",
            type: "스위트",
            floor: 2,
            title: "스위트 202호",
            description: "최고급 시설과 넓은 공간으로 완벽한 휴식을 제공합니다.",
            image: "images/suite.jpg",
            features: ["킹베드", "거실", "오션뷰", "WiFi", "미니바", "욕조"],
            capacity: "4명"
        },
        {
            number: "203",
            type: "펜트하우스",
            floor: 2,
            title: "펜트하우스 203호",
            description: "최고층의 프라이빗한 휴식. 탁월한 전망과 최고급 시설을 자랑합니다.",
            image: "images/penthouse.jpg",
            features: ["킹베드", "거실", "파노라마뷰", "WiFi", "미니바", "욕조", "테라스"],
            capacity: "6명"
        },
        {
            number: "204",
            type: "펜트하우스",
            floor: 2,
            title: "펜트하우스 204호",
            description: "프리미엄 펜트하우스로 최상의 서비스와 편의시설을 제공합니다.",
            image: "images/penthouse.jpg",
            features: ["킹베드", "거실", "파노라마뷰", "WiFi", "미니바", "욕조", "테라스"],
            capacity: "6명"
        }
    ];
    */

    // ============================================================================
    // LEGACY RENDERING - RoomListMapper.mapRoomGrid()로 대체됨
    // ============================================================================
    /* DEPRECATED - 이제 RoomListMapper.mapRoomGrid()가 동적으로 생성합니다
    function renderRoomGrid() {
        const roomGrid = document.getElementById('room-grid');
        if (!roomGrid) return;

        // 디럭스 타입만 필터링
        const deluxeRooms = roomsData.filter(room => room.type === '디럭스');

        deluxeRooms.forEach((room, index) => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';


            roomCard.innerHTML = `
                <div class="room-card-image" onclick="selectRoom('${room.number}')" style="cursor: pointer;">
                    <img src="${room.image}" alt="${room.title}" loading="lazy">
                    <div class="room-overlay">
                        <div class="overlay-content">
                            <div class="overlay-info">
                                <div class="info-row">
                                    <span class="info-label">객실 면적</span>
                                    <span class="info-value">${room.sizeSqm}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">객실 타입</span>
                                    <span class="info-value">${room.roomType}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">객실 인원</span>
                                    <span class="info-value">${room.capacity}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">객실 구성</span>
                                    <span class="info-value">${room.facilities}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="room-card-content">
                    <div class="room-header">
                        <h3 class="room-title">${room.title}</h3>
                        <button class="room-btn" onclick="selectRoom('${room.number}')">
                            <span class="btn-text">VIEW</span>
                            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7,7 17,7 17,17"></polyline>
                            </svg>
                        </button>
                    </div>
                    <div class="room-info">
                        <div class="room-info-item">
                            <span class="room-info-label">호수</span>
                            <span class="room-info-value">${room.number}호</span>
                        </div>
                        <div class="room-info-item">
                            <span class="room-info-label">인원</span>
                            <span class="room-info-value">${room.capacity}</span>
                        </div>
                        <div class="room-info-item">
                            <span class="room-info-label">넓이</span>
                            <span class="room-info-value">${room.sizeSqm}</span>
                        </div>
                    </div>
                </div>
            `;

            // 애니메이션을 위한 지연시간 추가
            roomCard.style.transitionDelay = `${index * 0.1}s`;

            roomGrid.appendChild(roomCard);
        });
    }
    */

    // ============================================================================
    // GLOBAL FUNCTIONS
    // ============================================================================

    // Room selection function (room.html로 이동)
    window.selectRoom = function(roomId) {
        // room.html로 이동하면서 객실 ID를 파라미터로 전달
        window.location.href = `room.html?id=${roomId}`;
    };

    // Scroll animation
    function handleScrollAnimation() {
        const elements = document.querySelectorAll('.stylized-title-container, .room-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });

        // Banner image animation
        const bannerImage = document.querySelector('.room-list-banner-image');
        if (bannerImage) {
            const bannerTop = bannerImage.getBoundingClientRect().top;
            const bannerVisible = 200;

            if (bannerTop < window.innerHeight - bannerVisible) {
                bannerImage.classList.add('animate');
            }
        }
    }

    // ============================================================================
    // PAGE INITIALIZATION
    // ============================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // RoomListMapper 초기화
        if (typeof RoomListMapper !== 'undefined') {
            const roomListMapper = new RoomListMapper();
            await roomListMapper.initialize();
        }

        // Initial animation check
        setTimeout(() => {
            handleScrollAnimation();
        }, 100);

        // Scroll event listener
        window.addEventListener('scroll', handleScrollAnimation);
    });

})();