$(document).ready(function () {
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

  // con7 이미지 롤링
  var $con7 = $('.con7');
  if ($con7.length) {
    cloneImages($con7);
    startRolling($con7);
  }

  // con4 타이핑 효과
  typingEffect(
    $('#typing1'), $('#typing2'),
    $('#cursor1'), $('#cursor2'),
    $('.typing-container')
  );
});
