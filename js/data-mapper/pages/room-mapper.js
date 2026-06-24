(function (global) {
  'use strict';

  var ROOM_COUNT_LABELS = {
    bedroom: '침대룸',
    bathroom: '화장실',
    livingRoom: '거실',
    ondol: '온돌룸',
    kitchen: '주방'
  };

  // roomStructures[0] + "/ " + totalRoomCount 값≥1 항목 한글 나열
  function buildRoomStructure(room) {
    if (!room) return '';
    var structures = room.roomStructures || [];
    var base = structures.length ? structures[0] : '';
    var counts = room.totalRoomCount || {};
    var labels = [];
    Object.keys(ROOM_COUNT_LABELS).forEach(function (key) {
      if (counts[key] >= 1) labels.push(ROOM_COUNT_LABELS[key]);
    });
    if (base && labels.length) return base + '/ ' + labels.join(' ');
    return base || labels.join(' ');
  }

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function notNil(v) {
    return v !== null && v !== undefined;
  }

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  RoomMapper.prototype.mapPage = function () {
    var rt = this.getCurrentRoomType();
    var room = this.getMatchedRoom(rt);

    this.mapHeroSlides(rt);
    this.mapRoomInfo(rt, room);
    this.mapMainImage(rt);
    this.mapExtraImages(rt);
    this.mapBookingUrl();
    this.mapRoomPreview();
    this.mapPropertyNames();
    if (typeof this.updateMetaTags === 'function') this.updateMetaTags();

    // 슬라이드 DOM 주입 완료를 알림 → room.js에서 Swiper 초기화 (localhost/preview 공통)
    document.dispatchEvent(new CustomEvent('template:rendered', { detail: { page: 'room' } }));
  };

  // customFields.roomtypes (localhost / preview 경로 모두 대응)
  RoomMapper.prototype.getRoomtypes = function () {
    var cf = this.getCustomFields();
    if (cf.roomtypes && cf.roomtypes.length) return cf.roomtypes;
    if (this.data && this.data.customFields && this.data.customFields.roomtypes) {
      return this.data.customFields.roomtypes;
    }
    return cf.roomtypes || [];
  };

  // 현재 객실타입: URL ?id= (preview는 ?room_id= 호환), 없으면 첫 번째
  RoomMapper.prototype.getCurrentRoomType = function () {
    var roomtypes = this.getRoomtypes();
    var params = new URLSearchParams(window.location.search);
    var roomId = params.get('id') || params.get('room_id');
    if (roomId) {
      var found = roomtypes.filter(function (rt) {
        return rt.id === roomId;
      })[0];
      if (found) return found;
    }
    return roomtypes[0] || null;
  };

  // roomtypes[current].id === rooms[j].id 매칭
  RoomMapper.prototype.getMatchedRoom = function (roomtype) {
    if (!roomtype) return null;
    var rooms = (this.data && this.data.rooms) || [];
    return (
      rooms.filter(function (r) {
        return r.id === roomtype.id;
      })[0] || null
    );
  };

  // roomtypes[i].images 중 특정 category(isSelected, sortOrder순)
  RoomMapper.prototype.getCategoryImages = function (rt, category) {
    var imgs = (rt && rt.images) || [];
    var filtered = imgs.filter(function (im) {
      return im.category === category;
    });
    return this.getSelectedImages(filtered);
  };

  // MAPPER: roomtypes[current] interior[isSelected] → [data-room-hero-slides] (img + tx1 객실명)
  RoomMapper.prototype.mapHeroSlides = function (rt) {
    var wrapper = document.querySelector('[data-room-hero-slides]');
    if (!wrapper) return;

    var images = this.getCategoryImages(rt, 'roomtype_interior');
    var name = (rt && rt.name) || '';
    wrapper.innerHTML = '';

    if (!images.length) {
      var ph = document.createElement('div');
      ph.className = 'swiper-slide';
      var phImg = document.createElement('img');
      ImageHelpers.applyPlaceholder(phImg);
      phImg.alt = name;
      var phTx = document.createElement('div');
      phTx.className = 'tx1';
      phTx.textContent = name;
      ph.appendChild(phImg);
      ph.appendChild(phTx);
      wrapper.appendChild(ph);
      return;
    }

    images.forEach(function (img) {
      var div = document.createElement('div');
      div.className = 'swiper-slide';
      var imgEl = document.createElement('img');
      if (img.url) {
        imgEl.src = img.url;
      } else {
        ImageHelpers.applyPlaceholder(imgEl);
      }
      imgEl.alt = name;
      var tx = document.createElement('div');
      tx.className = 'tx1';
      tx.textContent = name;
      div.appendChild(imgEl);
      div.appendChild(tx);
      wrapper.appendChild(div);
    });
  };

  // MAPPER: 객실명(roomtype)/설명(room)/유형(roomStructure)/인원/평형/집기품목 (히어로+표 PC/모바일 공통)
  RoomMapper.prototype.mapRoomInfo = function (rt, room) {
    var name = (rt && rt.name) || '';
    setAllText('[data-room-name]', name);
    setAllText('[data-room-description]', (room && room.description) || '');
    setAllText('[data-room-type]', buildRoomStructure(room));
    setAllText(
      '[data-room-base-occupancy]',
      room && notNil(room.baseOccupancy) ? room.baseOccupancy : ''
    );
    setAllText(
      '[data-room-max-occupancy]',
      room && notNil(room.maxOccupancy) ? room.maxOccupancy : ''
    );
    // 평형: rooms[j].size 사용 (D 규칙과 동일하게 "평" 단위)
    setAllText('[data-room-size]', room && notNil(room.size) ? room.size + '평' : '');
    setAllText(
      '[data-room-amenities]',
      room && room.amenities && room.amenities.length ? room.amenities.join(', ') : ''
    );
  };

  // MAPPER: roomtypes[current] thumbnail 대표 이미지 → [data-room-main-image]
  RoomMapper.prototype.mapMainImage = function (rt) {
    var img = document.querySelector('[data-room-main-image]');
    if (!img) return;
    var thumbs = this.getCategoryImages(rt, 'roomtype_thumbnail');
    var url = thumbs[0] && thumbs[0].url;
    if (url) {
      img.src = url;
      img.alt = (rt && rt.name) || '';
    } else {
      ImageHelpers.applyPlaceholder(img);
    }
  };

  // MAPPER: roomtypes[current] interior 이미지 → [data-room-image-0], [data-room-image-1]
  RoomMapper.prototype.mapExtraImages = function (rt) {
    var slots = [
      document.querySelector('[data-room-image-0]'),
      document.querySelector('[data-room-image-1]')
    ];
    if (!slots[0] && !slots[1]) return;
    var images = this.getCategoryImages(rt, 'roomtype_interior');
    slots.forEach(function (img, i) {
      if (!img) return;
      var url = images[i] && images[i].url;
      if (url) {
        img.src = url;
        img.alt = (rt && rt.name) || '';
      } else {
        ImageHelpers.applyPlaceholder(img);
      }
    });
  };

  // MAPPER: property.realtimeBookingId → [data-booking-link] href 직접 주입
  RoomMapper.prototype.mapBookingUrl = function () {
    var url = this.getBookingUrl();
    document.querySelectorAll('[data-booking-link]').forEach(function (el) {
      if (url && url !== '#!') {
        el.href = url;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: roomtypes[] + rooms[] id매칭 → [data-index-room-slides] (다른 객실 미리보기)
  RoomMapper.prototype.mapRoomPreview = function () {
    var roomtypes = this.getRoomtypes();
    var rooms = (this.data && this.data.rooms) || [];
    var wrapper = document.querySelector('[data-index-room-slides]');
    if (!wrapper) return;

    wrapper.innerHTML = '';
    if (!roomtypes.length) return;

    var self = this;
    roomtypes.forEach(function (rt) {
      if (!rt.name || !rt.name.trim()) return;
      var thumbUrl = self.getFirstSelectedImage(
        (rt.images || []).filter(function (img) {
          return img.category === 'roomtype_thumbnail';
        })
      );
      var matched = rooms.filter(function (r) {
        return r.id === rt.id;
      })[0];

      var div = document.createElement('div');
      div.className = 'swiper-slide';
      div.setAttribute('data-title', rt.name || '');

      var img = document.createElement('img');
      if (thumbUrl) {
        img.src = thumbUrl;
      } else {
        ImageHelpers.applyPlaceholder(img);
      }
      img.alt = rt.name || '';

      var a = document.createElement('a');
      a.href = 'room.html?id=' + rt.id;
      a.className = 'tx';
      a.innerHTML =
        '<div class="tx1">' + (rt.name || '') + '</div>' +
        '<div class="tx2">' + buildRoomStructure(matched) + '</div>' +
        '<div class="more"></div>';

      div.appendChild(img);
      div.appendChild(a);
      wrapper.appendChild(div);
    });
  };

  // MAPPER: property.name → [data-property-name]
  RoomMapper.prototype.mapPropertyNames = function () {
    var name = this.getPropertyName();
    setAllText('[data-property-name]', name);
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new RoomMapper();
    mapper.initialize();
    global.roomMapperInstance = mapper;
  });

  global.RoomMapper = RoomMapper;
})(window);
