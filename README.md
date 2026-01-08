# Todo 일정관리 서비스

JWT 인증과 카테고리/일정 관리를 포함한 Todo API + React 클라이언트 프로젝트입니다.

## 프로젝트 실행 방법

### 사전 준비
- Node.js (권장: 18+)
- PostgreSQL
- Redis

### 서버 실행
1) `server` 폴더로 이동 후 의존성 설치
```bash
cd server
npm install
```

2) `.env` 설정
```bash
# server/.env 예시
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_SEC=1209600
REDIS_URL=redis://HOST:PORT
```

3) DB 마이그레이션 및 실행
```bash
npm run db:migrate
npm run dev
```

4) API 문서
- `http://localhost:4000/api-docs`

### 클라이언트 실행
1) `client` 폴더로 이동 후 의존성 설치
```bash
cd client
npm install
```

2) `.env` 설정 (필요 시)
```bash
# client/.env 예시
VITE_API_BASE_URL=http://localhost:4000
```

3) 개발 서버 실행
```bash
npm run dev
```

## ERD 및 테이블 설계 설명

### ERD (텍스트 표현)
```
User 1 --- N Category
User 1 --- N Todo
Category 1 --- N Todo (nullable)
```

### 테이블 요약
- `users`
  - `id (UUID)`, `email (unique)`, `nickname`, `password`, `created_at`, `updated_at`
- `categories`
  - `id (UUID)`, `user_id (FK)`, `name`, `color`, `created_at`, `updated_at`
  - 제약: `UNIQUE(user_id, name)`
  - 기본 색상: `#D6EAF3`
- `todos`
  - `id (UUID)`, `user_id (FK)`, `category_id (FK, nullable)`
  - `text`, `start_date`, `end_date`, `is_all_day`, `is_completed`, `created_at`, `updated_at`
  - 인덱스: `(user_id, start_date)`

### 관계/정책
- `users` 삭제 시: 관련 `categories`, `todos`는 `CASCADE` 삭제
- `categories` 삭제 시: 관련 `todos.category_id`는 `SET NULL` 처리

## Redis 사용 방식 설명

- **Refresh Token 저장소**
  - 키: `refresh:{userId}`
  - 로그인 시 refresh token 저장, TTL은 `REFRESH_TOKEN_TTL_SEC` 기준
- **Refresh Token 회전(rotate)**
  - `/api/auth/refresh` 호출 시 새 refresh 발급 후 Redis 갱신
- **Access Token 블랙리스트**
  - 로그아웃 시 access token의 `jti`를 `bl:access:{jti}`로 저장
  - TTL은 access token 만료 시간 기준
- **인증 미들웨어**
  - 요청마다 `bl:access:{jti}` 조회로 즉시 폐기된 토큰 차단

## 주요 설계 판단 및 트레이드오프

- **Refresh 토큰 서버 저장(상태 저장형)**
  - 장점: 로그아웃/만료 관리가 명확, 토큰 재사용 방지
  - 단점: Redis 의존 및 상태 관리 비용 증가
- **Access 토큰 블랙리스트 조회**
  - 장점: 로그아웃 즉시 반영
  - 단점: 매 요청 Redis 조회 비용 발생
- **일정 겹침 조회(기간 필터)**
  - 장점: 주/일/기간 조회에 유연
  - 단점: 조건이 복잡해져 쿼리 튜닝 필요 가능성
- **All-day 일정 정규화**
  - `isAllDay=true`일 때 `start_date`를 00:00, `end_date`를 23:59:59.999로 보정
  - 장점: 조회/정렬 일관성
  - 단점: 타임존 처리 시 주의 필요
- **카테고리 선택을 선택사항으로 설계**
  - 장점: 카테고리 없이도 Todo 생성 가능
  - 단점: 분류 없는 데이터가 늘어날 수 있음

## 데일리 작업 기록 (코드/마이그레이션 기준 정리)


