import { useState, useEffect } from "react";

const navy="#0C2340", gold="#C4922A", bg="#F2F5FA";
const white="#FFFFFF", txt="#0C2340", sub="#5B6E8A", bdr="#D8E1EE";

const SEV={
  Critical:{bar:"#DC2626",label:"#B91C1C",bg:"#FFF0F0",dot:"#DC2626"},
  High:    {bar:"#EA580C",label:"#C2410C",bg:"#FFF5EE",dot:"#EA580C"},
  Medium:  {bar:"#D97706",label:"#B45309",bg:"#FFFBEE",dot:"#D97706"},
  Low:     {bar:"#22C55E",label:"#15803D",bg:"#F0FDF4",dot:"#16A34A"},
};
const STA={
  "Open":        {color:"#1D4ED8",bg:"#EFF6FF",bdr:"#BFDBFE"},
  "In Progress": {color:"#7C3AED",bg:"#F5F3FF",bdr:"#DDD6FE"},
  "Resolved":    {color:"#059669",bg:"#ECFDF5",bdr:"#A7F3D0"},
};
const IST={
  "Pending":     {color:"#D97706",bg:"#FFFBEE",bdr:"#FDE68A"},
  "In Progress": {color:"#7C3AED",bg:"#F5F3FF",bdr:"#DDD6FE"},
  "Completed":   {color:"#059669",bg:"#ECFDF5",bdr:"#A7F3D0"},
};

const MY_STATES=["Selangor","Kuala Lumpur","Johor","Pulau Pinang","Perak","Sabah","Sarawak","Kedah","Kelantan","Terengganu","Pahang","Negeri Sembilan","Melaka","Perlis","Putrajaya","Labuan"];
const PROP_TYPES=["Landed House","Apartment","Condominium","Townhouse","Semi-Detached","Bungalow","Shop Lot"];
const CATS=["Plumbing","Electrical","Structural","Painting / Finishing","Roofing","Flooring","Windows & Doors","HVAC / Ventilation","Other"];
const LOCS=["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Kitchen","Bathroom","Master Bathroom","Dining Room","Garage","Staircase","Exterior / Facade","Roof","Other"];

const SEED=[
  {id:1,title:"Taman Harmoni Block A",client:"Ahmad Razif bin Abdullah",inspector:"Megat Muaz",
   address:"No 12, Jalan Harmoni 3",city:"Shah Alam",state:"Selangor",postcode:"40150",
   propertyType:"Landed House",status:"In Progress",date:"2026-09-05",
   defects:[
     {id:1,location:"Master Bathroom",category:"Plumbing",severity:"High",status:"Open",description:"Water pipe leak under sink — damaging cabinet base. Needs urgent repair."},
     {id:2,location:"Living Room",category:"Painting / Finishing",severity:"Low",status:"Resolved",description:"Hairline crack on wall plaster near window frame."},
   ]},
  {id:2,title:"Sri Damansara Unit B-07",client:"Nur Aisyah binti Rahman",inspector:"Megat Muaz",
   address:"Unit B-07, Sri Damansara Condo",city:"Petaling Jaya",state:"Selangor",postcode:"47810",
   propertyType:"Condominium",status:"Completed",date:"2026-09-03",
   defects:[
     {id:1,location:"Kitchen",category:"Electrical",severity:"Critical",status:"Resolved",description:"Power trips when running multiple appliances — possible overload at DB panel."},
   ]},
  {id:3,title:"Alam Impian Unit D-03",client:"Zulkifli Hassan",inspector:"Megat Muaz",
   address:"Unit D-03, Alam Impian Residences",city:"Shah Alam",state:"Selangor",postcode:"40460",
   propertyType:"Apartment",status:"Pending",date:"2026-09-09",
   defects:[]},
];

function Pill({type,value}){
  const cfg=type==="sev"?SEV[value]:type==="sta"?STA[value]:IST[value];
  if(!cfg)return null;
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:99,
      fontSize:11,fontWeight:600,color:cfg.label||cfg.color,background:cfg.bg,
      border:`1px solid ${cfg.bar||cfg.bdr}`,whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot||cfg.color,flexShrink:0}}/>
      {value}
    </span>
  );
}

