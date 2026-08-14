"use client";
import { useState } from "react";

const G = "#00C805";
const R = "#FF3B30";
const S = "rgba(255,255,255,0.04)";
const B = "rgba(255,255,255,0.08)";
const T2 = "#8e8e93";
const T3 = "#48484a";

const TABS = ["Wallets", "Tokens"];

export default function TrackingPage() {
  const [tab, setTab] = useState("Wallets");
  const [input, setInput] = useState("");

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

      <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={tab === "Wallets" ? "0x wallet address…" : "Token CA…"}
            style={{
              flex: 1, background: S, border: `1px solid ${B}`, borderRadius: 10,
              padding: "9px 10px", fontSize: 12, color: "#f2f2f7", outline: "none", fontFamily: "monospace",
            }}
          />
          <button style={{
            padding: "9px 16px", borderRadius: 10, border: "none",
            background: G, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            Track
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px", scrollbarWidth: "none" }}>
        <div style={{ background: S, border: `1px solid ${B}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{tab === "Wallets" ? "👛" : "🪙"}</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            No tracked {tab.toLowerCase()} yet
          </div>
          <div style={{ fontSize: 12, color: T2 }}>
            {tab === "Wallets"
              ? "Add a wallet address above to follow its trading activity — real activity feed requires the RPC event-log pipeline (Priority 2 roadmap item)."
              : "Add a token CA above to watch it here."}
          </div>
        </div>
      </div>
    </div>
  );
}
