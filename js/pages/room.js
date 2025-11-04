/**
 * Room Page Functionality
 * 객실 페이지 기능
 *
 * Note: RoomMapper 클래스는 room-mapper.js에 정의되어 있음
 */

function navigateToHome() {
    window.location.href = '/index.html';
}

async function initializeRoomMapper() {
    try {
        const roomMapper = new RoomMapper();
        await roomMapper.initialize();
        roomMapper.setupNavigation();
    } catch (error) {
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (!window.APP_CONFIG.isInIframe()) {
        // 일반 환경: RoomMapper가 직접 초기화
        initializeRoomMapper();
    }
    // iframe 환경에서는 PreviewHandler가 RoomMapper 호출
});