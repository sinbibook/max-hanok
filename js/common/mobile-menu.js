// Mobile menu initialization
function initMobileMenu() {
  // 중복 초기화 방지
  if (window.mobileMenuInitialized) {
    return;
  }

  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileCloseBtn = document.querySelector('.mobile-toggle--close');
  const menuSections = document.querySelectorAll('.mobile-menu-section');
  const body = document.body;

  // 필수 요소가 없으면 초기화하지 않음
  if (!mobileMenu || !mobileToggle || menuSections.length === 0) {
    return;
  }

  // Get current page from URL
  function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    return pageName || 'index';
  }

  // Open mobile menu
  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';

    // Auto-open current page's menu section
    openCurrentPageSection();
  }

  // Open the menu section that contains current page
  function openCurrentPageSection() {
    const currentPage = getCurrentPage();
    let foundCurrentPage = false;

    menuSections.forEach(section => {
      const subItems = section.querySelectorAll('.mobile-sub-item');

      subItems.forEach(item => {
        // Remove any existing current-page class
        item.classList.remove('current-page');

        // Check if this item's link matches current page
        const onclick = item.getAttribute('onclick');
        const href = item.getAttribute('href');
        let isCurrentPage = false;

        if (onclick && onclick.includes(`'${currentPage}'`)) {
          isCurrentPage = true;
        } else if (href && href.includes(currentPage)) {
          isCurrentPage = true;
        } else if (onclick && onclick.includes('window.location.href')) {
          const match = onclick.match(/['"](.*?)['"]/);
          if (match && match[1].includes(currentPage)) {
            isCurrentPage = true;
          }
        }

        if (isCurrentPage) {
          // Mark as current page
          item.classList.add('current-page');
          foundCurrentPage = true;

          // Open this section
          section.classList.add('is-open');
          const sectionSubItems = section.querySelector('.mobile-sub-items');
          if (sectionSubItems) {
            sectionSubItems.classList.add('active');
          }
        }
      });
    });

    return foundCurrentPage;
  }

  // Close mobile menu
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';

    // Close all accordion sections when closing menu
    menuSections.forEach(section => {
      section.classList.remove('is-open');
      const subItems = section.querySelector('.mobile-sub-items');
      if (subItems) {
        subItems.classList.remove('active');
      }
    });
  }

  // Mobile menu toggle button
  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMenu);
  }

  // Mobile menu close button
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMenu);
  }

  // Accordion functionality for menu sections
  menuSections.forEach((section, index) => {
    const title = section.querySelector('.mobile-menu-title');

    if (title) {
      // 강화된 클릭 핸들러
      function handleAccordionClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // 디바운싱을 위한 플래그
        if (title.dataset.clicking === 'true') {
          return;
        }
        title.dataset.clicking = 'true';

        setTimeout(() => {
          title.dataset.clicking = 'false';
        }, 300);

        const isOpen = section.classList.contains('is-open');
        const subItems = section.querySelector('.mobile-sub-items');

        // Close all other sections
        menuSections.forEach(otherSection => {
          if (otherSection !== section) {
            otherSection.classList.remove('is-open');
            const otherSubItems = otherSection.querySelector('.mobile-sub-items');
            if (otherSubItems) {
              otherSubItems.classList.remove('active');
            }
          }
        });

        // Toggle current section with animation delay
        if (!isOpen) {
          section.classList.add('is-open');
          if (subItems) {
            // 약간의 지연으로 더 부드러운 애니메이션
            requestAnimationFrame(() => {
              subItems.classList.add('active');
            });
          }
        } else {
          section.classList.remove('is-open');
          if (subItems) {
            subItems.classList.remove('active');
          }
        }
      }

      // 이벤트 리스너 등록 (여러 이벤트 타입으로 확실하게)
      title.addEventListener('click', handleAccordionClick, { passive: false });
      title.addEventListener('touchend', handleAccordionClick, { passive: false });

      // 터치 디바이스에서 추가 확실성을 위해
      title.style.touchAction = 'manipulation';
      title.style.userSelect = 'none';
    }
  });

  // Close menu when clicking outside
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e) {
      if (e.target === mobileMenu) {
        closeMenu();
      }
    });
  }

  // Close menu with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // 초기화 완료 플래그 설정
  window.mobileMenuInitialized = true;
}

// Make function available globally
window.initMobileMenu = initMobileMenu;

// 안정적인 초기화를 위한 재시도 로직
function tryInitMobileMenu(maxRetries = 5, delay = 200) {
  let retryCount = 0;

  function attemptInit() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const menuSections = document.querySelectorAll('.mobile-menu-section');

    // 필요한 요소들이 모두 존재하면 초기화
    if (mobileMenu && mobileToggle && menuSections.length > 0) {
      initMobileMenu();
      return;
    }

    // 아직 요소가 없고 재시도 횟수가 남아있으면 재시도
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(attemptInit, delay * retryCount);
    }
  }

  attemptInit();
}

// Initialize when DOM is ready or when called dynamically
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    tryInitMobileMenu();
  });
} else {
  // DOM is already loaded - try to initialize
  tryInitMobileMenu();
}

// Also try to initialize when window fully loads (as backup)
window.addEventListener('load', () => {
  if (!window.mobileMenuInitialized) {
    tryInitMobileMenu();
  }
});