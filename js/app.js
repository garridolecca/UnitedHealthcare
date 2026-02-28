/* ============================================================
   UHC Location Intelligence Showcase — App Logic
   ============================================================ */

// ── Globals ──────────────────────────────────────────────────
const maps = {};
let activeTab = "overview";
let isAuthenticated = false;

// ── ArcGIS Service URLs ──────────────────────────────────────
const GEOCODE_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
const ROUTE_URL   = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
const SA_URL      = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World";

// ── Authentication ───────────────────────────────────────────
function initAuth() {
  require([
    "esri/config",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/portal/Portal",
  ], function (esriConfig, OAuthInfo, IdentityManager, Portal) {

    // API Key auth
    document.getElementById("apiKeyBtn").addEventListener("click", () => {
      const key = document.getElementById("apiKeyInput").value.trim();
      if (!key) return;
      esriConfig.apiKey = key;
      onAuthenticated("API Key");
    });

    // OAuth login
    document.getElementById("oauthBtn").addEventListener("click", () => {
      const info = new OAuthInfo({
        appId: "WOyYMbCC7FYXfnal",
        portalUrl: "https://www.arcgis.com",
        popup: true,
      });
      IdentityManager.registerOAuthInfos([info]);
      IdentityManager.getCredential("https://www.arcgis.com/sharing/rest")
        .then((cred) => {
          const portal = new Portal({ url: "https://www.arcgis.com" });
          portal.load().then(() => {
            onAuthenticated(portal.user ? portal.user.fullName : cred.userId);
          });
        })
        .catch(() => {
          showAuthStatus("Sign-in cancelled", false);
        });
    });

    // Sign out
    document.getElementById("signOutBtn").addEventListener("click", () => {
      esriConfig.apiKey = "";
      IdentityManager.destroyCredentials();
      isAuthenticated = false;
      showAuthStatus("Not authenticated", false);
      enableTools(false);
      document.getElementById("signOutBtn").style.display = "none";
      document.getElementById("apiKeyInput").style.display = "";
      document.getElementById("apiKeyBtn").style.display = "";
      document.getElementById("oauthBtn").style.display = "";
    });
  });
}

function onAuthenticated(label) {
  isAuthenticated = true;
  showAuthStatus("Signed in: " + label, true);
  enableTools(true);
  document.getElementById("signOutBtn").style.display = "";
  document.getElementById("apiKeyInput").style.display = "none";
  document.getElementById("apiKeyBtn").style.display = "none";
  document.getElementById("oauthBtn").style.display = "none";
  document.querySelector(".auth-divider").style.display = "none";
}

function showAuthStatus(text, ok) {
  const el = document.getElementById("authStatus");
  el.textContent = text;
  el.classList.toggle("ok", ok);
}

function enableTools(on) {
  document.querySelectorAll(".tool-btn").forEach((b) => (b.disabled = !on));
}

// ── Tab Management ───────────────────────────────────────────
document.getElementById("tabBar").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  switchTab(btn.dataset.tab);
});

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + tabId));
  if (tabId === "overview") return;
  if (!maps[tabId]) initMap(tabId);
  else maps[tabId].resize();
}

// ── Map Initialization Router ────────────────────────────────
function initMap(tabId) {
  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
  ], function (Map, MapView, Graphic, GraphicsLayer, Point, Polyline, PopupTemplate) {
    const builders = {
      fraud: buildFraud,
      access: buildAccess,
      cyber: buildCyber,
      retention: buildRetention,
      transparency: buildTransparency,
      rx: buildRx,
    };
    if (builders[tabId]) builders[tabId](Map, MapView, Graphic, GraphicsLayer, Point, Polyline, PopupTemplate);
  });
}

// ══════════════════════════════════════════════════════════════
//  TAB 1 — OVERVIEW (no map, expanded problem/solution cards)
// ══════════════════════════════════════════════════════════════
function buildOverview() {
  const problems = [
    {
      tab: "fraud", icon: "!", color: "#FF612B",
      title: "Medicare Billing Fraud",
      tag: "Hot Spot Analysis + Knowledge Graph + GeoAI",
      problem: "The DOJ has launched multiple investigations into systematic Medicare billing irregularities across UnitedHealthcare markets. Fraudulent claims cost the system billions annually and erode public trust in the organization's integrity.",
      solution: "<strong>ArcGIS Hot Spot Analysis (Getis-Ord Gi*)</strong> identifies statistically significant clusters of anomalous billing activity by county, revealing geographic patterns invisible in tabular data. <strong>ArcGIS Knowledge Graph</strong> maps relationships between providers, facilities, and billing entities to surface fraud rings across organizational boundaries. <strong>GeoAI &amp; GeoAnalytics Server</strong> run machine learning models at scale — detecting outlier billing patterns using space-time cubes and emerging hot spot analysis. <strong>ArcGIS Dashboards</strong> deliver real-time operational views for SIU (Special Investigations Unit) teams, while <strong>ArcGIS Field Maps</strong> enables on-the-ground investigators to verify flagged facilities with mobile GPS-driven workflows. The <strong>Geocoding Service</strong> standardizes and validates provider addresses across claims data to eliminate duplicate identities.",
      tech: ["Hot Spot Analysis (Getis-Ord Gi*)", "Knowledge Graph", "GeoAI", "GeoAnalytics Server", "Space-Time Cubes", "Emerging Hot Spot Analysis", "ArcGIS Dashboards", "Field Maps", "Geocoding Service", "ArcGIS Pro"],
    },
    {
      tab: "access", icon: "=", color: "#0166F5",
      title: "Access to Care & Equity",
      tag: "Geoenrichment + Living Atlas + Location Allocation",
      problem: "Prior authorization denial rates disproportionately affect vulnerable populations in low-income and minority communities. Members in underserved areas face longer wait times, fewer in-network providers, and higher out-of-pocket costs.",
      solution: "<strong>ArcGIS Network Analyst</strong> calculates drive-time and walk-time service areas around every in-network facility using the <strong>ArcGIS Routing Service</strong> and real-world road network data. <strong>Location-Allocation analysis</strong> optimizes where new facilities should be placed to maximize coverage for underserved populations. The <strong>ArcGIS Geocoding Service</strong> converts member addresses to precise coordinates for accurate distance calculations. <strong>ArcGIS Living Atlas</strong> provides authoritative demographic layers (ACS poverty, race/ethnicity, insurance coverage) that overlay with denial data to create a spatial Equity Index. <strong>ArcGIS Insights</strong> enables analysts to perform drag-and-drop spatial analytics, linking denial patterns to social determinants of health. <strong>ArcGIS StoryMaps</strong> communicates findings to regulators and community stakeholders in compelling narrative format.",
      tech: ["Network Analyst", "Routing Service", "Service Area Solver", "Location-Allocation", "Geocoding Service", "Living Atlas of the World", "ArcGIS Insights", "ArcGIS StoryMaps", "Demographics (Esri)", "ArcGIS Online"],
    },
    {
      tab: "cyber", icon: "#", color: "#1E3D6A",
      title: "Cyber Resilience",
      tag: "Indoors + Utility Network + Real-Time GIS",
      problem: "The 2024 ransomware attack on Change Healthcare disrupted claims processing nationwide and exposed critical single-point-of-failure dependencies in UHC's technology infrastructure. Recovery took months and cost over $2 billion.",
      solution: "<strong>ArcGIS Indoors</strong> maps the interior layout of every data center and claims hub — down to individual server racks, HVAC zones, and access control points. The <strong>ArcGIS Utility Network</strong> model traces connectivity between facilities, modeling fiber routes, VPN tunnels, and API dependencies as a topological network with upstream/downstream tracing. <strong>ArcGIS Velocity</strong> (Real-Time GIS) ingests live telemetry feeds — server health, network latency, intrusion detection alerts — and triggers geofenced notifications when anomalies are detected. <strong>ArcGIS Dashboards</strong> provide a real-time Common Operating Picture (COP) during incidents. <strong>ArcGIS Survey123</strong> captures post-incident assessments from field teams. The <strong>Routing Service</strong> calculates optimal failover paths when primary links go down, while <strong>GeoEvent Server</strong> processes streaming data for automated incident escalation.",
      tech: ["ArcGIS Indoors", "Utility Network Management", "ArcGIS Velocity (Real-Time)", "GeoEvent Server", "ArcGIS Dashboards", "Survey123", "Routing Service", "Trace Network", "ArcGIS Enterprise", "ArcGIS Monitor"],
    },
    {
      tab: "retention", icon: "$", color: "#002677",
      title: "Member Retention & Financial Performance",
      tag: "Business Analyst + Enrichment + Territory Design",
      problem: "UnitedHealthcare is facing declining financial performance with rising medical loss ratios and intensifying competition from regional insurers and new market entrants. Member churn is accelerating in key states, threatening market share.",
      solution: "<strong>ArcGIS Business Analyst</strong> enriches member data with Esri's proprietary <strong>demographic and consumer spending data</strong> at the ZIP code, census tract, and block group level — including Tapestry Segmentation profiles that classify neighborhoods by lifestyle and healthcare behavior. <strong>Territory Design</strong> optimizes sales and retention team boundaries to balance workload and market potential. <strong>Suitability Analysis</strong> scores every market for expansion opportunity using weighted overlays of population growth, income, competitor density, and satisfaction data. <strong>ArcGIS Notebooks</strong> (Python/Jupyter) run predictive churn models using scikit-learn integrated with the ArcGIS API for Python. <strong>ArcGIS Instant Apps</strong> publish interactive competitor maps for regional directors, while <strong>Geoenrichment Service</strong> appends real-time market data to any point or polygon on demand.",
      tech: ["Business Analyst", "Tapestry Segmentation", "Territory Design", "Suitability Analysis", "Geoenrichment Service", "ArcGIS Notebooks (Python)", "ArcGIS API for Python", "Instant Apps", "Living Atlas Demographics", "ArcGIS Online"],
    },
    {
      tab: "transparency", icon: "T", color: "#0166F5",
      title: "Public Trust & Transparency",
      tag: "ArcGIS Hub + Experience Builder + Open Data",
      problem: "Public trust in UnitedHealthcare has declined following coverage denials, pricing controversies, and perceived lack of transparency. Members and regulators are demanding open access to provider network data, quality metrics, and pricing information.",
      solution: "<strong>ArcGIS Hub</strong> creates a branded open data portal where members, regulators, and the public can search, download, and explore provider network data through interactive maps — no account required. <strong>ArcGIS Experience Builder</strong> delivers no-code/low-code web applications with advanced filtering, comparison widgets, and embedded analytics. <strong>ArcGIS Feature Services</strong> publish live provider directories that update automatically as networks change. The <strong>Geocoding Service</strong> powers a member-facing \"Find a Provider\" search that accepts addresses, ZIP codes, or place names and returns nearby in-network options with drive-time estimates via the <strong>Routing Service</strong>. <strong>ArcGIS StoryMaps</strong> present annual transparency reports with interactive maps showing coverage improvements year over year. <strong>ArcGIS Arcade</strong> expressions dynamically calculate and display adequacy scores in real-time pop-ups.",
      tech: ["ArcGIS Hub (Open Data)", "Experience Builder", "Feature Services (REST)", "Geocoding Service", "Routing Service", "ArcGIS StoryMaps", "ArcGIS Arcade", "Web AppBuilder", "ArcGIS Online", "Living Atlas Basemaps"],
    },
    {
      tab: "rx", icon: "R", color: "#FF612B",
      title: "Rx Drug Pricing & Pharmacy Access",
      tag: "Spatial Analysis + Network Analyst + Enrichment",
      problem: "Drug pricing varies dramatically by geography, and millions of UHC members live in pharmacy deserts where the nearest pharmacy is 10+ miles away. Members in underserved areas pay more for prescriptions and have lower medication adherence rates.",
      solution: "<strong>ArcGIS Spatial Analysis</strong> tools map pharmacy locations with pricing tiers and identify statistically significant clusters of high-cost areas using <strong>Cluster and Outlier Analysis (Anselin Local Moran's I)</strong>. <strong>Network Analyst Service Area solver</strong> calculates drive-time polygons (5, 10, 15, 20 minutes) around every pharmacy to identify pharmacy deserts where members exceed acceptable travel thresholds. The <strong>Geoenrichment Service</strong> appends population, age distribution, and chronic disease prevalence data to each desert zone. <strong>ArcGIS Pro</strong> performs <strong>Suitability Modeling</strong> to recommend optimal locations for new pharmacy partnerships or mail-order distribution hubs. <strong>ArcGIS Dashboards</strong> track real-time formulary pricing by region, while <strong>ArcGIS Field Maps</strong> enables pharmacy audit teams to verify pricing and inventory on-site with GPS-tagged photo documentation.",
      tech: ["Spatial Analysis", "Cluster & Outlier Analysis (Anselin)", "Network Analyst (Service Area)", "Geoenrichment Service", "Suitability Modeling", "ArcGIS Pro", "ArcGIS Dashboards", "Field Maps", "Geocoding Service", "ArcGIS Online"],
    },
  ];

  const container = document.getElementById("overviewContent");
  container.innerHTML = `
    <div class="overview-intro">
      <h2>Six Strategic Challenges, Six ArcGIS Solutions</h2>
      <p>UnitedHealthcare faces unprecedented operational, regulatory, and trust challenges. Esri's location platform transforms each problem into a spatial analytics opportunity. Click any card to learn more.</p>
    </div>
    <div class="overview-grid" id="overviewGrid"></div>
    <div class="detail-overlay" id="detailOverlay">
      <div class="detail-modal" id="detailModal"></div>
    </div>`;

  const grid = document.getElementById("overviewGrid");
  const overlay = document.getElementById("detailOverlay");
  const modal = document.getElementById("detailModal");

  // Close modal on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  problems.forEach((p) => {
    // Short summaries for cards
    const problemShort = p.problem.split(". ").slice(0, 1)[0] + ".";
    const solutionShort = p.solution.replace(/<\/?strong>/g, "").split(". ").slice(0, 1)[0] + ".";

    const card = document.createElement("div");
    card.className = "solution-card";
    card.style.borderLeftColor = p.color;
    card.innerHTML = `
      <div class="solution-card-header">
        <span class="problem-icon" style="background:${p.color}">${p.icon}</span>
        <h3>${p.title}</h3>
      </div>
      <span class="solution-tag">${p.tag}</span>
      <p class="card-summary"><b>Problem:</b> ${problemShort}<br><b>Solution:</b> ${solutionShort}</p>
      <div class="card-read-more">Read more &rarr;</div>`;

    card.addEventListener("click", () => {
      const techHtml = p.tech.map(t => `<span class="tech-chip">${t}</span>`).join("");
      modal.innerHTML = `
        <button class="detail-modal-close">&times;</button>
        <div class="detail-modal-header">
          <span class="problem-icon" style="background:${p.color}">${p.icon}</span>
          <h2>${p.title}</h2>
        </div>
        <span class="solution-tag">${p.tag}</span>
        <h4>The Problem</h4>
        <p>${p.problem}</p>
        <h4>The ArcGIS Solution</h4>
        <p>${p.solution}</p>
        <h4>ArcGIS Technology Stack</h4>
        <div class="tech-chips">${techHtml}</div>
        <button class="detail-modal-btn" id="modalMapBtn">Explore the Map &rarr;</button>`;
      overlay.classList.add("open");
      document.getElementById("modalMapBtn").addEventListener("click", () => {
        overlay.classList.remove("open");
        switchTab(p.tab);
      });
      modal.querySelector(".detail-modal-close").addEventListener("click", () => {
        overlay.classList.remove("open");
      });
    });

    grid.appendChild(card);
  });
}

