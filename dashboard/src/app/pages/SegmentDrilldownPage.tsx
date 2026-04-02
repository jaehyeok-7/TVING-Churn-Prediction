import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { ArrowLeft, Flame, User, TrendingDown } from "lucide-react";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  tvRed: "#FF153C", purple: "#6C63FF", green: "#00D2A0",
  orange: "#FFB74D", highRisk: "#EF4444", midRisk: "#F59E0B", lowRisk: "#22C55E",
};

const riskColor = (rb: string) => rb.includes("High") ? C.highRisk : rb.includes("Mid") ? C.midRisk : C.lowRisk;
const scoreColor = (score: number) => score >= 0.7 ? C.highRisk : score >= 0.4 ? C.midRisk : C.lowRisk;

type SegKey = "heavy" | "regular" | "low";

// ★ 수정: Regular User의 dbKey를 "Medium_Viewer"에서 실제 데이터인 "Medium"으로 변경했습니다.
const SEG_META: Record<SegKey, { label: string; dbKey: string; color: string; icon: any; desc: string }> = {
  heavy:   { label: "Heavy User",    dbKey: "Heavy_Viewer", color: C.purple,  icon: Flame,       desc: "고빈도·고시청 파워 사용자" },
  regular: { label: "Regular User",  dbKey: "Medium",       color: C.orange,  icon: User,        desc: "표준 사용 패턴 일반 사용자" },
  low:     { label: "Low Activity",  dbKey: "Light_Viewer", color: C.highRisk,icon: TrendingDown, desc: "이탈 고위험 저활동 사용자" },
};

const SegTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1C2333", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 3px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: p.fill, margin: "2px 0" }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function SegmentDrilldownPage() {
  const { segment = "heavy" } = useParams<{ segment: string }>();
  const navigate = useNavigate();
  const meta = SEG_META[segment as SegKey] ?? SEG_META.heavy;
  const Icon = meta.icon;

  // ★ 수정: Context에서 내보내는 진짜 변수명인 'users'를 받아옵니다.
  const { users: allUsers = [], status } = useSheetData() as any;

  // ★ 수정: SheetDataContext에서 이미 파싱해둔 데이터를 안전하게 매핑합니다.
  const filteredUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    return allUsers
      .filter((u: any) => u.segment_volume === meta.dbKey)
      .map((u: any) => {
        const diversity = Number(u.content_diversity_score) || 0;
        const search = Number(u.search_engagement) || 0;

        return {
          user_id: u.user_id,
          churn_score: u.churn_score, // Context에서 이미 0~1로 정규화됨
          risk_band: u.risk_band, // 이미 "High Risk" 형태로 매핑되어 있음
          watch_time: Math.round((Number(u.watch_time) || 0) * 60), // 시간 -> 분 단위 변환
          search_count: search,
          diversity_score: diversity,
          completion_rate: Number(u.completion_rate) || 0,
          recommend_click: Math.round((diversity * 1.2) + (search * 0.8)), 
          device: u.device // Context에서 이미 단일 디바이스로 묶여 있음
        };
      })
      .sort((a: any, b: any) => b.churn_score - a.churn_score); 
  }, [allUsers, meta.dbKey]);

  // KPI 계산
  const avgScore      = (filteredUsers.reduce((s: number, u: any) => s + u.churn_score, 0) / (filteredUsers.length || 1)).toFixed(2);
  const avgWatch      = Math.round(filteredUsers.reduce((s: number, u: any) => s + u.watch_time, 0) / (filteredUsers.length || 1));
  const avgSearch     = (filteredUsers.reduce((s: number, u: any) => s + u.search_count, 0) / (filteredUsers.length || 1)).toFixed(1);
  const avgClick      = (filteredUsers.reduce((s: number, u: any) => s + u.recommend_click, 0) / (filteredUsers.length || 1)).toFixed(1);
  const avgDiversity  = (filteredUsers.reduce((s: number, u: any) => s + u.diversity_score, 0) / (filteredUsers.length || 1)).toFixed(1);
  const avgCompletion = (filteredUsers.reduce((s: number, u: any) => s + u.completion_rate, 0) / (filteredUsers.length || 1) * 100).toFixed(1);

  const riskDist = ["High Risk", "Mid Risk", "Low Risk"].map(rb => ({
    name: rb.replace(" Risk", ""),
    value: filteredUsers.filter((u: any) => u.risk_band === rb).length,
    color: riskColor(rb),
  }));

  const deviceDist = ["Mobile", "TV", "Web", "Tablet"].map(d => ({
    device: d,
    count: filteredUsers.filter((u: any) => u.device === d).length,
    color: d === "Mobile" ? C.tvRed : d === "TV" ? C.purple : d === "Web" ? C.green : C.orange,
  })).filter(d => d.count > 0);

  // 타 세그먼트 비교용 데이터 추출 
  const segComparison = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];
    return Object.entries(SEG_META).map(([key, m]) => {
      const seg = allUsers.filter((u: any) => u.segment_volume === m.dbKey);
      return {
        segment: m.label === "Low Activity" ? "Low Activity" : m.label.replace(" User", ""),
        avgScore: Number((seg.reduce((s: number, u: any) => s + u.churn_score, 0) / (seg.length || 1)).toFixed(2)),
        color: m.color,
        isActive: key === segment,
      };
    });
  }, [allUsers, segment]);

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => navigate("/churn-risk")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: C.sub, fontFamily: "Pretendard, sans-serif", fontSize: "12px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = meta.color; (e.currentTarget as HTMLButtonElement).style.color = meta.color; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.sub; }}
        >
          <ArrowLeft size={13} /> 이탈 위험 분석
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.muted }}>/</span>
        <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", fontWeight: 600, color: meta.color }}>
          Segment: {meta.label}
        </span>

        {/* Segment tabs */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {(Object.entries(SEG_META) as [SegKey, typeof SEG_META[SegKey]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => navigate(`/drilldown/segment/${key}`)}
              style={{ padding: "5px 12px", borderRadius: "6px", border: `1px solid ${key === segment ? m.color + "55" : C.border}`, background: key === segment ? `${m.color}12` : "transparent", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: key === segment ? m.color : C.muted, transition: "all 0.15s" }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero card ── */}
      <div style={{ background: C.card, border: `1px solid ${meta.color}30`, borderRadius: "12px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 160, height: 160, borderRadius: "50%", background: `${meta.color}15`, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 60, height: 60, borderRadius: "15px", background: `${meta.color}18`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={28} color={meta.color} />
          </div>
          <div>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 900, color: meta.color, margin: "0 0 4px", letterSpacing: "-0.5px" }}>{meta.label}</h2>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>{meta.desc} | {filteredUsers.length.toLocaleString()}명 기준</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {[
            { label: "평균 Churn Score", value: avgScore,        color: C.highRisk },
            { label: "평균 시청 시간",   value: `${avgWatch}분`, color: meta.color  },
            { label: "총 사용자 수",     value: `${filteredUsers.length}명`, color: C.purple },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 900, color: m.color, letterSpacing: "-0.5px" }}>{m.value}</div>
              <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.muted }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 3fr", gap: "16px" }}>

        {/* Segment comparison - churn score */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>세그먼트 비교 — Churn Score</h3>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted, margin: "0 0 14px" }}>각 세그먼트의 평균 이탈 예측 점수</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={segComparison} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={38}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
              <XAxis dataKey="segment" tick={{ fill: C.sub, fontSize: 10, fontFamily: "Pretendard, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: C.sub, fontSize: 9, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(1)} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="avgScore" name="Avg Churn Score" radius={[4, 4, 0, 0]}>
                {segComparison.map((d, i) => (
                  <Cell key={`seg-${d.segment ?? i}`} fill={d.color} fillOpacity={d.isActive ? 1 : 0.35} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 14px" }}>Risk 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskDist} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.sub, fontSize: 9, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 11, fontFamily: "Pretendard, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="value" name="Users" radius={[0, 4, 4, 0]}>
                {riskDist.map((d, i) => <Cell key={`risk-${d.name ?? i}`} fill={d.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Behavioral KPIs */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 14px" }}>행동 지표</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
            {[
              { label: "평균 시청 완료율", value: `${avgCompletion}%`, pct: Number(avgCompletion),          color: "#00B8D9"   },
              { label: "콘텐츠 다양성 지수",value: avgDiversity,      pct: Math.min(100, Number(avgDiversity) * 5), color: "#FFE66D" },
              { label: "평균 검색 횟수",  value: avgSearch,         pct: Number(avgSearch) / 30 * 100,   color: C.purple    },
              { label: "평균 추천 클릭",  value: avgClick,          pct: Number(avgClick) / 25 * 100,    color: C.green     },
              { label: "평균 Churn Score",value: avgScore,          pct: Number(avgScore) * 100,         color: C.highRisk  },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{m.label}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, m.pct)}%`, height: "100%", background: m.color, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Device dist & User Table ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
        
        {/* Device Distribution */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 14px" }}>디바이스 분포</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {deviceDist.map(d => {
              const pct = Math.round(d.count / filteredUsers.length * 100);
              return (
                <div key={d.device}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub }}>{d.device}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: d.color }}>{d.count}</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: d.color, borderRadius: "3px", opacity: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{meta.label} 사용자 목록</h3>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: 0 }}>{filteredUsers.length.toLocaleString()}명 · Churn Score 내림차순</p>
          </div>
          <div style={{ overflowX: "auto", maxHeight: "240px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead style={{ position: "sticky", top: 0, background: "#222B44", zIndex: 1 }}>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {["User ID", "Churn Score", "Risk", "Diversity", "Completion", "Device"].map(h => (
                    <th key={h} style={{ padding: "9px 16px", fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.7px", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any, i: number) => {
                  const sc = scoreColor(u.churn_score);
                  const rc = riskColor(u.risk_band);
                  return (
                    <tr
                      key={u.user_id}
                      style={{ borderBottom: i < filteredUsers.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 16px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text, fontWeight: 700 }}>{u.user_id}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${u.churn_score * 100}%`, height: "100%", background: sc }} />
                          </div>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: sc }}>{u.churn_score.toFixed(2)}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "2px 7px", borderRadius: "4px", background: `${rc}12`, border: `1px solid ${rc}30`, fontFamily: "Pretendard, sans-serif", fontSize: "10px", fontWeight: 700, color: rc }}>{u.risk_band.replace(" Risk", "")}</span>
                      </td>
                      <td style={{ padding: "10px 16px", fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub }}>
                        {u.diversity_score.toFixed(1)}
                      </td>
                      <td style={{ padding: "10px 16px", fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub }}>
                        {(u.completion_rate * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "2px 7px", borderRadius: "4px", background: "rgba(108,99,255,0.1)", fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.purple }}>{u.device}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
}