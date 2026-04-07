import { createContext, useContext, useState, ReactNode } from "react";

export type Period = "7D" | "30D" | "90D" | "6M";

/* ──────────────────────────────────────────────────────────────────────
   KPI 데이터 (기간별)
────────────────────────────────────────────────────────────────────── */
export type KPIDataSet = {
  churnRate:        { value: string; delta: string; deltaDir: "up"|"down"; subText: string; sparkValues: number[] };
  riskUsers:        { value: string; delta: string; deltaDir: "up"|"down"; subText: string; sparkValues: number[] };
  avgSubDuration:   { value: string; delta: string; deltaDir: "up"|"down"; subText: string; sparkValues: number[] };
  interventionRate: { value: string; delta: string; deltaDir: "up"|"down"; subText: string; sparkValues: number[] };
};

/* ──────────────────────────────────────────────────────────────────────
   트렌드 차트 데이터 (기간별)
────────────────────────────────────────────────────────────────────── */
export type TrendPoint = { label: string; actual: number | null; predicted: number | null; target: number };

/* ──────────────────────────────────────────────────────────────────────
   Risk 분포 데이터 (기간별)
────────────────────────────────────────────────────────────────────── */
export type RiskBandData = { label: string; count: number; pct: number; color: string };

/* ──────────────────────────────────────────────────────────────────────
   ChurnRisk 페이지 KPI (기간별)
────────────────────────────────────────────────────────────────────── */
export type ChurnKPI = {
  predictedChurn: number;
  highRiskUsers:  number;
  churnRate:      string;
  churnRateDelta: string;
  highRiskDelta:  string;
};

/* ──────────────────────────────────────────────────────────────────────
   서비스 상태 페이지 데이터
────────────────────────────────────────────────────────────────────── */
export type ServiceKPIItem = { value: string; delta: string; deltaDir: "up"|"down" };
export type ServicePageData = {
  kpis:        ServiceKPIItem[]; // [activeUsers, avgSession, monthlyChurn, completionRate]
  trendPoints: { month: string; users: number }[];
  planSplit:   { name: string; pct: number }[];
};

/* ──────────────────────────────────────────────────────────────────────
   사용자 분석 페이지 데이터
────────────────────────────────────────────────────────────────────── */
export type UserAnalysisPageData = {
  segments: { pct: string; count: string }[]; // [heavy, regular, low]
  tableRows: { count: string; watchTime: string; completion: number }[]; // [heavy, regular, low]
};

/* ──────────────────────────────────────────────────────────────────────
   행동 패턴 페이지 데이터
────────────────────────────────────────────────────────────────────── */
export type HeatmapAnnotation = { label: string; value: string; color: string };

export type HeatmapProfile = {
  /** 금~일 20~23시 추가 강도 */
  weekendEveningBoost: number;
  /** 평일 21~23시 추가 강도 */
  weekdayNightBoost:   number;
  /** 오후(15~19h) 추가 강도 */
  afternoonBoost:      number;
  /** 새벽(2~6h) 감소량 */
  morningDip:          number;
  /** 전체 기본 강도 */
  baseLevel:           number;
  /** 히트맵 설명 서브텍스트 */
  subText:             string;
  /** 피크 타임 어노테이션 */
  annotations:         HeatmapAnnotation[];
};

export type BehaviorPageData = {
  categoryMins:   number[]; // [movie, sports, drama, docu, variety]
  sessionPcts:    number[]; // [~10, 10~30, 30~60, 60~120, 120+]
  heatmapProfile: HeatmapProfile;
};

