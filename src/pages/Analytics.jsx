import { gold, black, white, txt, sub, iosBg, red, green } from "../config";

export default function Analytics({ inspections, nav, isLaptop }) {
  const pad = isLaptop ? "0 40px" : "0 16px";

  const def = inspections.flatMap(i => i.defects||[]);

  // Stats
  const totalInspections = inspections.length;
  const completed   = inspections.filter(i=>i.status==="Completed").length;
  const inProgress  = inspections.filter(i=>i.status==="In Progress").length;
  const pending     = inspections.filter(i=>i.status==="Pending").length;
  const totalDef    = def.length;
  const resolved    = def.filter(d=>d.status==="Resolved").length;
  const open        = def.filter(d=>d.status==="Open").length;
  const rate        = totalDef>0 ? Math.round((resolved/totalDef)*100) : 0;

  // Defects by severity
  const bySeverity = ["Critical","High","Medium","Low"].map(s=>({
    label: s,
    count: def.filter(d=>d.severity===s).length,
    color: s==="Critical"?"#FF3B30":s==="High"?"#FF9500":s==="Medium"?gold:"#34C759",
  }));

  // Defects by location
  const byLocation = {};
  def.forEach(d=>{ if(d.location) byLocation[d.location]=(byLocation[d.location]||0)+1; });
  const locationData = Object.entries(byLocation).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxLoc = Math.max(...locationData.map(([,v])=>v), 1);

  // Defects by category
  const byCategory = {};
  def.forEach(d=>{ if(d.category) byCategory[d.category]=(byCategory[d.category]||0)+1; });
  const categoryData = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Monthly inspections
  const byMonth = {};
  inspections.forEach(i=>{
    if(i.date) {
      const month = i.date.substring(0,7);
      byMonth[month]=(byMonth[month]||0)+1;
    }
  });
  const monthData = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
  const maxMonth = Math.max(...monthData.map(([,v])=>v), 1);

  const Bar = ({ value, max, color }) => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ width:"100%", height:80, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div style={{
          width:"60%", background:color||gold,
          height:`${Math.max((value/max)*100, 4)}%`,
          borderRadius:"2px 2px 0 0",
          transition:"height 0.4s",
        }}/>
      </div>
    </div>
  );

  return (
    <div style={{ background:"transparent", minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:"rgba(0,0,0,0.7)", padding: isLaptop?"40px 40px 28px":"72px 24px 24px", marginBottom:1 }}>

        {/* LOGO TICKER */}
        <div style={{ overflow:"hidden", marginBottom:20, borderTop:`1px solid ${gold}40`, borderBottom:`1px solid ${gold}40`, padding:"8px 0" }}>
          <div style={{ display:"flex", animation:"ticker 8s linear infinite", width:"max-content", willChange:"transform" }}>
            {[...Array(20)].map((_,i)=>(
              <div key={i} style={{ flexShrink:0, width:100, height:28, overflow:"hidden", marginRight:50 }}>
                <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8, marginBottom:4 }}>Analytics</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Inspection data overview</div>
      </div>

      <div style={{ padding:pad, paddingTop:16 }}>

        {/* TOP STATS */}
        <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(4,1fr)":"repeat(2,1fr)", gap:1, background:"rgba(0,0,0,0.2)", marginBottom:1 }}>
          {[
            {l:"Total Inspections", v:totalInspections, c:gold},
            {l:"Completed",         v:completed,        c:"#34C759"},
            {l:"Total Defects",     v:totalDef,         c:"#AF52DE"},
            {l:"Resolution Rate",   v:`${rate}%`,       c:"#30D158"},
          ].map(s=>(
            <div key={s.l} style={{ background:white, padding:"20px", borderLeft:`4px solid ${s.c}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>{s.l}</div>
              <div style={{ fontSize:32, fontWeight:800, color:s.c, letterSpacing:-1, lineHeight:1 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* INSPECTION STATUS */}
        <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Inspection Status</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {l:"Completed",   v:completed,  c:"#34C759", total:totalInspections},
              {l:"In Progress", v:inProgress, c:gold,      total:totalInspections},
              {l:"Pending",     v:pending,    c:"#FF9500", total:totalInspections},
            ].map(s=>(
              <div key={s.l}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:13, color:txt, fontWeight:500 }}>{s.l}</div>
                  <div style={{ fontSize:13, color:txt, fontWeight:700 }}>{s.v} <span style={{ color:sub, fontWeight:400 }}>({totalInspections>0?Math.round((s.v/totalInspections)*100):0}%)</span></div>
                </div>
                <div style={{ height:8, background:"#F0F0F0", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${totalInspections>0?(s.v/totalInspections)*100:0}%`, background:s.c, borderRadius:4, transition:"width 0.6s" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEFECT STATUS */}
        <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Defect Status</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {l:"Resolved",    v:resolved,                        c:"#34C759"},
              {l:"In Progress", v:def.filter(d=>d.status==="In Progress").length, c:gold},
              {l:"Open",        v:open,                            c:"#FF3B30"},
            ].map(s=>(
              <div key={s.l}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:13, color:txt, fontWeight:500 }}>{s.l}</div>
                  <div style={{ fontSize:13, color:txt, fontWeight:700 }}>{s.v} <span style={{ color:sub, fontWeight:400 }}>({totalDef>0?Math.round((s.v/totalDef)*100):0}%)</span></div>
                </div>
                <div style={{ height:8, background:"#F0F0F0", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${totalDef>0?(s.v/totalDef)*100:0}%`, background:s.c, borderRadius:4, transition:"width 0.6s" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEFECTS BY SEVERITY */}
        <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Defects by Severity</div>
          {bySeverity.every(s=>s.count===0) ? (
            <div style={{ textAlign:"center", color:sub, fontSize:13, padding:"20px 0" }}>No defects recorded yet</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {bySeverity.map(s=>(
                <div key={s.label} style={{ textAlign:"center", padding:"16px 8px", background:"#F9F9F9", borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:28, fontWeight:800, color:s.color, letterSpacing:-1, lineHeight:1, marginBottom:6 }}>{s.count}</div>
                  <div style={{ fontSize:10, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP DEFECT LOCATIONS */}
        {locationData.length > 0 && (
          <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Top Defect Locations</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {locationData.map(([loc, count])=>(
                <div key={loc}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <div style={{ fontSize:13, color:txt, fontWeight:500 }}>{loc}</div>
                    <div style={{ fontSize:13, color:txt, fontWeight:700 }}>{count}</div>
                  </div>
                  <div style={{ height:6, background:"#F0F0F0", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(count/maxLoc)*100}%`, background:gold, borderRadius:3, transition:"width 0.6s" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOP CATEGORIES */}
        {categoryData.length > 0 && (
          <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Top Defect Categories</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {categoryData.map(([cat, count], idx)=>(
                <div key={cat} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"#F9F9F9", borderLeft:`3px solid ${gold}` }}>
                  <div style={{ fontSize:16, fontWeight:800, color:gold, minWidth:24 }}>#{idx+1}</div>
                  <div style={{ flex:1, fontSize:13, color:txt, fontWeight:500 }}>{cat}</div>
                  <div style={{ fontSize:13, color:txt, fontWeight:700, background:`${gold}15`, padding:"4px 12px" }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MONTHLY INSPECTIONS */}
        {monthData.length > 0 && (
          <div style={{ background:white, padding:"20px 24px", marginBottom:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Monthly Inspections</div>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:120 }}>
              {monthData.map(([month, count])=>(
                <div key={month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ fontSize:11, color:txt, fontWeight:700 }}>{count}</div>
                  <div style={{ width:"100%", display:"flex", alignItems:"flex-end", height:80 }}>
                    <div style={{
                      width:"100%", background:gold,
                      height:`${Math.max((count/maxMonth)*100, 8)}%`,
                      borderRadius:"2px 2px 0 0",
                      transition:"height 0.4s",
                    }}/>
                  </div>
                  <div style={{ fontSize:9, color:sub, textAlign:"center", letterSpacing:0.3 }}>{month.substring(5)}/{month.substring(2,4)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {inspections.length === 0 && (
          <div style={{ background:white, padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
            <div style={{ fontWeight:700, fontSize:18, color:txt, marginBottom:8 }}>No data yet</div>
            <div style={{ fontSize:14, color:sub, marginBottom:24 }}>Start creating inspections to see analytics</div>
            <button onClick={()=>nav("new")} style={{ padding:"13px 28px", background:black, color:white, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase" }}>
              New Inspection
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}