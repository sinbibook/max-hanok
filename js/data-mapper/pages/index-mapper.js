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
     * Video 엘리먼트 생성 헬퍼
     */
    _createVideoElement(url, extraAttrs = {}) {
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.autoplay = true;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        Object.entries(extraAttrs).forEach(([k, v]) => videoEl.setAttribute(k, v));
        return videoEl;
    }

    /**
     * videos 배열에서 isSelected + sortOrder 기준 첫 번째 영상 반환
     */
    _getSelectedVideo(videos) {
        return (videos || [])
            .filter(v => v.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0] || null;
    }

    /**
     * Hero 섹션 매핑 (슬라이더 이미지 생성)
     */
    mapHeroSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');

        const mediaType = heroData?.mediaType || 'image';
        if (mediaType === 'video') {
            this.mapHeroVideo(heroData?.videos || []);
        } else {
            this.mapHeroSlider(heroData?.images || []);
        }

        if (!heroData) return;

        // 슬라이더 초기화 (index.js의 initHeroSlider 호출)
        if (mediaType === 'image' && typeof window.initHeroSlider === 'function') {
            window.initHeroSlider(true); // skipDelay=true
        }
    }

    /**
     * Hero Video 매핑 (video 모드)
     */
    mapHeroVideo(videos) {
        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        const selectedVideo = this._getSelectedVideo(videos);

        if (!selectedVideo) {
            const slide = document.createElement('div');
            slide.className = 'hero-slide active';
            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = '영상 없음';
            img.className = 'empty-image-placeholder';
            slide.appendChild(img);
            heroSlider.appendChild(slide);
            return;
        }

        heroSlider.appendChild(this._createVideoElement(selectedVideo.url, { 'data-hero-video': '' }));
    }

    /**
     * Hero Slider 이미지 매핑 (image 모드)
     */
    mapHeroSlider(images) {
        const heroSlider = document.getElementById('hero-slider');
        if (!heroSlider) return;

        heroSlider.innerHTML = '';

        const normalizedImages = (images || [])
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (normalizedImages.length === 0) {
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
            normalizedImages.forEach((img, index) => {
                const slide = document.createElement('div');
                slide.className = `hero-slide${index === 0 ? ' active' : ''}`;
                slide.innerHTML = `<img src="${img.url}" alt="${img.description || 'Hero Image'}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
                heroSlider.appendChild(slide);
            });
        }
    }

    /**
     * Room Preview 섹션 매핑
     */
    mapRoomPreviewSection() {
        if (!this.isDataLoaded) return;

        const roomsData = this.safeGet(this.data, 'rooms') || [];

        const tabsContainer = this.safeSelect('[data-room-tabs]');
        const descriptionsContainer = this.safeSelect('[data-room-descriptions]');
        const imagesContainer = this.safeSelect('[data-room-images]');

        if (!tabsContainer || !descriptionsContainer || !imagesContainer) return;

        // 기존 콘텐츠 클리어
        tabsContainer.innerHTML = '';
        descriptionsContainer.innerHTML = '';
        imagesContainer.innerHTML = '';

        // rooms 데이터로 탭 리스트 생성
        const allRooms = roomsData;

        // 데이터가 없을 때 placeholder UI 생성
        if (allRooms.length === 0) {

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
                // customFields 헬퍼 함수 사용
                const roomCustomFields = this.getRoomTypeCustomFields(room.id);

                // 이름: customFields 우선, fallback rooms
                const roomName = this.getRoomName(room);

                // 이미지: customFields 이미지 사용 (category: roomtype_interior)
                const interiorImages = this.getRoomImages(room, 'roomtype_interior');

                // 탭 생성
                const tab = document.createElement('button');
                tab.className = `room-tab${index === 0 ? ' active' : ''}`;
                tab.setAttribute('data-room', room.id);
                tab.innerHTML = `
                    <span class="room-tab-content">
                        <span class="room-tab-number">${String(index + 1).padStart(2, '0')}</span>
                        <span class="room-tab-name">${roomName}</span>
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
                const description = roomCustomFields?.description || room.description || `${roomName} 객실입니다.`;
                descItem.innerHTML = `<p class="room-desc-text">${description}</p>`;
                descriptionsContainer.appendChild(descItem);

                // 이미지 슬라이더 생성 - customFields 객실 interior 이미지 사용
                const imageItem = document.createElement('div');
                imageItem.className = `room-image-item${index === 0 ? ' active' : ''}`;
                imageItem.setAttribute('data-room', room.id);

                // getRoomImages 헬퍼가 이미 isSelected 필터링과 정렬을 수행함
                if (interiorImages.length === 0) {
                    const img = document.createElement('img');
                    img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                    img.alt = 'No Room Image';
                    img.className = 'empty-image-placeholder';
                    imageItem.appendChild(img);
                } else {
                    const sliderHTML = `
                        <div class="room-image-slider">
                            <div class="room-slide-track">
                                ${interiorImages.map((img, imgIndex) => `
                                    <div class="room-slide${imgIndex === 0 ? ' active' : ''}">
                                        <img src="${img.url}" alt="${img.description || roomName}" loading="lazy">
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

            // Room tabs 이벤트 리스너 - 모바일과 데스크톱 지원
            const tabs = document.querySelectorAll('.room-tab');
            const images = document.querySelectorAll('.room-image-item');
            const descItems = document.querySelectorAll('.room-desc-item');

            function activateTab(tab) {
                const roomId = tab.dataset.room;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                images.forEach(img => {
                    img.classList.toggle('active', img.dataset.room === roomId);
                });

                descItems.forEach(item => {
                    item.classList.toggle('active', item.dataset.room === roomId);
                });
            }

            tabs.forEach(tab => {
                // Desktop: hover event
                tab.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        activateTab(tab);
                    }
                });

                // Mobile: click/touch event
                tab.addEventListener('click', (e) => {
                    // 상세보기 버튼 클릭이 아닌 경우에만 탭 활성화
                    if (!e.target.closest('.room-tab-detail-btn')) {
                        e.preventDefault();
                        activateTab(tab);
                    }
                });

                // iOS Safari 전용 터치 이벤트
                tab.addEventListener('touchend', (e) => {
                    // 상세보기 버튼 클릭이 아닌 경우에만 탭 활성화
                    if (!e.target.closest('.room-tab-detail-btn')) {
                        e.preventDefault();
                        activateTab(tab);
                    }
                }, { passive: false });
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

        this._resetEssenceLayout();

        const mediaType = essenceData.mediaType || 'image';
        if (mediaType === 'video') {
            this.initEssenceVideo(essenceData.videos || []);
        } else {
            this.initEssenceImages(essenceData.images || []);
        }
    }

    /**
     * Essence 레이아웃 초기화 (video ↔ image 전환 시 cleanup)
     */
    _resetEssenceLayout() {
        const left = this.safeSelect('[data-essence-image-0]');
        const right = this.safeSelect('[data-essence-image-1]');

        if (left) {
            left.querySelectorAll('video').forEach(v => v.remove());
            const img = left.querySelector('img');
            if (img) img.style.display = '';
            left.style.gridColumn = '';
            left.classList.remove('video-mode');
        }
        if (right) right.style.display = '';
    }

    /**
     * Essence Video 매핑 (video 모드)
     * - right 슬롯 숨기고, left 슬롯을 2컬럼으로 확장
     */
    initEssenceVideo(videos) {
        const left = this.safeSelect('[data-essence-image-0]');
        const right = this.safeSelect('[data-essence-image-1]');

        if (right) right.style.display = 'none';

        if (left) {
            left.style.gridColumn = '1 / 3';
            left.classList.add('video-mode');
            const img = left.querySelector('img');
            if (img) img.style.display = 'none';

            const selectedVideo = this._getSelectedVideo(videos);
            if (selectedVideo) {
                const videoEl = this._createVideoElement(selectedVideo.url);
                left.appendChild(videoEl);
            } else {
                if (img) {
                    img.style.display = '';
                    img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                    img.classList.add('empty-image-placeholder');
                }
            }
        }
    }

    /**
     * Essence 이미지 매핑 (image 모드)
     */
    initEssenceImages(images) {
        const selectedImages = (images || [])
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

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

        applyImage(this.safeSelect('[data-essence-image-0]'), selectedImages[0]);
        applyImage(this.safeSelect('[data-essence-image-1]'), selectedImages[1]);
    }

    /**
     * Gallery 섹션 매핑
     */
    mapGallerySection() {
        if (!this.isDataLoaded) return;

        const galleryData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.gallery');
        if (!galleryData) return;

        const titleElement = this.safeSelect('[data-gallery-title]');
        const imagesWrapper = this.safeSelect('[data-gallery-images]');

        if (titleElement) {
            const title = (galleryData.title !== undefined && galleryData.title !== '')
                ? galleryData.title
                : '갤러리 섹션 타이틀';
            titleElement.textContent = title;
        }

        if (!imagesWrapper) return;

        // 기존 video 제거 (모드 전환 시 cleanup)
        const container = imagesWrapper.closest('.experience-container');
        if (container) {
            const existingVideo = container.querySelector('.gallery-video-container');
            if (existingVideo) existingVideo.remove();
        }
        imagesWrapper.style.display = '';

        const mediaType = galleryData.mediaType || 'image';

        if (mediaType === 'video') {
            const selectedVideo = this._getSelectedVideo(galleryData.videos);
            imagesWrapper.style.display = 'none';

            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'gallery-video-container';

            if (selectedVideo) {
                videoWrapper.appendChild(this._createVideoElement(selectedVideo.url));
            } else {
                const img = document.createElement('img');
                img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                img.alt = '영상 없음';
                img.classList.add('empty-image-placeholder');
                videoWrapper.appendChild(img);
            }

            if (container) container.appendChild(videoWrapper);
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

        const closingSection = this.safeSelect('.index-closing');
        const imgEl = this.safeSelect('[data-closing-image]');

        // 기존 video 제거 (모드 전환 시 cleanup)
        if (closingSection) {
            const existingVideo = closingSection.querySelector('.closing-video');
            if (existingVideo) existingVideo.remove();
        }

        const mediaType = closingData.mediaType || 'image';

        if (mediaType === 'video') {
            const selectedVideo = this._getSelectedVideo(closingData.videos);
            if (imgEl) imgEl.style.display = 'none';

            if (selectedVideo && closingSection) {
                const videoEl = this._createVideoElement(selectedVideo.url);
                videoEl.className = 'closing-video';
                closingSection.insertBefore(videoEl, closingSection.firstChild);
            } else if (imgEl) {
                imgEl.style.display = '';
                imgEl.src = ImageHelpers.EMPTY_IMAGE_SVG;
                imgEl.classList.add('empty-image-placeholder');
            }
        } else {
            if (imgEl) imgEl.style.display = '';
            const img = imgEl;
            if (img) {
                const selectedImages = (closingData.images || [])
                    .filter(i => i.isSelected === true)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

                if (selectedImages[0]?.url) {
                    img.src = selectedImages[0].url;
                    img.classList.remove('empty-image-placeholder');
                } else if (closingData.images?.[0]?.url) {
                    img.src = closingData.images[0].url;
                    img.classList.remove('empty-image-placeholder');
                } else {
                    img.src = ImageHelpers.EMPTY_IMAGE_SVG;
                    img.classList.add('empty-image-placeholder');
                    img.alt = 'No Image Available';
                }
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

        // customFields 헬퍼 함수 사용
        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

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
