function initLayoutMapSwipers() {
  // con01 히어로 (단일 슬라이드)
  if ($('.con01 .swiper-slide').length > 1) {
    initSwiper($('.con01'), {
      slidesPerView: 1,
      effect: 'fade',
      autoplay: { delay: 2500, disableOnInteraction: false },
      loop: true,
    });
  }

  // con1 Room Preview Swiper
  initSwiper($('.con1'), {
    slidesPerView: 3,
    spaceBetween: 40,
    loop: true,
    speed: 1000,
    allowTouchMove: true,
    waitForTransition: false,
    autoplay: { delay: 3000, disableOnInteraction: false },
    pagination: {
      el: $('.con1 .swiper-pagination')[0],
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + ($('.con1 .swiper-slide').eq(index).data('title') || '') + '</span>';
      },
    },
    navigation: {
      nextEl: $('.con1 .swiper-button-next')[0],
      prevEl: $('.con1 .swiper-button-prev')[0],
    },
    on: {
      init: function () {
        $('.con1 .total').text($('.con1 .swiper-slide').length);
      },
      slideChange: function () {
        $('.con1 .number').text(this.realIndex + 1);
      },
    },
    breakpoints: {
      0:    { slidesPerView: 1, spaceBetween: 20 },
      768:  { slidesPerView: 2, spaceBetween: 30 },
      1440: { slidesPerView: 3, spaceBetween: 40 },
    },
  });
}

$(document).ready(function () {
  // Mapper 완료 후 swiper 초기화
  setTimeout(function () {
    initLayoutMapSwipers();
  }, 100);
});

// enabled 상태 확인 (preview-handler 데이터 업데이트 시)
// preview-handler가 없으면 localhost이므로 체크 안 함
function checkLayoutMapEnabled() {
  if (!window.previewHandler) return;

  if (window.previewHandler.currentData) {
    const layoutEnabled = window.previewHandler.currentData?.homepage?.customFields?.pages?.layoutMap?.sections?.[0]?.enabled;
    if (layoutEnabled === false) {
      window.location.href = '404.html';
      return;
    }
  }
}
window._checkPageEnabled = checkLayoutMapEnabled;
