// Header JavaScript
(function() {
    'use strict';

    // Update submenu position based on header height
    function updateSubmenuPosition() {
        const header = document.querySelector('.header');
        const unifiedSubmenu = document.querySelector('.unified-submenu');

        if (header && unifiedSubmenu) {
            const headerHeight = header.offsetHeight;
            unifiedSubmenu.style.top = `${headerHeight}px`;
        }
    }

    // Scroll Effect for Header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update submenu position after header state change
        // setTimeout(updateSubmenuPosition, 100);
    });

    // Toggle Mobile Menu
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        const body = document.body;
        const html = document.documentElement;

        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';

            // 현재 스크롤 위치 저장
            const scrollY = body.style.top ? -parseInt(body.style.top) : 0;

            // 모든 스타일 완전히 리셋
            body.classList.remove('mobile-menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
            body.style.height = '';
            body.style.top = '';
            body.style.left = '';

            html.style.overflow = '';

            // 원래 스크롤 위치로 복원
            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
        } else {
            // 현재 스크롤 위치 저장
            const scrollY = window.pageYOffset;

            mobileMenu.classList.add('active');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';

            // body 고정하되 현재 스크롤 위치 유지
            body.classList.add('mobile-menu-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.height = '100%';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';

            html.style.overflow = 'hidden';
        }
    };

    // Navigation function
    window.navigateTo = function(page) {
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }

        // Navigate to page
        let url = '';
        switch(page) {
            case 'home':
                url = 'index.html';
                break;
            case 'main':
                url = 'main.html';
                break;
            case 'directions':
                url = 'directions.html';
                break;
            case 'reservation-info':
                url = 'reservation.html';
                break;
            default:
                url = page + '.html';
        }

        if (url) {
            window.location.href = url;
        }
    };

    // Submenu hover effect
    function initSubmenuHover() {
        const menuItems = document.querySelectorAll('.menu-item-wrapper');

        menuItems.forEach(item => {
            let hoverTimeout;

            item.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
            });

            item.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(() => {
                    // Optional: Add any cleanup code here
                }, 100);
            });
        });
    }

    // Check if logo image exists and hide text
    function checkLogoImage() {
        const logoImage = document.querySelector('.logo-image');
        const logoText = document.querySelector('.logo-text');

        if (logoImage && logoText) {
            // Check if logo image src exists and is not empty
            if (logoImage.src && !logoImage.src.includes('undefined') && !logoImage.src.endsWith('/')) {
                logoText.style.display = 'none';
            }
        }
    }


    // Check and set header state based on scroll position
    function checkInitialScroll() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // Initialize header on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Check initial scroll position
        checkInitialScroll();

        // Initialize submenu hover
        initSubmenuHover();

        // Check logo image
        checkLogoImage();

        // Update submenu position initially
        updateSubmenuPosition();

        // Update submenu position on window resize
        window.addEventListener('resize', updateSubmenuPosition);
    });

    // Mobile Accordion Toggle
    window.toggleMobileAccordion = function(header) {
        const content = header.nextElementSibling;
        const isActive = content.classList.contains('active');

        // Toggle current accordion
        header.classList.toggle('active');
        content.classList.toggle('active');
    };

    // Also check when window loads (for refresh scenarios)
    window.addEventListener('load', function() {
        checkInitialScroll();
    });

    // Immediate check for page refresh scenarios
    checkInitialScroll();

})();