// ── Helper: generate circle polygon points ───────────────────
function circlePoints(lng, lat, radiusDeg, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (2 * Math.PI * i) / n;
    pts.push([lng + radiusDeg * Math.cos(a) * 1.4, lat + radiusDeg * Math.sin(a)]);
  }
  return pts;
}

// ── Helper: irregular polygon (mock service area) ────────────
function serviceAreaPoly(lng, lat, baseDeg, seed) {
  const pts = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const a = (2 * Math.PI * i) / n;
    const jitter = baseDeg * (0.7 + 0.6 * Math.abs(Math.sin(seed * 13.7 + i * 3.1)));
    pts.push([lng + jitter * Math.cos(a) * 1.4, lat + jitter * Math.sin(a)]);
  }
  return pts;
}

// ══════════════════════════════════════════════════════════════
//  TAB 2 — FRAUD DETECTION
// ══════════════════════════════════════════════════════════════
const fraudData = [
  {name:"Miami-Dade, FL",lat:25.76,lng:-80.19,score:94,claims:3420,diag:8.2,flag:true},
  {name:"Los Angeles, CA",lat:34.05,lng:-118.24,score:87,claims:2870,diag:7.5,flag:true},
  {name:"Harris, TX",lat:29.76,lng:-95.37,score:82,claims:2650,diag:7.1,flag:true},
  {name:"Cook, IL",lat:41.88,lng:-87.63,score:79,claims:2510,diag:6.9,flag:true},
  {name:"Kings, NY",lat:40.63,lng:-73.94,score:88,claims:3100,diag:7.8,flag:true},
  {name:"Wayne, MI",lat:42.33,lng:-83.05,score:76,claims:2340,diag:6.6,flag:true},
  {name:"Philadelphia, PA",lat:39.95,lng:-75.16,score:71,claims:2180,diag:6.3,flag:true},
  {name:"Maricopa, AZ",lat:33.45,lng:-112.07,score:65,claims:1980,diag:5.9,flag:false},
  {name:"Bexar, TX",lat:29.42,lng:-98.49,score:62,claims:1870,diag:5.7,flag:false},
  {name:"Dallas, TX",lat:32.78,lng:-96.80,score:73,claims:2250,diag:6.5,flag:true},
  {name:"Clark, NV",lat:36.17,lng:-115.14,score:68,claims:2050,diag:6.1,flag:false},
  {name:"Broward, FL",lat:26.12,lng:-80.14,score:91,claims:3280,diag:8.0,flag:true},
  {name:"Palm Beach, FL",lat:26.71,lng:-80.05,score:85,claims:2780,diag:7.3,flag:true},
  {name:"Cuyahoga, OH",lat:41.50,lng:-81.69,score:58,claims:1720,diag:5.4,flag:false},
  {name:"Suffolk, MA",lat:42.36,lng:-71.06,score:52,claims:1580,diag:5.0,flag:false},
  {name:"Fulton, GA",lat:33.75,lng:-84.39,score:63,claims:1900,diag:5.8,flag:false},
  {name:"Hennepin, MN",lat:44.98,lng:-93.27,score:41,claims:1250,diag:4.3,flag:false},
  {name:"King, WA",lat:47.61,lng:-122.33,score:38,claims:1150,diag:4.0,flag:false},
  {name:"Denver, CO",lat:39.74,lng:-104.99,score:44,claims:1340,diag:4.5,flag:false},
  {name:"St. Louis City, MO",lat:38.63,lng:-90.20,score:67,claims:2020,diag:6.0,flag:false},
  {name:"Orleans, LA",lat:29.95,lng:-90.07,score:78,claims:2400,diag:6.8,flag:true},
  {name:"Shelby, TN",lat:35.15,lng:-90.05,score:72,claims:2200,diag:6.4,flag:true},
  {name:"Marion, IN",lat:39.77,lng:-86.16,score:55,claims:1650,diag:5.2,flag:false},
  {name:"Franklin, OH",lat:39.96,lng:-83.00,score:48,claims:1450,diag:4.8,flag:false},
  {name:"Duval, FL",lat:30.33,lng:-81.66,score:61,claims:1850,diag:5.6,flag:false},
  {name:"Travis, TX",lat:30.27,lng:-97.74,score:43,claims:1300,diag:4.4,flag:false},
  {name:"Allegheny, PA",lat:40.44,lng:-79.99,score:46,claims:1380,diag:4.6,flag:false},
  {name:"Baltimore City, MD",lat:39.29,lng:-76.61,score:69,claims:2080,diag:6.2,flag:false},
  {name:"Riverside, CA",lat:33.95,lng:-117.40,score:74,claims:2280,diag:6.5,flag:true},
  {name:"San Bernardino, CA",lat:34.11,lng:-117.29,score:70,claims:2150,diag:6.3,flag:true},
  {name:"Orange, CA",lat:33.72,lng:-117.83,score:56,claims:1680,diag:5.3,flag:false},
  {name:"San Diego, CA",lat:32.72,lng:-117.16,score:50,claims:1520,diag:4.9,flag:false},
  {name:"Tarrant, TX",lat:32.76,lng:-97.33,score:59,claims:1780,diag:5.5,flag:false},
  {name:"Wake, NC",lat:35.78,lng:-78.64,score:36,claims:1080,diag:3.9,flag:false},
  {name:"Mecklenburg, NC",lat:35.23,lng:-80.84,score:42,claims:1270,diag:4.3,flag:false},
  {name:"Hillsborough, FL",lat:27.95,lng:-82.46,score:66,claims:2000,diag:5.9,flag:false},
  {name:"Pinellas, FL",lat:27.77,lng:-82.68,score:64,claims:1930,diag:5.8,flag:false},
  {name:"Sacramento, CA",lat:38.58,lng:-121.49,score:53,claims:1600,diag:5.1,flag:false},
  {name:"Bernalillo, NM",lat:35.08,lng:-106.65,score:47,claims:1410,diag:4.7,flag:false},
  {name:"Davidson, TN",lat:36.16,lng:-86.78,score:40,claims:1200,diag:4.2,flag:false},
  {name:"Jefferson, KY",lat:38.25,lng:-85.76,score:54,claims:1630,diag:5.1,flag:false},
  {name:"Milwaukee, WI",lat:43.04,lng:-87.91,score:57,claims:1710,diag:5.3,flag:false},
  {name:"Kern, CA",lat:35.37,lng:-119.02,score:75,claims:2300,diag:6.7,flag:true},
  {name:"Essex, NJ",lat:40.79,lng:-74.21,score:80,claims:2480,diag:7.0,flag:true},
  {name:"Hudson, NJ",lat:40.73,lng:-74.08,score:77,claims:2370,diag:6.7,flag:true},
  {name:"Passaic, NJ",lat:40.92,lng:-74.17,score:71,claims:2170,diag:6.3,flag:true},
  {name:"Erie, NY",lat:42.89,lng:-78.88,score:45,claims:1360,diag:4.6,flag:false},
  {name:"Hamilton, OH",lat:39.10,lng:-84.51,score:60,claims:1820,diag:5.6,flag:false},
  {name:"Pima, AZ",lat:32.22,lng:-110.97,score:49,claims:1480,diag:4.8,flag:false},
  {name:"Salt Lake, UT",lat:40.76,lng:-111.89,score:33,claims:1000,diag:3.6,flag:false},
];

function fraudColor(score) {
  if (score >= 80) return [204, 0, 0, .85];
  if (score >= 60) return [255, 97, 43, .8];
  if (score >= 40) return [255, 193, 7, .75];
  return [76, 175, 80, .7];
}

