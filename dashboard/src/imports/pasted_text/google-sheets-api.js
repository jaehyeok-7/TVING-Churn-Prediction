기존 대시보드 코드는 건드리지 말고,
데이터 소스만 구글 시트 API로 교체해줘.
새로 만들지 말고 기존 것에 연결만 해줘.

━━━━━━━━━━━━━━━━━━━━━━━
[API 설정]
━━━━━━━━━━━━━━━━━━━━━━━
const SHEET_ID = '1s_udHsl8fLFqi8Ne-KvhgX34fGqe3IuJPpJ3u7zBQdI';
const API_KEY  = 'AIzaSyAweUWfFV4fItEC2hvxrAqEjJt_ijFU3cY';
const API_URL  = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

━━━━━━━━━━━━━━━━━━━━━━━
[데이터 fetch 함수]
━━━━━━━━━━━━━━━━━━━━━━━
async function fetchSheetData() {
  try {
    setStatus('loading');
    const res  = await fetch(API_URL);
    const json = await res.json();
    const headers = json.values[0];
    const rows    = json.values.slice(1);
    const data = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = isNaN(row[i]) ? row[i] : Number(row[i]);
      });
      // 9999 = 미접속 처리
      if (obj.days_since_last_watch >= 9999)
        obj.days_since_last_watch = null;
      return obj;
    });
    updateDashboard(data);
    setStatus('success', data.length);
  } catch (err) {
    setStatus('error');
  }
}

// 페이지 로드 시 즉시 실행
fetchSheetData();

// 5분마다 자동 갱신
setInterval(fetchSheetData, 5 * 60 * 1000);

━━━━━━━━━━━━━━━━━━━━━━━
[컬럼 매핑 - 실제 CSV 기준]
━━━━━━━━━━━━━━━━━━━━━━━
churn_probability_pct (0~100) → churn_score 대체 (스케일 변환 불필요)
Risk_Band (High/Mid/Low)      → risk_band (재계산 불필요, 그대로 사용)
watch_hours                   → watch_time
days_since_last_watch         → last_active_days (9999 → null → "미접속")
content_diversity_score       → 신규 컬럼 추가
completion_rate               → 신규 컬럼 추가
search_engagement             → 신규 컬럼 추가
freq_smartphone               → 신규 컬럼 추가
freq_tv_set                   → 신규 컬럼 추가
payment_fail 컬럼 없음        → 관련 UI 제거

━━━━━━━━━━━━━━━━━━━━━━━
[KPI 계산 로직]
━━━━━━━━━━━━━━━━━━━━━━━
function updateDashboard(data) {
  const total     = data.length;                                    // 7,799
  const high      = data.filter(r => r.Risk_Band === 'High');      // 2,730
  const mid       = data.filter(r => r.Risk_Band === 'Mid');       // 1,013
  const low       = data.filter(r => r.Risk_Band === 'Low');       // 4,056
  const predicted = Math.round(high.length * 0.85);               // 2,320
  const churnRate = (predicted / total * 100).toFixed(1);         // 29.7%

  // KPI 카드 1: High Risk Users
  // 표시값: high.length명 | 부제: "churn_probability_pct ≥ 70 기준"
  // 색: #EF4444 | 전체 대비: (high.length/total*100).toFixed(1)%

  // KPI 카드 2: Predicted Churn Users
  // 표시값: predicted명 | 부제: "30일 내 이탈 예측 (±2.1%)"
  // 색: #FF153C

  // KPI 카드 3: Predicted Churn Rate
  // 표시값: churnRate% | 색: #FF153C
}

━━━━━━━━━━━━━━━━━━━━━━━
[히스토그램 실제 분포]
━━━━━━━━━━━━━━━━━━━━━━━
const histogramData = [
  {range:"0~10%",   count:0,    color:"#22C55E"},
  {range:"10~20%",  count:1,    color:"#22C55E"},
  {range:"20~30%",  count:2,    color:"#22C55E"},
  {range:"30~40%",  count:1,    color:"#22C55E"},
  {range:"40~50%",  count:49,   color:"#F59E0B"},
  {range:"50~60%",  count:889,  color:"#F59E0B"},
  {range:"60~70%",  count:2659, color:"#F59E0B"},
  {range:"70~80%",  count:2099, color:"#EF4444"},
  {range:"80~90%",  count:477,  color:"#EF4444"},
  {range:"90~100%", count:1622, color:"#EF4444"}
];
// X축: 0~100% | 70% 위치 수직 점선 + "High Risk Threshold (70%)" 라벨

━━━━━━━━━━━━━━━━━━━━━━━
[Top 10 High Risk 유저 테이블]
━━━━━━━━━━━━━━━━━━━━━━━
const top10 = [
  {id:"user_01241",score:99.84,watch:0,days:"미접속",comp:0.214,search:4},
  {id:"user_00069",score:99.84,watch:0,days:"미접속",comp:0.000,search:3},
  {id:"user_05536",score:99.84,watch:0,days:"미접속",comp:0.125,search:7},
  {id:"user_00052",score:99.84,watch:0,days:"미접속",comp:0.222,search:1},
  {id:"user_05537",score:99.84,watch:0,days:"미접속",comp:0.125,search:0},
  {id:"user_06182",score:99.84,watch:0,days:"미접속",comp:0.167,search:1},
  {id:"user_00056",score:99.84,watch:0,days:"미접속",comp:0.167,search:2},
  {id:"user_06781",score:99.84,watch:0,days:"미접속",comp:0.091,search:0},
  {id:"user_03975",score:99.84,watch:0,days:"미접속",comp:0.286,search:1},
  {id:"user_06774",score:99.84,watch:0,days:"미접속",comp:0.267,search:3}
];
// 컬럼: user_id | churn_probability_pct(프로그레스바)
//       | Risk_Band(색 배지) | watch_hours
//       | days_since_last_watch | completion_rate | search_engagement

━━━━━━━━━━━━━━━━━━━━━━━
[상태 배지 - 상단 네비바]
━━━━━━━━━━━━━━━━━━━━━━━
function setStatus(state, count) {
  // loading → 🟡 데이터 불러오는 중...
  // success → 🟢 실데이터 연결됨 | 7,799명 | 2025-12-10 기준
  // error   → 🔴 연결 오류 — 시트 공유 설정 확인
}

━━━━━━━━━━━━━━━━━━━━━━━
[디자인 유지]
━━━━━━━━━━━━━━━━━━━━━━━
기존 TVING 다크 테마 그대로 유지
배경 #0f0f1a | 카드 #1a1a2e | 포인트 #FF153C
High #EF4444 | Mid #F59E0B | Low #22C55E