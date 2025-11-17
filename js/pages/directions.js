// Directions Page with Slider and Animation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fullscreen slider using the reusable component
    const directionsSlider = new FullscreenSlider('.fullscreen-slider-container', {
        slideDuration: 4000,
        autoplay: true,
        enableSwipe: true,
        enableKeyboard: true
    });

    // Initialize location notes with icons
    initializeLocationNotes();

    // Initialize scroll animations
    setupScrollAnimations();
});

// 위치 안내 사항을 아이콘과 함께 동적으로 생성
function initializeLocationNotes() {
    const noteElement = document.querySelector('[data-directions-notes]');
    if (!noteElement) return;

    // 텍스트 내용을 가져와서 줄바꿈으로 분할
    const noteText = noteElement.textContent.trim();
    const noteLines = noteText.split('\n').filter(line => line.trim() !== '');

    // 새로운 HTML 구조 생성 (각 아이템에 애니메이션 지연 시간 추가)
    const noteItemsHTML = noteLines.map((line, index) => {
        const delay = 1.0 + (index * 0.15); // 1.0s, 1.15s, 1.3s 순차 지연
        return `
            <div class="note-item animate-element" style="transition-delay: ${delay}s;">
                <svg class="note-icon" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6"></path>
                </svg>
                ${line.trim()}
            </div>
        `;
    }).join('');

    // 기존 내용을 새로운 구조로 교체
    noteElement.innerHTML = noteItemsHTML;

    // 새로 생성된 요소들을 애니메이션 시스템에 다시 등록
    setTimeout(() => {
        setupScrollAnimations();
    }, 100);
}

// �ld `�TtX $
function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-element');

    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // 0 �l
    checkScroll();

    // �ld t�� ��
    window.addEventListener('scroll', checkScroll);

    // İ ��t� ��� �l
    window.addEventListener('resize', checkScroll);
}