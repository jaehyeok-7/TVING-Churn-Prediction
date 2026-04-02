export type User = {
  user_id: string;
  date: string;
  churn_score: number;
  churn_probability_pct: number;
  risk_band: "High Risk" | "Mid Risk" | "Low Risk";
  watch_time: number;
  search_count: number;
  recommend_click: number;
  device: "Mobile" | "TV" | "Web" | "Tablet";
  segment: string;
  last_active_days: number | null;
  completion_rate: number;
  search_engagement: number;

  // 실데이터 확장 필드: 없어도 되도록 optional 처리
  content_diversity_score?: number;
  freq_smartphone?: number;
  freq_tv_set?: number;
  freq_tablet?: number;
  freq_pc?: number;
  segment_volume?: string;
  segment_explore?: string;
  segment_taste?: string;
  persona_type?: string;
  watch_hours?: number;
  watch_minutes?: number;
};

export const ALL_USERS: User[] = [
  // ── High Risk (15) ──
  { user_id:"USR-2841", date:"2025-03-01", churn_probability_pct:95, churn_score:0.95, risk_band:"High Risk", watch_time:12,  search_count:1,  recommend_click:0,  device:"Mobile",  segment:"Low Activity",  last_active_days:45, completion_rate:0.18, search_engagement:1 },
  { user_id:"USR-7103", date:"2025-03-02", churn_probability_pct:92, churn_score:0.92, risk_band:"High Risk", watch_time:8,   search_count:0,  recommend_click:0,  device:"Web",     segment:"Low Activity",  last_active_days:52, completion_rate:0.10, search_engagement:0 },
  { user_id:"USR-4892", date:"2025-03-01", churn_probability_pct:91, churn_score:0.91, risk_band:"High Risk", watch_time:5,   search_count:2,  recommend_click:1,  device:"TV",      segment:"Low Activity",  last_active_days:38, completion_rate:0.21, search_engagement:2 },
  { user_id:"USR-1529", date:"2025-03-03", churn_probability_pct:89, churn_score:0.89, risk_band:"High Risk", watch_time:18,  search_count:1,  recommend_click:0,  device:"Mobile",  segment:"Low Activity",  last_active_days:41, completion_rate:0.15, search_engagement:1 },
  { user_id:"USR-6741", date:"2025-03-02", churn_probability_pct:87, churn_score:0.87, risk_band:"High Risk", watch_time:9,   search_count:3,  recommend_click:0,  device:"Tablet",  segment:"Low Activity",  last_active_days:33, completion_rate:0.22, search_engagement:3 },
  { user_id:"USR-3308", date:"2025-03-04", churn_probability_pct:85, churn_score:0.85, risk_band:"High Risk", watch_time:14,  search_count:0,  recommend_click:0,  device:"Mobile",  segment:"Low Activity",  last_active_days:55, completion_rate:0.08, search_engagement:0 },
  { user_id:"USR-9012", date:"2025-03-01", churn_probability_pct:83, churn_score:0.83, risk_band:"High Risk", watch_time:22,  search_count:2,  recommend_click:1,  device:"Web",     segment:"Low Activity",  last_active_days:29, completion_rate:0.30, search_engagement:2 },
  { user_id:"USR-5847", date:"2025-03-03", churn_probability_pct:81, churn_score:0.81, risk_band:"High Risk", watch_time:6,   search_count:1,  recommend_click:0,  device:"TV",      segment:"Low Activity",  last_active_days:47, completion_rate:0.12, search_engagement:1 },
  { user_id:"USR-2103", date:"2025-03-02", churn_probability_pct:79, churn_score:0.79, risk_band:"High Risk", watch_time:31,  search_count:4,  recommend_click:2,  device:"Mobile",  segment:"Low Activity",  last_active_days:36, completion_rate:0.35, search_engagement:4 },
  { user_id:"USR-8834", date:"2025-03-05", churn_probability_pct:78, churn_score:0.78, risk_band:"High Risk", watch_time:11,  search_count:1,  recommend_click:0,  device:"Web",     segment:"Low Activity",  last_active_days:60, completion_rate:0.11, search_engagement:1 },
  { user_id:"USR-3412", date:"2025-03-04", churn_probability_pct:76, churn_score:0.76, risk_band:"High Risk", watch_time:19,  search_count:2,  recommend_click:1,  device:"Tablet",  segment:"Low Activity",  last_active_days:25, completion_rate:0.28, search_engagement:2 },
  { user_id:"USR-7789", date:"2025-03-03", churn_probability_pct:75, churn_score:0.75, risk_band:"High Risk", watch_time:7,   search_count:0,  recommend_click:0,  device:"Mobile",  segment:"Low Activity",  last_active_days:43, completion_rate:0.09, search_engagement:0 },
  { user_id:"USR-1166", date:"2025-03-02", churn_probability_pct:73, churn_score:0.73, risk_band:"High Risk", watch_time:25,  search_count:3,  recommend_click:1,  device:"TV",      segment:"Low Activity",  last_active_days:20, completion_rate:0.40, search_engagement:3 },
  { user_id:"USR-6203", date:"2025-03-05", churn_probability_pct:72, churn_score:0.72, risk_band:"High Risk", watch_time:16,  search_count:1,  recommend_click:0,  device:"Web",     segment:"Low Activity",  last_active_days:34, completion_rate:0.20, search_engagement:1 },
  { user_id:"USR-4455", date:"2025-03-01", churn_probability_pct:71, churn_score:0.71, risk_band:"High Risk", watch_time:10,  search_count:2,  recommend_click:0,  device:"Mobile",  segment:"Low Activity",  last_active_days:28, completion_rate:0.16, search_engagement:2 },

  // ── Mid Risk (20) ──
  { user_id:"USR-5531", date:"2025-03-06", churn_probability_pct:68, churn_score:0.68, risk_band:"Mid Risk",  watch_time:55,  search_count:5,  recommend_click:3,  device:"Mobile",  segment:"Regular User",  last_active_days:12, completion_rate:0.52, search_engagement:5 },
  { user_id:"USR-2290", date:"2025-03-07", churn_probability_pct:65, churn_score:0.65, risk_band:"Mid Risk",  watch_time:72,  search_count:7,  recommend_click:4,  device:"TV",      segment:"Regular User",  last_active_days:10, completion_rate:0.61, search_engagement:7 },
  { user_id:"USR-9341", date:"2025-03-06", churn_probability_pct:63, churn_score:0.63, risk_band:"Mid Risk",  watch_time:48,  search_count:4,  recommend_click:2,  device:"Web",     segment:"Regular User",  last_active_days:15, completion_rate:0.48, search_engagement:4 },
  { user_id:"USR-1877", date:"2025-03-08", churn_probability_pct:61, churn_score:0.61, risk_band:"Mid Risk",  watch_time:61,  search_count:6,  recommend_click:5,  device:"Tablet",  segment:"Regular User",  last_active_days:9,  completion_rate:0.55, search_engagement:6 },
  { user_id:"USR-7425", date:"2025-03-07", churn_probability_pct:59, churn_score:0.59, risk_band:"Mid Risk",  watch_time:80,  search_count:8,  recommend_click:3,  device:"Mobile",  segment:"Regular User",  last_active_days:11, completion_rate:0.63, search_engagement:8 },
  { user_id:"USR-3664", date:"2025-03-09", churn_probability_pct:58, churn_score:0.58, risk_band:"Mid Risk",  watch_time:44,  search_count:3,  recommend_click:2,  device:"TV",      segment:"Regular User",  last_active_days:14, completion_rate:0.45, search_engagement:3 },
  { user_id:"USR-8102", date:"2025-03-06", churn_probability_pct:56, churn_score:0.56, risk_band:"Mid Risk",  watch_time:93,  search_count:9,  recommend_click:6,  device:"Web",     segment:"Regular User",  last_active_days:8,  completion_rate:0.70, search_engagement:9 },
  { user_id:"USR-5019", date:"2025-03-10", churn_probability_pct:55, churn_score:0.55, risk_band:"Mid Risk",  watch_time:67,  search_count:6,  recommend_click:4,  device:"Mobile",  segment:"Regular User",  last_active_days:13, completion_rate:0.58, search_engagement:6 },
  { user_id:"USR-6638", date:"2025-03-08", churn_probability_pct:53, churn_score:0.53, risk_band:"Mid Risk",  watch_time:51,  search_count:5,  recommend_click:3,  device:"Tablet",  segment:"Regular User",  last_active_days:16, completion_rate:0.50, search_engagement:5 },
  { user_id:"USR-1345", date:"2025-03-07", churn_probability_pct:51, churn_score:0.51, risk_band:"Mid Risk",  watch_time:78,  search_count:7,  recommend_click:5,  device:"TV",      segment:"Regular User",  last_active_days:7,  completion_rate:0.66, search_engagement:7 },
  { user_id:"USR-4872", date:"2025-03-09", churn_probability_pct:50, churn_score:0.50, risk_band:"Mid Risk",  watch_time:42,  search_count:4,  recommend_click:2,  device:"Web",     segment:"Regular User",  last_active_days:18, completion_rate:0.44, search_engagement:4 },
  { user_id:"USR-7903", date:"2025-03-11", churn_probability_pct:48, churn_score:0.48, risk_band:"Mid Risk",  watch_time:88,  search_count:8,  recommend_click:7,  device:"Mobile",  segment:"Regular User",  last_active_days:6,  completion_rate:0.69, search_engagement:8 },
  { user_id:"USR-2254", date:"2025-03-10", churn_probability_pct:47, churn_score:0.47, risk_band:"Mid Risk",  watch_time:59,  search_count:5,  recommend_click:4,  device:"Tablet",  segment:"Regular User",  last_active_days:10, completion_rate:0.54, search_engagement:5 },
  { user_id:"USR-9587", date:"2025-03-08", churn_probability_pct:46, churn_score:0.46, risk_band:"Mid Risk",  watch_time:71,  search_count:6,  recommend_click:3,  device:"TV",      segment:"Regular User",  last_active_days:12, completion_rate:0.60, search_engagement:6 },
  { user_id:"USR-3129", date:"2025-03-12", churn_probability_pct:45, churn_score:0.45, risk_band:"Mid Risk",  watch_time:64,  search_count:7,  recommend_click:5,  device:"Web",     segment:"Regular User",  last_active_days:9,  completion_rate:0.56, search_engagement:7 },
  { user_id:"USR-6780", date:"2025-03-09", churn_probability_pct:44, churn_score:0.44, risk_band:"Mid Risk",  watch_time:50,  search_count:4,  recommend_click:2,  device:"Mobile",  segment:"Regular User",  last_active_days:11, completion_rate:0.49, search_engagement:4 },
  { user_id:"USR-1021", date:"2025-03-11", churn_probability_pct:43, churn_score:0.43, risk_band:"Mid Risk",  watch_time:86,  search_count:9,  recommend_click:6,  device:"TV",      segment:"Regular User",  last_active_days:8,  completion_rate:0.67, search_engagement:9 },
  { user_id:"USR-5563", date:"2025-03-10", churn_probability_pct:42, churn_score:0.42, risk_band:"Mid Risk",  watch_time:75,  search_count:6,  recommend_click:4,  device:"Tablet",  segment:"Regular User",  last_active_days:14, completion_rate:0.62, search_engagement:6 },
  { user_id:"USR-8346", date:"2025-03-12", churn_probability_pct:41, churn_score:0.41, risk_band:"Mid Risk",  watch_time:53,  search_count:5,  recommend_click:3,  device:"Web",     segment:"Regular User",  last_active_days:7,  completion_rate:0.51, search_engagement:5 },
  { user_id:"USR-2907", date:"2025-03-11", churn_probability_pct:40, churn_score:0.40, risk_band:"Mid Risk",  watch_time:69,  search_count:7,  recommend_click:5,  device:"Mobile",  segment:"Regular User",  last_active_days:10, completion_rate:0.59, search_engagement:7 },
  // ── Low Risk (15) ──
  { user_id:"USR-4411", date:"2025-03-13", churn_probability_pct:35, churn_score:0.35, risk_band:"Low Risk",  watch_time:142, search_count:12, recommend_click:9,  device:"TV",      segment:"Power User",    last_active_days:2,  completion_rate:0.82, search_engagement:12 },
  { user_id:"USR-7654", date:"2025-03-14", churn_probability_pct:31, churn_score:0.31, risk_band:"Low Risk",  watch_time:187, search_count:15, recommend_click:11, device:"Mobile",  segment:"Power User",    last_active_days:1,  completion_rate:0.88, search_engagement:15 },
  { user_id:"USR-3987", date:"2025-03-13", churn_probability_pct:28, churn_score:0.28, risk_band:"Low Risk",  watch_time:156, search_count:13, recommend_click:10, device:"Web",     segment:"Power User",    last_active_days:3,  completion_rate:0.85, search_engagement:13 },
  { user_id:"USR-9120", date:"2025-03-15", churn_probability_pct:25, churn_score:0.25, risk_band:"Low Risk",  watch_time:203, search_count:18, recommend_click:14, device:"Tablet",  segment:"Power User",    last_active_days:1,  completion_rate:0.91, search_engagement:18 },
  { user_id:"USR-5678", date:"2025-03-14", churn_probability_pct:22, churn_score:0.22, risk_band:"Low Risk",  watch_time:168, search_count:14, recommend_click:12, device:"TV",      segment:"Power User",    last_active_days:2,  completion_rate:0.87, search_engagement:14 },
  { user_id:"USR-1234", date:"2025-03-13", churn_probability_pct:20, churn_score:0.20, risk_band:"Low Risk",  watch_time:221, search_count:19, recommend_click:15, device:"Mobile",  segment:"Power User",    last_active_days:1,  completion_rate:0.93, search_engagement:19 },
  { user_id:"USR-6890", date:"2025-03-15", churn_probability_pct:18, churn_score:0.18, risk_band:"Low Risk",  watch_time:178, search_count:16, recommend_click:13, device:"Web",     segment:"Power User",    last_active_days:4,  completion_rate:0.89, search_engagement:16 },
  { user_id:"USR-2345", date:"2025-03-14", churn_probability_pct:15, churn_score:0.15, risk_band:"Low Risk",  watch_time:195, search_count:17, recommend_click:14, device:"Tablet",  segment:"Power User",    last_active_days:2,  completion_rate:0.90, search_engagement:17 },
  { user_id:"USR-7891", date:"2025-03-13", churn_probability_pct:13, churn_score:0.13, risk_band:"Low Risk",  watch_time:244, search_count:21, recommend_click:17, device:"TV",      segment:"Power User",    last_active_days:1,  completion_rate:0.94, search_engagement:21 },
  { user_id:"USR-3456", date:"2025-03-15", churn_probability_pct:11, churn_score:0.11, risk_band:"Low Risk",  watch_time:211, search_count:20, recommend_click:16, device:"Mobile",  segment:"Power User",    last_active_days:3,  completion_rate:0.92, search_engagement:20 },
  { user_id:"USR-8902", date:"2025-03-14", churn_probability_pct:9,  churn_score:0.09, risk_band:"Low Risk",  watch_time:189, search_count:15, recommend_click:12, device:"Web",     segment:"Power User",    last_active_days:2,  completion_rate:0.88, search_engagement:15 },
  { user_id:"USR-4567", date:"2025-03-15", churn_probability_pct:8,  churn_score:0.08, risk_band:"Low Risk",  watch_time:256, search_count:23, recommend_click:19, device:"Tablet",  segment:"Power User",    last_active_days:1,  completion_rate:0.95, search_engagement:23 },
  { user_id:"USR-9213", date:"2025-03-13", churn_probability_pct:6,  churn_score:0.06, risk_band:"Low Risk",  watch_time:231, search_count:22, recommend_click:18, device:"TV",      segment:"Power User",    last_active_days:2,  completion_rate:0.94, search_engagement:22 },
  { user_id:"USR-5124", date:"2025-03-15", churn_probability_pct:4,  churn_score:0.04, risk_band:"Low Risk",  watch_time:278, search_count:25, recommend_click:21, device:"Mobile",  segment:"Power User",    last_active_days:1,  completion_rate:0.96, search_engagement:25 },
  { user_id:"USR-1803", date:"2025-03-14", churn_probability_pct:2,  churn_score:0.02, risk_band:"Low Risk",  watch_time:302, search_count:28, recommend_click:24, device:"Web",     segment:"Power User",    last_active_days:1,  completion_rate:0.97, search_engagement:28 },
];

// --- 이 아래 부분부터 users.ts 파일 맨 끝에 추가해주세요 ---

export const riskColor = (rb: string) => {
  if (rb.includes("High")) return "#EF4444";
  if (rb.includes("Mid")) return "#F59E0B";
  return "#22C55E";
};

export const scoreColor = (score: number) => {
  if (score >= 0.7) return "#EF4444";
  if (score >= 0.4) return "#F59E0B";
  return "#22C55E";
};