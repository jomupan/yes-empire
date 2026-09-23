import { useRef, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { white, gold, txt, sub, iosBg, red, SEV } from "../config";
import Card from "../components/Card";
import Pill from "../components/Pill";
import EmptyState from "../components/EmptyState";

function SignaturePad({ label, sigKey, savedSig, onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [active,  setActive]  = useState(false);
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
    if (!active) return;
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
    if (!active) return;
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
    if (!active) return;
    e.preventDefault();
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    setSaved(false);
    setActive(false);
    onSave(sigKey, null);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");
    onSave(sigKey, data);
    setSaved(true);
    setActive(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ fontSize:11, color:sub, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</div>

      {/* CANVAS */}
      <div style={{ position:"relative" }}>
        <canvas
          ref={canvasRef}
          width={300} height={120}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          style={{
            width:"100%", height:120,
            border:`1.5px solid ${active ? gold : hasSig ? "#34C759" : "#E5E5EA"}`,
            background: active ? "#FFFBF0" : "#FAFAFA",
            cursor: active ? "crosshair" : "default",
            touchAction:"none", display:"block",
          }}
        />
        {/* LOCK OVERLAY */}
        {!active && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(250,250,250,0.85)" }}>
            {hasSig ? (
              <div style={{ fontSize:12, color:"#34C759", fontWeight:700, letterSpacing:0.5 }}>✓ Signature saved</div>
            ) : (
              <button onClick={()=>setActive(true)} style={{ padding:"10px 20px", background:gold, color:white, border:"none", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>
                Tap to Sign
              </button>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS WHEN ACTIVE */}
      {active && (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={clear} style={{ flex:1, padding:"8px", background:"#FF3B3010", color:"#FF3B30", border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Clear</button>
          <button onClick={()=>setActive(false)} style={{ flex:1, padding:"8px", background:"#F5F5F5", color:sub, border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          {hasSig && (
            <button onClick={save} style={{ flex:2, padding:"8px", background:saved?"#34C75920":gold, color:saved?"#34C759":white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
              {saved?"✓ Saved":"Save Signature"}
            </button>
          )}
        </div>
      )}

      {/* EDIT/CLEAR WHEN SAVED */}
      {!active && hasSig && (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setActive(true)} style={{ flex:1, padding:"8px", background:"#F5F5F5", color:sub, border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Edit</button>
          <button onClick={clear} style={{ flex:1, padding:"8px", background:"#FF3B3010", color:"#FF3B30", border:"none", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Clear</button>
        </div>
      )}
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
    const def     = ri.defects||[];
    const res     = def.filter(d=>d.status==="Resolved").length;
    const op      = def.filter(d=>d.status==="Open").length;
    const ip      = def.filter(d=>d.status==="In Progress").length;
    const markers = ri.floorPlanMarkers || [];

    const getDefectPhotos = (d) => {
      if (d.photos && d.photos.length>0) return d.photos;
      if (d.photo) return [d.photo];
      return [];
    };

    const defGroups = Array.from({ length: Math.ceil(def.length / 4) }, (_, i) =>
      def.slice(i * 4, (i + 1) * 4)
    );

    const handlePrint = () => {
      const printWindow = window.open("", "_blank");
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${ri.title} — Defect Report</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: white; }
            @page { size: A4; margin: 10mm; }
            .cover { padding: 20px; page-break-after: always; }
            .cover-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 16px; }
            .cover-logo { width: 120px; height: 48px; object-fit: contain; }
            .cover-row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
            .cover-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #666; min-width: 120px; }
            .cover-val { font-size: 12px; color: #000; }
            .summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #eee; margin-top: 16px; }
            .summary-box { background: white; padding: 14px; text-align: center; }
            .summary-num { font-size: 24px; font-weight: 800; line-height: 1; }
            .summary-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 4px; }
            .floorplan { padding: 20px; page-break-after: always; }
            .floorplan-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 10px; }
            .floorplan img { width: 100%; border: 1px solid #eee; display: block; }
            .section-header { background: #000; color: white; padding: 10px 16px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .defect-page { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; page-break-after: always; padding: 4px; }
            .defect-card { border: 1px solid #ddd; background: white; }
            .defect-header { padding: 7px 12px; background: #f5f5f5; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; border-left: 3px solid #F07C1E; }
            .defect-body { padding: 10px 12px; }
            .defect-table { border: 1px solid #eee; display: flex; margin-bottom: 10px; }
            .defect-fields { flex: 1; }
            .defect-row { display: flex; border-bottom: 1px solid #eee; min-height: 28px; }
            .defect-row:last-child { border-bottom: none; min-height: 50px; }
            .defect-key { width: 75px; padding: 5px 8px; background: #f9f9f9; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-right: 1px solid #eee; flex-shrink: 0; }
            .defect-val { padding: 5px 8px; font-size: 10px; flex: 1; line-height: 1.4; }
            .fp-thumb { width: 85px; flex-shrink: 0; position: relative; overflow: hidden; border-left: 1px solid #eee; }
            .fp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .fp-marker { position: absolute; border-radius: 50%; background: red; color: white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; border: 1.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.5); transform: translate(-50%,-50%); width: 16px; height: 16px; }
            .photos-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 6px; }
            .photos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
            .photos-grid img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border: 1px solid #eee; display: block; }
          </style>
        </head>
        <body>
          <div class="cover">
            <div class="cover-header">
              <img class="cover-logo" src="${window.location.origin}/BENAMORA.jpeg" alt="Benamora"/>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:900">DEFECT INSPECTION REPORT</div>
                <div style="font-size:11px;color:#666;margin-top:4px">${ri.date}</div>
              </div>
            </div>
            ${[
              ["Project Title", ri.title],
              ["Client Name",   ri.client],
              ["Property Type", ri.propertyType],
              ["Inspector",     ri.inspector],
              ["Address",       `${ri.address}, ${ri.postcode}`],
              ["City / State",  `${ri.city}, ${ri.state}`],
            ].map(([l,v])=>`
              <div class="cover-row">
                <div class="cover-label">${l}</div>
                <div class="cover-val">: ${v||"-"}</div>
              </div>
            `).join("")}
            <div class="summary">
              <div class="summary-box"><div class="summary-num">${def.length}</div><div class="summary-lbl">Total Defects</div></div>
              <div class="summary-box"><div class="summary-num" style="color:red">${op}</div><div class="summary-lbl">Open</div></div>
              <div class="summary-box"><div class="summary-num" style="color:#AF52DE">${ip}</div><div class="summary-lbl">In Progress</div></div>
              <div class="summary-box"><div class="summary-num" style="color:#34C759">${res}</div><div class="summary-lbl">Resolved</div></div>
            </div>
          </div>
          ${ri.floorPlan ? `
            <div class="floorplan">
              <div class="floorplan-title">Floor Plan — Property Layout Overview</div>
              <img src="${ri.floorPlan}" alt="Floor Plan"/>
            </div>
          ` : ""}
          <div class="section-header">Defect Cases</div>
          ${defGroups.map(group => `
            <div class="defect-page">
              ${group.map(d => {
                const defNum = def.indexOf(d) + 1;
                const marker = markers[defNum - 1];
                const photos = getDefectPhotos(d);
                return `
                  <div class="defect-card">
                    <div class="defect-header">DEFECT ${defNum}</div>
                    <div class="defect-body">
                      <div class="defect-table">
                        <div class="defect-fields">
                          ${[
                            ["Location",    d.location||"-"],
                            ["Element",     d.element||d.category||"-"],
                            ["Defect",      d.defectType||d.category||"-"],
                            ["Description", d.description||"-"],
                          ].map(([k,v])=>`
                            <div class="defect-row">
                              <div class="defect-key">${k}</div>
                              <div class="defect-val">${v}</div>
                            </div>
                          `).join("")}
                        </div>
                        ${ri.floorPlan && marker ? `
                          <div class="fp-thumb">
                            <img src="${ri.floorPlan}" alt="fp"/>
                            <div class="fp-marker" style="left:${marker.x}%;top:${marker.y}%">${defNum}</div>
                          </div>
                        ` : ""}
                      </div>
                      ${photos.length > 0 ? `
                        <div class="photos-title">Photos</div>
                        <div class="photos-grid">
                          ${photos.slice(0,2).map(p=>`<img src="${p}" alt="photo"/>`).join("")}
                        </div>
                      ` : ""}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `).join("")}
        </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 800);
    };

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
            <button onClick={handlePrint} style={{ background:gold, color:white, border:"none", padding:"11px 20px", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase", flexShrink:0 }}>
              Print PDF
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
                <div style={{ fontWeight:900, fontSize:14, color:"#000" }}>DEFECT INSPECTION REPORT</div>
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

          {/* FLOOR PLAN */}
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
                {defGroups.map((group, pageIdx) => (
                  <div key={pageIdx} className="defect-page" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"#E5E5EA", marginBottom:1 }}>
                    {group.map((d) => {
                      const photos  = getDefectPhotos(d);
                      const defNum  = def.indexOf(d) + 1;
                      const marker  = markers[defNum - 1];
                      return (
                        <div key={d.id} className="defect-card" style={{ background:white }}>
                          <div style={{ padding:"8px 14px", background:"#F5F5F5", borderLeft:`4px solid ${SEV[d.severity]?.bar||gold}` }}>
                            <div style={{ fontWeight:800, fontSize:12, color:txt, letterSpacing:0.5 }}>DEFECT {defNum}</div>
                          </div>
                          <div style={{ padding:"12px 14px" }}>
                            <div style={{ border:"1px solid #E5E5EA", display:"flex", marginBottom: photos.length>0?12:0 }}>
                              <div style={{ flex:1, borderRight: ri.floorPlan&&marker?"1px solid #E5E5EA":"none" }}>
                                {[
                                  {l:"Location",    v:d.location},
                                  {l:"Element",     v:d.element||"-"},
                                  {l:"Defect",      v:d.defectType||d.category},
                                  {l:"Description", v:d.description},
                                ].map((r,i)=>(
                                  <div key={r.l} style={{ display:"flex", borderBottom: i<3?"1px solid #E5E5EA":"none", minHeight: i===3?60:36 }}>
                                    <div style={{ width:80, padding:"6px 10px", background:"#F9F9F9", fontSize:9, fontWeight:700, color:"#000", letterSpacing:0.5, textTransform:"uppercase", borderRight:"1px solid #E5E5EA", flexShrink:0 }}>{r.l}</div>
                                    <div style={{ padding:"6px 10px", fontSize:11, color:txt, flex:1, lineHeight:1.5 }}>{r.v}</div>
                                  </div>
                                ))}
                              </div>
                              {ri.floorPlan && marker && (
                                <div style={{ width:90, flexShrink:0, position:"relative", overflow:"hidden" }}>
                                  <img src={ri.floorPlan} alt="Floor Plan" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                                  <div style={{ position:"absolute", left:`${marker.x}%`, top:`${marker.y}%`, transform:"translate(-50%,-50%)", width:18, height:18, borderRadius:"50%", background:red, color:white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, border:"2px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.5)", zIndex:10 }}>
                                    {defNum}
                                  </div>
                                </div>
                              )}
                            </div>
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
            )}
          </div>

          {/* SIGNATURES */}
          <SignatureSection reportId={ri.id} inspections={inspections}/>

        </div>
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