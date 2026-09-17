import { useState } from "react";
import { white, black, gold, txt, sub, bdr, red, iosBg, iosSep } from "../config";

export default function Login({ onLogin, error: authError }) {
  const [name,     setName]     = useState("");
  const [pin,      setPin]      = useState("");
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);

  const handlePinPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0,-1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (pin.length !== 4) { setError("Please enter your 4 digit PIN."); return; }
    setLoading(true);
    const success = await onLogin(name, pin, remember);
    if (!success) {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
      setError("Incorrect name or PIN. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:black,
      display:"flex", flexDirection:"column",
      fontFamily:"'Inter',-apple-system,sans-serif",
    }}>

      {/* TOP SECTION */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 32px 24px" }}>

        {/* LOGO */}
        <div style={{ marginBottom:40, textAlign:"center" }}>
          <div style={{
            width:80, height:80,
            background:`linear-gradient(135deg,${gold},#E8B84B)`,
            borderRadius:24, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:32, color:white,
            margin:"0 auto 20px",
            boxShadow:`0 8px 32px ${gold}50`,
          }}>YE</div>
          <div style={{ color:white, fontWeight:800, fontSize:24, letterSpacing:-0.5 }}>YES EMPIRE</div>
          <div style={{ color:gold, fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>Inspection System</div>
        </div>

        {/* NAME INPUT */}
        <div style={{ width:"100%", maxWidth:320, marginBottom:32 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>Your Name</div>
          <input
            value={name}
            onChange={e=>{ setName(e.target.value); setError(""); }}
            placeholder="e.g. Megat Muaz"
            style={{
              width:"100%", padding:"15px 20px",
              borderRadius:16, border:`1.5px solid ${error&&!name.trim()?"#FF3B30":"rgba(255,255,255,0.15)"}`,
              fontSize:16, fontFamily:"inherit",
              outline:"none", background:"rgba(255,255,255,0.08)",
              color:white, boxSizing:"border-box",
              textAlign:"center",
            }}
          />
        </div>

        {/* PIN DISPLAY */}
        <div style={{ marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>4 Digit PIN</div>
          <div style={{
            display:"flex", gap:14, justifyContent:"center",
            animation: shake ? "shake 0.5s ease" : "none",
          }}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{
                width:60, height:60,
                borderRadius:18,
                border:`2px solid ${pin.length>i ? gold : "rgba(255,255,255,0.15)"}`,
                background: pin.length>i ? `${gold}20` : "rgba(255,255,255,0.05)",
                display:"flex", alignItems:"center",
                justifyContent:"center",
                fontSize:28, color:gold,
                transition:"all 0.2s ease",
              }}>
                {pin.length>i ? "●" : ""}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION — PIN PAD */}
      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"28px 28px 0 0", padding:"28px 24px 48px" }}>

        {/* ERROR */}
        {(error||authError) && (
          <div style={{ padding:"12px 16px", background:"#FF3B3015", borderRadius:12, fontSize:14, color:"#FF3B30", fontWeight:500, textAlign:"center", marginBottom:20 }}>
            {error||authError}
          </div>
        )}

        {/* PIN PAD */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16, maxWidth:320, margin:"0 auto 16px" }}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <button key={n} onClick={()=>handlePinPress(String(n))} style={{
              padding:"18px", background:"rgba(255,255,255,0.08)",
              border:"none", borderRadius:16,
              fontSize:22, fontWeight:600, color:white,
              cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.15s ease",
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
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:20, cursor:"pointer", maxWidth:320, margin:"0 auto 20px" }} onClick={()=>setRemember(r=>!r)}>
          <div style={{
            width:22, height:22, borderRadius:6,
            border:`2px solid ${remember?gold:"rgba(255,255,255,0.3)"}`,
            background:remember?gold:"transparent",
            display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:13,
            color:white, flexShrink:0,
            transition:"all 0.15s ease",
          }}>
            {remember?"✓":""}
          </div>
          <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>Remember me for 30 days</span>
        </div>

        {/* LOGIN BUTTON */}
        <div style={{ maxWidth:320, margin:"0 auto" }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", padding:"17px",
            background:gold, color:white,
            border:"none", borderRadius:16,
            fontWeight:700, fontSize:16,
            cursor:"pointer", fontFamily:"inherit",
            letterSpacing:-0.2, opacity:loading?0.7:1,
            boxShadow:`0 8px 28px ${gold}50`,
            transition:"all 0.2s ease",
          }}>
            {loading ? "Verifying..." : "Login →"}
          </button>
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