# Travel Planner (여행 계획 플래너)

## Tech Stack
- **Frontend:** Vanilla JavaScript (ES Modules)
- **Backend:** Node.js (using Express.js)
- **Styling:** CSS Modules
- **Database:** In-memory JSON array (데이터베이스 없이 간단한 서버 메모리에 저장)

## Core Features
- **여행 목록 조회 (Read):**
  - 메인 페이지에 저장된 모든 여행 계획 목록을 표시합니다.
  - 각 항목은 여행 제목과 날짜를 보여줍니다.
- **새 여행 생성 (Create):**
  - 여행 제목, 시작일, 종료일을 입력할 수 있는 폼(form)을 제공합니다.
  - 폼 제출 시 백엔드 API로 POST 요청을 보냅니다.
- **여행 삭제 (Delete):**
  - 각 여행 항목 옆에 삭제 버튼을 만듭니다.
  - 버튼 클릭 시 백엔드 API로 DELETE 요청을 보냅니다.
- **(Optional) 여행 세부 일정 추가:**
  - 특정 여행에 속하는 세부 활동(예: '1일차: 도쿄 타워 방문')을 추가하는 기능.

## Backend API (Node.js / Express)
- `express.json()` 미들웨어를 사용하여 JSON 요청 본문을 파싱합니다.
- `cors` 패키지를 사용하여 프론트엔드의 API 요청을 허용합니다.
- **Endpoints:**
  - `GET /api/trips`: 모든 여행 목록을 반환합니다.
  - `POST /api/trips`: 새 여행을 생성합니다. (Body: `{ title, startDate, endDate }`)
  - `DELETE /api/trips/:id`: ID를 기준으로 특정 여행을 삭제합니다.

## Frontend (Vanilla JS)
- `index.html`: 기본 HTML 파일. 여행 목록을 표시할 `<div id="trip-list">`와 새 여행을 추가할 `<form id="new-trip-form">`을 포함합니다.
- `app.js` (or `main.js`):
  - 페이지 로드 시 `fetch`를 사용해 `GET /api/trips`로 여행 목록을 가져옵니다.
  - 가져온 데이터로 `#trip-list` DOM을 동적으로 렌더링합니다.
  - `#new-trip-form`의 'submit' 이벤트를 처리하여 `POST /api/trips` 요청을 보냅니다.
  - 삭제 버튼의 'click' 이벤트를 처리하여 `DELETE /api/trips/:id` 요청을 보냅니다.
- `style.css` (or modular CSS files):
  - CSS Modules 원칙에 따라 각 컴포넌트(예: `.trip-item`, `.trip-form`)에 대한 스타일을 정의합니다.