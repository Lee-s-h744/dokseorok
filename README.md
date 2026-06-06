# 독서록(DokSeoRok) 제작 보고서

**과목**: 웹프로그래밍 · **프로젝트**: 독서록 — 개인 독서 기록 & 책 추천 웹 서비스
**작성자**: 202414206 이승호

---

## 1. 프로젝트 개요

독서록은 사용자가 읽은 책을 기록하고 별점·리뷰를 남기며, 독서 이력을 분석해 다음에
읽을 책을 추천받는 개인 독서 관리 웹 서비스다. React + Node.js(Express) 풀스택으로
구현했으며, 데이터베이스는 노트북 전원과 무관하게 항상 접속 가능한 **MongoDB Atlas
(클라우드)** 를 사용한다.

## 2. 시스템 아키텍처

```
[ React (Vite) SPA ]  ── Axios + JWT ──▶  [ Express REST API ]
   client/ :5173                              server/ :4000
                                                 │
                                          Mongoose ODM
                                                 │
                                     [ MongoDB Atlas ]  ◀── 카카오 Books API
```

- 프론트엔드와 백엔드를 분리한 클라이언트-서버 구조.
- 인증은 JWT 토큰 기반. 로그인 시 발급한 토큰을 Axios 인터셉터가 모든 요청 헤더
  (`Authorization: Bearer ...`)에 자동 첨부한다.
- 비밀번호는 bcrypt 로 해싱하여 저장한다.
- 데이터 접근은 Mongoose ODM 으로 추상화했으며, DB는 클라우드(Atlas)에 두어
  로컬 실행과 배포가 동일한 데이터를 공유한다.

## 3. 데이터베이스 설계 (MongoDB)

4개 컬렉션으로 구성된다. 상세 모델은 `docs/data-model.md` 참고.

| 컬렉션 | 주요 필드 | 관계 |
|--------|-----------|------|
| users | email(unique), password(bcrypt), nickname, createdAt | 1:N records, reviews |
| books | isbn(unique), title, author, publisher, cover_img, contents | 1:N records, reviews |
| records | user(ref), book(ref), status, progress, startDate, updatedAt | (user,book) 유니크 인덱스 |
| reviews | user(ref), book(ref), rating, content, createdAt, updatedAt | (user,book) 유니크 인덱스 |

카카오 API로 검색한 책은 서재 추가/리뷰 작성 시점에 `books` 컬렉션으로 upsert 되고,
`records`·`reviews`가 ObjectId 참조(ref)로 책을 가리킨다. `(user, book)` 복합 유니크
인덱스로 "한 사용자가 한 책에 하나의 기록·리뷰"를 보장한다.

## 4. REST API 설계

| 분류 | 메서드 · 경로 | 인증 | 설명 |
|------|---------------|------|------|
| 인증 | POST /api/auth/signup, /login | – | 회원가입 / 로그인 (토큰 발급) |
| 인증 | GET/PATCH /api/auth/me | ✓ | 내 정보 조회 / 닉네임 수정 |
| 도서 | GET /api/books/search | – | 카카오 Books 검색 (폴백: 샘플) |
| 도서 | GET /api/books/recommend | ✓ | 저자 기반 추천 |
| 기록 | GET/POST/PATCH/DELETE /api/records | ✓ | 독서 기록 CRUD |
| 리뷰 | GET/POST/DELETE /api/reviews | ✓ | 리뷰·별점 CRUD |

## 5. 핵심 기능 구현

### 5.1 인증 (JWT + bcrypt)
회원가입 시 bcrypt로 비밀번호를 해싱하고, 로그인 성공 시 JWT(7일 만료)를 발급한다.
보호 라우트는 `authRequired` 미들웨어가 토큰을 검증한다.

### 5.2 책 검색 (카카오 Books API)
`services/kakao.js`가 카카오 검색 API를 호출해 응답을 앱 표준 형태로 정규화한다.
API 키가 없거나 호출 실패 시 샘플 데이터로 자동 폴백하여, 키 없이도 전체 기능을
시연할 수 있다.

### 5.3 독서 기록 / 리뷰 (CRUD)
Mongoose `findOneAndUpdate(upsert)` 와 복합 유니크 인덱스로 동일 책에 대한 기록·리뷰를
중복 없이 갱신한다. 상태를 '완독'으로 바꾸면 진행률을 100%로 자동 설정한다.

### 5.4 추천
서재에서 가장 자주 등장한 저자를 추출해 카카오에서 해당 저자의 다른 책을 검색하고,
이미 담은 책을 제외해 추천한다. 이력이 없으면 기본 추천 목록으로 보충한다.

### 5.5 독서 통계 (Chart.js)
마이페이지에서 최근 6개월 월별 완독 권수(막대)와 별점 분포(도넛)를 시각화한다.
※ 제안서의 '장르 분포'는 카카오 Books API가 장르 필드를 제공하지 않아 '별점 분포'로
대체했다. 장르 통계가 필요하면 도서 등록 시 장르 선택 UI를 추가하면 된다.

