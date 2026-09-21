import { black, gold, white, txt, sub, iosBg, iosSep } from "../config";

const NAV = [
  { icon:"📊", label:"Dashboard", key:"dashboard" },
  { icon:"➕", label:"New Inspection", key:"new" },
  { icon:"📋", label:"All Inspections", key:"list" },
  { icon:"📄", label:"Reports", key:"reports" },
];

export default function BottomNav({ page, nav, user, logout, open, setOpen, isLaptop }) {

  const SidebarContent = () => (
    <div style={{
      width: isLaptop ? "100%" : 300,
      background: black,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* HEADER */}
      <div style={{ padding: isLaptop ? "32px 24px 24px" : "56px 24px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ width:48, height:48, borderRadius:14, overflow:"hidden", marginBottom:16, boxShadow:`0 4px 16px ${gold}50` }}>
              <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain", background:"white", padding:"4px" }}/>
            </div>
              <div style={{ fontWeight:800, fontSize:20, color:white, letterSpacing:-0.5 }}>BENAMORA</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Inspection System</div>
          </div>
          {!isLaptop && (
            <button onClick={()=>setOpen(false)} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:14, color:white, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          )}
        </div>

        {/* USER PROFILE CARD */}
        {user && (
          <div
            onClick={()=>{ nav("profile"); if(!isLaptop) setOpen(false); }}
            style={{ marginTop:16, padding:"12px 16px", background:"rgba(255,255,255,0.06)", borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all 0.15s" }}>
            {/* AVATAR */}
            {user.photo ? (
              <img src={user.photo} alt={user.name} style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", border:`2px solid ${gold}`, flexShrink:0 }}/>
            ) : (
              <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${gold},#E8B84B)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:white, flexShrink:0 }}>
                {user.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:11, color:gold, fontWeight:600, marginTop:1 }}>{user.role}</div>
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>›</div>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
        {NAV.map(item => {
          const active = page === item.key;
          return (
            <button key={item.key} onClick={()=>nav(item.key)} style={{
              width:"100%", padding:"14px 16px",
              background: active ? `${gold}18` : "transparent",
              border:"none", borderRadius:14,
              cursor:"pointer", fontFamily:"inherit",
              textAlign:"left", display:"flex",
              alignItems:"center", gap:14, marginBottom:4,
              transition:"all 0.15s ease",
            }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <span style={{ fontSize:15, fontWeight: active ? 700 : 500, color: active ? gold : "rgba(255,255,255,0.65)", letterSpacing:-0.2 }}>
                {item.label}
              </span>
              {active && <div style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:gold }}/>}
            </button>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div style={{ padding:"16px 24px 32px", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={()=>{ nav("profile"); if(!isLaptop) setOpen(false); }} style={{
          width:"100%", padding:"13px",
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:14, color:"rgba(255,255,255,0.6)",
          cursor:"pointer", fontFamily:"inherit",
          fontSize:14, fontWeight:600,
          display:"flex", alignItems:"center", gap:8,
        }}>
          👤 My Profile
        </button>
        <button onClick={()=>{ logout(); setOpen(false); }} style={{
          width:"100%", padding:"13px",
          background:"#FF3B3015", border:"none",
          borderRadius:14, color:"#FF3B30",
          cursor:"pointer", fontFamily:"inherit",
          fontSize:14, fontWeight:600,
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  if (isLaptop) return <SidebarContent/>;

  return (
    <>
      <button onClick={()=>setOpen(true)} style={{
        position:"fixed", top:16, left:16, zIndex:150,
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        border:"none", borderRadius:12,
        width:44, height:44, cursor:"pointer",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        gap:5, boxShadow:"0 2px 12px rgba(0,0,0,0.12)",
      }}>
        <span style={{ width:20, height:2, background:black, borderRadius:99, display:"block" }}/>
        <span style={{ width:20, height:2, background:black, borderRadius:99, display:"block" }}/>
        <span style={{ width:14, height:2, background:black, borderRadius:99, display:"block", alignSelf:"flex-start", marginLeft:12 }}/>
      </button>

      {open && (
        <div onClick={()=>setOpen(false)} style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.4)",
          backdropFilter:"blur(4px)",
          WebkitBackdropFilter:"blur(4px)",
          zIndex:200,
          animation:"fadeIn 0.2s ease",
        }}/>
      )}

      <div style={{
        position:"fixed", top:0, left:0, bottom:0,
        width:300, zIndex:300,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        boxShadow: open ? "4px 0 40px rgba(0,0,0,0.2)" : "none",
      }}>
        <SidebarContent/>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
}