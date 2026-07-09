/**
 * Header and Footer Loader
 * Dynamically loads header and footer templates into pages
 */

(function() {
    'use strict';

    // Load CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load Header
    async function loadHeader() {
        try {
            // Load header CSS first
            loadCSS('styles/header.css');

            const response = await fetch('common/header.html');
            const html = await response.text();

            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Extract body content from the loaded HTML
            const bodyContent = temp.querySelector('body');
            if (bodyContent) {
                // Insert header at the beginning of body
                const header = bodyContent.querySelector('.header');
                if (header) {
                    document.body.insertBefore(header, document.body.firstChild);
                }

                // Insert mobile menu after header
                const mobileMenu = bodyContent.querySelector('.mobile-menu');
                if (mobileMenu) {
                    document.body.insertBefore(mobileMenu, document.body.firstChild.nextSibling);
                }
            } else {
                // Fallback: try to get header directly
                const header = temp.querySelector('.header');
                if (header) {
                    document.body.insertBefore(header, document.body.firstChild);
                }

                const mobileMenu = temp.querySelector('.mobile-menu');
                if (mobileMenu) {
                    document.body.insertBefore(mobileMenu, document.body.firstChild.nextSibling);
                }
            }

            // Load header JavaScript
            const script = document.createElement('script');
            script.src = 'js/common/header.js';
            document.body.appendChild(script);

            // Immediately check scroll position after header is loaded
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                const header = document.querySelector('.header');
                if (header) {
                    header.classList.add('scrolled');
                }
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Load Footer
    async function loadFooter() {
        try {
            const response = await fetch('common/footer.html');
            if (response.ok) {
                // Load footer CSS
                loadCSS('styles/footer.css');

                const html = await response.text();

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Append footer at the end of body
                const footer = temp.querySelector('.footer');
                if (footer) {
                    document.body.appendChild(footer);
                }

                // Load footer JavaScript if exists
                const script = document.createElement('script');
                script.src = 'js/common/footer.js';
                document.body.appendChild(script);
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', async function() {
        // header와 footer 둘 다 로드 완료될 때까지 대기
        await Promise.all([loadHeader(), loadFooter()]);

        // 둘 다 로드 완료 후 초기화 이벤트 발생
        document.dispatchEvent(new Event('headerFooterLoaded'));
    });

})();