import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
  PieChart, Pie,
} from "recharts";
import {
  ChevronDown, AlertTriangle, TrendingUp, Users,
  ArrowRight, X, Activity,
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
  purple: "#6C63FF", orange: "#FF6B35",
};

/* ── 세그먼트 한글 별명 매핑 ────────────────────────────────────────── */
const SEGMENT_MAP: Record<string, string> = {
  "Power User": "정주행러",
  "Heavy User": "정주행러",
  "Regular User": "일상러",
  "Low Activity": "찍먹러"
};

/* ── Feature 한글명 매핑 ────────────────────────────────────────────── */
const FEATURE_NAMES: Record<string, string> = {
  days_since_last_watch:   "마지막 접속 경과일",
  watch_hours:             "총 시청 시간",
  completion_rate:         "콘텐츠 완료율",
  search_engagement:       "검색 참여도",
  content_diversity_score: "콘텐츠 다양성",
  freq_smartphone:         "스마트폰 접속 빈도",
  freq_tv_set:             "TV 접속 빈도",
  freq_tablet:             "태블릿 접속 빈도",
  freq_pc:                 "PC 접속 빈도",
  segment_volume:          "시청량 세그먼트",
  segment_explore:         "탐색 세그먼트",
  segment_taste:           "취향 세그먼트",
  churn_probability_pct:   "이탈 확률",
  price_score:             "가격 민감도",
  had_watch_delta_rebuilt: "최근 시청 급감",
  had_core_watch_history_rebuilt: "핵심 시청 부재"
};
const featName = (key: string) => FEATURE_NAMES[key] ?? key;

