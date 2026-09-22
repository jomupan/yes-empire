// ── iOS Style Colors ───────────────────────────────────────────────────────────
export const gold       = "#F07C1E";
export const goldLight  = "#F5A623";
export const goldBg     = "#FFF5EB";
export const black      = "#000000";
export const blackSoft  = "#1C1C1E";
export const white      = "#FFFFFF";
export const iosBg      = "#F2F2F7";
export const iosCard    = "#FFFFFF";
export const iosGray    = "#8E8E93";
export const iosGray2   = "#AEAEB2";
export const iosGray3   = "#C7C7CC";
export const iosGray4   = "#D1D1D6";
export const iosSep     = "#E5E5EA";
export const txt        = "#000000";
export const sub        = "#8E8E93";
export const bdr        = "#E5E5EA";
export const red        = "#FF3B30";
export const green      = "#34C759";
export const blue       = "#007AFF";
export const purple     = "#AF52DE";
export const orange     = "#FF9500";

// Keep old names for compatibility
export const yellow     = gold;
export const yellowDark = "#D4660A";
export const yellowBg   = goldBg;
export const grayDark   = iosGray;
export const gray       = iosBg;
export const grayMid    = iosGray4;

// ── Severity ──────────────────────────────────────────────────────────────────
export const SEV = {
  Critical: { bar:red,    label:"#D70015", bg:"#FFF2F1", dot:red    },
  High:     { bar:orange, label:"#C93400", bg:"#FFF4E0", dot:orange },
  Medium:   { bar:gold,   label:"#B8942A", bg:"#FFFBF0", dot:gold   },
  Low:      { bar:green,  label:"#248A3D", bg:"#F0FFF4", dot:green  },
};

// ── Defect Status ─────────────────────────────────────────────────────────────
export const STA = {
  "Open":        { color:blue,   bg:"#F0F6FF", bdr:"#B8D4FF" },
  "In Progress": { color:purple, bg:"#F8F0FF", bdr:"#DEB8FF" },
  "Resolved":    { color:green,  bg:"#F0FFF4", bdr:"#B8FFD0" },
};

// ── Inspection Status ─────────────────────────────────────────────────────────
export const IST = {
  "Pending":     { color:orange, bg:"#FFF4E0", bdr:"#FFD5A0" },
  "In Progress": { color:blue,   bg:"#F0F6FF", bdr:"#B8D4FF" },
  "Completed":   { color:green,  bg:"#F0FFF4", bdr:"#B8FFD0" },
};

// ── Data ──────────────────────────────────────────────────────────────────────
export const MY_STATES  = ["Selangor","Kuala Lumpur","Johor","Pulau Pinang","Perak","Sabah","Sarawak","Kedah","Kelantan","Terengganu","Pahang","Negeri Sembilan","Melaka","Perlis","Putrajaya","Labuan"];
export const PROP_TYPES = ["Landed House","Apartment","Condominium","Townhouse","Semi-Detached","Bungalow","Shop Lot"];
export const CATS = ["Plumbing","Electrical","Structural","Painting / Finishing","Roofing","Flooring","Windows & Doors","HVAC / Ventilation","Other"];
export const ELEMENTS = ["Wall","Floor","Ceiling","Door","Window","Electrical","Plumbing","Roof","Column","Beam","Staircase","Other"];
export const DEFECT_TYPES = ["Hairline Crack","Major Crack","Uneven Colour","Uneven Surface","Water Stain","Paint Peeling","Damp / Wet Patch","Hollow Sound","Broken","Missing","Leaking","Rust","Mould","Poor Workmanship","Other"];
export const LOCS       = ["Living Room","Master Bedroom","Bedroom 2","Bedroom 3","Kitchen","Bathroom","Master Bathroom","Dining Room","Garage","Staircase","Exterior / Facade","Roof","Other"];

export const NAV = [
  { icon:"􀟜", label:"Dashboard", key:"dashboard" },
  { icon:"􀅼", label:"New",       key:"new"       },
  { icon:"􀋲", label:"List",      key:"list"      },
  { icon:"􀈖", label:"Reports",   key:"reports"   },
];