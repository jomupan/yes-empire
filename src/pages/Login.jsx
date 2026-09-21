import { useState } from "react";
import { white, black, gold } from "../config";
import Register from "./Register";

function Avatar({ user, size = 80 }) {
  if (user?.photo) {
    return (
      <img src={user.photo} alt={user.name}
        style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:`3px solid ${gold}` }}/>
    );
  }
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "BN";
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`linear-gradient(135deg,${gold},#F5A623)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:900, fontSize:size*0.35, color:white,
      border:`3px solid rgba(255,255,255,0.2)`,
    }}>
      {initials}
    </div>
  );
}

export default function Login({ onValidate, onComplete }) {
  const [pin,      setPin]      = useState("");
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [welcome,  setWelcome]  = useState(null);
  const [showReg,  setShowReg]  = useState(false);

  if (showReg) return (
    <Register
      onBack={() => setShowReg(false)}
      onSuccess={(userData) => {
        setShowReg(false);
        setWelcome(userData);
        setTimeout(() => onComplete(userData, false), 2500);
      }}
    />
  );

  const handlePinPress = (num) => {
    if (loading || welcome) return;
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) handleSubmit(newPin);
    }
  };

  const handleDelete = () => {
    if (loading || welcome) return;
    setPin(prev => prev.slice(0,-1));
    setError("");
  };

  const handleSubmit = async (currentPin) => {
    const pinToCheck = currentPin || pin;
    if (pinToCheck.length !== 4) return;
    setLoading(true);
    const userData = await onValidate(pinToCheck);
    if (!userData) {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
      setError("Incorrect PIN. Please try again.");
      setLoading(false);
    } else {
      setWelcome(userData);
      setLoading(false);
      setTimeout(() => onComplete(userData, remember), 2500);
    }
  };

  // WELCOME SCREEN
  if (welcome) {
    return (
      <div style={{
        minHeight:"100vh", background:black,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        fontFamily:"'Inter',-apple-system,sans-serif",
        padding:"24px",
      }}>
        <div style={{ textAlign:"center", animation:"welcomeIn 0.5s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
          <div style={{ marginBottom:24 }}>
            <Avatar user={welcome} size={100}/>
          </div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:10, fontWeight:500, letterSpacing:1, textTransform:"uppercase" }}>
            Welcome back
          </div>
          <div style={{ color:white, fontWeight:800, fontSize:30, letterSpacing:-0.8, marginBottom:6 }}>
            {welcome.name}
          </div>
          <div style={{ display:"inline-block", background:`${gold}20`, color:gold, padding:"6px 16px", fontSize:12, fontWeight:700, marginBottom:40, letterSpacing:1, textTransform:"uppercase" }}>
            {welcome.role}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:"rgba(255,255,255,0.3)", fontSize:12, letterSpacing:0.5 }}>
            <div style={{ display:"flex", gap:6 }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:6, height:6, background:gold, opacity:0.4, animation:`bounce 1s ease ${i*0.2}s infinite` }}/>
              ))}
            </div>
            <span>Loading workspace...</span>
          </div>
        </div>
        <style>{`
          @keyframes welcomeIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-6px);opacity:1} }
        `}</style>
      </div>
    );
  }

  // LOGIN SCREEN
  return (
    <div style={{
      minHeight:"100vh", background:black,
      display:"flex", flexDirection:"column",
      justifyContent:"center",
      fontFamily:"'Inter',-apple-system,sans-serif",
      boxSizing:"border-box",
    }}>

      {/* TOP SECTION */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px 20px" }}>

        {/* LOGO */}
        <div style={{ marginBottom:24, textAlign:"center" }}>
          <div style={{ width:140, height:56, overflow:"hidden", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain", animation:"slideLeftRight 3s ease-in-out infinite" }}/>
          </div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, letterSpacing:3, textTransform:"uppercase" }}>
            Inspection System
          </div>
        </div>

        {/* TITLE */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ color:white, fontWeight:700, fontSize:18, letterSpacing:-0.3, marginBottom:6 }}>Enter your PIN</div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, letterSpacing:0.5 }}>Your PIN identifies you automatically</div>
        </div>

        {/* PIN DISPLAY */}
        <div style={{ marginBottom:20, textAlign:"center" }}>
          <div style={{ display:"flex", gap:12, justifyContent:"center", animation: shake?"shake 0.5s ease":"none" }}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{
                width:56, height:56,
                border:`2px solid ${pin.length>i?gold:"rgba(255,255,255,0.12)"}`,
                background: pin.length>i?`${gold}15`:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:24, color:gold,
                transition:"all 0.15s ease",
              }}>
                {pin.length>i?"●":""}
              </div>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error&&(
          <div style={{ padding:"11px 20px", background:"rgba(255,59,48,0.1)", fontSize:13, color:"#FF3B30", fontWeight:500, textAlign:"center", marginBottom:12, letterSpacing:0.3, width:"100%", maxWidth:340, boxSizing:"border-box" }}>
            {error}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION — PIN PAD */}
      <div style={{ background:"rgba(255,255,255,0.04)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"24px 20px 48px" }}>
        <div style={{ maxWidth:340, margin:"0 auto" }}>

          {/* PIN PAD */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {[1,2,3,4,5,6,7,8,9].map(n=>(
              <button key={n} onClick={()=>handlePinPress(String(n))} style={{
                padding:"18px", background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.08)",
                fontSize:20, fontWeight:600, color:white,
                cursor:"pointer", fontFamily:"inherit",
                transition:"all 0.15s ease",
                opacity: loading?0.5:1,
              }}>{n}</button>
            ))}
            <div/>
            <button onClick={()=>handlePinPress("0")} style={{
              padding:"18px", background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.08)",
              fontSize:20, fontWeight:600, color:white,
              cursor:"pointer", fontFamily:"inherit",
            }}>0</button>
            <button onClick={handleDelete} style={{
              padding:"18px", background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.08)",
              fontSize:20, fontWeight:600, color:"#FF3B30",
              cursor:"pointer", fontFamily:"inherit",
            }}>⌫</button>
          </div>

          {/* REMEMBER ME */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", marginBottom:16 }} onClick={()=>setRemember(r=>!r)}>
            <div style={{
              width:18, height:18,
              border:`1.5px solid ${remember?gold:"rgba(255,255,255,0.2)"}`,
              background:remember?gold:"transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:white, flexShrink:0,
              transition:"all 0.15s ease",
            }}>
              {remember?"✓":""}
            </div>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:400, letterSpacing:0.3 }}>Remember me for 30 days</span>
          </div>

          {/* DIVIDER */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginBottom:14 }}/>

          {/* REGISTER */}
          <button onClick={()=>setShowReg(true)} style={{
            width:"100%", padding:"13px",
            background:"transparent",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"rgba(255,255,255,0.4)",
            cursor:"pointer", fontFamily:"inherit",
            fontSize:11, fontWeight:600, letterSpacing:1.5,
            textTransform:"uppercase",
          }}>
            New Staff? Register Here
          </button>

        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background:black, padding:"12px", textAlign:"center" }}>
        <div style={{ color:"rgba(255,255,255,0.15)", fontSize:10, letterSpacing:1.5, textTransform:"uppercase" }}>
          Benamora Sdn Bhd · Inspection System
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-10px)}
          80%{transform:translateX(10px)}
        }
        @keyframes slideLeftRight {
          0%   { transform: translateX(-8px); }
          50%  { transform: translateX(8px);  }
          100% { transform: translateX(-8px); }
        }
        @keyframes welcomeIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-6px);opacity:1} }
      `}</style>
    </div>
  );
}