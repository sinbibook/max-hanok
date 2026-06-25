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
    // localhost 경로: this.data.homepage.customFields.pages
    var pagesFromHomepage = this.getCustomFields().pages;
    if (pagesFromHomepage && Object.keys(pagesFromHomepage).length > 0) {
      return pagesFromHomepage;
    }

    // preview 경로: this.data.customFields.pages
    if (this.data && this.data.customFields && this.data.customFields.pages) {
      return this.data.customFields.pages;
    }

    return {};
  };

  // customFields.property.name 우선, 없으면 property.name
  BaseDataMapper.prototype.getPropertyName = function () {
    var cf = this.getCustomFields();
    if (cf.property && cf.property.name) return cf.property.name;
    return this.getProperty().name || '';
  };

  // homepage.images[0].logo 중 isSelected인 URL
  BaseDataMapper.prototype.getLogo = function () {
    var hp = this.getHomepage();
    var images = hp.images;
    if (!images || !images[0] || !images[0].logo) return '';
    var logos = images[0].logo;
    var selected = logos.find(function (l) {
      return l.isSelected;
    });
    return selected ? selected.url : logos[0] ? logos[0].url : '';
  };

  // property.realtimeBookingId
  BaseDataMapper.prototype.getBookingUrl = function () {
    return this.getProperty().realtimeBookingId || '#!';
  };

  // ── 이미지 헬퍼 ──────────────────────────────────────────
  // isSelected=true인 이미지를 sortOrder 순으로 반환
  BaseDataMapper.prototype.getSelectedImages = function (images) {
    if (!images || !images.length) return [];
    return images
      .filter(function (img) {
        return img.isSelected;
      })
      .sort(function (a, b) {
        return a.sortOrder - b.sortOrder;
      });
  };

  // 첫 번째 isSelected 이미지의 URL
  BaseDataMapper.prototype.getFirstSelectedImage = function (images) {
    var list = this.getSelectedImages(images);
    return list.length ? list[0].url : '';
  };

  // 데이터 변환 (스네이크 케이스 → 카멜 케이스)
  BaseDataMapper.prototype.convertToCamelCase = function (obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = this.convertToCamelCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  };

  // ── DOM 유틸 ────────────────────────────────────────────
  BaseDataMapper.prototype.setTextIfExist = function (selector, value) {
    var el = document.querySelector(selector);
    if (el && value !== undefined && value !== null) el.textContent = value;
  };

  BaseDataMapper.prototype.setAttrIfExist = function (selector, attr, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };

  BaseDataMapper.prototype.setAllAttr = function (selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value) el.setAttribute(attr, value);
    });
  };

  global.BaseDataMapper = BaseDataMapper;
})(window);
