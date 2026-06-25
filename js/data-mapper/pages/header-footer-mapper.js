(function (global) {
  'use strict';

  var YBS_BASE_URL = 'https://www.yapen.co.kr/external?ypIdx=';

  function HeaderFooterMapper() {
    BaseDataMapper.call(this);
  }
  HeaderFooterMapper.prototype = Object.create(BaseDataMapper.prototype);
  HeaderFooterMapper.prototype.constructor = HeaderFooterMapper;

  HeaderFooterMapper.prototype.mapPage = function () {
    this.mapLogo();
    this.mapBookingLinks();
    this.mapYbs();
    this.mapRoomMenu();
    this.mapFacilityMenu();
    this.mapPageToggles();
    this.mapAllmenuBg();
    this.mapFooter();
  };

  // 숙소 대표이미지: property.images[0].thumbnail[isSelected][0] (없으면 exterior)
  HeaderFooterMapper.prototype.getRepresentativeImage = function () {
    var images = (this.getProperty().images || [])[0] || {};
    return (
      this.getFirstSelectedImage(images.thumbnail || []) ||
      this.getFirstSelectedImage(images.exterior || [])
    );
  };

  // customFields.roomtypes (localhost / preview 경로 모두 대응)
  HeaderFooterMapper.prototype.getRoomtypes = function () {
    var cf = this.getCustomFields();
    if (cf.roomtypes && cf.roomtypes.length) return cf.roomtypes;
    if (this.data && this.data.customFields && this.data.customFields.roomtypes) {
      return this.data.customFields.roomtypes;
    }
    return cf.roomtypes || [];
  };

  // 페이지 enabled 여부 (sections[0].enabled === false 이면 비활성)
  HeaderFooterMapper.prototype.isPageEnabled = function (pageKey) {
    var page = this.getPages()[pageKey];
    var section = page && page.sections && page.sections[0];
    return !(section && section.enabled === false);
  };

  // MAPPER: homepage.images[0].logo[isSelected].url → [data-logo]
  // F 템플릿 로고는 <a data-logo style="background-image:..."> (배경이미지). <img data-logo>도 호환.
  HeaderFooterMapper.prototype.mapLogo = function () {
    var logoUrl = this.getLogo();
    document.querySelectorAll('[data-logo]').forEach(function (el) {
      if (el.tagName === 'IMG') {
        if (logoUrl) {
          el.src = logoUrl;
        } else {
          ImageHelpers.applyPlaceholder(el);
        }
      } else if (logoUrl) {
        // 배경이미지 로고
        el.style.backgroundImage = "url('" + logoUrl + "')";
      } else {
        // 데이터 없으면 empty placeholder (정적 logo.png fallback 안 씀)
        ImageHelpers.applyBackgroundPlaceholder(el);
      }
    });
  };

  // MAPPER: property.realtimeBookingId → [data-booking-link] (href 직접 주입)
  HeaderFooterMapper.prototype.mapBookingLinks = function () {
    var bookingUrl = this.getBookingUrl();
    document.querySelectorAll('[data-booking-link]').forEach(function (el) {
      if (bookingUrl && bookingUrl !== '#!') {
        el.href = bookingUrl;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: property.ybsId → [data-ybs-button] (없으면 숨김)
  HeaderFooterMapper.prototype.mapYbs = function () {
    var ybsId = this.getProperty().ybsId;
    document.querySelectorAll('[data-ybs-button]').forEach(function (el) {
      if (!ybsId) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      el.setAttribute('data-ybs-id', ybsId);
      var target = el.tagName === 'A' ? el : el.querySelector('a');
      if (target) {
        target.href = YBS_BASE_URL + ybsId;
        target.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: roomtypes[].name → [data-rooms-submenu] (data-room-menu-link 앵커 뒤에 li 동적 생성)
  HeaderFooterMapper.prototype.mapRoomMenu = function () {
    var roomtypes = this.getRoomtypes();
    document.querySelectorAll('[data-rooms-submenu]').forEach(function (container) {
      // 이전 생성분 제거 (preview 재렌더 대비)
      container.querySelectorAll('[data-generated="room"]').forEach(function (li) {
        li.remove();
      });
      roomtypes.forEach(function (rt) {
        // 이름 없는 객실타입은 빈 메뉴 항목(여백)이 되므로 건너뜀
        if (!rt.name || !rt.name.trim()) return;
        var li = document.createElement('li');
        li.setAttribute('data-generated', 'room');
        var a = document.createElement('a');
        a.href = 'room.html?room_id=' + rt.id;
        a.textContent = rt.name;
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: property.facilities[].name → [data-facility-menu-link] (컨테이너 비우고 li 동적 생성)
  HeaderFooterMapper.prototype.mapFacilityMenu = function () {
    var facilities = this.getProperty().facilities || [];
    document.querySelectorAll('[data-facility-menu-link]').forEach(function (container) {
      container.innerHTML = '';
      facilities.forEach(function (f) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = 'facility.html?id=' + f.id;
        a.textContent = f.name || '';
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: pages.layoutMap / nearbyAttractions enabled → 메뉴 표시/숨김
  HeaderFooterMapper.prototype.mapPageToggles = function () {
    var layoutMapEnabled = this.isPageEnabled('layoutMap');
    document.querySelectorAll('[data-menu-id="layout-map"]').forEach(function (el) {
      el.style.display = layoutMapEnabled ? '' : 'none';
    });

    var nearbyEnabled = this.isPageEnabled('nearbyAttractions');
    document.querySelectorAll('[data-travel-menu]').forEach(function (el) {
      el.style.display = nearbyEnabled ? '' : 'none';
    });
  };

  // MAPPER: 숙소 대표이미지 → [data-allmenu-bg] (전체메뉴 오버레이 배경, 없으면 empty placeholder)
  HeaderFooterMapper.prototype.mapAllmenuBg = function () {
    var url = this.getRepresentativeImage();
    document.querySelectorAll('[data-allmenu-bg]').forEach(function (el) {
      if (url) {
        el.style.background = 'url(' + url + ') no-repeat center bottom';
        el.style.backgroundSize = 'cover';
      } else {
        ImageHelpers.applyBackgroundPlaceholder(el);
      }
    });
  };

  // MAPPER: property.businessInfo → footer 라인별 텍스트
  HeaderFooterMapper.prototype.mapFooter = function () {
    var biz = this.getProperty().businessInfo || {};
    var fields = {
      '[data-footer-phone]': biz.businessPhone,
      '[data-footer-address]': biz.businessAddress,
      '[data-footer-business-name]': biz.businessName,
      '[data-footer-representative]': biz.representativeName,
      '[data-footer-business-number]': biz.businessNumber
    };
    Object.keys(fields).forEach(function (selector) {
      var value = fields[selector];
      if (value === undefined || value === null || value === '') return;
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = value;
      });
    });

    // 전화번호 tel: 링크 (F 템플릿 푸터: <a data-footer-phone-link href="tel:...">)
    if (biz.businessPhone) {
      var tel = String(biz.businessPhone).replace(/[^0-9+]/g, '');
      document.querySelectorAll('[data-footer-phone-link]').forEach(function (el) {
        el.setAttribute('href', 'tel:' + tel);
      });
    }

    // 푸터 ROOMS 링크: layoutMap(미리보기) 활성 시 layout-map.html, 아니면 첫 번째 객실 room.html
    // (헤더 ROOMS 메뉴의 미리보기 노출 로직 isPageEnabled('layoutMap')과 일관)
    var roomLink;
    if (this.isPageEnabled('layoutMap')) {
      roomLink = 'layout-map.html';
    } else {
      var firstRoom = this.getRoomtypes().filter(function (rt) {
        return rt.name && rt.name.trim();
      })[0];
      roomLink = firstRoom ? 'room.html?room_id=' + firstRoom.id : 'room.html';
    }
    document.querySelectorAll('[data-footer-room-link]').forEach(function (el) {
      el.setAttribute('href', roomLink);
    });
  };

  document.addEventListener('headerFooterLoaded', function () {
    var mapper = new HeaderFooterMapper();
    mapper.initialize();
    global.headerFooterMapperInstance = mapper;
  });

  global.HeaderFooterMapper = HeaderFooterMapper;
})(window);
