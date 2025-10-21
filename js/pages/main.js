/**
 * Main Page Functionality
 * main.html 페이지 전용 스크립트
 */

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize MainMapper
  const mainMapper = new MainMapper();
  mainMapper.initialize().catch(error => {
    console.error('❌ MainMapper initialization failed:', error);
  });
});