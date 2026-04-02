import React, { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { usePeriodFilter } from "../../contexts/PeriodFilterContext";
import { useSheetData } from "../../contexts/SheetDataContext";

// ✅ Sparkline: 너비를 가변적으로 사용하도록 수정
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  
  // H는 고정하되, W는 부모 컨테이너의 100%를 따라가도록 설정
  const H = 48;
  const W = 160; // 기본 비율용 (viewBox에서 조절)

  const pts  = values.map(
    (v, i) =>
      `${(i / (values.length - 1)) * W},${
        H - ((v - min) / range) * (H * 0.8) // 상단 여유 살짝 부여
      }`
  );
  const line = pts.join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const id   = color.replace("#", "sp");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`} // ✅ viewBox를 사용하여 가로로 길게 확장 가능하게 함
      preserveAspectRatio="none" // ✅ 너비에 맞춰 늘어나도록 설정
      style={{ display: "block", width: "100%", height: `${H}px`, overflow: "visible" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACCENT = ["#E30613", "#FFB74D", "#6C63FF", "#00D2A0"];
const GLOW   = ["rgba(227,6,19,0.15)", "rgba(255,183,77,0.15)", "rgba(108,99,255,0.15)", "rgba(0,210,160,0.15)"];
const LABELS = ["월간 이탈율", "이탈 위험 사용자", "평균 구독 기간", "개입 성공률"];
const UNITS  = ["%", "명", "개월", "%"];

const T = {
  card:   "#222B44",
  border: "#2D3352",
  sub:    "#B8BDD6",
  muted:  "#68718F",
};

export function KPIRow() {
  const { period } = usePeriodFilter();
  const { kpi, status } = useSheetData();

  const items = useMemo(() => {
    // 실제 데이터가 없을 경우를 대비한 기본값 (이미지 데이터 기반)
    const churnValue = kpi?.churnRate ? parseFloat(kpi.churnRate) : 29.8;
    const riskValue  = kpi?.highRiskCount || 2730;

    return [
      { value: churnValue.toFixed(1), delta: "+0.2%p", dir: "up", sub: "목표치(3.5%) 대비 초과", spark: [25, 27, 26, 28, 29, 28.5, churnValue] },
      { value: riskValue.toLocaleString(), delta: "+124명", dir: "up", sub: "고위험군 분류 사용자", spark: [2200, 2400, 2300, 2500, 2600, 2550, riskValue] },
      { value: "14.5", delta: "-0.8개월", dir: "down", sub: "전체 사용자 기준 평균", spark: [15.5, 15.2, 15.0, 14.8, 14.7, 14.6, 14.5] },
      { value: "67.4", delta: "+2.4%p", dir: "up", sub: "최근 30일 실행 캠페인 기준", spark: [62, 63, 61, 65, 66, 65.5, 67.4] },
    ];
  }, [kpi]);

  if (status === "loading") return null; // 로딩 처리는 기존과 동일하게 유지 가능

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
      {items.map((item, idx) => {
        const isGood = item.dir === "up" ? idx === 3 : idx !== 3;
        const dColor = isGood ? "#00D2A0" : "#E30613";
        const Icon = item.dir === "up" ? TrendingUp : TrendingDown;
        const color = ACCENT[idx];

        return (
          <div
            key={LABELS[idx]}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: "12px",
              padding: "20px 20px 16px 20px", // 하단 패딩 살짝 조정
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Glow */}
            <div style={{ position: "absolute", top: "-20px", right: "-10px", width: "80px", height: "80px", background: GLOW[idx], filter: "blur(30px)", pointerEvents: "none" }} />

            {/* Header: Label + Badges (가로 한 줄) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", color: T.sub, fontWeight: 500 }}>{LABELS[idx]}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "20px", background: `${dColor}14`, border: `1px solid ${dColor}25` }}>
                  <Icon size={10} color={dColor} strokeWidth={3} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: dColor }}>{item.delta}</span>
                </div>
                <div style={{ padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: T.muted }}>{period || "90D"}</span>
                </div>
              </div>
            </div>

            {/* Value */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#FFF", letterSpacing: "-1px" }}>{item.value}</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color }}>{UNITS[idx]}</span>
            </div>
            <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px", marginBottom: "16px" }}>{item.sub}</p>

            {/* ✅ Sparkline Section: 가로 전체를 채우도록 확장 */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", // 바와 그래프 사이 간격
              borderTop: `1px solid ${T.border}`, 
              paddingTop: "16px",
              marginTop: "auto" // 카드의 가장 하단으로 밀착
            }}>
              {/* 왼쪽 포인트 바 */}
              <div style={{ 
                flexShrink: 0, 
                width: "3px", 
                height: "36px", 
                borderRadius: "2px", 
                background: `linear-gradient(to top, ${color}, ${color}30)` 
              }} />
              
              {/* 그래프 영역: flex: 1을 주어 남은 공간 전체 차지 */}
              <div style={{ flex: 1, overflow: "visible" }}>
                <Sparkline values={item.spark} color={color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}