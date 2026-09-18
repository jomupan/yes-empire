import { white, gold, txt, sub, iosBg, iosSep, red, SEV } from "../config";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import Card from "../components/Card";
import Pill from "../components/Pill";
import EmptyState from "../components/EmptyState";

import { useRef, useState, useEffect } from "react";

function SignaturePad({ label, sigKey, savedSig, onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig,  setHasSig]  = useState(!!savedSig);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (savedSig && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = savedSig;
      setHasSig(true);
    }
  }, [savedSig]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasSig(true);
    setSaved(false);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    setSaved(false);
    onSave(sigKey, null);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");
    onSave(sigKey, data);
    setSaved(true);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ fontSize:12, color:"#8E8E93", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{label}</div>
      <canvas
        ref={canvasRef}
        width={300} height={120}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        style={{
          width:"100%", height:120, borderRadius:12,
          border:`1.5px solid ${hasSig ? "#C9A84C" : "#E5E5EA"}`,
          background:"#FAFAFA", cursor:"crosshair",
          touchAction:"none",
        }}
      />
      <div style={{ display:"flex", gap:8 }}>
        {hasSig && (
          <>
            <button onClick={clear} style={{ flex:1, padding:"8px", background:"#FF3B3010", color:"#FF3B30", border:"none", borderRadius:10, fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              Clear
            </button>
            <button onClick={save} style={{ flex:2, padding:"8px", background: saved ? "#34C75920" : "#C9A84C", color: saved ? "#34C759" : "white", border:"none", borderRadius:10, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              {saved ? "✓ Saved" : "Save Signature"}
            </button>
          </>
        )}
        {!hasSig && (
          <div style={{ fontSize:12, color:"#8E8E93", textAlign:"center", width:"100%", paddingTop:4 }}>
            ✍️ Sign above using mouse or finger
          </div>
        )}
      </div>
    </div>
  );
}

function SignatureSection({ reportId, inspections }) {
  const ri = inspections?.find(i => i.id === reportId);
  const [sigs, setSigs] = useState({
    inspector: ri?.signatures?.inspector || null,
    client:    ri?.signatures?.client    || null,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const handleSave = async (key, data) => {
    const updated = { ...sigs, [key]: data };
    setSigs(updated);
    setSaving(true);
    try {
      await updateDoc(doc(db, "inspections", reportId), {
        signatures: updated
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.log("Error saving signature:", err);
    }
    setSaving(false);
  };

  return (
    <div style={{ background:"white", borderRadius:20, padding:"24px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#8E8E93", letterSpacing:0.5, textTransform:"uppercase" }}>Signatures</div>
        {saved && <div style={{ fontSize:12, color:"#34C759", fontWeight:600 }}>✓ Saved to Firebase</div>}
        {saving && <div style={{ fontSize:12, color:"#C9A84C", fontWeight:600 }}>Saving...</div>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <SignaturePad label="Inspector Signature" sigKey="inspector" savedSig={sigs.inspector} onSave={handleSave}/>
        <SignaturePad label="Client / Owner Signature" sigKey="client" savedSig={sigs.client} onSave={handleSave}/>
      </div>
      <div style={{ fontSize:11, color:"#8E8E93", textAlign:"center", marginTop:16 }}>
        Tap "Save Signature" after signing — signatures are saved permanently
      </div>
    </div>
  );
}

export default function Reports({ inspections, loading, reportId, setReportId, nav, isLaptop }) {
  const ri = inspections.find(i => i.id === reportId);
  const pad = isLaptop ? "0 40px" : "0 16px";

  if (reportId && ri) {
    const def = ri.defects||[];
    const res = def.filter(d=>d.status==="Resolved").length;
    const op  = def.filter(d=>d.status==="Open").length;
    const ip  = def.filter(d=>d.status==="In Progress").length;
    const pct = def.length>0 ? Math.round((res/def.length)*100) : 0;

    return (
      <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

        {/* HEADER */}
        <div style={{ background:white, padding: isLaptop ? "40px 40px 24px" : "72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:20 }}>
          <button onClick={()=>setReportId(null)} style={{ background:"none", border:"none", color:gold, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
            ‹ All Reports
          </button>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:gold, fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Official Report</div>
              <div style={{ fontWeight:800, fontSize: isLaptop ? 30 : 22, color:txt, letterSpacing:-0.5, marginBottom:8 }}>{ri.title}</div>
              <Pill type="insp" value={ri.status}/>
            </div>
            <button onClick={()=>window.print()} style={{ background:gold, color:white, border:"none", padding:"12px 20px", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 12px ${gold}40`, flexShrink:0 }}>
              🖨️ Print
            </button>
          </div>
        </div>

        <div style={{ padding:pad }}>

          {/* COMPANY BADGE */}
          <div style={{ background:gold, borderRadius:20, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 8px 24px ${gold}40` }}>
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:white }}>YES EMPIRE SDN BHD</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Official Defect Inspection Report</div>
            </div>
            <div style={{ fontWeight:900, fontSize:28, color:white, opacity:0.8 }}>YE</div>
          </div>

          {/* LAPTOP — 2 column layout */}
          {isLaptop ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              <div style={{ background:white, borderRadius:20, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:16 }}>Client Information</div>
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
                <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${iosSep}` }}>
                  <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Address</div>
                  <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{ri.address}, {ri.postcode}</div>
                </div>
                <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${iosSep}` }}>
                  <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Inspector</div>
                  <div style={{ fontSize:14, color:txt, fontWeight:500 }}>{ri.inspector} · {ri.date}</div>
                </div>
              </div>
              <div style={{ background:white, borderRadius:20, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:16 }}>Summary</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
                  {[
                    {l:"Total",       v:def.length, c:"#000"},
                    {l:"Open",        v:op,         c:red},
                    {l:"In Progress", v:ip,         c:"#AF52DE"},
                    {l:"Resolved",    v:res,        c:"#34C759"},
                  ].map(s=>(
                    <div key={s.l} style={{ textAlign:"center", padding:"16px 8px", background:iosBg, borderRadius:14 }}>
                      <div style={{ fontSize:28, fontWeight:800, color:s.c, letterSpacing:-1 }}>{s.v}</div>
                      <div style={{ fontSize:11, color:sub, marginTop:4, fontWeight:600 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {def.length>0&&(
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ fontSize:13, color:sub }}>Resolution</div>
                      <div style={{ fontSize:13, color:txt, fontWeight:700 }}>{pct}%</div>
                    </div>
                    <div style={{ height:6, background:iosBg, borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:gold, borderRadius:99 }}/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // MOBILE
            <div style={{ marginBottom:16 }}>
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
              </div>
              <div style={{ background:white, borderRadius:20, padding:"20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14 }}>Summary</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    {l:"Total",    v:def.length, c:"#000"},
                    {l:"Open",     v:op,         c:red},
                    {l:"Progress", v:ip,         c:"#AF52DE"},
                    {l:"Resolved", v:res,        c:"#34C759"},
                  ].map(s=>(
                    <div key={s.l} style={{ textAlign:"center", padding:"14px 8px", background:iosBg, borderRadius:14 }}>
                      <div style={{ fontSize:22, fontWeight:800, color:s.c, letterSpacing:-1 }}>{s.v}</div>
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
            </div>
          )}

          {/* DEFECTS */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14, paddingLeft:4 }}>Defect Details</div>
            {def.length===0?(
              <div style={{ textAlign:"center", padding:24, color:sub, background:white, borderRadius:16, fontSize:14 }}>No defects recorded.</div>
            ):(
              <div style={{ display:"grid", gridTemplateColumns: isLaptop ? "repeat(2,1fr)" : "1fr", gap:12 }}>
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
<SignatureSection reportId={ri.id} inspections={inspections}/>
        </div>
      </div>
    );
  }

  // REPORTS LIST
  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ background:white, padding: isLaptop ? "40px 40px 20px" : "72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize: isLaptop ? 32 : 28, color:txt, letterSpacing:-0.8, marginBottom:4 }}>Reports</div>
        <div style={{ fontSize:14, color:sub }}>View and print inspection reports</div>
      </div>
      <div style={{ padding:pad }}>
        {loading?(
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ):inspections.length===0?(
          <EmptyState icon="📄" title="No reports yet" desc="Complete an inspection to generate a report"/>
        ):(
          <div style={{ display:"grid", gridTemplateColumns: isLaptop ? "repeat(3,1fr)" : "1fr", gap:12 }}>
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