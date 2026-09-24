import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { white, black, gold, txt, sub, red, iosBg, bdr } from "../config";

export default function Staff({ nav, isLaptop, user }) {
  const [staff,      setStaff]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editStaff,  setEditStaff]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({ name:"", pin:"", role:"Inspector" });
  const [error,      setError]      = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "staff"));
    const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const resetForm = () => {
    setForm({ name:"", pin:"", role:"Inspector" });
    setError("");
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) { setError("PIN must be 4 digits"); return; }
    const pinExists = staff.find(s => String(s.pin) === String(form.pin));
    if (pinExists) { setError("This PIN is already taken!"); return; }
    setSaving(true);
    await addDoc(collection(db, "staff"), {
      name: form.name.trim(),
      pin:  form.pin,
      role: form.role,
      createdAt: serverTimestamp(),
    });
    await fetchStaff();
    setSaving(false);
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (form.pin && (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin))) { setError("PIN must be 4 digits"); return; }
    if (form.pin) {
      const pinExists = staff.find(s => String(s.pin) === String(form.pin) && s.id !== editStaff.id);
      if (pinExists) { setError("This PIN is already taken!"); return; }
    }
    setSaving(true);
    const updateData = { name: form.name.trim(), role: form.role };
    if (form.pin) updateData.pin = form.pin;
    await updateDoc(doc(db, "staff", editStaff.id), updateData);
    await fetchStaff();
    setSaving(false);
    setEditStaff(null);
    resetForm();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "staff", confirmDel.id));
    await fetchStaff();
    setConfirmDel(null);
  };

  const iSt = {
    width:"100%", padding:"12px 14px", borderRadius:0,
    fontSize:13, color:txt, fontFamily:"inherit",
    border:"1.5px solid #E5E5EA", outline:"none",
    background:white, boxSizing:"border-box",
  };

  const pad = isLaptop ? "0 40px" : "0 16px";

  const getInitials = (name) => name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";

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
            <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8, marginBottom:4 }}>Staff</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{staff.length} staff members</div>
          </div>
          {user?.role === "Admin" && (
            <button onClick={()=>{ resetForm(); setShowAdd(true); }} style={{ padding:"11px 20px", background:gold, color:white, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, textTransform:"uppercase" }}>
              + Add Staff
            </button>
          )}
        </div>
      </div>

      {/* STAFF LIST */}
      <div style={{ padding:pad, paddingTop:16 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.4)" }}>Loading...</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(3,1fr)":"1fr", gap:1, background:"rgba(0,0,0,0.2)" }}>
            {staff.map(s=>(
              <div key={s.id} style={{ background:white, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:`2px solid ${gold}`, flexShrink:0 }}/>
                  ) : (
                    <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${gold},#F5A623)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:white, flexShrink:0 }}>
                      {getInitials(s.name)}
                    </div>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:txt, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ fontSize:12, color:gold, fontWeight:600 }}>{s.role}</div>
                    <div style={{ fontSize:11, color:sub, marginTop:2 }}>PIN: {"•".repeat(4)}</div>
                  </div>
                  {s.id === user?.id && (
                    <div style={{ fontSize:10, color:gold, fontWeight:700, letterSpacing:1, textTransform:"uppercase", background:`${gold}15`, padding:"4px 8px" }}>You</div>
                  )}
                </div>

                {user?.role === "Admin" && (
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>{ setEditStaff(s); setForm({ name:s.name, pin:"", role:s.role }); setError(""); }} style={{ flex:1, padding:"10px", background:iosBg, color:txt, border:"1px solid #E5E5EA", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>
                      Edit
                    </button>
                    {s.id !== user?.id && (
                      <button onClick={()=>setConfirmDel(s)} style={{ flex:1, padding:"10px", background:"#FF3B3010", color:red, border:"none", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD STAFF MODAL */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>setShowAdd(false)}>
          <div style={{ background:white, padding:28, width:"100%", maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, color:txt, marginBottom:20 }}>Add New Staff</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Name</label>
                <input value={form.name} onChange={e=>{ setForm(f=>({...f,name:e.target.value})); setError(""); }} placeholder="e.g. Ahmad bin Abdullah" style={iSt}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>4 Digit PIN</label>
                <input type="password" maxLength={4} value={form.pin} onChange={e=>{ setForm(f=>({...f,pin:e.target.value.replace(/\D/g,"")})); setError(""); }} placeholder="• • • •" style={iSt}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{ ...iSt, appearance:"none" }}>
                  <option>Inspector</option>
                  <option>Senior Inspector</option>
                  <option>Supervisor</option>
                  <option>Admin</option>
                </select>
              </div>
              {error && <div style={{ padding:"10px 14px", background:"#FFEBEE", color:red, fontSize:12, fontWeight:600 }}>{error}</div>}
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={()=>{ setShowAdd(false); resetForm(); }} style={{ flex:1, padding:"14px", background:iosBg, color:sub, border:"none", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                <button onClick={handleAdd} disabled={saving} style={{ flex:2, padding:"14px", background:black, color:white, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", opacity:saving?0.7:1 }}>
                  {saving?"Adding...":"Add Staff"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editStaff && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>{ setEditStaff(null); resetForm(); }}>
          <div style={{ background:white, padding:28, width:"100%", maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, color:txt, marginBottom:20 }}>Edit Staff</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Name</label>
                <input value={form.name} onChange={e=>{ setForm(f=>({...f,name:e.target.value})); setError(""); }} style={iSt}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>New PIN (leave empty to keep current)</label>
                <input type="password" maxLength={4} value={form.pin} onChange={e=>{ setForm(f=>({...f,pin:e.target.value.replace(/\D/g,"")})); setError(""); }} placeholder="Enter new PIN or leave empty" style={iSt}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{ ...iSt, appearance:"none" }}>
                  <option>Inspector</option>
                  <option>Senior Inspector</option>
                  <option>Supervisor</option>
                  <option>Admin</option>
                </select>
              </div>
              {error && <div style={{ padding:"10px 14px", background:"#FFEBEE", color:red, fontSize:12, fontWeight:600 }}>{error}</div>}
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={()=>{ setEditStaff(null); resetForm(); }} style={{ flex:1, padding:"14px", background:iosBg, color:sub, border:"none", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                <button onClick={handleEdit} disabled={saving} style={{ flex:2, padding:"14px", background:black, color:white, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", opacity:saving?0.7:1 }}>
                  {saving?"Saving...":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:white, padding:28, width:"100%", maxWidth:400 }}>
            <div style={{ fontWeight:800, fontSize:18, color:txt, marginBottom:8 }}>Remove Staff?</div>
            <div style={{ fontSize:14, color:sub, marginBottom:24, lineHeight:1.6 }}>
              Remove <strong>{confirmDel.name}</strong> from the system? They will no longer be able to login.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"14px", background:iosBg, color:txt, border:"none", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex:1, padding:"14px", background:red, color:white, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}