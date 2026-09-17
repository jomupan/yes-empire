import { gold, goldLight, black, white, txt, sub, iosBg, iosSep, iosCard } from "../config";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Pill from "../components/Pill";

export default function Dashboard({ inspections, loading, nav, goDetail, user }) {
  const totalDef = inspections.reduce((a,i) => a+(i.defects||[]).length, 0);
  const openDef  = inspections.reduce((a,i) => a+(i.defects||[]).filter(d=>d.status==="Open").length, 0);
  const done     = inspections.filter(i=>i.status==="Completed").length;
  const rate     = inspections.length>0 ? Math.round((done/inspections.length)*100) : 0;
  const today    = new Date().toLocaleDateString("en-MY",{weekday:"long",day:"numeric",month:"long"});

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HERO */}
      <div style={{
        background: `linear-gradient(160deg, ${black} 0%, #1C1C1E 100%)`,
        padding: "72px 24px 32px",
        borderRadius: "0 0 32px 32px",
        marginBottom: 24,
      }}>
        <div style={{ fontSize:12, color:gold, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>
          {today}
        </div>
        <div style={{ color:white, fontWeight:800, fontSize:30, letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>
          Hello, {user?.name?.split(" ")[0]} 👋
        </div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:28 }}>
          Here's your inspection overview
        </div>
        <div style={{
          display: "flex", gap: 20,
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { label:"Inspections", val:inspections.length, color:gold },
            { label:"Completion",  val:`${rate}%`,         color:"#30D158" },
            { label:"Open Issues", val:openDef,            color:"#FF453A" },
          ].map(s=>(
            <div key={s.label} style={{ flex:1, textAlign:"center" }}>
              <div style={{ color:s.color, fontSize:26, fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{s.val}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:5, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 16px" }}>

        {/* STAT CARDS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
          <StatCard label="Inspections"   value={inspections.length} accent={gold}      icon="🏠"/>
          <StatCard label="Completed"     value={done}               accent="#30D158"   icon="✅"/>
          <StatCard label="Total Defects" value={totalDef}           accent="#AF52DE"   icon="🔍"/>
          <StatCard label="Open Issues"   value={openDef}            accent="#FF453A"   icon="⚠️"/>
        </div>

        {/* RECENT SECTION HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, paddingLeft:4 }}>
          <div style={{ fontWeight:700, fontSize:20, color:txt, letterSpacing:-0.5 }}>Recent</div>
          <button onClick={()=>nav("list")} style={{ background:"none", border:"none", color:gold, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>See All</button>
        </div>

        {/* RECENT LIST */}
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ) : inspections.length===0 ? (
          <EmptyState icon="🏠" title="No inspections yet" desc="Start your first property inspection" onAction={()=>nav("new")} actionLabel="Start Now"/>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {inspections.slice(0,3).map(i=>{
              const defs=i.defects||[];
              const pct=defs.length>0?Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100):0;
              return(
                <Card key={i.id} onClick={()=>goDetail(i.id)} style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:defs.length>0?12:0 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:txt, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                      <div style={{ fontSize:13, color:sub }}>👤 {i.client}</div>
                      <div style={{ fontSize:13, color:sub, marginTop:2 }}>📅 {i.date}</div>
                    </div>
                    <Pill type="insp" value={i.status}/>
                  </div>
                  {defs.length>0&&(
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontSize:12, color:sub }}>🔍 {defs.length} defect{defs.length!==1?"s":""}</div>
                        <div style={{ fontSize:12, color:txt, fontWeight:600 }}>{pct}%</div>
                      </div>
                      <div style={{ height:4, background:iosBg, borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:gold, borderRadius:99, transition:"width 0.4s" }}/>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* START BUTTON */}
        <button onClick={()=>nav("new")} style={{
          marginTop: 20, width:"100%", padding:"16px",
          background: gold, color: white, border:"none",
          borderRadius: 16, fontWeight:700, fontSize:16,
          cursor:"pointer", fontFamily:"inherit",
          letterSpacing:-0.3,
          boxShadow: `0 8px 24px ${gold}40`,
          display:"flex", alignItems:"center",
          justifyContent:"center", gap:8,
        }}>
          <span style={{ fontSize:20 }}>+</span> Start New Inspection
        </button>

      </div>
    </div>
  );
}