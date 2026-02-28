# Location Intelligence for UnitedHealthcare

> An interactive ArcGIS Solutions Showcase demonstrating how Esri's location platform can address UnitedHealthcare's most critical challenges.

**[View Live App](https://garridolecca.github.io/UnitedHealthcare/)**

---

## Overview

This application is a proof-of-concept that maps six of UnitedHealthcare's most pressing operational challenges to concrete ArcGIS-powered solutions. Each tab presents a distinct problem, a spatial analytics approach, and a fully interactive map visualization — including live integration with ArcGIS Location Services.

Built as a lightweight static web app (HTML/CSS/JS), it runs entirely in the browser with no build tools required.

## The Six Solutions

| Tab | Problem | ArcGIS Solution |
|-----|---------|-----------------|
| **Fraud Detection** | DOJ Medicare billing fraud investigations | Hot Spot Analysis (Getis-Ord Gi*), Knowledge Graph, GeoAI, Space-Time Cubes |
| **Access to Care & Equity** | Prior authorization denials disproportionately affect vulnerable communities | Geoenrichment Service, Living Atlas demographics, Location-Allocation |
| **Cyber Resilience** | Ransomware attack on Change Healthcare exposed infrastructure dependencies | ArcGIS Indoors, Utility Network tracing, ArcGIS Velocity (Real-Time GIS) |
| **Member Retention** | Revenue decline and membership churn across markets | Business Analyst, Tapestry Segmentation, Territory Design, Geoenrichment |
| **Transparency Hub** | Erosion of public trust and regulatory scrutiny | ArcGIS Hub, Experience Builder, Open Data, Arcade-driven adequacy scores |
| **Rx Analytics** | Drug pricing pressure and pharmacy desert access gaps | Anselin Local Moran's I clustering, Network Analyst, Suitability Modeling |

## Live ArcGIS Services Integration

When authenticated (API Key or ArcGIS Online OAuth), users can interact with real Esri Location Services:

- **Geocoding Service** — geocode provider addresses directly on the map
- **Geoenrichment Service** — click any US location for real equity demographics (population, income, uninsured rate, health indicators)
- **Service Area Solver** — compute real drive-time polygons via Network Analyst
- **Routing Service** — calculate optimal failover routes between facilities

Without authentication, the app displays simulated data so all visualizations remain functional.

## Tech Stack

- **ArcGIS Maps SDK for JavaScript 4.30** (CDN)
- **Vanilla HTML / CSS / JS** — no frameworks, no build step
- UnitedHealthcare brand colors and responsive layout

## Running Locally

1. Clone the repository
2. Open the folder in VS Code
3. Launch with **Live Server** (or any static file server)
4. Open `index.html` in your browser

```bash
git clone https://github.com/garridolecca/UnitedHealthcare.git
cd UnitedHealthcare
# Open with VS Code Live Server, or:
npx serve .
```

## Authentication (Optional)

To use live ArcGIS Location Services:

1. **API Key** — paste an [ArcGIS Developer API Key](https://developers.arcgis.com/) into the header input
2. **ArcGIS Online** — click "Sign in with ArcGIS Online" to authenticate via OAuth

All map visualizations work without authentication using simulated data.
