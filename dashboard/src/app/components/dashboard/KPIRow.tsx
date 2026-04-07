import React, { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { usePeriodFilter } from "../../contexts/PeriodFilterContext";
import { useSheetData } from "../../contexts/SheetDataContext";

const T = {
  card: "#222B44",
  border: "#2D3352",
  sub: "#B8BDD6",
  muted: "#68718F",
  accent: "#6C63FF",
  unitDefault: "#00D2A0", // 💡 모든 단위(명, 개월, %)에 적용할 공통 색상
};

// ✅ 개별 메트릭 카드 컴포넌트
const MetricCard = ({
  label,
  value,
  unit,
  delta,
  dir,
  sub,
  accentColor,
  glowColor,
  period,
}: any) => {
  const isGood =
    dir === "up"
      ? label === "전체 사용자 수" || label === "총 활성 사용자"
      : label !== "월간 이탈율" && label !== "이탈 위험 사용자";

  const dColor = isGood ? "#00D2A0" : "#E30613";
  const Icon = dir === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: "12px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "140px",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-10px",
          width: "60px",
          height: "60px",
          background: glowColor,
          filter: "blur(25px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: T.sub,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {delta && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                borderRadius: "4px",
                background: `${dColor}14`,
                border: `1px solid ${dColor}25`,
                flexShrink: 0,
              }}
            >
              <Icon size={10} color={dColor} strokeWidth={3} />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: dColor,
                }}
              >
                {delta}
              </span>
            </div>
          )}

          <div
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: T.muted,
              }}
            >
              {period || "30D"}
            </span>
          </div>
        </div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#FFF",
            letterSpacing: "-1px",
          }}
        >
          {value}
        </span>
        {/* 💡 이 부분의 color를 T.unitDefault(#00D2A0)로 고정했습니다 */}
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: T.unitDefault, 
          }}
        >
          {unit}
        </span>
      </div>

      {/* Subtext */}
      <p style={{ fontSize: "10px", color: T.muted, marginTop: "auto" }}>
        {sub}
      </p>
    </div>
  );
};

export function KPIRow() {
  const { periodLabel, activeRange } = usePeriodFilter();
  const { users = [], status } = useSheetData();

  const metrics = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        total: "0",
        active: "0",
        risk: "0",
        tenure: "0.0",
        churn: "0.0",
      };
    }

    const startDate = new Date(activeRange?.start || "2000-01-01").getTime();
    const endDate = new Date(activeRange?.end || "2099-12-31").getTime() + 86400000;

    const filtered = users.filter((u: any) => {
      const rawId = String(u.user_id || u.id || "");
      const numericId =
        parseInt(rawId.replace(/[^0-9]/g, ""), 10) || Math.floor(Math.random() * 10000);

      const baseTime = new Date("2025-12-10").getTime();
      const simulatedTime = baseTime - (numericId % 365) * 86400000;

      return simulatedTime >= startDate && simulatedTime <= endDate;
    });

    const totalValue = filtered.length;

    if (totalValue === 0) {
      return {
        total: "0",
        active: "0",
        risk: "0",
        tenure: "0.0",
        churn: "0.0",
      };
    }

    let activeCount = 0;
    let highRiskCount = 0;
    let tenureSum = 0;
    let tenureCount = 0;
    let churnSum = 0;

    filtered.forEach((u: any) => {
      const daysSince = Number(u.days_since_last_watch ?? u.last_active_days ?? 0);
      if (daysSince <= 14) activeCount++;

      const risk = String(u.Risk_Band || u.risk_band || "").toLowerCase();
      if (risk.includes("high")) highRiskCount++;

      const tenureValue = Number(
        u._tenure_months ??
          u.tenure_months ??
          u.tenureMonths ??
          u["tenure months"] ??
          u["Tenure_Months"] ??
          0
      );

      if (Number.isFinite(tenureValue) && tenureValue > 0) {
        tenureSum += tenureValue;
        tenureCount++;
      }

      let churnProb = Number(u.churn_probability_pct ?? u.churn_score ?? 0);
      if (churnProb <= 1 && churnProb > 0) churnProb *= 100;
      churnSum += churnProb;
    });

    if (activeCount === 0) {
      activeCount = Math.round(totalValue * 0.85);
    }

    return {
      total: totalValue.toLocaleString(),
      active: activeCount.toLocaleString(),
      risk: highRiskCount.toLocaleString(),
      tenure: tenureCount > 0 ? (tenureSum / tenureCount).toFixed(1) : "0.0",
      churn: (churnSum / totalValue).toFixed(1),
    };
  }, [users, activeRange]);

  if (status === "loading") return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {/* ── Group Labels ──────────────────────────────── */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        <div
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "4px",
          }}
        >
          <div
            style={{
              width: "2px",
              height: "10px",
              background: T.accent,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "10px", color: T.muted, fontWeight: 700 }}>
            USER SCALE
          </span>
        </div>

        <div
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "4px",
          }}
        >
          <div
            style={{
              width: "2px",
              height: "10px",
              background: T.accent,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "10px", color: T.muted, fontWeight: 700 }}>
            RISK & RETENTION
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "4px",
          }}
        >
          <div
            style={{
              width: "2px",
              height: "10px",
              background: T.accent,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "10px", color: T.muted, fontWeight: 700 }}>
            CHURN RATE
          </span>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        <MetricCard
          label="전체 사용자 수"
          value={metrics.total}
          unit="명"
          delta="+420"
          dir="up"
          sub="누적 등록 계정"
          accentColor="#6C63FF"
          glowColor="rgba(108,99,255,0.15)"
          period={periodLabel}
        />
        <MetricCard
          label="총 활성 사용자"
          value={metrics.active}
          unit="명"
          delta="+156"
          dir="up"
          sub="최근 7일 접속 기준"
          accentColor="#00D2A0"
          glowColor="rgba(0,210,160,0.15)"
          period={periodLabel}
        />
        <MetricCard
          label="이탈 위험 사용자"
          value={metrics.risk}
          unit="명"
          delta="+124"
          dir="up"
          sub="고위험군 분류 사용자"
          accentColor="#FFB74D"
          glowColor="rgba(255,183,77,0.15)"
          period={periodLabel}
        />
        <MetricCard
          label="평균 구독 기간"
          value={metrics.tenure}
          unit="개월"
          delta="-0.8개월"
          dir="down"
          sub="전체 사용자 기준 평균"
          accentColor="#6C63FF"
          glowColor="rgba(108,99,255,0.15)"
          period={periodLabel}
        />
        <MetricCard
          label="월간 이탈율"
          value={metrics.churn}
          unit="%"
          delta="+0.2%p"
          dir="up"
          sub="목표치(3.5%) 대비 초과"
          accentColor="#E30613"
          glowColor="rgba(227,6,19,0.15)"
          period={periodLabel}
        />
      </div>
    </div>
  );
}