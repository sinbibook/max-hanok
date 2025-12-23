/**
 * Index Page Data Mapper
 * index.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 index 페이지 특화 기능 제공
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 INDEX PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (슬라이더 이미지 생성)
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');
        if (!heroData) return;

        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        const images = heroData.images
            ? heroData.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        if (images.length === 0) {
            // 이미지가 없을 때 placeholder
            const slide = document.createElement('div');
            slide.className = 'hero-slide active';

            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Image Available';
            img.className = 'empty-image-placeholder';
            img.loading = 'lazy';

            slide.appendChild(img);
            heroSlider.appendChild(slide);
        } else {
            images.forEach((img, index) => {
                const slide = document.createElement('div');
                slide.className = `hero-slide${index === 0 ? ' active' : ''}`;
                slide.innerHTML = `<img src="${img.url}" alt="${img.description || 'Hero Image'}" loading="lazy">`;
                heroSlider.appendChild(slide);
            });
        }

        // 슬라이더 초기화 (index.js의 initHeroSlider 호출)
        if (typeof window.initHeroSlider === 'function') {
            window.initHeroSlider(true); // skipDelay=true
        }
    }

    /**
     * Room Preview 섹션 매핑
     */
    mapRoomPreviewSection() {
        if (!this.isDataLoaded) return;

        const roomsData = this.safeGet(this.data, 'rooms');
        const tabsContainer = this.safeSelect('[data-room-tabs]');
        const descriptionsContainer = this.safeSelect('[data-room-descriptions]');
        const imagesContainer = this.safeSelect('[data-room-images]');

        if (!tabsContainer || !descriptionsContainer || !imagesContainer) return;

        // 기존 콘텐츠 클리어
        tabsContainer.innerHTML = '';
        descriptionsContainer.innerHTML = '';
        imagesContainer.innerHTML = '';

        // 모든 객실 데이터 가져오기 (그룹 필터 없이)
        const allRooms = (roomsData && Array.isArray(roomsData)) ? roomsData : [];

        // 데이터가 없을 때 placeholder UI 생성
        if (allRooms.length === 0) {
            // Placeholder 탭
            const placeholderTab = document.createElement('button');
            placeholderTab.className = 'room-tab active';
            placeholderTab.setAttribute('data-room', 'placeholder');
            placeholderTab.innerHTML = `
                <span class="room-tab-number">00</span>
                <span class="room-tab-name">No Rooms</span>
            `;
            tabsContainer.appendChild(placeholderTab);

            // Placeholder 설명
            const placeholderDesc = document.createElement('div');
            placeholderDesc.className = 'room-desc-item active';
            placeholderDesc.setAttribute('data-room', 'placeholder');
            placeholderDesc.innerHTML = '<p class="room-desc-text">객실 정보가 없습니다.</p>';
            descriptionsContainer.appendChild(placeholderDesc);

            // Placeholder 이미지
            const placeholderImage = document.createElement('div');
            placeholderImage.className = 'room-image-item active';
            placeholderImage.setAttribute('data-room', 'placeholder');
            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Room Image';
            img.className = 'empty-image-placeholder';
            placeholderImage.appendChild(img);
            imagesContainer.appendChild(placeholderImage);
        } else {
            // 모든 객실을 순회하며 탭 생성
            allRooms.forEach((room, index) => {
                // 탭 생성
                const tab = document.createElement('div');
                tab.className = `room-tab${index === 0 ? ' active' : ''}`;
                tab.setAttribute('data-room', room.id);
                tab.innerHTML = `
                    <span class="room-tab-content">
                        <span class="room-tab-number">${String(index + 1).padStart(2, '0')}</span>
                        <span class="room-tab-name">${room.name}</span>
                    </span>
                    <button class="room-tab-detail-btn" data-room-id="${room.id}">
                        <span class="btn-text">VIEW</span>
                        <svg class="icon" viewBox="0 0 24 24">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7,7 17,7 17,17"></polyline>
                        </svg>
                    </button>
                `;
                tabsContainer.appendChild(tab);

                // 설명 생성
                const descItem = document.createElement('div');
                descItem.className = `room-desc-item${index === 0 ? ' active' : ''}`;
                descItem.setAttribute('data-room', room.id);
                const description = room.description || `${room.name} 객실입니다.`;
                descItem.innerHTML = `<p class="room-desc-text">${description}</p>`;
                descriptionsContainer.appendChild(descItem);

                // 이미지 슬라이더 생성 - 객실의 interior 이미지 수집
                const imageItem = document.createElement('div');
                imageItem.className = `room-image-item${index === 0 ? ' active' : ''}`;
                imageItem.setAttribute('data-room', room.id);

                // 객실의 interior 이미지 수집 (isSelected: true만)
                const interiorImages = room.images?.[0]?.interior || [];
                const selectedInteriorImages = interiorImages.filter(img => img.isSelected);

                if (selectedInteriorImages.length === 0) {
                    const img = document.createElement('img');
                    img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                    img.alt = 'No Room Image';
                    img.className = 'empty-image-placeholder';
                    imageItem.appendChild(img);
                } else {
                    const sliderHTML = `
                        <div class="room-image-slider">
                            <div class="room-slide-track">
                                ${selectedInteriorImages.map((img, imgIndex) => `
                                    <div class="room-slide${imgIndex === 0 ? ' active' : ''}">
                                        <img src="${img.url}" alt="${img.description || room.name}" loading="lazy">
                                    </div>
                                `).join('')}
                            </div>
                            <div class="room-slider-controls">
                                <button class="room-slider-prev">‹</button>
                                <button class="room-slider-next">›</button>
                            </div>
                        </div>
                    `;
                    imageItem.innerHTML = sliderHTML;
                }
                imagesContainer.appendChild(imageItem);
            });

            // 슬라이더 및 애니메이션 초기화
            if (typeof window.initRoomImageSlider === 'function') {
                window.initRoomImageSlider();
            }

            if (typeof window.initRoomPreviewAnimation === 'function') {
                window.initRoomPreviewAnimation();
            }

            // Room tabs 이벤트 리스너 (hover 및 click 효과)
            const tabs = document.querySelectorAll('.room-tab');
            const images = document.querySelectorAll('.room-image-item');
            const descItems = document.querySelectorAll('.room-desc-item');

            const activateTab = (tab) => {
                const roomId = tab.dataset.room;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                images.forEach(img => {
                    img.classList.toggle('active', img.dataset.room === roomId);
                });

                descItems.forEach(item => {
                    item.classList.toggle('active', item.dataset.room === roomId);
                });
            };

            tabs.forEach(tab => {
                // Hover 효과 (데스크탑)
                tab.addEventListener('mouseenter', () => {
                    activateTab(tab);
                });

                // Click 효과 (모바일 및 데스크탑)
                tab.addEventListener('click', (e) => {
                    // 상세보기 버튼 클릭이 아닌 경우에만 탭 활성화
                    if (!e.target.closest('.room-tab-detail-btn')) {
                        activateTab(tab);
                    }
                });
            });

            // 상세보기 버튼 이벤트
            const detailBtns = document.querySelectorAll('.room-tab-detail-btn');
            detailBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 탭 클릭 이벤트 방지
                    const roomId = btn.dataset.roomId;
                    window.location.href = `room.html?id=${encodeURIComponent(roomId)}`;
                });
            });
        }
    }

    /**
     * Essence 섹션 매핑
     */
    mapEssenceSection() {
        if (!this.isDataLoaded) return;

        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (!essenceData) return;

        const titleEl = this.safeSelect('[data-essence-title]');
        const descEl = this.safeSelect('[data-essence-description]');

        if (titleEl) {
            const description = (essenceData.description !== undefined && essenceData.description !== '')
                ? essenceData.description
                : '특징 섹션 설명';
            titleEl.innerHTML = description.replace(/\n/g, '<br>');
        }
        if (descEl) {
            const title = (essenceData.title !== undefined && essenceData.title !== '')
                ? essenceData.title
                : '특징 섹션 타이틀';
            descEl.textContent = title;
        }

        // 어드민에서 이미 선택된 이미지만 전송하므로 필터링 불필요
        const selectedImages = essenceData.images && essenceData.images.length > 0
            ? essenceData.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            : [];

        const applyImage = (element, image) => {
            if (!element) return;
            const img = element.querySelector('img');
            if (!img) return;

            if (image?.url) {
                img.src = image.url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
            }
        };

        const leftImage = this.safeSelect('[data-essence-image-0]');
        const rightImage = this.safeSelect('[data-essence-image-1]');

        applyImage(leftImage, selectedImages[0]);
        applyImage(rightImage, selectedImages[1]);
    }

    /**
     * Gallery 섹션 매핑
     */
    mapGallerySection() {
        if (!this.isDataLoaded) return;

        const galleryData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.gallery');
        if (!galleryData) {
            return;
        }

        const titleElement = this.safeSelect('[data-gallery-title]');
        const imagesWrapper = this.safeSelect('[data-gallery-images]');

        if (titleElement) {
            const title = (galleryData.title !== undefined && galleryData.title !== '')
                ? galleryData.title
                : '갤러리 섹션 타이틀';
            titleElement.textContent = title;
        }
        if (!imagesWrapper) {
            return;
        }

        imagesWrapper.innerHTML = '';

        const selectedImages = galleryData.images
            ? galleryData.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        if (selectedImages.length === 0) {
            // 4개 placeholder
            const createPlaceholderItem = () => {
                const placeholderItem = document.createElement('div');
                placeholderItem.className = 'experience-accordion-item visible';
                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = 'No Image Available';
                img.className = 'empty-image-placeholder';
                img.loading = 'lazy';
                const overlay = document.createElement('div');
                overlay.className = 'experience-accordion-overlay';
                overlay.innerHTML = '<h4>갤러리 섹션 설명</h4>';
                placeholderItem.appendChild(img);
                placeholderItem.appendChild(overlay);
                return placeholderItem;
            };

            const leftAccordion = document.createElement('div');
            leftAccordion.className = 'experience-accordion-left';
            leftAccordion.appendChild(createPlaceholderItem());
            leftAccordion.appendChild(createPlaceholderItem());

            const rightAccordion = document.createElement('div');
            rightAccordion.className = 'experience-accordion-right';
            rightAccordion.appendChild(createPlaceholderItem());
            rightAccordion.appendChild(createPlaceholderItem());

            imagesWrapper.appendChild(leftAccordion);
            imagesWrapper.appendChild(rightAccordion);
        } else {
            const midPoint = Math.ceil(selectedImages.length / 2);
            const leftImages = selectedImages.slice(0, midPoint);
            const rightImages = selectedImages.slice(midPoint);

            const leftAccordion = document.createElement('div');
            leftAccordion.className = 'experience-accordion-left';
            leftImages.forEach(img => {
                const description = img.description || '갤러리 섹션 설명';
                const item = document.createElement('div');
                item.className = 'experience-accordion-item visible';
                item.innerHTML = `
                    <img src="${img.url}" alt="${description}" loading="lazy">
                    <div class="experience-accordion-overlay">
                        <h4>${description}</h4>
                    </div>
                `;
                leftAccordion.appendChild(item);
            });

            const rightAccordion = document.createElement('div');
            rightAccordion.className = 'experience-accordion-right';
            rightImages.forEach(img => {
                const description = img.description || '갤러리 섹션 설명';
                const item = document.createElement('div');
                item.className = 'experience-accordion-item visible';
                item.innerHTML = `
                    <img src="${img.url}" alt="${description}" loading="lazy">
                    <div class="experience-accordion-overlay">
                        <h4>${description}</h4>
                    </div>
                `;
                rightAccordion.appendChild(item);
            });

            imagesWrapper.appendChild(leftAccordion);
            imagesWrapper.appendChild(rightAccordion);
        }
    }

    /**
     * Signature 섹션 매핑
     */
    mapSignatureSection() {
        if (!this.isDataLoaded) return;

        const signatureData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.signature');
        if (!signatureData) return;

        const slidesContainer = this.safeSelect('[data-signature-slides]');
        if (!slidesContainer) return;

        slidesContainer.innerHTML = '';

        const images = signatureData.images
            ? signatureData.images.filter(img => img.isSelected).sort((a, b) => a.sortOrder - b.sortOrder)
            : [];

        if (images.length > 0) {
            images.forEach((img, index) => {
                const slideElement = document.createElement('div');
                slideElement.className = `signature-slide${index === 0 ? ' active' : ''}`;
                slideElement.innerHTML = `
                    <div class="signature-slide-image">
                        <img src="${img.url}" alt="${img.description || ''}" loading="lazy">
                    </div>
                    <div class="signature-slide-content">
                        <span class="quote-mark quote-top">"</span>
                        <h3 class="signature-slide-title">${img.description || ''}</h3>
                        <span class="quote-mark quote-bottom">"</span>
                    </div>
                `;
                slidesContainer.appendChild(slideElement);
            });
        } else {
            // 이미지 없을 때 placeholder 슬라이드 생성
            const slideElement = document.createElement('div');
            slideElement.className = 'signature-slide active';
            slideElement.innerHTML = `
                <div class="signature-slide-image">
                    <img src="" alt="특색 이미지" class="empty-image-placeholder">
                </div>
                <div class="signature-slide-content">
                    <span class="quote-mark quote-top">"</span>
                    <h3 class="signature-slide-title">시그니처 섹션 설명</h3>
                    <span class="quote-mark quote-bottom">"</span>
                </div>
            `;
            slidesContainer.appendChild(slideElement);

            // Placeholder 적용
            const placeholderImg = slideElement.querySelector('.empty-image-placeholder');
            if (placeholderImg) {
                ImageHelpers.applyPlaceholder(placeholderImg);
            }
        }

        if (typeof window.initSignatureSlider === 'function') {
            window.initSignatureSlider();
        }
    }

    /**
     * Closing 섹션 매핑
     */
    mapClosingSection() {
        if (!this.isDataLoaded) return;

        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');
        if (!closingData) return;

        // 배경 이미지 매핑
        const img = this.safeSelect('[data-closing-image]');
        if (img) {
            if (closingData.images?.[0]) {
                img.src = closingData.images[0].url;
                img.classList.remove('empty-image-placeholder');
            } else {
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.classList.add('empty-image-placeholder');
                img.alt = 'No Image Available';
            }
        }

        // Logo 이미지 매핑
        const logoImg = this.safeSelect('[data-closing-logo]');
        if (logoImg) {
            const logoImages = this.safeGet(this.data, 'homepage.images.0.logo');
            if (logoImages && logoImages.length > 0 && logoImages[0]?.url) {
                logoImg.src = logoImages[0].url;
                logoImg.classList.remove('empty-image-placeholder');
            } else {
                logoImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
                logoImg.classList.add('empty-image-placeholder');
            }
        }
    }

    /**
     * Property 정보 매핑 (이름, 영문명)
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.safeGet(this.data, 'property.name') || '숙소명';
        const propertyNameEn = this.safeGet(this.data, 'property.nameEn') || 'PROPERTY NAME';

        // Map property name to all elements
        this.safeSelectAll('.logo-text, .brand-title, [data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        this.safeSelectAll('.logo-subtitle, .brand-subtitle, [data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Index 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // Index 페이지 섹션들 순차 매핑
        this.mapPropertyInfo();
        this.mapHeroSection();
        this.mapRoomPreviewSection();
        this.mapEssenceSection();
        this.mapGallerySection();
        this.mapSignatureSection();
        this.mapClosingSection();
        this.updateMetaTags();
        this.reinitializeScrollAnimations();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}

// 자동 초기화 및 window.baseMapper 등록
(function() {
    'use strict';

    // 페이지 로드 완료 후 매퍼 초기화
    function initMapper() {
        // PreviewHandler가 이미 존재하면 초기화하지 않음 (PreviewHandler가 처리)
        if (window.previewHandler) {
            return;
        }

        // 일반 초기화 (JSON 파일 로드)
        const mapper = new IndexMapper();
        window.baseMapper = mapper;
        mapper.initialize();
    }

    // DOMContentLoaded 이후에 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapper);
    } else {
        initMapper();
    }
})();
