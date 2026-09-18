import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Pill from "../components/Pill";
import Fld from "../components/Fld";
import EmptyState from "../components/EmptyState";
import { white, black, gold, txt, sub, bdr, red, green, iosBg, iosSep, SEV, STA, LOCS, CATS } from "../config";

export default function Detail({ inspections, selId, nav, setReportId, isLaptop }) {
  const [showDF,     setShowDF]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [dForm,      setDForm]      = useState({ location:"", category:"", severity:"Medium", status:"Open", description:"", photo:null });
  const [dErr,       setDErr]       = useState({});

  const sel = inspections.find(i => i.id === selId);
  if (!sel) return null;

  const defs       = sel.defects||[];
  const unresolved = defs.filter(d=>d.status!=="Resolved").length;
  const pct        = defs.length>0 ? Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100) : 0;

  const setD = (k,v) => { setDForm(f=>({...f,[k]:v})); setDErr(e=>({...e,[k]:undefined})); };

  const iSt = (field) => ({
    width:"100%", padding:"13px 16px", borderRadius:12,
    fontSize:14, color:txt, fontFamily:"inherit",
    border:`1.5px solid ${dErr[field]?red:bdr}`,
    outline:"none", background:white, boxSizing:"border-box",
    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
  });
  const sSt = (field) => ({ ...iSt(field), appearance:"none" });

  const valDef = () => {
    const e = {};
    if (!dForm.location)           e.location    = "Required";
    if (!dForm.category)           e.category    = "Required";
    if (!dForm.description.trim()) e.description = "Required";
    return e;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDForm(f=>({...f,photo:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const addDefect = async () => {
    const e = valDef();
    if (Object.keys(e).length) { setDErr(e); return; }
    setSaving(true);
    const updated = [...defs, { ...dForm, id:Date.now().toString() }];
    await updateDoc(doc(db,"inspections",selId), {
      defects: updated,
      status: sel.status==="Pending" ? "In Progress" : sel.status
    });
    setDForm({ location:"", category:"", severity:"Medium", status:"Open", description:"", photo:null });
    setDErr({});
    setSaving(false);
    setShowDF(false);
  };

  const deleteDefect = async (defId) => {
    await updateDoc(doc(db,"inspections",selId), {
      defects: defs.filter(d=>d.id!==defId)
    });
  };

  const updDefSt = async (defId, st) => {
    await updateDoc(doc(db,"inspections",selId), {
      defects: defs.map(d=>d.id===defId?{...d,status:st}:d)
    });
  };

  const markDone = async () => {
    await updateDoc(doc(db,"inspections",selId), { status:"Completed" });
  };

  const deleteInspection = async () => {
    await deleteDoc(doc(db,"inspections",selId));
    nav("list");
  };

  const pad = isLaptop ? "0 40px" : "0 16px";

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:white, padding: isLaptop ? "40px 40px 24px" : "72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:20 }}>
        <button onClick={()=>nav("list")} style={{ background:"none", border:"none", color:gold, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
          ‹ All Inspections
        </button>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize: isLaptop ? 30 : 24, color:txt, letterSpacing:-0.5, marginBottom:8 }}>{sel.title}</div>
            <Pill type="insp" value={sel.status}/>
          </div>
          <button onClick={()=>setConfirmDel(true)} style={{ padding:"10px 16px", background:"#FF3B3015", color:red, border:"none", borderRadius:12, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
            🗑️ Delete
          </button>
        </div>
        {defs.length>0&&(
          <div style={{ marginTop:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontSize:13, color:sub }}>Defect Resolution</div>
              <div style={{ fontSize:13, color:txt, fontWeight:600 }}>{pct}%</div>
            </div>
            <div style={{ height:6, background:iosBg, borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:gold, borderRadius:99, transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:pad }}>

        {/* LAPTOP — 2 column layout */}
        {isLaptop ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>

            {/* LEFT — Info */}
            <div style={{ background:white, borderRadius:20, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:16 }}>Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  {l:"Client",    v:sel.client},
                  {l:"Inspector", v:sel.inspector},
                  {l:"Type",      v:sel.propertyType},
                  {l:"Date",      v:sel.date},
                  {l:"City",      v:sel.city},
                  {l:"State",     v:sel.state},
                ].map(r=>(
                  <div key={r.l}>
                    <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{r.l}</div>
                    <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${iosSep}` }}>
                <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Address</div>
                <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{sel.address}, {sel.postcode}</div>
              </div>
            </div>

            {/* RIGHT — Actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button onClick={()=>{setReportId(sel.id);nav("reports");}} style={{ padding:"16px", background:white, color:txt, border:"none", borderRadius:16, fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", textAlign:"left" }}>
                📄 View Report
              </button>
              {unresolved===0&&defs.length>0&&sel.status!=="Completed"&&(
                <button onClick={markDone} style={{ padding:"16px", background:green, color:white, border:"none", borderRadius:16, fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${green}40`, textAlign:"left" }}>
                  ✅ Mark Complete
                </button>
              )}
            </div>
          </div>
        ) : (

          // MOBILE
          <div>
            <div style={{ background:white, borderRadius:20, padding:"20px", marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14 }}>Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  {l:"Client",    v:sel.client},
                  {l:"Inspector", v:sel.inspector},
                  {l:"Type",      v:sel.propertyType},
                  {l:"Date",      v:sel.date},
                  {l:"City",      v:sel.city},
                  {l:"State",     v:sel.state},
                ].map(r=>(
                  <div key={r.l}>
                    <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{r.l}</div>
                    <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${iosSep}` }}>
                <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Address</div>
                <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{sel.address}, {sel.postcode}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:24 }}>
              <button onClick={()=>{setReportId(sel.id);nav("reports");}} style={{ flex:1, padding:"13px", background:white, color:txt, border:"none", borderRadius:14, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                📄 Report
              </button>
              {unresolved===0&&defs.length>0&&sel.status!=="Completed"&&(
                <button onClick={markDone} style={{ flex:1, padding:"13px", background:green, color:white, border:"none", borderRadius:14, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${green}40` }}>
                  ✅ Complete
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEFECTS HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, paddingLeft:4 }}>
          <div style={{ fontWeight:700, fontSize: isLaptop ? 24 : 20, color:txt, letterSpacing:-0.5 }}>
            Defects <span style={{ color:sub, fontWeight:500, fontSize:16 }}>({defs.length})</span>
          </div>
          <button onClick={()=>setShowDF(true)} style={{ background:gold, color:white, border:"none", padding:"10px 20px", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${gold}40` }}>
            + Add Defect
          </button>
        </div>

        {/* DEFECTS LIST */}
        {defs.length===0 ? (
          <EmptyState icon="🔍" title="No defects yet" desc='Tap "+ Add Defect" to record your first finding'/>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop ? "repeat(2,1fr)" : "1fr", gap:12 }}>
            {defs.map(d=>(
              <div key={d.id} style={{ background:white, borderRadius:20, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", borderLeft:`5px solid ${SEV[d.severity]?.bar||"#ccc"}` }}>
                {d.photo&&(
                  <div style={{ height:200, overflow:"hidden" }}>
                    <img src={d.photo} alt="Defect" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </div>
                )}
                <div style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8, flex:1 }}>
                      <Pill type="sev" value={d.severity}/>
                      <Pill type="sta" value={d.status}/>
                      <span style={{ fontSize:12, color:sub, background:iosBg, padding:"3px 9px", borderRadius:99, fontWeight:500 }}>{d.category}</span>
                    </div>
                    <button onClick={()=>deleteDefect(d.id)} style={{ background:"none", border:"none", color:red, fontSize:18, cursor:"pointer", opacity:0.5, flexShrink:0 }}>×</button>
                  </div>
                  <div style={{ fontSize:13, color:sub, marginBottom:8, fontWeight:500 }}>📍 {d.location}</div>
                  <p style={{ fontSize:14, color:txt, margin:0, lineHeight:1.6 }}>{d.description}</p>
                  {d.status!=="Resolved"&&(
                    <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                      {d.status==="Open"&&(
                        <button onClick={()=>updDefSt(d.id,"In Progress")} style={{ padding:"8px 16px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"none", background:STA["In Progress"].bg, color:STA["In Progress"].color }}>
                          In Progress
                        </button>
                      )}
                      <button onClick={()=>updDefSt(d.id,"Resolved")} style={{ padding:"8px 16px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"none", background:STA["Resolved"].bg, color:STA["Resolved"].color }}>
                        ✓ Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {confirmDel&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:white, borderRadius:20, padding:28, width:"100%", maxWidth:400, boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:36, textAlign:"center", marginBottom:12 }}>🗑️</div>
            <div style={{ fontWeight:800, fontSize:20, color:txt, textAlign:"center", marginBottom:8 }}>Delete Inspection?</div>
            <div style={{ fontSize:14, color:sub, textAlign:"center", marginBottom:28, lineHeight:1.6 }}>This will permanently delete this inspection and all defects. Cannot be undone.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={deleteInspection} style={{ padding:"16px", background:red, color:white, border:"none", borderRadius:14, fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
              <button onClick={()=>setConfirmDel(false)} style={{ padding:"16px", background:iosBg, color:txt, border:"none", borderRadius:14, fontWeight:600, fontSize:16, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEFECT PANEL */}
      {showDF&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems: isLaptop ? "center" : "flex-end", justifyContent:"center", padding: isLaptop ? 40 : 0 }} onClick={()=>setShowDF(false)}>
          <div style={{ width:"100%", maxWidth: isLaptop ? 560 : 480, background:white, borderRadius: isLaptop ? 24 : "24px 24px 0 0", maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            {!isLaptop&&(
              <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
                <div style={{ width:40, height:4, background:iosSep, borderRadius:99 }}/>
              </div>
            )}
            <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${iosSep}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:800, fontSize:20, color:txt }}>Add Defect</div>
              <button onClick={()=>setShowDF(false)} style={{ background:iosBg, border:"none", color:sub, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16, flex:1, overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Fld label="Location" error={dErr.location}>
                  <select style={sSt("location")} value={dForm.location} onChange={e=>setD("location",e.target.value)}>
                    <option value="">Select...</option>
                    {LOCS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </Fld>
                <Fld label="Category" error={dErr.category}>
                  <select style={sSt("category")} value={dForm.category} onChange={e=>setD("category",e.target.value)}>
                    <option value="">Select...</option>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </Fld>
              </div>
              <Fld label="Severity">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {["Low","Medium","High","Critical"].map(s=>(
                    <button key={s} onClick={()=>setD("severity",s)} style={{
                      padding:"10px 4px", fontSize:11, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit",
                      borderRadius:10, border:"none",
                      background: dForm.severity===s ? SEV[s].bar : iosBg,
                      color:      dForm.severity===s ? white : sub,
                      transition:"all 0.15s ease",
                    }}>{s}</button>
                  ))}
                </div>
              </Fld>
              <Fld label="Description" error={dErr.description}>
                <textarea rows={4} placeholder="Describe the defect clearly..." value={dForm.description} onChange={e=>setD("description",e.target.value)} style={{...iSt("description"),resize:"none",lineHeight:1.6}}/>
              </Fld>
              <Fld label="Photo" optional>
                {dForm.photo?(
                  <div style={{ position:"relative" }}>
                    <img src={dForm.photo} alt="Preview" style={{ width:"100%", height:180, objectFit:"cover", borderRadius:14 }}/>
                    <button onClick={()=>setD("photo",null)} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", border:"none", color:white, borderRadius:"50%", width:28, height:28, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  </div>
                ):(
                  <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px", borderRadius:14, border:`2px dashed ${bdr}`, cursor:"pointer", background:iosBg, color:sub }}>
                    <span style={{ fontSize:32, marginBottom:8 }}>📸</span>
                    <span style={{ fontWeight:600, fontSize:14 }}>Upload Photo</span>
                    <span style={{ fontSize:12, marginTop:4 }}>JPG, PNG supported</span>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
                  </label>
                )}
              </Fld>
              {dForm.severity&&SEV[dForm.severity]&&(
                <div style={{ padding:"12px 16px", borderRadius:12, background:SEV[dForm.severity].bg, borderLeft:`4px solid ${SEV[dForm.severity].bar}`, fontSize:13, color:SEV[dForm.severity].label, fontWeight:600 }}>
                  {dForm.severity==="Critical"?"🚨 Critical — escalate immediately":dForm.severity==="High"?"⚠️ High — resolve within 48h":dForm.severity==="Medium"?"📋 Medium — schedule this week":"✅ Low — routine maintenance"}
                </div>
              )}
            </div>
            <div style={{ padding:"16px 24px 40px", borderTop:`1px solid ${iosSep}`, display:"flex", gap:10 }}>
              <button onClick={()=>setShowDF(false)} style={{ flex:1, padding:"15px", background:iosBg, color:sub, border:"none", borderRadius:14, fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={addDefect} disabled={saving} style={{ flex:2, padding:"15px", background:gold, color:white, border:"none", borderRadius:14, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${gold}40`, opacity:saving?0.7:1 }}>
                {saving?"Saving...":"Save Defect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}