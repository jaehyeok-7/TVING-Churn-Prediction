import React, { useMemo, useState } from "react";
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
    <div
      style={{
        background: "#1E2640",
        border: `2px solid ${d.color}`,
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
        pointerEvents: "none",
        minWidth: "130px",
        zIndex: 10000,
      }}
    >
      <p
        style={{
          fontFamily: "Pretendard, sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          color: d.color,
          margin: "0 0 4px 0",
        }}
      >
        {d.label}군
      </p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 800,
          color: "#FFFFFF",
          margin: 0,
        }}
      >
        {d.count.toLocaleString()}명
      </p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          color: "#B8BDD6",
          margin: "2px 0 0 0",
        }}
      >
        비중: {d.pct}%
      </p>
    </div>
  );
};

export function RiskDistribution() {
  const { periodLabel, isCustom, activeRange } = usePeriodFilter();
  const navigate = useNavigate();
  const { users = [], status } = useSheetData();

  const [activeIndex, setActiveIndex] = useState(-1);

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

  const riskData = useMemo(() => {
    let highCount = 0;
    let midCount = 0;
    let lowCount = 0;

    filteredUsers.forEach((u: any) => {
      const risk = String(u.Risk_Band || u.risk_band || "").toLowerCase();
      if (risk.includes("high")) highCount++;
      else if (risk.includes("mid") || risk.includes("medium")) midCount++;
      else lowCount++;
    });

    const totalCount = highCount + midCount + lowCount;
    if (totalCount === 0) return [];

    return [
      {
        label: "고위험",
        count: highCount,
        pct: ((highCount / totalCount) * 100).toFixed(1),
        color: "#E30613",
      },
      {
        label: "중위험",
        count: midCount,
        pct: ((midCount / totalCount) * 100).toFixed(1),
        color: "#FFB74D",
      },
      {
        label: "저위험",
        count: lowCount,
        pct: ((lowCount / totalCount) * 100).toFixed(1),
        color: "#00D2A0",
      },
    ];
  }, [filteredUsers]);

  const total = filteredUsers.length;

  if (status === "loading" || total === 0) {
    return (
      <div
        style={{
          background: "#222B44",
          height: "350px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "12px",
        }}
      >
        <span style={{ color: "#B8BDD6" }}>
          데이터를 로딩 중입니다...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#222B44",
        border: "1px solid #353F66",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        overflow: "visible",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 3px 0",
              }}
            >
              이탈 위험 세그먼트
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "#B8BDD6",
                margin: 0,
              }}
            >
              총 {total.toLocaleString()}명 분류
            </p>
          </div>
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(255,21,60,0.1)",
              border: "1px solid rgba(255,21,60,0.25)",
              fontSize: "10px",
              fontWeight: 700,
              color: "#FF153C",
            }}
          >
            {periodLabel}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", height: "155px", marginBottom: "6px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={66}
              paddingAngle={3}
              dataKey="count"
              startAngle={90}
              endAngle={450}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={(_, idx) =>
                navigate(`/drilldown/risk/${DRILLDOWN_KEYS[idx]}`)
              }
              style={{ outline: "none", cursor: "pointer" }}
            >
              {riskData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter:
                      index === activeIndex
                        ? `drop-shadow(0 0 10px ${entry.color}AA)`
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              offset={35}
              wrapperStyle={{
                pointerEvents: "none",
                zIndex: 1000,
                transform: "translate(-5px, -10px)",
              }}
              allowEscapeViewBox={{ x: true, y: true}}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* ── 중앙 텍스트 수정 완료 ────────────────── */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            {total.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "#B8BDD6",
              marginTop: "3px",
            }}
          >
            전체 사용자
          </div>
        </div>
      </div>

      {/* 리스트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
        {riskData.map((d, i) => {
          const Icon = ICONS[i];
          const isSelected = i === activeIndex;

          return (
            <div
              key={d.label}
              onClick={() =>
                navigate(`/drilldown/risk/${DRILLDOWN_KEYS[i]}`)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: isSelected
                  ? `${d.color}25`
                  : `${d.color}10`,
                border: `1px solid ${d.color}${isSelected ? "80" : "30"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <Icon size={13} color={d.color} strokeWidth={2.5} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  {d.label}
                </div>
                <div style={{ fontSize: "10px", color: "#B8BDD6" }}>
                  {DESCS[i]}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: d.color,
                  }}
                >
                  {d.pct}%
                </div>
                <div style={{ fontSize: "10px", color: "#B8BDD6" }}>
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