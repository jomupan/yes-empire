import { useState } from "react";
import { gold, txt, sub, iosBg, iosSep, white } from "../config";
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

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:white, padding: isLaptop ? "40px 40px 20px" : "72px 24px 16px", borderBottom:`1px solid ${iosSep}`, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontWeight:800, fontSize: isLaptop ? 32 : 28, color:txt, letterSpacing:-0.8, marginBottom:4 }}>All Inspections</div>
            <div style={{ fontSize:14, color:sub }}>{filtered.length} of {inspections.length} shown</div>
          </div>
          <button onClick={()=>nav("new")} style={{ background:gold, color:white, border:"none", padding:"12px 24px", borderRadius:14, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${gold}40` }}>
            + New
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div style={{ padding: isLaptop ? "0 40px 16px" : "0 16px 16px" }}>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:sub }}>🔍</span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search inspections..."
              style={{
                width:"100%", padding:"12px 16px 12px 42px",
                borderRadius:14, border:"none",
                fontSize:14, fontFamily:"inherit",
                outline:"none", background:white,
                boxSizing:"border-box", color:txt,
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["All","Pending","In Progress","Completed"].map(s=>(
              <button key={s} onClick={()=>setStFilter(s)} style={{
                padding:"10px 16px", borderRadius:99,
                fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit",
                border:"none", whiteSpace:"nowrap",
                background: stFilter===s ? gold : white,
                color:       stFilter===s ? white : sub,
                boxShadow:   stFilter===s ? `0 4px 12px ${gold}40` : "0 2px 8px rgba(0,0,0,0.06)",
                transition:"all 0.2s ease",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div style={{ padding:pad }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:sub }}>Loading...</div>
        ) : filtered.length===0 ? (
          <EmptyState
            icon={search?"🔍":"📋"}
            title={search?`No results for "${search}"`:"No inspections yet"}
            desc={search?"Try a different search term":"Create your first inspection"}
            onAction={!search?()=>nav("new"):undefined}
            actionLabel="Start Now"
          />
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop ? "repeat(3,1fr)" : "1fr", gap:12 }}>
            {filtered.map(i=>{
              const defs=i.defects||[];
              const pct=defs.length>0?Math.round((defs.filter(d=>d.status==="Resolved").length/defs.length)*100):0;
              return(
                <Card key={i.id} onClick={()=>goDetail(i.id)} style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:defs.length>0?12:0 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:txt, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                      <div style={{ fontSize:13, color:sub, display:"flex", flexWrap:"wrap", gap:"3px 12px" }}>
                        <span>👤 {i.client}</span>
                        <span>🏠 {i.propertyType}</span>
                        <span>📍 {i.city}</span>
                        <span>📅 {i.date}</span>
                      </div>
                    </div>
                    <Pill type="insp" value={i.status}/>
                  </div>
                  {defs.length>0&&(
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontSize:12, color:sub }}>🔍 {defs.length} defect{defs.length!==1?"s":""}</div>
                        <div style={{ fontSize:12, color:txt, fontWeight:600 }}>{pct}% resolved</div>
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
      </div>
    </div>
  );
}