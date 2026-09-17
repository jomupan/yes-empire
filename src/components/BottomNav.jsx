import { black, gold, white, txt, sub, iosSep, iosBg } from "../config";

const NAV = [
  { icon:"📊", label:"Dashboard", key:"dashboard" },
  { icon:"➕", label:"New",       key:"new"       },
  { icon:"📋", label:"List",      key:"list"      },
  { icon:"📄", label:"Reports",   key:"reports"   },
];

export default function BottomNav({ page, nav, user, logout, open, setOpen }) {
  return (
    <>
      {/* HAMBURGER BUTTON */}
      <button onClick={() => setOpen(true)} style={{
        position: "fixed", top: 16, left: 16, zIndex: 150,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "none", borderRadius: 12,
        width: 44, height: 44, cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 5, boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      }}>
        <span style={{ width:20, height:2, background:black, borderRadius:99, display:"block" }}/>
        <span style={{ width:20, height:2, background:black, borderRadius:99, display:"block" }}/>
        <span style={{ width:14, height:2, background:black, borderRadius:99, display:"block", alignSelf:"flex-start", marginLeft:12 }}/>
      </button>

      {/* OVERLAY */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}/>
      )}

      {/* SLIDE IN MENU */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 300, zIndex: 300,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        display: "flex", flexDirection: "column",
        boxShadow: open ? "4px 0 40px rgba(0,0,0,0.15)" : "none",
      }}>

        {/* MENU HEADER */}
        <div style={{ padding: "56px 24px 24px", borderBottom: `1px solid ${iosSep}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{
                width: 48, height: 48, background: gold,
                borderRadius: 14, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 18, color: white,
                marginBottom: 16,
                boxShadow: `0 4px 16px ${gold}50`,
              }}>YE</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: txt, letterSpacing: -0.5 }}>YES EMPIRE</div>
              <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>Inspection System</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: iosBg, border: "none",
              borderRadius: 10, width: 32, height: 32,
              cursor: "pointer", fontSize: 14,
              color: sub, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {user && (
            <div style={{
              marginTop: 16, padding: "12px 16px",
              background: iosBg, borderRadius: 12,
            }}>
              <div style={{ fontSize: 12, color: sub, marginBottom: 2 }}>Logged in as</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: txt }}>{user.name}</div>
              <div style={{ fontSize: 12, color: gold, fontWeight: 600, marginTop: 2 }}>{user.role}</div>
            </div>
          )}
        </div>

        {/* NAV ITEMS */}
        <nav style={{ flex: 1, padding: "16px 16px" }}>
          {NAV.map((item) => {
            const active = page === item.key;
            return (
              <button key={item.key} onClick={() => { nav(item.key); setOpen(false); }} style={{
                width: "100%", padding: "14px 16px",
                background: active ? gold + "15" : "transparent",
                border: "none", borderRadius: 14,
                cursor: "pointer", fontFamily: "inherit",
                textAlign: "left", display: "flex",
                alignItems: "center", gap: 14,
                marginBottom: 4,
                transition: "all 0.15s ease",
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{
                  fontSize: 16, fontWeight: active ? 700 : 500,
                  color: active ? gold : txt,
                  letterSpacing: -0.2,
                }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 8, height: 8,
                    borderRadius: "50%", background: gold,
                  }}/>
                )}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div style={{ padding: "16px 24px 48px", borderTop: `1px solid ${iosSep}` }}>
          <button onClick={() => { logout(); setOpen(false); }} style={{
            width: "100%", padding: "14px",
            background: "#FF3B3010", border: "none",
            borderRadius: 14, color: "#FF3B30",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: 15, fontWeight: 600,
            letterSpacing: -0.2,
          }}>
            Sign Out
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}