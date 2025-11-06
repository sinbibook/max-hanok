/**
 * Directions Page Functionality
 * 오시는 길 페이지 기능
 */

// Navigation function
function navigateToHome() {
    window.location.href = 'index.html';
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (!window.APP_CONFIG.isInIframe()) {
        // 일반 환경: DirectionsMapper가 직접 초기화
        const directionsMapper = new DirectionsMapper();
        directionsMapper.initialize().then(() => {
            directionsMapper.mapPage();
        });
    }
    // iframe 환경에서는 PreviewHandler가 DirectionsMapper 호출
});