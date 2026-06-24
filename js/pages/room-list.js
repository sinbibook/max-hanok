$(document).ready(function () {
  // con0 히어로 (단일 슬라이드)
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
});
