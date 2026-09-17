import { white, gold, txt, sub, iosBg, iosSep, red, SEV } from "../config";
import Card from "../components/Card";
import Pill from "../components/Pill";
import EmptyState from "../components/EmptyState";

export default function Reports({ inspections, loading, reportId, setReportId, nav }) {
  const ri = inspections.find(i => i.id === reportId);

  if (reportId && ri) {
    const def = ri.defects||[];
    const res = def.filter(d=>d.status==="Resolved").length;
    const op  = def.filter(d=>d.status==="Open").length;
    const ip  = def.filter(d=>d.status==="In Progress").length;
    const pct = def.length>0 ? Math.round((res/def.length)*100) : 0;

    return (
      <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

        {/* HEADER */}
        <div style={{ background:white, padding:"72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:20 }}>
          <button onClick={()=>setReportId(null)} style={{ background:"none", border:"none", color:gold, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
            ‹ All Reports
          </button>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:gold, fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Official Report</div>
              <div style={{ fontWeight:800, fontSize:22, color:txt, letterSpacing:-0.5, marginBottom:8 }}>{ri.title}</div>
              <Pill type="insp" value={ri.status}/>
            </div>
            <button onClick={()=>window.print()} style={{ background:gold, color:white, border:"none", padding:"10px 16px", borderRadius:12, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${gold}40`, flexShrink:0 }}>
              🖨️ Print
            </button>
          </div>
        </div>

        <div style={{ padding:"0 16px" }}>

          {/* COMPANY BADGE */}
          <div style={{ background:gold, borderRadius:20, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 8px 24px ${gold}40` }}>
            <div>
              <div style={{ fontWeight:900, fontSize:16, color:white }}>YES EMPIRE SDN BHD</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Official Defect Inspection Report</div>
            </div>
            <div style={{ fontWeight:900, fontSize:24, color:white, opacity:0.8 }}>YE</div>
          </div>

          {/* CLIENT INFO */}
          <div style={{ background:white, borderRadius:20, padding:"20px", marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14 }}>Client Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                {l:"Client",        v:ri.client},
                {l:"Property Type", v:ri.propertyType},
                {l:"City",          v:ri.city},
                {l:"State",         v:ri.state},
              ].map(r=>(
                <div key={r.l}>
                  <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{r.l}</div>
                  <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{r.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${iosSep}` }}>
              <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Address</div>
              <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{ri.address}, {ri.postcode}</div>
            </div>
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${iosSep}` }}>
              <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Inspector</div>
              <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{ri.inspector} · {ri.date}</div>
            </div>
          </div>

          {/* SUMMARY */}
          <div style={{ background:white, borderRadius:20, padding:"20px", marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14 }}>Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
              {[
                {l:"Total",       v:def.length, c:"#000"},
                {l:"Open",        v:op,         c:red},
                {l:"Progress",    v:ip,         c:"#AF52DE"},
                {l:"Resolved",    v:res,        c:"#34C759"},
              ].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"14px 8px", background:iosBg, borderRadius:14 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:s.c, letterSpacing:-1 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:sub, marginTop:4, fontWeight:600 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {def.length>0&&(
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:13, color:sub }}>Resolution Progress</div>
                  <div style={{ fontSize:13, color:txt, fontWeight:700 }}>{pct}%</div>
                </div>
                <div style={{ height:6, background:iosBg, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:gold, borderRadius:99 }}/>
                </div>
              </div>
            )}
          </div>

          {/* DEFECTS */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14, paddingLeft:4 }}>Defect Details</div>
            {def.length===0?(
              <div style={{ textAlign:"center", padding:24, color:sub, background:white, borderRadius:16, fontSize:14 }}>No defects recorded.</div>
            ):(
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {def.map((d,idx)=>(
                  <div key={d.id} style={{ background:white, borderRadius:20, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", borderLeft:`5px solid ${SEV[d.severity]?.bar}` }}>
                    {d.photo&&<img src={d.photo} alt="Defect" style={{ width:"100%", height:160, objectFit:"cover" }}/>}
                    <div style={{ padding:"14px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:sub }}>#{idx+1}</span>
                        <Pill type="sev" value={d.severity}/>
                        <Pill type="sta" value={d.status}/>
                      </div>
                      <div style={{ fontSize:13, color:sub, marginBottom:6 }}>📍 {d.location} · {d.category}</div>
                      <div style={{ fontSize:14, color:txt, lineHeight:1.6 }}>{d.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIGNATURE */}
          <div style={{ background:white, borderRadius:20, padding:"24px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:20 }}>Signatures</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {["Inspector","Client / Owner"].map(s=>(
                <div key={s} style={{ textAlign:"center" }}>
                  <div style={{ borderBottom:`1.5px solid ${txt}`, marginBottom:10, height:60 }}/>
                  <div style={{ fontSize:12, color:sub, fontWeight:600 }}>{s}</div>
                  <div style={{ fontSize:11, color:sub, marginTop:4 }}>Date: ___________</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // REPORTS LIST
  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:white, padding:"72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize:28, color:txt, letterSpacing:-0.8, marginBottom:4 }}>Reports</div>
        <div style={{ fontSize:14, color:sub }}>View and print inspection reports</div>
      </div>

      <div style={{ padding:"0 16px" }}>
        {loading?(
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ):inspections.length===0?(
          <EmptyState icon="📄" title="No reports yet" desc="Complete an inspection to generate a report"/>
        ):(
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {inspections.map(i=>(
              <Card key={i.id} style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:txt, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                    <div style={{ fontSize:13, color:sub, display:"flex", flexWrap:"wrap", gap:"3px 12px" }}>
                      <span>📅 {i.date}</span>
                      <span>🔍 {(i.defects||[]).length} defect{(i.defects||[]).length!==1?"s":""}</span>
                      <span>📍 {i.city}</span>
                    </div>
                  </div>
                  <Pill type="insp" value={i.status}/>
                </div>
                <button onClick={()=>setReportId(i.id)} style={{ width:"100%", padding:"12px", background:gold, color:white, border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${gold}40` }}>
                  View Report →
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}