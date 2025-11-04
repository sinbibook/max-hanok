/**
 * Facility Page Functionality
 * 시설 페이지 슬라이더 기능
 */

// Navigation function
function navigateToHome() {
    window.location.href = 'index.html';
}

// Facility Slider Functions
window.facilityCurrentSlide = 0;
window.facilityTotalSlides = 1;

function updateFacilitySlider() {
    const slides = document.querySelectorAll('.facility-slide');
    const indicators = document.querySelectorAll('.facility-indicator');

    slides.forEach((slide, index) => {
        slide.style.opacity = index === window.facilityCurrentSlide ? '1' : '0';
    });

    indicators.forEach((indicator, index) => {
        indicator.style.background = index === window.facilityCurrentSlide ? 'white' : 'rgba(255,255,255,0.5)';
    });
}

function nextFacilitySlide() {
    if (window.facilityTotalSlides <= 1) return;

    window.facilityCurrentSlide = (window.facilityCurrentSlide + 1) % window.facilityTotalSlides;
    updateFacilitySlider();
}

function prevFacilitySlide() {
    if (window.facilityTotalSlides <= 1) return;

    window.facilityCurrentSlide = window.facilityCurrentSlide === 0
        ? window.facilityTotalSlides - 1
        : window.facilityCurrentSlide - 1;
    updateFacilitySlider();
}

function goToFacilitySlide(index) {
    if (index >= 0 && index < window.facilityTotalSlides) {
        window.facilityCurrentSlide = index;
        updateFacilitySlider();
    }
}

// Auto-play functionality (optional)
let facilityAutoSlideTimer;
function startFacilityAutoSlide() {
    if (window.facilityTotalSlides <= 1) return;

    facilityAutoSlideTimer = setInterval(() => {
        nextFacilitySlide();
    }, 4000); // 4초마다 자동 슬라이드
}

function stopFacilityAutoSlide() {
    if (facilityAutoSlideTimer) {
        clearInterval(facilityAutoSlideTimer);
    }
}

// Touch 슬라이드 변수
let facilityTouchStartX = 0;
let facilityTouchEndX = 0;
let facilityIsTouchMove = false;

// Touch 이벤트 핸들러
function handleFacilityTouchStart(e) {
    facilityTouchStartX = e.changedTouches[0].screenX;
    facilityIsTouchMove = false;
}

function handleFacilityTouchMove(e) {
    facilityIsTouchMove = true;
}

function handleFacilityTouchEnd(e) {
    facilityTouchEndX = e.changedTouches[0].screenX;

    if (!facilityIsTouchMove) return;

    const threshold = 50; // 최소 스와이프 거리
    const swipeDistance = facilityTouchStartX - facilityTouchEndX;

    if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
            // 왼쪽으로 스와이프 = 다음 슬라이드
            nextFacilitySlide();
        } else {
            // 오른쪽으로 스와이프 = 이전 슬라이드
            prevFacilitySlide();
        }
    }
}

// Experience Section 렌더링
function renderExperienceSection(facilityData) {
    const experienceSection = document.querySelector('[data-experience-section]');
    const experienceContainer = document.querySelector('[data-experience-container]');

    if (!experienceSection || !experienceContainer) return;

    // URL에서 facility id 추출
    const urlParams = new URLSearchParams(window.location.search);
    const facilityId = urlParams.get('id');

    if (!facilityId) {
        experienceSection.classList.add('is-hidden');
        return;
    }

    // 현재 시설의 customFields에서 experience 데이터 가져오기
    const facilityCustomFields = facilityData?.homepage?.customFields?.pages?.facility;

    const currentFacility = facilityCustomFields?.find(f => f.id === facilityId);

    const experience = currentFacility?.sections?.[0]?.experience;

    if (!experience) {
        experienceSection.classList.add('is-hidden');
        return;
    }

    // experience 객체 내의 데이터 확인
    const hasData = (experience.features && experience.features.length > 0) ||
                    (experience.additionalInfos && experience.additionalInfos.length > 0) ||
                    (experience.benefits && experience.benefits.length > 0);

    if (!hasData) {
        experienceSection.classList.add('is-hidden');
        return;
    }

    // 섹션 표시
    experienceSection.classList.remove('is-hidden');
    experienceContainer.innerHTML = '';

    // 카드 생성 - 순서 유지를 위해 배열 순서대로 처리
    const cardDataTypes = ['features', 'additionalInfos', 'benefits'];
    cardDataTypes.forEach(type => {
        const items = experience[type];
        if (items && items.length > 0) {
            const card = createExperienceCard(items);
            experienceContainer.appendChild(card);
        }
    });
}

// Experience 카드 생성 헬퍼 함수
function createExperienceCard(items) {
    const card = document.createElement('div');
    card.className = 'experience-card';

    // 각 아이템을 직접 카드에 추가
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'experience-item';

        // title 추가
        if (item.title) {
            const titleEl = document.createElement('strong');
            titleEl.textContent = item.title;
            itemDiv.appendChild(titleEl);
        }

        // description 추가 (개행 처리는 CSS white-space: pre-line으로 처리)
        if (item.description) {
            const descEl = document.createElement('div');
            descEl.className = 'experience-item-desc';
            // textContent 사용으로 XSS 방지, CSS가 개행 처리
            descEl.textContent = item.description;
            itemDiv.appendChild(descEl);
        }

        card.appendChild(itemDiv);
    });

    return card;
}

// FacilityMapper 초기화
async function initializeFacilityMapper() {
    try {
        const facilityMapper = new FacilityMapper();
        await facilityMapper.initialize();

        // setupNavigation이 있으면 호출
        if (typeof facilityMapper.setupNavigation === 'function') {
            facilityMapper.setupNavigation();
        }

        // Experience Section 렌더링 - facilityMapper.data 사용
        const data = facilityMapper.data || window.templateData;
        if (data) {
            renderExperienceSection(data);
        }
    } catch (error) {
        console.error('Error initializing facility mapper:', error);
    }
}

// Mouse hover와 Touch 이벤트 설정
document.addEventListener('DOMContentLoaded', function() {
    // iframe 환경(어드민 미리보기)에서는 PreviewHandler가 초기화 담당
    if (!window.APP_CONFIG.isInIframe()) {
        // 일반 환경: FacilityMapper가 직접 초기화
        initializeFacilityMapper();
    }
    // iframe 환경에서는 PreviewHandler가 FacilityMapper 호출

    setTimeout(() => {
        const sliderWrapper = document.querySelector('.facility-slider-wrapper');
        if (sliderWrapper) {
            // Mouse 이벤트
            sliderWrapper.addEventListener('mouseenter', stopFacilityAutoSlide);
            sliderWrapper.addEventListener('mouseleave', startFacilityAutoSlide);

            // Touch 이벤트
            sliderWrapper.addEventListener('touchstart', handleFacilityTouchStart, { passive: true });
            sliderWrapper.addEventListener('touchmove', handleFacilityTouchMove, { passive: true });
            sliderWrapper.addEventListener('touchend', handleFacilityTouchEnd, { passive: true });

            // 초기 auto-play 시작
            startFacilityAutoSlide();
        }
    }, 1000);
});