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
     * Room Preview 섹션 매핑 (새로운 flex 레이아웃)
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

        // 1. unique한 group 추출
        const uniqueGroups = (roomsData && Array.isArray(roomsData))
            ? [...new Set(roomsData.map(room => room.group).filter(Boolean))]
            : [];

        // 데이터가 없을 때 placeholder UI 생성
        if (uniqueGroups.length === 0) {
            // Placeholder 탭
            const placeholderLi = document.createElement('li');
            placeholderLi.className = 'rname active';
            placeholderLi.setAttribute('data-room', 'placeholder');
            placeholderLi.textContent = 'No Rooms';
            tabsContainer.appendChild(placeholderLi);

            // Placeholder 설명
            const placeholderDesc = document.createElement('ul');
            placeholderDesc.className = 'active';
            placeholderDesc.setAttribute('data-room', 'placeholder');
            placeholderDesc.innerHTML = '<li>객실 정보가 없습니다.</li>';
            descriptionsContainer.appendChild(placeholderDesc);

            // Placeholder 이미지
            const placeholderImg = document.createElement('div');
            placeholderImg.className = 'imgbox active';
            placeholderImg.setAttribute('data-room', 'placeholder');
            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Room Image';
            img.className = 'empty-image-placeholder';
            placeholderImg.appendChild(img);
            imagesContainer.appendChild(placeholderImg);
        } else {
            uniqueGroups.forEach((group, index) => {
                // 해당 그룹의 모든 객실 찾기
                const roomsInGroup = roomsData.filter(room => room.group === group);
                if (roomsInGroup.length === 0) return;

                // 탭 생성 (li)
                const li = document.createElement('li');
                li.className = `rname${index === 0 ? ' active' : ''}`;
                li.setAttribute('data-room', group);
                li.textContent = group;
                tabsContainer.appendChild(li);

                // 설명 생성 (ul)
                const descUl = document.createElement('ul');
                descUl.className = index === 0 ? 'active' : '';
                descUl.setAttribute('data-room', group);
                
                const propertyName = this.getPropertyName();
                const descLi = document.createElement('li');
                descLi.textContent = propertyName + '의 ' + group + ' 객실입니다.';
                descUl.appendChild(descLi);
                
                descriptionsContainer.appendChild(descUl);

                // 이미지 박스 생성 - 그룹의 모든 객실 썸네일 수집
                const imgBox = document.createElement('div');
                imgBox.className = `imgbox${index === 0 ? ' active' : ''}`;
                imgBox.setAttribute('data-room', group);

                // 그룹 내 모든 객실의 썸네일 수집
                const allThumbnails = [];
                roomsInGroup.forEach(room => {
                    const selectedThumbnails = this.getRoomImages(room, 'roomtype_thumbnail');
                    allThumbnails.push(...selectedThumbnails);
                });

                if (allThumbnails.length === 0) {
                    imgBox.innerHTML = `
                        <a href="room-list.html?group=${encodeURIComponent(group)}" class="dpb rname">
                            <img src="${ImageHelpers.EMPTY_IMAGE_SVG}" alt="${group}" class="empty-image-placeholder">
                            <span class="room-view-btn">View More
                                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7,7 17,7 17,17"></polyline>
                                </svg>
                            </span>
                        </a>
                    `;
                } else {
                    // 이미지 슬라이더 생성
                    let sliderHTML = `
                        <a href="room-list.html?group=${encodeURIComponent(group)}" class="dpb rname">
                            <div class="room-image-slider">
                                <div class="room-slide-track">
                                    ${allThumbnails.map((img, imgIndex) => `
                                        <div class="room-slide${imgIndex === 0 ? ' active' : ''}">
                                            <img src="${img.url}" alt="${img.description || group}" loading="lazy">
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="room-slider-nav">
                                    <button class="room-slider-btn prev">&lt;</button>
                                    <button class="room-slider-btn next">&gt;</button>
                                </div>
                            </div>
                            <span class="room-view-btn">View More
                                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7,7 17,7 17,17"></polyline>
                                </svg>
                            </span>
                        </a>
                    `;
                    imgBox.innerHTML = sliderHTML;
                }
                imagesContainer.appendChild(imgBox);
                
                // 슬라이더 초기화
                if (typeof window.initRoomImageSlider === 'function') {
                    window.initRoomImageSlider();
                }
            });

            // Room tabs 이벤트 리스너
            const tabLis = document.querySelectorAll('[data-room-tabs] li');
            const imgBoxes = document.querySelectorAll('[data-room-images] .imgbox');
            const descUls = document.querySelectorAll('[data-room-descriptions] ul');

            function activateTab(li) {
                const roomType = li.dataset.room;
                tabLis.forEach(t => t.classList.remove('active'));
                li.classList.add('active');

                imgBoxes.forEach(box => {
                    box.classList.toggle('active', box.dataset.room === roomType);
                });

                descUls.forEach(ul => {
                    ul.classList.toggle('active', ul.dataset.room === roomType);
                });
            }

            tabLis.forEach(li => {
                // Desktop: mouseenter event
                li.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        activateTab(li);
                    }
                });

                // Mobile: click event
                li.addEventListener('click', (e) => {
                    activateTab(li);
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

        const titleEl = this.safeSelect('[data-essence-description]');
        const descEl = this.safeSelect('[data-essence-title]');

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

        // Placeholder 슬라이드 생성 함수
        const createPlaceholderSlide = () => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_SVG;
            img.alt = 'No Image Available';
            img.className = 'empty-image-placeholder';
            img.loading = 'lazy';
            const caption = document.createElement('div');
            caption.className = 'gallery-caption';
            caption.innerHTML = '<h4>5개 이상의 이미지를 추가해주세요</h4>';
            slide.appendChild(img);
            slide.appendChild(caption);
            return slide;
        };

        // 슬라이드 HTML 조각 생성 함수
        const createSlideHTML = (imgData) => {
            const description = imgData.description || '갤러리 섹션 설명';
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            slide.innerHTML = `
                <img src="${imgData.url}" alt="${description}" loading="lazy">
                <div class="gallery-caption">
                    <h4>${description}</h4>
                </div>
            `;
            return slide;
        };

        // 원본 슬라이드 목록 구성
        const slideCreators = [];
        selectedImages.forEach(img => {
            slideCreators.push(() => createSlideHTML(img));
        });

        // 5개 미만이면 placeholder로 채우기
        if (selectedImages.length < 5) {
            const placeholderCount = 5 - selectedImages.length;
            for (let i = 0; i < placeholderCount; i++) {
                slideCreators.push(() => createPlaceholderSlide());
            }
        }

        // 원본 개수를 data 속성으로 저장 (JS에서 사용)
        imagesWrapper.dataset.originalCount = slideCreators.length;

        // 3세트 생성 (무한 루프용: 앞 1세트 + 원본 1세트 + 뒤 1세트)
        for (let set = 0; set < 3; set++) {
            slideCreators.forEach(creator => {
                imagesWrapper.appendChild(creator());
            });
        }

        // Initialize gallery slider
        if (typeof initGallerySlider === 'function') {
            initGallerySlider();
        }
    }


    /**
     * Closing 섹션 매핑
     */
    mapClosingSection() {
        if (!this.isDataLoaded) return;

        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');
        if (!closingData) return;

        // 배경 이미지 매핑 (데스크탑 parallax)
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

        // 모바일 이미지 매핑 (원형 구멍 안)
        const mobileImg = this.safeSelect('[data-closing-image-mobile]');
        if (mobileImg) {
            if (closingData.images?.[0]) {
                mobileImg.src = closingData.images[0].url;
                mobileImg.classList.remove('empty-image-placeholder');
            } else {
                mobileImg.src = ImageHelpers.EMPTY_IMAGE_SVG;
                mobileImg.classList.add('empty-image-placeholder');
                mobileImg.alt = 'No Image Available';
            }
        }

        // Closing Subtitle 매핑 (closing title 사용)
        const closingSubtitle = this.safeSelect('[data-closing-subtitle]');
        if (closingSubtitle) {
            closingSubtitle.textContent = closingData.title || '';
        }

        // Closing Title 매핑
        const closingTitle = this.safeSelect('[data-closing-title]');
        if (closingTitle) {
            closingTitle.textContent = closingData.title || '';
        }
    }

    /**
     * Property 정보 매핑 (이름, 영문명) - customFields 우선
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

        // Map property name to all elements
        this.safeSelectAll('.logo-text, .brand-title, [data-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });

        this.safeSelectAll('.logo-subtitle, .brand-subtitle, [data-property-name]').forEach(el => {
            el.textContent = propertyName;
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
