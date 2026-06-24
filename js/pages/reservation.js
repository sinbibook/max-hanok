$(document).ready(function () {
  // con0 히어로 (단일 슬라이드)
  if ($('.con0 .swiper-slide').length > 1) {
    initSwiper($('.con0'), {
      slidesPerView: 1,
      effect: 'fade',
      autoplay: { delay: 2500, disableOnInteraction: false },
      loop: true,
    });
  }

  // 아코디언
  $(document).on('click', '.accordionHeader', function () {
    var target = $(this).data('target');
    var $content = $('#' + target);
    var $accordion = $(this).closest('.accordion');

    if ($content.hasClass('active')) {
      $content.removeClass('active');
      $accordion.removeClass('open');
    } else {
      $content.addClass('active');
      $accordion.addClass('open');
    }
  });
});
