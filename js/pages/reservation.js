/**
 * Reservation Page Functionality
 * 예약 페이지 기능
 */

function navigateToHome() {
    window.location.href = './index.html';
}

async function initializeReservationMapper() {
    try {
        const reservationMapper = new ReservationMapper();
        await reservationMapper.initialize();
        reservationMapper.setupNavigation();
    } catch (error) {
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (!window.APP_CONFIG.isInIframe()) {
        // 일반 환경: ReservationMapper가 직접 초기화
        initializeReservationMapper();
    }
    // iframe 환경에서는 PreviewHandler가 ReservationMapper 호출
});