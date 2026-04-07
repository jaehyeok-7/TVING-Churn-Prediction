import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { User } from "../data/users";

/* ════════════════════════════════════════════════════════════════════════
   Google Sheets API 설정
════════════════════════════════════════════════════════════════════════ */
const SHEET_ID = "1IRuMC_Rs1JubWmtlQ5OMMICaW8ZfKwVdVa25DURN8Eo";
const API_KEY  = "AIzaSyCs0FdvX259VAyWQ8CIKirSzKGS4gsZOMY";

const sheetUrl = (name: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(name)}?key=${API_KEY}`;

const URL_USERS       = sheetUrl("dashboard_results_final10");
const URL_CHURN_FINAL = sheetUrl("churn_final"); // ★ 추가: 페르소나 타입 및 KPI 데이터가 있는 시트
const URL_SHAP_GLOBAL = sheetUrl("shap_global_importance");
const URL_SHAP_HIGH   = sheetUrl("shap_global_High_drivers");
const URL_SHAP_MID    = sheetUrl("shap_global_Mid_drivers");
const URL_SHAP_LOW    = sheetUrl("shap_global_Low_drivers");
const URL_WATCH_LOGS  = sheetUrl("watch_logs");

type RiskBand = "High Risk" | "Mid Risk" | "Low Risk";
type HistBin  = { range: string; count: number; color: string; risk_band: RiskBand };

const HIST_BIN_DEFS = [
  { range: "0~10%",  lo: 0,  hi: 10,  risk_band: "Low Risk"  as RiskBand, color: "#22C55E" },
  { range: "10~20%", lo: 10, hi: 20,  risk_band: "Low Risk"  as RiskBand, color: "#22C55E" },
  { range: "20~30%", lo: 20, hi: 30,  risk_band: "Low Risk"  as RiskBand, color: "#22C55E" },
  { range: "30~40%", lo: 30, hi: 40,  risk_band: "Low Risk"  as RiskBand, color: "#22C55E" },
  { range: "40~50%", lo: 40, hi: 50,  risk_band: "Mid Risk"  as RiskBand, color: "#F59E0B" },
  { range: "50~60%", lo: 50, hi: 60,  risk_band: "Mid Risk"  as RiskBand, color: "#F59E0B" },
  { range: "60~70%", lo: 60, hi: 70,  risk_band: "Mid Risk"  as RiskBand, color: "#F59E0B" },
  { range: "70~80%", lo: 70, hi: 80,  risk_band: "High Risk" as RiskBand, color: "#EF4444" },
  { range: "80~90%", lo: 80, hi: 90,  risk_band: "High Risk" as RiskBand, color: "#EF4444" },
  { range: "90~100%",lo: 90, hi: 101, risk_band: "High Risk" as RiskBand, color: "#EF4444" },
];

export const DEFAULT_HISTOGRAM: HistBin[] = [];
export const DEFAULT_TOP10: User[] = [];
export type ShapItem = { feature: string; score: number };
export type WatchLog = { timestamp: string; genre_primary: string; view_duration_minutes: number; };
export type DataStatus = "loading" | "success" | "error";

// ★ 수정: 프론트엔드 연동을 위해 totalUsers, activeUsers, avgTenure 타입 추가
export type SheetKPI = {
  total: number; 
  totalUsers: number; 
  activeUsers: number; 
  highRiskCount: number; 
  midRiskCount: number; 
  lowRiskCount: number; 
  predictedChurn: number; 
  avgTenure: string;
  churnRate: string;
};

// ★ 수정: DEFAULT_KPI에도 새로 추가한 항목들의 초기값(0) 부여
const DEFAULT_KPI: SheetKPI = { 
  total: 0, totalUsers: 0, activeUsers: 0, 
  highRiskCount: 0, midRiskCount: 0, lowRiskCount: 0, 
  predictedChurn: 0, avgTenure: "0.0", churnRate: "0.0" 
};

export type SheetErrors = { users: boolean; global: boolean; high: boolean; mid: boolean; low: boolean; watchLogs: boolean; churnFinal: boolean; };

type SheetDataContextType = {
  status: DataStatus; dataCount: number; users: User[]; dashboardData: User[]; kpi: SheetKPI; histogramData: HistBin[]; top10: User[]; lastUpdated: string | null;
  refresh: () => void; shapGlobal: ShapItem[]; shapHigh: ShapItem[]; shapMid: ShapItem[]; shapLow: ShapItem[]; watchLogs: WatchLog[];
  sheetErrors: SheetErrors; retrySheet: (sheet: keyof SheetErrors) => void;
};

const SheetDataContext = createContext<SheetDataContextType>({
  status: "loading", dataCount: 0, users: [], dashboardData: [], kpi: DEFAULT_KPI, histogramData: DEFAULT_HISTOGRAM, top10: DEFAULT_TOP10, lastUpdated: null, refresh: () => {},
  shapGlobal: [], shapHigh: [], shapMid: [], shapLow: [], watchLogs: [],
  sheetErrors: { users: false, global: false, high: false, mid: false, low: false, watchLogs: false, churnFinal: false },
  retrySheet: () => {},
});

/* ════════════════════════════════════════════════════════════════════════
   파싱 함수들
════════════════════════════════════════════════════════════════════════ */
function parseRows(json: any): Record<string, any>[] {
  if (!json?.values || json.values.length < 2) return [];
  const headers: string[] = json.values[0];
  return (json.values.slice(1) as string[][]).map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const val = row[i] ?? "";
      if (val === "") obj[h] = null;
      else if (!isNaN(Number(val))) obj[h] = Number(val);
      else obj[h] = val;
    });
    return obj;
  });
}

function mapDevice(smartphone: number, tvSet: number, tablet: number, pc: number): User["device"] {
  const max = Math.max(smartphone, tvSet, tablet, pc);
  if (max === 0) return "Mobile";
  if (pc > 0 && pc >= smartphone * 0.3) return "Web";
  if (tablet > 0 && tablet >= smartphone * 0.3) return "Tablet";
  if (max === tvSet) return "TV";
  return "Mobile";
}

function parseUsers(json: any, churnJson: any): User[] {
  const rows = parseRows(json);
  
  const churnRows = churnJson ? parseRows(churnJson) : [];
  const churnMap = new Map();
  churnRows.forEach(r => churnMap.set(r.user_id, r));

  return rows.map((r, i) => {
    const pct = r.churn_probability_pct ?? 0;
    const rb: RiskBand = r.Risk_Band === "High" ? "High Risk" : r.Risk_Band === "Mid" ? "Mid Risk" : "Low Risk";
    const lastActive = r.days_since_last_watch === null || r.days_since_last_watch >= 9999 ? null : r.days_since_last_watch;
    
    const churnData = churnMap.get(r.user_id) || {};

    return {
      user_id:                 String(r.user_id || `user_${i}`),
      date:                    String(r.date || "2025-12-10"),
      churn_score:             pct / 100,
      churn_probability_pct:   pct,
      risk_band:               rb,
      watch_time:              r.watch_hours || 0,
      search_count:            r.search_engagement || 0,
      recommend_click:         r.content_diversity_score || 0,
      device:                  mapDevice(Number(r.freq_smartphone) || 0, Number(r.freq_tv_set) || 0, Number(r.freq_tablet) || 0, Number(r.freq_pc) || 0),
      segment:                 r.segment_volume === "Heavy_Viewer" ? "Power User" : r.segment_volume === "Medium_Viewer" ? "Regular User" : "Low Activity",
      last_active_days:        lastActive,
      content_diversity_score: r.content_diversity_score || 0,
      completion_rate:         r.completion_rate || 0,
      search_engagement:       r.search_engagement || 0,
      freq_smartphone:         r.freq_smartphone || 0,
      freq_tv_set:             r.freq_tv_set || 0,
      freq_tablet:             r.freq_tablet || 0,
      freq_pc:                 r.freq_pc || 0,
      segment_volume:          r.segment_volume || "",
      segment_explore:         r.segment_explore || "",
      segment_taste:           r.segment_taste || "",
      persona_type:            churnData.persona_type || "",

      // ★ KPI 계산용 숨겨진 필드 추가 (Type 에러를 막기 위해 임시 보관)
      _tenure_months: Number(r.tenure_months || churnData.tenure_months || 0),
      _churn_status: Number(r.churn_status || churnData.churn_status || 0),
    } as User;
  });
}

function parseShapGlobal(json: any): ShapItem[] { return parseRows(json).filter((r) => r.feature && r.mean_abs_shap != null).map((r) => ({ feature: String(r.feature), score: Number(r.mean_abs_shap) })).sort((a, b) => b.score - a.score); }
function parseShapDrivers(json: any, scoreKey: string): ShapItem[] { return parseRows(json).filter((r) => r.feature && r[scoreKey] != null).map((r) => ({ feature: String(r.feature), score: Number(r[scoreKey]) })).sort((a, b) => b.score - a.score); }
function parseWatchLogs(json: any): WatchLog[] { return parseRows(json).map((r) => ({ timestamp: String(r.timestamp || ""), genre_primary: String(r.genre_primary || ""), view_duration_minutes: Number(r.view_duration_minutes) || 0 })); }

/* ════════════════════════════════════════════════════════════════════════
   Provider
════════════════════════════════════════════════════════════════════════ */
export function SheetDataProvider({ children }: { children: ReactNode }) {
  const [status,    setStatus]    = useState<DataStatus>("loading");
  const [dataCount, setDataCount] = useState(0);
  const [users,     setUsers]     = useState<User[]>([]);
  const [kpi,       setKpi]       = useState<SheetKPI>(DEFAULT_KPI);
  const [histogramData, setHistogramData] = useState<HistBin[]>(DEFAULT_HISTOGRAM);
  const [top10,     setTop10]     = useState<User[]>(DEFAULT_TOP10);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [shapGlobal, setShapGlobal] = useState<ShapItem[]>([]);
  const [shapHigh,   setShapHigh]   = useState<ShapItem[]>([]);
  const [shapMid,    setShapMid]    = useState<ShapItem[]>([]);
  const [shapLow,    setShapLow]    = useState<ShapItem[]>([]);
  const [watchLogs,  setWatchLogs]  = useState<WatchLog[]>([]);

  const [sheetErrors, setSheetErrors] = useState<SheetErrors>({ users: false, global: false, high: false, mid: false, low: false, watchLogs: false, churnFinal: false });

  // ★ 가장 핵심 로직: 불러온 데이터를 바탕으로 5대 KPI 수식을 직접 계산합니다.
  const applyUsers = useCallback((mapped: User[]) => {
    const totalUsers = mapped.length;
    const high = mapped.filter((u) => u.risk_band === "High Risk");
    const mid  = mapped.filter((u) => u.risk_band === "Mid Risk");
    const low  = mapped.filter((u) => u.risk_band === "Low Risk");

    // 1. 총 활성 사용자 (마지막 접속일이 7일 이하인 유저)
    const activeUsers = mapped.filter((u) => u.last_active_days !== null && u.last_active_days <= 7).length;

    // 2. 평균 구독 기간 (전체 유저의 tenure_months 합 / 전체 유저 수)
    const totalTenure = mapped.reduce((sum, u: any) => sum + (u._tenure_months || 0), 0);
    const avgTenure = totalUsers > 0 ? (totalTenure / totalUsers).toFixed(1) : "0.0";

    // 3. 월간 이탈율 (이탈 유저 수 / 전체 유저 수 * 100)
    const churnedUsers = mapped.filter((u: any) => u._churn_status === 1).length;
    const churnRate = totalUsers > 0 ? ((churnedUsers / totalUsers) * 100).toFixed(1) : "0.0";

    const predicted = Math.round(high.length * 0.85);

    const hist: HistBin[] = HIST_BIN_DEFS.map((b) => ({
      range: b.range, risk_band: b.risk_band, color: b.color,
      count: mapped.filter((u) => u.churn_probability_pct >= b.lo && u.churn_probability_pct < b.hi).length,
    }));

    const t10 = [...high].sort((a, b) => b.churn_score - a.churn_score).slice(0, 10);

    setUsers(mapped); 
    setDataCount(totalUsers); 
    
    // ★ 계산된 진짜 KPI 값들을 꽂아줍니다.
    setKpi({ 
      total: totalUsers, 
      totalUsers: totalUsers, 
      activeUsers: activeUsers,
      highRiskCount: high.length, 
      midRiskCount: mid.length, 
      lowRiskCount: low.length, 
      predictedChurn: predicted, 
      avgTenure: avgTenure,
      churnRate: churnRate 
    });
    
    setHistogramData(hist); 
    setTop10(t10.length > 0 ? t10 : DEFAULT_TOP10); 
    setLastUpdated(new Date().toLocaleString("ko-KR"));
  }, []);

  const fetchData = useCallback(async () => {
    setStatus("loading");

    const [usersRes, globalRes, highRes, midRes, lowRes, watchRes, churnFinalRes] =
      await Promise.allSettled([
        fetch(URL_USERS).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_SHAP_GLOBAL).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_SHAP_HIGH).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_SHAP_MID).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_SHAP_LOW).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_WATCH_LOGS).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch(URL_CHURN_FINAL).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      ]);

    const errors: SheetErrors = {
      users:  usersRes.status  === "rejected",
      global: globalRes.status === "rejected",
      high:   highRes.status   === "rejected",
      mid:    midRes.status    === "rejected",
      low:    lowRes.status    === "rejected",
      watchLogs: watchRes.status === "rejected",
      churnFinal: churnFinalRes.status === "rejected",
    };
    setSheetErrors(errors);

    if (usersRes.status === "fulfilled") { 
      const churnJson = churnFinalRes.status === "fulfilled" ? churnFinalRes.value : null;
      const mapped = parseUsers(usersRes.value, churnJson); 
      if (mapped.length > 0) { applyUsers(mapped); setStatus("success"); } else setStatus("error"); 
    } else setStatus("error");

    if (globalRes.status === "fulfilled") { const parsed = parseShapGlobal(globalRes.value); if (parsed.length > 0) setShapGlobal(parsed); }
    if (highRes.status === "fulfilled") { const parsed = parseShapDrivers(highRes.value, "churn_impact"); if (parsed.length > 0) setShapHigh(parsed); }
    if (midRes.status === "fulfilled") { const parsed = parseShapDrivers(midRes.value, "churn_impact"); if (parsed.length > 0) setShapMid(parsed); }
    if (lowRes.status === "fulfilled") { const parsed = parseShapDrivers(lowRes.value, "retention_impact"); if (parsed.length > 0) setShapLow(parsed); }
    if (watchRes.status === "fulfilled") { const parsed = parseWatchLogs(watchRes.value); if (parsed.length > 0) setWatchLogs(parsed); }
  }, [applyUsers]);

  const retrySheet = useCallback(
    async (sheet: keyof SheetErrors) => {
      setSheetErrors((prev) => ({ ...prev, [sheet]: false }));
      try {
        const urlMap: Record<keyof SheetErrors, string> = { users: URL_USERS, global: URL_SHAP_GLOBAL, high: URL_SHAP_HIGH, mid: URL_SHAP_MID, low: URL_SHAP_LOW, watchLogs: URL_WATCH_LOGS, churnFinal: URL_CHURN_FINAL };
        const res = await fetch(urlMap[sheet]);
        if (!res.ok) throw new Error();
        const json = await res.json();

        switch (sheet) {
          case "users": { const mapped = parseUsers(json, null); if (mapped.length > 0) { applyUsers(mapped); setStatus("success"); } else throw new Error("empty"); break; }
          case "global": { const p = parseShapGlobal(json); if (p.length > 0) setShapGlobal(p); break; }
          case "high": { const p = parseShapDrivers(json, "churn_impact"); if (p.length > 0) setShapHigh(p); break; }
          case "mid": { const p = parseShapDrivers(json, "churn_impact"); if (p.length > 0) setShapMid(p); break; }
          case "low": { const p = parseShapDrivers(json, "retention_impact"); if (p.length > 0) setShapLow(p); break; }
          case "watchLogs": { const p = parseWatchLogs(json); if (p.length > 0) setWatchLogs(p); break; }
        }
      } catch {
        setSheetErrors((prev) => ({ ...prev, [sheet]: true }));
      }
    },
    [applyUsers]
  );

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  return (
    <SheetDataContext.Provider
      value={{
        status, dataCount, users, dashboardData: users, kpi, histogramData, top10, lastUpdated, refresh: fetchData,
        shapGlobal, shapHigh, shapMid, shapLow, watchLogs,
        sheetErrors, retrySheet,
      }}
    >
      {children}
    </SheetDataContext.Provider>
  );
}

export const useSheetData = () => useContext(SheetDataContext);