/* ──────────────────────────────────────────────────────────────────────
   개입 전략 페이지 데이터
────────────────────────────────────────────────────────────────────── */
export type InterventionSummaryItem = { value: string; sub: string };
export type InterventionPageData = {
  summaryValues:   InterventionSummaryItem[]; // [campaigns, targetUsers, retention]
  strategyTargets: string[];                  // [고위험군, 중위험군, 예방군]
  simData:         { segment: string; before: number; after: number }[];
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 KPI 데이터셋
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_KPI: Record<Period, KPIDataSet> = {
  "7D": {
    churnRate:        { value: "0.8",   delta: "+0.1%p",   deltaDir: "up",   subText: "전일 0.7% 대비",             sparkValues: [0.64,0.68,0.70,0.72,0.74,0.73,0.76,0.77,0.78,0.80] },
    riskUsers:        { value: "2,341", delta: "+187",     deltaDir: "up",   subText: "전체 가입자의 1.5%",          sparkValues: [1900,2020,2080,2110,2180,2200,2250,2280,2310,2341] },
    avgSubDuration:   { value: "9.1",   delta: "-0.2개월", deltaDir: "down", subText: "이탈 위험군 기준",            sparkValues: [9.8,9.7,9.6,9.5,9.4,9.4,9.3,9.2,9.2,9.1] },
    interventionRate: { value: "71.2",  delta: "+1.8%p",   deltaDir: "up",   subText: "최근 7일 캠페인 기준",        sparkValues: [62,64,65,66,67,68,69,70,70,71.2] },
  },
  "30D": {
    churnRate:        { value: "4.2",    delta: "+0.8%p",    deltaDir: "up",   subText: "전월 3.4% 대비",             sparkValues: [3.1,2.9,3.2,3.0,3.4,3.6,3.4,3.8,4.0,3.7,4.1,4.2] },
    riskUsers:        { value: "12,847", delta: "+1,234",    deltaDir: "up",   subText: "전체 가입자의 8.3%",         sparkValues: [9200,9800,10100,10500,10200,11000,11400,11200,11800,12100,12500,12847] },
    avgSubDuration:   { value: "8.3",    delta: "-0.5개월",  deltaDir: "down", subText: "이탈 위험군 기준",           sparkValues: [9.8,9.6,9.4,9.2,9.1,9.0,8.9,8.7,8.7,8.6,8.5,8.3] },
    interventionRate: { value: "67.4",   delta: "+3.2%p",    deltaDir: "up",   subText: "캠페인 발송 후 30일",         sparkValues: [55,57,58,60,59,61,62,63,64,64,66,67.4] },
  },
  "90D": {
    churnRate:        { value: "5.1",    delta: "+1.7%p",    deltaDir: "up",   subText: "전분기 3.4% 대비",           sparkValues: [3.2,3.4,3.6,3.8,3.9,4.1,4.3,4.5,4.7,4.9,5.0,5.1] },
    riskUsers:        { value: "38,421", delta: "+4,812",    deltaDir: "up",   subText: "전체 가입자의 24.8%",        sparkValues: [28000,30100,31500,32800,33400,34700,35600,36200,37100,37800,38100,38421] },
    avgSubDuration:   { value: "7.8",    delta: "-1.0개월",  deltaDir: "down", subText: "이탈 위험군 기준",           sparkValues: [9.8,9.5,9.2,9.0,8.8,8.6,8.4,8.2,8.1,7.9,7.9,7.8] },
    interventionRate: { value: "64.8",   delta: "-0.4%p",    deltaDir: "down", subText: "캠페인 발송 후 90일",         sparkValues: [67,67,66,66,65,65,65,64,64,65,64,64.8] },
  },
  "6M": {
    churnRate:        { value: "4.8",    delta: "+1.4%p",    deltaDir: "up",   subText: "전반기 3.4% 대비",           sparkValues: [3.0,3.1,3.3,3.5,3.7,3.9,4.0,4.2,4.4,4.5,4.7,4.8] },
    riskUsers:        { value: "71,384", delta: "+9,203",    deltaDir: "up",   subText: "전체 가입자의 46.1%",        sparkValues: [48000,52000,55000,58000,60000,62000,64000,66000,68000,69500,70800,71384] },
    avgSubDuration:   { value: "9.2",    delta: "-0.6개월",  deltaDir: "down", subText: "이탈 위험군 기준",           sparkValues: [9.8,9.7,9.6,9.5,9.4,9.3,9.3,9.3,9.2,9.2,9.2,9.2] },
    interventionRate: { value: "62.1",   delta: "-5.3%p",    deltaDir: "down", subText: "캠페인 발송 후 180일",        sparkValues: [67,67,66,65,65,64,64,63,63,63,62,62.1] },
  },
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 트렌드 차트 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_TREND: Record<Period, TrendPoint[]> = {
  "7D": [
    { label: "3/9",  actual: 0.72, predicted: null,  target: 0.75 },
    { label: "3/10", actual: 0.74, predicted: null,  target: 0.75 },
    { label: "3/11", actual: 0.73, predicted: null,  target: 0.75 },
    { label: "3/12", actual: 0.76, predicted: null,  target: 0.75 },
    { label: "3/13", actual: 0.77, predicted: null,  target: 0.75 },
    { label: "3/14", actual: 0.78, predicted: null,  target: 0.75 },
    { label: "3/15", actual: 0.80, predicted: 0.80,  target: 0.75 },
    { label: "3/16", actual: null, predicted: 0.82,  target: 0.75 },
    { label: "3/17", actual: null, predicted: 0.85,  target: 0.75 },
    { label: "3/18", actual: null, predicted: 0.83,  target: 0.75 },
  ],
  "30D": [
    { label: "2/14",  actual: 3.8,  predicted: null,  target: 3.5 },
    { label: "2/21",  actual: 3.9,  predicted: null,  target: 3.5 },
    { label: "2/28",  actual: 4.0,  predicted: null,  target: 3.5 },
    { label: "3/7",   actual: 4.1,  predicted: null,  target: 3.5 },
    { label: "3/15",  actual: 4.2,  predicted: 4.2,   target: 3.5 },
    { label: "3/22",  actual: null, predicted: 4.5,   target: 3.5 },
    { label: "3/29",  actual: null, predicted: 4.8,   target: 3.5 },
    { label: "4/5",   actual: null, predicted: 4.4,   target: 3.5 },
  ],
  "90D": [
    { label: "12월", actual: 3.1,  predicted: null,  target: 3.5 },
    { label: "1월",  actual: 3.4,  predicted: null,  target: 3.5 },
    { label: "2월",  actual: 3.8,  predicted: null,  target: 3.5 },
    { label: "3월",  actual: 4.2,  predicted: 4.2,   target: 3.5 },
    { label: "4월",  actual: null, predicted: 4.5,   target: 3.5 },
    { label: "5월",  actual: null, predicted: 4.8,   target: 3.5 },
    { label: "6월",  actual: null, predicted: 4.4,   target: 3.5 },
  ],
  "6M": [
    { label: "9월",  actual: 3.1,  predicted: null,  target: 3.5 },
    { label: "10월", actual: 3.4,  predicted: null,  target: 3.5 },
    { label: "11월", actual: 3.0,  predicted: null,  target: 3.5 },
    { label: "12월", actual: 3.6,  predicted: null,  target: 3.5 },
    { label: "1월",  actual: 3.4,  predicted: null,  target: 3.5 },
    { label: "2월",  actual: 3.8,  predicted: null,  target: 3.5 },
    { label: "3월",  actual: 4.2,  predicted: 4.2,   target: 3.5 },
    { label: "4월",  actual: null, predicted: 4.5,   target: 3.5 },
    { label: "5월",  actual: null, predicted: 4.8,   target: 3.5 },
    { label: "6월",  actual: null, predicted: 4.4,   target: 3.5 },
  ],
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 Risk 분포 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_RISK: Record<Period, RiskBandData[]> = {
  "7D": [
    { label: "고위험", count: 702,    pct: 30.0, color: "#E30613" },
    { label: "중위험", count: 988,    pct: 42.2, color: "#FFB74D" },
    { label: "저위험", count: 651,    pct: 27.8, color: "#00D2A0" },
  ],
  "30D": [
    { label: "고위험", count: 3847,   pct: 29.9, color: "#E30613" },
    { label: "중위험", count: 5412,   pct: 42.1, color: "#FFB74D" },
    { label: "저위험", count: 3588,   pct: 27.9, color: "#00D2A0" },
  ],
  "90D": [
    { label: "고위험", count: 11527,  pct: 30.0, color: "#E30613" },
    { label: "중위험", count: 16261,  pct: 42.3, color: "#FFB74D" },
    { label: "저위험", count: 10633,  pct: 27.7, color: "#00D2A0" },
  ],
  "6M": [
    { label: "고위험", count: 21415,  pct: 30.0, color: "#E30613" },
    { label: "중위험", count: 30083,  pct: 42.1, color: "#FFB74D" },
    { label: "저위험", count: 19886,  pct: 27.9, color: "#00D2A0" },
  ],
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 ChurnRisk 페이지 KPI
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_CHURN_KPI: Record<Period, ChurnKPI> = {
  "7D":  { predictedChurn: 702,   highRiskUsers: 702,   churnRate: "30.0", churnRateDelta: "+1.2%", highRiskDelta: "+57명" },
  "30D": { predictedChurn: 3847,  highRiskUsers: 3847,  churnRate: "29.9", churnRateDelta: "+2.3%", highRiskDelta: "+312명" },
  "90D": { predictedChurn: 11527, highRiskUsers: 11527, churnRate: "30.0", churnRateDelta: "+3.1%", highRiskDelta: "+1,204명" },
  "6M":  { predictedChurn: 21415, highRiskUsers: 21415, churnRate: "30.0", churnRateDelta: "+4.8%", highRiskDelta: "+2,847명" },
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 서비스 상태 페이지 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_SERVICE: Record<Period, ServicePageData> = {
  "7D": {
    kpis: [
      { value: "38,420", delta: "+1.2%",  deltaDir: "up"   },
      { value: "45:18",  delta: "+2.3%",  deltaDir: "up"   },
      { value: "18.2",   delta: "-0.8%p", deltaDir: "down" },
      { value: "66.7",   delta: "+0.9%p", deltaDir: "up"   },
    ],
    trendPoints: [
      { month: "3/9",  users: 36800 }, { month: "3/10", users: 37200 },
      { month: "3/11", users: 37500 }, { month: "3/12", users: 38100 },
      { month: "3/13", users: 37800 }, { month: "3/14", users: 38200 },
      { month: "3/15", users: 38420 },
    ],
    planSplit: [{ name: "프리미엄", pct: 47 }, { name: "스탠다드", pct: 33 }, { name: "베이직", pct: 20 }],
  },
  "30D": {
    kpis: [
      { value: "42,850", delta: "+3.2%",  deltaDir: "up"   },
      { value: "47:32",  delta: "+5.1%",  deltaDir: "up"   },
      { value: "19.6",   delta: "-2.1%p", deltaDir: "down" },
      { value: "68.3",   delta: "+1.8%p", deltaDir: "up"   },
    ],
    trendPoints: [
      { month: "2/2주", users: 37800 }, { month: "2/3주", users: 39100 },
      { month: "3월",   users: 40500 }, { month: "3/2주", users: 41200 },
      { month: "3/3주", users: 42000 }, { month: "3/4주", users: 42850 },
    ],
    planSplit: [{ name: "프리미엄", pct: 45 }, { name: "스탠다드", pct: 35 }, { name: "베이직", pct: 20 }],
  },
  "90D": {
    kpis: [
      { value: "45,120", delta: "+8.4%",  deltaDir: "up" },
      { value: "49:45",  delta: "+7.8%",  deltaDir: "up" },
      { value: "22.4",   delta: "+1.7%p", deltaDir: "up" },
      { value: "71.2",   delta: "+4.1%p", deltaDir: "up" },
    ],
    trendPoints: [
      { month: "12월", users: 38200 }, { month: "1월",  users: 40500 },
      { month: "2월",  users: 42850 }, { month: "3월",  users: 45120 },
    ],
    planSplit: [{ name: "프리미엄", pct: 42 }, { name: "스탠다드", pct: 37 }, { name: "베이직", pct: 21 }],
  },
  "6M": {
    kpis: [
      { value: "48,750", delta: "+15.2%", deltaDir: "up" },
      { value: "51:20",  delta: "+12.3%", deltaDir: "up" },
      { value: "21.8",   delta: "+2.4%p", deltaDir: "up" },
      { value: "73.5",   delta: "+6.8%p", deltaDir: "up" },
    ],
    trendPoints: [
      { month: "9월",  users: 35200 }, { month: "10월", users: 37800 },
      { month: "11월", users: 39100 }, { month: "12월", users: 41200 },
      { month: "1월",  users: 43800 }, { month: "2월",  users: 46200 },
      { month: "3월",  users: 48750 },
    ],
    planSplit: [{ name: "프리미엄", pct: 40 }, { name: "스탠다드", pct: 38 }, { name: "베이직", pct: 22 }],
  },
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 사용자 분석 페이지 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_USER_ANALYSIS: Record<Period, UserAnalysisPageData> = {
  "7D": {
    segments: [
      { pct: "24.8%", count: "9,527명"  },
      { pct: "47.5%", count: "18,243명" },
      { pct: "27.7%", count: "10,648명" },
    ],
    tableRows: [
      { count: "9,527",  watchTime: "96분", completion: 85 },
      { count: "18,243", watchTime: "42분", completion: 61 },
      { count: "10,648", watchTime: "14분", completion: 27 },
    ],
  },
  "30D": {
    segments: [
      { pct: "23.4%", count: "10,027명" },
      { pct: "48.2%", count: "20,654명" },
      { pct: "28.4%", count: "12,169명" },
    ],
    tableRows: [
      { count: "10,027", watchTime: "89분", completion: 82 },
      { count: "20,654", watchTime: "47분", completion: 65 },
      { count: "12,169", watchTime: "18분", completion: 31 },
    ],
  },
  "90D": {
    segments: [
      { pct: "21.8%", count: "9,836명"  },
      { pct: "46.9%", count: "21,182명" },
      { pct: "31.3%", count: "14,132명" },
    ],
    tableRows: [
      { count: "9,836",  watchTime: "82분", completion: 78 },
      { count: "21,182", watchTime: "52분", completion: 68 },
      { count: "14,132", watchTime: "23분", completion: 38 },
    ],
  },
  "6M": {
    segments: [
      { pct: "20.5%", count: "9,994명"  },
      { pct: "45.7%", count: "22,279명" },
      { pct: "33.8%", count: "16,477명" },
    ],
    tableRows: [
      { count: "9,994",  watchTime: "76분", completion: 74 },
      { count: "22,279", watchTime: "55분", completion: 71 },
      { count: "16,477", watchTime: "28분", completion: 44 },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 행동 패턴 페이지 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_BEHAVIOR: Record<Period, BehaviorPageData> = {
  "7D": {
    categoryMins: [98,  82,  61, 48, 38],
    sessionPcts:  [25, 29, 27, 15, 4],
    heatmapProfile: {
      weekendEveningBoost: 34,
      weekdayNightBoost:   5,
      afternoonBoost:      8,
      morningDip:          18,
      baseLevel:           14,
      subText: "최근 7일 — 주말 저녁 시청 집중, 평일 패턴 상대적으로 약함",
      annotations: [
        { label: "🔥 피크 타임",  value: "금~일 20~23시",  color: "#E30613" },
        { label: "📺 준피크",    value: "평일 22~23시",  color: "#FFB74D" },
        { label: "🌙 가장 한산",  value: "평일 5~8시",   color: "#4A4A6A" },
        { label: "☀️ 점심 피크", value: "평일 12~14시", color: "#6C63FF" },
      ],
    },
  },
  "30D": {
    categoryMins: [112, 89,  68, 55, 43],
    sessionPcts:  [22, 31, 28, 14, 5],
    heatmapProfile: {
      weekendEveningBoost: 26,
      weekdayNightBoost:   18,
      afternoonBoost:      11,
      morningDip:          15,
      baseLevel:           20,
      subText: "최근 30일 — 평일 야간 활성화 + 주말 고집중 복합 패턴",
      annotations: [
        { label: "🔥 피크 타임",  value: "금~일 20~23시",  color: "#E30613" },
        { label: "📺 평일 야간",  value: "월~목 21~23시",  color: "#FFB74D" },
        { label: "🌙 가장 한산",  value: "평일 5~8시",   color: "#4A4A6A" },
        { label: "☀️ 점심 피크", value: "평일 12~14시", color: "#6C63FF" },
      ],
    },
  },
  "90D": {
    categoryMins: [128, 98,  78, 64, 51],
    sessionPcts:  [19, 33, 29, 13, 6],
    heatmapProfile: {
      weekendEveningBoost: 20,
      weekdayNightBoost:   22,
      afternoonBoost:      15,
      morningDip:          10,
      baseLevel:           25,
      subText: "최근 90일 — 전체 시청 패턴 가시화, 평일·주말 패턴 균형",
      annotations: [
        { label: "🔥 피크 타임",  value: "주말 20~23시",   color: "#E30613" },
        { label: "📺 2차 피크",   value: "평일 21~23시",  color: "#FFB74D" },
        { label: "☀️ 오후 피크", value: "전체 15~19시",  color: "#6C63FF" },
        { label: "🌙 가장 한산",  value: "새벽 3~5시",   color: "#4A4A6A" },
      ],
    },
  },
  "6M": {
    categoryMins: [142, 107, 86, 72, 58],
    sessionPcts:  [17, 34, 30, 13, 6],
    heatmapProfile: {
      weekendEveningBoost: 18,
      weekdayNightBoost:   20,
      afternoonBoost:      18,
      morningDip:          7,
      baseLevel:           30,
      subText: "최근 6개월 — 장기 시청 패턴, 전 시간대 균등 고강도 분포",
      annotations: [
        { label: "🔥 피크 타임",  value: "주말 20~23시",    color: "#E30613" },
        { label: "📺 평일 야간",  value: "전체 21~23시",   color: "#FFB74D" },
        { label: "☀️ 오후 활성", value: "전체 15~19시",   color: "#6C63FF" },
        { label: "🌅 출퇴근 피크", value: "평일 8~9, 18시", color: "#00D2A0" },
      ],
    },
  },
};

/* ══════════════════════════════════════════════════════════════════════
   기간별 개입 전략 페이지 데이터
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_INTERVENTION: Record<Period, InterventionPageData> = {
  "7D": {
    summaryValues: [
      { value: "2",     sub: "현재 진행 중" },
      { value: "2,847", sub: "개입 타겟"     },
      { value: "+28",   sub: "전략 적용 시"   },
    ],
    strategyTargets: ["702명", "988명", "10,648명"],
    simData: [
      { segment: "고위험군", before: 35.2, after: 20.7 },
      { segment: "중위험군", before: 16.2, after: 11.6 },
      { segment: "저위험군", before: 3.9,  after: 3.4  },
    ],
  },
  "30D": {
    summaryValues: [
      { value: "4",     sub: "현재 진행 중" },
      { value: "8,412", sub: "개입 타겟"     },
      { value: "+34",   sub: "전략 적용 시"   },
    ],
    strategyTargets: ["3,847명", "5,412명", "34,438명"],
    simData: [
      { segment: "고위험군", before: 41.2, after: 24.3 },
      { segment: "중위험군", before: 18.5, after: 13.3 },
      { segment: "저위험군", before: 4.8,  after: 4.2  },
    ],
  },
  "90D": {
    summaryValues: [
      { value: "7",      sub: "현재 진행 중" },
      { value: "24,680", sub: "개입 타겟"     },
      { value: "+38",    sub: "전략 적용 시"   },
    ],
    strategyTargets: ["11,527명", "16,261명", "98,240명"],
    simData: [
      { segment: "고위험군", before: 47.8, after: 28.4 },
      { segment: "중위험군", before: 22.1, after: 15.9 },
      { segment: "저위험군", before: 5.8,  after: 5.1  },
    ],
  },
  "6M": {
    summaryValues: [
      { value: "12",     sub: "현재 진행 중" },
      { value: "45,200", sub: "개입 타겟"     },
      { value: "+42",    sub: "전략 적용 시"   },
    ],
    strategyTargets: ["21,415명", "30,083명", "180,580명"],
    simData: [
      { segment: "고위험군", before: 52.4, after: 31.2 },
      { segment: "중위험군", before: 25.3, after: 18.1 },
      { segment: "저위험군", before: 6.5,  after: 5.7  },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════
   기간 라벨 (2025년 12월 10일 기준으로 수정)
══════════════════════════════════════════════════════════════════════ */
export const PERIOD_RANGES: Record<Period, { start: string; end: string; label: string; desc: string }> = {
  "7D":  { start: "2025-12-04", end: "2025-12-10", label: "최근 7일",   desc: "2025.12.04 ~ 12.10" },
  "30D": { start: "2025-11-11", end: "2025-12-10", label: "최근 30일",  desc: "2025.11.11 ~ 12.10" },
  "90D": { start: "2025-09-12", end: "2025-12-10", label: "최근 90일",  desc: "2025.09.12 ~ 12.10" },
  "6M":  { start: "2025-06-14", end: "2025-12-10", label: "최근 6개월", desc: "2025.06.14 ~ 12.10" },
};

/* ══════════════════════════════════════════════════════════════════════
   Custom 기간 헬퍼 함수
══════════════════════════════════════════════════════════════════════ */

/** 두 날짜 문자열(YYYY-MM-DD) 사이의 일수를 반환 */
export function getDaysInRange(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

/** scale = days / 30 (30D = 1.0 기준) */
export function getScaleFromDates(start: string, end: string): number {
  return getDaysInRange(start, end) / 30;
}

/* 고정 오프셋 배열 (랜덤 없이 결정론적 변동값) */
const TREND_OFFSETS = [-0.05, 0.08, -0.03, 0.12, 0.04, -0.06, 0.15, 0.09, -0.02, 0.11, 0.06, -0.04];
const MONTH_LABELS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY_MS      = new Date("2026-03-16T00:00:00").getTime();

/** Custom 기간의 트렌드 데이터를 동적으로 생성 */
function computeCustomTrend(start: string, end: string, scale: number): TrendPoint[] {
  const sMs = new Date(start + "T00:00:00").getTime();
  const eMs = new Date(end   + "T00:00:00").getTime();
  const totalDays = getDaysInRange(start, end);
  const numPoints = Math.max(5, Math.min(10, Math.ceil(totalDays / 3)));

  const points: TrendPoint[] = [];
  const baseChurn = Math.min(6.0, Math.max(1.0, 4.2 * Math.pow(Math.min(scale, 3), 0.35)));

  const seenLabels = new Set<string>();

  for (let i = 0; i < numPoints; i++) {
    const t = numPoints > 1 ? i / (numPoints - 1) : 0;
    const pointMs   = sMs + t * (eMs - sMs);
    const pointDate = new Date(pointMs);
    let label       = `${MONTH_LABELS[pointDate.getMonth()]} ${pointDate.getDate()}`;

    // Ensure label uniqueness to avoid duplicate key warnings in charts
    if (seenLabels.has(label)) {
      label = `${label} (${i})`;
    }
    seenLabels.add(label);

    const trendVal  = parseFloat((baseChurn * (0.88 + t * 0.24) + TREND_OFFSETS[i % TREND_OFFSETS.length]).toFixed(2));
    const isPast    = pointMs <= TODAY_MS;
    const isLast    = i === numPoints - 1;

    points.push({
      label,
      actual:    isPast             ? trendVal           : null,
      predicted: (!isPast || isLast) ? parseFloat((trendVal + 0.08 * t).toFixed(2)) : null,
      target:    3.5,
    });
  }
  return points;
}

/** Custom 기간의 KPIDataSet을 30D 기준으로 scale하여 반환 */
function computeCustomKPI(scale: number, days: number): KPIDataSet {
  const capped = Math.min(scale, 8);
  const churnRateNum    = parseFloat(Math.min(6.5, Math.max(0.4, 4.2 * Math.pow(capped, 0.35))).toFixed(1));
  const riskUsersNum    = Math.round(12847 * capped);
  const avgDurNum       = parseFloat(Math.max(6.5, Math.min(9.8, 9.8 - capped * 0.9)).toFixed(1));
  const interventionNum = parseFloat(Math.max(50, Math.min(80, 67.4 - (capped - 1) * 2.5)).toFixed(1));

  const riskUsersDelta  = Math.round(1234 * Math.max(0.1, capped));
  const interventionDir: "up" | "down" = capped < 1 ? "up" : "down";

  return {
    churnRate: {
      value:     String(churnRateNum),
      delta:     churnRateNum >= 3.4 ? `+${(churnRateNum - 3.4).toFixed(1)}%p` : `-${(3.4 - churnRateNum).toFixed(1)}%p`,
      deltaDir:  churnRateNum >= 3.4 ? "up" : "down",
      subText:   `커스텀 기간 (${days}일) 기준`,
      sparkValues: PERIOD_KPI["30D"].churnRate.sparkValues.map(v =>
        parseFloat((v * Math.pow(capped, 0.35)).toFixed(2))
      ),
    },
    riskUsers: {
      value:     riskUsersNum.toLocaleString(),
      delta:     `+${riskUsersDelta.toLocaleString()}`,
      deltaDir:  "up",
      subText:   `전체 가입자의 ${Math.min(99, parseFloat((8.3 * Math.min(capped, 6)).toFixed(1)))}%`,
      sparkValues: PERIOD_KPI["30D"].riskUsers.sparkValues.map(v => Math.round(v * capped)),
    },
    avgSubDuration: {
      value:     String(avgDurNum),
      delta:     `-${parseFloat(Math.max(0, (9.8 - avgDurNum)).toFixed(1))}개월`,
      deltaDir:  "down",
      subText:   "이탈 위험군 기준",
      sparkValues: PERIOD_KPI["30D"].avgSubDuration.sparkValues,
    },
    interventionRate: {
      value:     String(interventionNum),
      delta:     capped < 1 ? `+${(interventionNum - 67.4).toFixed(1)}%p` : `-${(67.4 - interventionNum).toFixed(1)}%p`,
      deltaDir:  interventionDir,
      subText:   `커스텀 기간 (${days}일) 캠페인 기준`,
      sparkValues: PERIOD_KPI["30D"].interventionRate.sparkValues,
    },
  };
}

/** Custom 기간의 RiskBandData를 30D 기준으로 scale하여 반환 */
function computeCustomRisk(scale: number): RiskBandData[] {
  const capped = Math.min(scale, 8);
  return [
    { label: "고위험", count: Math.round(3847  * capped), pct: 29.9, color: "#E30613" },
    { label: "중위험", count: Math.round(5412  * capped), pct: 42.1, color: "#FFB74D" },
    { label: "저위험", count: Math.round(3588  * capped), pct: 27.9, color: "#00D2A0" },
  ];
}

/** Custom 기간의 ChurnKPI를 30D 기준으로 scale하여 반환 */
function computeCustomChurnKPI(scale: number): ChurnKPI {
  const capped        = Math.min(scale, 8);
  const churnRateNum  = parseFloat(Math.min(6.5, Math.max(0.4, 4.2 * Math.pow(capped, 0.35))).toFixed(1));
  const predictedChurn = Math.round(3847 * capped);
  const highRiskUsers  = predictedChurn;
  const highRiskDelta  = Math.round(312 * Math.max(0.1, capped));

  return {
    predictedChurn,
    highRiskUsers,
    churnRate:      String(churnRateNum),
    churnRateDelta: `+${churnRateNum.toFixed(1)}%`,
    highRiskDelta:  `+${highRiskDelta.toLocaleString()}명`,
  };
}

/** Custom 기간의 ServicePageData를 scale하여 반환 */
function computeCustomService(scale: number, days: number, start: string, end: string): ServicePageData {
  const c = Math.min(scale, 6);
  const activeUsersNum = Math.round(42850 * Math.min(1.28, Math.max(0.87, 0.88 + c * 0.14)));
  const sessionBase    = 47.53;
  const sessionMult    = Math.min(1.15, Math.max(0.93, 0.94 + c * 0.06));
  const sessionTotal   = sessionBase * sessionMult;
  const sessionMin     = Math.floor(sessionTotal);
  const sessionSec     = Math.round((sessionTotal - sessionMin) * 60);
  const sessionStr     = `${sessionMin}:${String(sessionSec).padStart(2, "0")}`;
  const churnNum       = parseFloat(Math.max(14.0, Math.min(26.0, 19.6 + (c - 1) * 1.8)).toFixed(1));
  const completionNum  = parseFloat(Math.max(62.0, Math.min(78.0, 68.3 + (c - 1) * 2.8)).toFixed(1));
  const churnDeltaDir: "up"|"down" = c >= 1 ? "up" : "down";

  /* trend points: 기간을 6~8개 포인트로 분할 */
  const sMs = new Date(start + "T00:00:00").getTime();
  const eMs = new Date(end   + "T00:00:00").getTime();
  const numPts = Math.max(4, Math.min(8, Math.ceil(days / 5)));
  const trendPoints = Array.from({ length: numPts }, (_, i) => {
    const t    = numPts > 1 ? i / (numPts - 1) : 0;
    const ms   = sMs + t * (eMs - sMs);
    const d    = new Date(ms);
    const lbl  = `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
    const base = 36000;
    const users = Math.round(base + (activeUsersNum - base) * Math.pow(t, 0.7));
    return { month: lbl, users };
  });

  const premPct = Math.max(38, Math.round(45 - (c - 1) * 2));
  const basicPct = Math.min(25, Math.round(20 + (c - 1) * 0.6));
  const stdPct   = 100 - premPct - basicPct;

  return {
    kpis: [
      { value: activeUsersNum.toLocaleString(), delta: `+${((activeUsersNum / 38420 - 1) * 100).toFixed(1)}%`, deltaDir: "up" },
      { value: sessionStr,  delta: `+${((sessionMult - 0.93) / 0.07 * 5).toFixed(1)}%`, deltaDir: "up" },
      { value: String(churnNum),
        delta: c >= 1 ? `+${(churnNum - 19.6).toFixed(1)}%p` : `-${(19.6 - churnNum).toFixed(1)}%p`,
        deltaDir: churnDeltaDir },
      { value: String(completionNum), delta: `+${(completionNum - 66.7).toFixed(1)}%p`, deltaDir: "up" },
    ],
    trendPoints,
    planSplit: [
      { name: "프리미엄", pct: premPct  },
      { name: "스탠다드", pct: stdPct   },
      { name: "베이직",   pct: basicPct },
    ],
  };
}

/** Custom 기간의 UserAnalysisPageData를 scale하여 반환 */
function computeCustomUserAnalysis(scale: number): UserAnalysisPageData {
  const c = Math.min(scale, 6);
  const heavyPct   = parseFloat(Math.max(19, Math.min(26, 23.4 - (c - 1) * 1.5)).toFixed(1));
  const regularPct = parseFloat(Math.max(44, Math.min(50, 48.2 - (c - 1) * 0.8)).toFixed(1));
  const lowPct     = parseFloat((100 - heavyPct - regularPct).toFixed(1));
  const totalUsers = Math.round(42850 * Math.min(1.28, Math.max(0.87, 0.88 + c * 0.14)));
  const heavyCount   = Math.round(totalUsers * heavyPct   / 100);
  const regularCount = Math.round(totalUsers * regularPct / 100);
  const lowCount     = totalUsers - heavyCount - regularCount;
  const watchHeavy   = Math.max(70, Math.round(89 - (c - 1) * 5));
  const watchRegular = Math.max(35, Math.round(47 + (c - 1) * 4));
  const watchLow     = Math.max(10, Math.round(18 + (c - 1) * 5));
  const compHeavy    = Math.max(70, Math.round(82 - (c - 1) * 4));
  const compRegular  = Math.max(55, Math.round(65 + (c - 1) * 3));
  const compLow      = Math.max(20, Math.round(31 + (c - 1) * 7));

  return {
    segments: [
      { pct: `${heavyPct}%`,   count: `${heavyCount.toLocaleString()}명`   },
      { pct: `${regularPct}%`, count: `${regularCount.toLocaleString()}명` },
      { pct: `${lowPct}%`,     count: `${lowCount.toLocaleString()}명`     },
    ],
    tableRows: [
      { count: heavyCount.toLocaleString(),   watchTime: `${watchHeavy}분`,   completion: compHeavy   },
      { count: regularCount.toLocaleString(), watchTime: `${watchRegular}분`, completion: compRegular },
      { count: lowCount.toLocaleString(),     watchTime: `${watchLow}분`,     completion: compLow     },
    ],
  };
}

/** Custom 기간의 BehaviorPageData를 scale하여 반환 */
function computeCustomBehavior(scale: number): BehaviorPageData {
  const c = Math.min(scale, 6);
  const base = PERIOD_BEHAVIOR["30D"];
  const categoryMins = base.categoryMins.map(m =>
    Math.round(Math.max(30, Math.min(200, m * (0.85 + c * 0.15))))
  );
  const sessionPcts  = base.sessionPcts.map((p, i) => {
    if (i === 0) return Math.max(10, Math.round(p - (c - 1) * 2));
    if (i === 1) return Math.max(20, Math.round(p + (c - 1) * 1.5));
    if (i === 2) return Math.max(20, Math.round(p + (c - 1) * 1));
    if (i === 3) return Math.max(8,  Math.round(p - (c - 1) * 0.5));
    return Math.max(3, Math.round(p + (c - 1) * 0.5));
  });
  /* normalize to 100% */
  const total = sessionPcts.reduce((a, b) => a + b, 0);
  const normalized = sessionPcts.map(p => Math.max(1, Math.round((p / total) * 100)));
  const diff = 100 - normalized.reduce((a, b) => a + b, 0);
  normalized[1] += diff;

  /* ── Heatmap profile: 기간 scale에 따라 7D→6M 패턴으로 보간 ── */
  const weekendEveningBoost = Math.max(18, Math.round(34 - c * 2.7));
  const weekdayNightBoost   = Math.min(20, Math.max(5,  Math.round(5  + c * 2.5)));
  const afternoonBoost      = Math.min(18, Math.max(8,  Math.round(8  + c * 1.7)));
  const morningDip          = Math.max(7,  Math.round(18 - c * 1.8));
  const baseLevel           = Math.min(30, Math.round(14 + c * 2.7));

  const weekdayLabel = c > 2 ? "전체 21~23시" : c > 1 ? "월~목 21~23시" : "평일 22~23시";
  const afternoonLabel = c > 1.5 ? "전체 15~19시" : "평일 15~18시";

  return {
    categoryMins,
    sessionPcts: normalized,
    heatmapProfile: {
      weekendEveningBoost,
      weekdayNightBoost,
      afternoonBoost,
      morningDip,
      baseLevel,
      subText: `커스텀 기간 — 선택한 기간 기준 시청 집중도 패턴`,
      annotations: [
        { label: "🔥 피크 타임",  value: "주말 20~23시",   color: "#E30613" },
        { label: "📺 평일 야간",  value: weekdayLabel,     color: "#FFB74D" },
        { label: "☀️ 오후 피크", value: afternoonLabel,   color: "#6C63FF" },
        { label: "🌙 가장 한산",  value: "새벽 3~5시",    color: "#4A4A6A" },
      ],
    },
  };
}

/** Custom 기간의 InterventionPageData를 scale하여 반환 */
function computeCustomIntervention(scale: number): InterventionPageData {
  const c          = Math.min(scale, 6);
  const campaigns  = Math.max(1, Math.round(4 * Math.min(c, 4)));
  const targetUsers = Math.round(8412 * c);
  const retention   = Math.max(20, Math.min(48, Math.round(34 + (c - 1) * 4)));
  const highRisk   = Math.round(3847  * c);
  const midRisk    = Math.round(5412  * c);
  const lowPrev    = Math.round(34438 * c);

  const beforeHigh = parseFloat(Math.min(58, (41.2 + (c - 1) * 5.5)).toFixed(1));
  const beforeMid  = parseFloat(Math.min(28, (18.5 + (c - 1) * 3.2)).toFixed(1));
  const beforeLow  = parseFloat(Math.min(8,  (4.8  + (c - 1) * 0.9)).toFixed(1));
  const afterHigh  = parseFloat((beforeHigh * 0.59).toFixed(1));
  const afterMid   = parseFloat((beforeMid  * 0.72).toFixed(1));
  const afterLow   = parseFloat((beforeLow  * 0.875).toFixed(1));

  return {
    summaryValues: [
      { value: String(campaigns),              sub: "현재 진행 중" },
      { value: targetUsers.toLocaleString(),   sub: "개입 타겟"     },
      { value: `+${retention}`,                sub: "전략 적용 시"   },
    ],
    strategyTargets: [
      `${highRisk.toLocaleString()}명`,
      `${midRisk.toLocaleString()}명`,
      `${lowPrev.toLocaleString()}명`,
    ],
    simData: [
      { segment: "고위험군", before: beforeHigh, after: afterHigh },
      { segment: "중위험군", before: beforeMid,  after: afterMid  },
      { segment: "저위험군", before: beforeLow,  after: afterLow  },
    ],
  };
}

/* ══════════════════════════════════════════════════════════════════════
   Context
══════════════════════════════════════════════════════════════════════ */
type PFContext = {
  period:       Period;
  setPeriod:    (p: Period) => void;
  isCustom:     boolean;
  customRange:  { start: string; end: string };
  setCustom:    (range: { start: string; end: string }) => void;
  clearCustom:  () => void;
  activeRange:  { start: string; end: string; label: string; desc: string };
  /** 표시용 기간 레이블 — Custom 선택 시 "Custom" 반환 */
  periodLabel:  string;
  // 기간별 데이터
  kpiData:          KPIDataSet;
  trendData:        TrendPoint[];
  riskData:         RiskBandData[];
  churnKPI:         ChurnKPI;
  serviceData:      ServicePageData;
  userAnalysisData: UserAnalysisPageData;
  behaviorData:     BehaviorPageData;
  interventionData: InterventionPageData;
};

const _D: Period = "30D";

export const PeriodFilterContext = createContext<PFContext>({
  period:      _D,
  setPeriod:   () => {},
  isCustom:    false,
  customRange: { start: PERIOD_RANGES[_D].start, end: PERIOD_RANGES[_D].end },
  setCustom:   () => {},
  clearCustom: () => {},
  activeRange: PERIOD_RANGES[_D],
  periodLabel: _D,
  kpiData:          PERIOD_KPI[_D],
  trendData:        PERIOD_TREND[_D],
  riskData:         PERIOD_RISK[_D],
  churnKPI:         PERIOD_CHURN_KPI[_D],
  serviceData:      PERIOD_SERVICE[_D],
  userAnalysisData: PERIOD_USER_ANALYSIS[_D],
  behaviorData:     PERIOD_BEHAVIOR[_D],
  interventionData: PERIOD_INTERVENTION[_D],
});

export function PeriodFilterProvider({ children }: { children: ReactNode }) {
  const [period,      setPeriodState]      = useState<Period>("30D");
  const [isCustom,    setIsCustom]         = useState(false);
  const [customRange, setCustomRangeState] = useState({ start: "2026-02-01", end: "2026-03-15" });

  const setPeriod   = (p: Period) => { setPeriodState(p); setIsCustom(false); };
  const setCustom   = (r: { start: string; end: string }) => { setCustomRangeState(r); setIsCustom(true); };
  const clearCustom = () => setIsCustom(false);

  /* ── 활성 범위 ── */
  const activeRange = isCustom
    ? { ...customRange, label: "Custom Range", desc: `${customRange.start} ~ ${customRange.end}` }
    : PERIOD_RANGES[period];

  /* ── Custom 스케일 계산 ── */
  const customScale = isCustom ? getScaleFromDates(customRange.start, customRange.end) : 1;
  const customDays  = isCustom ? getDaysInRange(customRange.start, customRange.end)    : 30;

  /* ── 데이터 선택 (Custom이면 동적 계산) ── */
  const kpiData          = isCustom ? computeCustomKPI(customScale, customDays)                                           : PERIOD_KPI[period];
  const trendData        = isCustom ? computeCustomTrend(customRange.start, customRange.end, customScale)                 : PERIOD_TREND[period];
  const riskData         = isCustom ? computeCustomRisk(customScale)                                                      : PERIOD_RISK[period];
  const churnKPI         = isCustom ? computeCustomChurnKPI(customScale)                                                  : PERIOD_CHURN_KPI[period];
  const serviceData      = isCustom ? computeCustomService(customScale, customDays, customRange.start, customRange.end)   : PERIOD_SERVICE[period];
  const userAnalysisData = isCustom ? computeCustomUserAnalysis(customScale)                                              : PERIOD_USER_ANALYSIS[period];
  const behaviorData     = isCustom ? computeCustomBehavior(customScale)                                                  : PERIOD_BEHAVIOR[period];
  const interventionData = isCustom ? computeCustomIntervention(customScale)                                              : PERIOD_INTERVENTION[period];

  const periodLabel = isCustom ? "Custom" : period;

  return (
    <PeriodFilterContext.Provider value={{
      period, setPeriod,
      isCustom, customRange, setCustom, clearCustom,
      activeRange,
      periodLabel,
      kpiData,
      trendData,
      riskData,
      churnKPI,
      serviceData,
      userAnalysisData,
      behaviorData,
      interventionData,
    }}>
      {children}
    </PeriodFilterContext.Provider>
  );
}

export function usePeriodFilter() {
  return useContext(PeriodFilterContext);
}