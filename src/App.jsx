import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import AllInspections from "./pages/AllInspections";
import Detail from "./pages/Detail";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import useAuth from "./hooks/useAuth";

import { gold, black } from "./config";

const slideStyle = {
  animation: "slideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
};

export default function App() {
  const [page,        setPage]        = useState("dashboard");
  const [inspections, setInspections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selId,       setSelId]       = useState(null);
  const [reportId,    setReportId]    = useState(null);
  const [animKey,     setAnimKey]     = useState(0);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [history,     setHistory]     = useState([]);
  const [screenSize,  setScreenSize]  = useState(
    window.innerWidth >= 1280 ? "laptop" :
    window.innerWidth >= 768  ? "tablet" : "mobile"
  );

  const { user, setUser, loading: authLoading, validatePin, completeLogin, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setScreenSize(w >= 1280 ? "laptop" : w >= 768 ? "tablet" : "mobile");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "inspections"), snap => {
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setInspections(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const nav = (p) => {
    setHistory(h => [...h, page]);
    setPage(p);
    setAnimKey(k => k + 1);
    setMenuOpen(false);
  };

  const goDetail = (id) => {
    setSelId(id);
    nav("detail");
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    const saved = localStorage.getItem("ye_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      localStorage.setItem("ye_auth", JSON.stringify({
        ...parsed,
        user: updatedUser,
      }));
    }
  };

  const isLaptop = screenSize === "laptop";
  const SIDEBAR_W = 260;

  // Loading screen
  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:black, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:80, height:36, margin:"0 auto 16px", overflow:"hidden" }}>
          <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
        </div>
        <div style={{ color:gold, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase" }}>Loading...</div>
      </div>
    </div>
  );

  // Login screen
  if (!user) return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:"100%", minHeight:"100vh", position:"relative" }}>
      {/* BLURRED BACKGROUND */}
      <div style={{
        position:"fixed", inset:0, zIndex:0,
        backgroundImage:"url('/house_bg.jpeg')",
        backgroundSize:"cover",
        backgroundPosition:"center",
        filter:"blur(12px)",
        transform:"scale(1.1)",
      }}/>
      {/* DARK OVERLAY */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"rgba(0,0,0,0.65)" }}/>
      {/* LOGIN CONTENT */}
      <div style={{ position:"relative", zIndex:1 }}>
        <Login onValidate={validatePin} onComplete={completeLogin}/>
      </div>
    </div>
  );

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout} isLaptop={isLaptop}/>;
      case "new":       return <NewInspection nav={nav} setSelId={setSelId} isLaptop={isLaptop}/>;
      case "list":      return <AllInspections inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} isLaptop={isLaptop}/>;
      case "detail":    return <Detail inspections={inspections} selId={selId} nav={nav} setReportId={setReportId} isLaptop={isLaptop}/>;
      case "reports":   return <Reports inspections={inspections} loading={loading} reportId={reportId} setReportId={setReportId} nav={nav} isLaptop={isLaptop}/>;
      case "profile":   return <Profile user={user} nav={nav} onUpdateUser={handleUpdateUser} isLaptop={isLaptop}/>;
      default:          return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout} isLaptop={isLaptop}/>;
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Inter',-apple-system,sans-serif", width:"100%", overflowX:"hidden", position:"relative" }}>

      {/* BLURRED BACKGROUND */}
      <div style={{
        position:"fixed", inset:0, zIndex:0,
        backgroundImage:"url('/house_bg.jpeg')",
        backgroundSize:"cover",
        backgroundPosition:"center",
        filter:"blur(12px)",
        transform:"scale(1.1)",
      }}/>

      {/* DARK OVERLAY */}
      <div style={{
        position:"fixed", inset:0, zIndex:0,
        background:"rgba(0,0,0,0.55)",
      }}/>

      {/* CONTENT */}
      <div style={{ position:"relative", zIndex:1 }}>
        {isLaptop ? (
          <div style={{ display:"flex", minHeight:"100vh", width:"100%" }}>
            <div className="sidebar-nav" style={{ width:SIDEBAR_W, flexShrink:0, position:"fixed", top:0, left:0, bottom:0, zIndex:100 }}>
              <BottomNav page={page} nav={nav} user={user} logout={logout} open={true} setOpen={()=>{}} isLaptop={true}/>
            </div>
            <div className="main-content" style={{ marginLeft:SIDEBAR_W, flex:1, minHeight:"100vh", minWidth:0, overflow:"hidden" }}>
              <div key={animKey} style={{ ...slideStyle, width:"100%", minHeight:"100vh" }}>
                {renderPage()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width:"100%", position:"relative" }}>
            <div key={animKey} style={slideStyle}>
              {renderPage()}
            </div>
            <BottomNav page={page} nav={nav} user={user} logout={logout} open={menuOpen} setOpen={setMenuOpen} isLaptop={false}/>
          </div>
        )}
      </div>

      <style>{`
        #root { width:100%; min-height:100vh; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        body { margin:0; padding:0; background:#000; width:100%; }
        input,select,textarea,button { font-family:'Inter',-apple-system,sans-serif; }
        ::-webkit-scrollbar { width:0px; }
        button:active { opacity:0.75; transform:scale(0.98); }
        @media print {
          .sidebar-nav { display: none !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}