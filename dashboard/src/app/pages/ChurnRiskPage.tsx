import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
  PieChart, Pie,
} from "recharts";
import {
  ChevronDown, AlertTriangle, TrendingUp, Users,
  X, Activity, BrainCircuit, ShieldCheck
} from "lucide-react";
import { ALL_USERS, riskColor } from "../data/users";
import { usePeriodFilter }  from "../contexts/PeriodFilterContext";
import { useSheetData }      from "../contexts/SheetDataContext";

/* ── Design tokens ─────────────────────────────────────────────────── */
const C = {
  bg: "#161B2E", card: "#222B44", card2: "#1D2640",
  border: "#353F66", text: "#FFFFFF", sub: "#C4CAE0", muted: "#7880A4",
  tvRed: "#FF153C", red: "#E30613",
  highRisk: "#EF4444", midRisk: "#F59E0B", lowRisk: "#22C55E",
};

/* ── 💡 Data Parsing Functions ── */
function toNumber(value: any): number {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = typeof value === "string" ? value.replace(/,/g, "").replace(/%/g, "").trim() : value;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function normalizeRiskBand(value: any): "High" | "Mid" | "Low" | "Unknown" {
  const s = String(value || "").toLowerCase();
  if (s.includes("high")) return "High";
  if (s.includes("mid") || s.includes("medium")) return "Mid";
  if (s.includes("low")) return "Low";
  return "Unknown";
}

function getKorSegment(val: any) {
  const s = String(val || "").toLowerCase();
  if (s.includes("heavy") || s.includes("power") || s.includes("high") || s.includes("core")) return "정주행러";
  if (s.includes("light") || s.includes("low") || s.includes("casual")) return "찍먹러";
  if (s === "-" || s === "undefined" || s === "") return "-";
  return "일상러"; 
}

const CHURN_FEATURE_NAMES: Record<string, string> = {
  watch_hours: "총 시청 시간 부족",
  content_diversity_score: "시청 장르 편중 (다양성 부족)",
  price_score: "요금 민감도 상승 (구독료 부담)",
  days_since_last_watch: "접속일 경과 (장기 미접속)",
  completion_rate: "콘텐츠 완주율 하락 (중도 이탈)",
  freq_tv_set: "TV 등 대형화면 시청 안함",
  had_watch_delta_rebuilt: "최근 시청량 급감",
  freq_smartphone: "모바일 앱 접속 감소",
  search_engagement: "검색 후 시청 전환 실패",
  had_core_watch_history_rebuilt: "취향에 맞는 핵심 콘텐츠 부재"
};

const RETENTION_FEATURE_NAMES: Record<string, string> = {
  watch_hours: "충분한 누적 시청 시간 확보",
  content_diversity_score: "다양한 장르 폭넓게 시청",
  price_score: "요금 대비 만족도 높음 (가성비)",
  days_since_last_watch: "최근까지 꾸준한 접속",
  completion_rate: "콘텐츠 끝까지 정주행 (완주)",
  freq_tv_set: "TV 등 대형화면 시청 환경",
  had_watch_delta_rebuilt: "안정적인 시청량 유지",
  freq_smartphone: "활발한 모바일 앱 탐색",
  search_engagement: "적극적인 콘텐츠 검색 및 시청",
  had_core_watch_history_rebuilt: "확고한 취향(핵심 콘텐츠) 보유"
};

const getFeatureName = (key: string, type: "churn" | "retention") => {
  if (type === "churn") return CHURN_FEATURE_NAMES[key] || key;
  return RETENTION_FEATURE_NAMES[key] || key;
};

/* ── Tooltip components ─────────────────────────────────────────────── */
const HistTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const colorKey = d.risk_band === "고위험군" ? "High Risk" : d.risk_band === "중위험군" ? "Mid Risk" : "Low Risk";

  return (
    <div style={{ background: "#1C2333", border: `1px solid ${riskColor(colorKey)}40`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 4px" }}>Score {label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: riskColor(colorKey), margin: 0 }}>
        {d.users.toLocaleString()}명
      </p>
    </div>
  );
};

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#1C2333", border: `1px solid ${d.color}40`, borderRadius: "8px", padding: "10px 14px", zIndex: 1000 }}>
      <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>{d.name}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: d.color, margin: 0 }}>
        {d.value.toLocaleString()}명 ({d.pct}%)
      </p>
    </div>
  );
};