function buildFraud(Map, MapView, Graphic, GraphicsLayer, Point, Polyline, PopupTemplate) {
  const haloLayer = new GraphicsLayer();   // Hot spot halos
  const linkLayer = new GraphicsLayer();   // Knowledge graph links
  const dotLayer  = new GraphicsLayer();   // County dots
  const map = new Map({ basemap: "gray-vector", layers: [haloLayer, linkLayer, dotLayer] });
  const view = new MapView({ container: "map-fraud", map, center: [-100, 42], zoom: 3 });
  maps.fraud = view;

  // Hot Spot Analysis halos (Getis-Ord Gi*) — concentric rings for flagged counties
  fraudData.filter(d => d.flag).forEach((d) => {
    [2.2, 1.4, 0.7].forEach((r, i) => {
      haloLayer.add(new Graphic({
        geometry: { type: "polygon", rings: [circlePoints(d.lng, d.lat, r, 36)] },
        symbol: { type: "simple-fill", color: [204, 0, 0, 0.04 + i * 0.03], outline: { color: [204, 0, 0, 0.12 + i * 0.08], width: 0.5 } },
      }));
    });
  });

  // Knowledge Graph links — connect flagged counties that are within 8° (fraud rings)
  const flagged = fraudData.filter(d => d.flag);
  for (let i = 0; i < flagged.length; i++) {
    for (let j = i + 1; j < flagged.length; j++) {
      const dx = flagged[i].lng - flagged[j].lng, dy = flagged[i].lat - flagged[j].lat;
      if (Math.sqrt(dx*dx + dy*dy) < 8) {
        linkLayer.add(new Graphic({
          geometry: new Polyline({ paths: [[[flagged[i].lng, flagged[i].lat], [flagged[j].lng, flagged[j].lat]]] }),
          symbol: { type: "simple-line", color: [204, 0, 0, 0.18], width: 1, style: "dash" },
        }));
      }
    }
  }

  // County dots with GeoAI-scored sizes
  fraudData.forEach((d) => {
    dotLayer.add(new Graphic({
      geometry: new Point({ longitude: d.lng, latitude: d.lat }),
      symbol: {
        type: "simple-marker",
        color: fraudColor(d.score),
        outline: { color: d.flag ? "#CC0000" : "#666", width: d.flag ? 2.5 : 1 },
        size: 8 + d.score / 6,
      },
      attributes: d,
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px">
          <b>GeoAI Anomaly Score:</b> {score}/100<br>
          <b>Claims/1k Beneficiaries:</b> {claims}<br>
          <b>Avg Diagnosis Codes:</b> {diag}<br>
          <b>Gi* Hot Spot:</b> ${d.flag ? '<span style="color:#CC0000">Significant (p<0.01)</span>' : "Not significant"}<br>
          <b>Knowledge Graph Links:</b> ${d.flag ? Math.floor(d.score / 12) + " connected entities" : "—"}<br>
          <b>Field Maps Status:</b> ${d.flag ? "Investigation assigned" : "Monitoring"}
        </div>`,
      },
    }));
  });

  const flagCount = flagged.length;
  const avgScore = (fraudData.reduce((s, d) => s + d.score, 0) / fraudData.length).toFixed(1);
  document.getElementById("fraudStats").innerHTML = `
    <div class="stat-row"><span class="label">Counties Analyzed</span><span class="value">${fraudData.length}</span></div>
    <div class="stat-row"><span class="label">Gi* Hot Spots</span><span class="value" style="color:#CC0000">${flagCount}</span></div>
    <div class="stat-row"><span class="label">Avg GeoAI Score</span><span class="value">${avgScore}</span></div>
    <div class="stat-row"><span class="label">Knowledge Graph Links</span><span class="value">${flagCount * (flagCount - 1) / 2}</span></div>
    <div class="stat-row"><span class="label">Claims Sampled</span><span class="value">${(fraudData.reduce((s,d)=>s+d.claims,0)).toLocaleString()}</span></div>
    <div class="stat-row"><span class="label">Field Investigations</span><span class="value">${flagCount}</span></div>`;

  document.getElementById("fraudLegend").innerHTML = `
    <h4>Anomaly Score (GeoAI)</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(204,0,0)"></span> Critical (80-100)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,97,43)"></span> High (60-79)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,193,7)"></span> Moderate (40-59)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(76,175,80)"></span> Low (0-39)</div>
    <h4 style="margin-top:10px">Overlays</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(204,0,0,.15);border:1px dashed #c00"></span> Hot Spot Halo (Gi*)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:transparent;border:1px dashed #c00"></span> Knowledge Graph Link</div>`;

  // Wire live Geocoding tool
  wireFraudGeocode(view, GraphicsLayer);
}

// ══════════════════════════════════════════════════════════════
//  TAB 3 — CARE ACCESS & EQUITY
// ══════════════════════════════════════════════════════════════
const accessData = [
  {name:"New York, NY",lat:40.71,lng:-74.00,denial:18.2,poverty:17.3,minority:67,equity:0.42},
  {name:"Los Angeles, CA",lat:34.05,lng:-118.24,denial:21.5,poverty:18.7,minority:72,equity:0.38},
  {name:"Chicago, IL",lat:41.88,lng:-87.63,denial:19.8,poverty:16.4,minority:65,equity:0.41},
  {name:"Houston, TX",lat:29.76,lng:-95.37,denial:23.1,poverty:19.2,minority:74,equity:0.35},
  {name:"Phoenix, AZ",lat:33.45,lng:-112.07,denial:17.4,poverty:15.8,minority:55,equity:0.48},
  {name:"Philadelphia, PA",lat:39.95,lng:-75.16,denial:20.3,poverty:22.1,minority:62,equity:0.37},
  {name:"Dallas, TX",lat:32.78,lng:-96.80,denial:22.0,poverty:17.9,minority:68,equity:0.36},
  {name:"Miami, FL",lat:25.76,lng:-80.19,denial:25.6,poverty:21.3,minority:79,equity:0.30},
  {name:"Atlanta, GA",lat:33.75,lng:-84.39,denial:19.1,poverty:18.5,minority:63,equity:0.40},
  {name:"Detroit, MI",lat:42.33,lng:-83.05,denial:24.3,poverty:30.6,minority:82,equity:0.28},
  {name:"San Francisco, CA",lat:37.77,lng:-122.42,denial:12.4,poverty:10.3,minority:57,equity:0.62},
  {name:"Seattle, WA",lat:47.61,lng:-122.33,denial:11.8,poverty:10.7,minority:39,equity:0.65},
  {name:"Boston, MA",lat:42.36,lng:-71.06,denial:13.2,poverty:17.5,minority:51,equity:0.55},
  {name:"Denver, CO",lat:39.74,lng:-104.99,denial:14.1,poverty:12.0,minority:42,equity:0.58},
  {name:"Minneapolis, MN",lat:44.98,lng:-93.27,denial:12.0,poverty:18.4,minority:40,equity:0.60},
  {name:"Cleveland, OH",lat:41.50,lng:-81.69,denial:22.7,poverty:30.8,minority:58,equity:0.31},
  {name:"Memphis, TN",lat:35.15,lng:-90.05,denial:26.1,poverty:25.1,minority:76,equity:0.27},
  {name:"Baltimore, MD",lat:39.29,lng:-76.61,denial:23.5,poverty:20.0,minority:70,equity:0.33},
  {name:"New Orleans, LA",lat:29.95,lng:-90.07,denial:24.8,poverty:23.8,minority:68,equity:0.29},
  {name:"St. Louis, MO",lat:38.63,lng:-90.20,denial:21.9,poverty:22.5,minority:56,equity:0.34},
  {name:"San Antonio, TX",lat:29.42,lng:-98.49,denial:20.5,poverty:17.8,minority:70,equity:0.37},
  {name:"Nashville, TN",lat:36.16,lng:-86.78,denial:16.3,poverty:15.2,minority:44,equity:0.50},
  {name:"Charlotte, NC",lat:35.23,lng:-80.84,denial:15.8,poverty:12.8,minority:52,equity:0.52},
  {name:"Indianapolis, IN",lat:39.77,lng:-86.16,denial:18.9,poverty:19.3,minority:45,equity:0.43},
  {name:"Columbus, OH",lat:39.96,lng:-83.00,denial:16.7,poverty:17.3,minority:39,equity:0.49},
  {name:"Jacksonville, FL",lat:30.33,lng:-81.66,denial:19.4,poverty:14.5,minority:48,equity:0.44},
  {name:"Milwaukee, WI",lat:43.04,lng:-87.91,denial:22.1,poverty:24.2,minority:53,equity:0.33},
  {name:"Kansas City, MO",lat:39.10,lng:-94.58,denial:17.6,poverty:15.0,minority:41,equity:0.47},
  {name:"Raleigh, NC",lat:35.78,lng:-78.64,denial:13.5,poverty:11.8,minority:47,equity:0.57},
  {name:"Salt Lake City, UT",lat:40.76,lng:-111.89,denial:11.2,poverty:14.4,minority:32,equity:0.63},
  {name:"Pittsburgh, PA",lat:40.44,lng:-79.99,denial:15.4,poverty:19.8,minority:34,equity:0.51},
  {name:"Cincinnati, OH",lat:39.10,lng:-84.51,denial:19.6,poverty:23.9,minority:46,equity:0.39},
];

function buildAccess(Map, MapView, Graphic, GraphicsLayer, Point, Polyline, PopupTemplate) {
  const saLayer   = new GraphicsLayer();  // Service area polygons
  const allocLayer = new GraphicsLayer(); // Location-allocation suggestions
  const dotLayer  = new GraphicsLayer();  // City dots
  const map = new Map({ basemap: "gray-vector", layers: [saLayer, allocLayer, dotLayer] });
  const view = new MapView({ container: "map-access", map, center: [-100, 42], zoom: 3 });
  maps.access = view;

  accessData.forEach((d, i) => {
    const eqColor = d.equity < 0.35 ? [204,0,0] : d.equity < 0.5 ? [255,97,43] : [76,175,80];

    // Drive-time service area polygons (Network Analyst mock — 3 rings)
    [1.8, 1.1, 0.5].forEach((r, ri) => {
      saLayer.add(new Graphic({
        geometry: { type: "polygon", rings: [serviceAreaPoly(d.lng, d.lat, r, i + ri)] },
        symbol: { type: "simple-fill", color: [...eqColor, 0.04 + ri * 0.02], outline: { color: [...eqColor, 0.15 + ri * 0.1], width: 0.5, style: ri === 0 ? "dash" : "solid" } },
      }));
    });

    // Location-Allocation: suggest new facility for worst-equity cities
    if (d.equity < 0.35) {
      const sugLng = d.lng + (Math.sin(i * 2.3) * 0.6);
      const sugLat = d.lat + (Math.cos(i * 1.7) * 0.4);
      allocLayer.add(new Graphic({
        geometry: new Point({ longitude: sugLng, latitude: sugLat }),
        symbol: { type: "simple-marker", style: "cross", color: [1, 102, 245], outline: { color: "#0166F5", width: 2 }, size: 14 },
        popupTemplate: { title: "Suggested Facility", content: `<b>Location-Allocation result</b><br>Recommended new site near ${d.name} to improve equity coverage.` },
      }));
      // Dashed line from city to suggested site
      allocLayer.add(new Graphic({
        geometry: new Polyline({ paths: [[[d.lng, d.lat], [sugLng, sugLat]]] }),
        symbol: { type: "simple-line", color: [1, 102, 245, 0.5], width: 1.5, style: "dot" },
      }));
    }

    // City dot (Geocoded member centroid)
    dotLayer.add(new Graphic({
      geometry: new Point({ longitude: d.lng, latitude: d.lat }),
      symbol: {
        type: "simple-marker",
        color: [...eqColor, 0.85],
        outline: { color: "#fff", width: 1.5 },
        size: 6 + d.denial * 0.5,
      },
      attributes: d,
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px">
          <b>Prior Auth Denial Rate:</b> {denial}%<br>
          <b>Poverty Rate (ACS):</b> {poverty}%<br>
          <b>Minority % (Living Atlas):</b> {minority}%<br>
          <b>Equity Index:</b> {equity}<br>
          <b>Drive-Time Coverage:</b> ${Math.round(82 - d.denial * 0.8)}% within 30 min<br>
          <b>Geocoded Members:</b> ${(Math.round(d.denial * 4200)).toLocaleString()}
        </div>`,
      },
    }));
  });

  const avgDenial = (accessData.reduce((s, d) => s + d.denial, 0) / accessData.length).toFixed(1);
  const worstCity = accessData.reduce((a, b) => (a.denial > b.denial ? a : b));
  const suggestedSites = accessData.filter(d => d.equity < 0.35).length;
  document.getElementById("accessStats").innerHTML = `
    <div class="stat-row"><span class="label">Cities (Geocoded)</span><span class="value">${accessData.length}</span></div>
    <div class="stat-row"><span class="label">Avg Denial Rate</span><span class="value">${avgDenial}%</span></div>
    <div class="stat-row"><span class="label">Worst Equity</span><span class="value" style="color:#CC0000">${worstCity.name}</span></div>
    <div class="stat-row"><span class="label">Location-Allocation Sites</span><span class="value" style="color:#0166F5">${suggestedSites}</span></div>
    <div class="stat-row"><span class="label">Service Areas Computed</span><span class="value">${accessData.length * 3}</span></div>`;

  document.getElementById("accessLegend").innerHTML = `
    <h4>Equity Index</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(204,0,0)"></span> Critical (&lt;0.35)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,97,43)"></span> At Risk (0.35-0.50)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(76,175,80)"></span> Adequate (&gt;0.50)</div>
    <h4 style="margin-top:10px">Overlays</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(100,100,100,.12);border:1px dashed #888"></span> Drive-Time Area (30/20/10 min)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:transparent;border:2px solid #0166F5;border-radius:0"></span> Location-Allocation Site</div>`;

  // Wire live Geoenrichment equity tool
  wireAccessEnrich(view, GraphicsLayer);
}

// ══════════════════════════════════════════════════════════════
//  TAB 4 — CYBER RESILIENCE
// ══════════════════════════════════════════════════════════════
const cyberData = [
  {name:"Primary DC — Eagan, MN",lat:44.80,lng:-93.17,type:"datacenter",risk:"low",status:"operational",tier:4},
  {name:"DR Site — Dallas, TX",lat:32.90,lng:-96.75,type:"datacenter",risk:"low",status:"operational",tier:3},
  {name:"Cloud East — Ashburn, VA",lat:39.04,lng:-77.49,type:"datacenter",risk:"medium",status:"operational",tier:3},
  {name:"Cloud West — The Dalles, OR",lat:45.60,lng:-121.18,type:"datacenter",risk:"low",status:"operational",tier:3},
  {name:"Claims Hub — Hartford, CT",lat:41.76,lng:-72.68,type:"claims",risk:"high",status:"degraded",tier:2},
  {name:"Claims Hub — Nashville, TN",lat:36.16,lng:-86.78,type:"claims",risk:"medium",status:"operational",tier:2},
  {name:"Claims Hub — Phoenix, AZ",lat:33.45,lng:-112.07,type:"claims",risk:"low",status:"operational",tier:2},
  {name:"Network Node — Chicago, IL",lat:41.88,lng:-87.63,type:"node",risk:"medium",status:"operational",tier:1},
  {name:"Network Node — Denver, CO",lat:39.74,lng:-104.99,type:"node",risk:"low",status:"operational",tier:1},
  {name:"Network Node — Atlanta, GA",lat:33.75,lng:-84.39,type:"node",risk:"medium",status:"operational",tier:1},
  {name:"Network Node — Los Angeles, CA",lat:34.05,lng:-118.24,type:"node",risk:"low",status:"operational",tier:1},
  {name:"Change HC — Nashville, TN",lat:36.20,lng:-86.82,type:"claims",risk:"critical",status:"compromised",tier:3},
  {name:"Optum Analytics — Eden Prairie, MN",lat:44.85,lng:-93.47,type:"datacenter",risk:"low",status:"operational",tier:3},
  {name:"Network Node — Boston, MA",lat:42.36,lng:-71.06,type:"node",risk:"low",status:"operational",tier:1},
  {name:"Network Node — Seattle, WA",lat:47.61,lng:-122.33,type:"node",risk:"low",status:"operational",tier:1},
  {name:"Claims Hub — San Antonio, TX",lat:29.42,lng:-98.49,type:"claims",risk:"low",status:"operational",tier:2},
  {name:"Backup DC — Omaha, NE",lat:41.26,lng:-95.94,type:"datacenter",risk:"low",status:"operational",tier:3},
  {name:"Network Node — Miami, FL",lat:25.76,lng:-80.19,type:"node",risk:"medium",status:"operational",tier:1},
];

const cyberLinks = [
  [0,1],[0,2],[0,3],[0,12],[2,4],[1,5],[3,6],[0,7],[1,8],[2,9],[3,10],[5,11],[2,13],[3,14],[1,15],[0,16],[2,17],
];

function cyberSymbol(d) {
  const colors = { critical: [204,0,0], high: [255,97,43], medium: [255,193,7], low: [76,175,80] };
  const shapes = { datacenter: "square", claims: "diamond", node: "circle" };
  return {
    type: "simple-marker",
    style: shapes[d.type] || "circle",
    color: [...(colors[d.risk] || colors.low), 0.85],
    outline: { color: d.status === "compromised" ? [204,0,0] : "#333", width: d.status === "compromised" ? 3 : 1.5 },
    size: d.type === "datacenter" ? 16 : d.type === "claims" ? 13 : 10,
  };
}

function buildCyber(Map, MapView, Graphic, GraphicsLayer, Point, Polyline) {
  const blastLayer    = new GraphicsLayer();  // Blast radius / cascade zones
  const linkLayer     = new GraphicsLayer();  // Utility Network trace lines
  const facilityLayer = new GraphicsLayer();  // Facility markers
  const telLayer      = new GraphicsLayer();  // Velocity telemetry pulses
  const map = new Map({ basemap: "dark-gray-vector", layers: [blastLayer, linkLayer, facilityLayer, telLayer] });
  const view = new MapView({ container: "map-cyber", map, center: [-100, 42], zoom: 3 });
  maps.cyber = view;

  // Blast radius zones for critical/high risk (cascade failure modeling)
  cyberData.filter(d => d.risk === "critical" || d.risk === "high").forEach((d, i) => {
    const riskColors = { critical: [204,0,0], high: [255,97,43] };
    const c = riskColors[d.risk];
    [3.0, 1.8].forEach((r, ri) => {
      blastLayer.add(new Graphic({
        geometry: { type: "polygon", rings: [circlePoints(d.lng, d.lat, r, 30)] },
        symbol: { type: "simple-fill", color: [...c, 0.04 + ri * 0.03], outline: { color: [...c, 0.15 + ri * 0.1], width: 0.5, style: "dash" } },
      }));
    });
  });

  // Utility Network trace lines with bandwidth indication
  cyberLinks.forEach(([a, b]) => {
    const da = cyberData[a], db = cyberData[b];
    const isRisk = da.risk === "critical" || db.risk === "critical" || da.risk === "high" || db.risk === "high";
    const isCritPath = da.type === "datacenter" && db.type === "datacenter";
    linkLayer.add(new Graphic({
      geometry: new Polyline({ paths: [[[da.lng, da.lat], [db.lng, db.lat]]] }),
      symbol: {
        type: "simple-line",
        color: isRisk ? [255, 97, 43, 0.7] : isCritPath ? [0, 200, 255, 0.6] : [100, 180, 255, 0.3],
        width: isCritPath ? 2.5 : isRisk ? 2 : 1,
        style: isRisk ? "dash" : "solid",
      },
      popupTemplate: {
        title: "Network Trace",
        content: `<b>From:</b> ${da.name}<br><b>To:</b> ${db.name}<br><b>Type:</b> ${isCritPath ? "Primary backbone (fiber)" : "API dependency"}<br><b>Status:</b> ${isRisk ? '<span style="color:#FF612B">At risk</span>' : "Healthy"}<br><b>Latency:</b> ${Math.round(5 + Math.random() * 40)}ms`,
      },
    }));
  });

  // Facility markers with ArcGIS Velocity telemetry status
  cyberData.forEach((d, i) => {
    facilityLayer.add(new Graphic({
      geometry: new Point({ longitude: d.lng, latitude: d.lat }),
      symbol: cyberSymbol(d),
      attributes: d,
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px">
          <b>Type:</b> {type} &nbsp;|&nbsp; <b>Tier:</b> {tier}<br>
          <b>Risk Level:</b> {risk}<br>
          <b>Status (Velocity):</b> <span style="color:${d.status==="compromised"?"#CC0000":d.status==="degraded"?"#FF612B":"#4CAF50"}">{status}</span><br>
          <b>Upstream Dependencies:</b> ${cyberLinks.filter(l => l[1] === i).length}<br>
          <b>Downstream Services:</b> ${cyberLinks.filter(l => l[0] === i).length}<br>
          <b>GeoEvent Alerts (24h):</b> ${d.risk === "critical" ? 47 : d.risk === "high" ? 12 : d.risk === "medium" ? 3 : 0}<br>
          <b>Survey123 Assessment:</b> ${d.status === "compromised" ? "Pending field review" : "Last 30 days"}
        </div>`,
      },
    }));

    // Telemetry pulse ring (ArcGIS Velocity mock)
    if (d.status === "compromised" || d.status === "degraded") {
      telLayer.add(new Graphic({
        geometry: new Point({ longitude: d.lng, latitude: d.lat }),
        symbol: { type: "simple-marker", color: [0,0,0,0], outline: { color: d.status === "compromised" ? [204,0,0,0.6] : [255,193,7,0.5], width: 2.5 }, size: 28 },
      }));
    }
  });

  const compromised = cyberData.filter((d) => d.status === "compromised").length;
  const highRisk = cyberData.filter((d) => d.risk === "critical" || d.risk === "high").length;
  const downstream = cyberLinks.filter(([a]) => cyberData[a].risk === "critical").length;
  document.getElementById("cyberStats").innerHTML = `
    <div class="stat-row"><span class="label">Facilities Mapped</span><span class="value">${cyberData.length}</span></div>
    <div class="stat-row"><span class="label">Compromised</span><span class="value" style="color:#CC0000">${compromised}</span></div>
    <div class="stat-row"><span class="label">High/Critical Risk</span><span class="value" style="color:#FF612B">${highRisk}</span></div>
    <div class="stat-row"><span class="label">Network Traces</span><span class="value">${cyberLinks.length}</span></div>
    <div class="stat-row"><span class="label">Cascade Downstream</span><span class="value" style="color:#FF612B">${downstream} services</span></div>
    <div class="stat-row"><span class="label">GeoEvent Alerts (24h)</span><span class="value">62</span></div>`;

  document.getElementById("cyberLegend").innerHTML = `
    <h4>Risk Level</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(204,0,0)"></span> Critical</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,97,43)"></span> High</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,193,7)"></span> Medium</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(76,175,80)"></span> Low</div>
    <h4 style="margin-top:10px">Facility Type</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:#aaa;border-radius:2px"></span> Data Center</div>
    <div class="legend-item"><span class="legend-swatch" style="background:#aaa;transform:rotate(45deg)"></span> Claims Hub</div>
    <div class="legend-item"><span class="legend-swatch" style="background:#aaa;border-radius:50%"></span> Network Node</div>
    <h4 style="margin-top:10px">Overlays</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(204,0,0,.1);border:1px dashed #c00"></span> Cascade Blast Radius</div>
    <div class="legend-item"><span class="legend-swatch" style="background:transparent;border-bottom:2px solid #00c8ff"></span> Backbone Trace</div>
    <div class="legend-item"><span class="legend-swatch" style="background:transparent;border:2px solid #c00;border-radius:50%"></span> Velocity Alert Pulse</div>`;

  // Wire live Routing tool
  wireCyberRouting(view, GraphicsLayer);
}

// ══════════════════════════════════════════════════════════════
//  TAB 5 — MEMBER RETENTION
// ══════════════════════════════════════════════════════════════
const retentionData = [
  {st:"AL",lat:32.32,lng:-86.90,members:420000,churn:8.2,competitors:3},{st:"AK",lat:63.59,lng:-154.49,members:45000,churn:5.1,competitors:1},
  {st:"AZ",lat:33.73,lng:-111.43,members:890000,churn:7.8,competitors:4},{st:"AR",lat:35.20,lng:-91.83,members:210000,churn:6.4,competitors:2},
  {st:"CA",lat:36.78,lng:-119.42,members:4200000,churn:9.1,competitors:6},{st:"CO",lat:39.55,lng:-105.78,members:680000,churn:7.2,competitors:4},
  {st:"CT",lat:41.60,lng:-72.90,members:520000,churn:6.8,competitors:3},{st:"DE",lat:38.91,lng:-75.53,members:110000,churn:5.9,competitors:2},
  {st:"FL",lat:27.99,lng:-81.76,members:3100000,churn:10.3,competitors:5},{st:"GA",lat:32.16,lng:-82.90,members:1100000,churn:8.5,competitors:4},
  {st:"HI",lat:19.90,lng:-155.58,members:95000,churn:4.2,competitors:1},{st:"ID",lat:44.07,lng:-114.74,members:150000,churn:5.5,competitors:2},
  {st:"IL",lat:40.63,lng:-89.40,members:1800000,churn:7.9,competitors:5},{st:"IN",lat:40.27,lng:-86.13,members:780000,churn:7.1,competitors:3},
  {st:"IA",lat:41.88,lng:-93.10,members:350000,churn:5.8,competitors:2},{st:"KS",lat:38.51,lng:-96.73,members:280000,churn:6.1,competitors:2},
  {st:"KY",lat:37.84,lng:-84.27,members:410000,churn:7.3,competitors:3},{st:"LA",lat:31.17,lng:-91.87,members:380000,churn:8.8,competitors:3},
  {st:"ME",lat:45.25,lng:-69.45,members:120000,churn:5.3,competitors:1},{st:"MD",lat:39.05,lng:-76.64,members:720000,churn:7.5,competitors:4},
  {st:"MA",lat:42.41,lng:-71.38,members:950000,churn:6.5,competitors:4},{st:"MI",lat:44.31,lng:-84.68,members:1200000,churn:8.1,competitors:4},
  {st:"MN",lat:46.73,lng:-94.69,members:850000,churn:5.4,competitors:3},{st:"MS",lat:32.35,lng:-89.40,members:220000,churn:7.6,competitors:2},
  {st:"MO",lat:38.46,lng:-92.29,members:650000,churn:7.0,competitors:3},{st:"MT",lat:46.88,lng:-110.36,members:80000,churn:4.8,competitors:1},
  {st:"NE",lat:41.49,lng:-99.90,members:210000,churn:5.6,competitors:2},{st:"NV",lat:38.80,lng:-116.42,members:420000,churn:8.4,competitors:3},
  {st:"NH",lat:43.19,lng:-71.57,members:145000,churn:5.2,competitors:2},{st:"NJ",lat:40.06,lng:-74.41,members:1300000,churn:7.7,competitors:5},
  {st:"NM",lat:34.52,lng:-105.87,members:180000,churn:6.3,competitors:2},{st:"NY",lat:43.30,lng:-74.22,members:2800000,churn:8.6,competitors:6},
  {st:"NC",lat:35.76,lng:-79.02,members:1050000,churn:7.4,competitors:4},{st:"ND",lat:47.55,lng:-101.00,members:65000,churn:4.5,competitors:1},
  {st:"OH",lat:40.42,lng:-82.91,members:1400000,churn:7.8,competitors:4},{st:"OK",lat:35.47,lng:-97.52,members:340000,churn:6.7,competitors:2},
  {st:"OR",lat:43.80,lng:-120.55,members:480000,churn:6.9,competitors:3},{st:"PA",lat:41.20,lng:-77.19,members:1700000,churn:7.3,competitors:5},
  {st:"RI",lat:41.58,lng:-71.48,members:120000,churn:6.0,competitors:2},{st:"SC",lat:33.84,lng:-81.16,members:450000,churn:7.5,competitors:3},
  {st:"SD",lat:43.97,lng:-99.90,members:75000,churn:4.7,competitors:1},{st:"TN",lat:35.52,lng:-86.58,members:680000,churn:8.0,competitors:3},
  {st:"TX",lat:31.97,lng:-99.90,members:3800000,churn:9.5,competitors:6},{st:"UT",lat:39.32,lng:-111.09,members:310000,churn:5.7,competitors:2},
  {st:"VT",lat:44.56,lng:-72.58,members:55000,churn:4.9,competitors:1},{st:"VA",lat:37.43,lng:-78.66,members:980000,churn:7.0,competitors:4},
  {st:"WA",lat:47.75,lng:-120.74,members:820000,churn:6.8,competitors:4},{st:"WV",lat:38.60,lng:-80.45,members:140000,churn:6.2,competitors:1},
  {st:"WI",lat:43.78,lng:-88.79,members:620000,churn:6.3,competitors:3},{st:"WY",lat:43.08,lng:-107.29,members:42000,churn:4.3,competitors:1},
];

function churnColor(c) {
  if (c >= 9) return [153, 0, 0, .8];
  if (c >= 7.5) return [204, 0, 0, .7];
  if (c >= 6) return [255, 152, 0, .65];
  return [76, 175, 80, .6];
}

// Tapestry segment names
const tapestrySegments = ["Metro Renters","Comfortable Empty Nesters","Savvy Suburbanites","Rural Heritage","Urban Uptown","Southern Satellites","Heartland Communities","Pacific Heights","College Towns","Silver & Gold"];

function buildRetention(Map, MapView, Graphic, GraphicsLayer, Point) {
  const territoryLayer = new GraphicsLayer();  // Territory Design boundaries
  const compLayer      = new GraphicsLayer();  // Competitor markers
  const dotLayer       = new GraphicsLayer();  // State churn dots
  const map = new Map({ basemap: "gray-vector", layers: [territoryLayer, compLayer, dotLayer] });
  const view = new MapView({ container: "map-retention", map, center: [-100, 42], zoom: 3 });
  maps.retention = view;

  // Territory Design — group states into 6 sales territories (mock polygons)
  const territories = [
    { name: "Northeast Territory", states: ["NY","NJ","PA","CT","MA","NH","VT","ME","RI","DE","MD"], color: [30,61,106] },
    { name: "Southeast Territory", states: ["FL","GA","SC","NC","VA","TN","AL","MS","LA","AR","WV","KY"], color: [1,102,245] },
    { name: "Midwest Territory", states: ["IL","OH","MI","IN","WI","MN","IA","MO","ND","SD","NE","KS"], color: [0,38,119] },
    { name: "South Central Territory", states: ["TX","OK","NM","AZ"], color: [255,97,43] },
    { name: "Mountain Territory", states: ["CO","UT","MT","WY","ID","NV"], color: [76,175,80] },
    { name: "Pacific Territory", states: ["CA","WA","OR","HI","AK"], color: [153,0,153] },
  ];
  territories.forEach((t) => {
    const tStates = retentionData.filter(d => t.states.includes(d.st));
    if (tStates.length < 2) return;
    // Draw convex hull-like polygon around territory states
    const cLng = tStates.reduce((s,d) => s+d.lng, 0) / tStates.length;
    const cLat = tStates.reduce((s,d) => s+d.lat, 0) / tStates.length;
    const sorted = [...tStates].sort((a,b) => Math.atan2(a.lat-cLat, a.lng-cLng) - Math.atan2(b.lat-cLat, b.lng-cLng));
    const hull = sorted.map(d => [d.lng, d.lat]);
    hull.push(hull[0]);
    territoryLayer.add(new Graphic({
      geometry: { type: "polygon", rings: [hull] },
      symbol: { type: "simple-fill", color: [...t.color, 0.06], outline: { color: [...t.color, 0.4], width: 1.5, style: "dash" } },
      popupTemplate: { title: t.name, content: `<b>States:</b> ${t.states.length}<br><b>Avg Churn:</b> ${(tStates.reduce((s,d)=>s+d.churn,0)/tStates.length).toFixed(1)}%<br><b>Members:</b> ${tStates.reduce((s,d)=>s+d.members,0).toLocaleString()}` },
    }));
  });

  retentionData.forEach((d, i) => {
    const tapestry = tapestrySegments[i % tapestrySegments.length];
    const suitability = Math.round(100 - d.churn * 8 + d.members / 200000);

    // State churn dot
    dotLayer.add(new Graphic({
      geometry: new Point({ longitude: d.lng, latitude: d.lat }),
      symbol: { type: "simple-marker", color: churnColor(d.churn), outline: { color: "#fff", width: 1 }, size: 10 + Math.sqrt(d.members / 60000) },
      attributes: d,
      popupTemplate: {
        title: "{st}",
        content: `<div style="font-size:13px">
          <b>Members:</b> ${d.members.toLocaleString()}<br>
          <b>Churn Rate:</b> {churn}%<br>
          <b>Competitors:</b> {competitors}<br>
          <b>Tapestry Segment:</b> ${tapestry}<br>
          <b>Geoenrichment — Median Income:</b> $${(38000 + Math.round(d.members / 80)).toLocaleString()}<br>
          <b>Suitability Score:</b> ${Math.min(suitability, 95)}/100<br>
          <b>Churn Prediction (ArcGIS Notebooks):</b> ${d.churn >= 8 ? '<span style="color:#c00">High risk — intervention recommended</span>' : "Stable"}
        </div>`,
      },
    }));

    // Competitor presence markers
    if (d.competitors >= 4) {
      for (let c = 0; c < Math.min(d.competitors, 5); c++) {
        const angle = (2 * Math.PI * c) / d.competitors;
        compLayer.add(new Graphic({
          geometry: new Point({ longitude: d.lng + Math.cos(angle) * 0.8, latitude: d.lat + Math.sin(angle) * 0.5 }),
          symbol: { type: "simple-marker", style: "triangle", color: [0, 38, 119, 0.45], outline: { color: "#002677", width: 0.8 }, size: 7 },
        }));
      }
    }
  });

  const totalMembers = retentionData.reduce((s, d) => s + d.members, 0);
  const avgChurn = (retentionData.reduce((s, d) => s + d.churn, 0) / retentionData.length).toFixed(1);
  const atRisk = retentionData.filter((d) => d.churn >= 8).length;
  document.getElementById("retentionKPIs").innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${(totalMembers / 1e6).toFixed(1)}M</div><div class="kpi-label">Total Members</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgChurn}%</div><div class="kpi-label">Avg Churn</div></div>
    <div class="kpi-card"><div class="kpi-value">${atRisk}</div><div class="kpi-label">At-Risk States</div></div>
    <div class="kpi-card"><div class="kpi-value">6</div><div class="kpi-label">Territories</div></div>`;

  document.getElementById("retentionLegend").innerHTML = `
    <h4>Churn Rate</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(153,0,0)"></span> Severe (9%+)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(204,0,0)"></span> High (7.5-9%)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,152,0)"></span> Moderate (6-7.5%)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(76,175,80)"></span> Low (&lt;6%)</div>
    <h4 style="margin-top:10px">Overlays</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(30,61,106,.12);border:1px dashed rgba(30,61,106,.5)"></span> Territory Boundary</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(0,38,119,.45);clip-path:polygon(50% 0%,0% 100%,100% 100%)"></span> Competitor Location</div>`;

  // Wire live Geoenrichment tool
  wireRetentionEnrich(view);
}

// ══════════════════════════════════════════════════════════════
//  TAB 6 — TRANSPARENCY HUB
// ══════════════════════════════════════════════════════════════
const transparencyData = [
  {name:"Northeast",lat:41.5,lng:-73.5,providers:12400,wait:8.2,satisfaction:4.1,hmo:85,ppo:92,epo:78,primary:95,cardiology:82,oncology:70,behavioral:65},
  {name:"Mid-Atlantic",lat:39.5,lng:-76.5,providers:10800,wait:9.5,satisfaction:3.8,hmo:80,ppo:88,epo:74,primary:90,cardiology:78,oncology:68,behavioral:60},
  {name:"Southeast",lat:33.5,lng:-83.5,providers:14200,wait:11.3,satisfaction:3.6,hmo:75,ppo:85,epo:70,primary:88,cardiology:74,oncology:62,behavioral:55},
  {name:"Great Lakes",lat:42.5,lng:-84.5,providers:11600,wait:9.8,satisfaction:3.9,hmo:82,ppo:90,epo:76,primary:92,cardiology:80,oncology:66,behavioral:62},
  {name:"South Central",lat:32.5,lng:-95.0,providers:13100,wait:12.1,satisfaction:3.5,hmo:72,ppo:83,epo:68,primary:85,cardiology:70,oncology:58,behavioral:52},
  {name:"Mountain West",lat:40.0,lng:-110.0,providers:5800,wait:13.5,satisfaction:3.7,hmo:70,ppo:80,epo:65,primary:82,cardiology:68,oncology:55,behavioral:48},
  {name:"Pacific Northwest",lat:46.5,lng:-122.0,providers:6400,wait:10.2,satisfaction:4.0,hmo:78,ppo:87,epo:72,primary:90,cardiology:76,oncology:64,behavioral:58},
  {name:"California",lat:36.5,lng:-119.5,providers:18500,wait:10.8,satisfaction:3.8,hmo:83,ppo:91,epo:77,primary:93,cardiology:81,oncology:69,behavioral:63},
  {name:"Upper Midwest",lat:45.5,lng:-94.0,providers:4900,wait:8.8,satisfaction:4.2,hmo:88,ppo:94,epo:82,primary:96,cardiology:85,oncology:73,behavioral:70},
  {name:"Florida",lat:27.5,lng:-81.5,providers:15200,wait:11.8,satisfaction:3.4,hmo:74,ppo:84,epo:69,primary:86,cardiology:72,oncology:60,behavioral:53},
  {name:"Texas",lat:31.0,lng:-99.0,providers:16800,wait:12.5,satisfaction:3.5,hmo:73,ppo:82,epo:67,primary:84,cardiology:71,oncology:57,behavioral:50},
  {name:"New England",lat:43.5,lng:-71.5,providers:7200,wait:8.5,satisfaction:4.3,hmo:90,ppo:95,epo:84,primary:97,cardiology:87,oncology:75,behavioral:72},
];

let transparencyView, transparencyLayer;

function adequacyColor(score) {
  if (score >= 90) return [76, 175, 80, 0.7];
  if (score >= 75) return [255, 193, 7, 0.7];
  if (score >= 60) return [255, 97, 43, 0.7];
  return [204, 0, 0, 0.7];
}

function getAdequacyScore(d, plan, specialty) {
  let planScore = (d.hmo + d.ppo + d.epo) / 3;
  if (plan === "hmo") planScore = d.hmo;
  else if (plan === "ppo") planScore = d.ppo;
  else if (plan === "epo") planScore = d.epo;

  let specScore = (d.primary + d.cardiology + d.oncology + d.behavioral) / 4;
  if (specialty === "primary") specScore = d.primary;
  else if (specialty === "cardiology") specScore = d.cardiology;
  else if (specialty === "oncology") specScore = d.oncology;
  else if (specialty === "behavioral") specScore = d.behavioral;

  return Math.round((planScore + specScore) / 2);
}

function renderTransparency(plan, specialty) {
  if (!transparencyLayer) return;
  transparencyLayer.removeAll();

  transparencyData.forEach((d) => {
    const score = getAdequacyScore(d, plan, specialty);
    transparencyLayer.add(new require("esri/Graphic")({
      geometry: new (require("esri/geometry/Point"))({ longitude: d.lng, latitude: d.lat }),
      symbol: { type: "simple-marker", color: adequacyColor(score), outline: { color: "#fff", width: 1.5 }, size: 18 + d.providers / 1200 },
      attributes: { ...d, adequacy: score },
      popupTemplate: {
        title: "{name}",
        content: `<b>Adequacy Score:</b> ${score}%<br>
                  <b>Providers:</b> ${d.providers.toLocaleString()}<br>
                  <b>Avg Wait (days):</b> ${d.wait}<br>
                  <b>Satisfaction:</b> ${d.satisfaction}/5.0`,
      },
    }));
  });

  const avgAdequacy = Math.round(transparencyData.reduce((s, d) => s + getAdequacyScore(d, plan, specialty), 0) / transparencyData.length);
  const totalProviders = transparencyData.reduce((s, d) => s + d.providers, 0);
  document.getElementById("transparencyStats").innerHTML = `
    <div class="stat-row"><span class="label">Regions</span><span class="value">${transparencyData.length}</span></div>
    <div class="stat-row"><span class="label">Total Providers</span><span class="value">${totalProviders.toLocaleString()}</span></div>
    <div class="stat-row"><span class="label">Avg Adequacy</span><span class="value">${avgAdequacy}%</span></div>
    <div class="stat-row"><span class="label">Filter</span><span class="value">${plan === "all" ? "All Plans" : plan.toUpperCase()} / ${specialty === "all" ? "All" : specialty}</span></div>`;
}

function buildTransparency(Map, MapView, Graphic, GraphicsLayer, Point) {
  transparencyLayer = new GraphicsLayer();
  const map = new Map({ basemap: "gray-vector", layers: [transparencyLayer] });
  transparencyView = new MapView({ container: "map-transparency", map, center: [-100, 42], zoom: 3 });
  maps.transparency = transparencyView;

  // Initial render
  setTimeout(() => renderTransparencyDirect("all", "all"), 300);

  // Filters
  document.getElementById("planTypeFilter").addEventListener("change", applyTransparencyFilters);
  document.getElementById("specialtyFilter").addEventListener("change", applyTransparencyFilters);
}

function applyTransparencyFilters() {
  const plan = document.getElementById("planTypeFilter").value;
  const specialty = document.getElementById("specialtyFilter").value;
  renderTransparencyDirect(plan, specialty);
}

function renderTransparencyDirect(plan, specialty) {
  if (!transparencyLayer) return;
  transparencyLayer.removeAll();

  require(["esri/Graphic", "esri/geometry/Point", "esri/geometry/Polyline"], function (Graphic, Point, Polyline) {
    transparencyData.forEach((d, i) => {
      const score = getAdequacyScore(d, plan, specialty);
      const c = adequacyColor(score);

      // Coverage area polygon (Feature Service mock)
      transparencyLayer.add(new Graphic({
        geometry: { type: "polygon", rings: [serviceAreaPoly(d.lng, d.lat, 2.5, i * 7 + 3)] },
        symbol: { type: "simple-fill", color: [...c.slice(0,3), 0.08], outline: { color: [...c.slice(0,3), 0.3], width: 1 } },
      }));

      // Provider density ring (Arcade-calculated)
      transparencyLayer.add(new Graphic({
        geometry: new Point({ longitude: d.lng, latitude: d.lat }),
        symbol: { type: "simple-marker", color: [0,0,0,0], outline: { color: [...c.slice(0,3), 0.4], width: 1.5 }, size: 16 + d.providers / 800 },
      }));

      // Region marker
      transparencyLayer.add(new Graphic({
        geometry: new Point({ longitude: d.lng, latitude: d.lat }),
        symbol: { type: "simple-marker", color: c, outline: { color: "#fff", width: 1.5 }, size: 12 },
        attributes: { ...d, adequacy: score },
        popupTemplate: {
          title: d.name,
          content: `<div style="font-size:13px">
            <b>Adequacy Score (Arcade):</b> ${score}%<br>
            <b>Providers (Feature Service):</b> ${d.providers.toLocaleString()}<br>
            <b>Avg Wait (days):</b> ${d.wait}<br>
            <b>Satisfaction:</b> ${d.satisfaction}/5.0<br>
            <b>Plan: </b>${plan === "all" ? "All" : plan.toUpperCase()} — HMO: ${d.hmo}%, PPO: ${d.ppo}%, EPO: ${d.epo}%<br>
            <b>Specialty Coverage:</b> Primary ${d.primary}% | Cardio ${d.cardiology}% | Onco ${d.oncology}% | BH ${d.behavioral}%<br>
            <b>Published via:</b> ArcGIS Hub Open Data
          </div>`,
        },
      }));

      // StoryMap indicator for low-scoring regions
      if (score < 70) {
        transparencyLayer.add(new Graphic({
          geometry: new Point({ longitude: d.lng + 0.8, latitude: d.lat + 0.5 }),
          symbol: { type: "simple-marker", style: "square", color: [255, 97, 43, 0.7], outline: { color: "#fff", width: 1 }, size: 7 },
          popupTemplate: { title: "StoryMap Alert", content: `<b>${d.name}</b> flagged for transparency report.<br>Adequacy: ${score}% — below 70% threshold.` },
        }));
      }
    });

    const avgAdequacy = Math.round(transparencyData.reduce((s, d) => s + getAdequacyScore(d, plan, specialty), 0) / transparencyData.length);
    const totalProviders = transparencyData.reduce((s, d) => s + d.providers, 0);
    const belowThreshold = transparencyData.filter(d => getAdequacyScore(d, plan, specialty) < 70).length;
    document.getElementById("transparencyStats").innerHTML = `
      <div class="stat-row"><span class="label">Regions</span><span class="value">${transparencyData.length}</span></div>
      <div class="stat-row"><span class="label">Total Providers</span><span class="value">${totalProviders.toLocaleString()}</span></div>
      <div class="stat-row"><span class="label">Avg Adequacy (Arcade)</span><span class="value">${avgAdequacy}%</span></div>
      <div class="stat-row"><span class="label">Below Threshold</span><span class="value" style="color:#FF612B">${belowThreshold}</span></div>
      <div class="stat-row"><span class="label">Filter</span><span class="value">${plan === "all" ? "All Plans" : plan.toUpperCase()} / ${specialty === "all" ? "All" : specialty}</span></div>
      <div class="stat-row"><span class="label">Data Source</span><span class="value">Hub Open Data</span></div>`;
  });

  // Wire live Transparency Search tool
  wireTransparencySearch(transparencyView, GraphicsLayer);
}

// ══════════════════════════════════════════════════════════════
//  TAB 7 — RX ANALYTICS
// ══════════════════════════════════════════════════════════════
const rxData = [
  {name:"CVS — Manhattan, NY",lat:40.76,lng:-73.98,tier:"low",avg:12.50,generic:85,desert:false},
  {name:"Walgreens — Brooklyn, NY",lat:40.65,lng:-73.95,tier:"mid",avg:18.20,generic:78,desert:false},
  {name:"Rite Aid — Bronx, NY",lat:40.84,lng:-73.87,tier:"high",avg:24.80,generic:62,desert:true},
  {name:"CVS — Chicago, IL",lat:41.88,lng:-87.63,tier:"low",avg:13.10,generic:83,desert:false},
  {name:"Walgreens — South Side Chicago",lat:41.75,lng:-87.62,tier:"high",avg:26.40,generic:58,desert:true},
  {name:"CVS — Los Angeles, CA",lat:34.05,lng:-118.24,tier:"low",avg:14.20,generic:81,desert:false},
  {name:"Rite Aid — Compton, CA",lat:33.90,lng:-118.22,tier:"high",avg:23.50,generic:60,desert:true},
  {name:"Walgreens — Houston, TX",lat:29.76,lng:-95.37,tier:"mid",avg:17.80,generic:76,desert:false},
  {name:"CVS — Phoenix, AZ",lat:33.45,lng:-112.07,tier:"mid",avg:16.90,generic:79,desert:false},
  {name:"Walgreens — Philadelphia, PA",lat:39.95,lng:-75.16,tier:"mid",avg:18.50,generic:75,desert:false},
  {name:"Independent — North Philly",lat:40.01,lng:-75.14,tier:"high",avg:27.30,generic:55,desert:true},
  {name:"CVS — San Francisco, CA",lat:37.78,lng:-122.41,tier:"low",avg:15.30,generic:80,desert:false},
  {name:"Walgreens — Miami, FL",lat:25.76,lng:-80.19,tier:"mid",avg:19.40,generic:74,desert:false},
  {name:"CVS — Overtown Miami, FL",lat:25.79,lng:-80.20,tier:"high",avg:25.60,generic:57,desert:true},
  {name:"CVS — Atlanta, GA",lat:33.75,lng:-84.39,tier:"mid",avg:17.10,generic:77,desert:false},
  {name:"Walgreens — East Atlanta",lat:33.74,lng:-84.34,tier:"high",avg:24.20,generic:61,desert:true},
  {name:"CVS — Dallas, TX",lat:32.78,lng:-96.80,tier:"low",avg:13.80,generic:82,desert:false},
  {name:"Walmart — San Antonio, TX",lat:29.42,lng:-98.49,tier:"low",avg:11.90,generic:88,desert:false},
  {name:"CVS — Boston, MA",lat:42.36,lng:-71.06,tier:"mid",avg:16.40,generic:79,desert:false},
  {name:"Walgreens — Roxbury, MA",lat:42.33,lng:-71.09,tier:"high",avg:23.10,generic:64,desert:true},
  {name:"CVS — Seattle, WA",lat:47.61,lng:-122.33,tier:"low",avg:14.80,generic:81,desert:false},
  {name:"CVS — Denver, CO",lat:39.74,lng:-104.99,tier:"low",avg:13.50,generic:84,desert:false},
  {name:"Walgreens — Detroit, MI",lat:42.33,lng:-83.05,tier:"high",avg:28.10,generic:52,desert:true},
  {name:"CVS — Minneapolis, MN",lat:44.98,lng:-93.27,tier:"low",avg:12.80,generic:86,desert:false},
  {name:"Rite Aid — Cleveland, OH",lat:41.50,lng:-81.69,tier:"mid",avg:19.80,generic:72,desert:false},
  {name:"Independent — East Cleveland",lat:41.53,lng:-81.58,tier:"high",avg:26.90,generic:54,desert:true},
  {name:"CVS — Nashville, TN",lat:36.16,lng:-86.78,tier:"mid",avg:16.70,generic:78,desert:false},
  {name:"Walgreens — St. Louis, MO",lat:38.63,lng:-90.20,tier:"mid",avg:18.90,generic:73,desert:false},
  {name:"Independent — North St. Louis",lat:38.69,lng:-90.25,tier:"high",avg:25.40,generic:56,desert:true},
  {name:"CVS — Indianapolis, IN",lat:39.77,lng:-86.16,tier:"mid",avg:17.30,generic:76,desert:false},
  {name:"Walmart — Columbus, OH",lat:39.96,lng:-83.00,tier:"low",avg:12.10,generic:87,desert:false},
  {name:"CVS — Charlotte, NC",lat:35.23,lng:-80.84,tier:"low",avg:14.50,generic:82,desert:false},
  {name:"Walgreens — Memphis, TN",lat:35.15,lng:-90.05,tier:"high",avg:24.70,generic:59,desert:true},
  {name:"CVS — Kansas City, MO",lat:39.10,lng:-94.58,tier:"mid",avg:16.20,generic:78,desert:false},
  {name:"Walgreens — Baltimore, MD",lat:39.29,lng:-76.61,tier:"mid",avg:19.10,generic:74,desert:false},
  {name:"Independent — West Baltimore",lat:39.29,lng:-76.66,tier:"high",avg:27.80,generic:53,desert:true},
  {name:"CVS — Salt Lake City, UT",lat:40.76,lng:-111.89,tier:"low",avg:12.30,generic:85,desert:false},
  {name:"CVS — Raleigh, NC",lat:35.78,lng:-78.64,tier:"low",avg:13.90,generic:83,desert:false},
  {name:"Walgreens — New Orleans, LA",lat:29.95,lng:-90.07,tier:"high",avg:25.90,generic:57,desert:true},
  {name:"CVS — Jacksonville, FL",lat:30.33,lng:-81.66,tier:"mid",avg:17.60,generic:77,desert:false},
  {name:"Walgreens — Milwaukee, WI",lat:43.04,lng:-87.91,tier:"mid",avg:18.40,generic:75,desert:false},
  {name:"Independent — North Milwaukee",lat:43.10,lng:-87.92,tier:"high",avg:26.20,generic:55,desert:true},
];

function rxColor(d) {
  if (d.desert) return [153, 0, 153, 0.8];
  if (d.tier === "low") return [76, 175, 80, 0.8];
  if (d.tier === "mid") return [255, 193, 7, 0.8];
  return [204, 0, 0, 0.8];
}

function buildRx(Map, MapView, Graphic, GraphicsLayer, Point) {
  const saLayer      = new GraphicsLayer();  // Service area drive-time polygons
  const clusterLayer = new GraphicsLayer();  // Cluster/outlier zones (Anselin)
  const suitLayer    = new GraphicsLayer();  // Suitability recommendation sites
  const dotLayer     = new GraphicsLayer();  // Pharmacy dots
  const map = new Map({ basemap: "gray-vector", layers: [saLayer, clusterLayer, suitLayer, dotLayer] });
  const view = new MapView({ container: "map-rx", map, center: [-100, 42], zoom: 3 });
  maps.rx = view;

  // Cluster & Outlier zones (Anselin Local Moran's I) around desert pharmacies
  const desertPharms = rxData.filter(d => d.desert);
  // Group nearby deserts into cluster zones
  const clustered = new Set();
  desertPharms.forEach((d, i) => {
    if (clustered.has(i)) return;
    const nearby = desertPharms.filter((o, j) => {
      if (j === i) return false;
      const dist = Math.sqrt((d.lng-o.lng)**2 + (d.lat-o.lat)**2);
      return dist < 3;
    });
    if (nearby.length > 0) {
      const all = [d, ...nearby];
      const cLng = all.reduce((s,p) => s+p.lng, 0) / all.length;
      const cLat = all.reduce((s,p) => s+p.lat, 0) / all.length;
      clusterLayer.add(new Graphic({
        geometry: { type: "polygon", rings: [serviceAreaPoly(cLng, cLat, 2.0, i * 5 + 7)] },
        symbol: { type: "simple-fill", color: [153, 0, 153, 0.06], outline: { color: [153, 0, 153, 0.3], width: 1.5, style: "dash" } },
        popupTemplate: { title: "High-Cost Cluster (Anselin)", content: `<b>Pharmacies in cluster:</b> ${all.length}<br><b>Type:</b> High-High cluster (p<0.05)<br><b>Avg Copay:</b> $${(all.reduce((s,p)=>s+p.avg,0)/all.length).toFixed(2)}` },
      }));
      nearby.forEach((_, j) => clustered.add(desertPharms.indexOf(nearby[j])));
    }
  });

  rxData.forEach((d, i) => {
    // Service area polygons (Network Analyst) — only for non-desert pharmacies
    if (!d.desert) {
      [1.2, 0.6].forEach((r, ri) => {
        saLayer.add(new Graphic({
          geometry: { type: "polygon", rings: [serviceAreaPoly(d.lng, d.lat, r, i * 3 + ri)] },
          symbol: { type: "simple-fill", color: [76, 175, 80, 0.03 + ri * 0.02], outline: { color: [76, 175, 80, 0.1 + ri * 0.08], width: 0.4 } },
        }));
      });
    }

    // Desert zone highlight
    if (d.desert) {
      dotLayer.add(new Graphic({
        geometry: new Point({ longitude: d.lng, latitude: d.lat }),
        symbol: { type: "simple-marker", color: [153, 0, 153, 0.1], outline: { color: [153, 0, 153, 0.3], width: 1 }, size: 40 },
      }));
    }

    // Pharmacy dot
    dotLayer.add(new Graphic({
      geometry: new Point({ longitude: d.lng, latitude: d.lat }),
      symbol: { type: "simple-marker", color: rxColor(d), outline: { color: "#fff", width: 1.2 }, size: d.desert ? 11 : 9 },
      attributes: d,
      popupTemplate: {
        title: d.name,
        content: `<div style="font-size:13px">
          <b>Pricing Tier:</b> ${d.tier}<br>
          <b>Avg Copay:</b> $${d.avg.toFixed(2)}<br>
          <b>Generic Dispensing Rate:</b> ${d.generic}%<br>
          <b>Pharmacy Desert:</b> ${d.desert ? "Yes" : "No"}<br>
          <b>Anselin Cluster:</b> ${d.desert ? "High-High (significant)" : "Not significant"}<br>
          <b>Drive-Time Coverage:</b> ${d.desert ? "10+ min to nearest alternative" : "<5 min"}<br>
          <b>Geoenrichment — Diabetes Prevalence:</b> ${(8 + d.avg * 0.3).toFixed(1)}%<br>
          <b>Field Maps Audit:</b> ${d.desert ? "Scheduled" : "Completed"}
        </div>`,
      },
    }));
  });

  // Suitability sites — recommended new pharmacy partnerships
  const suitSites = [
    { name: "Recommended — South Bronx, NY", lat: 40.82, lng: -73.92 },
    { name: "Recommended — South Side Chicago, IL", lat: 41.73, lng: -87.65 },
    { name: "Recommended — Compton, CA", lat: 33.88, lng: -118.20 },
    { name: "Recommended — West Detroit, MI", lat: 42.35, lng: -83.12 },
    { name: "Recommended — East Cleveland, OH", lat: 41.55, lng: -81.55 },
    { name: "Recommended — West Baltimore, MD", lat: 39.30, lng: -76.70 },
  ];
  suitSites.forEach(s => {
    suitLayer.add(new Graphic({
      geometry: new Point({ longitude: s.lng, latitude: s.lat }),
      symbol: { type: "simple-marker", style: "cross", color: [1, 102, 245], outline: { color: "#0166F5", width: 2.5 }, size: 14 },
      popupTemplate: { title: s.name, content: "<b>Suitability Model Result</b><br>Weighted overlay of population density, chronic disease prevalence, competitor distance, and transit access recommends new pharmacy partnership here." },
    }));
  });

  // Price comparison chart
  const tiers = { low: [], mid: [], high: [] };
  rxData.forEach((d) => tiers[d.tier].push(d.avg));
  const avgByTier = {};
  for (const [k, v] of Object.entries(tiers)) avgByTier[k] = (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2);

  const maxPrice = 30;
  document.getElementById("rxChart").innerHTML = `
    <h4 style="font-size:.78rem;color:#666;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Avg Copay by Tier</h4>
    <div class="chart-bar-group">
      <div class="chart-bar-label">Low Tier — $${avgByTier.low}</div>
      <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${(avgByTier.low / maxPrice) * 100}%;background:#4CAF50">$${avgByTier.low}</div></div>
    </div>
    <div class="chart-bar-group">
      <div class="chart-bar-label">Mid Tier — $${avgByTier.mid}</div>
      <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${(avgByTier.mid / maxPrice) * 100}%;background:#FFC107">$${avgByTier.mid}</div></div>
    </div>
    <div class="chart-bar-group">
      <div class="chart-bar-label">High Tier — $${avgByTier.high}</div>
      <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${(avgByTier.high / maxPrice) * 100}%;background:#CC0000">$${avgByTier.high}</div></div>
    </div>`;

  const deserts = rxData.filter((d) => d.desert).length;
  document.getElementById("rxLegend").innerHTML = `
    <h4>Pricing Tier</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(76,175,80)"></span> Low (&lt;$15)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(255,193,7)"></span> Mid ($15-$22)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(204,0,0)"></span> High ($22+)</div>
    <h4 style="margin-top:10px">Overlays</h4>
    <div class="legend-item"><span class="legend-swatch" style="background:rgb(153,0,153,.2);border:1px dashed rgb(153,0,153)"></span> Pharmacy Desert</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(153,0,153,.08);border:1.5px dashed rgb(153,0,153)"></span> Anselin Cluster Zone</div>
    <div class="legend-item"><span class="legend-swatch" style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3)"></span> Service Area (5/10 min)</div>
    <div class="legend-item"><span class="legend-swatch" style="background:transparent;border:2px solid #0166F5;border-radius:0"></span> Suitability Site</div>
    <div style="margin-top:10px;font-size:.82rem;color:#666"><b>${deserts}</b> deserts | <b>${suitSites.length}</b> recommended sites</div>`;

  // Wire live Rx Finder tool
  wireRxFinder(view, GraphicsLayer);
}

// ══════════════════════════════════════════════════════════════
//  LIVE SERVICE TOOLS — wired after map builds
// ══════════════════════════════════════════════════════════════

// --- Fraud: Geocoding Service ---
function wireFraudGeocode(view, GraphicsLayer) {
  const layer = new GraphicsLayer();
  view.map.add(layer);
  document.getElementById("fraudGeoBtn").addEventListener("click", () => {
    if (!isAuthenticated) return;
    const address = document.getElementById("fraudGeoInput").value.trim();
    if (!address) return;
    const resEl = document.getElementById("fraudGeoResult");
    resEl.className = "tool-result loading";
    resEl.textContent = "Geocoding...";
    require(["esri/rest/locator", "esri/Graphic", "esri/geometry/Point"], (locator, Graphic, Point) => {
      locator.addressToLocations(GEOCODE_URL, {
        address: { SingleLine: address },
        maxLocations: 1,
        outFields: ["Match_addr", "Addr_type", "City", "Region"],
      }).then((results) => {
        layer.removeAll();
        if (!results.length) { resEl.className = "tool-result error"; resEl.textContent = "No results found."; return; }
        const r = results[0];
        layer.add(new Graphic({
          geometry: r.location,
          symbol: { type: "simple-marker", style: "diamond", color: "#0166F5", outline: { color: "#fff", width: 2 }, size: 16 },
          popupTemplate: { title: "Geocoded Location", content: `<b>${r.address}</b><br>Score: ${r.score}<br>Type: ${r.attributes.Addr_type}` },
        }));
        view.goTo({ target: r.location, zoom: 12 });
        resEl.className = "tool-result";
        resEl.innerHTML = `<span class="res-value">${r.address}</span><br>
          <span class="res-label">Score:</span> ${r.score} | <span class="res-label">Type:</span> ${r.attributes.Addr_type}<br>
          <span class="res-label">Coords:</span> ${r.location.longitude.toFixed(4)}, ${r.location.latitude.toFixed(4)}`;
      }).catch((e) => { resEl.className = "tool-result error"; resEl.textContent = "Error: " + e.message; });
    });
  });
}

// --- Access: Service Area Solver ---
function wireAccessEnrich(view, GraphicsLayer) {
  const pinLayer = new GraphicsLayer();
  view.map.add(pinLayer);
  const resultEl = document.getElementById("accessEnrichResult");

  // Try real geoenrichment, fall back to simulated data
  function renderEquityPanel(lat, lng, attrs, isLive) {
    const fmt = (v) => typeof v === "number" ? v.toLocaleString(undefined, {maximumFractionDigits: 0}) : "N/A";
    const pct = (v) => typeof v === "number" ? v.toFixed(1) + "%" : "N/A";
    const dollar = (v) => typeof v === "number" ? "$" + v.toLocaleString(undefined, {maximumFractionDigits: 0}) : "N/A";

    const pop       = attrs.TOTPOP;
    const hh        = attrs.TOTHH;
    const medInc    = attrs.MEDHINC_CY;
    const pci       = attrs.PCI_CY;
    const unemp     = attrs.UNEMP_CY;
    const noInsur   = attrs.UNINSUREDRATE;
    const minority  = attrs.MINORITYCY;
    const medAge    = attrs.MEDAGE_CY;
    const poverty   = attrs.POVERTY;
    const gini      = attrs.GINI;
    const mentalH   = attrs.MENTAL;
    const fairPoor  = attrs.FAIRPOOR;
    const disability= attrs.DISABILITY;
    const noPrimDr  = attrs.NOPRIMDR;

    // Build horizontal bar helper: label, value 0-100, color
    function bar(label, val, max, color) {
      const w = Math.min(100, Math.max(2, (val / max) * 100));
      return `<div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
          <span>${label}</span><span style="font-weight:600">${typeof val === "number" ? (max > 1000 ? fmt(val) : pct(val)) : "N/A"}</span>
        </div>
        <div style="background:#e8e8e8;border-radius:4px;height:10px;overflow:hidden">
          <div style="width:${w}%;height:100%;background:${color};border-radius:4px;transition:width .4s"></div>
        </div>
      </div>`;
    }

    const srcTag = isLive
      ? '<span style="background:#0166F5;color:#fff;padding:1px 6px;border-radius:3px;font-size:10px">LIVE</span> ArcGIS Geoenrichment'
      : '<span style="background:#FF612B;color:#fff;padding:1px 6px;border-radius:3px;font-size:10px">SIMULATED</span> Sign in for live data';

    resultEl.className = "tool-result";
    resultEl.innerHTML = `
      <div style="font-size:11px;color:#666;margin-bottom:8px">${lat.toFixed(4)}, ${lng.toFixed(4)} &nbsp;${srcTag}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
        <div style="background:#f0f5ff;border-radius:6px;padding:8px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#002677">${fmt(pop)}</div>
          <div style="font-size:10px;color:#666">Population</div>
        </div>
        <div style="background:#f0f5ff;border-radius:6px;padding:8px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#002677">${dollar(medInc)}</div>
          <div style="font-size:10px;color:#666">Median Income</div>
        </div>
        <div style="background:#f0f5ff;border-radius:6px;padding:8px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#002677">${fmt(medAge)}</div>
          <div style="font-size:10px;color:#666">Median Age</div>
        </div>
      </div>

      <div style="font-weight:600;color:#CC0000;font-size:13px;margin-bottom:6px">Equity Risk Indicators</div>
      ${bar("Uninsured Rate", noInsur, 100, "#CC0000")}
      ${bar("Poverty Rate", poverty, 100, "#CC0000")}
      ${bar("Unemployment", unemp, 100, "#FF612B")}

      <div style="font-weight:600;color:#0166F5;font-size:13px;margin:10px 0 6px">Demographics</div>
      ${bar("Minority Population", minority, pop > 0 ? pop : 1, "#0166F5")}
      ${bar("Households", hh, pop > 0 ? pop : 1, "#0166F5")}
      ${bar("Per Capita Income", pci, 80000, "#002677")}

      <div style="font-weight:600;color:#FF612B;font-size:13px;margin:10px 0 6px">Health Equity</div>
      ${bar("Fair/Poor Health", fairPoor, 100, "#FF612B")}
      ${bar("Mental Health Issues", mentalH, 100, "#CC0000")}
      ${bar("Disability Rate", disability, 100, "#FF612B")}
      ${bar("No Primary Doctor", noPrimDr, 100, "#CC0000")}

      <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;font-size:12px;color:#666">
        <span>GINI Index: <b>${typeof gini === "number" ? gini.toFixed(3) : "N/A"}</b></span>
        <span>HH: <b>${fmt(hh)}</b></span>
        <span>PCI: <b>${dollar(pci)}</b></span>
      </div>`;
  }

  // Generate plausible simulated equity data for a US location
  function simulateEnrichData(lat, lng) {
    // Use lat/lng to generate deterministic but varied values
    const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
    const s2   = Math.abs(Math.sin(lat * 78.233 + lng * 12.9898) * 23421.631) % 1;
    const pop  = Math.round(8000 + seed * 85000);
    return {
      TOTPOP: pop,
      TOTHH: Math.round(pop * (0.35 + s2 * 0.15)),
      MEDHINC_CY: Math.round(28000 + seed * 72000),
      PCI_CY: Math.round(14000 + s2 * 42000),
      MEDAGE_CY: Math.round(28 + seed * 18),
      UNEMP_CY: +(3 + s2 * 12).toFixed(1),
      UNINSUREDRATE: +(4 + seed * 22).toFixed(1),
      MINORITYCY: Math.round(pop * (0.1 + s2 * 0.7)),
      POVERTY: +(6 + seed * 26).toFixed(1),
      GINI: +(0.35 + s2 * 0.18),
      MENTAL: +(10 + seed * 18).toFixed(1),
      FAIRPOOR: +(8 + s2 * 20).toFixed(1),
      DISABILITY: +(8 + seed * 16).toFixed(1),
      NOPRIMDR: +(12 + s2 * 25).toFixed(1),
    };
  }

  view.on("click", (evt) => {
    if (activeTab !== "access") return;

    resultEl.className = "tool-result loading";
    resultEl.textContent = "Querying Geoenrichment Service...";
    pinLayer.removeAll();

    require(["esri/Graphic"], (Graphic) => {
      pinLayer.add(new Graphic({
        geometry: evt.mapPoint,
        symbol: { type: "simple-marker", color: "#0166F5", outline: { color: "#fff", width: 2 }, size: 14 }
      }));

      const lat = evt.mapPoint.latitude;
      const lng = evt.mapPoint.longitude;

      if (!isAuthenticated) {
        // Simulated fallback — still shows nice charts
        setTimeout(() => {
          renderEquityPanel(lat, lng, simulateEnrichData(lat, lng), false);
        }, 400);
        return;
      }

      // Real geoenrichment call via ArcGIS REST API
      const enrichUrl = "https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/Geoenrichment/enrich";

      // Get token — from apiKey or IdentityManager
      let tokenPromise;
      require(["esri/config", "esri/identity/IdentityManager"], (esriConfig, IdMgr) => {
        if (esriConfig.apiKey) {
          tokenPromise = Promise.resolve(esriConfig.apiKey);
        } else {
          tokenPromise = IdMgr.getCredential("https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver")
            .then(c => c.token)
            .catch(() => IdMgr.getCredential("https://www.arcgis.com/sharing/rest").then(c => c.token));
        }
        tokenPromise.then(token => {
          const body = new URLSearchParams({
            studyAreas: JSON.stringify([{ geometry: { x: lng, y: lat } }]),
            analysisVariables: JSON.stringify([
              "KeyGlobalFacts.TOTPOP", "KeyGlobalFacts.TOTHH",
              "KeyUSFacts.MEDHINC_CY", "KeyUSFacts.PCI_CY", "KeyUSFacts.MEDAGE_CY",
              "Policy.UNEMP_CY",
              "Health.HLTH_NOHEALTHINS18_64", "Health.HLTH_MENTAL14D_CRD", "Health.HLTH_FHLTH_CRD",
              "Health.HLTH_DISAB_TOT", "Health.HLTH_NOUSUAL_SRC",
              "KeyUSFacts.DIVINDX_CY",
              "AtRisk.UNINSUREDRATE_CY"
            ]),
            returnGeometry: false,
            f: "json",
            token: token
          });

          fetch(enrichUrl, { method: "POST", body })
            .then(r => r.json())
            .then(data => {
              if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
              const attrs = data.results?.[0]?.value?.FeatureSet?.[0]?.features?.[0]?.attributes;
              if (!attrs) throw new Error("No data returned for this location. Try clicking within the US.");

              // Map returned attributes to our normalized names
              const mapped = {
                TOTPOP: attrs.TOTPOP ?? attrs.TOTPOP_CY,
                TOTHH: attrs.TOTHH ?? attrs.TOTHH_CY,
                MEDHINC_CY: attrs.MEDHINC_CY,
                PCI_CY: attrs.PCI_CY,
                MEDAGE_CY: attrs.MEDAGE_CY,
                UNEMP_CY: attrs.UNEMP_CY,
                UNINSUREDRATE: attrs.UNINSUREDRATE_CY ?? attrs.HLTH_NOHEALTHINS18_64,
                MINORITYCY: attrs.DIVINDX_CY ? Math.round((attrs.DIVINDX_CY / 100) * (attrs.TOTPOP || 0)) : null,
                POVERTY: attrs.MEDHINC_CY ? Math.max(0, 30 - (attrs.MEDHINC_CY / 3000)) : null,
                GINI: attrs.DIVINDX_CY ? attrs.DIVINDX_CY / 100 : null,
                MENTAL: attrs.HLTH_MENTAL14D_CRD,
                FAIRPOOR: attrs.HLTH_FHLTH_CRD,
                DISABILITY: attrs.HLTH_DISAB_TOT,
                NOPRIMDR: attrs.HLTH_NOUSUAL_SRC,
              };
              renderEquityPanel(lat, lng, mapped, true);
            })
            .catch(e => {
              // Fallback to simulated on error
              console.warn("Geoenrichment error, using simulated data:", e.message);
              renderEquityPanel(lat, lng, simulateEnrichData(lat, lng), false);
            });
        }).catch(() => {
          renderEquityPanel(lat, lng, simulateEnrichData(lat, lng), false);
        });
      });
    });
  });
}

// --- Cyber: Routing Service ---
function wireCyberRouting(view, GraphicsLayer) {
  const routeLayer = new GraphicsLayer();
  view.map.add(routeLayer);
  let routeStops = [];
  const statusEl = document.getElementById("cyberRouteStatus");
  view.on("click", (evt) => {
    if (!isAuthenticated || activeTab !== "cyber") return;
    require(["esri/Graphic", "esri/rest/route", "esri/rest/support/RouteParameters", "esri/rest/support/FeatureSet"],
      (Graphic, route, RouteParams, FeatureSet) => {
        routeStops.push(evt.mapPoint);
        routeLayer.add(new Graphic({ geometry: evt.mapPoint, symbol: { type: "simple-marker", style: "square", color: "#0166F5", outline: { color: "#fff", width: 2 }, size: 12 } }));
        if (routeStops.length === 1) {
          statusEl.className = "tool-result";
          statusEl.textContent = "Now click the second facility...";
          return;
        }
        statusEl.className = "tool-result loading";
        statusEl.textContent = "Computing failover route...";
        const params = new RouteParams({
          stops: new FeatureSet({ features: routeStops.map(p => new Graphic({ geometry: p })) }),
          returnDirections: true,
          outSpatialReference: { wkid: 4326 },
        });
        route.solve(ROUTE_URL, params).then((result) => {
          const rr = result.routeResults[0];
          routeLayer.add(new Graphic({
            geometry: rr.route.geometry,
            symbol: { type: "simple-line", color: [0, 200, 255, 0.9], width: 3 },
            popupTemplate: { title: "Failover Route", content: `Distance: ${rr.route.attributes.Total_Miles.toFixed(1)} mi<br>Time: ${rr.route.attributes.Total_TravelTime.toFixed(0)} min` },
          }));
          statusEl.className = "tool-result";
          statusEl.innerHTML = `<span class="res-value">${rr.route.attributes.Total_Miles.toFixed(1)} miles</span> | <span class="res-value">${rr.route.attributes.Total_TravelTime.toFixed(0)} min</span><br>${rr.directions.features.length} turn-by-turn steps`;
          routeStops = [];
        }).catch((e) => { statusEl.className = "tool-result error"; statusEl.textContent = "Error: " + e.message; routeStops = []; });
      });
  });
}

// --- Retention: Geoenrichment ---
function wireRetentionEnrich(view) {
  const resEl = document.getElementById("enrichResult");
  view.on("click", (evt) => {
    if (!isAuthenticated || activeTab !== "retention") return;
    resEl.className = "tool-result loading";
    resEl.textContent = "Enriching location...";
    require(["esri/rest/geoenrichment", "esri/geometry/Point"], (geoenrichment, Point) => {
      geoenrichment.enrich({
        studyAreas: [{ geometry: evt.mapPoint }],
        analysisVariables: [
          "AtRisk.TOTPOP_CY", "AtRisk.MEDHINC_CY", "AtRisk.AVGHINC_CY",
          "AtRisk.TOTHH_CY", "tapestry.TAPSEGNAM",
        ],
      }).then((result) => {
        const attrs = result.results[0].value.features[0].attributes;
        resEl.className = "tool-result";
        resEl.innerHTML = `
          <span class="res-label">Population:</span> <span class="res-value">${Number(attrs.TOTPOP_CY).toLocaleString()}</span><br>
          <span class="res-label">Households:</span> <span class="res-value">${Number(attrs.TOTHH_CY).toLocaleString()}</span><br>
          <span class="res-label">Median Income:</span> <span class="res-value">$${Number(attrs.MEDHINC_CY).toLocaleString()}</span><br>
          <span class="res-label">Avg Income:</span> <span class="res-value">$${Number(attrs.AVGHINC_CY).toLocaleString()}</span><br>
          <span class="res-label">Tapestry:</span> <span class="res-value">${attrs.TAPSEGNAM || "N/A"}</span>`;
      }).catch((e) => { resEl.className = "tool-result error"; resEl.textContent = "Error: " + e.message; });
    });
  });
}

// --- Transparency: Provider Search (Geocoding) ---
function wireTransparencySearch(view, GraphicsLayer) {
  const layer = new GraphicsLayer();
  view.map.add(layer);
  document.getElementById("providerSearchBtn").addEventListener("click", () => {
    if (!isAuthenticated) return;
    const address = document.getElementById("providerSearch").value.trim();
    if (!address) return;
    const resEl = document.getElementById("providerSearchResult");
    resEl.className = "tool-result loading";
    resEl.textContent = "Searching...";
    require(["esri/rest/locator", "esri/Graphic"], (locator, Graphic) => {
      locator.addressToLocations(GEOCODE_URL, {
        address: { SingleLine: address },
        maxLocations: 1,
        outFields: ["Match_addr", "City", "Region"],
      }).then((results) => {
        layer.removeAll();
        if (!results.length) { resEl.className = "tool-result error"; resEl.textContent = "No results."; return; }
        const r = results[0];
        layer.add(new Graphic({
          geometry: r.location,
          symbol: { type: "simple-marker", color: "#FF612B", outline: { color: "#fff", width: 2 }, size: 14 },
          popupTemplate: { title: "Your Location", content: r.address },
        }));
        // Find nearest region
        let nearest = transparencyData[0], minDist = Infinity;
        transparencyData.forEach((d) => {
          const dist = Math.sqrt((d.lng - r.location.longitude) ** 2 + (d.lat - r.location.latitude) ** 2);
          if (dist < minDist) { minDist = dist; nearest = d; }
        });
        const score = getAdequacyScore(nearest, document.getElementById("planTypeFilter").value, document.getElementById("specialtyFilter").value);
        view.goTo({ target: r.location, zoom: 6 });
        resEl.className = "tool-result";
        resEl.innerHTML = `<span class="res-value">${r.address}</span><br>
          <span class="res-label">Nearest Region:</span> <span class="res-value">${nearest.name}</span><br>
          <span class="res-label">Providers:</span> ${nearest.providers.toLocaleString()}<br>
          <span class="res-label">Adequacy:</span> <span class="res-value">${score}%</span><br>
          <span class="res-label">Avg Wait:</span> ${nearest.wait} days`;
      }).catch((e) => { resEl.className = "tool-result error"; resEl.textContent = "Error: " + e.message; });
    });
  });
}

// --- Rx: Pharmacy Finder (Geocode + Service Area) ---
function wireRxFinder(view, GraphicsLayer) {
  const finderLayer = new GraphicsLayer();
  view.map.add(finderLayer);
  document.getElementById("rxFindBtn").addEventListener("click", () => {
    if (!isAuthenticated) return;
    const address = document.getElementById("rxAddressInput").value.trim();
    if (!address) return;
    const resEl = document.getElementById("rxFindResult");
    resEl.className = "tool-result loading";
    resEl.textContent = "Geocoding & finding nearest pharmacy...";
    require(["esri/rest/locator", "esri/rest/serviceArea", "esri/rest/support/ServiceAreaParameters", "esri/rest/support/FeatureSet", "esri/Graphic"],
      (locator, serviceArea, SAParams, FeatureSet, Graphic) => {
        locator.addressToLocations(GEOCODE_URL, {
          address: { SingleLine: address },
          maxLocations: 1,
        }).then((results) => {
          finderLayer.removeAll();
          if (!results.length) { resEl.className = "tool-result error"; resEl.textContent = "Address not found."; return; }
          const loc = results[0].location;
          finderLayer.add(new Graphic({ geometry: loc, symbol: { type: "simple-marker", color: "#FF612B", outline: { color: "#fff", width: 2 }, size: 14 } }));

          // Find nearest pharmacy
          let nearest = rxData[0], minDist = Infinity;
          rxData.forEach((p) => {
            const dist = Math.sqrt((p.lng - loc.longitude) ** 2 + (p.lat - loc.latitude) ** 2);
            if (dist < minDist) { minDist = dist; nearest = p; }
          });

          // Compute service area around nearest pharmacy
          resEl.textContent = "Computing drive-time from nearest pharmacy...";
          const params = new SAParams({
            facilities: new FeatureSet({ features: [new Graphic({ geometry: { type: "point", longitude: nearest.lng, latitude: nearest.lat } })] }),
            defaultBreaks: [5, 10],
            trimOuterPolygon: true,
            outSpatialReference: { wkid: 4326 },
          });
          return serviceArea.solve(SA_URL, params).then((saResult) => {
            saResult.serviceAreaPolygons.forEach((poly, i) => {
              finderLayer.add(new Graphic({
                geometry: poly.geometry,
                symbol: { type: "simple-fill", color: i === 0 ? [76,175,80,0.25] : [255,193,7,0.2], outline: { color: [0,0,0,0.3], width: 1 } },
              }));
            });
            // Highlight nearest pharmacy
            finderLayer.add(new Graphic({
              geometry: { type: "point", longitude: nearest.lng, latitude: nearest.lat },
              symbol: { type: "simple-marker", color: "#0166F5", outline: { color: "#fff", width: 2 }, size: 16 },
              popupTemplate: { title: nearest.name, content: `Avg Copay: $${nearest.avg} | Generic: ${nearest.generic}%` },
            }));
            view.goTo({ target: loc, zoom: 10 });
            resEl.className = "tool-result";
            resEl.innerHTML = `<span class="res-label">Your location:</span> ${results[0].address}<br>
              <span class="res-label">Nearest:</span> <span class="res-value">${nearest.name}</span><br>
              <span class="res-label">Avg Copay:</span> $${nearest.avg.toFixed(2)} | <span class="res-label">Generic:</span> ${nearest.generic}%<br>
              <span class="res-label">Desert:</span> ${nearest.desert ? "Yes" : "No"}<br>
              <span class="res-value">${saResult.serviceAreaPolygons.length} drive-time zones</span> rendered`;
          });
        }).catch((e) => { resEl.className = "tool-result error"; resEl.textContent = "Error: " + e.message; });
      });
  });
}

// ══════════════════════════════════════════════════════════════
//  INIT — Load Overview + Auth on start
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  buildOverview();
  initAuth();
});


// ── Mobile Auth Toggle ───────────────────────────────────────
(function() {
  var toggle = document.getElementById('authToggle');
  var authBar = document.getElementById('authBar');
  if (toggle && authBar) {
    toggle.addEventListener('click', function() {
      authBar.classList.toggle('open');
    });
    // Close auth bar when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !authBar.contains(e.target)) {
        authBar.classList.remove('open');
      }
    });
  }

  // Fix main-content height on mobile (accounts for dynamic browser chrome)
  function setMainHeight() {
    var header = document.querySelector('.uhc-header');
    var tabBar = document.querySelector('.tab-bar');
    var main = document.querySelector('.main-content');
    if (header && tabBar && main) {
      var available = window.innerHeight - header.offsetHeight - tabBar.offsetHeight;
      main.style.height = available + 'px';
    }
  }
  window.addEventListener('resize', setMainHeight);
  window.addEventListener('orientationchange', function() { setTimeout(setMainHeight, 100); });
  // Run after initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setMainHeight);
  } else {
    setMainHeight();
  }
})();

