import { useLocation } from "react-router";
import { Construction } from "lucide-react";

const PAGE_INFO: Record<string, { title: string; desc: string; color: string }> = {
  "/service-status": {
    title: "서비스 상태",
    desc: "플랫폼 가동률, 지연 지표, 서버 상태 및 사용자 불만 트래킹을 제공합니다.",
    color: "#6C63FF",
  },
  "/user-analysis": {
    title: "사용자 분석",
    desc: "코호트 분석, 세그먼트 특성, 가입 채널별 리텐션 등 사용자 프로파일 분석을 제공합니다.",
    color: "#00D2A0",
  },
  "/behavior-patterns": {
    title: "사용자 행동 패턴 분석",
    desc: "시청 빈도, 세션 길이, 장르 편향, 이탈 전 행동 시그널 등 패턴 분석을 제공합니다.",
    color: "#FFB74D",
  },
  "/churn-risk": {
    title: "이탈 위험 분석",
    desc: "ML 기반 이탈 예측 스코어, 위험 사용자 목록, 예측 인자 중요도 분석을 제공합니다.",
    color: "#E30613",
  },
  "/intervention": {
    title: "개입 전략",
    desc: "세그먼트별 마케팅 캠페인 설계, 자동화 트리거, A/B 테스트 및 성과 측정을 제공합니다.",
    color: "#E30613",
  },
};

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const info = PAGE_INFO[pathname] ?? {
    title: "페이지",
    desc: "이 페이지는 준비 중입니다.",
    color: "#6C63FF",
  };

  return (
    <div
      style={{
        padding: "60px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: `${info.color}14`,
          border: `1px solid ${info.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <Construction size={28} color={info.color} strokeWidth={1.5} />
      </div>
      <h2
        style={{
          fontFamily: "Pretendard, Inter, sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "#FFFFFF",
          margin: "0 0 12px 0",
        }}
      >
        {info.title}
      </h2>
      <p
        style={{
          fontFamily: "Pretendard, Inter, sans-serif",
          fontSize: "14px",
          color: "#B8BDD6",
          maxWidth: "480px",
          lineHeight: 1.7,
          margin: "0 0 32px 0",
        }}
      >
        {info.desc}
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          background: `${info.color}12`,
          border: `1px solid ${info.color}30`,
          borderRadius: "8px",
          fontFamily: "Pretendard, Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: info.color,
        }}
      >
        🚧 다음 스프린트에 포함 예정
      </div>
    </div>
  );
}