## 6. 테스트

백엔드 라우트의 응답 계약(API 형태)에 대해 회원가입·중복차단·로그인 실패/성공·인증
차단·검색·기록 upsert·상태 변경·리뷰 CRUD·유효성 검사·추천·삭제까지 17개 통합
테스트 케이스로 동작을 확인했다. Mongoose 모델은 스키마·인덱스·가상 필드(id) 정의를
검증했다.

## 7. 보안 및 한계

- 비밀번호는 bcrypt 해시로 저장하며 평문을 보관하지 않는다.
- JWT 비밀키와 DB 접속 문자열은 `.env` 로 분리해 코드에 노출하지 않는다.
- 토큰은 현재 localStorage에 저장한다. 운영 환경에서는 httpOnly 쿠키 + CSRF 대책을
  고려할 수 있다.

## 8. 향후 확장

소셜 기능(독서 친구·리뷰 공유), AI 추천 고도화, 모바일 앱(React Native) 전환,
독서 모임 게시판 등 제안서의 확장 방안을 단계적으로 적용할 수 있다.

## 9. AI 활용

프로젝트 진행 과정에서 생성형 AI(LLM 기반 코딩 어시스턴트)를 보조 도구로 활용했다.
설계 방향 정리, 보일러플레이트 작성, 오류 원인 파악, 배포 설정 등에서 시간을 단축했으며,
AI가 제시한 결과물은 그대로 사용하지 않고 직접 이해·검증·수정하는 과정을 거쳤다.

### 9.1 활용 단계별 프롬프트 예시

**(1) 기획 · 설계**
> "개인 독서 기록 웹 서비스를 만들려고 한다. 책 검색, 독서 상태 관리, 리뷰·별점,
> 추천 기능을 넣을 때 MongoDB로 어떤 컬렉션과 필드 구조를 잡는 게 좋을지,
> 컬렉션 간 관계와 인덱스까지 포함해 제안해줘."

→ 제안받은 구조를 검토한 뒤 `users·books·records·reviews` 4개 컬렉션으로 정리하고,
중복 방지를 위해 `(user, book)` 복합 유니크 인덱스를 직접 추가했다.

**(2) 인증 구현**
> "Express에서 JWT 토큰 기반 로그인과 bcrypt 비밀번호 해싱을 적용한
> 회원가입·로그인 라우트 예시를 보여줘. 토큰 검증 미들웨어도 함께."

→ 예시 코드를 바탕으로 토큰 만료 기간, 에러 응답 메시지(한글), 라우트 구조를
프로젝트에 맞게 수정해 적용했다.

**(3) 외부 API 연동**
> "카카오 Books API 검색 응답(JSON)을 우리 앱에서 쓰기 좋은 형태
> (isbn, title, author, publisher, cover_img)로 정규화하는 함수를 작성해줘.
> API 키가 없을 때 샘플 데이터로 대체하는 폴백 처리도 포함해서."

→ 정규화 로직과 폴백 구조를 받아, ISBN 추출 방식과 에러 처리 부분을 보완했다.

**(4) 프론트엔드 컴포넌트**
> "React에서 별점(1~5)을 마우스 호버로 미리보기하고 클릭으로 선택하는
> StarRating 컴포넌트를 함수형 + Hooks로 만들어줘. 읽기 전용 모드도 지원."

→ 컴포넌트 골격을 받아 스타일과 상태 관리 방식을 프로젝트 톤에 맞게 조정했다.

**(5) 디버깅**
> "MongoDB Atlas에 연결하는데 'querySrv ECONNREFUSED' 오류가 난다.
> 원인과 해결 방법을 알려줘."

→ SRV(DNS) 조회 문제임을 파악하고, 안내받은 방법 중 일반 연결 문자열(mongodb://)
형태로 바꾸는 방식으로 해결했다.

**(6) 배포 설정**
> "React(Vite) 프론트엔드는 Vercel, Express 백엔드는 Render, DB는 MongoDB Atlas로
> 배포하려고 한다. 각 플랫폼에서 환경변수와 CORS를 어떻게 설정해야 하는지 정리해줘."

→ 안내받은 절차대로 환경변수를 등록하고, CORS 허용 도메인(`CLIENT_ORIGIN`)을
실제 Vercel 주소로 맞춰 설정했다.

## 10. 실행 및 배포

`README.md` 의 절차 참고. 백엔드(server/)와 프론트엔드(client/)를 각각 실행하며,
DB는 MongoDB Atlas(클라우드)를 사용한다. 완전 온라인 배포 시 프론트는 Vercel,
백엔드는 Render/Railway, DB는 Atlas로 구성하면 개인 PC 전원과 무관하게 동작한다.
