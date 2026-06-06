# 📚 독서록 (DokSeoRok)

개인 독서 기록 & 책 추천 웹 서비스 — 웹프로그래밍 기말 프로젝트

읽은 책을 기록하고 별점·리뷰를 남기며, 독서 이력을 분석해 다음에 읽을 책을 추천받는
**풀스택 웹 애플리케이션**입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 (Hooks), React Router, Vite, Axios, Chart.js |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | MongoDB + Mongoose (MongoDB Atlas 클라우드) |
| 외부 API | 카카오 Books API |

## 폴더 구조

```
dokseorok/
├─ client/        # React 프론트엔드 (Vite)
├─ server/        # Express 백엔드 (REST API)
└─ docs/          # 제작보고서, 데이터 모델
```

---

## 실행 방법

### 0. 사전 준비
- Node.js 18+ 설치
- MongoDB 연결 문자열 (아래 중 하나)
  - **MongoDB Atlas(권장, 설치 불필요)**: 클라우드라 노트북을 꺼도 데이터가 유지됩니다.
  - 로컬 MongoDB 설치

#### MongoDB Atlas 연결 문자열 얻기
1. https://cloud.mongodb.com 가입 → 무료 클러스터(M0) 생성
2. **Database Access** 에서 DB 사용자(아이디/비밀번호) 생성
3. **Network Access** 에서 `0.0.0.0/0`(어디서나 접속) 허용
4. **Connect → Drivers** 에서 URI 복사
   `mongodb+srv://<id>:<pw>@cluster0.xxxxx.mongodb.net/dokseorok?retryWrites=true&w=majority`

### 1. 백엔드 실행

```bash
cd server
npm install
copy .env.example .env        # (Windows)  /  cp .env.example .env (mac/linux)
```

`.env` 의 `MONGODB_URI` 에 위 연결 문자열을 붙여넣습니다.
```
MONGODB_URI=mongodb+srv://...      # Atlas URI
JWT_SECRET=아무_긴_문자열
```

서버 실행:
```bash
npm run dev              # http://localhost:4000
```
`✅ MongoDB 연결 완료` 가 보이면 정상입니다. (컬렉션·인덱스는 자동 생성)

### 2. 프론트엔드 실행 (새 터미널)

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

브라우저에서 http://localhost:5173 접속 → 회원가입 후 사용.
개발 중에는 Vite가 `/api` 요청을 백엔드(4000)로 자동 프록시합니다.

### 3. 카카오 Books API 연동 (선택)

키가 없어도 샘플 도서 24권으로 동작합니다. 실제 검색을 쓰려면
[Kakao Developers](https://developers.kakao.com) 에서 REST API 키를 발급받아
`server/.env` 의 `KAKAO_REST_API_KEY=` 에 입력 후 서버를 재시작하세요.

---

## 주요 기능

- 회원가입 / 로그인 (JWT 토큰 + bcrypt 비밀번호 해싱)
- 책 검색 (카카오 Books API, 제목·저자·ISBN)
- 독서 기록 관리 (읽고 싶은 / 읽는 중 / 완독, 진행률)
- 리뷰 & 별점 CRUD
- 저자 기반 책 추천
- 독서 통계 — 월별 완독 권수(막대), 별점 분포(도넛)

## 배포 (제출용 — 노트북 없이 항상 동작)

세 가지를 클라우드에 올리면 내 컴퓨터를 꺼도 URL이 살아 있습니다.

1. **DB → MongoDB Atlas** (이미 클라우드)
2. **백엔드(server/) → Render / Railway** 등 무료 호스팅
   - 환경변수: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN(프론트 주소), KAKAO_REST_API_KEY
3. **프론트엔드(client/) → Vercel**
   - 환경변수 VITE_API_URL 에 2번 백엔드 주소 입력 → https://프로젝트.vercel.app 발급

> 발표 영상 촬영은 로컬 실행(1·2 터미널)만으로도 충분합니다.
> DB는 Atlas라서 로컬/배포 어느 쪽이든 동일한 데이터를 사용합니다.

자세한 설계는 docs/제작보고서.md, 데이터 모델은 docs/data-model.md 참고.

## API 요약

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/signup, /login | 회원가입 / 로그인 |
| GET/PATCH | /api/auth/me | 내 정보 / 닉네임 수정 |
| GET | /api/books/search?query= | 책 검색 (카카오) |
| GET | /api/books/recommend | 맞춤 추천 |
| GET/POST/PATCH/DELETE | /api/records | 독서 기록 CRUD |
| GET/POST/DELETE | /api/reviews | 리뷰 CRUD |

202414206 이승호
