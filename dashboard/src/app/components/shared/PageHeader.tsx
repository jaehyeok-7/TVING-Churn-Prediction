type PageHeaderProps = {
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  periodLabel?: string;
  isCustom?: boolean;
};

export function PageHeader({ badge, badgeColor, title, description, periodLabel, isCustom }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            background: `${badgeColor}20`,
            border: `1px solid ${badgeColor}45`,
            borderRadius: "6px",
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            color: badgeColor,
          }}
        >
          {badge}
        </span>
        {periodLabel && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 10px",
              background: isCustom ? "rgba(108,99,255,0.14)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isCustom ? "rgba(108,99,255,0.35)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.6px",
              color: isCustom ? "#6C63FF" : "#B8BDD6",
            }}
          >
            {isCustom ? "📅" : "🗓"} {periodLabel}
          </span>
        )}
      </div>
      <h2
        style={{
          fontFamily: "Pretendard, Inter, sans-serif",
          fontSize: "24px",
          fontWeight: 800,
          color: "#FFFFFF",
          margin: "0 0 8px 0",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "Pretendard, Inter, sans-serif",
          fontSize: "14px",
          color: "#B8BDD6",
          margin: 0,
          lineHeight: 1.65,
          maxWidth: "680px",
        }}
      >
        {description}
      </p>
    </div>
  );
}