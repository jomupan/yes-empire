import { useRef, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { white, gold, txt, sub, iosBg, iosSep, red, SEV } from "../config";
import Card from "../components/Card";
import Pill from "../components/Pill";
import EmptyState from "../components/EmptyState";

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
      <div style={{ fontSize:11, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</div>
      <canvas
        ref={canvasRef}
        width={300} height={120}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        style={{
          width:"100%", height:120,
          border:`1.5px solid ${hasSig ? gold : "#E5E5EA"}`,
          background:"#FAFAFA", cursor:"crosshair",
          touchAction:"none",
        }}
      />
      <div style={{ display:"flex", gap:8 }}>
        {hasSig && (
          <>
            <button onClick={clear} style={{ flex:1, padding:"8px", background:"#FF3B3010", color:"#FF3B30", border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>Clear</button>
            <button onClick={save} style={{ flex:2, padding:"8px", background: saved?"#34C75920":gold, color: saved?"#34C759":white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>
              {saved?"✓ Saved":"Save Signature"}
            </button>
          </>
        )}
        {!hasSig && (
          <div style={{ fontSize:12, color:sub, textAlign:"center", width:"100%", paddingTop:4 }}>Sign above using mouse or finger</div>
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
      await updateDoc(doc(db, "inspections", reportId), { signatures: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.log("Error saving signature:", err);
    }
    setSaving(false);
  };

  return (
    <div style={{ background:white, padding:"24px 20px", marginTop:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase" }}>Signatures</div>
        {saved&&<div style={{ fontSize:11, color:"#34C759", fontWeight:700 }}>Saved!</div>}
        {saving&&<div style={{ fontSize:11, color:gold, fontWeight:700 }}>Saving...</div>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <SignaturePad label="Inspector Signature" sigKey="inspector" savedSig={sigs.inspector} onSave={handleSave}/>
        <SignaturePad label="Client / Owner Signature" sigKey="client" savedSig={sigs.client} onSave={handleSave}/>
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
    const markers = ri.floorPlanMarkers || [];

    const getDefectPhotos = (d) => {
      if (d.photos && d.photos.length>0) return d.photos;
      if (d.photo) return [d.photo];
      return [];
    };

    const groupedDefs = def.reduce((acc, d) => {
      const loc = d.location || "Other";
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(d);
      return acc;
    }, {});

    return (
      <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

        {/* HEADER */}
        <div style={{ background:"#000", padding: isLaptop?"40px 40px 24px":"72px 24px 20px", marginBottom:1 }}>
          <button onClick={()=>setReportId(null)} style={{ background:"none", border:"none", color:gold, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:16, letterSpacing:0.5 }}>
            ← All Reports
          </button>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:gold, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Official Report</div>
              <div style={{ fontWeight:800, fontSize: isLaptop?28:22, color:white, letterSpacing:-0.5, marginBottom:10 }}>{ri.title}</div>
              <Pill type="insp" value={ri.status}/>
            </div>
            <button onClick={()=>window.print()} style={{ background:gold, color:white, border:"none", padding:"11px 20px", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase", flexShrink:0 }}>
              Print
            </button>
          </div>
        </div>

        <div style={{ padding:pad }}>

          {/* COVER INFO */}
          <div className="cover-section" style={{ background:white, padding:"24px 20px", marginBottom:1 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, paddingBottom:20, borderBottom:"2px solid #000" }}>
              <div style={{ width:120, height:48 }}>
                <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:900, fontSize:14, color:"#000", letterSpacing:0.5 }}>DEFECT INSPECTION REPORT</div>
                <div style={{ fontSize:11, color:sub, marginTop:2 }}>{ri.date}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
              {[
                {l:"Project Title", v:ri.title},
                {l:"Client Name",   v:ri.client},
                {l:"Property Type", v:ri.propertyType},
                {l:"Inspector",     v:ri.inspector},
                {l:"Address",       v:`${ri.address}, ${ri.postcode}`},
                {l:"City / State",  v:`${ri.city}, ${ri.state}`},
              ].map((r,i)=>(
                <div key={r.l} style={{ padding:"10px 0", borderBottom:"1px solid #E5E5EA", display:"flex", gap:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:0.5, textTransform:"uppercase", minWidth:120 }}>{r.l}</div>
                  <div style={{ fontSize:13, color:txt }}>: {r.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"#E5E5EA", marginBottom:1 }}>
            {[
              {l:"Total Defects", v:def.length, c:"#000"},
              {l:"Open",          v:op,         c:red},
              {l:"In Progress",   v:ip,         c:"#AF52DE"},
              {l:"Resolved",      v:res,        c:"#34C759"},
            ].map(s=>(
              <div key={s.l} style={{ background:white, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.c, letterSpacing:-1, lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:10, color:sub, marginTop:6, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* FLOOR PLAN — clean, no markers */}
{ri.floorPlan&&(
  <div className="floorplan-section" style={{ background:white, padding:"20px", marginBottom:1 }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Floor Plan</div>
              <div style={{ fontSize:12, color:sub, marginBottom:12 }}>Property layout overview</div>
              <div style={{ border:"1px solid #E5E5EA", overflow:"hidden" }}>
                <img src={ri.floorPlan} alt="Floor Plan" style={{ width:"100%", display:"block" }}/>
              </div>
            </div>
          )}

          {/* DEFECT CASES */}
<div style={{ marginBottom:1 }}>
  <div style={{ background:"#000", padding:"14px 20px", marginBottom:1 }}>
    <div style={{ fontSize:11, fontWeight:700, color:white, letterSpacing:2, textTransform:"uppercase" }}>Defect Cases</div>
  </div>

  {def.length===0 ? (
    <div style={{ background:white, padding:24, textAlign:"center", color:sub, fontSize:14 }}>No defects recorded.</div>
  ) : (
    <div>
  {Array.from({ length: Math.ceil(def.length / 4) }, (_, pageIdx) => (
    <div key={pageIdx} className="defect-page" style={{
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      gap:1,
      background:"#E5E5EA",
      marginBottom:1,
    }}>
      {def.slice(pageIdx * 4, (pageIdx + 1) * 4).map((d) => {
        const photos  = getDefectPhotos(d);
        const defNum  = def.indexOf(d) + 1;
        const marker  = markers[defNum - 1];

        return (
          <div key={d.id} className="defect-card" style={{ background:white }}>

            {/* DEFECT TITLE */}
            <div style={{ padding:"8px 14px", background:"#F5F5F5", borderLeft:`4px solid ${SEV[d.severity]?.bar||gold}` }}>
              <div style={{ fontWeight:800, fontSize:12, color:txt, letterSpacing:0.5 }}>DEFECT {defNum}</div>
            </div>

            <div style={{ padding:"12px 14px" }}>

              {/* TABLE WITH FLOOR PLAN */}
              <div style={{ border:"1px solid #E5E5EA", display:"flex", marginBottom: photos.length>0?12:0 }}>

                {/* LEFT — details */}
                <div style={{ flex:1, borderRight: ri.floorPlan&&marker?"1px solid #E5E5EA":"none" }}>
                  {[
                    {l:"Location",    v:d.location},
                    {l:"Element",     v:d.element||"-"},
                    {l:"Defect",      v:d.defectType||d.category},
                    {l:"Description", v:d.description},
                  ].map((r,i)=>(
                    <div key={r.l} style={{ display:"flex", borderBottom: i<3?"1px solid #E5E5EA":"none", minHeight: i===3?60:36 }}>
                      <div style={{ width:80, padding:"6px 10px", background:"#F9F9F9", fontSize:9, fontWeight:700, color:"#000", letterSpacing:0.5, textTransform:"uppercase", borderRight:"1px solid #E5E5EA", flexShrink:0 }}>
                        {r.l}
                      </div>
                      <div style={{ padding:"6px 10px", fontSize:11, color:txt, flex:1, lineHeight:1.5 }}>
                        {r.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* RIGHT — floor plan with only this marker */}
                {ri.floorPlan && marker && (
                  <div style={{ width:90, flexShrink:0, position:"relative", overflow:"hidden" }}>
                    <img src={ri.floorPlan} alt="Floor Plan" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                    <div style={{
                      position:"absolute",
                      left:`${marker.x}%`, top:`${marker.y}%`,
                      transform:"translate(-50%,-50%)",
                      width:18, height:18, borderRadius:"50%",
                      background:red, color:white,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, fontWeight:900,
                      border:"2px solid white",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.5)",
                      zIndex:10,
                    }}>
                      {defNum}
                    </div>
                  </div>
                )}
              </div>

              {/* PHOTOS */}
              {photos.length>0&&(
                <div>
                  <div style={{ fontSize:9, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Photos</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                    {photos.slice(0,2).map((p,pi)=>(
                      <div key={pi} style={{ aspectRatio:"4/3", overflow:"hidden", border:"1px solid #E5E5EA" }}>
                        <img src={p} alt={`Photo ${pi+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ))}
</div>
            const photos  = getDefectPhotos(d);
            const defNum  = def.indexOf(d) + 1;
            const marker  = markers[defNum - 1];

            return (
              <div key={d.id} className="defect-card" style={{ background:white, marginBottom:1 }}>

                {/* DEFECT TITLE */}
                <div style={{ padding:"10px 20px", background:"#F5F5F5", borderLeft:`4px solid ${SEV[d.severity]?.bar||gold}` }}>
                  <div style={{ fontWeight:800, fontSize:13, color:txt, letterSpacing:0.5 }}>DEFECT {defNum}</div>
                </div>

                <div style={{ padding:"16px 20px" }}>

                  {/* TABLE WITH FLOOR PLAN ON RIGHT */}
                  <div style={{ border:"1px solid #E5E5EA", display:"flex", marginBottom: photos.length>0?16:0 }}>

                    {/* LEFT — details */}
                    <div style={{ flex:1, borderRight: ri.floorPlan&&marker?"1px solid #E5E5EA":"none" }}>
                      {[
                        {l:"Location",    v:d.location},
                        {l:"Element",     v:d.element||"-"},
                        {l:"Defect",      v:d.defectType||d.category},
                        {l:"Description", v:d.description},
                      ].map((r,i)=>(
                        <div key={r.l} style={{ display:"flex", borderBottom: i<3?"1px solid #E5E5EA":"none", minHeight: i===3?80:40 }}>
                          <div style={{ width:110, padding:"10px 14px", background:"#F9F9F9", fontSize:11, fontWeight:700, color:"#000", letterSpacing:0.5, textTransform:"uppercase", borderRight:"1px solid #E5E5EA", flexShrink:0 }}>
                            {r.l}
                          </div>
                          <div style={{ padding:"10px 14px", fontSize:13, color:txt, flex:1, lineHeight:1.5 }}>
                            {r.v}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT — floor plan with only this marker */}
                    {ri.floorPlan && marker && (
                      <div style={{ width:160, flexShrink:0, position:"relative", overflow:"hidden" }}>
                        <img src={ri.floorPlan} alt="Floor Plan" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                        <div style={{
                          position:"absolute",
                          left:`${marker.x}%`, top:`${marker.y}%`,
                          transform:"translate(-50%,-50%)",
                          width:22, height:22, borderRadius:"50%",
                          background:red, color:white,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:900,
                          border:"2px solid white",
                          boxShadow:"0 2px 8px rgba(0,0,0,0.5)",
                          zIndex:10,
                        }}>
                          {defNum}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PHOTOS */}
                  {photos.length>0&&(
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Photos</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                        {photos.map((p,pi)=>(
                          <div key={pi} style={{ aspectRatio:"4/3", overflow:"hidden", border:"1px solid #E5E5EA" }}>
                            <img src={p} alt={`Photo ${pi+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  )}
</div>

                    {/* SIGNATURES */}
          <SignatureSection reportId={ri.id} inspections={inspections}/>

        </div>

        <style>{`
  @media print {
    button { display: none !important; }

    /* Page break after every group of 4 defects */
    .defect-page {
      page-break-after: always;
    }

    /* Keep each defect together */
    .defect-card {
      page-break-inside: avoid;
    }

    /* Cover on its own page */
    .cover-section {
      page-break-after: always;
    }

    /* Floor plan on its own page */
    .floorplan-section {
      page-break-after: always;
    }

    body { background: white !important; }
  }
`}</style>

      </div>
    );
  }

  // REPORTS LIST
  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ background:"#000", padding: isLaptop?"40px 40px 28px":"72px 24px 24px", marginBottom:1 }}>
        <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8, marginBottom:4 }}>Reports</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:0.3 }}>View and print inspection reports</div>
      </div>
      <div style={{ padding:pad }}>
        {loading?(
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ):inspections.length===0?(
          <EmptyState icon="📄" title="No reports yet" desc="Complete an inspection to generate a report"/>
        ):(
          <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(3,1fr)":"1fr", gap:1, background:"#E5E5EA" }}>
            {inspections.map(i=>(
              <div key={i.id} style={{ background:white, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:txt, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                    <div style={{ fontSize:12, color:sub, display:"flex", flexDirection:"column", gap:3 }}>
                      <span>{i.date}</span>
                      <span>{(i.defects||[]).length} defect{(i.defects||[]).length!==1?"s":""}</span>
                      <span>{i.city}</span>
                    </div>
                  </div>
                  <Pill type="insp" value={i.status}/>
                </div>
                <button onClick={()=>setReportId(i.id)} style={{ width:"100%", padding:"12px", background:"#000", color:white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1.5, textTransform:"uppercase" }}>
                  View Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 