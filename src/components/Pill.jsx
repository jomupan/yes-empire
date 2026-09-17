import { SEV, STA, IST } from "../config";

export default function Pill({ type, value }) {
  const cfg = type==="sev" ? SEV[value] : type==="sta" ? STA[value] : IST[value];
  if (!cfg) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
      color: cfg.label || cfg.color,
      background: cfg.bg,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: cfg.dot || cfg.color, flexShrink: 0,
      }}/>
      {value}
    </span>
  );
}