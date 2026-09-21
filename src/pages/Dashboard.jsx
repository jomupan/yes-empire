import { gold, black, white, txt, sub, iosBg } from "../config";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Pill from "../components/Pill";

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: white, padding:"20px",
      borderLeft:`4px solid ${accent}`,
      boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:36, fontWeight:800, color:txt, letterSpacing:-1, lineHeight:1 }}>{value}</div>
    </div>
  );
}

export default function Dashboard({ inspections, loading, nav, goDetail, user, isLaptop }) {
  const totalDef = inspections.reduce((a,i) => a+(i.defects||[]).length, 0);
  const openDef  = inspections.reduce((a,i) => a+(i.defects||[]).filter(d=>d.status==="Open").length, 0);
  const done     = inspections.filter(i=>i.status==="Completed").length;
  const rate     = inspections.length>0 ? Math.round((done/inspections.length)*100) : 0;
  const today    = new Date().toLocaleDateString("en-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HERO */}
      <div style={{ background:black, padding: isLaptop?"40px 40px 32px":"72px 24px 32px", marginBottom:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:48, height:28, overflow:"hidden", display:"flex", alignItems:"center" }}>
            <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", objectFit:"contain", animation:"slideLeftRight 3s ease-in-out infinite" }}/>
          </div>
        </div>
        <div style={{ fontSize:11, color:gold, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>{today}</div>
        <div style={{ color:white, fontWeight:800, fontSize: isLaptop?36:28, letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>
          Hello, {user?.name?.split(" ")[0]}
        </div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14, marginBottom:28 }}>Here is your inspection overview</div>
        <div style={{ display:"flex", gap: isLaptop?40:20, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          {[
            { label:"Total",       val:inspections.length, color:gold      },
            { label:"Completion",  val:`${rate}%`,         color:"#30D158" },
            { label:"Open Issues", val:openDef,            color:"#FF453A" },
          ].map(s=>(
            <div key={s.label} style={{ flex:1 }}>
              <div style={{ color:s.color, fontSize: isLaptop?32:26, fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{s.val}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:5, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(4,1fr)":"1fr 1fr", gap:1, background:"#E5E5EA", marginBottom:1 }}>
        <StatCard label="Inspections"   value={inspections.length} accent={gold}    />
        <StatCard label="Completed"     value={done}               accent="#30D158" />
        <StatCard label="Total Defects" value={totalDef}           accent="#AF52DE" />
        <StatCard label="Open Issues"   value={openDef}            accent="#FF453A" />
      </div>

      {/* RECENT */}
      <div style={{ padding: isLaptop?"24px 40px 0":"16px 16px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:13, color:sub, letterSpacing:1.5, textTransform:"uppercase" }}>Recent Inspections</div>
          <button onClick={()=>nav("list")} style={{ background:"none", border:"none", color:gold, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>See All</button>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ) : inspections.length===0 ? (
          <EmptyState icon="🏠" title="No inspections yet" desc="Start your first property inspection" onAction={()=>nav("new")} actionLabel="Start Now"/>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(3,1fr)":"1fr", gap:1, background:"#E5E5EA" }}>
            {inspections.slice(0, isLaptop?6:3).map(i=>{
              const defs=i.defects||[];
              const pct=defs.length>0?Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100):0;
              return(
                <Card key={i.id} onClick={()=>goDetail(i.id)} style={{ padding:"18px 20px", borderRadius:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:defs.length>0?12:0 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:txt, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                      <div style={{ fontSize:12, color:sub }}>{i.client}</div>
                      <div style={{ fontSize:11, color:sub, marginTop:2, opacity:0.7 }}>{i.date}</div>
                    </div>
                    <Pill type="insp" value={i.status}/>
                  </div>
                  {defs.length>0&&(
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontSize:11, color:sub, letterSpacing:0.5 }}>{defs.length} DEFECT{defs.length!==1?"S":""}</div>
                        <div style={{ fontSize:11, color:txt, fontWeight:700 }}>{pct}%</div>
                      </div>
                      <div style={{ height:3, background:"#E5E5EA", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:gold, transition:"width 0.4s" }}/>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <button onClick={()=>nav("new")} style={{
          marginTop:16, width:"100%", padding:"16px",
          background:black, color:white, border:"none",
          fontWeight:700, fontSize:13, cursor:"pointer",
          fontFamily:"inherit", letterSpacing:1.5, textTransform:"uppercase",
        }}>
          + Start New Inspection
        </button>
      </div>

      <style>{`
        @keyframes slideLeftRight {
          0%   { transform: translateX(-6px); }
          50%  { transform: translateX(6px);  }
          100% { transform: translateX(-6px); }
        }
      `}</style>
    </div>
  );
}