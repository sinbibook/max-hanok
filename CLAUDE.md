# Homepage Builder Template Development Guide

## 프로젝트 개요
홈페이지 빌더를 위한 템플릿 시스템입니다. 데이터 매칭을 통해 동적으로 콘텐츠가 업데이트되는 구조입니다.

## ⚠️ 중요 규칙
1. **절대 수정하지 말아야 할 부분**
   - `js/data-mapper/` 디렉토리의 모든 파일
   - `standard-template-data.json` 파일 구조
   - `BaseDataMapper` 클래스

2. **수정 가능한 부분**
   - `pages/` 디렉토리의 HTML 파일들
   - `styles/` 디렉토리의 CSS 파일들
   - HTML 템플릿의 구조와 디자인

## 디렉토리 구조
```
temp1/
├── pages/                    # HTML 템플릿 (수정 가능)
│   ├── index.html           # 메인 페이지
│   ├── room.html            # 객실 페이지
│   ├── facility.html        # 시설 페이지
│   ├── reservation.html     # 예약 페이지
│   ├── directions.html      # 오시는 길
│   └── common/              # 공통 컴포넌트
│       ├── header.html      # 헤더
│       └── footer.html      # 푸터
├── styles/                  # CSS 스타일 (수정 가능)
│   ├── common.css          # 공통 스타일
│   └── [page].css          # 페이지별 스타일
├── js/
│   ├── data-mapper/        # 데이터 매핑 시스템 (수정 금지!)
│   └── pages/              # 페이지별 JS
└── standard-template-data.json  # 데이터 소스 (수정 금지!)
```

## 템플릿 작업 가이드

### HTML 템플릿 수정 시
1. **데이터 바인딩 속성 유지**
   ```html
   <!-- 이런 속성들은 반드시 유지 -->
   <h1 data-index-property-name></h1>
   <div data-room-hero-slides-container></div>
   ```

2. **클래스명 규칙**
   - BEM 방식 권장: `block__element--modifier`
   - 예: `hero__title`, `room-card__image--featured`

3. **반응형 디자인**
   - 모바일 퍼스트 접근
   - Breakpoints: 768px (tablet), 1024px (desktop)

### CSS 스타일 수정 시
1. **CSS 변수 활용**
   ```css
   :root {
     --primary-color: #your-color;
     --spacing-unit: 1rem;
   }
   ```

2. **페이지별 스타일 분리**
   - 공통 스타일: `common.css`
   - 페이지 고유 스타일: `[page].css`

## 새 템플릿 추가하기

### Step 1: HTML 템플릿 생성
```html
<!-- pages/new-template.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title data-new-template-title></title>
    <link rel="stylesheet" href="../styles/common.css">
    <link rel="stylesheet" href="../styles/new-template.css">
</head>
<body>
    <!-- 헤더 로드 -->
    <div id="header-container"></div>

    <!-- 콘텐츠 영역 -->
    <main>
        <section data-new-template-section>
            <!-- 데이터 바인딩 요소들 -->
        </section>
    </main>

    <!-- 푸터 로드 -->
    <div id="footer-container"></div>

    <script src="../js/common/header-footer-loader.js"></script>
</body>
</html>
```

### Step 2: CSS 스타일 생성
```css
/* styles/new-template.css */
.new-template-section {
    /* 스타일 정의 */
}
```

### Step 3: 데이터 속성 매핑
데이터 속성명은 다음 패턴을 따릅니다:
- `data-[page]-[element]-[property]`
- 예: `data-index-hero-title`, `data-room-list-container`

## 데이터 구조 이해하기
```json
{
  "property": {
    "name": "속성명",
    "description": "설명"
  },
  "homepage": {
    "customFields": {
      "pages": {
        "index": {
          "sections": [
            {
              "hero": {
                "title": "제목",
                "subtitle": "부제목"
              }
            }
          ]
        }
      }
    }
  }
}
```

## 테스트 및 디버깅

### 로컬 테스트
1. HTML 파일을 브라우저에서 직접 열기
2. 개발자 도구 콘솔에서 데이터 로딩 확인
3. 네트워크 탭에서 리소스 로딩 확인

### 디버깅 팁
- 데이터 바인딩 실패 시 콘솔 확인
- `data-` 속성명 오타 체크
- CSS 클래스명 일치 여부 확인

## 주의사항
1. **이미지 최적화**: 외부 URL 사용, 로컬 저장 지양
2. **크로스 브라우저**: Chrome, Safari, Firefox 지원
3. **접근성**: ARIA 속성, 시맨틱 태그 사용
4. **SEO**: meta 태그, 구조화된 데이터 유지

## 개발 명령어
```bash
# 로컬 서버 실행 (있는 경우)
npm run dev

# 코드 검사
npm run lint

# 타입 체크
npm run typecheck
```

## 파일 명명 규칙
- HTML: `kebab-case.html`
- CSS: `kebab-case.css`
- 이미지: `kebab-case-descriptive-name.jpg`

## 버전 관리
- 템플릿 변경 시 주석으로 버전과 날짜 기록
- 예: `<!-- v1.2.0 - 2025-09-22: 갤러리 섹션 추가 -->`

---

**Remember**:
- ✅ HTML/CSS 수정 가능
- ❌ data-mapper 수정 금지
- ❌ standard-template-data.json 구조 변경 금지