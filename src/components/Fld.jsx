import { txt, red, sub } from "../config";

export default function Fld({ label, error, optional, children }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: txt,
        display: "flex", alignItems: "center", gap: 4,
        marginBottom: 8, letterSpacing: 0.8,
        textTransform: "uppercase"
      }}>
        {label}
        {!optional && <span style={{ color: red }}>*</span>}
        {optional && (
          <span style={{ color: sub, fontWeight: 400, fontSize: 11, textTransform: "none", letterSpacing: 0 }}>
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: red, margin: "6px 0 0", fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}