function Fld({label,error,children}){
  return(
    <div>
      <label style={{fontSize:12,fontWeight:700,color:txt,display:"block",marginBottom:5}}>
        {label} <span style={{color:"#DC2626"}}>*</span>
      </label>
      {children}
      {error&&<p style={{fontSize:11,color:"#DC2626",margin:"4px 0 0"}}>{error}</p>}
    </div>
  );
}

function StatCard({label,value,accent,icon}){
  return(
    <div style={{background:white,borderRadius:12,padding:"16px 18px",
      borderTop:`4px solid ${accent}`,boxShadow:"0 1px 4px rgba(12,35,64,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:28,fontWeight:900,color:accent,lineHeight:1}}>{value}</div>
          <div style={{fontSize:12,color:sub,marginTop:5,fontWeight:500}}>{label}</div>
        </div>
        <span style={{fontSize:22,opacity:0.2}}>{icon}</span>
      </div>
    </div>
  );
}

const NAV=[
  {icon:"📊",label:"Dashboard",key:"dashboard"},
  {icon:"➕",label:"New Inspection",key:"new"},
  {icon:"📋",label:"All Inspections",key:"list"},
  {icon:"📄",label:"Reports",key:"reports"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [inspections,setInspections]=useState(SEED);
  const [selId,setSelId]=useState(null);
  const [reportId,setReportId]=useState(null);
  const [sidebar,setSidebar]=useState(false);
  const [mobile,setMobile]=useState(window.innerWidth<768);
  const [form,setFormData]=useState({title:"",client:"",inspector:"",address:"",city:"",state:"",postcode:"",propertyType:"",date:new Date().toISOString().split("T")[0]});
  const [fErr,setFErr]=useState({});
  const [dForm,setDForm]=useState({location:"",category:"",severity:"Medium",status:"Open",description:""});
  const [dErr,setDErr]=useState({});
  const [showDF,setShowDF]=useState(false);

  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  const sel=inspections.find(i=>i.id===selId);
  const repInsp=inspections.find(i=>i.id===reportId);
  const totalDef=inspections.reduce((a,i)=>a+i.defects.length,0);
  const openDef=inspections.reduce((a,i)=>a+i.defects.filter(d=>d.status==="Open").length,0);
  const done=inspections.filter(i=>i.status==="Completed").length;

  const nav=(p)=>{setPage(p);setSidebar(false);};
  const goDetail=(id)=>{setSelId(id);setPage("detail");setSidebar(false);};
  const setF=(k,v)=>{setFormData(f=>({...f,[k]:v}));setFErr(e=>({...e,[k]:undefined}));};
  const setD=(k,v)=>{setDForm(f=>({...f,[k]:v}));setDErr(e=>({...e,[k]:undefined}));};

  const valForm=()=>{
    const e={};
    if(!form.title.trim())e.title="Required";
    if(!form.client.trim())e.client="Required";
    if(!form.inspector.trim())e.inspector="Required";
    if(!form.address.trim())e.address="Required";
    if(!form.state)e.state="Required";
    if(!form.city.trim())e.city="Required";
    if(!form.postcode.trim())e.postcode="Required";
    if(!form.propertyType)e.propertyType="Required";
    return e;
  };

  const createInsp=()=>{
    const e=valForm();
    if(Object.keys(e).length){setFErr(e);return;}
    const n={...form,id:Date.now(),status:"Pending",defects:[]};
    setInspections(p=>[n,...p]);
    setFormData({title:"",client:"",inspector:"",address:"",city:"",state:"",postcode:"",propertyType:"",date:new Date().toISOString().split("T")[0]});
    setFErr({});
    setSelId(n.id);
    setPage("detail");
  };

  const valDef=()=>{
    const e={};
    if(!dForm.location)e.location="Required";
    if(!dForm.category)e.category="Required";
    if(!dForm.description.trim())e.description="Required";
    return e;
  };

  const addDefect=()=>{
    const e=valDef();
    if(Object.keys(e).length){setDErr(e);return;}
    setInspections(p=>p.map(i=>i.id===selId?{...i,
      status:i.status==="Pending"?"In Progress":i.status,
      defects:[...i.defects,{...dForm,id:Date.now()}]
    }:i));
    setDForm({location:"",category:"",severity:"Medium",status:"Open",description:""});
    setDErr({});
    setShowDF(false);
  };

  const updDefSt=(iid,did,st)=>setInspections(p=>p.map(i=>i.id===iid?{...i,defects:i.defects.map(d=>d.id===did?{...d,status:st}:d)}:i));
  const markDone=(id)=>setInspections(p=>p.map(i=>i.id===id?{...i,status:"Completed"}:i));

  const iSt=(field,errs=fErr)=>({width:"100%",padding:"9px 12px",borderRadius:8,fontSize:13,color:txt,fontFamily:"inherit",border:`1.5px solid ${errs[field]?"#DC2626":bdr}`,outline:"none",background:white,boxSizing:"border-box"});
  const sSt=(field,errs=fErr)=>({...iSt(field,errs),appearance:"none"});

  const SidebarContent=()=>(
    <div style={{width:240,background:navy,height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"20px 20px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:gold,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:navy}}>YE</div>
          <div>
            <div style={{color:white,fontWeight:800,fontSize:14,letterSpacing:0.3}}>YES EMPIRE</div>
            <div style={{color:gold,fontSize:9,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>Inspection System</div>
          </div>
        </div>
      </div>
      <nav style={{padding:12,flex:1,overflowY:"auto"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",padding:"8px 8px 4px",marginBottom:4}}>MENU</div>
        {NAV.map(item=>(
          <button key={item.key} onClick={()=>nav(item.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:2,textAlign:"left",
            background:page===item.key?"rgba(196,146,42,0.2)":"transparent",
            color:page===item.key?gold:"rgba(255,255,255,0.7)",
            borderLeft:page===item.key?`3px solid ${gold}`:"3px solid transparent"}}>
            <span style={{fontSize:16}}>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:navy,flexShrink:0}}>M</div>
        <div>
          <div style={{color:white,fontSize:12,fontWeight:600}}>Megat Muaz</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:10}}>Inspector</div>
        </div>
      </div>
    </div>
  );

  const renderPage=()=>{
    if(page==="dashboard") return(
      <div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:900,color:txt}}>Dashboard</div>
          <div style={{fontSize:13,color:sub,marginTop:4}}>Welcome back, Megat Muaz 👋</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:28}}>
          <StatCard label="Inspections" value={inspections.length} accent={navy} icon="🏠"/>
          <StatCard label="Completed" value={done} accent="#059669" icon="✅"/>
          <StatCard label="Total Defects" value={totalDef} accent="#7C3AED" icon="🔍"/>
          <StatCard label="Open Issues" value={openDef} accent="#DC2626" icon="⚠️"/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:16,color:txt}}>Recent Inspections</div>
          <button onClick={()=>nav("list")} style={{background:"none",border:"none",color:gold,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>View all →</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {inspections.slice(0,3).map(i=>(
            <div key={i.id} onClick={()=>goDetail(i.id)} style={{background:white,borderRadius:12,padding:"16px 20px",border:`1.5px solid ${bdr}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(12,35,64,0.06)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:txt,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.title}</div>
                <div style={{fontSize:12,color:sub}}>👤 {i.client}</div>
                <div style={{fontSize:12,color:sub,marginTop:2}}>📅 {i.date} · 🔍 {i.defects.length} defect{i.defects.length!==1?"s":""}</div>
              </div>
              <Pill type="insp" value={i.status}/>
            </div>
          ))}
        </div>
        <button onClick={()=>nav("new")} style={{marginTop:20,width:"100%",padding:14,background:navy,color:white,border:"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:20}}>+</span> Start New Inspection
        </button>
      </div>
    );

    if(page==="new") return(
      <div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:900,color:txt}}>New Inspection</div>
          <div style={{fontSize:13,color:sub,marginTop:4}}>Fill in the property inspection details</div>
        </div>
        <div style={{background:white,borderRadius:14,border:`1.5px solid ${bdr}`,overflow:"hidden"}}>
          <div style={{background:"#1D4ED8",padding:"14px 20px"}}>
            <div style={{color:white,fontWeight:700,fontSize:14}}>General Information</div>
          </div>
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
            <Fld label="Inspection Title" error={fErr.title}>
              <input style={iSt("title")} value={form.title} placeholder="e.g. Taman Harmoni Block A" onChange={e=>setF("title",e.target.value)}/>
            </Fld>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
              <Fld label="Client Name" error={fErr.client}>
                <input style={iSt("client")} value={form.client} placeholder="e.g. Ahmad bin Abdullah" onChange={e=>setF("client",e.target.value)}/>
              </Fld>
              <Fld label="Inspector Name" error={fErr.inspector}>
                <input style={iSt("inspector")} value={form.inspector} placeholder="Full name" onChange={e=>setF("inspector",e.target.value)}/>
              </Fld>
            </div>
            <Fld label="Property Address" error={fErr.address}>
              <textarea rows={2} style={{...iSt("address"),resize:"none"}} value={form.address} placeholder="Full property address" onChange={e=>setF("address",e.target.value)}/>
            </Fld>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12}}>
              <Fld label="State" error={fErr.state}>
                <select style={sSt("state")} value={form.state} onChange={e=>setF("state",e.target.value)}>
                  <option value="">-- Select State --</option>
                  {MY_STATES.map(s=><option key={s}>{s}</option>)}
                </select>
              </Fld>
              <Fld label="City" error={fErr.city}>
                <input style={iSt("city")} value={form.city} placeholder="e.g. Shah Alam" onChange={e=>setF("city",e.target.value)}/>
              </Fld>
              <Fld label="Postcode" error={fErr.postcode}>
                <input style={iSt("postcode")} value={form.postcode} placeholder="40150" onChange={e=>setF("postcode",e.target.value)}/>
              </Fld>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
              <Fld label="Property Type" error={fErr.propertyType}>
                <select style={sSt("propertyType")} value={form.propertyType} onChange={e=>setF("propertyType",e.target.value)}>
                  <option value="">-- Select Type --</option>
                  {PROP_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </Fld>
              <Fld label="Inspection Date">
                <input type="date" style={iSt("date")} value={form.date} onChange={e=>setF("date",e.target.value)}/>
              </Fld>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:12,borderTop:`1px solid ${bdr}`}}>
              <button onClick={()=>nav("dashboard")} style={{padding:"10px 20px",borderRadius:8,border:`1.5px solid ${bdr}`,background:white,color:sub,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={createInsp} style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#1D4ED8",color:white,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Save & Next →</button>
            </div>
          </div>
        </div>
      </div>
    );

    if(page==="list") return(
      <div>
        <div style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:txt}}>All Inspections</div>
            <div style={{fontSize:13,color:sub,marginTop:4}}>{inspections.length} inspection{inspections.length!==1?"s":""}</div>
          </div>
          <button onClick={()=>nav("new")} style={{background:gold,color:navy,border:"none",padding:"9px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ New</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {inspections.map(i=>(
            <div key={i.id} onClick={()=>goDetail(i.id)} style={{background:white,borderRadius:12,padding:"16px 20px",border:`1.5px solid ${bdr}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(12,35,64,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:15,color:txt}}>{i.title}</div>
                <Pill type="insp" value={i.status}/>
              </div>
              <div style={{fontSize:12,color:sub,display:"flex",flexWrap:"wrap",gap:"4px 14px"}}>
                <span>👤 {i.client}</span>
                <span>🏠 {i.propertyType}</span>
                <span>📍 {i.city}, {i.state}</span>
                <span>📅 {i.date}</span>
                <span>🔍 {i.defects.length} defect{i.defects.length!==1?"s":""}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if(page==="detail"&&sel){
      const unresolved=sel.defects.filter(d=>d.status!=="Resolved").length;
      return(
        <div>
          <button onClick={()=>nav("list")} style={{background:"none",border:"none",color:sub,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:16,display:"flex",alignItems:"center",gap:4}}>← Back to All Inspections</button>
          <div style={{background:white,borderRadius:14,border:`1.5px solid ${bdr}`,overflow:"hidden",marginBottom:16}}>
            <div style={{background:navy,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div style={{color:white,fontWeight:800,fontSize:16}}>{sel.title}</div>
              <Pill type="insp" value={sel.status}/>
            </div>
            <div style={{padding:"16px 20px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
                {[{l:"Client",v:sel.client},{l:"Inspector",v:sel.inspector},{l:"Type",v:sel.propertyType},{l:"Address",v:sel.address},{l:"City / State",v:`${sel.city}, ${sel.state}`},{l:"Date",v:sel.date}].map(r=>(
                  <div key={r.l} style={{padding:"10px 12px",background:bg,borderRadius:8}}>
                    <div style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{r.l}</div>
                    <div style={{fontSize:13,color:txt,fontWeight:500}}>{r.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{setReportId(sel.id);nav("reports");}} style={{padding:"8px 14px",borderRadius:8,border:`1.5px solid ${bdr}`,background:white,color:sub,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>📄 View Report</button>
                {unresolved===0&&sel.defects.length>0&&sel.status!=="Completed"&&(
                  <button onClick={()=>markDone(sel.id)} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#059669",color:white,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✅ Mark Complete</button>
                )}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:16,color:txt}}>Defects ({sel.defects.length})</div>
            <button onClick={()=>setShowDF(true)} style={{background:gold,color:navy,border:"none",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Add Defect</button>
          </div>
          {sel.defects.length===0&&(
            <div style={{textAlign:"center",padding:"40px 24px",background:white,borderRadius:12,border:`2px dashed ${bdr}`,color:sub}}>
              <div style={{fontSize:32,marginBottom:8}}>🔍</div>
              <div style={{fontWeight:700,color:txt,marginBottom:4}}>No defects logged yet</div>
              <div style={{fontSize:13}}>Click "+ Add Defect" to start recording findings</div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sel.defects.map(d=>(
              <div key={d.id} style={{background:white,borderRadius:12,border:`1.5px solid ${bdr}`,borderLeft:`5px solid ${SEV[d.severity]?.bar||"#ccc"}`,padding:"14px 18px"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  <Pill type="sev" value={d.severity}/>
                  <Pill type="sta" value={d.status}/>
                  <span style={{fontSize:11,color:sub,background:bg,padding:"2px 8px",borderRadius:99,border:`1px solid ${bdr}`}}>{d.category}</span>
                </div>
                <div style={{fontSize:12,color:sub,marginBottom:6}}>📍 {d.location}</div>
                <p style={{fontSize:13,color:sub,margin:0,lineHeight:1.6}}>{d.description}</p>
                {d.status!=="Resolved"&&(
                  <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                    {d.status==="Open"&&(
                      <button onClick={()=>updDefSt(sel.id,d.id,"In Progress")} style={{padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${STA["In Progress"].bdr}`,background:STA["In Progress"].bg,color:STA["In Progress"].color}}>Mark In Progress</button>
                    )}
                    <button onClick={()=>updDefSt(sel.id,d.id,"Resolved")} style={{padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${STA["Resolved"].bdr}`,background:STA["Resolved"].bg,color:STA["Resolved"].color}}>Mark Resolved</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {showDF&&(
            <div style={{position:"fixed",inset:0,background:"rgba(12,35,64,0.55)",zIndex:200,display:"flex",justifyContent:"flex-end"}} onClick={()=>setShowDF(false)}>
              <div style={{width:420,maxWidth:"100vw",height:"100%",background:white,overflowY:"auto",padding:24,boxShadow:"-12px 0 40px rgba(12,35,64,0.18)"}} onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div>
                    <div style={{fontWeight:900,fontSize:18,color:txt}}>Add Defect</div>
                    <div style={{fontSize:12,color:sub,marginTop:2}}>{sel.title}</div>
                  </div>
                  <button onClick={()=>setShowDF(false)} style={{background:bg,border:"none",width:32,height:32,borderRadius:8,fontSize:16,cursor:"pointer",color:sub}}>✕</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <Fld label="Location" error={dErr.location}>
                      <select style={sSt("location",dErr)} value={dForm.location} onChange={e=>setD("location",e.target.value)}>
                        <option value="">Select...</option>
                        {LOCS.map(l=><option key={l}>{l}</option>)}
                      </select>
                    </Fld>
                    <Fld label="Category" error={dErr.category}>
                      <select style={sSt("category",dErr)} value={dForm.category} onChange={e=>setD("category",e.target.value)}>
                        <option value="">Select...</option>
                        {CATS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </Fld>
                  </div>
                  <Fld label="Severity">
                    <select style={sSt("severity",dErr)} value={dForm.severity} onChange={e=>setD("severity",e.target.value)}>
                      {["Low","Medium","High","Critical"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Description" error={dErr.description}>
                    <textarea rows={4} placeholder="Describe the defect clearly..." value={dForm.description} onChange={e=>setD("description",e.target.value)} style={{...iSt("description",dErr),resize:"vertical",lineHeight:1.6}}/>
                  </Fld>
                  {dForm.severity&&SEV[dForm.severity]&&(
                    <div style={{padding:"10px 14px",borderRadius:8,background:SEV[dForm.severity].bg,border:`1.5px solid ${SEV[dForm.severity].bar}`,fontSize:12,color:SEV[dForm.severity].label,fontWeight:600}}>
                      {dForm.severity==="Critical"?"🚨 Critical — escalate immediately":dForm.severity==="High"?"⚠️ High — resolve within 48h":dForm.severity==="Medium"?"📋 Medium — schedule this week":"✅ Low — routine maintenance"}
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:`1px solid ${bdr}`}}>
                  <button onClick={addDefect} style={{flex:1,background:navy,color:white,border:"none",padding:"12px 0",borderRadius:10,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Save Defect</button>
                  <button onClick={()=>setShowDF(false)} style={{background:bg,color:sub,border:`1.5px solid ${bdr}`,padding:"12px 18px",borderRadius:10,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if(page==="reports"){
      if(reportId&&repInsp){
        const ri=repInsp;
        const res=ri.defects.filter(d=>d.status==="Resolved").length;
        const op=ri.defects.filter(d=>d.status==="Open").length;
        const ip=ri.defects.filter(d=>d.status==="In Progress").length;
        return(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <button onClick={()=>setReportId(null)} style={{background:"none",border:"none",color:sub,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:0}}>← All Reports</button>
              <button onClick={()=>window.print()} style={{background:navy,color:white,border:"none",padding:"8px 16px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print Report</button>
            </div>
            <div style={{background:white,borderRadius:14,border:`1.5px solid ${bdr}`,overflow:"hidden"}}>
              <div style={{background:navy,padding:"20px 24px"}}>
                <div style={{color:gold,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>YES EMPIRE SDN BHD — INSPECTION REPORT</div>
                <div style={{color:white,fontWeight:900,fontSize:20}}>{ri.title}</div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:4}}>Date: {ri.date} · Inspector: {ri.inspector}</div>
              </div>
              <div style={{padding:"20px 24px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
                  {[{l:"Client",v:ri.client},{l:"Property Type",v:ri.propertyType},{l:"Address",v:ri.address},{l:"City / State",v:`${ri.city}, ${ri.state} ${ri.postcode}`}].map(r=>(
                    <div key={r.l} style={{padding:"10px 14px",background:bg,borderRadius:8}}>
                      <div style={{fontSize:10,color:sub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{r.l}</div>
                      <div style={{fontSize:13,color:txt,fontWeight:500}}>{r.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
                  {[{l:"Total",v:ri.defects.length,c:navy},{l:"Open",v:op,c:"#DC2626"},{l:"In Progress",v:ip,c:"#7C3AED"},{l:"Resolved",v:res,c:"#059669"}].map(s=>(
                    <div key={s.l} style={{textAlign:"center",padding:"12px 8px",background:white,border:`1.5px solid ${bdr}`,borderRadius:10,borderTop:`3px solid ${s.c}`}}>
                      <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:11,color:sub,marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontWeight:700,fontSize:14,color:txt,marginBottom:10}}>Defect Details</div>
                {ri.defects.length===0&&<div style={{textAlign:"center",padding:24,color:sub,background:bg,borderRadius:10,fontSize:13}}>No defects recorded.</div>}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {ri.defects.map((d,idx)=>(
                    <div key={d.id} style={{display:"flex",gap:12,padding:"12px 16px",background:bg,borderRadius:10,border:`1px solid ${bdr}`,borderLeft:`4px solid ${SEV[d.severity]?.bar}`}}>
                      <div style={{fontSize:11,fontWeight:700,color:sub,minWidth:18}}>#{idx+1}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
                          <Pill type="sev" value={d.severity}/>
                          <Pill type="sta" value={d.status}/>
                        </div>
                        <div style={{fontSize:12,color:sub,marginBottom:4}}>📍 {d.location} · {d.category}</div>
                        <div style={{fontSize:13,color:txt}}>{d.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:32,paddingTop:20,borderTop:`1px solid ${bdr}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                  {["Inspector Signature","Client Signature"].map(s=>(
                    <div key={s} style={{textAlign:"center"}}>
                      <div style={{borderBottom:`1.5px solid ${txt}`,marginBottom:8,height:48}}/>
                      <div style={{fontSize:12,color:sub,fontWeight:600}}>{s}</div>
                      <div style={{fontSize:11,color:sub}}>Date: ___________</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      return(
        <div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:22,fontWeight:900,color:txt}}>Reports</div>
            <div style={{fontSize:13,color:sub,marginTop:4}}>View and print inspection reports</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {inspections.map(i=>(
              <div key={i.id} style={{background:white,borderRadius:12,padding:"16px 20px",border:`1.5px solid ${bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:txt,marginBottom:4}}>{i.title}</div>
                  <div style={{fontSize:12,color:sub}}>📅 {i.date} · 🔍 {i.defects.length} defect{i.defects.length!==1?"s":""} · 📍 {i.city}, {i.state}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Pill type="insp" value={i.status}/>
                  <button onClick={()=>setReportId(i.id)} style={{background:navy,color:white,border:"none",padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>View →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"'Inter',-apple-system,sans-serif",color:txt}}>
      {mobile?(
        <>
          <div style={{background:navy,height:56,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`2px solid ${gold}`,position:"sticky",top:0,zIndex:100}}>
            <button onClick={()=>setSidebar(true)} style={{background:"none",border:"none",color:white,fontSize:22,cursor:"pointer",padding:4}}>☰</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,background:gold,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:navy}}>YE</div>
              <span style={{color:white,fontWeight:800,fontSize:14}}>YES EMPIRE</span>
            </div>
            <div style={{width:32}}/>
          </div>
          <main style={{padding:"20px 16px 40px"}}>{renderPage()}</main>
          {sidebar&&(
            <div style={{position:"fixed",inset:0,zIndex:299,background:"rgba(0,0,0,0.5)"}} onClick={()=>setSidebar(false)}>
              <div style={{height:"100%"}} onClick={e=>e.stopPropagation()}>
                <SidebarContent/>
              </div>
            </div>
          )}
        </>
      ):(
        <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
          <div style={{width:240,flexShrink:0,overflowY:"auto"}}>
            <SidebarContent/>
          </div>
          <main style={{flex:1,padding:"28px 32px 60px",overflowY:"auto"}}>
            {renderPage()}
          </main>
        </div>
      )}
    </div>
  );
}