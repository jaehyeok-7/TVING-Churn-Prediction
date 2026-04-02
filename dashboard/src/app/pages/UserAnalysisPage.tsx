import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, Zap, AlertTriangle } from "lucide-react";
import { usePeriodFilter } from "../contexts/PeriodFilterContext";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  red: "#E30613", tvRed: "#FF153C", purple: "#6C63FF",
  green: "#00D2A0", orange: "#FFB74D",
};

type RawUser = Record<string, any>;
type WatchLog = Record<string, any>;

const SEGMENT_META = [
  {
    icon: Zap,
    label: "정주행러",
    englishLabel: "Power User",
    dbKey: "Heavy",
    definition: "고빈도·고시청 파워 사용자",
    color: C.green,
    glow: "rgba(0,210,160,0.18)",
    tag: "핵심 유지 대상",
    tagColor: C.green,
  },
  {
    icon: Users,
    label: "일상러",
    englishLabel: "Regular User",
    dbKey: "Medium",
    definition: "표준 사용 패턴 일반 사용자",
    color: C.purple,
    glow: "rgba(108,99,255,0.18)",
    tag: "참여 강화 대상",
    tagColor: C.purple,
  },
  {
    icon: AlertTriangle,
    label: "찍먹러",
    englishLabel: "Light User",
    dbKey: "Light",
    definition: "활동량이 낮은 사용자군",
    color: C.orange,
    glow: "rgba(255,183,77,0.18)",
    tag: "관심 회복 대상",
    tagColor: C.red,
  },
] as const;

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function uniqueBy<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  arr.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, item);
  });
  return [...map.values()];
}

function getUserId(row: Record<string, any>): string {
  return String(row.user_id ?? row.userid ?? row.userId ?? "").trim();
}

function getTimestamp(log: WatchLog): string | null {
  return log.timestamp ?? log.event_time ?? log.watch_time ?? null;
}

function normalizeSegment(value: unknown): "Heavy" | "Medium" | "Light" | "Unknown" {
  const s = String(value || "").toLowerCase();
  if (s.includes("heavy")) return "Heavy";
  if (s.includes("medium") || s.includes("regular")) return "Medium";
  if (s.includes("light") || s.includes("low")) return "Light";
  return "Unknown";
}

function normalizeRiskBand(value: unknown): "High" | "Mid" | "Low" | "Unknown" {
  const s = String(value || "").toLowerCase();
  if (s.includes("high")) return "High";
  if (s.includes("mid") || s.includes("medium")) return "Mid";
  if (s.includes("low")) return "Low";
  return "Unknown";
}

function getRiskColor(label: "낮음" | "보통" | "높음") {
  if (label === "높음") return C.red;
  if (label === "보통") return C.orange;
  return C.green;
}

function getRiskBg(label: "낮음" | "보통" | "높음") {
  if (label === "높음") return "rgba(227,6,19,0.1)";
  if (label === "보통") return "rgba(255,183,77,0.1)";
  return "rgba(0,210,160,0.1)";
}

function getUserCompletionPercent(user: RawUser): number {
  const raw = toNumber(user.completion_rate ?? user.avg_completion_rate);
  if (raw <= 0) return 0;
  if (raw <= 1) return Math.round(raw * 100);
  return Math.round(raw);
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: C.purple, margin: 0 }}>
        {payload[0].value.toLocaleString()}명
      </p>
    </div>
  );
};

