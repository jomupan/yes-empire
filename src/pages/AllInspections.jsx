import { useState } from "react";
import * as XLSX from "xlsx";
import { gold, txt, sub, white, black } from "../config";
import Card from "../components/Card";
import Pill from "../components/Pill";
import EmptyState from "../components/EmptyState";

export default function AllInspections({ inspections, loading, nav, goDetail, isLaptop }) {
  const [search,   setSearch]   = useState("");
  const [stFilter, setStFilter] = useState("All");

  const filtered = inspections.filter(i => {
    const q      = search.toLowerCase();
    const matchQ = i.title?.toLowerCase().includes(q) || i.client?.toLowerCase().includes(q) || i.city?.toLowerCase().includes(q);
    const matchS = stFilter==="All" || i.status===stFilter;
    return matchQ && matchS;
  });

  const pad = isLaptop ? "0 40px" : "0 16px";

  const exportToExcel = () => {
    const inspectionRows = inspections.map((i, idx) => {
      const defs = i.defects || [];
      const resolved = defs.filter(d => d.status === "Resolved").length;
      const rate = defs.length > 0 ? Math.round((resolved / defs.length) * 100) : 0;
      return {
        "No":              idx + 1,
        "Title":           i.title || "-",
        "Client":          i.client || "-",
        "Inspector":       i.inspector || "-",
        "Date":            i.date || "-",
        "Property Type":   i.propertyType || "-",
        "City":            i.city || "-",
        "State":           i.state || "-",
        "Status":          i.status || "-",
        "Total Defects":   defs.length,
        "Resolved":        resolved,
        "Resolution Rate": `${rate}%`,
      };
    });

    const defectRows = [];
    inspections.forEach(i => {
      const defs = i.defects || [];
      defs.forEach((d, idx) => {
        defectRows.push({
          "No":          idx + 1,
          "Inspection":  i.title || "-",
          "Client":      i.client || "-",
          "Date":        i.date || "-",
          "Location":    d.location || "-",
          "Element":     d.element || "-",
          "Defect Type": d.defectType || d.category || "-",
          "Category":    d.category || "-",
          "Severity":    d.severity || "-",
          "Status":      d.status || "-",
          "Description": d.description || "-",
        });
      });
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(inspectionRows);
    XLSX.utils.book_append_sheet(wb, ws1, "Inspections");
    const ws2 = XLSX.utils.json_to_sheet(defectRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Defects");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Benamora_Report_${date}.xlsx`);
  };

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

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8, marginBottom:4 }}>All Inspections</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:0.5 }}>{filtered.length} of {inspections.length} records</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={exportToExcel} style={{ padding:"11px 16px", background:"rgba(255,255,255,0.1)", color:white, border:`1px solid ${gold}`, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase" }}>
              Export Excel
            </button>
            <button onClick={()=>nav("new")} style={{ padding:"11px 20px", background:gold, color:white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1.5, textTransform:"uppercase" }}>
              + New
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div style={{ background:"rgba(255,255,255,0.88)", borderBottom:"1px solid #E5E5EA", padding: isLaptop?"16px 40px":"12px 16px" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search inspections..."
              style={{
                width:"100%", padding:"11px 14px",
                border:"1.5px solid #E5E5EA",
                borderRadius:0, fontSize:13,
                fontFamily:"inherit", outline:"none",
                background:"white", color:txt,
                boxSizing:"border-box",
              }}
            />
          </div>
          <div style={{ display:"flex", gap:0 }}>
            {["All","Pending","In Progress","Completed"].map(s=>(
              <button key={s} onClick={()=>setStFilter(s)} style={{
                padding:"11px 14px", fontSize:11,
                fontWeight:700, cursor:"pointer",
                fontFamily:"inherit", whiteSpace:"nowrap",
                letterSpacing:1, textTransform:"uppercase",
                border:"none", borderBottom:`2px solid ${stFilter===s?gold:"transparent"}`,
                background:"none", color: stFilter===s ? gold : sub,
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div style={{ padding:pad, paddingTop:16 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.4)" }}>Loading...</div>
        ) : filtered.length===0 ? (
          <EmptyState
            icon={search?"🔍":"📋"}
            title={search?`No results for "${search}"`:"No inspections yet"}
            desc={search?"Try a different search term":"Create your first inspection"}
            onAction={!search?()=>nav("new"):undefined}
            actionLabel="Start Now"
          />
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(3,1fr)":"1fr", gap:1, background:"rgba(0,0,0,0.2)" }}>
            {filtered.map(i=>{
              const defs=i.defects||[];
              const pct=defs.length>0?Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100):0;
              return(
                <Card key={i.id} onClick={()=>goDetail(i.id)} style={{ padding:"18px 20px", borderRadius:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:defs.length>0?12:0 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:txt, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        <div style={{ fontSize:12, color:sub }}>{i.client}</div>
                        <div style={{ fontSize:12, color:sub }}>{i.propertyType} · {i.city}, {i.state}</div>
                        <div style={{ fontSize:11, color:sub, opacity:0.7 }}>{i.date}</div>
                      </div>
                    </div>
                    <Pill type="insp" value={i.status}/>
                  </div>
                  {defs.length>0&&(
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontSize:11, color:sub, letterSpacing:0.5 }}>{defs.length} DEFECT{defs.length!==1?"S":""}</div>
                        <div style={{ fontSize:11, color:txt, fontWeight:700 }}>{pct}% RESOLVED</div>
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