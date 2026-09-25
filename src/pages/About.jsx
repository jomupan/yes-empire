import { white, black, gold, txt, sub, iosBg } from "../config";

export default function About({ nav, isLaptop }) {
    const pad=isLaptop ? "0 40px" : "0 16px";

    const info=[
        { label:"Company Name", value:"Benamora Empire" },
        { label:"Phone", value:"+60 10 -367 6007" },
        { label:"Email", value: "benamorahq@gmail.com" },
        { label:"CIDB Registration", value:"0120250519-SL155063" },
        { label:"Address", value:"F910, Block F, Pusat Dagangan Phileo Damansara 1, Jalan 16/11, Off Jalan Damansara, 46350, Petaling Jaya, Selangor" },
    ];

    const services=[
        { title:"Defect Inspection", desc:"Through inspection of property defects before handover to ensure quality standards are met." },
        { title:"Property Handover", desc:"Professional property handover process with detailed documentation and reporting." },
        { title:"Quality Control", desc:"Systematic quality control checks throughput the construction and finishing process." },
        { title:"Defect Report", desc:"Comprehensive defect reports with photos, floor plan markers and digital signatures." },
    ];

    return (
        <div style={{ background:"transparent", minHeight:"100vh", paddingBottom:40 }}>

            {/* HEADER */}
            <div style={{ background:"rgba(0,0,0,0.7)", padding: isLaptop?"40px 40px 28px":"72px 24px 24px", marginBottom:1 }}>

                {/* LOGO TICKER */}
                <div style={{ overflow:"hidden", marginBottom:20, borderTop:'1px solid ${gold}40', borderBottom:'1px solid ${gold}40', padding:"8px 0" }}>
                    <div style={{ display:"flex", animation:"ticker 8s linear infinite", width:"max-content", willChange:"transform" }}>
                        {[...Array(20)].map((_,i)=>(
                            <div key={i} style={{ flexShrink:0, width:100, height:28, overflow:"hidden", marginRight:50 }}>
                                <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                                </div>
                        ))}
                    </div>
                </div>

                <div style={{ fontWeight:800, fontSize: isLaptop?32:26, color:white, letterSpacing:-0.8, marginBottom:4 }}>About Us</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Benamora Empire - Property Inspection Specialists</div>
            </div>

            <div style={{ padding:pad, paddingTop:20 }}>

                {/* LOGO CARD */}
                <div style={{ background:white, padding:"32px 24px", marginBottom:1, textAlign:"center" }}>
                    <div style={{ width:200, height:80, margin:"0 auto 16px", overflow:"hidden" }}>
                        <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                    </div>
                    <div style={{ fontSize:13, color:sub, lineHeight:1.7, maxWidth:500, margin:"0 auto" }}>
                        Benamora Empire is a professional property inspection company based in Petaling Jaya, Selangor.
                        We specialise in defect inspection, property handover and quality control services
                        to ensure every property meets the highest standards before handover.
                    </div>
                </div>

                {/* COMPANY INFO */}
                <div style={{ background:white, padding:"24px 20px", marginBottom:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Company Information</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                        {info.map((item, i)=>(
                            <div key={item.label} style={{ display:"flex", gap:16, padding:"14px", borderBottom: i < info.length-1 ? "1px solid #E5E5EA" : "none" }}>
                                <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:0.5, textTransform:"uppercase", minWidth:140, flexShrink:0 }}>{item.label}</div>
                                <div style={{ fontSize:13, color:txt, lineHeight:1.6 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SERVICES */}
                    <div style={{ marginBottom:1 }}>
                        <div style={{ background:"rgba(0,0,0,0.7)", padding:"14px 20px", marginBottom:1 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:white, letterSpacing:2, textTransform:"uppercase" }}>Our Services</div>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns: isLaptop?"repeat(2,1fr)":"1fr", gap:1, background:"rgba(0,0,0,0.2)" }}>
                            {services.map((s,i)=>(
                                <div key={s.title} style={{ background:white, padding:"20px 24px", borderLeft:'4px solid ${gold}' }}>
                                    <div style={{ fontWeight:700, fontSize:15, color:txt, marginBottom:8 }}>{s.title}</div>
                                    <div style={{ fontSize:13, color:sub, lineHeight:1.7 }}>{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CONTACT */}
                        <div style={{ background:white, padding:"24px 20px", marginBottom:1 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Contact Us</div>
                            <div style={{ display:"grid", gridTemplateColumns: isLaptop?"1fr 1fr":"1fr", gap:12 }}>
                                <a href="tel:+60103676007" style={{ display:"flex", alignItems:"center", gap:14, padding:"16px", background:iosBg, textDecoration:"none", borderLeft:'3px solid ${gold}' }}>
                                    <div style={{ width:40, height:40, background:'${gold}20', display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📞</div>
                                    <div>
                                        <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Phone</div>
                                        <div style={{ fontSize:14, color:txt, fontWeight:600 }}>+60 10 - 367 6007</div>
                                    </div>
                                </a>
                                <a href="mailto:benamorahq@gmail.com" style={{ display:"flex", alignItems:"center", gap:14, padding:"16px", background:iosBg, textDecoration:"none", borderLeft:'3px solid ${gold}' }}>
                                    <div style={{ width:40, height:40, background:'${gold}20', display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📧</div>
                                    <div>
                                        <div style={{ fontSize:11, color:sub, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Email</div>
                                        <div style={{ fontSize:14, color:txt, fontWeight:600 }}>benamorahq@gmail.com</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* APP INFO */}
                        <div style={{ background:"rgba(0,0,0,0.7)", padding:"20px 24px", textAlign:"center" }}>
                            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, letterSpacing:1, textTransform:"uppercase",marginBottom:8 }}>Powered by</div>
                            <div style={{ width:100, height:36, margin:"0 auto 8px", overflow:"hidden" }}>
                                <img src="/BENAMORA.jpeg" alt="Benamora" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                            </div>
                            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>benamora Inspection System v1.0</div>
                            <div style={{ color:"rgba(255,255,255,0.2)", fontSize:10, marginTop:4 }}>© 2026 Benamora Empire. All rights reserved.</div>
                        </div>

            </div>

            <style>{`
            @keyframes ticker {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
                    }
            `}</style>
        </div>
    );
}