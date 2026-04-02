import { useNavigate, useLocation } from "react-router";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { label: "데이터 수집",  sub: "Data Overview",     path: "/service-status",    icon: "📡" },
  { label: "패턴 분석",    sub: "Behavior Analysis", path: "/behavior-patterns", icon: "📈" },
  { label: "이탈 예측",    sub: "Churn Prediction",  path: "/churn-risk",        icon: "🔮" },
  { label: "세그먼트 분류",sub: "Segment Analysis",  path: "/user-analysis",     icon: "🗂️" },
  { label: "개입 전략",    sub: "Intervention",      path: "/intervention",      icon: "🎯" },
];

const C = {
  card:   "#222B44",
  border: "#353F66",
  text:   "#FFFFFF",
  sub:    "#C4CAE0",
  muted:  "#7880A4",
  tvRed:  "#FF153C",
  purple: "#6C63FF",
};

export function AnalysisFlowNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const activeIdx = STEPS.findIndex(s =>
    s.path === "/" ? pathname === "/" : pathname.startsWith(s.path)
  );

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "10px",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: "0",
        overflowX: "auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "1px",
          color: C.muted,
          marginRight: "16px",
          flexShrink: 0,
          textTransform: "uppercase",
        }}
      >
        분석 흐름
      </span>

      {STEPS.map((step, i) => {
        const isActive   = i === activeIdx;
        const isComplete = i < activeIdx;
        const stepColor  = isActive ? C.tvRed : isComplete ? C.purple : C.muted;

        return (
          <div key={step.path} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* Step pill */}
            <button
              onClick={() => navigate(step.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: `1px solid ${isActive ? C.tvRed + "50" : isComplete ? C.purple + "30" : C.border}`,
                background: isActive
                  ? `rgba(255,21,60,0.12)`
                  : isComplete
                  ? `rgba(108,99,255,0.1)`
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                outline: "none",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = stepColor + "60";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isActive
                  ? "rgba(255,21,60,0.12)"
                  : isComplete ? "rgba(108,99,255,0.1)" : "transparent";
                (e.currentTarget as HTMLButtonElement).style.borderColor = isActive
                  ? C.tvRed + "50" : isComplete ? C.purple + "30" : C.border;
              }}
            >
              {/* Step number badge */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isActive ? C.tvRed : isComplete ? C.purple : C.muted + "30",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 10px ${C.tvRed}60` : isComplete ? `0 0 8px ${C.purple}40` : "none",
                }}
              >
                {isComplete ? (
                  <span style={{ fontSize: "10px" }}>✓</span>
                ) : (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: isActive ? "#fff" : C.muted,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "Pretendard, sans-serif",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? C.text : isComplete ? "#C4B5FD" : C.sub,
                    lineHeight: 1,
                    marginBottom: "2px",
                  }}
                >
                  {step.icon} {step.label}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "9px",
                    color: "#68718F",
                    lineHeight: 1,
                  }}
                >
                  {step.sub}
                </div>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: C.tvRed,
                    border: "1.5px solid #0D0D18",
                    boxShadow: `0 0 6px ${C.tvRed}`,
                  }}
                />
              )}
            </button>

            {/* Arrow connector */}
            {i < STEPS.length - 1 && (
              <ArrowRight
                size={13}
                color={i < activeIdx ? C.purple + "80" : C.muted + "50"}
                style={{ margin: "0 4px", flexShrink: 0 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}