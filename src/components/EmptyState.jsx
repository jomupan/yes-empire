import { txt, sub, gold, white, iosCard } from "../config";

export default function EmptyState({ icon, title, desc, onAction, actionLabel }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "56px 24px",
      background: iosCard,
      borderRadius: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        width: 80, height: 80,
        background: gold + "20",
        borderRadius: 24,
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 38, margin: "0 auto 20px",
      }}>
        {icon}
      </div>
      <div style={{
        fontWeight: 700, color: txt,
        fontSize: 18, marginBottom: 8,
        letterSpacing: -0.3,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 14, color: sub,
        lineHeight: 1.6,
        marginBottom: onAction ? 28 : 0,
        maxWidth: 240, margin: "0 auto",
      }}>
        {desc}
      </div>
      {onAction && (
        <button onClick={onAction} style={{
          marginTop: 24,
          background: gold, color: white,
          border: "none", padding: "13px 32px",
          borderRadius: 14, fontSize: 15,
          fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: -0.2,
          boxShadow: `0 4px 16px ${gold}40`,
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}