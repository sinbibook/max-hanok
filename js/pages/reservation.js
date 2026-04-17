/**
 * Reservation Page JavaScript
 */

(function() {
    'use strict';

    let ticking = false;


    // Scroll to next section function
    function scrollToNextSection() {
        const nextSection = document.querySelector('.reservation-info-section');

        if (nextSection) {
            const targetPosition = nextSection.offsetTop;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }


    // Make function globally available
    window.scrollToNextSection = scrollToNextSection;

    // Simple initialization - no animations needed for facility-style layout

    // Accordion functionality
    function initializeAccordion() {
        const accordionItems = document.querySelectorAll('.accordion-item');

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');
            const button = item.querySelector('.accordion-close');

            // Initially open the first accordion
            content.classList.add('active');
            button.classList.add('active');

            header.addEventListener('click', () => {
                // Toggle current accordion only
                content.classList.toggle('active');
                button.classList.toggle('active');
            });
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // ReservationMapper 초기화
        if (typeof ReservationMapper !== 'undefined') {
            const reservationMapper = new ReservationMapper();
            await reservationMapper.initialize();
        }

        initializeAccordion();
    });

})();