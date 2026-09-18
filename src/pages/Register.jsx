import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { white, black, gold, txt, sub, bdr, red, iosBg, iosSep } from "../config";

export default function Register({ onBack, onSuccess }) {
  const [form, setForm] = useState({ name:"", role:"Inspector", pin:"", confirmPin:"" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null);

  const setF = (k,v) => {
    setForm(f => ({...f,[k]:v}));
    setErrors(e => ({...e,[k]:undefined}));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = async () => {
    const e = {};
    if (!form.name.trim())         e.name       = "Name is required";
    if (form.pin.length !== 4)     e.pin        = "PIN must be 4 digits";
    if (!/^\d{4}$/.test(form.pin)) e.pin        = "PIN must be 4 numbers";
    if (form.pin !== form.confirmPin) e.confirmPin = "PINs do not match";

    // Check if PIN already exists
    if (!e.pin && !e.confirmPin) {
      const snap = await getDocs(collection(db, "staff"));
      const staff = snap.docs.map(d => d.data());
      const pinExists = staff.find(s => String(s.pin) === String(form.pin));
      if (pinExists) e.pin = "This PIN is already taken. Choose another.";
    }

    return e;
  };

  const handleSubmit = async () => {
    setSaving(true);
    const e = await validate();
    if (Object.keys(e).length) { setErrors(e); setSaving(false); return; }

    const userData = {
      name:      form.name.trim(),
      role:      form.role,
      pin:       form.pin,
      photo:     photo || null,
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "staff"), userData);
    setSaving(false);
    onSuccess({ id:ref.id, ...userData });
  };

  const iSt = (field) => ({
    width:"100%", padding:"13px 16px", borderRadius:14,
    fontSize:14, color: field === "pin" || field === "confirmPin" ? txt : txt,
    fontFamily:"inherit",
    border:`1.5px solid ${errors[field]?"#FF3B30":"rgba(255,255,255,0.15)"}`,
    outline:"none", background:"rgba(255,255,255,0.08)",
    boxSizing:"border-box", color:white,
    letterSpacing: field==="pin"||field==="confirmPin" ? 8 : 0,
  });

  return (
    <div style={{
      minHeight:"100vh", background:black,
      display:"flex", alignItems:"center",
      justifyContent:"center",
      fontFamily:"'Inter',-apple-system,sans-serif",
      padding:"24px",
    }}>
      <div style={{ width:"100%", maxWidth:400 }}>

        {/* HEADER */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:72, height:72,
            background:`linear-gradient(135deg,${gold},#E8B84B)`,
            borderRadius:20, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:28, color:white,
            margin:"0 auto 16px",
            boxShadow:`0 8px 32px ${gold}50`,
          }}>YE</div>
          <div style={{ color:white, fontWeight:800, fontSize:22, letterSpacing:-0.5, marginBottom:4 }}>Create Account</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>Join Yes Empire Inspection System</div>
        </div>

        {/* FORM CARD */}
        <div style={{
          background:"rgba(255,255,255,0.06)",
          borderRadius:24, padding:"28px 24px",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.1)",
          display:"flex", flexDirection:"column", gap:18,
        }}>

          {/* PHOTO UPLOAD */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            {photo ? (
              <div style={{ position:"relative" }}>
                <img src={photo} alt="Profile" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`3px solid ${gold}` }}/>
                <button onClick={()=>setPhoto(null)} style={{ position:"absolute", top:-4, right:-4, background:red, border:"none", color:white, borderRadius:"50%", width:22, height:22, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
            ) : (
              <label style={{ cursor:"pointer" }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:`2px dashed rgba(255,255,255,0.2)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <span style={{ fontSize:24 }}>📸</span>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Photo</span>
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
              </label>
            )}
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Optional profile photo</div>
          </div>

          {/* NAME */}
          <div>
            <label style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Full Name *</label>
            <input
              value={form.name}
              onChange={e=>setF("name",e.target.value)}
              placeholder="e.g. Ahmad bin Abdullah"
              style={iSt("name")}
            />
            {errors.name&&<p style={{ fontSize:11, color:"#FF3B30", margin:"6px 0 0" }}>{errors.name}</p>}
          </div>

          {/* ROLE */}
          <div>
            <label style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Role *</label>
            <select
              value={form.role}
              onChange={e=>setF("role",e.target.value)}
              style={{ ...iSt("role"), appearance:"none", letterSpacing:0 }}
            >
              <option value="Inspector">Inspector</option>
              <option value="Senior Inspector">Senior Inspector</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* PIN */}
          <div>
            <label style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Choose 4 Digit PIN *</label>
            <input
              type="password"
              maxLength={4}
              value={form.pin}
              onChange={e=>setF("pin",e.target.value.replace(/\D/g,""))}
              placeholder="• • • •"
              style={iSt("pin")}
            />
            {errors.pin&&<p style={{ fontSize:11, color:"#FF3B30", margin:"6px 0 0" }}>{errors.pin}</p>}
          </div>

          {/* CONFIRM PIN */}
          <div>
            <label style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Confirm PIN *</label>
            <input
              type="password"
              maxLength={4}
              value={form.confirmPin}
              onChange={e=>setF("confirmPin",e.target.value.replace(/\D/g,""))}
              placeholder="• • • •"
              style={iSt("confirmPin")}
            />
            {errors.confirmPin&&<p style={{ fontSize:11, color:"#FF3B30", margin:"6px 0 0" }}>{errors.confirmPin}</p>}
          </div>

          {/* BUTTONS */}
          <button onClick={handleSubmit} disabled={saving} style={{
            width:"100%", padding:"16px",
            background:gold, color:white,
            border:"none", borderRadius:14,
            fontWeight:700, fontSize:16,
            cursor:"pointer", fontFamily:"inherit",
            letterSpacing:-0.2, opacity:saving?0.7:1,
            boxShadow:`0 8px 28px ${gold}50`,
            marginTop:4,
          }}>
            {saving ? "Creating account..." : "Create Account →"}
          </button>

          <button onClick={onBack} style={{
            width:"100%", padding:"14px",
            background:"transparent", color:"rgba(255,255,255,0.4)",
            border:"none", borderRadius:14,
            fontWeight:500, fontSize:14,
            cursor:"pointer", fontFamily:"inherit",
          }}>
            ← Back to Login
          </button>

        </div>

        <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, marginTop:24, textAlign:"center" }}>
          Yes Empire Sdn Bhd · Defect Inspection System
        </div>
      </div>
    </div>
  );
}