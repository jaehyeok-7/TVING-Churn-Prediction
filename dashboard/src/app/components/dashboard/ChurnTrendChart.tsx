import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from "recharts";
import { usePeriodFilter, PERIOD_TREND } from "../../contexts/PeriodFilterContext";
import type { Period } from "../../contexts/PeriodFilterContext";

const PERIOD_META = {
  "7D":  { unit: "%",  domain: [0.5, 1.1] as [number,number], tickFmt: (v: number) => `${v.toFixed(1)}%`, currentBadge: (v: string) => `현재 일일 이탈율 ${v}% — 목표치 대비 +0.05%p 초과`, forecast: "3일 후 0.85% 도달 예상 | 즉각적인 개입으로 하락 전환 가능" },
  "30D": { unit: "%",  domain: [2, 6]     as [number,number], tickFmt: (v: number) => `${v}%`,            currentBadge: (v: string) => `현재 이탈율 ${v}% — 목표치 대비 +0.7%p 초과`,   forecast: "개입 미실시 시 6월 이탈율 4.8% 도달 예상 | 전략 탭에서 실행하세요" },
  "90D": { unit: "%",  domain: [2, 6]     as [number,number], tickFmt: (v: number) => `${v}%`,            currentBadge: (v: string) => `3개월 이탈율 ${v}% — 지속 상승 추세`,             forecast: "6월까지 4.8% 예상 | 세그먼트별 타겟 개입 시급" },
  "6M":  { unit: "%",  domain: [2, 6]     as [number,number], tickFmt: (v: number) => `${v}%`,            currentBadge: (v: string) => `6개월 평균 이탈율 ${v}% — 전 대비 +1.4%p`,   forecast: "2분기 말 4.4% 수렴 예측 | 장기 개입 전략 필요" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#222B44", border: "1px solid #353F66", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", color: "#C4CAE0", margin: "0 0 8px 0" }}>{label}</p>
      {payload.map((p: any, i: number) => {
        if (p.value == null) return null;
        const nameMap: Record<string, string> = { actual: "실제 이탈율", predicted: "예측 이탈율" };
        const colorMap: Record<string, string> = { actual: "#E30613", predicted: "#6C63FF" };
        return (
          <div key={`${p.dataKey}-${i}`} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colorMap[p.dataKey] ?? "#fff" }} />
            <span style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px", color: "#B8BDD6" }}>{nameMap[p.dataKey] ?? p.dataKey}:</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{p.value}%</span>
          </div>
        );
      })}
    </div>
  );
};

export function ChurnTrendChart() {
  const ctx = usePeriodFilter();
  const period    = ctx.period    ?? "30D";
  const isCustom  = ctx.isCustom  ?? false;
  const trendData = ctx.trendData ?? PERIOD_TREND["30D"];
  const meta = isCustom
    ? { unit: "%", domain: [0, 8] as [number,number], tickFmt: (v: number) => `${v}%`, currentBadge: (v: string) => `커스텀 기간 이탈율 ${v}% — ML 예측 기준`, forecast: "선택 기간 기준 ML 예측 트렌드 | 개입 전략 탭에서 실행하세요" }
    : PERIOD_META[period];

  // 현재 값: trendData에서 actual이 있는 마지막 값
  const currentActual = [...trendData].reverse().find(d => d.actual != null)?.actual ?? 0;

  return (
    <div style={{ background: "#222B44", border: "1px solid #353F66", borderRadius: "12px", padding: "22px 22px 16px", minWidth: 0, overflow: "hidden", height:"100%" }}>

      {/* Card header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <h3 style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px 0" }}>
            이탈율 트렌드 및 예측
          </h3>
          <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px", color: "#B8BDD6", margin: 0 }}>
            {isCustom ? "커스텀 기간 실제 이탈율 + ML 예측" :
             period === "7D" ? "일별 실제 이탈율 + ML 예측 (3일 ahead)" :
             period === "30D" ? "주별 실제 이탈율 + ML 예측 (3주 ahead)" :
             "월별 실제 이탈율 + ML 예측 (3개월 ahead)"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {[
            { label: "실제 이탈율", color: "#E30613", dashed: false },
            { label: "예측",        color: "#6C63FF", dashed: true  },
            { label: "목표치",      color: "#00D2A0", dashed: true  },
          ].map(leg => (
            <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="18" height="8">
                {leg.dashed
                  ? <line x1="0" y1="4" x2="18" y2="4" stroke={leg.color} strokeWidth="2" strokeDasharray="4 2" />
                  : <line x1="0" y1="4" x2="18" y2="4" stroke={leg.color} strokeWidth="2" />}
              </svg>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#B8BDD6" }}>{leg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(227,6,19,0.12)", border: "1px solid rgba(227,6,19,0.25)", borderRadius: "6px", marginBottom: "16px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E30613" }} />
        <span style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#E30613" }}>
          {meta.currentBadge(String(currentActual))}
        </span>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 220, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradActual-${period}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E30613" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E30613" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id={`gradPred-${period}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#B8BDD6", fontSize: 11, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: "#2D3352" }} tickLine={false} />
            <YAxis domain={meta.domain} tickFormatter={meta.tickFmt} tick={{ fill: "#B8BDD6", fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={trendData[0]?.target ?? 3.5} stroke="#00D2A0" strokeDasharray="5 3" strokeWidth={1.5} strokeOpacity={0.6} />
            <Line type="monotone" dataKey="actual"    stroke="#E30613" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#E30613", stroke: "#fff", strokeWidth: 1.5 }} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="#6C63FF" strokeWidth={2}   strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: "#6C63FF", stroke: "#fff", strokeWidth: 1.5 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast note */}
      <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(108,99,255,0.09)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "4px", height: "36px", borderRadius: "2px", background: "linear-gradient(to bottom, #6C63FF, #6C63FF40)", flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#FFFFFF", margin: "0 0 2px 0" }}>
            예측: {meta.forecast.split("|")[0]}
          </p>
          <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", color: "#B8BDD6", margin: 0 }}>
            {meta.forecast.split("|")[1]?.trim()}
          </p>
        </div>
      </div>
    </div>
  );
}