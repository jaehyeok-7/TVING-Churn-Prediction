TVING Churn Analysis Dashboard
인터랙션(클릭) 구현 정리

본 대시보드는 정적인 리포트가 아니라 데이터 분석가가 탐색할 수 있는 분석 대시보드 UX로 설계한다.
따라서 주요 UI 요소에 클릭 기반 탐색 인터랙션을 추가한다.

대시보드 인터랙션은 크게 4가지 영역으로 구성한다.

1. 기간 필터 인터랙션
2. 날짜 선택 인터랙션
3. 분석 흐름 네비게이션
4. 차트 드릴다운 인터랙션
1️⃣ 기간 필터 인터랙션
목적

분석가가 기간별 데이터 변화를 탐색할 수 있도록 하는 필터

클릭 요소
7D
30D
90D
6M
동작

각 버튼 클릭 시 해당 기간 기준 데이터로 대시보드 상태 변경

예시

7D 클릭 → 최근 7일 데이터
30D 클릭 → 최근 30일 데이터
90D 클릭 → 최근 90일 데이터
6M 클릭 → 최근 6개월 데이터
피그마 구현

생성 프레임

Dashboard_7D
Dashboard_30D
Dashboard_90D
Dashboard_6M
Prototype 연결
7D → Dashboard_7D
30D → Dashboard_30D
90D → Dashboard_90D
6M → Dashboard_6M
2️⃣ 날짜 선택 인터랙션
목적

사용자가 직접 날짜 범위를 지정할 수 있는 분석 필터

클릭 요소
2025.01.01 ~ 2025.01.31

(상단 Date Range 영역)

동작

날짜 영역 클릭 시 Calendar UI 열림

Date Range 클릭 → Calendar UI 표시
날짜 선택 → Custom 기간 데이터 적용
피그마 구현

생성 프레임

Calendar_Open
Dashboard_CustomDate
Prototype 연결
Date Range 클릭 → Calendar_Open
날짜 선택 → Dashboard_CustomDate
3️⃣ 분석 흐름 네비게이션 (탐색 메뉴)
목적

데이터 분석 프로세스를 따라 페이지 탐색 가능하도록 구성

클릭 요소
데이터 수집
패턴 분석
이탈 예측
세그먼트 분류
개입 전략
동작

각 단계 클릭 시 해당 분석 페이지 이동

이동 구조
데이터 수집 → Data Overview 페이지
패턴 분석 → Behavior Analysis 페이지
이탈 예측 → Churn Prediction 페이지
세그먼트 분류 → Segment Analysis 페이지
개입 전략 → Intervention 페이지
피그마 구현

생성 프레임

Data_Overview
Behavior_Analysis
Churn_Prediction
Segment_Analysis
Intervention
Prototype 연결
데이터 수집 → Data_Overview
패턴 분석 → Behavior_Analysis
이탈 예측 → Churn_Prediction
세그먼트 분류 → Segment_Analysis
개입 전략 → Intervention
4️⃣ 차트 드릴다운 인터랙션
목적

차트에서 세부 분석 화면으로 이동하는 탐색 UX

4.1 Risk Band 차트
클릭 요소
High Risk
Mid Risk
Low Risk
동작

해당 Risk 사용자 상세 분석 페이지 이동

High Risk → High Risk 사용자 리스트
Mid Risk → Mid Risk 사용자 리스트
Low Risk → Low Risk 사용자 리스트
생성 프레임
HighRisk_User_List
MidRisk_User_List
LowRisk_User_List
4.2 Device 차트
클릭 요소
Mobile
TV
PC
동작

해당 디바이스 사용자 행동 분석 페이지 이동

생성 프레임
Device_Analysis_Mobile
Device_Analysis_TV
Device_Analysis_PC
4.3 Segment 차트
클릭 요소
Heavy User
Regular User
Low Activity
동작

세그먼트별 행동 패턴 분석 페이지 이동

생성 프레임
Segment_Heavy
Segment_Regular
Segment_Low
5️⃣ 전체 프레임 구조
Dashboard
Dashboard_7D
Dashboard_30D
Dashboard_90D
Dashboard_6M
Dashboard_CustomDate
Analysis
Data_Overview
Behavior_Analysis
Churn_Prediction
Segment_Analysis
Intervention
Drilldown
HighRisk_User_List
MidRisk_User_List
LowRisk_User_List

Device_Analysis_Mobile
Device_Analysis_TV
Device_Analysis_PC

Segment_Heavy
Segment_Regular
Segment_Low
총 프레임 수
약 15 ~ 18개

(피그마 인터랙션 구현 기준)

최종 UX 흐름
기간 선택
↓
서비스 상태 확인
↓
사용자 행동 패턴 분석
↓
ML 기반 이탈 예측
↓
세그먼트 분석
↓
개입 대상 사용자 확인
↓
개입 전략 실행