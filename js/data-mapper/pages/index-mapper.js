(function (global) {
  'use strict';

  // 배경 이미지 적용 (url 있으면 cover 배경, 없으면 No-Image placeholder)
  function setBackground(el, url, label) {
    if (!el) return;
    if (url) {
      el.style.backgroundImage = 'url(' + url + ')';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.backgroundSize = 'cover';
      el.classList.remove('empty-image-placeholder');
    } else {
      ImageHelpers.applyBackgroundPlaceholder(el, label);
    }
  }

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapRoomSlides();
    this.mapSpecialList();
    this.mapLandscapeSlides();
    this.mapClosing();

    // 슬라이드가 만들어진 뒤에 Swiper / parallax 초기화
    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
    if (typeof window.initParallax === 'function') window.initParallax();
  };

  // index 페이지 섹션 (customFields.pages.index.sections[0])
  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  // MAPPER: customFields.property.propertyUnameEn / property.nameEn / property.name
  IndexMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    // 숙소명이 문장 안에 들어가는 슬롯 ([data-property-caption])
    this.applyPropertyCaptions();
  };

  // MAPPER: pages.index.sections[0].hero.images[isSelected] → [data-index-hero-slides]
  //         pages.index.sections[0].hero.description → [data-index-hero-description]
  IndexMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    // 히어로 타이틀 — 원본의 숙소 표시명 자리다. getPropertyNameEn() 과 다른 필드라
    // 별도 슬롯을 쓴다 (.pic_title / room 배너 / Hello, 는 영문명 그대로 간다).
    setAllText('[data-index-hero-title]', this.firstText(hero.title, this.getPropertyNameEn()));

    // 히어로 보조 문구: hero.description → 폴백 property.subtitle
    // (백오피스 빈 값이 공백 한 칸으로 오므로 firstText 로 걸러낸다)
    var desc = this.firstText(hero.description, this.getProperty().subtitle);
    document.querySelectorAll('[data-index-hero-description]').forEach(
      function (el) {
        el.innerHTML = desc ? this.nl2br(desc) : '';
      }.bind(this)
    );

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 이미지가 없으면 매핑 위치 안내용 placeholder 한 장
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '메인 비주얼');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      setBackground(slide, img.url, '메인 비주얼');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: customFields.roomtypes[] → [data-index-room-slides]
  // 슬라이드 마크업은 layout-map / room 과 동일하므로 BaseDataMapper 의 공용 렌더러를 쓴다.
  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  // MAPPER: property.facilities[] → [data-index-special-list]
  // .parallax-window[data-image-src] > a.spe_in_txt > .txt_box > strong(영문명) + p(시설명)
  IndexMapper.prototype.mapSpecialList = function () {
    var self = this;
    var facilities = this.getProperty().facilities || [];

    document.querySelectorAll('[data-index-special-list]').forEach(function (container) {
      container.innerHTML = '';

      facilities.forEach(function (f) {
        var url =
          self.getFirstSelectedImage(f.images || []) ||
          (f.images && f.images[0] && f.images[0].url) ||
          '';

        var win = document.createElement('div');
        win.className = 'parallax-window';
        win.setAttribute('data-parallax', 'scroll');
        if (url) {
          // 배경은 건드리지 않는다. parallax.js 가 만드는 .parallax-mirror 는
          // z-index:-100 이라 여기에 background-image 를 걸면 미러가 가려져
          // 패럴랙스가 사라지고 cover 크롭만 보인다. (원본도 background:transparent)
          // parallax.js 가 없을 때의 폴백은 common.js 의 initParallax() 가 처리한다.
          win.setAttribute('data-image-src', url);
        } else {
          ImageHelpers.applyBackgroundPlaceholder(win, '부대시설 이미지');
        }

        var a = document.createElement('a');
        a.className = 'spe_in_txt';
        a.href = './facility.html?id=' + f.id;

        var txt = document.createElement('div');
        txt.className = 'txt_box';

        // 원본은 strong=영문명 / p=한글명 구조였지만, facilities[] 에 nameEn 이
        // 없는 응답이 일반적이라 strong 이 한글명으로 폴백된다.
        // 그러면 p 가 같은 한글명을 반복하므로, p 는 시설 설명을 쓴다.
        var strong = document.createElement('strong');
        strong.textContent = self.firstText(f.nameEn, f.name);

        var p = document.createElement('p');
        var desc = self.firstText(f.description);
        // strong 이 이미 한글명이면 설명이 없을 때 p 를 비워 중복 노출을 막는다
        var isNameEnUsed = !!self.cleanText(f.nameEn);
        p.textContent = desc || (isNameEnUsed ? self.cleanText(f.name) : '');
        if (!p.textContent) p.style.display = 'none';

        txt.appendChild(strong);
        txt.appendChild(p);
        a.appendChild(txt);
        win.appendChild(a);
        container.appendChild(win);
      });
    });
  };

  // MAPPER: pages.main.sections[0].hero.images[isSelected] → [data-index-landscape-slides]
  // 원본 index 의 Healing Place 는 외경(view) 사진을 돌린다.
  // D2 규약대로 main.hero.images 가 1순위, 비면 property.images[0].exterior 폴백.
  IndexMapper.prototype.mapLandscapeSlides = function () {
    var images = this.getLandscapeImages();

    var wrapper = document.querySelector('[data-index-landscape-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      var emptyBox = document.createElement('div');
      emptyBox.className = 'room_box';
      var emptyImg = document.createElement('div');
      emptyImg.className = 'img';
      ImageHelpers.applyBackgroundPlaceholder(emptyImg, '외부 전경');
      emptyBox.appendChild(emptyImg);
      empty.appendChild(emptyBox);
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (image) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var box = document.createElement('div');
      box.className = 'room_box';
      var img = document.createElement('div');
      img.className = 'img';
      setBackground(img, image.url, '외부 전경');
      box.appendChild(img);
      slide.appendChild(box);
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: pages.index.sections[0].closing → [data-index-closing-images/title/description]
  IndexMapper.prototype.mapClosing = function () {
    var closing = this.getSection().closing || {};
    var images = this.getSelectedImages(closing.images || []);

    // 제목이 비어 있으면 원본 사이트 카피 그대로 "Welcome to {nameEn}" 로 채운다.
    // 영문 폴백이므로 서체는 로고와 같은 --font-en-main(필기체) 스택을 쓴다.
    // (한글이 입력되면 스택의 ko-main 으로 글자 단위 폴백된다)
    var nameEn = this.cleanText(this.getPropertyNameEn());
    var closingTitle = this.firstText(closing.title, nameEn ? 'Welcome to ' + nameEn : '');
    setAllText('[data-index-closing-title]', closingTitle);

    // 설명은 데이터 우선 + 폴백. 직접 입력하면 그 값이, 비어 있으면 원본 카피가 나온다.
    var desc = this.cleanText(closing.description);
    document.querySelectorAll('[data-index-closing-description]').forEach(
      function (el) {
        // 폴백 문구는 <br> 를 포함한 HTML 이라 이스케이프하지 않는다
        el.innerHTML = desc ? this.nl2br(desc) : this.CLOSING_FALLBACK_DESC_HTML;
      }.bind(this)
    );

    // .pic_list 는 img01 / img02 / img03 3분할 고정 레이아웃이다.
    document.querySelectorAll('[data-index-closing-images]').forEach(function (container) {
      ['img01', 'img02', 'img03'].forEach(function (cls, idx) {
        var el = container.querySelector('.' + cls);
        if (!el) return;
        var url = images[idx] ? images[idx].url : '';
        setBackground(el, url, '마무리 이미지 ' + (idx + 1));
      });
    });
  };

  // preview-handler 가 로드되어 있으면 standalone/preview 양쪽 초기화를 그쪽이 담당한다.
  // (preview-handler.js 는 항상 window.previewHandler 를 만든다)
  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new IndexMapper();
    mapper.initialize();
    global.indexMapperInstance = mapper;
  });

  global.IndexMapper = IndexMapper;
})(window);
