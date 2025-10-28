/**
 * Main Page Data Mapper
 * main.html 전용 매핑 로직
 */
class MainMapper extends BaseDataMapper {
    constructor(data = null) {
        super();
        if (data) {
            this.data = data;
            this.isDataLoaded = true;
        }
    }

    /**
     * Main 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        this.mapAboutSection();
        this.mapHeroImage();
        this.mapWaveBackgroundImage();
        this.updateMetaTags(this.data.property);
        this.updateFavicon();
    }


    /**
     * Main Content 섹션 매핑 (preview-handler용)
     */
    mapMainContentSections() {
        this.mapAboutSection();
    }

    /**
     * About 섹션 동적 생성 및 매핑
     */
    mapAboutSection() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        // About 데이터 가져오기
        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');
        const aboutContainer = this.safeSelect('[data-homepage-customFields-pages-main-sections-about-items]');

        if (!aboutContainer) {
            return;
        }

        aboutContainer.innerHTML = '';

        // about 배열이 없거나 비어있을 때 json 기본값으로 1개 아이템 표시
        let itemsToRender = [];
        if (!Array.isArray(aboutData) || aboutData.length === 0) {
            // json의 기본값 가져오기
            const defaultAbout = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about.0');
            itemsToRender = [
                defaultAbout || {
                    title: '',
                    description: '소개 섹션 설명',
                    images: []
                }
            ];
        } else {
            itemsToRender = aboutData;
        }

        // About 항목들 동적 생성
        itemsToRender.forEach((aboutItem, index) => {
            if (!aboutItem) return;

            // 통합된 about 섹션 생성
            const aboutSection = document.createElement('section');
            if (index === 0) {
                aboutSection.className = 'about-section relative w-full pt-32 px-6 md:px-0';
            } else {
                aboutSection.className = 'about-section relative w-full pb-8 px-6 md:px-0 about2-section';
            }

            const textAreaClass = index === 0 ? 'flex items-center justify-center py-24' : 'flex items-center justify-center pt-24 pb-16';

            const descriptionText = (aboutItem.description !== undefined && aboutItem.description !== null)
                ? aboutItem.description
                : '';

            aboutSection.innerHTML = `
                <!-- 이미지 영역 -->
                <div class="flex items-center justify-center mb-8">
                    <div class="main-image-container relative">
                        <div class="main-image-wrapper fade-in-scale">
                            <img src=""
                                 alt="${aboutItem.title || '펜션 이미지'}"
                                 class="w-[500px] md:w-[700px] lg:w-[900px] h-80 md:h-96 lg:h-[400px] object-cover empty-image-placeholder">
                        </div>
                    </div>
                </div>

                <!-- 텍스트 영역 -->
                <div class="${textAreaClass}">
                    <div class="max-w-4xl mx-auto text-center px-6">
                        <div class="text-md md:text-lg text-gray-700 mb-6 ko-body fade-in-up" style="line-height: 2;">
                            ${descriptionText.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
            `;

            // 컨테이너에 추가
            aboutContainer.appendChild(aboutSection);

            // 이미지 매핑
            const imageElement = aboutSection.querySelector('img');
            if (imageElement && aboutItem.images && aboutItem.images.length > 0) {
                const firstImage = aboutItem.images[0];
                if (firstImage && firstImage.url) {
                    imageElement.src = firstImage.url;
                    imageElement.alt = firstImage.description || aboutItem.title || '펜션 이미지';
                    imageElement.classList.remove('empty-image-placeholder');
                }
            }
        });
    }

    /**
     * 히어로 이미지 매핑
     */
    mapHeroImage() {
        if (!this.isDataLoaded || !this.data.homepage) return;

        // Hero image 매핑
        const heroImageElement = this.safeSelect('[data-homepage-customFields-pages-main-sections-0-hero-images-0-url]');

        if (heroImageElement) {
            const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero.images');

            if (window.ImageHelpers) {
                window.ImageHelpers.applyImageOrPlaceholder(heroImageElement, heroImages);
            } else {
                if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0].url) {
                    heroImageElement.src = heroImages[0].url;
                    heroImageElement.alt = heroImages[0].description || '히어로 이미지';
                    heroImageElement.classList.remove('empty-image-placeholder');
                } else {
                    heroImageElement.src = '';
                    heroImageElement.alt = '이미지 없음';
                    heroImageElement.classList.add('empty-image-placeholder');
                }
            }
        }
    }


    /**
     * Wave 배경 이미지 매핑 (property 외경 이미지)
     */
    mapWaveBackgroundImage() {
        if (!this.isDataLoaded || !this.data.property) return;

        // Wave 배경 이미지 매핑
        const waveBackgroundElement = this.safeSelect('[data-property-exterior-images-0-url]');

        if (waveBackgroundElement) {
            const exteriorImages = this.safeGet(this.data, 'property.images.0.exterior');

            if (Array.isArray(exteriorImages) && exteriorImages.length > 0) {
                const selectedImage = exteriorImages.find(img => img.isSelected) || exteriorImages[0];
                if (selectedImage && selectedImage.url) {
                    waveBackgroundElement.style.backgroundImage = `url(${selectedImage.url})`;
                    waveBackgroundElement.classList.remove('empty-image-placeholder');
                } else {
                    waveBackgroundElement.style.backgroundImage = '';
                    waveBackgroundElement.classList.add('empty-image-placeholder');
                }
            } else {
                waveBackgroundElement.style.backgroundImage = '';
                waveBackgroundElement.classList.add('empty-image-placeholder');
            }
        }
    }


}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}
