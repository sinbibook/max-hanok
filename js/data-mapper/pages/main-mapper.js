/**
 * Main Page Data Mapper
 * main.html 전용 매핑 로직
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    mapPropertySummary() {
        if (!this.isDataLoaded) return;

        // Map hero title and description from customFields
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');

        const heroTitleEl = this.safeSelect('[data-homepage-customFields-pages-main-sections-0-hero-title]');
        if (heroTitleEl && heroData?.title) {
            heroTitleEl.textContent = heroData.title;
        }

        const heroDescriptionEl = this.safeSelect('[data-homepage-customFields-pages-main-sections-0-hero-description]');
        if (heroDescriptionEl && heroData?.description) {
            heroDescriptionEl.innerHTML = this._formatTextWithLineBreaks(heroData.description);
        }
    }

    /**
     * Main hero section 매핑 (preview-handler용)
     */
    mapMainHeroSection() {
        this.mapPropertySummary();
        this.mapPropertyImages();
    }

    /**
     * Main content sections 매핑 (preview-handler용)
     */
    mapMainContentSections() {
        this.mapIntroText();
        this.mapAboutImages();
    }

    mapIntroText() {
        const aboutSections = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');
        if (!Array.isArray(aboutSections) || aboutSections.length === 0) return;

        const container = this.safeSelect('.about-sections-container');
        if (!container) return;

        const htmlParts = [];
        aboutSections.forEach((section, index) => {
            // 홀수 순서 (1번째, 3번째...) = index 0, 2, 4... → title: right, desc: left
            // 짝수 순서 (2번째, 4번째...) = index 1, 3, 5... → title: left, desc: right
            const isOddOrder = (index + 1) % 2 === 1;
            const titlePosition = isOddOrder ? 'right' : 'left';
            const descPosition = isOddOrder ? 'left' : 'right';

            const title = section.title || '';
            const description = section.description || '';

            htmlParts.push(`
                <div class="about-section" data-section-index="${index}">
                    <div class="subNav ${titlePosition}" style="margin-bottom: 50px; margin-top: ${index === 0 ? '0px' : '50px'} !important;">
                        <p class="mt5" data-homepage-customFields-pages-main-sections-0-about-${index}-title>${this._formatTextWithLineBreaks(title)}</p>
                    </div>
                    <div class="subNav about-description ${descPosition}">
                        <p class="mt5" data-homepage-customFields-pages-main-sections-0-about-${index}-description>${this._formatTextWithLineBreaks(description)}</p>
                    </div>
                    <div class="con2Top about-images-wrapper" data-about-index="${index}">
                        <!-- Images will be dynamically generated here -->
                    </div>
                </div>
            `);
        });

        container.innerHTML = htmlParts.join('');
    }

    mapPropertyImages() {
        // Map data-homepage-customFields-pages-main-sections-0-hero-images-0-url
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero.images');
        const element = this.safeSelect('[data-homepage-customFields-pages-main-sections-0-hero-images-0-url]');

        if (element) {
            let imageUrl = null;
            let hasImage = false;

            // Get first SELECTED hero image using ImageHelpers
            const firstSelectedImage = ImageHelpers.getFirstSelectedImage(heroImages);
            if (firstSelectedImage && firstSelectedImage.url) {
                imageUrl = firstSelectedImage.url;
                hasImage = true;
            }

            // Use empty placeholder if no image found
            if (!imageUrl) {
                imageUrl = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                element.classList.add('empty-image-placeholder');
            } else {
                element.classList.remove('empty-image-placeholder');
            }

            let extra = element.dataset.bgExtra ? ` ${element.dataset.bgExtra}` : '';
            if (!extra && element.classList.contains('fBanner')) {
                extra = ' fixed';
            }

            const value = `url("${imageUrl}") center/cover no-repeat${extra}`.trim();
            element.style.background = value;

            // If it's a real image, add error handling
            if (hasImage) {
                const img = new Image();
                img.onerror = function() {
                    element.style.background = `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}") center/cover no-repeat${extra}`.trim();
                    element.classList.add('empty-image-placeholder');
                };
                img.src = imageUrl;
            }
        }
    }

    mapAboutImages() {
        const aboutSections = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');
        if (!Array.isArray(aboutSections) || aboutSections.length === 0) return;

        aboutSections.forEach((section, sectionIndex) => {
            const container = this.safeSelect(`.about-images-wrapper[data-about-index="${sectionIndex}"]`);
            if (!container) return;

            // Collect images from this about section
            const sectionImages = section?.images || [];

            // Filter selected images and sort by sortOrder using ImageHelpers
            const allImages = ImageHelpers.filterSelectedImages(sectionImages);

            // 홀수 섹션 (1번, 3번...): 왼쪽 크게, 오른쪽 작게
            // 짝수 섹션 (2번, 4번...): 왼쪽 작게, 오른쪽 크게
            const isOddSection = (sectionIndex + 1) % 2 === 1;

            // Map all images (2 images per row)
            const htmlParts = [];
            allImages.forEach((imageData, index) => {
                const isLeftImage = index % 2 === 0;

                const hasImage = imageData?.url && imageData.url !== '';
                const imageUrl = hasImage ? imageData.url : ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                const imageClass = !hasImage ? 'empty-image-placeholder' : '';

                const shouldUseLargeImage = isOddSection ? isLeftImage : !isLeftImage;

                if (isLeftImage) {
                    // Left side
                    if (shouldUseLargeImage) {
                        // imgGrp pattern (큰 이미지)
                        htmlParts.push(`
                            <aside class="left">
                                <div class="imgGrp imgGrp0${index + 1} ${imageClass}"
                                     data-homepage-customFields-pages-main-sections-0-about-${sectionIndex}-images-${index}-url
                                     style="background-image: url('${imageUrl}');">
                                    <div class="imgGrpPic imgGrpPic0${index + 1}">
                                    </div>
                                </div>
                            </aside>`);
                    } else {
                        // txtGrp pattern (작은 이미지)
                        htmlParts.push(`
                            <aside class="left">
                                <div class="txtGrp txtGrp0${index + 1}">
                                    <div class="txtGrpImg txtGrpImg0${index + 1} ${imageClass}"
                                         data-homepage-customFields-pages-main-sections-0-about-${sectionIndex}-images-${index}-url
                                         style="background-image: url('${imageUrl}');">
                                    </div>
                                </div>
                            </aside>`);
                    }
                } else {
                    // Right side
                    if (shouldUseLargeImage) {
                        // imgGrp pattern (큰 이미지)
                        htmlParts.push(`
                            <aside class="right">
                                <div class="imgGrp imgGrp0${index + 1} ${imageClass}"
                                     data-homepage-customFields-pages-main-sections-0-about-${sectionIndex}-images-${index}-url
                                     style="background-image: url('${imageUrl}');">
                                    <div class="imgGrpPic imgGrpPic0${index + 1}">
                                    </div>
                                </div>
                            </aside>`);
                    } else {
                        // txtGrp pattern (작은 이미지)
                        htmlParts.push(`
                            <aside class="right">
                                <div class="txtGrp txtGrp0${index + 1}">
                                    <div class="txtGrpImg txtGrpImg0${index + 1} ${imageClass}"
                                         data-homepage-customFields-pages-main-sections-0-about-${sectionIndex}-images-${index}-url
                                         style="background-image: url('${imageUrl}');">
                                    </div>
                                </div>
                            </aside>`);
                    }
                }
            });

            // If no images, show empty placeholders
            if (allImages.length === 0) {
                htmlParts.push(`
                    <aside class="left">
                        <div class="imgGrp imgGrp01 empty-image-placeholder"
                             style="background-image: url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}');">
                            <div class="imgGrpPic imgGrpPic01">
                            </div>
                        </div>
                    </aside>
                    <aside class="right">
                        <div class="txtGrp txtGrp02">
                            <div class="txtGrpImg txtGrpImg02 empty-image-placeholder"
                                 style="background-image: url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}');">
                            </div>
                        </div>
                    </aside>`);
            }
            container.innerHTML = htmlParts.join('');
        });
    }

    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        this.mapPropertySummary();
        this.mapIntroText();
        this.mapPropertyImages();
        this.mapAboutImages();

        this.updateMetaTags(this.data.property);

        const mainSEO = this.safeGet(this.data, 'homepage.customFields.pages.main.seo');
        if (mainSEO) {
            this.updateSEOInfo(mainSEO);
        }

        // Favicon 매핑
        this.mapFavicon();

        this.mapEcommerceRegistration();
        this.reinitializeScrollAnimations();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}
