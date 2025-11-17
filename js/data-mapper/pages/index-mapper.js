/**
 * Index Page Data Mapper - Simple Version
 */

(async function() {
    'use strict';

    // Load JSON data
    async function loadData() {
        try {
            const response = await fetch('/standard-template-data.json');
            return await response.json();
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    // Map data to HTML elements
    async function mapData() {
        const data = await loadData();
        if (!data) return;

        // Property Info
        const propertyName = data.property?.name || '숙소명';
        const propertyNameEn = data.property?.nameEn || 'PROPERTY NAME';

        // Map property name to all elements
        document.querySelectorAll('.logo-text, .brand-title, [data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        document.querySelectorAll('.logo-subtitle, .brand-subtitle, [data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });

        // Hero Section
        // const heroData = data.homepage?.customFields?.pages?.index?.sections?.[0]?.hero;
        // if (heroData) {
        //     // Hero title
        //     const heroTitle = document.querySelector('[data-hero-title]');
        //     if (heroTitle) heroTitle.textContent = heroData.title || '';

        //     // Property description
        //     const propDesc = document.querySelector('[data-property-description]');
        //     if (propDesc) propDesc.textContent = data.property?.description || '';

        //     // Hero background image
        //     const heroImg = document.querySelector('[data-hero-image]');
        //     if (heroImg && heroData.images?.[0]) {
        //         heroImg.src = heroData.images[0].url;
        //         heroImg.alt = heroData.images[0].description || '히어로 이미지';
        //     }
        // }

        // Essence Section
        const essenceData = data.homepage?.customFields?.pages?.index?.sections?.[0]?.essence;
        if (essenceData) {
            const title = document.querySelector('[data-essence-title]');
            if (title) title.textContent = essenceData.title || '';

            const desc = document.querySelector('[data-essence-description]');
            if (desc) desc.innerHTML = (essenceData.description || '').replace(/\n/g, '<br>');

            const img = document.querySelector('[data-essence-image]');
            if (img && essenceData.images?.[0]) {
                img.src = essenceData.images[0].url;
            }
        }

        // Gallery Section
        const galleryData = data.homepage?.customFields?.pages?.index?.sections?.[0]?.gallery;
        if (galleryData) {
            const title = document.querySelector('[data-gallery-title]');
            if (title) title.textContent = galleryData.title || '';

            const desc = document.querySelector('[data-gallery-description]');
            if (desc) desc.innerHTML = (galleryData.description || '').replace(/\n/g, '<br>');

            const container = document.querySelector('[data-gallery-items]');
            if (container && galleryData.images) {
                container.innerHTML = '';
                const images = galleryData.images
                    .filter(img => img.isSelected)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                images.forEach(img => {
                    const item = document.createElement('div');
                    item.className = 'signature-item';
                    item.innerHTML = `
                        <img src="${img.url}" alt="${img.description || ''}" loading="lazy">
                        <div class="signature-item-overlay"></div>
                        <div class="signature-item-text">
                            <h5 class="signature-item-title">${img.description || ''}</h5>
                        </div>
                    `;
                    container.appendChild(item);
                });
            }
        }

        // Signature Section
        const signatureData = data.homepage?.customFields?.pages?.index?.sections?.[0]?.signature;
        if (signatureData) {
            const title = document.querySelector('[data-signature-title]');
            if (title) title.textContent = signatureData.title || '';

            const desc = document.querySelector('[data-signature-description]');
            if (desc) desc.innerHTML = (signatureData.description || '').replace(/\n/g, '<br>');

            const container = document.querySelector('[data-signature-items]');
            if (container && signatureData.images) {
                container.innerHTML = '';
                const images = signatureData.images
                    .filter(img => img.isSelected)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                images.forEach(img => {
                    const item = document.createElement('div');
                    item.className = 'signature-item';
                    item.innerHTML = `
                        <img src="${img.url}" alt="${img.description || ''}" loading="lazy">
                        <div class="signature-item-overlay"></div>
                        <div class="signature-item-text">
                            <h5 class="signature-item-title">${img.description || ''}</h5>
                        </div>
                    `;
                    container.appendChild(item);
                });
            }
        }

        // Closing Section
        const closingData = data.homepage?.customFields?.pages?.index?.sections?.[0]?.closing;
        if (closingData) {
            const title = document.querySelector('[data-closing-title]');
            if (title) title.textContent = closingData.title || '';

            const desc = document.querySelector('[data-closing-description]');
            if (desc) desc.innerHTML = (closingData.description || '').replace(/\n/g, '<br>');

            const img = document.querySelector('[data-closing-image]');
            if (img && closingData.images?.[0]) {
                img.src = closingData.images[0].url;
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mapData);
    } else {
        mapData();
    }

})();