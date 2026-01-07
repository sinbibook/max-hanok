/**
 * Main Page Functionality
 * main.html 페이지 전용 스크립트
 */

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
  if (!window.APP_CONFIG.isInIframe()) {
    // 일반 환경: MainMapper가 직접 초기화
    const mainMapper = new MainMapper();
    mainMapper.initialize().catch(error => {
      console.error('❌ MainMapper initialization failed:', error);
    });
  }
  // iframe 환경에서는 PreviewHandler가 MainMapper 호출
});