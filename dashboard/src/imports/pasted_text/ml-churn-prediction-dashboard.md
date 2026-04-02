TVING 스타일의 **ML 기반 이탈 예측 분석 대시보드**를 디자인해주세요.

목표는 기존의 정적인 설명형 대시보드를 **데이터 분석가가 직접 탐색할 수 있는 인터랙티브 분석 대시보드**로 개선하는 것입니다.

다크 테마 기반 디자인을 사용하고 포인트 컬러는 **TVING Red (#FF153C)** 를 사용합니다.

━━━━━━━━━━━━━━━━━━━━━━━━

1. 글로벌 필터 바 (상단)
   ━━━━━━━━━━━━━━━━━━━━━━━━

대시보드 상단에 분석가가 사용할 **Global Filter Bar**를 추가합니다.

필터 항목

기간 선택 (Date Range)

* 최근 7일
* 최근 14일
* 최근 28일
* 사용자 지정 기간

디바이스

* Mobile
* TV
* PC

사용자 세그먼트

* Heavy User
* Regular User
* Low Activity

Risk Band

* All
* High Risk
* Mid Risk
* Low Risk

필터는 드롭다운 형태로 디자인합니다.

━━━━━━━━━━━━━━━━━━━━━━━━
2. 모델 파이프라인 설명 영역
━━━━━━━━━━━━━━━━━━━━━━━━

페이지 상단에 작은 모델 흐름 설명을 추가합니다.

[Churn Score 계산] → [Risk Band 분류] → [KPI 산출] → [개입 대상 선정]

아래 작은 회색 텍스트:

"XGBoost 기반 churn 예측 모델 | 매일 00시 업데이트"

━━━━━━━━━━━━━━━━━━━━━━━━
3. 샘플 데이터 구조
━━━━━━━━━━━━━━━━━━━━━━━━

50명의 사용자 샘플 데이터를 기반으로 대시보드를 구성합니다.

컬럼 구조

user_id
date
churn_score (0~1 float)
risk_band
watch_time (분)
search_count
recommend_click
device
segment

risk_band 계산 규칙

churn_score ≥ 0.7 → High Risk (약 30%)
churn_score ≥ 0.4 → Mid Risk (약 40%)
churn_score < 0.4 → Low Risk (약 30%)

━━━━━━━━━━━━━━━━━━━━━━━━
4. KPI 카드
━━━━━━━━━━━━━━━━━━━━━━━━

3개의 KPI 카드를 생성합니다.

① Predicted Churn Users

정의
churn_score ≥ 0.7 사용자 수

색상
#FF3B3B

부제
"ML 모델 예측 기준 (churn_score ≥ 0.7)"

② High Risk Users

정의
High Risk 사용자 수

색상
#FF6B35

부제
"전주 대비 +12.3%"

③ Predicted Churn Rate

정의
(High Risk Users / 전체 사용자) × 100

색상
#FF153C

부제
"예측 이탈률 (신뢰구간 ±2.1%)"

━━━━━━━━━━━━━━━━━━━━━━━━
5. Risk Band 분포 차트
━━━━━━━━━━━━━━━━━━━━━━━━

차트 2개 생성

① 가로 스택 바 차트

제목
ML 모델 Risk Band 분포

구간 색상

Low Risk → 초록 (#22C55E)
Mid Risk → 노랑 (#F59E0B)
High Risk → 빨강 (#EF4444)

각 구간에
유저 수 + 비율 표시

② 도넛 차트

Risk Band 별 사용자 비율 시각화

도넛 중앙

"전체 예측 대상 사용자 수"

범례는 오른쪽에 배치

━━━━━━━━━━━━━━━━━━━━━━━━
6. Churn Score 분포 차트
━━━━━━━━━━━━━━━━━━━━━━━━

히스토그램 차트를 추가합니다.

X축
churn score (0~1)

Y축
사용자 수

0.7 위치에 세로선 추가

라벨
High Risk Threshold

━━━━━━━━━━━━━━━━━━━━━━━━
7. Feature Importance 차트
━━━━━━━━━━━━━━━━━━━━━━━━

모델이 이탈을 예측할 때 중요한 변수 차트

제목

Churn Prediction 주요 영향 변수

차트 유형

가로 막대 그래프

예시 변수

시청 시간 감소
접속 빈도 감소
추천 클릭 감소
검색 후 재생 없음
결제 실패 신호

━━━━━━━━━━━━━━━━━━━━━━━━
8. High Risk 사용자 리스트
━━━━━━━━━━━━━━━━━━━━━━━━

High Risk 사용자 상위 10명을 표시하는 테이블

컬럼

user_id
churn_score
risk_band
watch_time
마지막 접속
추천 액션

디자인 규칙

risk_band
색상 뱃지로 표시

High Risk → 빨강
Mid Risk → 주황
Low Risk → 초록

churn_score
프로그레스 바 형태로 시각화

━━━━━━━━━━━━━━━━━━━━━━━━
9. 드릴다운 탐색 UX
━━━━━━━━━━━━━━━━━━━━━━━━

차트를 클릭하면 상세 화면으로 이동하도록 설계합니다.

예시

High Risk 차트 클릭
→ High Risk 사용자 상세 리스트

Device 차트 클릭
→ 디바이스별 사용자 행동 분석

Segment 차트 클릭
→ 세그먼트 비교 화면

━━━━━━━━━━━━━━━━━━━━━━━━
10. 분석가 탐색 흐름
━━━━━━━━━━━━━━━━━━━━━━━━

대시보드는 아래 순서로 분석 흐름을 구성합니다.

서비스 상태 확인
→ Churn 예측 결과 확인
→ Risk 분포 분석
→ Risk 원인 분석
→ 개입 대상 사용자 선정

이 대시보드는 **단순 리포트 화면이 아니라 데이터 분석가가 탐색하는 분석 워크플로우 형태로 설계합니다.**

━━━━━━━━━━━━━━━━━━━━━━━━

디자인 스타일

다크 테마
스트리밍 서비스 분석 대시보드
현대적인 데이터 시각화
TVING Red (#FF153C) 포인트 컬러

실제 데이터 분석팀에서 사용하는 **Product Analytics Dashboard 스타일**로 디자인합니다.
