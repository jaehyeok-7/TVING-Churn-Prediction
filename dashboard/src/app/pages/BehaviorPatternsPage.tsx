import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { usePeriodFilter } from "../contexts/PeriodFilterContext";
import { useSheetData } from "../contexts/SheetDataContext";
import { AnalysisPipeline } from "../components/dashboard/AnalysisPipeline";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  red: "#E30613", tvRed: "#FF153C", purple: "#6C63FF",
  green: "#00D2A0", orange: "#FFB74D",
};

/* ── Heatmap helpers ─────────────────────────────────────────────── */
const days  = ["월", "화", "수", "목", "금", "토", "일"];
const hours = Array.from({ length: 24 }, (_, i) => i);

// JS getDay() → 내부 dayIdx (0=월 ~ 6=일)
function jsDayToDayIdx(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1; // Sun(0)→6, Mon(1)→0 ... Sat(6)→5
}

function heatColor(v: number): string {
  if (v < 10) return "#16162A";
  if (v < 22) return "#1E1E45";
  if (v < 36) return "#302870";
  if (v < 50) return "#553090";
  if (v < 65) return "#8B3A80";
  if (v < 80) return "#C03850";
  return "#E30613";
}

/* ── Static structures ───────────────────────────────────────────── */
const CATEGORY_META = [
  { label: "영화",   color: C.purple },
  { label: "스포츠", color: C.orange },
  { label: "드라마", color: C.red    },
  { label: "다큐",   color: C.green  },
  { label: "예능",   color: "#FFE66D"},
];

const SESSION_META = [
  { label: "~10분",    color: C.red    },
  { label: "10~30분",  color: C.orange },
  { label: "30~60분",  color: C.purple },
  { label: "60~120분", color: C.green  },
  { label: "120분+",   color: "#00B8D9"},
];

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>
        {payload[0].value}{payload[0].name === "pct" ? "%" : "분"}
      </p>
    </div>
  );
};

