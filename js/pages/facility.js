$(document).ready(function () {
  // Mapper 완료 후 swiper 초기화
  setTimeout(function () {
    // con0 히어로 Swiper
    if ($('.con0 .swiper-slide').length > 1) {
      initSwiper($('.con0'), {
        slidesPerView: 1,
        effect: 'fade',
        autoplay: { delay: 2500, disableOnInteraction: false },
        loop: true,
        navigation: {
          nextEl: $('.con0 .swiper-button-next')[0],
          prevEl: $('.con0 .swiper-button-prev')[0],
        },
      });
    }

    // con3 Special Preview Swiper
    initSwiper($('.con3'), {
      slidesPerView: 1,
      spaceBetween: 40,
      pagination: {
        el: $('.con3 .swiper-pagination')[0],
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + ($('.con3 .swiper-slide').eq(index).data('title') || '') + '</span>';
        },
      },
    });
  }, 100);
});
