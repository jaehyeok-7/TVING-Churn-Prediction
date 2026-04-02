import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  BarChart2,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";

type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  subLabel?: string;
};
type SectionDef = { section?: string; items: NavItem[] };

const navSections: SectionDef[] = [
  {
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    section: "ANALYSIS",
    items: [
      {
        to: "/analysis",
        icon: BarChart2,
        label: "서비스 · 사용자 분석",
        subLabel: "상태 · 행동 · 세그먼트",
      },
    ],
  },
  {
    section: "CHURN & ACTION",
    items: [
      {
        to: "/churn-action",
        icon: AlertTriangle,
        label: "이탈 위험 · 개입 전략",
        subLabel: "Risk · SHAP · Campaign",
      },
    ],
  },
];

const C = {
  bg: "#191929",
  activeBg: "rgba(255,21,60,0.14)",
  activeBorder: "#FF153C",
  hoverBg: "rgba(255,255,255,0.07)",
  text: "#C4CAE0",
  activeText: "#FFFFFF",
  section: "#7880A4",
  border: "#353F66",
  red: "#FF153C",
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 20px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            background:
              "linear-gradient(135deg, #E30613 0%, #FF4D5A 100%)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 18px rgba(227,6,19,0.4)",
            flexShrink: 0,
          }}
        >
          <PlayCircle
            size={17}
            color="white"
            strokeWidth={2.5}
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "Inter, Pretendard, sans-serif",
              fontSize: "15px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            T<span style={{ color: C.red }}>VING</span>
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              fontWeight: 500,
              color: C.section,
              letterSpacing: "0.8px",
              marginTop: "2px",
            }}
          >
            ANALYTICS
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navSections.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <div
                style={{
                  padding: "14px 20px 6px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1.2px",
                  color: C.section,
                }}
              >
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <div
                  key={item.to}
                  style={{ padding: "2px 10px" }}
                >
                  <div
                    onClick={() => navigate(item.to)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      background: isActive
                        ? C.activeBg
                        : "transparent",
                      borderLeft: isActive
                        ? `2px solid ${C.activeBorder}`
                        : "2px solid transparent",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "inset 0 0 20px rgba(255,21,60,0.05)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLDivElement
                        ).style.background = C.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLDivElement
                        ).style.background = "transparent";
                    }}
                  >
                    <Icon
                      size={15}
                      color={isActive ? C.red : C.text}
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ overflow: "hidden" }}>
                      <div
                        style={{
                          fontFamily:
                            "Pretendard, Inter, sans-serif",
                          fontSize: "13px",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? C.activeText
                            : C.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </div>
                      {item.subLabel && (
                        <div
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10px",
                            color: isActive
                              ? "rgba(255,255,255,0.45)"
                              : "#4A5070",
                            whiteSpace: "nowrap",
                            marginTop: "1px",
                          }}
                        >
                          {item.subLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {gi < navSections.length - 1 && (
              <div
                style={{
                  margin: "8px 20px",
                  height: "1px",
                  background: C.border,
                }}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Version */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            color: C.section,
          }}
        >
          v2.4.1 · 2026.03
        </div>
      </div>
    </aside>
  );
}