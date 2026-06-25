(function (global) {
  'use strict';

  function BaseDataMapper() {
    this.data = null;
    this.isDataLoaded = false;
  }

  BaseDataMapper.prototype.initialize = function () {
    var self = this;
    var url = 'standard-template-data.json?t=' + Date.now();
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load standard-template-data.json');
        return res.json();
      })
      .then(function (json) {
        self.data = json;
        self.isDataLoaded = true;
        self.mapPage();
      })
      .catch(function (err) {
        console.error('[BaseDataMapper] initialize error:', err);
      });
  };

  BaseDataMapper.prototype.mapPage = function () {};

  BaseDataMapper.prototype.updateData = function (newData) {
    this.data = newData;
    this.isDataLoaded = true;
    this.mapPage();
  };

  // ── 데이터 접근 헬퍼 ──────────────────────────────────────
  BaseDataMapper.prototype.getProperty = function () {
    return (this.data && this.data.property) || {};
  };

  BaseDataMapper.prototype.getHomepage = function () {
    return (this.data && this.data.homepage) || {};
  };

  BaseDataMapper.prototype.getCustomFields = function () {
    return this.getHomepage().customFields || {};
  };

  BaseDataMapper.prototype.getPages = function () {
    var pagesFromHomepage = this.getCustomFields().pages;
    if (pagesFromHomepage && Object.keys(pagesFromHomepage).length > 0) {
      return pagesFromHomepage;
    }

    if (this.data && this.data.customFields && this.data.customFields.pages) {
      return this.data.customFields.pages;
    }

    return {};
  };

  BaseDataMapper.prototype.getPropertyName = function () {
    var cf = this.getCustomFields();
    if (cf.property && cf.property.name) return cf.property.name;
    return this.getProperty().name || '';
  };

  BaseDataMapper.prototype.getLogo = function () {
    var hp = this.getHomepage();
    var images = hp.images;
    if (!images || !images[0] || !images[0].logo) return '';
    var logos = images[0].logo;
    var selected = logos.find(function (l) { return l.isSelected; });
    return selected ? selected.url : (logos[0] ? logos[0].url : '');
  };

  BaseDataMapper.prototype.getBookingUrl = function () {
    return this.getProperty().realtimeBookingId || '#!';
  };

  // ── 이미지 헬퍼 ──────────────────────────────────────────
  BaseDataMapper.prototype.getSelectedImages = function (images) {
    if (!images || !images.length) return [];
    return images
      .filter(function (img) { return img.isSelected && img.url; })
      .sort(function (a, b) { return a.sortOrder - b.sortOrder; });
  };

  BaseDataMapper.prototype.getFirstSelectedImage = function (images) {
    var list = this.getSelectedImages(images);
    return list.length ? list[0].url : '';
  };

  // ── 객실타입(roomtypes) 공통 헬퍼 (room-mapper 와 동일 규칙) ───────
  // 객실명/이미지 = customFields.roomtypes, 그 외(상태·구성 등) = rooms[] (id 매칭)
  BaseDataMapper.prototype.getRoomtypes = function () {
    var cf = this.getCustomFields();
    if (cf.roomtypes && cf.roomtypes.length) return cf.roomtypes;
    if (this.data && this.data.customFields && this.data.customFields.roomtypes) {
      return this.data.customFields.roomtypes;
    }
    return cf.roomtypes || [];
  };

  // roomtypes[i].id === rooms[j].id 매칭
  BaseDataMapper.prototype.getMatchedRoom = function (roomtype) {
    if (!roomtype) return null;
    var rooms = (this.data && this.data.rooms) || [];
    return rooms.filter(function (r) { return r.id === roomtype.id; })[0] || null;
  };

  // roomtype 대표 썸네일 URL: roomtype_thumbnail → roomtype_interior → 그 외 (isSelected, sortOrder순 첫 이미지)
  BaseDataMapper.prototype.getRoomtypeThumbnailUrl = function (rt) {
    var imgs = (rt && rt.images) || [];
    var self = this;
    var pick = function (cat) {
      return self.getSelectedImages(imgs.filter(function (im) { return im.category === cat; }))[0];
    };
    var img = pick('roomtype_thumbnail') || pick('roomtype_interior') || this.getSelectedImages(imgs)[0];
    return img && img.url ? img.url : null;
  };

  // ── SEO 메타태그 업데이트 ──────────────────────────────────────
  BaseDataMapper.prototype.updateMetaTags = function (pageSEO) {
    var hp = this.getHomepage();
    var globalSEO = (hp && hp.seo) || {};
    var finalSEO = Object.assign({}, globalSEO, pageSEO || {});

    if (Object.keys(finalSEO).length > 0) {
      this.updateSEOInfo(finalSEO);
    }
  };

  BaseDataMapper.prototype.updateSEOInfo = function (seo) {
    if (!seo) return;

    if (seo.title) {
      var titleEl = document.querySelector('title[data-page-title]') || document.querySelector('title');
      if (titleEl) titleEl.textContent = seo.title;
    }

    if (seo.description) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', seo.description);
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        metaDesc.setAttribute('content', seo.description);
        document.head.appendChild(metaDesc);
      }
    }

    if (seo.keywords) {
      var metaKeys = document.querySelector('meta[name="keywords"]');
      if (metaKeys) {
        metaKeys.setAttribute('content', seo.keywords);
      } else {
        metaKeys = document.createElement('meta');
        metaKeys.setAttribute('name', 'keywords');
        metaKeys.setAttribute('content', seo.keywords);
        document.head.appendChild(metaKeys);
      }
    }
  };

  global.BaseDataMapper = BaseDataMapper;
})(window);
