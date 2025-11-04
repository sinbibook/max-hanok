/**
 * Reservation Page Functionality
 * 예약 페이지 기능 (헤더/푸터 로딩 포함)
 */

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load data mapper for content mapping
    setTimeout(() => {
        loadDataMapper();
    }, 100);
});

/**
 * Data mapper loader and initializer
 */
async function loadDataMapper() {
    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (window.APP_CONFIG && window.APP_CONFIG.isInIframe()) {
        return;
    }

    try {
        const dataPath = window.APP_CONFIG
            ? window.APP_CONFIG.getResourcePath('standard-template-data.json')
            : './standard-template-data.json';
        const response = await fetch(dataPath);
        const data = await response.json();

        window.dogFriendlyDataMapper = {
            data: data,
            isDataLoaded: true
        };

        // Initialize ReservationMapper
        if (window.ReservationMapper) {
            const mapper = new ReservationMapper(data);
            mapper.mapPage();

            // Open first accordion after data mapping
            setTimeout(() => {
                openFirstAccordion();
            }, 500);
        } else {
            // Wait for ReservationMapper to load
            setTimeout(() => {
                if (window.ReservationMapper) {
                    const mapper = new ReservationMapper(data);
                    mapper.mapPage();

                    // Open first accordion after data mapping
                    setTimeout(() => {
                        openFirstAccordion();
                    }, 500);
                }
            }, 1000);
        }

        // Initialize HeaderFooterMapper after header is loaded
        setTimeout(() => {
            if (window.HeaderFooterMapper) {
                const headerFooterMapper = new window.HeaderFooterMapper();
                headerFooterMapper.data = data;
                headerFooterMapper.isDataLoaded = true;
                headerFooterMapper.mapHeaderFooter();
            }
        }, 1500); // Wait for header/footer to be loaded first
    } catch (error) {
    }
}

/**
 * Accordion toggle functionality
 */
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    const isOpen = content.classList.contains('accordion-open');

    // Close all other accordions first
    const allAccordions = document.querySelectorAll('.accordion-btn');
    allAccordions.forEach(accordion => {
        if (accordion !== button) {
            const otherContent = accordion.nextElementSibling;
            const otherIcon = accordion.querySelector('.accordion-icon');
            otherContent.classList.remove('accordion-open');
            otherContent.style.maxHeight = '0';
            otherIcon.style.transform = 'rotate(0deg)';
        }
    });

    // Toggle current accordion
    if (isOpen) {
        content.classList.remove('accordion-open');
        content.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('accordion-open');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(45deg)';
    }
}

/**
 * Open first accordion after data mapping is complete
 */
function openFirstAccordion() {
    const firstAccordion = document.querySelector('.accordion-btn');
    if (firstAccordion && typeof toggleAccordion === 'function') {
        toggleAccordion(firstAccordion);
    }
}