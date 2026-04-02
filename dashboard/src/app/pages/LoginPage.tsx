import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [emailFocus, setEmailFocus]   = useState(false);
  const [pwFocus, setPwFocus]         = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // UI Gate — set auth token, then transition to dashboard
    setTimeout(() => {
      sessionStorage.setItem("tving_authed", "1");
      navigate("/");
    }, 800);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0A14 0%, #0F0F1A 40%, #14102A 70%, #0A0A14 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Pretendard, Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient background glow ── */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(227,6,19,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "20%",
        width: 400, height: 400,
        background: "radial-gradient(ellipse, rgba(108,99,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "15%",
        width: 300, height: 300,
        background: "radial-gradient(ellipse, rgba(108,99,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Grid dot pattern overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* ── Login Card ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          margin: "0 24px",
          background: "rgba(30, 30, 48, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "44px 40px 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: "1px",
          background: "linear-gradient(90deg, transparent, #E30613, transparent)",
          borderRadius: "1px",
        }} />

        {/* ── Logo & Title ── */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          {/* TVING wordmark */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginBottom: "12px" }}>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #FF153C 0%, #E30613 50%, #C00010 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}>
              TVING
            </span>
          </div>

          {/* Platform label */}
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "2.5px",
            color: "#B8BDD6",
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}>
            Analytics Platform
          </p>

          {/* Sub heading */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 14px",
            background: "rgba(227,6,19,0.08)",
            border: "1px solid rgba(227,6,19,0.2)",
            borderRadius: "20px",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E30613", boxShadow: "0 0 6px #E30613" }} />
            <span style={{
              fontFamily: "Pretendard, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              color: "#E30613",
              letterSpacing: "0.5px",
            }}>
              Churn Analytics Dashboard
            </span>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Email field */}
          <div>
            <label style={{
              display: "block",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.8px",
              color: "#B8BDD6",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}>
              Email
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: emailFocus ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${emailFocus ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "10px",
              padding: "0 14px",
              gap: "10px",
              transition: "border-color 0.2s, background 0.2s",
            }}>
              <Mail size={15} color={emailFocus ? "#6C63FF" : "#68718F"} strokeWidth={2} style={{ flexShrink: 0, transition: "color 0.2s" }} />
              <input
                type="email"
                placeholder="name@tving.co.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#FFFFFF",
                  padding: "13px 0",
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label style={{
              display: "block",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.8px",
              color: "#B8BDD6",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}>
              Password
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: pwFocus ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${pwFocus ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "10px",
              padding: "0 14px",
              gap: "10px",
              transition: "border-color 0.2s, background 0.2s",
            }}>
              <Lock size={15} color={pwFocus ? "#6C63FF" : "#68718F"} strokeWidth={2} style={{ flexShrink: 0, transition: "color 0.2s" }} />
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
                required
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#FFFFFF",
                  padding: "13px 0",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {showPw
                  ? <EyeOff size={15} color="#68718F" strokeWidth={2} />
                  : <Eye    size={15} color="#68718F" strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "14px",
              background: loading
                ? "linear-gradient(135deg, #AA0010, #8B0010)"
                : "linear-gradient(135deg, #FF153C 0%, #E30613 50%, #C00010 100%)",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: loading ? "none" : "0 4px 24px rgba(227,6,19,0.35)",
              transition: "all 0.2s",
              opacity: loading ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 32px rgba(227,6,19,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 4px 24px rgba(227,6,19,0.35)";
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#FFFFFF",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.3px" }}>
                  Authenticating...
                </span>
              </>
            ) : (
              <>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.3px" }}>
                  Access Analytics
                </span>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* ── Footer inside card ── */}
        <div style={{
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}>
          <Shield size={12} color="#68718F" strokeWidth={2} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#68718F", letterSpacing: "0.3px" }}>
            Authorized Personnel Only
          </span>
        </div>
      </div>

      {/* ── Footer below card ── */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "rgba(74,74,106,0.7)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Internal Analytics Platform
        </p>
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          color: "rgba(74,74,106,0.45)",
          margin: "4px 0 0",
        }}>
          © 2026 TVING Co., Ltd. — Confidential &amp; Proprietary
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #68718F !important; }
        input::-webkit-input-placeholder { color: #68718F !important; }
      `}</style>
    </div>
  );
}