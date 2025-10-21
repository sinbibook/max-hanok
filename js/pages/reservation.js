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
    initializeReservationMapper();
});