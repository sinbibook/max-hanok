// Header Footer Mapper - JSON 데이터로 헤더/푸터 동적 매핑
var HeaderFooterMapper = {
  mapHeader: function(data) {
    if (!data || !data.property) return;

    // enabled 값 안전하게 접근
    var nearbyAttractionsEnabled = (data.homepage &&
                                    data.homepage.customFields &&
                                    data.homepage.customFields.pages &&
                                    data.homepage.customFields.pages.nearbyAttractions &&
                                    data.homepage.customFields.pages.nearbyAttractions.sections &&
                                    data.homepage.customFields.pages.nearbyAttractions.sections[0] &&
                                    data.homepage.customFields.pages.nearbyAttractions.sections[0].enabled) !== false;

    var layoutMapEnabled = (data.homepage &&
                            data.homepage.customFields &&
                            data.homepage.customFields.pages &&
                            data.homepage.customFields.pages.layoutMap &&
                            data.homepage.customFields.pages.layoutMap.sections &&
                            data.homepage.customFields.pages.layoutMap.sections[0] &&
                            data.homepage.customFields.pages.layoutMap.sections[0].enabled) !== false;

    // 1. 로고 이미지 매핑
    var logoElement = document.querySelector('[data-logo]');
    if (logoElement) {
      var logoImg = data.homepage && data.homepage.images && data.homepage.images[0] && data.homepage.images[0].logo;
      if (logoImg && logoImg.length > 0) {
        var selectedLogo = logoImg.find(function(l) { return l.isSelected; }) || logoImg[0];
        if (selectedLogo && selectedLogo.url) {
          logoElement.src = selectedLogo.url;
        } else {
          ImageHelpers.applyPlaceholder(logoElement);
        }
      } else {
        ImageHelpers.applyPlaceholder(logoElement);
      }
    }

    // 2. 메뉴 구조 생성
    var menuContainer = document.querySelector('[data-menu-container]');
    if (!menuContainer) return;

    // 기존 메뉴 초기화 (중복 방지)
    menuContainer.innerHTML = '';

    // 메뉴 구조: ABOUT, ROOMS, SPECIAL, RESERVE, TOUR
    var menuStructure = [
      {
        title: 'ABOUT',
        items: [
          { name: '외관보기', href: 'main.html' },
          { name: '오시는길', href: 'directions.html' }
        ]
      },
      {
        title: 'ROOMS',
        isSubmenu: true,
        dataKey: 'rooms',
        customItems: [
          {
            name: '미리보기',
            href: 'layout-map.html',
            enabledKey: 'layoutMapEnabled'
          }
        ]
      },
      {
        title: 'SPECIAL',
        isSubmenu: true,
        dataKey: 'facilities'
      },
      {
        title: 'RESERVE',
        items: [
          { name: '예약하기', href: data.property.realtimeBookingId || '#!', isLink: true },
          { name: '예약안내', href: 'reservation.html' }
        ]
      },
      {
        title: 'TOUR',
        items: [
          { name: '주변관광지', href: 'nearby-attractions.html', enabledKey: 'nearbyAttractionsEnabled' }
        ]
      }
    ];

    // 3. 메뉴 HTML 생성
    menuStructure.forEach(function(menu) {
      var depth1 = document.createElement('div');
      depth1.className = 'depth_1';

      var link = document.createElement('a');
      link.href = 'javascript:void(0)';
      link.textContent = menu.title;

      if (menu.title === 'RESERVE' && data.property.realtimeBookingId) {
        link.className = 'yellow';
      }

      depth1.appendChild(link);

      // 소메뉴 생성
      if (menu.isSubmenu) {
        var depth2 = document.createElement('div');
        depth2.className = 'depth_2';

        if (menu.dataKey === 'rooms') {
          // 객실명은 customFields.roomtypes 기준, status는 rooms[](id 매칭)에서 참조
          var cf = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
          var roomtypes = cf.roomtypes || [];
          var rooms = (data && data.rooms) || [];
          // Layout Map - enabled 확인해서 추가
          if (layoutMapEnabled) {
            var layoutLink = document.createElement('a');
            layoutLink.href = 'layout-map.html';
            layoutLink.textContent = '미리보기';
            depth2.appendChild(layoutLink);
          }

          // 활성화된 객실 추가 (roomtypes 순회, 이름 있는 active 객실만)
          roomtypes.forEach(function(rt) {
            if (!rt.name || !rt.name.trim()) return;
            var matched = rooms.find(function(r) { return r.id === rt.id; });
            if (matched && matched.status === 'inactive') return;
            var roomLink = document.createElement('a');
            roomLink.href = 'room.html?room_id=' + rt.id;
            roomLink.textContent = rt.name;
            depth2.appendChild(roomLink);
          });
        } else if (menu.dataKey === 'facilities' && data.property.facilities) {
          // 시설 동적 생성
          data.property.facilities.forEach(function(facility) {
            var facilityLink = document.createElement('a');
            facilityLink.href = 'facility.html?facility_id=' + facility.id;
            facilityLink.textContent = facility.name;
            depth2.appendChild(facilityLink);
          });
        }

        depth1.appendChild(depth2);
      } else if (menu.items) {
        // 정적 아이템
        var depth2 = document.createElement('div');
        depth2.className = 'depth_2';

        menu.items.forEach(function(item) {
          // enabled 필드 확인
          var isEnabled = true;
          if (item.enabledKey === 'nearbyAttractionsEnabled') {
            isEnabled = nearbyAttractionsEnabled;
          }

          if (isEnabled) {
            var itemLink = document.createElement('a');
            itemLink.href = item.href;
            itemLink.textContent = item.name;
            if (item.isLink && data.property.realtimeBookingId) {
              itemLink.href = data.property.realtimeBookingId;
              itemLink.target = '_blank';
            }
            depth2.appendChild(itemLink);
          }
        });

        if (depth2.children.length > 0) {
          depth1.appendChild(depth2);
        } else {
          return;
        }
      }

      menuContainer.appendChild(depth1);
    });

    // 4. 예약 버튼 링크 설정
    if (data.property.realtimeBookingId) {
      var bookingLinks = document.querySelectorAll('[data-booking-link]');
      bookingLinks.forEach(function(link) {
        link.href = data.property.realtimeBookingId;
        link.target = '_blank';
      });
    }

    // 5. YBS 버튼 표시 및 링크 설정
    var ybsButtons = document.querySelectorAll('[data-ybs-button]');
    var ybsId = data.property.ybsId;
    var ybsUrl = 'https://rev.yapen.co.kr/external?ypIdx=';

    ybsButtons.forEach(function(button) {
      var link = button.querySelector('a');

      if (!ybsId) {
        button.style.display = 'none';
        if (link) {
          link.href = '#!';
          link.removeAttribute('target');
        }
        return;
      }

      button.style.display = 'flex';
      button.setAttribute('data-ybs-id', ybsId);
      if (link) {
        link.href = ybsUrl + ybsId;
        link.target = '_blank';
      }
    });
  },

  mapFooter: function(data) {
    if (!data || !data.property) return;

    var businessInfo = data.property.businessInfo || {};

    // 1. 전화번호
    var phoneEl = document.querySelector('[data-phone]');
    if (phoneEl && businessInfo.businessPhone) {
      phoneEl.textContent = businessInfo.businessPhone;
    }

    // 2. 주소
    var addressEl = document.querySelector('[data-address]');
    if (addressEl && businessInfo.businessAddress) {
      addressEl.textContent = businessInfo.businessAddress;
    }

    // 3. 사업자번호
    var businessNumberEl = document.querySelector('[data-business-number]');
    if (businessNumberEl && businessInfo.businessNumber) {
      businessNumberEl.textContent = businessInfo.businessNumber;
    }

    // 4. 대표자명
    var representativeEl = document.querySelector('[data-representative]');
    if (representativeEl && businessInfo.representativeName) {
      representativeEl.textContent = businessInfo.representativeName;
    }

    // 5. YBS 링크 (있으면 표시)
    if (data.property.ybsId) {
      var ybsLink = document.querySelector('[data-ybs-link]');
      if (ybsLink) {
        ybsLink.href = data.property.ybsId;
        ybsLink.style.display = 'inline-block';
      }
    }

    // 6. Footer 로고 매핑
    var footerLogoElement = document.querySelector('[data-footer-logo]');
    if (footerLogoElement) {
      var logoImg = data.homepage && data.homepage.images && data.homepage.images[0] && data.homepage.images[0].logo;
      if (logoImg && logoImg.length > 0) {
        var selectedLogo = logoImg.find(function(l) { return l.isSelected; }) || logoImg[0];
        if (selectedLogo && selectedLogo.url) {
          footerLogoElement.src = selectedLogo.url;
        } else {
          ImageHelpers.applyPlaceholder(footerLogoElement);
        }
      } else {
        ImageHelpers.applyPlaceholder(footerLogoElement);
      }
    }

  }
};
