"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const G = "#00C805";
const S = "rgba(255,255,255,0.04)";
const B = "rgba(255,255,255,0.08)";
const T2 = "#8e8e93";
const T3 = "#48484a";

export default function ReferralPage() {
  const { user, status } = useAuth();
  const [copied, setCopied] = useState(false);

  const code = user ? `E404-${user.telegramId.slice(-6).toUpperCase()}` : null;

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px", scrollbarWidth: "none" }}>
      <div style={{ background: S, border: `1px solid ${B}`, borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Referral Program</div>

        {status === "connected" && code ? (
          <>
            <div style={{ fontSize: 11, color: T2, marginBottom: 8 }}>Your referral code</div>
            <div
              onClick={copyCode}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(0,200,5,0.08)", border: "1px solid rgba(0,200,5,0.3)",
                borderRadius: 10, padding: "10px 16px", cursor: "pointer", marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: G, fontFamily: "monospace" }}>{code}</span>
              <span style={{ fontSize: 12, color: T2 }}>{copied ? "Copied!" : "⧉"}</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: T2, marginBottom: 14 }}>
            Connect your account to get your referral code.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px" }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: ".05em" }}>Referrals</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>0</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px" }}>
            <div style={{ fontSize: 9, color: T3, textTransform: "uppercase", letterSpacing: ".05em" }}>Earned</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>$0.00</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: T3, textAlign: "center" }}>
        Referral tracking and payouts aren't live yet — this shows real values only once earned.
      </div>
    </div>
  );
}
