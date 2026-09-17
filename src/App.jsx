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

import { white, black, yellow } from "./config";

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

  const { user, loading: authLoading, error: authError, login, logout } = useAuth();

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

  // Loading screen
  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:black, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, background:yellow, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:black, margin:"0 auto 16px" }}>YE</div>
        <div style={{ color:yellow, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase" }}>Loading...</div>
      </div>
    </div>
  );

  // Login screen
  if (!user) return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", maxWidth:480, margin:"0 auto" }}>
      <Login onLogin={login} error={authError}/>
    </div>
  );

  const renderPage = () => {
    switch(page) {
      case "dashboard":
        return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout}/>;
      case "new":
        return <NewInspection nav={nav} setSelId={setSelId}/>;
      case "list":
        return <AllInspections inspections={inspections} loading={loading} nav={nav} goDetail={goDetail}/>;
      case "detail":
        return <Detail inspections={inspections} selId={selId} nav={nav} setReportId={setReportId}/>;
      case "reports":
        return <Reports inspections={inspections} loading={loading} reportId={reportId} setReportId={setReportId} nav={nav}/>;
      default:
        return <Dashboard inspections={inspections} loading={loading} nav={nav} goDetail={goDetail} user={user} logout={logout}/>;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:white, fontFamily:"'Inter',-apple-system,sans-serif", maxWidth:480, margin:"0 auto", position:"relative", overflow:"hidden" }}>
      <div key={animKey} style={slideStyle}>
        {renderPage()}
      </div>

      <BottomNav
        page={page}
        nav={nav}
        user={user}
        logout={logout}
        open={menuOpen}
        setOpen={setMenuOpen}
      />

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        body { margin:0; padding:0; background:#0A0A0A; }
        input,select,textarea,button { font-family:'Inter',-apple-system,sans-serif; }
        ::-webkit-scrollbar { width:0px; }
        button:active { opacity:0.75; transform:scale(0.98); }
      `}</style>
    </div>
  );
}