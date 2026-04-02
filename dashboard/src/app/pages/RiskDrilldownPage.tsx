import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { ArrowLeft, Users, Clock, MousePointerClick, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  tvRed: "#FF153C", purple: "#6C63FF", green: "#00D2A0", orange: "#FFB74D",
  highRisk: "#EF4444", midRisk: "#F59E0B", lowRisk: "#22C55E",
};

// ── 영문 label을 한글로 변경 ──
const BAND_META = {
  high: { label: "고위험군", original: "High Risk", color: C.highRisk, glow: "rgba(239,68,68,0.2)", icon: "🔴", score: "churn_score ≥ 0.7", action: "즉각 개입 필요" },
  mid:  { label: "중위험군", original: "Mid Risk",  color: C.midRisk,  glow: "rgba(245,158,11,0.2)", icon: "🟡", score: "0.4 ≤ churn_score < 0.7", action: "관찰 + 재참여 유도" },
  low:  { label: "저위험군", original: "Low Risk",  color: C.lowRisk,  glow: "rgba(34,197,94,0.2)",  icon: "🟢", score: "churn_score < 0.4", action: "정기 관리" },
};

const featureLabelMap: Record<string, string> = {
  "watch_hours": "전체 시청량 감소",
  "content_diversity_score": "콘텐츠 다양성 부족",
  "days_since_last_watch": "최근 미접속(일)",
  "had_watch_delta_rebuilt": "최근 시청 급감",
  "price_score": "가격 민감도 상승",
  "freq_smartphone": "모바일 의존도",
  "completion_rate": "완주율 하락",
  "search_engagement": "검색 참여 부족",
  "freq_tv_set": "TV 이용 패턴",
  "had_core_watch_history_rebuilt": "핵심 시청 부재"
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1C2333", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 3px" }}>{label}</p>
      {/* 4,056명 형태로 표기 */}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: C.tvRed, margin: 0 }}>
        {payload[0].value.toLocaleString()}명
      </p>
    </div>
  );
};

function scoreColor(s: number): string {
  if (s >= 0.8) return C.highRisk;
  if (s >= 0.7) return C.midRisk;
  return "#FFE66D";
}

