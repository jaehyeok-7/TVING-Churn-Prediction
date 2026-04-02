import React, { useMemo } from "react";
import { useSheetData } from "../../contexts/SheetDataContext";

const FEATURE_LABELS: Record<string, string> = {
  watch_hours: "시청 시간 및 패턴 감소",
  content_diversity_score: "콘텐츠 부족 / 편중",
  price_score: "구독 가격 부담",
  had_watch_delta_rebuilt: "최근 시청량 급감",
  days_since_last_watch: "장기 미접속 (접속일 경과)",
  completion_rate: "콘텐츠 완주율 하락",
  freq_smartphone: "모바일 이용 빈도 감소",
  freq_tv_set: "TV 이용 빈도 감소",
  search_engagement: "검색 후 시청 전환 실패"
};

const impactColor: Record<string, string> = {
  high: "#E30613",
  mid: "#FFB74D",
  low: "#6C63FF",
};

const impactLabel: Record<string, string> = {
  high: "HIGH",
  mid: "MID",
  low: "LOW",
};

function processChurnReasons(shapData: { feature: string; score: number }[], totalHighRiskUsers: number) {
  if (!shapData || shapData.length === 0) return [];

  const totalImpact = shapData.reduce((sum, row) => sum + row.score, 0);

  const processed = shapData
    .map((row) => {
      const impactValue = row.score; 
      const pct = totalImpact > 0 ? (impactValue / totalImpact) * 100 : 0;
      
      let impactLevel = "low";
      if (pct >= 20) impactLevel = "high";
      else if (pct >= 10) impactLevel = "mid";

      return {
        label: FEATURE_LABELS[row.feature] || row.feature,
        pct: Number(pct.toFixed(1)), 
        impact: impactLevel,
        count: Math.round(totalHighRiskUsers * (pct / 100)), 
        rawImpact: impactValue 
      };
    })
    .sort((a, b) => b.rawImpact - a.rawImpact) 
    .slice(0, 6); 

  return processed;
}

export function ChurnReasonsChart() {
  const { shapHigh, dashboardData, status } = useSheetData();

  const totalHighRiskUsers = dashboardData
    ? dashboardData.filter((d: any) => d.risk_band === "High Risk").length
    : 0;

  const reasons = useMemo(() => {
    return processChurnReasons(shapHigh || [], totalHighRiskUsers);
  }, [shapHigh, totalHighRiskUsers]);

  const top2Pct = reasons.length >= 2 ? (reasons[0].pct + reasons[1].pct).toFixed(0) : "0";
  const top2Labels = reasons.length >= 2 ? `${reasons[0].label} + ${reasons[1].label.split(' ')[0]}` : "데이터 부족";

  if (status === "loading" || reasons.length === 0) {
    return (
      <div style={{ background: "#222B44", border: "1px solid #2D3352", borderRadius: "12px", padding: "22px", textAlign: "center", color: "#B8BDD6", fontSize: "14px", height: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        데이터를 분석하고 있습니다...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#222B44",
        border: "1px solid #2D3352",
        borderRadius: "12px",
        padding: "22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "Pretendard, Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 4px 0",
            }}
          >
            주요 이탈 원인 분석
          </h3>
          <p
            style={{
              fontFamily: "Pretendard, Inter, sans-serif",
              fontSize: "12px",
              color: "#B8BDD6",
              margin: 0,
            }}
          >
            이탈 사유 설문 + 행동 데이터 분석 결합
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {Object.entries(impactLabel).map(([k, v]) => (
            <div
              key={k}
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                background: `${impactColor[k]}14`,
                border: `1px solid ${impactColor[k]}30`,
                fontFamily: "Inter, sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color: impactColor[k],
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reasons.map((r) => {
          const color = impactColor[r.impact] || "#6C63FF";
          return (
            <div key={r.label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div
                    style={{
                      width: "4px",
                      height: "14px",
                      borderRadius: "2px",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Pretendard, Inter, sans-serif",
                      fontSize: "12px",
                      color: "#FFFFFF",
                      fontWeight: 500,
                    }}
                  >
                    {r.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#B8BDD6",
                    }}
                  >
                    {r.count.toLocaleString()}명
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: color,
                      minWidth: "38px",
                      textAlign: "right",
                    }}
                  >
                    {r.pct}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${r.pct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                    borderRadius: "3px",
                    boxShadow: `0 0 8px ${color}50`,
                    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "10px 14px",
          background: "rgba(227,6,19,0.08)",
          border: "1px solid rgba(227,6,19,0.2)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(227,6,19,0.14)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(227,6,19,0.08)")}
      >
        <span
          style={{
            fontFamily: "Pretendard, Inter, sans-serif",
            fontSize: "12px",
            color: "#B8BDD6",
          }}
        >
          💡 {top2Labels}이(가) 전체 이탈의 <strong style={{ color: "#FFFFFF" }}>{top2Pct}%</strong> 차지
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "#FF153C",
          }}
        >
          개입 전략 보기 →
        </span>
      </div>
    </div>
  );
}