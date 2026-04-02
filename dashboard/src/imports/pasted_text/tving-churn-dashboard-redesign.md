기존 TVING Churn Analysis Dashboard를 **인터랙션 기반 분석 대시보드로 수정해주세요.**

현재 문제:
상단 기간 필터(7D / 30D / 90D / 6M)가 UI로만 존재하고 KPI 및 차트 데이터와 연결되지 않음.

다음 인터랙션 구조로 대시보드를 재설계합니다.

━━━━━━━━━━━━━━━━━━━━━━━━

1. 기간 필터 인터랙션
   ━━━━━━━━━━━━━━━━━━━━━━━━

대시보드 Header에 기간 필터 버튼을 유지합니다.

7D
30D
90D
6M

각 버튼은 클릭 시 Dashboard 상태를 변경하는 구조로 설계합니다.

피그마에서는 상태 기반 구조 대신 프레임 기반으로 구현합니다.

생성할 프레임

Dashboard_7D
Dashboard_30D
Dashboard_90D
Dashboard_6M

각 프레임에서 다음 데이터가 달라집니다.

KPI 수치
Predicted Churn Rate
Risk Band 분포
High Risk 사용자 수

선택된 기간 버튼은 TVING Red (#FF153C)로 강조 표시합니다.

━━━━━━━━━━━━━━━━━━━━━━━━
2. 날짜 선택 인터랙션
━━━━━━━━━━━━━━━━━━━━━━━━

Header의 날짜 범위 영역을 클릭 가능한 UI로 수정합니다.

예

2025.01.01 ~ 2025.01.31

클릭 시 Calendar Popover가 열립니다.

Calendar UI에서 시작일과 종료일을 선택할 수 있습니다.

프레임

Calendar_Open
Dashboard_Custom

Custom 기간 선택 시 Dashboard_Custom 프레임으로 이동합니다.

━━━━━━━━━━━━━━━━━━━━━━━━
3. 분석 흐름 네비게이션
━━━━━━━━━━━━━━━━━━━━━━━━

상단 분석 흐름 UI를 클릭 가능한 네비게이션으로 변경합니다.

데이터 수집
패턴 분석
이탈 예측
세그먼트 분류
개입 전략

각 버튼 클릭 시 해당 분석 페이지로 이동합니다.

페이지 구조

Data_Overview
Behavior_Analysis
Churn_Prediction
Segment_Analysis
Intervention

현재 위치 페이지는 Red 강조 표시합니다.

━━━━━━━━━━━━━━━━━━━━━━━━
4. 차트 드릴다운 인터랙션
━━━━━━━━━━━━━━━━━━━━━━━━

대시보드 차트는 드릴다운 탐색이 가능해야 합니다.

Risk Band 클릭
→ Risk Drilldown 페이지

Device 차트 클릭
→ Device Analysis 페이지

Segment 차트 클릭
→ Segment Analysis 페이지

드릴다운 페이지에는 다음 요소를 포함합니다.

그룹 KPI
행동 분석 차트
사용자 리스트 테이블
Breadcrumb navigation
탭 전환

━━━━━━━━━━━━━━━━━━━━━━━━
5. 분석가 탐색 UX

대시보드는 다음 분석 흐름을 따릅니다.

서비스 상태 확인
→ 사용자 행동 분석
→ ML 기반 이탈 예측
→ 세그먼트 분석
→ 개입 전략

이 대시보드는 단순 리포트가 아니라 **데이터 분석가가 탐색할 수 있는 Product Analytics Dashboard 형태로 설계합니다.**