/* ── Tooltip components ─────────────────────────────────────────────── */
const HistTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const riskLabel = d.risk_band; 
  const colorKey = riskLabel === "고위험군" ? "High Risk" : riskLabel === "중위험군" ? "Mid Risk" : "Low Risk";

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
    <div style={{ background: "#1C2333", border: `1px solid ${d.color}40`, borderRadius: "8px", padding: "10px 14px" }}>
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
  const churnKPI   = ctx.churnKPI   ?? { predictedChurn: 3847, highRiskUsers: 3847, churnRate: "29.9", churnRateDelta: "+2.3%", highRiskDelta: "+312명" };
  const periodLabel = ctx.periodLabel ?? "30D";

  const sheet = useSheetData();
  const sourceUsers = sheet.status === "success" && sheet.users.length > 0 ? sheet.users : ALL_USERS;

  const [device,   setDevice]   = useState("전체 디바이스");
  const [segment,  setSegment]  = useState("전체 세그먼트");
  const [riskBand, setRiskBand] = useState("전체 Risk");

  // 필터링 로직 수정 (정주행러/일상러/찍먹러 매핑 반영)
  const filteredUsers = useMemo(() => sourceUsers.filter(u => {
    const devMatch  = device === "전체 디바이스" ? true : device === "PC" ? u.device === "Web" : u.device === device;
    
    // 세그먼트 매핑: 선택된 한글값이 데이터상의 영문값과 일치하는지 확인
    const segMatch  = segment === "전체 세그먼트" ? true : SEGMENT_MAP[u.segment] === segment;
    
    const bandMap: Record<string, string> = { "고위험군": "High Risk", "중위험군": "Mid Risk", "저위험군": "Low Risk" };
    const riskMatch = riskBand === "전체 Risk" ? true : u.risk_band === (bandMap[riskBand] ?? riskBand);
    
    return devMatch && segMatch && riskMatch;
  }), [sourceUsers, device, segment, riskBand]);

  const highRisk = filteredUsers.filter(u => u.risk_band === "High Risk");
  const midRisk  = filteredUsers.filter(u => u.risk_band === "Mid Risk");
  const lowRisk  = filteredUsers.filter(u => u.risk_band === "Low Risk");

  const activeHighRiskCount = sheet.status === "success" && riskBand === "전체 Risk" ? sheet.kpi.highRiskCount : highRisk.length;
  const activePredictedChurn = sheet.status === "success" && riskBand === "전체 Risk" ? sheet.kpi.predictedChurn : Math.round(highRisk.length * 0.85);

  const histBins = [
    { range: "0~10%", lo: 0, hi: 0.1, risk_band: "저위험군" },
    { range: "10~20%", lo: 0.1, hi: 0.2, risk_band: "저위험군" },
    { range: "20~30%", lo: 0.2, hi: 0.3, risk_band: "저위험군" },
    { range: "30~40%", lo: 0.3, hi: 0.4, risk_band: "저위험군" },
    { range: "40~50%", lo: 0.4, hi: 0.5, risk_band: "중위험군" },
    { range: "50~60%", lo: 0.5, hi: 0.6, risk_band: "중위험군" },
    { range: "60~70%", lo: 0.6, hi: 0.7, risk_band: "중위험군" },
    { range: "70~80%", lo: 0.7, hi: 0.8, risk_band: "고위험군" },
    { range: "80~90%", lo: 0.8, hi: 0.9, risk_band: "고위험군" },
    { range: "90~100%", lo: 0.9, hi: 1.01, risk_band: "고위험군" },
  ];
  const histData = histBins.map(b => ({
    ...b,
    users: filteredUsers.filter(u => u.churn_score >= b.lo && u.churn_score < b.hi).length,
  }));

  const donutData = [
    { name: "고위험군", value: highRisk.length, pct: filteredUsers.length ? Math.round(highRisk.length / filteredUsers.length * 100) : 0, color: C.highRisk },
    { name: "중위험군", value: midRisk.length,  pct: filteredUsers.length ? Math.round(midRisk.length  / filteredUsers.length * 100) : 0, color: C.midRisk  },
    { name: "저위험군", value: lowRisk.length,  pct: filteredUsers.length ? Math.round(lowRisk.length  / filteredUsers.length * 100) : 0, color: C.lowRisk  },
  ];

  const goRiskDrilldown = (band: string) => {
    const pathMap: Record<string, string> = { "고위험군": "high", "중위험군": "mid", "저위험군": "low", "High Risk": "high", "Mid Risk": "mid", "Low Risk": "low" };
    navigate(`/drilldown/risk/${pathMap[band] || "high"}`);
  };

  return (
    <div style={{ padding: "0", display: "flex", flexDirection: "column", background: C.bg, minHeight: "100vh" }}>

      {/* ── Global Filter Bar ── */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px 20px" }}>
          <FilterSelect label="디바이스" value={device} options={["전체 디바이스","Mobile","TV","PC","Tablet"]} onChange={setDevice} />
          
          {/* ★ 사용자 세그먼트 옵션 한글화 적용 ★ */}
          <FilterSelect 
            label="사용자 세그먼트" 
            value={segment} 
            options={["전체 세그먼트", "정주행러", "일상러", "찍먹러"]} 
            onChange={setSegment} 
          />
          
          <FilterSelect label="Risk Band" value={riskBand} options={["전체 Risk","고위험군","중위험군","저위험군"]} onChange={setRiskBand} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: C.sub }}><span style={{ fontWeight: 700, color: C.text }}>{filteredUsers.length.toLocaleString()}</span>명 기준</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { icon: Users, label: "고위험군 사용자", value: activeHighRiskCount.toLocaleString(), unit: "명", color: C.highRisk },
            { icon: AlertTriangle, label: "이탈 예측 사용자", value: activePredictedChurn.toLocaleString(), unit: "명", color: C.tvRed },
            { icon: TrendingUp, label: "예측 이탈률", value: churnKPI.churnRate, unit: "%", color: C.tvRed },
          ].map((k) => (
            <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px 24px" }}>
              <p style={{ fontSize: "12px", color: C.sub, marginBottom: "8px" }}>{k.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "32px", fontWeight: 900, color: k.color }}>{k.value}</span>
                <span style={{ fontSize: "14px", color: C.sub }}>{k.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 차트 영역 ── */}
      <div style={{ padding: "20px 28px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "16px" }}>
          
          {/* 도넛 차트 */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>위험군별 비율 (Risk Band)</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie 
                      data={donutData} 
                      cx="50%" cy="50%" 
                      innerRadius={65} 
                      outerRadius={90} 
                      dataKey="value" 
                      paddingAngle={4} 
                      onClick={(d: any) => goRiskDrilldown(d.name)} 
                      style={{ cursor: "pointer" }}
                    >
                      {donutData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: C.text }}>{filteredUsers.length.toLocaleString()}</span>
                  <span style={{ fontSize: "10px", color: C.muted }}>전체 예측 대상</span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                {donutData.map(d => (
                  <div key={d.name} onClick={() => goRiskDrilldown(d.name)} style={{ cursor: "pointer" }}>
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

          {/* Churn Score 분포 */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>Churn Score 분포</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={histData} margin={{ top: 30, right: 10, left: -10, bottom: 0 }} barSize={32} onClick={(d: any) => d?.activePayload?.[0] && goRiskDrilldown(d.activePayload[0].payload.risk_band)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: C.sub, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<HistTooltip />} />
                <ReferenceLine x="70~80%" stroke="#FFFFFF" strokeDasharray="4 4" label={{ value: "▲ 고위험 기준", position: "top", fill: C.highRisk, fontSize: 10, fontWeight: 700 }} />
                <Bar dataKey="users" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}>
                  <LabelList dataKey="users" position="top" formatter={(val: number) => val.toLocaleString()} style={{ fill: C.muted, fontSize: "10px" }} />
                  {histData.map((d) => (
                    <Cell 
                      key={d.range} 
                      fill={riskColor(d.risk_band === "고위험군" ? "High Risk" : d.risk_band === "중위험군" ? "Mid Risk" : "Low Risk")} 
                    />
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
      </div>
    </div>
  );
}