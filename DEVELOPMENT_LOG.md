# 개발일지 
## 프로젝트개요 - 프로젝트명:여행계획플래너 개발기간:2일 목표:상용프로그램에 가까운 웹 완성 
## 개발과정
### week1
#### Day 1 -프로젝트 기획- **작업내용**

## 질:나는 gmini CLI를 통해 여행계획 플래너를 만들려고해 Frontend는 vanilla js styling 은 css modules backend는 node.js를 이용할거야 gemini CLI에 사용되는 gemini.md파일 만들어줘

### 답:좋습니다. 요청하신 '여행 계획 플래너' 프로젝트를 위한 gemini.md 파일입니다.

이 파일에는 Gemini CLI가 프로젝트의 기본 구조를 생성하는 데 필요한 핵심 정보가 포함되어 있습니다.

기술 스택: 요청하신 대로 Vanilla JS, CSS Modules, Node.js(Express.js 포함)를 명시했습니다.

핵심 기능: 여행 플래너에 필요한 기본적인 CRUD(생성, 읽기, 업데이트, 삭제) 기능을 정의했습니다.

백엔드 API: 프론트엔드와 통신할 간단한 Node.js API 엔드포인트를 명시했습니다.

데이터베이스: 별도 언급이 없어, 시작하기 쉽도록 Node.js 서버의 메모리 내(in-memory) 배열에 데이터를 저장하는 것으로 설정했습니다.

아래 내용을 복사하여 프로젝트 루트 디렉터리에 gemini.md라는 이름의 파일로 저장한 뒤 gemini init 명령을 실행해 보세요.

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

## gemini CLI에 위 프롬폼트 넣고 동작 

