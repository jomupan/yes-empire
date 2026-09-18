import { useState } from "react";
import { white, black, gold } from "../config";
import Register from "./Register";

function Avatar({ user, size = 80 }) {
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
      border:`3px solid rgba(255,255,255,0.2)`,
      boxShadow:`0 4px 20px ${gold}50`,
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

  // Show register page
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
            <Avatar user={welcome} size={110}/>
          </div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:16, marginBottom:10, fontWeight:500 }}>Welcome back 👋</div>
          <div style={{ color:white, fontWeight:900, fontSize:32, letterSpacing:-0.8, marginBottom:6 }}>{welcome.name}</div>
          <div style={{ display:"inline-block", background:`${gold}20`, color:gold, padding:"6px 16px", borderRadius:99, fontSize:13, fontWeight:700, marginBottom:40 }}>
            {welcome.role}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:"rgba(255,255,255,0.3)", fontSize:13 }}>
            <div style={{ display:"flex", gap:6 }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:gold, opacity:0.4, animation:`bounce 1s ease ${i*0.2}s infinite` }}/>
              ))}
            </div>
            <span>Loading your workspace...</span>
          </div>
        </div>
        <style>{`
          @keyframes welcomeIn { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-6px);opacity:1} }
        `}</style>
      </div>
    );
  }

  // LOGIN SCREEN
  return (
    <div style={{
      minHeight:"100vh", background:black,
      display:"flex", alignItems:"center",
      justifyContent:"center",
      fontFamily:"'Inter',-apple-system,sans-serif",
      padding:"24px",
    }}>
      <div style={{ width:"100%", maxWidth:400, display:"flex", flexDirection:"column", alignItems:"center" }}>

        {/* LOGO */}
        <div style={{ marginBottom:40, textAlign:"center" }}>
          <div style={{
            width:88, height:88,
            background:`linear-gradient(135deg,${gold},#E8B84B)`,
            borderRadius:26, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:36, color:white,
            margin:"0 auto 20px",
            boxShadow:`0 8px 32px ${gold}50`,
          }}>YE</div>
          <div style={{ color:white, fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>YES EMPIRE</div>
          <div style={{ color:gold, fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginTop:6 }}>Inspection System</div>
        </div>

        {/* CARD */}
        <div style={{
          width:"100%",
          background:"rgba(255,255,255,0.06)",
          borderRadius:28, padding:"32px 28px",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.1)",
        }}>

          {/* TITLE */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ color:white, fontWeight:800, fontSize:20, letterSpacing:-0.3, marginBottom:6 }}>Enter your PIN</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>Your PIN will identify you automatically</div>
          </div>

          {/* PIN DISPLAY */}
          <div style={{ marginBottom:28, textAlign:"center" }}>
            <div style={{ display:"flex", gap:14, justifyContent:"center", animation: shake ? "shake 0.5s ease" : "none" }}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{
                  width:60, height:60, borderRadius:18,
                  border:`2px solid ${pin.length>i ? gold : "rgba(255,255,255,0.15)"}`,
                  background: pin.length>i ? `${gold}20` : "rgba(255,255,255,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:28, color:gold, transition:"all 0.15s ease",
                }}>
                  {pin.length>i ? "●" : ""}
                </div>
              ))}
            </div>
          </div>

          {/* ERROR */}
          {error&&(
            <div style={{ padding:"12px 16px", background:"#FF3B3015", borderRadius:12, fontSize:14, color:"#FF3B30", fontWeight:500, textAlign:"center", marginBottom:20 }}>
              {error}
            </div>
          )}

          {/* PIN PAD */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {[1,2,3,4,5,6,7,8,9].map(n=>(
              <button key={n} onClick={()=>handlePinPress(String(n))} style={{
                padding:"18px", background:"rgba(255,255,255,0.08)",
                border:"none", borderRadius:16,
                fontSize:22, fontWeight:600, color:white,
                cursor:"pointer", fontFamily:"inherit",
                transition:"all 0.15s ease",
                opacity: loading ? 0.5 : 1,
              }}>{n}</button>
            ))}
            <div/>
            <button onClick={()=>handlePinPress("0")} style={{
              padding:"18px", background:"rgba(255,255,255,0.08)",
              border:"none", borderRadius:16,
              fontSize:22, fontWeight:600, color:white,
              cursor:"pointer", fontFamily:"inherit",
            }}>0</button>
            <button onClick={handleDelete} style={{
              padding:"18px", background:"rgba(255,255,255,0.08)",
              border:"none", borderRadius:16,
              fontSize:22, fontWeight:600, color:"#FF3B30",
              cursor:"pointer", fontFamily:"inherit",
            }}>⌫</button>
          </div>

          {/* REMEMBER ME */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", marginBottom:20 }} onClick={()=>setRemember(r=>!r)}>
            <div style={{
              width:22, height:22, borderRadius:6,
              border:`2px solid ${remember?gold:"rgba(255,255,255,0.3)"}`,
              background:remember?gold:"transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, color:white, flexShrink:0, transition:"all 0.15s ease",
            }}>
              {remember?"✓":""}
            </div>
            <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>Remember me for 30 days</span>
          </div>

          {/* DIVIDER */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", marginBottom:20 }}/>

          {/* REGISTER BUTTON */}
          <button onClick={()=>setShowReg(true)} style={{
            width:"100%", padding:"14px",
            background:"transparent",
            border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:14, color:"rgba(255,255,255,0.6)",
            cursor:"pointer", fontFamily:"inherit",
            fontSize:14, fontWeight:600,
            transition:"all 0.15s ease",
          }}>
            New staff? Register here →
          </button>

        </div>

        {/* FOOTER */}
        <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, marginTop:24, textAlign:"center" }}>
          Yes Empire Sdn Bhd · Defect Inspection System
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
      `}</style>
    </div>
  );
}