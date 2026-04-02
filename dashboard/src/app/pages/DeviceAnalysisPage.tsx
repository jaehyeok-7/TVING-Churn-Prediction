import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ArrowLeft, Smartphone, Monitor, Tv2, Tablet } from "lucide-react";
import { ALL_USERS, riskColor, scoreColor } from "../data/users";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  tvRed: "#FF153C", purple: "#6C63FF", green: "#00D2A0",
  orange: "#FFB74D", highRisk: "#EF4444", midRisk: "#F59E0B", lowRisk: "#22C55E",
};

const DEVICE_META: Record<string, { label: string; color: string; icon: any; dbKey: string }> = {
  mobile:  { label: "Mobile",  color: C.tvRed,   icon: Smartphone, dbKey: "Mobile"  },
  tv:      { label: "TV",      color: C.purple,  icon: Tv2,        dbKey: "TV"      },
  pc:      { label: "PC / Web",color: C.green,   icon: Monitor,    dbKey: "Web"     },
  tablet:  { label: "Tablet",  color: C.orange,  icon: Tablet,     dbKey: "Tablet"  },
};

const BTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1C2333", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 3px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: p.fill ?? p.color, margin: "2px 0" }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function DeviceAnalysisPage() {
  const { device = "mobile" } = useParams<{ device: string }>();
  const navigate = useNavigate();
  const meta = DEVICE_META[device] ?? DEVICE_META.mobile;
  const Icon = meta.icon;

  const users = useMemo(() =>
    ALL_USERS.filter(u => u.device === meta.dbKey),
    [meta.dbKey]
  );

  const allDevices = ["Mobile", "TV", "Web", "Tablet"];
  const avgScoreByDevice = allDevices.map(d => ({
    device: d === "Web" ? "PC/Web" : d,
    avgScore: Number((ALL_USERS.filter(u => u.device === d).reduce((s, u) => s + u.churn_score, 0) / (ALL_USERS.filter(u => u.device === d).length || 1)).toFixed(2)),
    count: ALL_USERS.filter(u => u.device === d).length,
  }));

  const riskDist = ["High Risk", "Mid Risk", "Low Risk"].map(rb => ({
    name: rb,
    value: users.filter(u => u.risk_band === rb).length,
    color: riskColor(rb),
  }));

  const avgWatch = Math.round(users.reduce((s, u) => s + u.watch_time, 0) / (users.length || 1));
  const avgScore = (users.reduce((s, u) => s + u.churn_score, 0) / (users.length || 1)).toFixed(2);
  const avgSearch = (users.reduce((s, u) => s + u.search_count, 0) / (users.length || 1)).toFixed(1);
  const avgClick = (users.reduce((s, u) => s + u.recommend_click, 0) / (users.length || 1)).toFixed(1);

  /* Radar data — compare this device vs overall avg */
  const overallAvg = {
    watch: Math.round(ALL_USERS.reduce((s, u) => s + u.watch_time, 0) / ALL_USERS.length),
    search: Number((ALL_USERS.reduce((s, u) => s + u.search_count, 0) / ALL_USERS.length).toFixed(1)),
    click: Number((ALL_USERS.reduce((s, u) => s + u.recommend_click, 0) / ALL_USERS.length).toFixed(1)),
    score: Number((ALL_USERS.reduce((s, u) => s + u.churn_score, 0) / ALL_USERS.length).toFixed(2)),
  };

  const radarMax = { watch: 300, search: 30, click: 25, score: 1 };
  const radarData = [
    { metric: "시청 시간",  device: Math.round(avgWatch / radarMax.watch * 100), overall: Math.round(overallAvg.watch / radarMax.watch * 100) },
    { metric: "검색 횟수",  device: Math.round(Number(avgSearch) / radarMax.search * 100), overall: Math.round(overallAvg.search / radarMax.search * 100) },
    { metric: "추천 클릭",  device: Math.round(Number(avgClick) / radarMax.click * 100), overall: Math.round(overallAvg.click / radarMax.click * 100) },
    { metric: "이탈 위험",  device: Math.round(Number(avgScore) / radarMax.score * 100), overall: Math.round(overallAvg.score / radarMax.score * 100) },
  ];

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => navigate("/churn-risk")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: C.sub, fontFamily: "Pretendard, sans-serif", fontSize: "12px", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = meta.color; (e.currentTarget as HTMLButtonElement).style.color = meta.color; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.sub; }}
        >
          <ArrowLeft size={13} /> 이탈 위험 분석
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.muted }}>/</span>
        <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", fontWeight: 600, color: meta.color }}>
          Device Analysis: {meta.label}
        </span>

        {/* Other device tabs */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {Object.entries(DEVICE_META).map(([key, m]) => (
            <button
              key={key}
              onClick={() => navigate(`/drilldown/device/${key}`)}
              style={{ padding: "5px 12px", borderRadius: "6px", border: `1px solid ${key === device ? m.color + "55" : C.border}`, background: key === device ? `${m.color}12` : "transparent", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: key === device ? m.color : C.muted, transition: "all 0.15s" }}
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
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>디바이스별 사용자 행동 분석 | {users.length}명 기준</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "평균 Churn Score", value: avgScore,        color: C.highRisk },
            { label: "평균 시청 시간",   value: `${avgWatch}분`, color: meta.color  },
            { label: "총 사용자 수",     value: `${users.length}명`, color: C.purple },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 900, color: m.color, letterSpacing: "-0.5px" }}>{m.value}</div>
              <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.muted }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

        {/* Avg churn score by device (compare) */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 14px" }}>디바이스별 평균 Churn Score</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={avgScoreByDevice} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
              <XAxis dataKey="device" tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: C.sub, fontSize: 9, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<BTooltip />} />
              <Bar dataKey="avgScore" name="Avg Score" radius={[4, 4, 0, 0]}>
                {avgScoreByDevice.map((d, i) => (
                  <Cell key={`device-${d.device}`} fill={d.device === (meta.label === "PC / Web" ? "PC/Web" : meta.label) ? meta.color : C.muted} fillOpacity={d.device === (meta.label === "PC / Web" ? "PC/Web" : meta.label) ? 1 : 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution for this device */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 14px" }}>Risk 분포</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {riskDist.map(r => {
              const pct = users.length ? Math.round(r.value / users.length * 100) : 0;
              return (
                <div key={r.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: r.color, fontWeight: 600 }}>{r.name}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: r.color }}>{r.value}</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: "7px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: r.color, borderRadius: "4px", opacity: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { label: "평균 검색 횟수",  value: avgSearch  },
                { label: "평균 추천 클릭", value: avgClick   },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{m.label}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: meta.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>행동 패턴 비교</h3>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted, margin: "0 0 8px" }}>vs 전체 평균</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: C.sub, fontSize: 10, fontFamily: "Pretendard, sans-serif" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name={meta.label} dataKey="device" stroke={meta.color} fill={meta.color} fillOpacity={0.25} />
              <Radar name="전체 평균"  dataKey="overall" stroke={C.purple} fill={C.purple} fillOpacity={0.12} strokeDasharray="4 2" />
              <Tooltip content={<BTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            {[{ color: meta.color, label: meta.label }, { color: C.purple, label: "전체 평균" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.sub }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── User table ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>{meta.label} 사용자 목록</h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>Churn Score 내림차순 · {users.length}명</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "660px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["user_id", "churn_score", "risk_band", "watch_time", "search_count", "recommend_click", "segment"].map(h => (
                  <th key={h} style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.7px", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.sort((a, b) => b.churn_score - a.churn_score).map((u, i) => {
                const sc = scoreColor(u.churn_score);
                const rc = riskColor(u.risk_band);
                return (
                  <tr
                    key={u.user_id}
                    style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text, fontWeight: 700 }}>{u.user_id}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "55px", height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${u.churn_score * 100}%`, height: "100%", background: sc }} />
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: sc }}>{u.churn_score.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", background: `${rc}12`, border: `1px solid ${rc}30`, fontFamily: "Pretendard, sans-serif", fontSize: "11px", fontWeight: 700, color: rc }}>{u.risk_band}</span>
                    </td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{u.watch_time}분</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{u.search_count}</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{u.recommend_click}</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{u.segment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
}