import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { usePeriodFilter } from "../../contexts/PeriodFilterContext";
import { useNavigate } from "react-router";
import { useSheetData } from "../../contexts/SheetDataContext";

const ICONS = [AlertTriangle, ShieldAlert, ShieldCheck];
const DESCS = ["즉시 개입 필요", "2주 내 캠페인", "모니터링 유지"];
const DRILLDOWN_KEYS = ["high", "mid", "low"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#222B44", border: `1px solid ${d.color}50`, borderRadius: "8px", padding: "10px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
      <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: d.color, margin: "0 0 3px 0" }}>{d.label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
        {d.count.toLocaleString()}명 ({d.pct}%)
      </p>
    </div>
  );
};

export function RiskDistribution() {
  const ctx = usePeriodFilter();
  const period   = ctx.period   ?? "30D";
  const isCustom = ctx.isCustom ?? false;
  const navigate = useNavigate();

  const { kpi, status } = useSheetData();

  const riskData = useMemo(() => {
    if (!kpi || kpi.total === 0) return [];
    const totalCount = kpi.highRiskCount + kpi.midRiskCount + kpi.lowRiskCount;
    if (totalCount === 0) return [];

    return [
      { label: "고위험", count: kpi.highRiskCount, pct: ((kpi.highRiskCount / totalCount) * 100).toFixed(1), color: "#E30613" },
      { label: "중위험", count: kpi.midRiskCount,  pct: ((kpi.midRiskCount  / totalCount) * 100).toFixed(1), color: "#FFB74D" },
      { label: "저위험", count: kpi.lowRiskCount,  pct: ((kpi.lowRiskCount  / totalCount) * 100).toFixed(1), color: "#00D2A0" },
    ];
  }, [kpi]);

  const total = kpi?.total || 0;

  if (status === "loading" || riskData.length === 0) {
    return (
      <div style={{
        background: "#222B44", border: "1px solid #353F66", borderRadius: "12px",
        padding: "18px", display: "flex", flexDirection: "column",
        height: "350px", justifyContent: "center", alignItems: "center",
        minWidth: 0,  // ✅ 핵심 추가
      }}>
        <span style={{ color: "#B8BDD6", fontSize: "14px" }}>데이터를 분석 중입니다...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: "#222B44", border: "1px solid #353F66", borderRadius: "12px",
      padding: "18px",           // ← 22px → 18px (여백 축소)
      display: "flex", flexDirection: "column",
      height: "100%",
      minWidth: 0,               // ✅ 핵심: grid fr 비율대로 줄어들게 허용
      overflow: "hidden",        // ✅ 내부 콘텐츠가 넘치지 않게
    }}>

      {/* 헤더 */}
      <div style={{ marginBottom: "12px" }}>  {/* ← 18px → 12px */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 3px 0" }}>
              이탈 위험 세그먼트
            </h3>
            <p style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", color: "#B8BDD6", margin: 0 }}>
              총 {total.toLocaleString()}명 분류
            </p>
          </div>
          <span style={{
            padding: "3px 8px", borderRadius: "6px",
            background: isCustom ? "rgba(108,99,255,0.12)" : "rgba(255,21,60,0.1)",
            border: isCustom ? "1px solid rgba(108,99,255,0.35)" : "1px solid rgba(255,21,60,0.25)",
            fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700,
            color: isCustom ? "#6C63FF" : "#FF153C",
            whiteSpace: "nowrap",  // ✅ 배지 줄바꿈 방지
          }}>
            {isCustom ? "Custom" : period}
          </span>
        </div>
      </div>

      {/* Donut Chart */}
      <div style={{ position: "relative", height: "155px", marginBottom: "6px", minWidth: 0 }}>
        {/* ← height 180 → 155 */}
        <ResponsiveContainer width="100%" height={155}>
          <PieChart>
            <Pie
              data={riskData} cx="50%" cy="50%"
              innerRadius={46} outerRadius={66}   // ← 58/82 → 46/66 (도넛 축소)
              paddingAngle={3} dataKey="count"
              startAngle={90} endAngle={450}
              onClick={(_: any, idx: number) => navigate(`/drilldown/risk/${DRILLDOWN_KEYS[idx]}`)}
              style={{ cursor: "pointer" }}
            >
              {riskData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} stroke="none"
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>
            {total.toLocaleString()}
          </div>
          <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "9px", color: "#B8BDD6", marginTop: "3px" }}>
            위험 사용자
          </div>
        </div>
      </div>

      {/* Legend cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
        {/* ← gap 8→6, marginTop 10→8 */}
        {riskData.map((d, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={d.label}
              onClick={() => navigate(`/drilldown/risk/${DRILLDOWN_KEYS[i]}`)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px",                   // ← 10px 12px → 8px 10px
                background: `${d.color}10`,
                border: `1px solid ${d.color}30`,
                borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
                minWidth: 0,                            // ✅ 카드도 축소 허용
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background   = `${d.color}1E`;
                el.style.borderColor  = `${d.color}50`;
                el.style.transform    = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background   = `${d.color}10`;
                el.style.borderColor  = `${d.color}30`;
                el.style.transform    = "translateX(0)";
              }}
            >
              <Icon size={13} color={d.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>  {/* ✅ minWidth:0 텍스트 잘림 허용 */}
                <div style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#FFFFFF",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.label}
                </div>
                <div style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "10px", color: "#B8BDD6",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {DESCS[i]}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: d.color, lineHeight: 1 }}>
                  {d.pct}%
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#B8BDD6" }}>
                  {d.count.toLocaleString()}명
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
