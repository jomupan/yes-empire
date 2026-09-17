import { txt, sub, gold, black, white, iosCard } from "../config";

export default function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: iosCard,
      borderRadius: 16,
      padding: "18px 16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: accent + "20",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: 32, fontWeight: 700, color: txt,
        lineHeight: 1, letterSpacing: -1, marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 13, color: sub, fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{
        marginTop: 10, height: 3, borderRadius: 99,
        background: accent + "30",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: "60%",
          background: accent, borderRadius: 99,
        }}/>
      </div>
    </div>
  );
}