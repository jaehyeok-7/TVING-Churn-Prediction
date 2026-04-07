import { useNavigate, useLocation } from "react-router";
import {
  Database,
  BarChart2,
  Brain,
  Layers,
  Zap,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    icon: Database,
    label: "서비스 상태", // 변경: 데이터 수집 -> 서비스 상태
    sub: "종합 현황 분석", // 변경: 행동·결제·콘텐츠 -> 종합 현황 분석
    color: "#6C63FF",
    path: "/analysis?tab=service",
  },
  {
    icon: BarChart2,
    label: "사용자 행동 패턴", // 변경: 패턴 분석 -> 사용자 행동 패턴
    sub: "시청·접속 패턴 추출", // 변경: 시청 패턴 추출 -> 시청·접속 패턴 추출
    color: "#6C63FF",
    path: "/analysis?tab=behavior",
  },
  {
    icon: Layers,
    label: "사용자 분석", // 변경: 세그먼트 분류 -> 사용자 분석
    sub: "유형별 특성 분석", // 변경: 사용자 유형 구분 -> 유형별 특성 분석
    color: "#FFB74D",
    path: "/analysis?tab=user",
  },
  {
    icon: Brain,
    label: "이탈 위험 분석", // 변경: 이탈 예측 -> 이탈 위험 분석
    sub: "AI 위험도 스코어링", // 변경: ML 모델 스코어링 -> AI 위험도 스코어링
    color: "#FFB74D",
    path: "/churn-action?tab=churn",
  },
  {
    icon: Zap,
    label: "개입 전략", // 유지
    sub: "맞춤형 대응 캠페인", // 변경: 자동화 캠페인 -> 맞춤형 대응 캠페인
    color: "#E30613",
    path: "/churn-action?tab=action",
  },
];

export function AnalysisPipeline() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get("tab");

  const activeIdx = steps.findIndex((s) => {
    const [sPath, sQuery] = s.path.split("?");
    if (sPath !== pathname) return false;
    if (!sQuery) return true;
    return new URLSearchParams(sQuery).get("tab") === tab;
  });

  return (
    <div
      style={{
        background: "#222B44",
        border: "1px solid #353F66",
        borderRadius: "12px",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ flexShrink: 0, marginRight: "20px" }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1px",
            color: "#7880A4",
            marginBottom: "2px",
          }}
        >
          ANALYSIS PIPELINE
        </div>
        <div
          style={{
            fontFamily: "Pretendard, Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#C4CAE0",
          }}
        >
          인사이트→전략 흐름
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
        }}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeIdx;
          const isComplete = i < activeIdx;
          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => navigate(step.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px", // 가독성을 위해 간격을 소폭 넓힘
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "none", // 기본 보더 제거
                  outline: "none",
                  transition: "all 0.15s",
                  position: "relative",
                  background: isActive
                    ? "rgba(227,6,19,0.16)"
                    : isComplete
                      ? "rgba(108,99,255,0.10)"
                      : "rgba(255,255,255,0.03)",
                  border: isActive
                    ? "1px solid rgba(227,6,19,0.4)"
                    : isComplete
                      ? "1px solid rgba(108,99,255,0.3)"
                      : "1px solid #353F66",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.background =
                      "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLButtonElement
                  ).style.background = isActive
                    ? "rgba(227,6,19,0.16)"
                    : isComplete
                      ? "rgba(108,99,255,0.10)"
                      : "rgba(255,255,255,0.03)";
                }}
              >
                {isComplete && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#00D2A0",
                      border: "1.5px solid #222B44",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "7px",
                      color: "white",
                    }}
                  >
                    ✓
                  </div>
                )}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#E30613",
                      boxShadow: "0 0 8px rgba(227,6,19,0.7)",
                      animation:
                        "pulse-pipeline 1.5s ease-in-out infinite",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: `${step.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={13}
                    color={step.color}
                    strokeWidth={2.5}
                  />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontFamily:
                        "Pretendard, Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: isActive
                        ? 700
                        : isComplete
                          ? 500
                          : 400,
                      color: isActive
                        ? "#FFFFFF"
                        : isComplete
                          ? "#C4B5FD"
                          : "#C4CAE0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontFamily:
                        "Pretendard, Inter, sans-serif",
                      fontSize: "10px",
                      color: isActive
                        ? "rgba(255,255,255,0.65)"
                        : "#7880A4",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.sub}
                  </div>
                </div>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight
                  size={14}
                  color={i < activeIdx ? "#6C63FF" : "#353F66"}
                  style={{ margin: "0 4px", opacity: 0.7 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-pipeline { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        button:focus-visible { outline: 2px solid #6C63FF; }
      `}</style>
    </div>
  );
}