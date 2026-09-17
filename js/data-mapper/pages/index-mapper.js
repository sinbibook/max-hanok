(function (global) {
  'use strict';

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
    this.mapRoomIntro();
    this.mapRoomSlides();
    this.mapMemories();
    this.mapLandscapeText();
    this.mapLandscapeSlides();
    this.mapSpecialIntro();
    this.mapSpecialList();

    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
  };

  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  IndexMapper.prototype.mapPropertyNames = function () {
    var nameEn = this.getPropertyNameEn();
    var name = this.getPropertyName();
    setAllText('[data-property-name-en]', nameEn || name);
    setAllText('[data-property-name]', name);
    this.applyPropertyCaptions();

    var eyebrow = nameEn ? 'WELCOME TO ' + nameEn.toUpperCase() : 'WELCOME TO PENSION';
    setAllText('[data-index-eyebrow]', eyebrow);
  };

  IndexMapper.prototype.mapHero = function () {
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '메인 비주얼');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(
      function (img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        this.setBackground(slide, img.url, '메인 비주얼');
        wrapper.appendChild(slide);
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  IndexMapper.prototype.renderPropertyCaption = function (template) {
    return this.nl2br(
      String(template || '')
        .replace(/\{name\}/g, this.getPropertyName())
        .replace(/\{nameEn\}/g, this.getPropertyNameEn())
    );
  };

  IndexMapper.prototype.mapRoomIntro = function () {
    var essence = this.getSection().essence || {};
    var title = this.firstText(essence.title, 'Room Preview');
    var desc = this.firstText(essence.description, '편안함과 즐거움이 있는 곳, {name}');

    setAllText('[data-index-room-title]', title);
    document.querySelectorAll('[data-index-room-description]').forEach(
      function (el) {
        el.innerHTML = this.renderPropertyCaption(desc);
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapLandscapeText = function () {
    var gallery = this.getSection().gallery || {};
    var title = this.firstText(gallery.title, 'Beautiful Healing Place');

    setAllText('[data-index-landscape-title]', title);
  };

  IndexMapper.prototype.getIndexImagePool = function () {
    var pool = this.getLandscapeImages();
    var roomtypes = this.getRoomtypes();
    var self = this;

    roomtypes.forEach(function (rt) {
      self.getRoomtypeImages(rt, 'roomtype_interior').forEach(function (img) {
        if (
          img &&
          img.url &&
          !pool.some(function (p) {
            return p.url === img.url;
          })
        ) {
          pool.push(img);
        }
      });
    });

    return pool;
  };

  IndexMapper.prototype.mapMemories = function () {
    var section = this.getSection();
    var closing = section.closing || {};
    var gallery = section.gallery || {};
    var title = this.firstText(closing.title, 'Memories');
    var desc = this.firstText(
      gallery.description,
      closing.description,
      '일상에서 벗어나 자연과 함께 즐기는 여유로운 시간'
    );
    var images = this.getSelectedImages(closing.images || []);
    if (!images.length) images = this.getIndexImagePool();

    setAllText('[data-index-memories-title]', title);
    document.querySelectorAll('[data-index-memories-description]').forEach(
      function (el) {
        el.innerHTML = this.nl2br(desc);
      }.bind(this)
    );

    document.querySelectorAll('[data-index-memories-images]').forEach(
      function (ul) {
        ul.innerHTML = '';
        for (var i = 0; i < 3; i++) {
          var li = document.createElement('li');
          var img = images.length ? images[i % images.length] : null;
          this.setBackground(li, img && img.url, 'Memories ' + (i + 1));
          ul.appendChild(li);
        }
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapLandscapeSlides = function () {
    var gallery = this.getSection().gallery || {};
    var images = this.getSelectedImages(gallery.images || []);
    if (!images.length) images = this.getIndexImagePool();

    var wrapper = document.querySelector('[data-index-landscape-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Healing Place');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(
      function (img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        this.setBackground(slide, img.url, 'Healing Place');
        wrapper.appendChild(slide);
      }.bind(this)
    );
  };

  IndexMapper.prototype.mapSpecialList = function () {
    var self = this;
    var facilities = this.getProperty().facilities || [];

    document.querySelectorAll('[data-index-special-list]').forEach(function (ul) {
      ul.innerHTML = '';

      facilities.forEach(function (facility) {
        var name = self.firstText(facility.name);
        if (!name) return;

        var imageUrl =
          self.getFirstSelectedImage(facility.images || []) ||
          (facility.images && facility.images[0] && facility.images[0].url) ||
          '';

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = './facility.html?id=' + facility.id;

        var img = document.createElement('div');
        img.className = 'img';
        self.setBackground(img, imageUrl, '부대시설 이미지');

        var p = document.createElement('p');
        p.textContent = name;

        li.appendChild(a);
        li.appendChild(img);
        li.appendChild(p);
        ul.appendChild(li);
      });
    });
  };

  IndexMapper.prototype.mapSpecialIntro = function () {
    var signature = this.getSection().signature || {};
    var title = this.firstText(signature.title, 'SPECIAL');

    setAllText('[data-index-special-title]', title);
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new IndexMapper();
    mapper.initialize();
    global.indexMapperInstance = mapper;
  });

  global.IndexMapper = IndexMapper;
})(window);
