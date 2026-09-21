import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Fld from "../components/Fld";
import { white, black, gold, txt, sub, bdr, red, iosBg, iosSep, MY_STATES, PROP_TYPES } from "../config";

export default function NewInspection({ nav, setSelId, isLaptop }) {
  const [form, setFormData] = useState({
    title:"", client:"", inspector:"", address:"",
    city:"", state:"", postcode:"", propertyType:"",
    date: new Date().toISOString().split("T")[0]
  });
  const [fErr,   setFErr]   = useState({});
  const [saving, setSaving] = useState(false);

  const setF = (k,v) => {
    setFormData(f => ({...f,[k]:v}));
    setFErr(e => ({...e,[k]:undefined}));
  };

  const iSt = (field) => ({
    width:"100%", padding:"12px 14px",
    borderRadius:0, fontSize:13, color:txt,
    fontFamily:"inherit",
    border:`1.5px solid ${fErr[field]?red:"#E5E5EA"}`,
    outline:"none", background:white,
    boxSizing:"border-box",
  });

  const sSt = (field) => ({ ...iSt(field), appearance:"none" });

  const validate = () => {
    const e = {};
    if (!form.title.trim())     e.title        = "Required";
    if (!form.client.trim())    e.client       = "Required";
    if (!form.inspector.trim()) e.inspector    = "Required";
    if (!form.address.trim())   e.address      = "Required";
    if (!form.state)            e.state        = "Required";
    if (!form.city.trim())      e.city         = "Required";
    if (!form.postcode.trim())  e.postcode     = "Required";
    if (!form.propertyType)     e.propertyType = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setFErr(e); return; }
    setSaving(true);
    const ref = await addDoc(collection(db,"inspections"), {
      ...form, status:"Pending", defects:[],
      createdAt: serverTimestamp()
    });
    setSaving(false);
    setSelId(ref.id);
    nav("detail");
  };

  const pad = isLaptop ? "0 40px" : "0 16px";

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:black, padding: isLaptop?"40px 40px 28px":"72px 24px 24px", marginBottom:1 }}>
        <button onClick={()=>nav("dashboard")} style={{ background:"none", border:"none", color:gold, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:16, letterSpacing:0.5 }}>
          ← Back
        </button>
        <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8 }}>New Inspection</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6, letterSpacing:0.3 }}>Fill in the property details below</div>
      </div>

      <div style={{ padding:pad }}>

        {isLaptop ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"#E5E5EA", marginBottom:16 }}>

            {/* LEFT */}
            <div style={{ background:white, padding:"28px 24px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:20 }}>General Information</div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Fld label="Inspection Title" error={fErr.title}>
                  <input style={iSt("title")} value={form.title} placeholder="e.g. Lagenda Teluk Intan Block A" onChange={e=>setF("title",e.target.value)}/>
                </Fld>
                <Fld label="Client Name" error={fErr.client}>
                  <input style={iSt("client")} value={form.client} placeholder="e.g. Ahmad bin Abdullah" onChange={e=>setF("client",e.target.value)}/>
                </Fld>
                <Fld label="Inspector Name" error={fErr.inspector}>
                  <input style={iSt("inspector")} value={form.inspector} placeholder="Full name" onChange={e=>setF("inspector",e.target.value)}/>
                </Fld>
                <Fld label="Inspection Date">
                  <input type="date" style={iSt("date")} value={form.date} onChange={e=>setF("date",e.target.value)}/>
                </Fld>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ background:white, padding:"28px 24px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:20 }}>Location</div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Fld label="Property Address" error={fErr.address}>
                  <textarea rows={2} style={{...iSt("address"),resize:"none",lineHeight:1.6}} value={form.address} placeholder="Full property address" onChange={e=>setF("address",e.target.value)}/>
                </Fld>
                <Fld label="State" error={fErr.state}>
                  <select style={sSt("state")} value={form.state} onChange={e=>setF("state",e.target.value)}>
                    <option value="">Select State</option>
                    {MY_STATES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Fld>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Fld label="City" error={fErr.city}>
                    <input style={iSt("city")} value={form.city} placeholder="Shah Alam" onChange={e=>setF("city",e.target.value)}/>
                  </Fld>
                  <Fld label="Postcode" error={fErr.postcode}>
                    <input style={iSt("postcode")} value={form.postcode} placeholder="40150" onChange={e=>setF("postcode",e.target.value)}/>
                  </Fld>
                </div>
                <Fld label="Property Type" error={fErr.propertyType}>
                  <select style={sSt("propertyType")} value={form.propertyType} onChange={e=>setF("propertyType",e.target.value)}>
                    <option value="">Select Type</option>
                    {PROP_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Fld>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:1, background:"#E5E5EA", marginBottom:16 }}>
            <div style={{ background:white, padding:"20px 16px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>General Information</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Fld label="Inspection Title" error={fErr.title}>
                  <input style={iSt("title")} value={form.title} placeholder="e.g. Lagenda Teluk Intan Block A" onChange={e=>setF("title",e.target.value)}/>
                </Fld>
                <Fld label="Client Name" error={fErr.client}>
                  <input style={iSt("client")} value={form.client} placeholder="e.g. Ahmad bin Abdullah" onChange={e=>setF("client",e.target.value)}/>
                </Fld>
                <Fld label="Inspector Name" error={fErr.inspector}>
                  <input style={iSt("inspector")} value={form.inspector} placeholder="Full name" onChange={e=>setF("inspector",e.target.value)}/>
                </Fld>
              </div>
            </div>
            <div style={{ background:white, padding:"20px 16px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Location</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Fld label="Property Address" error={fErr.address}>
                  <textarea rows={2} style={{...iSt("address"),resize:"none",lineHeight:1.6}} value={form.address} placeholder="Full property address" onChange={e=>setF("address",e.target.value)}/>
                </Fld>
                <Fld label="State" error={fErr.state}>
                  <select style={sSt("state")} value={form.state} onChange={e=>setF("state",e.target.value)}>
                    <option value="">Select State</option>
                    {MY_STATES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Fld>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Fld label="City" error={fErr.city}>
                    <input style={iSt("city")} value={form.city} placeholder="Shah Alam" onChange={e=>setF("city",e.target.value)}/>
                  </Fld>
                  <Fld label="Postcode" error={fErr.postcode}>
                    <input style={iSt("postcode")} value={form.postcode} placeholder="40150" onChange={e=>setF("postcode",e.target.value)}/>
                  </Fld>
                </div>
                <Fld label="Property Type" error={fErr.propertyType}>
                  <select style={sSt("propertyType")} value={form.propertyType} onChange={e=>setF("propertyType",e.target.value)}>
                    <option value="">Select Type</option>
                    {PROP_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Fld>
                <Fld label="Inspection Date">
                  <input type="date" style={iSt("date")} value={form.date} onChange={e=>setF("date",e.target.value)}/>
                </Fld>
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div style={{ display:"flex", gap:1, background:"#E5E5EA" }}>
          <button onClick={()=>nav("dashboard")} style={{ flex:1, padding:"15px", background:white, color:sub, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:"15px", background:black, color:white, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase", opacity:saving?0.7:1 }}>
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}