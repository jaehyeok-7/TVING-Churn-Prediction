import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Clock,
  AlertTriangle,
  Play,
} from "lucide-react";
import { usePeriodFilter } from "../contexts/PeriodFilterContext";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44",
  border: "#353F66",
  text: "#FFFFFF",
  sub: "#C4CAE0",
  muted: "#7880A4",
  red: "#E30613",
  tvRed: "#FF153C",
  purple: "#6C63FF",
  green: "#00D2A0",
  orange: "#FFB74D",
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${d.color}40`,
        borderRadius: "10px",
        padding: "8px 12px",
        boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        minWidth: 120,
      }}
    >
      <p
        style={{
          fontFamily: "Pretendard, sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          color: d.color,
          margin: "0 0 4px",
        }}
      >
        {d.name}
      </p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 800,
          color: C.text,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {d.pct}%
      </p>
    </div>
  );
};

export function ServiceStatusPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { activeRange } = usePeriodFilter();
  const { users = [], status } = useSheetData();

  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    const startDate = new Date(activeRange?.start || "2000-01-01").getTime();
    const endDate = new Date(activeRange?.end || "2099-12-31").getTime() + 86400000;

    return users.filter((u: any) => {
      const rawId = String(u.user_id || u.id || "");
      const numericId = parseInt(rawId.replace(/[^0-9]/g, ""), 10) || Math.floor(Math.random() * 10000);
      const baseTime = new Date("2025-12-10").getTime();
      const simulatedTime = baseTime - (numericId % 365) * 86400000; 
      return simulatedTime >= startDate && simulatedTime <= endDate;
    });
  }, [users, activeRange]);

  const totalUsers = filteredUsers.length;

  const {
    avgWatchTime,
    avgChurn,
    avgCompletion,
    avgLastActive,
    avgDivScore,
  } = useMemo(() => {
    if (totalUsers === 0) {
      return {
        avgWatchTime: "0",
        avgChurn: "0",
        avgCompletion: "0",
        avgLastActive: "0",
        avgDivScore: "0",
      };
    }

    let watchSum = 0, churnSum = 0, compSum = 0, activeSum = 0, divSum = 0;

    filteredUsers.forEach((u: any) => {
      watchSum += Number(u.watch_time || u.watch_hours || 0);
      churnSum += Number(u.churn_probability_pct || 0);
      let comp = Number(u.completion_rate || 0);
      if (comp <= 1 && comp > 0) comp *= 100;
      compSum += comp;
      activeSum += u.last_active_days === 9999 || !u.last_active_days ? 30 : Number(u.last_active_days);
      divSum += Number(u.content_diversity_score || 0);
    });

    return {
      avgWatchTime: (watchSum / totalUsers).toFixed(1),
      avgChurn: (churnSum / totalUsers).toFixed(1),
      avgCompletion: (compSum / totalUsers).toFixed(1),
      avgLastActive: (activeSum / totalUsers).toFixed(1),
      avgDivScore: (divSum / totalUsers).toFixed(1),
    };
  }, [filteredUsers, totalUsers]);

  const KPI_DATA = [
    {
      label: "총 활성 사용자",
      value: totalUsers.toLocaleString(),
      unit: "명",
      delta: "+2.4%",
      deltaDir: "up",
      icon: Users,
      color: C.green,
      glow: "rgba(0,210,160,0.18)",
    },
    {
      label: "평균 시청 시간",
      value: avgWatchTime,
      unit: "시간",
      delta: "+0.5h",
      deltaDir: "up",
      icon: Clock,
      color: C.purple,
      glow: "rgba(108,99,255,0.18)",
    },
    {
      label: "평균 이탈 예측률",
      value: avgChurn,
      unit: "%",
      delta: "-1.2%p",
      deltaDir: "down",
      icon: AlertTriangle,
      color: C.red,
      glow: "rgba(227,6,19,0.18)",
    },
    {
      label: "평균 완주율",
      value: avgCompletion,
      unit: "%",
      delta: "+3.1%p",
      deltaDir: "up",
      icon: Play,
      color: C.orange,
      glow: "rgba(255,183,77,0.18)",
    },
  ];

  const segmentData = useMemo(() => {
    const counts = { Heavy: 0, Medium: 0, Light: 0 };
    filteredUsers.forEach((u: any) => {
      const seg = String(u.segment_volume || "").toLowerCase();
      if (seg.includes("heavy")) counts.Heavy++;
      else if (seg.includes("medium") || seg.includes("regular")) counts.Medium++;
      else counts.Light++;
    });

    return [
      { name: "정주행러 (Power)", count: counts.Heavy, pct: totalUsers ? Math.round((counts.Heavy / totalUsers) * 100) : 0, color: "#8B5CF6" },
      { name: "일상러 (Regular)", count: counts.Medium, pct: totalUsers ? Math.round((counts.Medium / totalUsers) * 100) : 0, color: "#3B82F6" },
      { name: "찍먹러 (Light)", count: counts.Light, pct: totalUsers ? Math.round((counts.Light / totalUsers) * 100) : 0, color: "#EC4899" },
    ].sort((a, b) => b.count - a.count);
  }, [filteredUsers, totalUsers]);

  const healthRows = [
    { label: "평균 미접속 경과일", current: `${avgLastActive}일`, target: "14일 이내", status: Number(avgLastActive) <= 14 ? "ok" : "warn" },
    { label: "평균 콘텐츠 완주율", current: `${avgCompletion}%`, target: "20% 이상", status: Number(avgCompletion) >= 20 ? "ok" : "warn" },
    { label: "콘텐츠 다양성 점수", current: `${avgDivScore}점`, target: "5.0점 이상", status: Number(avgDivScore) >= 5.0 ? "ok" : "warn" },
    { label: "전체 평균 이탈 예측률", current: `${avgChurn}%`, target: "30% 미만", status: Number(avgChurn) < 30 ? "ok" : "warn" },
  ];

  if (status === "loading" || totalUsers === 0) {
    return (
      <div style={{ padding: "28px", height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.sub }}>
        데이터를 분석 중입니다...
      </div>
    );
  }

  return (
    <div style={{ padding: embedded ? "0" : "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          const deltaColor = kpi.deltaDir === "up" ? C.green : C.red;

          return (
            <div
              key={kpi.label}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = kpi.color + "55")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: kpi.glow, filter: "blur(28px)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "9px", background: `${kpi.color}18`, border: `1px solid ${kpi.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color={kpi.color} strokeWidth={2} />
                </div>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0, fontWeight: 500 }}>
                  {kpi.label}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "26px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px", lineHeight: 1 }}>
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600, // 약간 더 굵게 조정
                      color: "#00D2A0", // 💡 단위를 숫자와 같은 흰색으로 수정
                    }}
                  >
                    {kpi.unit}
                  </span>
                )}
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "20px", background: `${deltaColor}15`, border: `1px solid ${deltaColor}30`, fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: deltaColor }}>
                {kpi.deltaDir === "up" ? "↑" : "↓"} {kpi.delta}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "14px", alignItems: "stretch" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px", position: "relative", overflow: "visible" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>주요 사용자 세그먼트 비중</h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 12px" }}>전체 {totalUsers.toLocaleString()}명 기준</p>

          <div style={{ position: "relative", height: 180, overflow: "visible" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={segmentData} cx="38%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={3} dataKey="pct" startAngle={90} endAngle={450}>
                  {segmentData.map((d, i) => (
                    <Cell key={`seg-${i}`} fill={d.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} cursor={false} offset={12} position={{ x: 210, y: 62 }} allowEscapeViewBox={{ x: true, y: true }} wrapperStyle={{ zIndex: 20, outline: "none", pointerEvents: "none" }} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ position: "absolute", top: "50%", left: "38%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{totalUsers.toLocaleString()}</div>
              <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "9px", color: C.sub, marginTop: 2 }}>전체 사용자</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {segmentData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.text, flex: 1 }}>{d.name}</span>
                <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: d.color, minWidth: 30, textAlign: "right" }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>서비스 건강 지표</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", flex: 1 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["지표 항목", "현재값", "목표값", "상태"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {healthRows.map((r, i) => {
                const isOk = r.status === "ok";
                const stColor = isOk ? C.green : C.orange;
                return (
                  <tr key={r.label} style={{ borderBottom: i < healthRows.length - 1 ? `1px solid ${C.border}` : "none" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 20px", fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.text, fontWeight: 500 }}>{r.label}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: isOk ? C.green : C.orange }}>{r.current}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{r.target}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", background: isOk ? "rgba(0,210,160,0.1)" : "rgba(255,183,77,0.1)", border: `1px solid ${isOk ? "rgba(0,210,160,0.25)" : "rgba(255,183,77,0.25)"}`, fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: stColor }}>
                        {isOk ? "✅ 정상" : "⚠️ 주의"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}