# Todo 일정관리 서비스 (Intern Study STEP 1)

본 프로젝트는 사용자 맞춤형 일정 관리와 카테고리 분류 기능을 제공하는 풀스택 웹 애플리케이션입니다. RDBMS를 활용한 데이터 모델링과 Redis를 이용한 인증 최적화에 중점을 두어 설계되었습니다.

## 1. 프로젝트 실행 방법

### 사전 준비
- Node.js: v18.0.0 이상
- Database: PostgreSQL (로컬 설치 및 실행 필요)
- Docker: Redis 컨테이너 실행용

### 서버 (Server)
1) `server` 폴더로 이동 후 의존성 설치
```bash
cd server
npm install
```

2) `.env` 파일 설정 (JWT Secret, DB URL, Redis URL 등)

3) Prisma 마이그레이션 실행
```bash
npx prisma migrate dev
```

4) 서버 실행 (기본 4000 포트)
```bash
npm run dev
```

### 클라이언트 (Client)
1) `client` 폴더로 이동 후 의존성 설치
```bash
cd client
npm install
```

2) 개발 서버 실행
```bash
npm run dev
```

## 2. ERD 및 테이블 설계

### 데이터 모델링 의존성 및 정책
- User (1) : Category (N) / User (1) : Todo (N)
- Category (1) : Todo (N) (Optional 관계)

### 삭제 정책 (Delete Policy)
- User 삭제 시 관련 Category, Todo 모두 CASCADE 삭제하여 데이터 무결성 유지
- Category 삭제 시 연결된 Todo의 `category_id`는 SET NULL 처리하여 일정 데이터가 유실되지 않도록 설계

### 주요 테이블 요약
| 테이블 | 설명 | 핵심 컬럼 |
| --- | --- | --- |
| users | 사용자 정보 | email(unique), password(hashed), nickname |
| categories | 일정 분류 | name, color, user_id(FK) |
| todos | 일정/할 일 | text, start_date, end_date, is_completed, is_all_day |

## 3. Redis 활용 및 인증 구조

### Redis 도입 이유 및 구현 상세
단순한 JWT 기반 인증은 토큰 탈취 시 즉각적인 무효화가 어렵습니다. 본 프로젝트는 보안성을 극대화하기 위해 Redis를 상태 저장소로 활용하여 인증 시스템을 보완했습니다.

### Refresh Token Rotation (RTR)
- 구현: 로그인 시 발급된 Refresh Token을 Redis에 `refresh:{userId}` 키 형태로 저장
- 동작: 토큰 갱신 요청 시 클라이언트의 토큰과 Redis 내 토큰을 대조. 불일치할 경우 토큰 탈취로 간주하고 Redis 내 토큰을 삭제

### Access Token Blacklist
- 구현: 로그아웃 시 사용 중인 Access Token의 jti(Unique ID)를 추출하여 `bl:access:{jti}` 키로 Redis에 등록
- 수명 관리: 블랙리스트의 TTL(Time-To-Live)은 해당 Access Token의 남은 수명만큼 설정
- 검증: 모든 인증 미들웨어에서 DB 접근 전 Redis를 우선 조회하여 블랙리스트 여부 체크

### 도커(Docker) 기반 Redis 환경 구성
- 환경 경량화: 호스트 OS에 Redis를 직접 설치하지 않고 공식 Redis 이미지로 독립된 캐시 서버 환경 구축
- 일관성 유지: docker run 또는 docker-compose로 고정된 버전의 Redis 환경 실행
- 인프라 분리: PostgreSQL(영구 데이터)과 Redis(휘발성 인증 데이터)를 분리 운영

## 4. Frontend & 스타일링 전략 (SCSS)

과제 요구사항에 따라 CSS 단일 파일을 지양하고 SCSS 아키텍처를 구조화했습니다.

### 구조화 (Modularization)
- `_variables.scss`: 브랜드 컬러($primary), 폰트 사이즈 등 상수 관리
- `_mixins.scss`: Flexbox 중앙 정렬, 미디어 쿼리(반응형) 등 재사용 로직
- `_base.scss`: Reset 및 공통 태그 스타일

### 컴포넌트 스타일링
- Button, Input 등 공통 UI 요소는 별도 Partial 파일로 분리하여 관리
- Nesting 구조를 활용하여 클래스명 충돌 방지 및 가독성 확보

## 5. 설계 판단 및 트레이드오프

- Todo 테이블 통합: 일정(Schedule)과 할 일(Todo)을 분리하지 않고 `start_date` 유무로 구분하도록 통합 설계. 쿼리 복잡도를 줄이는 대신 필터링 로직의 정교함이 요구됨
- All-day 일정 보정: 종일 일정의 경우 서버단에서 시간을 00:00:00 ~ 23:59:59로 강제 보정하여 기간 검색 시 누락 방지

## 6. 데일리 작업 기록 (Daily Log)

### Day 1: 기초 설계 및 스키마 정의
- 작업 범위: ERD 설계, Prisma 초기 세팅, User/Category/Todo 관계 정의, 초기 마이그레이션 생성
- 주요 파일: `server/prisma/schema.prisma`, `server/prisma/migrations/*`
- 시행착오/문제 해결: 카테고리 삭제 시 일정 유실 위험을 고려해 `SET NULL` 정책으로 조정, 유니크 제약 및 FK 관계 재검토
- 테스트/검증: `npx prisma migrate dev` 실행 후 테이블 생성 확인

### Day 2: 기능 구현 및 데이터 정규화
- 작업 범위: Todo CRUD API 개발, 날짜 기반 필터(오늘/주간/기간) 쿼리 작성, 일정/할 일 통합 구조 정리
- 주요 파일: `server/src` 내 todo 관련 라우트/서비스/쿼리
- 시행착오/문제 해결: Timezone 문제를 줄이기 위해 DB에는 UTC 저장, 클라이언트 변환 방식으로 정리
- 테스트/검증: CRUD 및 날짜 필터 API를 수동 호출하여 정상 응답 확인

### Day 3: 인증 고도화 및 스타일링
- 작업 범위: Refresh Token Rotation, Access Token Blacklist 구현, SCSS 아키텍처 구축 및 UI 컴포넌트 정리
- 주요 파일: `server/src` 내 auth/redis 관련 모듈, `client/src/styles/*`
- 시행착오/문제 해결: 매 요청 Redis 조회 비용과 보안 요구사항을 비교 검토 후 블랙리스트 방식 유지
- 테스트/검증: 로그인-갱신-로그아웃 플로우 수동 호출로 토큰 회전 및 블랙리스트 동작 확인

### 최종 요약
핵심 요구사항인 인증과 일정 관리를 마쳤으며, SCSS 변수를 통해 일관된 UI 톤을 유지했습니다.
