"use client";
import { useState } from "react";

const G = "#00C805";
const R = "#FF3B30";
const S = "rgba(255,255,255,0.04)";
const B = "rgba(255,255,255,0.08)";
const T2 = "#8e8e93";
const T3 = "#48484a";

const TABS = ["Open", "Filled", "Cancelled"];

export default function OrdersPage() {
  const [tab, setTab] = useState("Open");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: "12px 16px 8px", flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100,
            border: `1px solid ${tab === t ? G : B}`,
            background: tab === t ? "rgba(0,200,5,0.12)" : "none",
            color: tab === t ? G : T2, cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px", scrollbarWidth: "none" }}>
        <div style={{ background: S, border: `1px solid ${B}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            No {tab.toLowerCase()} orders
          </div>
          <div style={{ fontSize: 12, color: T2, marginBottom: 4 }}>
            Limit orders, DCA, and stop-loss/take-profit aren't live yet — this is a placeholder until the order execution engine is built.
          </div>
        </div>
      </div>
    </div>
  );
}
