/**
 * Header interactions used across modern pages.
 * Handles navigation, mobile menu toggling, and scroll styling.
 */
(function () {
    const PAGE_MAP = {
        // home is handled separately in navigateTo function
        main: 'main.html',
        directions: 'directions.html',
        'reservation-info': 'reservation.html',
        room: 'room.html',
    };
    const RESERVATION_URL = 'https://www.bookingplay.co.kr/booking/1/${realtimeBookingId}';

    // Initialize variables - will be populated after DOM is ready
    let headers;
    let mobileMenu;
    let mobileToggleButtons;
    let desktopMenuItems;
    let mobileHeaderItems;
    let allMenuGroups;

    function syncAriaExpanded(collection) {
        collection.forEach((item) => {
            const trigger = item.querySelector('a');
            if (trigger) {
                trigger.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
            }
        });
    }

    let isMobileMenuOpen = false;

    function updateHeaderAppearance() {
        const shouldActivate = window.scrollY > 40;
        headers.forEach((headerEl) => {
            if (!headerEl) return;
            headerEl.classList.toggle('scrolled', shouldActivate);
        });
    }


    function closeMobileMenu() {
        if (!isMobileMenuOpen) return;
        isMobileMenuOpen = false;

        mobileMenu?.classList.remove('is-open');
        mobileMenu?.setAttribute('aria-hidden', 'true');

        document.querySelectorAll('.mobile-toggle').forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-expanded', 'false');
        });

        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');

        if (allMenuGroups && allMenuGroups.length > 0) {
            allMenuGroups.forEach(closeAllMenuItems);
        }
    }

    function openMobileMenu() {
        if (isMobileMenuOpen) return;
        isMobileMenuOpen = true;

        mobileMenu?.classList.add('is-open');
        mobileMenu?.setAttribute('aria-hidden', 'false');

        document.querySelectorAll('.mobile-toggle').forEach(btn => {
            btn.classList.add('is-active');
            btn.setAttribute('aria-expanded', 'true');
        });

        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');
    }

    function toggleMobileMenu() {
        if (isMobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function navigateTo(page) {
        if (!page) return;

        if (page === 'reservation-link') {
            // DOM에서 동적으로 생성된 예약 링크 URL 가져오기
            const reservationLink = document.querySelector('[data-property-realtime-booking-id]');
            const reservationUrl = reservationLink?.getAttribute('href') || RESERVATION_URL;
            window.open(reservationUrl, '_blank');
            closeMobileMenu();
            return;
        }

        if (page === 'home') {
            window.location.href = 'index.html';
            closeMobileMenu();
            return;
        }

        const targetPath = PAGE_MAP[page];
        if (targetPath) {
            // All files are in root directory
            window.location.href = targetPath;
            closeMobileMenu();
            return;
        }
    }

    window.toggleMobileMenu = toggleMobileMenu;
    window.navigateTo = navigateTo;
    function closeAllMenuItems(collection) {
        collection.forEach((item) => item.classList.remove('is-open'));
        syncAriaExpanded(collection);
    }

    function toggleMenuItem(item, collection) {
        const alreadyOpen = item.classList.contains('is-open');
        closeAllMenuItems(collection);
        if (!alreadyOpen) {
            item.classList.add('is-open');
        }
        syncAriaExpanded(collection);
    }

    function attachMenuToggleHandlers(menuItems, options = {}) {
        menuItems.forEach((item) => {
            const trigger = item.querySelector('a');
            if (!trigger) return;

            trigger.addEventListener('click', (event) => {
                const shouldHandle = options.shouldHandle ? options.shouldHandle() : true;
                if (!shouldHandle) return;

                if (trigger.getAttribute('href') === 'javascript:void(0)') {
                    event.preventDefault();
                }

                toggleMenuItem(item, menuItems);
            });

            trigger.addEventListener('keydown', (event) => {
                if ((event.key === 'Enter' || event.key === ' ') && (!options.shouldHandle || options.shouldHandle())) {
                    event.preventDefault();
                    toggleMenuItem(item, menuItems);
                }
            });
        });
    }

    // Initialize DOM elements and event listeners
    function initializeHeader() {
        // Populate DOM element references
        headers = Array.from(document.querySelectorAll('.header, .mHd'));
        mobileMenu = document.getElementById('mobile-menu');
        mobileToggleButtons = Array.from(document.querySelectorAll('.mobile-toggle'));

        // Mobile reservation button will be handled by header-footer-mapper.js
        // No need to initialize here as it uses the same mapping as other realtime booking links

        desktopMenuItems = Array.from(document.querySelectorAll('.header .mainMenu > li'));
        mobileHeaderItems = Array.from(document.querySelectorAll('.mHd .mainMenu > li'));
        allMenuGroups = [desktopMenuItems, mobileHeaderItems];


        // Setup menu toggle handlers
        attachMenuToggleHandlers(desktopMenuItems, {
            shouldHandle: () => window.innerWidth >= 1024
        });

        attachMenuToggleHandlers(mobileHeaderItems, {
            shouldHandle: () => window.innerWidth < 1024
        });

        allMenuGroups.forEach(syncAriaExpanded);

        // Setup mobile toggle buttons
        mobileToggleButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleMobileMenu();
            });
        });

        // Global click handler
        document.addEventListener('click', (event) => {
            const target = event.target;

            if (isMobileMenuOpen) {
                const clickInsideMenu = mobileMenu?.contains(target);
                const clickOnToggle = mobileToggleButtons?.some(btn => btn.contains(target));
                if (!clickInsideMenu && !clickOnToggle) {
                    closeMobileMenu();
                }
            }

            if (window.innerWidth >= 1024) {
                const insideMenu = target.closest('.header .mainMenu');
                if (!insideMenu) {
                    closeAllMenuItems(desktopMenuItems);
                }
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                closeMobileMenu();
            }
            allMenuGroups.forEach(closeAllMenuItems);
            allMenuGroups.forEach(syncAriaExpanded);
        });

        // Scroll handler
        window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
        updateHeaderAppearance();
    }

    // Mobile submenu toggle function
    function toggleMobileSubmenu(element) {
        const menuSection = element.closest('.mobile-menu-section');
        if (!menuSection) return;

        const isOpen = menuSection.classList.contains('is-open');

        // Close all other mobile menu sections
        const allSections = Array.from(document.querySelectorAll('.mobile-menu-section'));
        allSections.forEach((section) => {
            if (section !== menuSection) {
                section.classList.remove('is-open');
            }
        });

        // Toggle current menu section
        menuSection.classList.toggle('is-open', !isOpen);
    }

    // Expose global functions
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.openMobileMenu = openMobileMenu;
    window.navigateTo = navigateTo;
    window.toggleMobileSubmenu = toggleMobileSubmenu;
    window.showSubMenus = () => {
        if (window.innerWidth >= 1024) {
            desktopMenuItems.forEach((item) => item.classList.add('is-open'));
        }
    };
    window.hideSubMenus = () => {
        allMenuGroups.forEach(closeAllMenuItems);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHeader);
    } else {
        // DOM already loaded, initialize immediately
        initializeHeader();
    }

})();
