/**
 * Footer Component Functionality
 * 푸터 컴포넌트 기능
 */

// FooterComponent 클래스 (footer.html에서 이동)
class FooterComponent {
    constructor() {
        this.init();
    }

    init() {
        // 예약하기 버튼 이벤트
        document.getElementById('reservation-btn-mobile')?.addEventListener('click', () => this.handleReservation());
        document.getElementById('reservation-btn-desktop')?.addEventListener('click', () => this.handleReservation());

        // 스크롤 투 탑 버튼 이벤트
        document.getElementById('scroll-top-btn-mobile')?.addEventListener('click', () => this.scrollToTop());
        document.getElementById('scroll-top-btn-desktop')?.addEventListener('click', () => this.scrollToTop());
    }

    scrollToTop() {
        if (typeof onScrollToTop === 'function') {
            onScrollToTop();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    handleReservation() {
        if (typeof window.onReservation === 'function') {
            window.onReservation();
        } else if (typeof window.onNavigate === 'function') {
            window.onNavigate('reservation');
        } else {
            // 동적 경로 설정
            const currentPath = window.location.pathname;
            let targetPath;
            if (currentPath.includes('/pages/')) {
                // pages 폴더 안에서는 상대 경로 사용
                targetPath = 'reservation.html';
            } else {
                // 루트에서는 pages 폴더로 이동
                targetPath = 'pages/reservation.html';
            }
            window.location.href = targetPath;
        }
    }

    navigateHome() {
        if (typeof window.onHome === 'function') {
            window.onHome();
        } else {
            // 동적 경로 설정
            const currentPath = window.location.pathname;
            let targetPath;
            if (currentPath.includes('/pages/')) {
                // pages 폴더 안에서는 상대 경로 사용
                targetPath = '../index.html';
            } else {
                // 루트에서는 index.html로 이동
                targetPath = 'index.html';
            }
            window.location.href = targetPath;
        }
    }

    handleNavigation(page) {
        if (typeof window.onNavigate === 'function') {
            window.onNavigate(page);
        } else {
            // 동적 경로 설정
            const currentPath = window.location.pathname;
            let targetPath;
            if (currentPath.includes('/pages/')) {
                // pages 폴더 안에서는 상대 경로 사용
                targetPath = `${page}.html`;
            } else {
                // 루트에서는 pages 폴더로 이동
                targetPath = `pages/${page}.html`;
            }
            window.location.href = targetPath;
        }
    }
}

// Footer 매핑 함수 - data-mapper가 로드된 후 실행
async function initFooterMapping() {
    try {
        // HeaderFooterMapper가 로드될 때까지 대기
        if (typeof HeaderFooterMapper === 'undefined') {
            setTimeout(initFooterMapping, 100);
            return;
        }

        // HeaderFooterMapper 인스턴스 생성 및 초기화
        const headerFooterMapper = new HeaderFooterMapper();
        await headerFooterMapper.initialize();

        // Footer 매핑 실행
        await headerFooterMapper.mapFooter();
    } catch (error) {
    }
}

// Function to initialize scroll to top button
function initScrollToTop() {
    // Scroll to top button functionality
    const scrollToTopButton = document.getElementById('scrollToTop');

    if (scrollToTopButton) {
        // Show/hide button based on scroll position
        function toggleScrollButton() {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollPosition > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        }

        // Throttle scroll event for better performance
        let isScrolling = false;
        window.addEventListener('scroll', function() {
            if (!isScrolling) {
                window.requestAnimationFrame(function() {
                    toggleScrollButton();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });

        // Scroll to top when button is clicked
        scrollToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initial check
        toggleScrollButton();
    }
}

// 푸터 컴포넌트 초기화
function initFooterComponent() {
    window.footerComponent = new FooterComponent();

    // Footer 매핑도 함께 실행
    initFooterMapping();
}

// Initialize immediately if DOM is already loaded, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            initScrollToTop();
            initFooterComponent();
        }, 500);
    });
} else {
    // DOM is already loaded, initialize after a short delay
    setTimeout(() => {
        initScrollToTop();
        initFooterComponent();
    }, 500);
}