export function UserAnalysisPage({ embedded = false }: { embedded?: boolean }) {
  const { periodLabel, isCustom } = usePeriodFilter();
  const { users: dashboardData = [], watchLogs = [] } = useSheetData() as { users?: RawUser[]; watchLogs?: WatchLog[]; };

  const safeUsers = Array.isArray(dashboardData) ? dashboardData : [];
  const safeWatchLogs = Array.isArray(watchLogs) ? watchLogs : [];

  const normalizedUsers = useMemo(() => {
    return safeUsers.map((u) => {
      const userId = getUserId(u);
      if (!userId) return null;
      const watchHours = toNumber(u.watch_time ?? u.watch_hours ?? 0);
      const churnPct = toNumber(u.churn_probability_pct ?? 0);
      return {
        ...u,
        userId,
        normalizedSegment: normalizeSegment(u.segment_volume),
        normalizedRiskBand: normalizeRiskBand(u.Risk_Band ?? u.risk_band),
        watchHours,
        completionPct: getUserCompletionPercent(u),
        churnPct,
      };
    }).filter(Boolean) as any[];
  }, [safeUsers]);

  const dowData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    safeWatchLogs.forEach((log) => {
      const ts = getTimestamp(log);
      if (!ts) return;
      const d = new Date(ts).getDay();
      if (!Number.isNaN(d)) counts[d] += 1;
    });
    return [
      { day: "월", count: counts[1], isPeak: false },
      { day: "화", count: counts[2], isPeak: false },
      { day: "수", count: counts[3], isPeak: false },
      { day: "목", count: counts[4], isPeak: false },
      { day: "금", count: counts[5], isPeak: false },
      { day: "토", count: counts[6], isPeak: true },
      { day: "일", count: counts[0], isPeak: true },
    ];
  }, [safeWatchLogs]);

  const { segments, tableRows, totalUsers } = useMemo(() => {
    if (normalizedUsers.length === 0) return { segments: [], tableRows: [], totalUsers: 0 };
    const uniqueUsers = uniqueBy(normalizedUsers, (u) => u.userId);
    const total = uniqueUsers.length;

    const calculatedSegments = SEGMENT_META.map((meta) => {
      const usersInSeg = uniqueUsers.filter((u) => u.normalizedSegment === meta.dbKey);
      const count = usersInSeg.length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const watchList = usersInSeg.map((u) => u.watchHours).filter((v) => v > 0);
      const avgWatch = mean(watchList).toFixed(1);
      const medianWatch = median(watchList).toFixed(1);
      const churnList = usersInSeg.map((u) => u.churnPct);
      const avgChurnPct = Math.round(mean(churnList));
      const riskBands = usersInSeg.map((u) => u.normalizedRiskBand);
      const highRiskCount = riskBands.filter((r) => r === "High").length;
      const midRiskCount  = riskBands.filter((r) => r === "Mid").length;
      const lowRiskCount  = riskBands.filter((r) => r === "Low").length;
      const dominantRiskBand = highRiskCount >= midRiskCount && highRiskCount >= lowRiskCount ? "High" : midRiskCount >= lowRiskCount ? "Mid" : "Low";
      const riskLabel = avgChurnPct >= 70 ? "높음" : avgChurnPct >= 40 ? "보통" : "낮음";
      const completionList = usersInSeg.map((u) => u.completionPct);
      const avgCompletion = Math.round(mean(completionList.filter((v) => v > 0)));
      const over20PctCount = completionList.filter((v) => v >= 20).length;
      const over20PctRatio = count > 0 ? Math.round((over20PctCount / count) * 100) : 0;

      return {
        card:  { count: count.toLocaleString(), pct: `${pct}%` },
        table: { count: count.toLocaleString(), watchTime: `${avgWatch}시간`, medianWatchTime: `${medianWatch}시간`, completion: avgCompletion, over20PctRatio, churn: avgChurnPct, riskLabel, highRiskPct: count > 0 ? Math.round((highRiskCount / count) * 100) : 0, dominantRiskBand },
      };
    });

    return { segments: calculatedSegments.map((s) => s.card), tableRows: calculatedSegments.map((s) => s.table), totalUsers: total };
  }, [normalizedUsers]);

  return (
    <div style={{ padding: embedded ? "0" : "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <section>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.2px", color: C.muted, marginBottom: "12px" }}>USER SEGMENTS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {SEGMENT_META.map((s, idx) => {
            const Icon = s.icon;
            const seg = segments[idx];
            return (
              <div key={`seg-${idx}`} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: s.glow, filter: "blur(30px)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "10px", background: `${s.color}18`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={s.color} strokeWidth={2} />
                  </div>
                  <span style={{ padding: "3px 9px", borderRadius: "20px", background: `${s.tagColor}14`, border: `1px solid ${s.tagColor}30`, fontFamily: "Pretendard, sans-serif", fontSize: "10px", fontWeight: 700, color: s.tagColor }}>{s.tag}</span>
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text }}>{s.label}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.muted, marginLeft: "6px" }}>{s.englishLabel}</span>
                </div>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 14px" }}>{s.definition}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "34px", fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{seg?.pct ?? "0%"}</span>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", color: C.sub }}>{seg?.count ?? "0"}명</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: seg?.pct ?? "0%", height: "100%", background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`, borderRadius: 3, boxShadow: `0 0 8px ${s.color}50` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px" }}>
        <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>요일별 누적 시청 세션 수</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dowData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: C.sub, fontSize: 12, fontFamily: "Pretendard, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
              {dowData.map((d, idx) => (<Cell key={`dow-${idx}`} fill={d.isPeak ? C.orange : C.purple} fillOpacity={d.isPeak ? 1 : 0.65} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: 0 }}>세그먼트별 상세 지표</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["세그먼트", "인원수", "평균 시청시간", "중앙값 시청시간", "콘텐츠 완주율", "이탈 위험도"].map((h) => (
                <th key={h} style={{ padding: "12px 24px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", fontWeight: 600, color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEGMENT_META.map((meta, i) => {
              const row = tableRows[i];
              const riskColor = getRiskColor(row?.riskLabel ?? "낮음");
              const riskBg = getRiskBg(row?.riskLabel ?? "낮음");
              return (
                <tr key={`tbl-${i}`} style={{ borderBottom: i < SEGMENT_META.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <td style={{ padding: "16px 24px", fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.text, fontWeight: 600 }}>{meta.label}</td>
                  <td style={{ padding: "16px 24px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.sub }}>{row?.count ?? "0"}명</td>
                  <td style={{ padding: "16px 24px", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text }}>{row?.watchTime ?? "0시간"}</td>
                  <td style={{ padding: "16px 24px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.sub }}>{row?.medianWatchTime ?? "0시간"}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, maxWidth: "100px", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${row?.completion ?? 0}%`, height: "100%", background: meta.color, borderRadius: "3px" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text }}>{row?.completion ?? 0}%</span>
                        <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "10px", color: C.muted }}>20%↑: {row?.over20PctRatio ?? 0}%</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "20px", background: riskBg, border: `1px solid ${riskColor}30`, fontSize: "12px", fontWeight: 600, color: riskColor }}>
                      {row?.riskLabel === "낮음" ? "🟢" : row?.riskLabel === "보통" ? "🟡" : "🔴"} {row?.riskLabel ?? "-"} ({row?.churn ?? 0}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}