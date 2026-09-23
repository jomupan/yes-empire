import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Pill from "../components/Pill";
import Fld from "../components/Fld";
import EmptyState from "../components/EmptyState";
import { FLOOR_PLANS } from "../floorPlans";
import { white, black, gold, txt, sub, bdr, red, green, iosBg, iosSep, SEV, STA, LOCS, CATS, ELEMENTS, DEFECT_TYPES } from "../config";

export default function Detail({ inspections, selId, nav, setReportId, isLaptop }) {
  const [showDF,       setShowDF]       = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [dForm,        setDForm]        = useState({ location:"", category:"", element:"", defectType:"", severity:"Medium", status:"Open", description:"", photos:[] });
  const [dErr,         setDErr]         = useState({});
  const [floorPlan,    setFloorPlan]    = useState(null);
  const [markers,      setMarkers]      = useState([]);
  const [markingMode,  setMarkingMode]  = useState(false);
  const [showFP,       setShowFP]       = useState(false);
  const [showFPPicker, setShowFPPicker] = useState(false);
  const [lightbox,     setLightbox]     = useState(null);

  const sel = inspections.find(i => i.id === selId);

  useEffect(() => {
    if (sel) {
      setFloorPlan(sel.floorPlan || null);
      setMarkers(sel.floorPlanMarkers || []);
    }
  }, [selId]);

  if (!sel) return null;

  const defs       = sel.defects||[];
  const unresolved = defs.filter(d=>d.status!=="Resolved").length;
  const pct        = defs.length>0 ? Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100) : 0;

  const setD = (k,v) => { setDForm(f=>({...f,[k]:v})); setDErr(e=>({...e,[k]:undefined})); };

  const iSt = (field) => ({
    width:"100%", padding:"12px 14px", borderRadius:0,
    fontSize:13, color:txt, fontFamily:"inherit",
    border:`1.5px solid ${dErr[field]?red:"#E5E5EA"}`,
    outline:"none", background:white, boxSizing:"border-box",
  });
  const sSt = (field) => ({ ...iSt(field), appearance:"none" });

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h = h*(MAX/w); w = MAX; } }
          else { if (h > MAX) { w = w*(MAX/h); h = MAX; } }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setDForm(f => ({...f, photos:[...(f.photos||[]), compressed]}));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => setDForm(f => ({...f, photos: f.photos.filter((_,i)=>i!==idx)}));

  const handleFloorPlan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fp = ev.target.result;
      setFloorPlan(fp);
      await updateDoc(doc(db,"inspections",selId), { floorPlan: fp });
    };
    reader.readAsDataURL(file);
  };

  const removeFloorPlan = async () => {
    setFloorPlan(null);
    setMarkers([]);
    await updateDoc(doc(db,"inspections",selId), { floorPlan:null, floorPlanMarkers:[] });
  };

  const selectPresetFloorPlan = async (plan) => {
    setFloorPlan(plan.image);
    setShowFPPicker(false);
    await updateDoc(doc(db,"inspections",selId), { floorPlan: plan.image });
  };

  const handleFloorPlanClick = async (e) => {
    if (!markingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newMarker = { id:Date.now().toString(), x, y };
    const updated = [...markers, newMarker];
    setMarkers(updated);
    await updateDoc(doc(db,"inspections",selId), { floorPlanMarkers: updated });
  };

  const removeMarker = async (markerId, e) => {
    e.stopPropagation();
    const updated = markers.filter(m => m.id !== markerId);
    setMarkers(updated);
    await updateDoc(doc(db,"inspections",selId), { floorPlanMarkers: updated });
  };

  const clearMarkers = async () => {
    setMarkers([]);
    await updateDoc(doc(db,"inspections",selId), { floorPlanMarkers: [] });
  };

  const valDef = () => {
    const e = {};
    if (!dForm.location)           e.location    = "Required";
    if (!dForm.element)            e.element     = "Required";
    if (!dForm.defectType)         e.defectType  = "Required";
    if (!dForm.category)           e.category    = "Required";
    if (!dForm.description.trim()) e.description = "Required";
    return e;
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
    setDForm({ location:"", category:"", element:"", defectType:"", severity:"Medium", status:"Open", description:"", photos:[] });
    setDErr({});
    setSaving(false);
    setShowDF(false);
  };

  const deleteDefect = async (defId) => {
    await updateDoc(doc(db,"inspections",selId), { defects: defs.filter(d=>d.id!==defId) });
  };

  const updDefSt = async (defId, st) => {
    await updateDoc(doc(db,"inspections",selId), { defects: defs.map(d=>d.id===defId?{...d,status:st}:d) });
  };

  const markDone = async () => {
    await updateDoc(doc(db,"inspections",selId), { status:"Completed" });
  };

  const deleteInspection = async () => {
    await deleteDoc(doc(db,"inspections",selId));
    nav("list");
  };

  const getDefectPhotos = (d) => {
    if (d.photos && d.photos.length>0) return d.photos;
    if (d.photo) return [d.photo];
    return [];
  };

  const pad = isLaptop ? "0 40px" : "0 16px";

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:black, padding: isLaptop?"40px 40px 28px":"72px 24px 24px", marginBottom:1 }}>
        <button onClick={()=>nav("list")} style={{ background:"none", border:"none", color:gold, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:16, letterSpacing:0.5 }}>
          ← All Inspections
        </button>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize: isLaptop?28:22, color:white, letterSpacing:-0.5, marginBottom:10 }}>{sel.title}</div>
            <Pill type="insp" value={sel.status}/>
          </div>
          <button onClick={()=>setConfirmDel(true)} style={{ padding:"9px 16px", background:"rgba(255,59,48,0.15)", color:"#FF3B30", border:"none", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            Delete
          </button>
        </div>
        {defs.length>0&&(
          <div style={{ marginTop:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase" }}>Resolution</div>
              <div style={{ fontSize:11, color:gold, fontWeight:700 }}>{pct}%</div>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:gold, transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:pad }}>

        {/* INFO */}
        {isLaptop ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"#E5E5EA", marginBottom:16 }}>
            <div style={{ background:white, padding:"24px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[{l:"Client",v:sel.client},{l:"Inspector",v:sel.inspector},{l:"Type",v:sel.propertyType},{l:"Date",v:sel.date},{l:"City",v:sel.city},{l:"State",v:sel.state}].map(r=>(
                  <div key={r.l}>
                    <div style={{ fontSize:10, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{r.l}</div>
                    <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #E5E5EA" }}>
                <div style={{ fontSize:10, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Address</div>
                <div style={{ fontSize:14, color:txt }}>{sel.address}, {sel.postcode}</div>
              </div>
            </div>
            <div style={{ background:white, padding:"24px", display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Actions</div>
              <button onClick={()=>{setReportId(sel.id);nav("reports");}} style={{ padding:"13px 16px", background:iosBg, color:txt, border:"1px solid #E5E5EA", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                View Report
              </button>
              {unresolved===0&&defs.length>0&&sel.status!=="Completed"&&(
                <button onClick={markDone} style={{ padding:"13px 16px", background:black, color:white, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background:white, padding:"20px", marginBottom:1 }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{l:"Client",v:sel.client},{l:"Inspector",v:sel.inspector},{l:"Type",v:sel.propertyType},{l:"Date",v:sel.date},{l:"City",v:sel.city},{l:"State",v:sel.state}].map(r=>(
                  <div key={r.l}>
                    <div style={{ fontSize:10, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>{r.l}</div>
                    <div style={{ fontSize:13, color:txt, fontWeight:500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #E5E5EA" }}>
                <div style={{ fontSize:10, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Address</div>
                <div style={{ fontSize:13, color:txt }}>{sel.address}, {sel.postcode}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:1, marginBottom:16, background:"#E5E5EA" }}>
              <button onClick={()=>{setReportId(sel.id);nav("reports");}} style={{ flex:1, padding:"13px", background:white, color:txt, border:"none", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                View Report
              </button>
              {unresolved===0&&defs.length>0&&sel.status!=="Completed"&&(
                <button onClick={markDone} style={{ flex:1, padding:"13px", background:black, color:white, border:"none", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        )}

        {/* FLOOR PLAN */}
        <div style={{ background:white, padding:"20px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase" }}>Floor Plan</div>
            <div style={{ display:"flex", gap:8 }}>
              {floorPlan&&(
                <button onClick={()=>setShowFP(!showFP)} style={{ padding:"7px 14px", background:showFP?black:iosBg, color:showFP?white:txt, border:"1px solid #E5E5EA", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                  {showFP?"Hide":"View"}
                </button>
              )}
              <button onClick={()=>setShowFPPicker(true)} style={{ padding:"7px 14px", background:gold, color:white, border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                {floorPlan?"Change":"Select"}
              </button>
              {floorPlan&&(
                <button onClick={removeFloorPlan} style={{ padding:"7px 14px", background:"rgba(255,59,48,0.1)", color:red, border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* FLOOR PLAN PICKER */}
          {showFPPicker&&(
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>setShowFPPicker(false)}>
              <div style={{ background:white, padding:24, width:"100%", maxWidth:440 }} onClick={e=>e.stopPropagation()}>
                <div style={{ fontWeight:800, fontSize:18, color:txt, marginBottom:4 }}>Select Floor Plan</div>
                <div style={{ fontSize:13, color:sub, marginBottom:20 }}>Choose a preset or upload your own</div>
                <div style={{ display:"flex", flexDirection:"column", gap:1, background:"#E5E5EA", marginBottom:16 }}>
                  {FLOOR_PLANS.map(plan=>(
                    <button key={plan.id} onClick={()=>selectPresetFloorPlan(plan)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:white, border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                      <img src={plan.image} alt={plan.label} style={{ width:56, height:56, objectFit:"cover", border:"1px solid #E5E5EA" }}/>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:txt }}>{plan.name}</div>
                        <div style={{ fontSize:12, color:gold, fontWeight:600, marginTop:2 }}>{plan.type}</div>
                      </div>
                      <div style={{ marginLeft:"auto", fontSize:18, color:sub }}>›</div>
                    </button>
                  ))}
                </div>
                <div style={{ borderTop:"1px solid #E5E5EA", paddingTop:14, marginBottom:10 }}>
                  <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", background:iosBg, border:"1px solid #E5E5EA", cursor:"pointer", fontWeight:600, fontSize:13, color:txt }}>
                    Upload from device
                    <input type="file" accept="image/*" onChange={(e)=>{ handleFloorPlan(e); setShowFPPicker(false); }} style={{ display:"none" }}/>
                  </label>
                </div>
                <button onClick={()=>setShowFPPicker(false)} style={{ width:"100%", padding:"12px", background:iosBg, color:sub, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!floorPlan ? (
            <button onClick={()=>setShowFPPicker(true)} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px", border:"2px dashed #E5E5EA", cursor:"pointer", background:iosBg, color:sub, width:"100%", fontFamily:"inherit" }}>
              <div style={{ fontWeight:700, fontSize:14, color:txt, marginBottom:4 }}>No floor plan selected</div>
              <div style={{ fontSize:12 }}>Tap to choose a floor plan</div>
            </button>
          ) : showFP ? (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                <button onClick={()=>setMarkingMode(!markingMode)} style={{ padding:"8px 14px", background:markingMode?gold:iosBg, color:markingMode?white:txt, border:"1px solid #E5E5EA", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5, textTransform:"uppercase" }}>
                  {markingMode?"Marking On — Tap to Place":"Mark Location"}
                </button>
                {markers.length>0&&(
                  <>
                    <button onClick={async()=>{
                      const updated=markers.slice(0,-1);
                      setMarkers(updated);
                      await updateDoc(doc(db,"inspections",selId),{floorPlanMarkers:updated});
                    }} style={{ padding:"8px 14px", background:iosBg, color:txt, border:"1px solid #E5E5EA", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                      Undo Last
                    </button>
                    <button onClick={clearMarkers} style={{ padding:"8px 14px", background:"rgba(255,59,48,0.1)", color:red, border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                      Clear All ({markers.length})
                    </button>
                  </>
                )}
              </div>
              {markingMode&&(
                <div style={{ padding:"10px 14px", background:`${gold}15`, fontSize:12, color:gold, fontWeight:600, marginBottom:12, textAlign:"center" }}>
                  Tap on the floor plan to mark a defect location
                </div>
              )}
              <div style={{ position:"relative", overflow:"hidden", border:"1px solid #E5E5EA", cursor:markingMode?"crosshair":"default", userSelect:"none" }} onClick={handleFloorPlanClick}>
                <img src={floorPlan} alt="Floor Plan" style={{ width:"100%", display:"block" }}/>
                {markers.map((m,idx)=>(
                  <div key={m.id} onClick={(e)=>removeMarker(m.id,e)} style={{
                    position:"absolute", left:`${m.x}%`, top:`${m.y}%`,
                    transform:"translate(-50%,-50%)",
                    width:26, height:26, borderRadius:"50%",
                    background:red, color:white,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:900,
                    border:"2px solid white",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
                    cursor:"pointer", zIndex:10,
                  }}>
                    {idx+1}
                  </div>
                ))}
              </div>
              {markers.length>0&&(
                <div style={{ fontSize:11, color:sub, marginTop:8, textAlign:"center" }}>
                  {markers.length} location{markers.length!==1?"s":""} marked
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:"14px", background:iosBg, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:txt }}>Floor plan selected</div>
                <div style={{ fontSize:11, color:sub, marginTop:2 }}>{markers.length} location{markers.length!==1?"s":""} marked</div>
              </div>
            </div>
          )}
        </div>

        {/* DEFECTS HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:sub, letterSpacing:1.5, textTransform:"uppercase", padding:"0 0 8px" }}>
            Defects ({defs.length})
          </div>
          <button onClick={()=>setShowDF(true)} style={{ padding:"10px 18px", background:gold, color:white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase" }}>
            + Add Defect
          </button>
        </div>

        {/* DEFECTS LIST */}
        {defs.length===0 ? (
          <EmptyState icon="🔍" title="No defects yet" desc="Tap Add Defect to start recording"/>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(2,1fr)":"1fr", gap:1, background:"#E5E5EA" }}>
            {defs.map(d=>{
              const defPhotos=getDefectPhotos(d);
              return(
                <div key={d.id} style={{ background:white, borderLeft:`4px solid ${SEV[d.severity]?.bar||"#ccc"}` }}>
                  {/* PHOTOS */}
                  {defPhotos.length>0&&(
                    <div style={{ display:"grid", gridTemplateColumns:defPhotos.length===1?"1fr":"1fr 1fr", gap:1 }}>
                      {defPhotos.map((p,idx)=>(
                        <div key={idx} onClick={()=>setLightbox(p)} style={{ height:defPhotos.length===1?200:120, overflow:"hidden", cursor:"pointer" }}>
                          <img src={p} alt={`Photo ${idx+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.2s" }}
                            onMouseEnter={e=>e.target.style.transform="scale(1.03)"}
                            onMouseLeave={e=>e.target.style.transform="scale(1)"}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding:"14px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8, flex:1 }}>
                        <Pill type="sev" value={d.severity}/>
                        <Pill type="sta" value={d.status}/>
                        <span style={{ fontSize:11, color:sub, background:iosBg, padding:"3px 8px", fontWeight:500 }}>{d.category}</span>
                      </div>
                      <button onClick={()=>deleteDefect(d.id)} style={{ background:"none", border:"none", color:red, fontSize:16, cursor:"pointer", opacity:0.5, flexShrink:0 }}>×</button>
                    </div>
                    <div style={{ fontSize:12, color:sub, marginBottom:4, fontWeight:500 }}>{d.location}</div>
                    {d.element&&<div style={{ fontSize:12, color:sub, marginBottom:4 }}>Element: {d.element}</div>}
                    {d.defectType&&<div style={{ fontSize:12, color:sub, marginBottom:6 }}>Defect: {d.defectType}</div>}
                    <p style={{ fontSize:13, color:txt, margin:0, lineHeight:1.6 }}>{d.description}</p>
                    {defPhotos.length>1&&(
                      <div style={{ fontSize:11, color:sub, marginTop:6, letterSpacing:0.5 }}>{defPhotos.length} PHOTOS — TAP TO VIEW</div>
                    )}
                    {d.status!=="Resolved"&&(
                      <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                        {d.status==="Open"&&(
                          <button onClick={()=>updDefSt(d.id,"In Progress")} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background:STA["In Progress"].bg, color:STA["In Progress"].color }}>
                            In Progress
                          </button>
                        )}
                        <button onClick={()=>updDefSt(d.id,"Resolved")} style={{ padding:"7px 14px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background:STA["Resolved"].bg, color:STA["Resolved"].color }}>
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PHOTO LIGHTBOX */}
      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.95)",
          zIndex:500, display:"flex", alignItems:"center",
          justifyContent:"center", padding:20,
        }}>
          <button onClick={()=>setLightbox(null)} style={{
            position:"absolute", top:20, right:20,
            background:"rgba(255,255,255,0.1)", border:"none",
            color:white, width:44, height:44, borderRadius:"50%",
            fontSize:20, cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>✕</button>
          <img src={lightbox} alt="Full view" onClick={e=>e.stopPropagation()} style={{
            maxWidth:"100%", maxHeight:"90vh", objectFit:"contain",
            animation:"fadeIn 0.2s ease",
          }}/>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {/* DELETE MODAL */}
      {confirmDel&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:white, padding:28, width:"100%", maxWidth:400 }}>
            <div style={{ fontWeight:800, fontSize:18, color:txt, marginBottom:8 }}>Delete Inspection?</div>
            <div style={{ fontSize:14, color:sub, marginBottom:28, lineHeight:1.6 }}>This will permanently delete this inspection and all defects. Cannot be undone.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(false)} style={{ flex:1, padding:14, background:iosBg, color:txt, border:"none", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={deleteInspection} style={{ flex:1, padding:14, background:red, color:white, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEFECT PANEL */}
      {showDF&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems: isLaptop?"center":"flex-end", justifyContent:"center", padding: isLaptop?40:0 }} onClick={()=>setShowDF(false)}>
          <div style={{ width:"100%", maxWidth: isLaptop?560:480, background:white, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            {!isLaptop&&(
              <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
                <div style={{ width:40, height:4, background:"#E5E5EA" }}/>
              </div>
            )}
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #E5E5EA", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:800, fontSize:18, color:txt }}>Add Defect</div>
              <button onClick={()=>setShowDF(false)} style={{ background:iosBg, border:"none", color:sub, width:32, height:32, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16, flex:1, overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Fld label="Location" error={dErr.location}>
                  <select style={sSt("location")} value={dForm.location} onChange={e=>setD("location",e.target.value)}>
                    <option value="">Select...</option>
                    {LOCS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </Fld>
                <Fld label="Element" error={dErr.element}>
                  <select style={sSt("element")} value={dForm.element} onChange={e=>setD("element",e.target.value)}>
                    <option value="">Select...</option>
                    {ELEMENTS.map(e=><option key={e}>{e}</option>)}
                  </select>
                </Fld>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Fld label="Defect Type" error={dErr.defectType}>
                  <select style={sSt("defectType")} value={dForm.defectType} onChange={e=>setD("defectType",e.target.value)}>
                    <option value="">Select...</option>
                    {DEFECT_TYPES.map(d=><option key={d}>{d}</option>)}
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
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {["Low","Medium","High","Critical"].map(s=>(
                    <button key={s} onClick={()=>setD("severity",s)} style={{
                      padding:"10px 4px", fontSize:11, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit", border:"none",
                      letterSpacing:0.5, textTransform:"uppercase",
                      background: dForm.severity===s ? SEV[s].bar : iosBg,
                      color:      dForm.severity===s ? white : sub,
                    }}>{s}</button>
                  ))}
                </div>
              </Fld>
              <Fld label="Description" error={dErr.description}>
                <textarea rows={3} placeholder="Describe the defect clearly..." value={dForm.description} onChange={e=>setD("description",e.target.value)} style={{...iSt("description"),resize:"none",lineHeight:1.6}}/>
              </Fld>
              <Fld label="Photos" optional>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {dForm.photos&&dForm.photos.length>0&&(
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                      {dForm.photos.map((p,idx)=>(
                        <div key={idx} style={{ position:"relative", aspectRatio:"1", overflow:"hidden" }}>
                          <img src={p} alt={`Photo ${idx+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          <button onClick={()=>removePhoto(idx)} style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.6)", border:"none", color:white, width:20, height:20, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                      <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"1px dashed #E5E5EA", cursor:"pointer", background:iosBg, color:sub, aspectRatio:"1" }}>
                        <span style={{ fontSize:20 }}>+</span>
                        <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }}/>
                      </label>
                    </div>
                  )}
                  {(!dForm.photos||dForm.photos.length===0)&&(
                    <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", border:"1px dashed #E5E5EA", cursor:"pointer", background:iosBg, color:sub }}>
                      <div style={{ fontWeight:600, fontSize:13, color:txt, marginBottom:4 }}>Upload Photos</div>
                      <div style={{ fontSize:11 }}>Select multiple photos at once</div>
                      <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }}/>
                    </label>
                  )}
                </div>
              </Fld>
              {dForm.severity&&SEV[dForm.severity]&&(
                <div style={{ padding:"10px 14px", background:SEV[dForm.severity].bg, borderLeft:`3px solid ${SEV[dForm.severity].bar}`, fontSize:12, color:SEV[dForm.severity].label, fontWeight:600 }}>
                  {dForm.severity==="Critical"?"Critical — escalate immediately":dForm.severity==="High"?"High — resolve within 48h":dForm.severity==="Medium"?"Medium — schedule this week":"Low — routine maintenance"}
                </div>
              )}
            </div>
            <div style={{ padding:"16px 24px 40px", borderTop:"1px solid #E5E5EA", display:"flex", gap:10 }}>
              <button onClick={()=>setShowDF(false)} style={{ flex:1, padding:"14px", background:iosBg, color:sub, border:"none", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={addDefect} disabled={saving} style={{ flex:2, padding:"14px", background:black, color:white, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", opacity:saving?0.7:1 }}>
                {saving?"Saving...":"Save Defect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}