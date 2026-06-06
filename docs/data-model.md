# 독서록(DokSeoRok) 데이터 모델 (MongoDB)

MongoDB + Mongoose 기반. 컬렉션 4개로 구성된다.
정수 PK 대신 MongoDB 의 `_id`(ObjectId)를 사용하며, 책은 `isbn` 으로 식별한다.

## users
| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | PK |
| email | String (unique) | 로그인 ID |
| password | String | bcrypt 해시 |
| nickname | String | 표시 이름 |
| createdAt | Date | 가입 시각 |

## books
카카오 API로 검색한 책을 서재 추가/리뷰 작성 시 `isbn` 기준으로 upsert 한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | PK |
| isbn | String (unique) | 책 식별자 |
| title, author, publisher | String | 서지 정보 |
| cover_img | String | 표지 URL |
| contents | String | 소개 |

## records (독서 기록 / 내 서재)
| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | PK |
| user | ObjectId → users | 참조 |
| book | ObjectId → books | 참조 |
| status | String enum(want/reading/completed) | 상태 |
| progress | Number(0~100) | 진행률 |
| startDate, updatedAt | Date | 시각 |

> 복합 유니크 인덱스 `(user, book)` — 한 사용자가 한 책에 하나의 기록만 가진다.

## reviews (리뷰 & 별점)
| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | PK |
| user | ObjectId → users | 참조 |
| book | ObjectId → books | 참조 |
| rating | Number(1~5) | 별점 |
| content | String | 한줄평 |
| createdAt, updatedAt | Date | 시각 |

> 복합 유니크 인덱스 `(user, book)` — 책당 하나의 리뷰.

## 관계도

```
users (1) ──< records >── (1) books
users (1) ──< reviews >── (1) books
```
