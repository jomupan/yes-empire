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
import useAuth from "./hooks/useAuth";

import { white, black, yellow, gold } from "./config";

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
  const [screenSize,  setScreenSize]  = useState(
    window.innerWidth >= 1024 ? "laptop" :
    window.innerWidth >= 768  ? "tablet" : "mobile"
  );

  const { user, loading: authLoading, login, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setScreenSize(w >= 1024 ? "laptop" : w >= 768 ? "tablet" : "mobile");
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
    setPage(p);
    setAnimKey(k => k + 1);
    setMenuOpen(false);
  };

  const goDetail = (id) => {
    setSelId(id);
    nav("detail");
  };

  const isLaptop = screenSize === "laptop";
  const SIDEBAR_W = 260;

  // Loading
  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:black, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, background:gold, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:black, margin:"0 auto 16px" }}>YE</div>
        <div style={{ color:gold, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase" }}>Loading...</div>
      </div>
    </div>
  );

  // Login
  if (!user) return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <Login onLogin={login}/>
    </div>
  );

  const renderPage = () => {
    switch(page) {
      case "dashboard":    return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout} isLaptop={isLaptop}/>;
      case "new":          return <NewInspection nav={nav} setSelId={setSelId} isLaptop={isLaptop}/>;
      case "list":         return <AllInspections inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} isLaptop={isLaptop}/>;
      case "detail":       return <Detail inspections={inspections} selId={selId} nav={nav} setReportId={setReportId} isLaptop={isLaptop}/>;
      case "reports":      return <Reports inspections={inspections} loading={loading} reportId={reportId} setReportId={setReportId} nav={nav} isLaptop={isLaptop}/>;
      default:             return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout} isLaptop={isLaptop}/>;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F2F2F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* LAPTOP LAYOUT — sidebar always visible */}
      {isLaptop ? (
        <div style={{ display:"flex", minHeight:"100vh" }}>

          {/* FIXED SIDEBAR */}
          <div style={{ width:SIDEBAR_W, flexShrink:0, position:"fixed", top:0, left:0, bottom:0, zIndex:100 }}>
            <BottomNav page={page} nav={nav} user={user} logout={logout} open={true} setOpen={()=>{}} isLaptop={true}/>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ marginLeft:SIDEBAR_W, flex:1, minHeight:"100vh" }}>
            <div key={animKey} style={slideStyle}>
              {renderPage()}
            </div>
          </div>
        </div>

      ) : (

        // MOBILE/TABLET LAYOUT — hamburger menu
        <div style={{ maxWidth: screenSize==="tablet" ? 768 : 480, margin:"0 auto", position:"relative" }}>
          <div key={animKey} style={slideStyle}>
            {renderPage()}
          </div>
          <BottomNav
            page={page} nav={nav} user={user}
            logout={logout} open={menuOpen}
            setOpen={setMenuOpen} isLaptop={false}
          />
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        body { margin:0; padding:0; background:#F2F2F7; }
        input,select,textarea,button { font-family:'Inter',-apple-system,sans-serif; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#C7C7CC; border-radius:99px; }
        button:active { opacity:0.75; transform:scale(0.98); }
      `}</style>
    </div>
  );
}