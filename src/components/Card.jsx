import { useState } from "react";
import { iosCard } from "../config";

export default function Card({ children, onClick, style }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        ...style,
        background: iosCard,
        borderRadius: 16,
        cursor: onClick ? "pointer" : "default",
        transform: pressed && onClick ? "scale(0.97)" : "scale(1)",
        boxShadow: pressed && onClick
          ? "0 1px 4px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.18s cubic-bezier(0.25,0.46,0.45,0.94)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}