export function RiskDrilldownPage() {
  const { band = "high" } = useParams<{ band: string }>();
  const navigate = useNavigate();
  const meta = BAND_META[band as keyof typeof BAND_META] ?? BAND_META.high;

  const { users: allRealUsers, shapHigh, shapMid, shapLow } = useSheetData();

  const users = useMemo(() =>
    allRealUsers
      .filter(u => u.risk_band === meta.original) // 데이터 필터링은 기존 영문 유지
      .sort((a, b) => b.churn_score - a.churn_score),
    [allRealUsers, meta.original]
  );

  const avgScore      = users.length ? (users.reduce((s, u) => s + u.churn_score, 0) / users.length).toFixed(2) : "0.00";
  const avgWatch      = users.length ? Math.round(users.reduce((s, u) => s + u.watch_time, 0) / users.length) : 0;
  const avgCompletion = users.length
    ? Math.round(users.filter(u => u.completion_rate != null).reduce((s, u) => s + (u.completion_rate ?? 0), 0) / users.length * 100)
    : 0;
  const activeDayUsers = users.filter(u => u.last_active_days !== null);
  const avgActiveDays = activeDayUsers.length
    ? Math.round(activeDayUsers.reduce((s, u) => s + (u.last_active_days as number), 0) / activeDayUsers.length)
    : 0;

  const deviceDist = ["Mobile","TV","Web","Tablet"].map(d => ({
    device: d,
    count: users.filter(u => u.device === d).length,
  })).filter(d => d.count > 0);

  const watchBins = [
    { label: "0~5시간",   count: users.filter(u => u.watch_time < 5).length  },
    { label: "5~15시간",  count: users.filter(u => u.watch_time >= 5 && u.watch_time < 15).length },
    { label: "15~30시간", count: users.filter(u => u.watch_time >= 15 && u.watch_time < 30).length},
    { label: "30시간+",   count: users.filter(u => u.watch_time >= 30).length  },
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
          {meta.icon} {meta.label} 상세보기
        </span>
      </div>

      {/* ── Header card ── */}
      <div style={{ background: C.card, border: `1px solid ${meta.color}30`, borderRadius: "12px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: meta.glow, filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "28px" }}>{meta.icon}</span>
              <div>
                <h2 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "22px", fontWeight: 900, color: meta.color, margin: 0, letterSpacing: "-0.5px" }}>{meta.label}</h2>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: "3px 0 0" }}>{meta.score}</p>
              </div>
            </div>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.sub, margin: 0 }}>
              권장 대응: <strong style={{ color: meta.color }}>{meta.action}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "48px", fontWeight: 900, color: meta.color, lineHeight: 1, letterSpacing: "-2px" }}>{users.length.toLocaleString()}</div>
            <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.sub }}>해당 위험군 사용자 수</div>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {[
          { icon: Users,            label: "평균 Churn Score", value: avgScore,                unit: "",   color: meta.color   },
          { icon: Clock,            label: "평균 시청 시간",    value: `${avgWatch}`,           unit: "시간", color: C.purple     },
          { icon: MousePointerClick,label: "평균 비활성 기간",  value: `${avgActiveDays}`,      unit: "일", color: C.orange     },
          { icon: TrendingDown,     label: "평균 완료율",       value: `${avgCompletion}`,      unit: "%",  color: C.green      },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${k.color}18`, border: `1px solid ${k.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={k.color} />
              </div>
              <div>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 4px" }}>{k.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 800, color: k.color, letterSpacing: "-0.5px" }}>{k.value}</span>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub }}>{k.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px" }}>
        
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>디바이스 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deviceDist} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
              <XAxis dataKey="device" tick={{ fill: C.sub, fontSize: 11, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={meta.color} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>시청 시간 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={watchBins} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {watchBins.map((_, i) => <Cell key={`watch-${i}`} fill={i === 0 ? meta.color : C.purple} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>
              {band === 'low' ? '잔류 유지 핵심 요인' : '이탈 발생 핵심 요인'}
            </h3>
            <span style={{ fontSize: "10px", padding: "2px 6px", background: `${meta.color}15`, color: meta.color, borderRadius: "4px", fontWeight: 600 }}>SHAP Local</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
            {(() => {
              const targetShapData = 
                band === 'high' ? shapHigh :
                band === 'mid' ? shapMid :
                shapLow;

              const maxVal = Math.max(...targetShapData.map(d => d.score), 0.001);

              return targetShapData.slice(0, 5).map((f, idx) => {
                const pct = (f.score / maxVal) * 100;
                const alpha = Math.round((1 - idx * 0.1) * 255).toString(16).padStart(2, "0");
                const labelName = featureLabelMap[f.feature] || f.feature;

                return (
                  <div key={f.feature}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.text, fontWeight: 500 }}>
                        {labelName}
                      </span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: meta.color }}>
                        {f.score.toFixed(3)}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#2A2A3A", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${meta.color}${alpha}, ${meta.color}80)`, borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* ── User table ── */}
      <div style={{ background: C.card, border: `1px solid ${meta.color}25`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>
            {meta.label} 전체 사용자 목록
          </h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>
            Churn Score 내림차순 · {users.length.toLocaleString()}명 (화면 성능을 위해 100명만 표시)
          </p>
        </div>
        <div style={{ overflowX: "auto", maxHeight: "500px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1, background: C.card }}>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["사용자 ID", "Churn Score", "Device", "Segment", "시청(시간)", "휴면(일)", "완료율", "추천 액션"].map(h => (
                  <th key={h} style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2px", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 100).map((u, i) => {
                const sc = scoreColor(u.churn_score);
                const actionMap = ["즉시 전화 상담", "맞춤 쿠폰 발송", "CS 매니저 연락", "할인 제안", "콘텐츠 큐레이션", "모니터링 유지"];
                return (
                  <tr
                    key={u.user_id}
                    style={{ borderBottom: i < Math.min(users.length, 100) - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text, fontWeight: 700 }}>{u.user_id}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${u.churn_score * 100}%`, height: "100%", background: sc, borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: sc }}>{u.churn_score.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.purple }}>{u.device}</span>
                    </td>
                    <td style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{u.segment}</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{u.watch_time.toLocaleString()}시간</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: u.last_active_days === null ? C.highRisk : (u.last_active_days ?? 0) >= 30 ? C.highRisk : (u.last_active_days ?? 0) >= 10 ? C.midRisk : C.sub }}>
                      {u.last_active_days === null ? "미접속" : `${u.last_active_days.toLocaleString()}일`}
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "44px", height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${((u.completion_rate ?? 0) * 100)}%`, height: "100%", background: C.purple, borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub }}>
                          {((u.completion_rate ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.green, fontWeight: 600, whiteSpace: "nowrap" }}>{actionMap[i % actionMap.length]}</td>
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