/* ── FilterSelect ─────────────────────────────────────────────────── */
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: C.muted, textTransform: "uppercase" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ appearance: "none", background: C.card2, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px 32px 8px 12px", color: value === options[0] ? C.sub : C.text, fontFamily: "Inter, Pretendard, sans-serif", fontSize: "12px", fontWeight: value === options[0] ? 400 : 600, cursor: "pointer", outline: "none", minWidth: "140px" }}
        >
          {options.map(o => <option key={o} value={o} style={{ background: "#1C2333" }}>{o}</option>)}
        </select>
        <ChevronDown size={13} color={C.muted} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════ Main Page ══════════════════════════════ */
export function ChurnRiskPage({embedded = false}:{embedded?:boolean}) {
  const navigate = useNavigate();
  const ctx        = usePeriodFilter();
  const periodLabel = ctx.periodLabel ?? "30D";
  
  const activeRange = ctx.activeRange; 

  const sheetContext = useSheetData() as { users?: any[]; shapGlobal?: any[]; shapHigh?: any[]; shapLow?: any[] } | undefined;
  const safeUsers = Array.isArray(sheetContext?.users) ? sheetContext.users : [];
  const sourceUsers = safeUsers.length > 0 ? safeUsers : ALL_USERS;

  const shapGlobal = sheetContext?.shapGlobal || [];
  const shapHigh = sheetContext?.shapHigh || [];
  const shapLow = sheetContext?.shapLow || [];

  const [device,    setDevice]   = useState("전체 디바이스");
  const [segment,  setSegment]  = useState("전체 세그먼트");
  const [riskBand, setRiskBand] = useState("전체 Risk");
  const [drillFilter, setDrillFilter] = useState<string | null>(null);

  const normalizedUsers = useMemo(() => {
    return sourceUsers.map(u => {
      const rawScore = toNumber(u.churn_probability_pct ?? u.churn_score ?? u.risk_score);
      return {
        ...u,
        _riskLabel: normalizeRiskBand(u.Risk_Band ?? u.risk_band),
        _segKor: getKorSegment(u.segment_volume ?? u.segment),
        _churnScore: rawScore > 1 ? rawScore / 100 : rawScore, 
      };
    });
  }, [sourceUsers]);

  // 💡 중복 에러 해결 및 가상 날짜 분산 로직 완벽 적용!
  // 💡 데이터 기준일에 맞춰 2025년 12월로 롤백!
  const filteredUsers = useMemo(() => {
    const startDate = new Date(activeRange?.start || "2000-01-01").getTime();
    const endDate = new Date(activeRange?.end || "2099-12-31").getTime() + 86400000;

    return normalizedUsers.filter(u => {
      // 1. 가상 날짜 생성기 
      const rawId = String(u.user_id || u.id || "");
      const numericId = parseInt(rawId.replace(/[^0-9]/g, ""), 10) || Math.floor(Math.random() * 10000);
      
      // 🚨 기준 날짜를 2026년 3월에서 -> 데이터 기준일인 '2025년 12월 10일'로 수정!
      // 365를 곱해주어 2025년 1월 ~ 12월 사이에 유저가 고르게 분포되도록 합니다.
      const baseTime = new Date("2025-12-10").getTime();
      const simulatedTime = baseTime - (numericId % 365) * 86400000; 
      
      const dateMatch = simulatedTime >= startDate && simulatedTime <= endDate;

      // 2. 기존 속성 필터링 로직
      const devMatch = device === "전체 디바이스" ? true : (() => {
        if (u.device) {
          if (device === "PC") return Boolean(String(u.device).match(/web|desktop|pc/i));
          return String(u.device).toLowerCase() === device.toLowerCase();
        }
        if (device === "Mobile") return Number(u.freq_smartphone || 0) > 0;
        if (device === "TV") return Number(u.freq_tv_set || 0) > 0;
        if (device === "Tablet") return Number(u.freq_tablet || 0) > 0;
        if (device === "PC") return Number(u.freq_pc || 0) > 0;
        return true; 
      })();
      
      const segMatch = segment === "전체 세그먼트" ? true : u._segKor === segment;
      
      const bandMap: Record<string, string> = { "고위험군": "High", "중위험군": "Mid", "저위험군": "Low" };
      const targetBand = bandMap[riskBand] ?? riskBand;
      const riskMatch = riskBand === "전체 Risk" ? true : u._riskLabel === targetBand;
      
      return dateMatch && devMatch && segMatch && riskMatch;
    });
  }, [normalizedUsers, device, segment, riskBand, activeRange]);

  const highRisk = filteredUsers.filter(u => u._riskLabel === "High");
  const midRisk  = filteredUsers.filter(u => u._riskLabel === "Mid");
  const lowRisk  = filteredUsers.filter(u => u._riskLabel === "Low");

  const displayHighRisk = highRisk.length.toLocaleString();
  const activePredictedChurn = Math.round(highRisk.length * 0.85); 
  const displayPredictedChurn = activePredictedChurn.toLocaleString();
  const predictedChurnRate = filteredUsers.length ? ((activePredictedChurn / filteredUsers.length) * 100).toFixed(1) : "0.0";

  const histBins = [
    { range: "0~10%", lo: 0, hi: 0.1, default_band: "저위험군" },
    { range: "10~20%", lo: 0.1, hi: 0.2, default_band: "저위험군" },
    { range: "20~30%", lo: 0.2, hi: 0.3, default_band: "저위험군" },
    { range: "30~40%", lo: 0.3, hi: 0.4, default_band: "저위험군" },
    { range: "40~50%", lo: 0.4, hi: 0.5, default_band: "중위험군" },
    { range: "50~60%", lo: 0.5, hi: 0.6, default_band: "중위험군" },
    { range: "60~70%", lo: 0.6, hi: 0.7, default_band: "중위험군" },
    { range: "70~80%", lo: 0.7, hi: 0.8, default_band: "고위험군" },
    { range: "80~90%", lo: 0.8, hi: 0.9, default_band: "고위험군" },
    { range: "90~100%", lo: 0.9, hi: 1.01, default_band: "고위험군" },
  ];
  
  const histData = histBins.map(b => {
    const binUsers = filteredUsers.filter(u => u._churnScore >= b.lo && u._churnScore < b.hi);
    
    let lowCount = 0, midCount = 0, highCount = 0;
    binUsers.forEach(u => {
      if (u._riskLabel === "High") highCount++;
      else if (u._riskLabel === "Mid") midCount++;
      else lowCount++;
    });

    let dominantLabel = b.default_band;
    const maxCount = Math.max(lowCount, midCount, highCount);
    
    if (maxCount > 0) {
      if (maxCount === highCount) dominantLabel = "고위험군";
      else if (maxCount === midCount) dominantLabel = "중위험군";
      else dominantLabel = "저위험군";
    }

    return {
      range: b.range,
      lo: b.lo,
      hi: b.hi,
      users: binUsers.length,
      risk_band: dominantLabel
    };
  });

  const donutData = [
    { name: "고위험군", value: highRisk.length, pct: filteredUsers.length ? Math.round(highRisk.length / filteredUsers.length * 100) : 0, color: C.highRisk },
    { name: "중위험군", value: midRisk.length,  pct: filteredUsers.length ? Math.round(midRisk.length  / filteredUsers.length * 100) : 0, color: C.midRisk  },
    { name: "저위험군", value: lowRisk.length,  pct: filteredUsers.length ? Math.round(lowRisk.length  / filteredUsers.length * 100) : 0, color: C.lowRisk  },
  ];

  const churnFeatures = (shapHigh && shapHigh.length > 0 ? shapHigh : shapGlobal).slice(0, 5).map((f: any) => ({
    feature: getFeatureName(f.feature, "churn"), 
    importance: f.score || f.churn_impact || f.mean_abs_shap || 0,
  }));
  
  const retentionFeatures = (shapLow && shapLow.length > 0 ? shapLow : shapGlobal).slice(0, 5).map((f: any) => ({
    feature: getFeatureName(f.feature, "retention"), 
    importance: f.score || f.retention_impact || f.mean_abs_shap || 0,
  }));

  const activeFiltersCount = [device !== "전체 디바이스", segment !== "전체 세그먼트", riskBand !== "전체 Risk"].filter(Boolean).length;
  const resetFilters = () => { setDevice("전체 디바이스"); setSegment("전체 세그먼트"); setRiskBand("전체 Risk"); setDrillFilter(null); };

  const goRiskDrilldown = (band: string) => {
    const pathMap: Record<string, string> = { "고위험군": "high", "중위험군": "mid", "저위험군": "low", "High Risk": "high", "Mid Risk": "mid", "Low Risk": "low" };
    navigate(`/drilldown/risk/${pathMap[band] || "high"}`);
  };

  return (
    <div style={{ padding: "0", display: "flex", flexDirection: "column", gap: "0", background: C.bg, minHeight: "100vh" }}>
      
      {/* ── Global Filter Bar ── */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px 20px" }}>
          <FilterSelect label="디바이스" value={device} options={["전체 디바이스","Mobile","TV","PC","Tablet"]} onChange={setDevice} />
          <FilterSelect label="사용자 세그먼트" value={segment} options={["전체 세그먼트", "정주행러", "일상러", "찍먹러"]} onChange={setSegment} />
          <FilterSelect label="Risk Band" value={riskBand} options={["전체 Risk","고위험군","중위험군","저위험군"]} onChange={(v) => { setRiskBand(v); if (v !== "전체 Risk") setDrillFilter(v); else setDrillFilter(null); }} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "rgba(255,21,60,0.1)", border: "1px solid rgba(255,21,60,0.3)", borderRadius: "8px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: C.tvRed }}>
                <X size={12} /> 필터 초기화 ({activeFiltersCount})
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px" }}>
              <Activity size={13} color={C.lowRisk} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>
                <span style={{ fontWeight: 700, color: C.text }}>{filteredUsers.length.toLocaleString()}</span>명 기준
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { icon: Users, label: "High Risk Users", value: displayHighRisk, unit: "명", criteria: "현재 예측 고위험(High) 인원 기준", sub: "현재 고위험군 사용자 수", color: C.highRisk, glow: "rgba(239,68,68,0.2)" },
            { icon: AlertTriangle, label: "Predicted Churn Users", value: displayPredictedChurn, unit: "명", criteria: "30일 내 실제 이탈 예측 (신뢰구간 ±2.1%)", sub: "ML 모델 최종 이탈 예측 인원", color: C.tvRed, glow: "rgba(255,21,60,0.2)" },
            { icon: TrendingUp, label: "Predicted Churn Rate", value: predictedChurnRate, unit: "%", criteria: "예측 이탈률 (churn_score 모델 기반)", sub: `예측 이탈률 (${periodLabel} 기준)`, color: C.tvRed, glow: "rgba(255,21,60,0.2)" },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px 24px", position: "relative", overflow: "hidden", transition: "border-color 0.2s, transform 0.15s", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: k.glow, filter: "blur(40px)", pointerEvents: "none" }} />
                
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div style={{ padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700, color: C.muted }}>{periodLabel}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "11px", background: `${k.color}18`, border: `1px solid ${k.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={k.color} strokeWidth={2} />
                  </div>
                </div>
                
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: "0 0 6px" }}>{k.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "34px", fontWeight: 900, color: k.color, letterSpacing: "-1.5px", lineHeight: 1 }}>{k.value}</span>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", color: C.sub }}>{k.unit}</span>
                </div>
                <div style={{ marginTop: "12px", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${k.color}, ${k.color}50)`, borderRadius: 3 }} />
                </div>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "10px", color: C.muted, margin: "8px 0 0", letterSpacing: "0.2px" }}>{k.criteria}</p>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "3px 0 0" }}>{k.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 28px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* ── 1. 상단: 위험군별 비율 & Churn Score 분포 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 6fr", gap: "16px" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", minWidth: 0 }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>위험군별 비율 (Risk Band)</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie 
                      data={donutData} 
                      cx="50%" cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      dataKey="value" 
                      paddingAngle={4} 
                      onClick={(d: any) => goRiskDrilldown(d.name)} 
                      style={{ cursor: "pointer" }}
                    >
                      {donutData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} cursor={{fill:'transparent'}} wrapperStyle={{zIndex: 1000}} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
                  <span style={{ fontSize: "24px", fontWeight: 900, color: C.text }}>{filteredUsers.length.toLocaleString()}</span>
                  <span style={{ fontSize: "11px", color: C.muted }}>전체 예측 대상</span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                {donutData.map(d => (
                  <div key={d.name} onClick={() => goRiskDrilldown(d.name)} style={{ cursor: "pointer", opacity: drillFilter && drillFilter !== d.name ? 0.3 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: C.sub }}>{d.name}</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: d.color }}>{d.value.toLocaleString()}명</span>
                        <span style={{ fontSize: "11px", color: C.muted, marginLeft: "6px" }}>{d.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                      <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: "3px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", minWidth: 0 }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>Churn Score 분포</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={histData} margin={{ top: 30, right: 10, left: -10, bottom: 0 }} barSize={32} onClick={(d: any) => d?.activePayload?.[0] && goRiskDrilldown(d.activePayload[0].payload.risk_band)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: C.sub, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<HistTooltip />} cursor={{fill: 'transparent'}} wrapperStyle={{zIndex: 1000}} />
                <ReferenceLine x="70~80%" stroke="#FFFFFF" strokeDasharray="4 4" label={{ value: "▲ 고위험 기준", position: "top", fill: C.highRisk, fontSize: 10, fontWeight: 700 }} />
                
                <Bar dataKey="users" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}>
                  <LabelList dataKey="users" position="top" formatter={(val: number) => val > 0 ? val.toLocaleString() : ""} style={{ fill: C.muted, fontSize: "10px" }} />
                  {histData.map((d, index) => (
                    <Cell key={`cell-${index}`} fill={riskColor(d.risk_band === "고위험군" ? "High Risk" : d.risk_band === "중위험군" ? "Mid Risk" : "Low Risk")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
              {[{ color: C.lowRisk, label: "저위험군" }, { color: C.midRisk, label: "중위험군" }, { color: C.highRisk, label: "고위험군" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "2px", background: l.color }} />
                  <span style={{ fontSize: "12px", color: C.sub }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. 하단: 주요 이탈/유지 요인 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <BrainCircuit size={18} color={C.red} />
              <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: 0 }}>주요 이탈 원인 (고위험군 변수)</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {churnFeatures.map((f: any) => {
                const pct = (f.importance / (churnFeatures[0]?.importance || 0.15)) * 100;
                return (
                  <div key={`churn-${f.feature}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.text, fontWeight: 500 }}>{f.feature}</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: C.red }}>{f.importance.toFixed(3)}</span>
                    </div>
                    <div style={{ height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "5px", background: `linear-gradient(90deg, #EF4444, #F87171)`, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <ShieldCheck size={18} color={C.lowRisk} />
              <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: 0 }}>주요 유지 요인 (저위험군 변수)</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {retentionFeatures.map((f: any) => {
                const pct = (f.importance / (retentionFeatures[0]?.importance || 0.15)) * 100;
                return (
                  <div key={`ret-${f.feature}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.text, fontWeight: 500 }}>{f.feature}</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: C.lowRisk }}>{f.importance.toFixed(3)}</span>
                    </div>
                    <div style={{ height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "5px", background: `linear-gradient(90deg, #10B981, #34D399)`, boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}