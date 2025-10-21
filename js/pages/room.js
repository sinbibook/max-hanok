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
    initializeRoomMapper();
});