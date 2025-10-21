(function() {
    'use strict';

    const accordionContainer = document.querySelector('[data-azure-accordion]');
    if (!accordionContainer) return;

    const accordionItems = accordionContainer.querySelectorAll('[data-accordion-item]');
    const displayImage = accordionContainer.querySelector('[data-azure-accordion-image]');
    const displayCaption = accordionContainer.querySelector('[data-azure-accordion-caption]');

    const setActiveItem = (targetItem) => {
        accordionItems.forEach((item) => {
            const isTarget = item === targetItem;
            item.classList.toggle('is-active', isTarget);
            const header = item.querySelector('.azure-accordion-item__header');
            if (header) {
                header.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
            }
        });

        if (!displayImage || !displayCaption) return;
        const newImage = targetItem.getAttribute('data-image');
        const newCaption = targetItem.getAttribute('data-caption');

        if (!newImage) return;

        displayImage.classList.add('is-changing');
        displayImage.addEventListener('transitionend', () => {
            displayImage.classList.remove('is-changing');
        }, { once: true });

        displayImage.src = newImage;
        if (newCaption) {
            displayCaption.textContent = newCaption;
        }
    };

    accordionItems.forEach((item) => {
        const header = item.querySelector('.azure-accordion-item__header');
        if (!header) return;

        header.addEventListener('click', () => {
            if (item.classList.contains('is-active')) return;
            setActiveItem(item);
        });
    });

    const firstActive = accordionContainer.querySelector('.azure-accordion-item.is-active');
    if (firstActive) {
        setActiveItem(firstActive);
    } else if (accordionItems.length > 0) {
        setActiveItem(accordionItems[0]);
    }
})();
