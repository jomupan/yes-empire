import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { white, black, gold, txt, sub, bdr, red, iosBg, iosSep } from "../config";

function Avatar({ user, size = 100 }) {
  if (user?.photo) {
    return (
      <img src={user.photo} alt={user.name}
        style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:`3px solid ${gold}`, boxShadow:`0 4px 20px ${gold}50` }}/>
    );
  }
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "YE";
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`linear-gradient(135deg,${gold},#E8B84B)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:900, fontSize:size*0.35, color:white,
      border:`3px solid rgba(255,255,255,0.15)`,
      boxShadow:`0 4px 20px ${gold}50`,
    }}>
      {initials}
    </div>
  );
}

export default function Profile({ user, nav, onUpdateUser, isLaptop }) {
  const [photo,      setPhoto]      = useState(user?.photo || null);
  const [newPin,     setNewPin]     = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const pad = isLaptop ? "0 40px" : "0 16px";

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const savePhoto = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "staff", user.id), { photo });
      onUpdateUser({ ...user, photo });
      setSuccess("Profile photo updated! 🎉");
    } catch (err) {
      setError("Failed to update photo. Try again.");
    }
    setSaving(false);
  };

  const savePin = async () => {
    setError("");
    setSuccess("");
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "staff", user.id), { pin: newPin });
      onUpdateUser({ ...user, pin: newPin });
      setNewPin("");
      setConfirmPin("");
      setSuccess("PIN updated successfully! 🎉");
    } catch (err) {
      setError("Failed to update PIN. Try again.");
    }
    setSaving(false);
  };

  const iSt = (hasError) => ({
    width:"100%", padding:"13px 16px", borderRadius:12,
    fontSize:14, color:txt, fontFamily:"inherit",
    border:`1.5px solid ${hasError ? red : bdr}`,
    outline:"none", background:white, boxSizing:"border-box",
    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
  });

  return (
    <div style={{ background:iosBg, minHeight:"100vh", paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:white, padding: isLaptop ? "40px 40px 24px" : "72px 24px 20px", borderBottom:`1px solid ${iosSep}`, marginBottom:24 }}>
        <button onClick={()=>nav("dashboard")} style={{ background:"none", border:"none", color:gold, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
          ‹ Back
        </button>
        <div style={{ fontWeight:800, fontSize: isLaptop ? 32 : 28, color:txt, letterSpacing:-0.8 }}>My Profile</div>
        <div style={{ fontSize:14, color:sub, marginTop:4 }}>Update your photo and PIN</div>
      </div>

      <div style={{ padding:pad }}>

        {/* SUCCESS / ERROR */}
        {success && (
          <div style={{ padding:"14px 16px", background:"#E8F5E9", borderRadius:14, fontSize:14, color:"#2E7D32", fontWeight:600, marginBottom:20, textAlign:"center" }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ padding:"14px 16px", background:"#FFEBEE", borderRadius:14, fontSize:14, color:red, fontWeight:600, marginBottom:20, textAlign:"center" }}>
            {error}
          </div>
        )}

        {/* PROFILE CARD */}
        <div style={{ background:white, borderRadius:20, padding:"28px 24px", marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", textAlign:"center" }}>

          {/* AVATAR */}
          <div style={{ marginBottom:20, position:"relative", display:"inline-block" }}>
            <Avatar user={{ ...user, photo }} size={100}/>
            <label style={{
              position:"absolute", bottom:0, right:0,
              width:32, height:32, borderRadius:"50%",
              background:gold, border:`2px solid ${white}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", fontSize:14,
              boxShadow:`0 2px 8px ${gold}50`,
            }}>
              📷
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
            </label>
          </div>

          <div style={{ fontWeight:800, fontSize:20, color:txt, marginBottom:4 }}>{user?.name}</div>
          <div style={{ fontSize:14, color:gold, fontWeight:600, marginBottom:20 }}>{user?.role}</div>

          {/* PHOTO ACTIONS */}
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <label style={{
              padding:"10px 20px", background:iosBg,
              border:`1.5px solid ${bdr}`, borderRadius:12,
              fontWeight:600, fontSize:13, cursor:"pointer",
              color:txt, display:"inline-flex", alignItems:"center", gap:6,
            }}>
              📷 Change Photo
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
            </label>
            {photo && photo !== user?.photo && (
              <button onClick={savePhoto} disabled={saving} style={{
                padding:"10px 20px", background:gold,
                border:"none", borderRadius:12,
                fontWeight:700, fontSize:13, cursor:"pointer",
                color:white, fontFamily:"inherit",
                boxShadow:`0 4px 12px ${gold}40`,
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? "Saving..." : "Save Photo ✓"}
              </button>
            )}
            {photo && (
              <button onClick={()=>setPhoto(null)} style={{
                padding:"10px 20px", background:"#FF3B3010",
                border:"none", borderRadius:12,
                fontWeight:600, fontSize:13, cursor:"pointer",
                color:red, fontFamily:"inherit",
              }}>
                Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* CHANGE PIN */}
        <div style={{ background:white, borderRadius:20, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:18 }}>Change PIN</div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:txt, display:"block", marginBottom:6, letterSpacing:0.2 }}>New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={e=>{ setNewPin(e.target.value.replace(/\D/g,"")); setError(""); setSuccess(""); }}
                placeholder="Enter new 4 digit PIN"
                style={iSt(false)}
              />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:txt, display:"block", marginBottom:6, letterSpacing:0.2 }}>Confirm New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={e=>{ setConfirmPin(e.target.value.replace(/\D/g,"")); setError(""); setSuccess(""); }}
                placeholder="Confirm new PIN"
                style={iSt(false)}
              />
            </div>
            <button onClick={savePin} disabled={saving} style={{
              width:"100%", padding:"14px",
              background:black, color:white,
              border:"none", borderRadius:14,
              fontWeight:700, fontSize:15,
              cursor:"pointer", fontFamily:"inherit",
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? "Updating..." : "Update PIN →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}