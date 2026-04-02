/intervention 페이지에 아래 3가지를 추가해줘.
기존 디자인과 TVING 다크 테마를 유지하면서 자연스럽게 배치해줘.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[데이터 구조 업데이트 - 먼저 적용]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
기존 샘플 데이터에 2개 컬럼 추가하고
50개 데이터를 아래 형식으로 새로 하드코딩해줘:

{
  user_id: "USR-XXXX",
  date: "2025-03-01",
  churn_score: 0.00~1.00 (float),
  risk_band: "High Risk" | "Mid Risk" | "Low Risk",
  watch_time: 숫자(분),
  search_count: 숫자,
  recommend_click: 숫자,
  device: "Mobile" | "TV" | "Web" | "Tablet",
  segment: "Low Activity" | "Regular User" | "Power User",
  last_active_days: 숫자(1~90, High Risk일수록 큰 값),  ← 신규 추가
  payment_fail: 0 또는 1 (High Risk일수록 1 많도록)    ← 신규 추가
}

데이터 분포:
- churn_score >= 0.7 (High Risk): 15명 / churn_score >= 0.4 (Mid Risk): 20명 / 나머지 (Low Risk): 15명
- High Risk 유저: last_active_days 20~60, payment_fail 1 많도록
- Low Risk 유저: last_active_days 1~5, payment_fail 0 많도록

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[추가 1] Churn Score Distribution 히스토그램
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
차트 제목: "Churn Score Distribution"
부제(소문자): "ML 모델 이탈 예측 점수 분포 | 전체 예측 대상자"

차트 스펙:
- X축: 0.0~1.0 구간을 0.1 단위로 10개 구간 (0.0-0.1, 0.1-0.2 ... 0.9-1.0)
- Y축: 해당 구간 유저 수 (Users)
- 막대 색상 규칙:
    0.0~0.4 구간 → #22C55E (Low Risk 초록)
    0.4~0.7 구간 → #F59E0B (Mid Risk 주황)
    0.7~1.0 구간 → #EF4444 (High Risk 빨강)

[중요] 0.7 지점에 수직선(vertical reference line) 추가:
- 선 색상: 흰색 (#FFFFFF), 점선(dashed), 두께 2px
- 선 위에 라벨 텍스트: "High Risk Threshold"
- 라벨 위치: 선 상단, 우측 정렬
- 라벨 색상: #EF4444 (레드)
- 라벨 배경: 반투명 다크 (#1a1a2e 80% opacity) 박스

Recharts의 ReferenceLine 컴포넌트 사용:
<ReferenceLine x={0.7} stroke="#ffffff" strokeDasharray="4 4"
  label={{ value: "High Risk Threshold", position: "top", fill: "#EF4444", fontSize: 11 }} />

막대 위에 유저 수 숫자 라벨 표시
차트 하단에 범례(Legend): 🟢 Low Risk  🟡 Mid Risk  🔴 High Risk

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[추가 2] Feature Importance 수평 막대 차트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
차트 제목: "Churn Prediction 주요 영향 변수"
부제: "Feature Importance (XGBoost 기반)"
우측 상단에 작은 뱃지: "Model Explainability"

데이터 (고정값, 정렬: 내림차순):
const featureImportance = [
  { feature: "접속 빈도 감소",   importance: 0.31, label: "last_active_days" },
  { feature: "시청시간 감소",    importance: 0.24, label: "watch_time" },
  { feature: "추천 클릭 감소",   importance: 0.18, label: "recommend_click" },
  { feature: "검색 실패",        importance: 0.15, label: "search_count" },
  { feature: "결제 실패",        importance: 0.12, label: "payment_fail" },
]

차트 스펙:
- 수평(Horizontal) 막대 차트 (Recharts HorizontalBar)
- Y축: feature 한글명 (왼쪽 정렬)
- X축: 0 ~ 0.35 (importance 값)
- 막대 색상: TVING RED #FF153C 단색, 투명도 gradient (중요도 높을수록 진함)
- 막대 끝에 importance 수치 + 컬럼명 표시
  예: "0.31  last_active_days"
- 막대 배경(track): 회색 (#2a2a3a) 전체 너비 표시

차트 하단에 회색 소문자 설명 텍스트:
"각 변수가 이탈 예측에 기여하는 상대적 중요도. 값이 클수록 이탈 예측에 더 큰 영향을 미칩니다."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[추가 3] Rule-based Intervention 로직 패널
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
위치: 유저 리스트 테이블 바로 위 or 우측 사이드
제목: "Rule-based Intervention Suggestion"
부제: "모델 점수 + 행동 패턴 기반 자동 액션 추천"

아래 규칙을 카드 형태로 3개 표시:

카드 1 (빨간 테두리 #EF4444):
조건 아이콘: ⚡
조건: IF  churn_score > 0.9
액션: →  전화 상담 우선 배정
설명: 즉각적 개입 필요. CS팀 에스컬레이션

카드 2 (주황 테두리 #F59E0B):
조건 아이콘: 📺
조건: IF  watch_time 전주 대비 50% 이상 감소
액션: →  개인화 콘텐츠 추천 푸시
설명: 시청 이탈 초기 단계. 콘텐츠 리텐션 전략

카드 3 (노란 테두리 #FBBF24):
조건 아이콘: 💳
조건: IF  payment_fail = 1
액션: →  결제 수단 업데이트 인앱 알림
설명: 비자발적 이탈 방지. 결제 흐름 복구 유도

카드 디자인:
- 다크 배경 (#1e1e2e), 컬러 좌측 테두리 4px
- 조건부 텍스트: 흰색 bold
- 액션 텍스트: 포인트 컬러
- 설명 텍스트: 회색 (#9ca3af) 소문자

카드 하단에 회색 텍스트:
"* 규칙은 모델 점수와 행동 데이터를 복합 적용합니다"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[레이아웃 배치 가이드]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
상단: 기존 KPI 카드 3개 (유지)
중단 좌: Churn Score Distribution 히스토그램 (신규)
중단 우: Feature Importance 수평 막대 (신규)
하단 좌: 기존 Risk Band 분포 차트 (유지)
하단 중: Rule-based Intervention 카드 3개 (신규)
하단 우: High Risk 유저 리스트 테이블 (기존 + last_active_days, payment_fail 컬럼 추가)

전체 그리드: 12컬럼 기준
히스토그램: 7컬럼 / Feature Importance: 5컬럼
인터벤션 카드: 4컬럼 / 유저 테이블: 8컬럼

디자인 기준:
- 배경: #0f0f1a (최외곽) / 카드: #1a1a2e
- 포인트: #FF153C (TVING RED)
- 텍스트: #ffffff (기본) / #9ca3af (보조)
- 카드 radius: 12px / padding: 20px