export function BehaviorPatternsPage({ embedded = false }: { embedded?: boolean }) {
  const { activeRange, periodLabel, isCustom } = usePeriodFilter();
  const { watchLogs, status } = useSheetData();

  /* ── 기간 필터 적용 ── */
  const filteredLogs = useMemo(() => {
    if (!watchLogs || watchLogs.length === 0) return [];
    const start = new Date(activeRange?.start || "2000-01-01").getTime();
    const end   = new Date(activeRange?.end   || "2099-12-31").getTime() + 86400000;
    const inRange = watchLogs.filter((log: any) => {
      if (!log.timestamp) return false;
      const t = new Date(log.timestamp).getTime();
      if (isNaN(t)) return false;
      return t >= start && t <= end;
    });
    return inRange.length === 0 ? watchLogs : inRange;
  }, [watchLogs, activeRange]);

  /* ── ✅ 실데이터 기반 히트맵 계산 ── */
  const { heatMatrix, annotations } = useMemo(() => {
    // 7(요일) × 24(시간) 카운트 행렬 초기화
    const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    filteredLogs.forEach((log: any) => {
      const ts = log.timestamp;
      if (!ts) return;
      const date = new Date(ts);
      if (isNaN(date.getTime())) return;

      const dayIdx = jsDayToDayIdx(date.getDay());
      // CSV에 hour 컬럼이 이미 있으므로 우선 사용, 없으면 timestamp에서 추출
      const hour = log.hour !== undefined && log.hour !== ""
        ? Number(log.hour)
        : date.getHours();

      if (dayIdx >= 0 && dayIdx < 7 && hour >= 0 && hour < 24) {
        counts[dayIdx][hour]++;
      }
    });

    // 최대값 기준 0~100 정규화
    const maxCount = Math.max(...counts.flat(), 1);
    const matrix = counts.map(row =>
      row.map(v => Math.round((v / maxCount) * 100))
    );

    /* ── 동적 Annotations 계산 ── */
    // ① 전체 피크 셀
    let peakVal = 0, peakDay = 0, peakHour = 0;
    matrix.forEach((row, di) => {
      row.forEach((v, h) => {
        if (v > peakVal) { peakVal = v; peakDay = di; peakHour = h; }
      });
    });

    // ② 평일 야간 피크 (월~목 21~23시)
    let wdNightMax = 0, wdNightHour = 21;
    for (let h = 21; h <= 23; h++) {
      const avg = [0,1,2,3].reduce((s, di) => s + matrix[di][h], 0) / 4;
      if (avg > wdNightMax) { wdNightMax = avg; wdNightHour = h; }
    }

    // ③ 가장 한산한 시간대 (전체 평균 최소)
    let quietMin = Infinity, quietHour = 4;
    for (let h = 0; h < 24; h++) {
      const avg = matrix.reduce((s, row) => s + row[h], 0) / 7;
      if (avg < quietMin) { quietMin = avg; quietHour = h; }
    }

    // ④ 점심 피크 (12~14시 평균)
    const lunchAvg = [12,13,14].reduce((s, h) =>
      s + matrix.reduce((ss, row) => ss + row[h], 0) / 7, 0) / 3;

    return {
      heatMatrix: matrix,
      annotations: [
        {
          label: "피크 타임",
          value: `${days[peakDay]}-${days[Math.min(peakDay + 2, 6)]} ${peakHour}~${peakHour + 3}시`,
          color: C.red,
        },
        {
          label: "■ 평일 야간",
          value: `월-목 ${wdNightHour}~23시`,
          color: C.orange,
        },
        {
          label: "🌙 가장 한산",
          value: `평일 ${quietHour}~${quietHour + 3}시`,
          color: C.muted,
        },
        {
          label: "🌞 점심 피크",
          value: `평일 12~14시`,
          color: C.green,
        },
      ],
    };
  }, [filteredLogs]);

  /* ── 카테고리 / 세션 차트 계산 ── */
  const { categoryData, sessionData, shortSessionPct, maxMins } = useMemo(() => {
    const catData    = CATEGORY_META.map(m => ({ ...m, totalMins: 0, count: 0 }));
    const sessCounts = [0, 0, 0, 0, 0];

    filteredLogs.forEach((log: any) => {
      const mins  = Number(log.view_duration_minutes) || 0;
      const genre = log.genre_primary || "";
      const catName =
        ["Action","Comedy","Horror","Sci-Fi","Crime","Fantasy","War"].includes(genre) ? "영화" :
        ["Romance","Drama"].includes(genre)                                            ? "드라마" :
        genre === "Variety"                                                            ? "예능" :
        genre === "Sport"                                                              ? "스포츠" :
        ["Documentary","History"].includes(genre)                                      ? "다큐" : "기타";

      const catTarget = catData.find(c => c.label === catName);
      if (catTarget) { catTarget.totalMins += mins; catTarget.count += 1; }

      if      (mins < 10)  sessCounts[0]++;
      else if (mins < 30)  sessCounts[1]++;
      else if (mins < 60)  sessCounts[2]++;
      else if (mins < 120) sessCounts[3]++;
      else                 sessCounts[4]++;
    });

    const totalSessions    = sessCounts.reduce((a, b) => a + b, 0) || 1;
    const finalSessionData = SESSION_META.map((m, i) => ({
      ...m, pct: Math.round((sessCounts[i] / totalSessions) * 1000) / 10,
    }));
    const finalCatData = catData.map(c => ({
      label: c.label, color: c.color,
      mins: c.count > 0 ? Math.round(c.totalMins / c.count) : 0,
    }));
    const mxMins = Math.max(...finalCatData.map(c => c.mins), 1);

    return {
      categoryData:    finalCatData,
      sessionData:     finalSessionData,
      shortSessionPct: finalSessionData[0].pct,
      maxMins:         mxMins,
    };
  }, [filteredLogs]);

  return (
    <div style={
      embedded
        ? { display: "flex", flexDirection: "column", gap: "20px" }
        : { padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }
    }>
      {!embedded && <AnalysisPipeline />}

      {/* 로딩 상태 */}
      {status === "loading" && (
        <div style={{ padding: "16px", background: "rgba(108,99,255,0.1)", border: `1px solid ${C.purple}50`, borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={16} color={C.purple} />
          <span style={{ fontSize: "13px", color: C.text, fontFamily: "Pretendard, sans-serif" }}>
            구글 시트에서 수만 건의 시청 로그를 불러오는 중입니다... 잠시만 기다려주세요.
          </span>
        </div>
      )}

      {/* ── ✅ 실데이터 히트맵 ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
              시간대 × 요일별 시청 집중도 히트맵
            </h3>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>
              최근 {isCustom ? "커스텀 기간" : periodLabel} — 평일 야간 활성화 + 주말 고집중 복합 패턴
            </p>
          </div>
          {/* 컬러 범례 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted }}>낮음</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {["#16162A","#1E1E45","#302870","#553090","#8B3A80","#C03850","#E30613"].map(c => (
                <div key={c} style={{ width: "16px", height: "10px", borderRadius: "2px", background: c }} />
              ))}
            </div>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.muted }}>높음</span>
          </div>
        </div>

        {/* 히트맵 그리드 */}
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "700px" }}>
            {/* 시간 레이블 */}
            <div style={{ display: "flex", marginLeft: "36px", marginBottom: "4px" }}>
              {hours.map(h => (
                <div key={h} style={{
                  flex: 1, textAlign: "center",
                  fontFamily: "Inter, sans-serif", fontSize: "9px",
                  color: (h >= 20 && h <= 23) ? C.orange : C.muted,
                  fontWeight: (h >= 20 && h <= 23) ? 700 : 400,
                }}>
                  {h % 3 === 0 ? `${h}h` : ""}
                </div>
              ))}
            </div>

            {/* 요일 행 */}
            {days.map((day, di) => (
              <div key={day} style={{ display: "flex", alignItems: "center", marginBottom: "3px" }}>
                <div style={{
                  width: "30px", flexShrink: 0,
                  fontFamily: "Pretendard, sans-serif", fontSize: "11px",
                  color: di >= 5 ? C.orange : C.sub,   // 토(5)·일(6) 강조
                  fontWeight: di >= 5 ? 700 : 400,
                }}>
                  {day}
                </div>
                {hours.map(h => {
                  const v = heatMatrix[di]?.[h] ?? 0;
                  const isPeak = di >= 5 && h >= 20 && h <= 23; // 주말 저녁 피크
                  return (
                    <div
                      key={h}
                      title={`${day}요일 ${h}시 — 집중도 ${v}%`}
                      style={{
                        flex: 1, height: "22px",
                        background: heatColor(v),
                        borderRadius: "3px",
                        margin: "0 1px",
                        border: isPeak ? `1px solid ${C.orange}50` : "1px solid transparent",
                        cursor: "default",
                        transition: "transform 0.1s",
                        position: "relative",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "scaleY(1.3)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scaleY(1)")}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 동적 Annotations */}
        <div style={{ marginTop: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {annotations.map(a => (
            <div key={a.label} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 12px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
            }}>
              <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{a.label}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: a.color }}>{a.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 두 차트 한 줄, 높이 통일 ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "16px", alignItems: "stretch",
      }}>
        {/* 카테고리별 평균 시청 시간 */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: "12px", padding: "22px",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            콘텐츠 카테고리별 평균 시청 시간
          </h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: "0 0 20px" }}>
            완료된 세션 기준 (분)
          </p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            {categoryData.map(d => (
              <div key={`cat-${d.label}`}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.text, fontWeight: 500 }}>{d.label}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: d.color }}>{d.mins}분</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${(d.mins / maxMins) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${d.color}, ${d.color}70)`, borderRadius: "4px", boxShadow: `0 0 8px ${d.color}40`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 세션 길이 분포 */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: "12px", padding: "22px",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            세션 길이 분포
          </h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: "0 0 14px" }}>
            단일 접속 기준 시청 지속 시간
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.sub, fontSize: 11, fontFamily: "Pretendard, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="pct" name="pct" radius={[5, 5, 0, 0]}>
                  {sessionData.map(d => <Cell key={`session-cell-${d.label}`} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: "8px", flexShrink: 0 }}>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: 0 }}>
              💡 10분 이하 단기 세션이 <strong style={{ color: C.text }}>{shortSessionPct}%</strong> — 콘텐츠 첫 5분 Hook 강화 필요
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
