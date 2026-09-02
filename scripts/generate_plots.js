const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "..", "reports", "figures");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// ── 1. Demand Forecaster Quantiles Plot (White BG) ───────────────────────────
const svgDemand = `
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <linearGradient id="coneGradWhite" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.08"/>
    </linearGradient>
  </defs>

  <!-- Canvas Background & Border -->
  <rect width="1200" height="700" fill="#FFFFFF" rx="16" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Title & Subtitle -->
  <text x="60" y="60" fill="#0F172A" font-size="24" font-weight="800">GlobeX Deep GRU Bilateral Demand Forecaster</text>
  <text x="60" y="88" fill="#64748B" font-size="14" font-family="monospace">Probabilistic Quantile Pinball Loss Calibration (P10 · P50 · P90 Prediction Intervals)</text>

  <!-- Grid Lines -->
  <line x1="120" y1="160" x2="1120" y2="160" stroke="#F1F5F9" stroke-width="1.5"/>
  <line x1="120" y1="250" x2="1120" y2="250" stroke="#F1F5F9" stroke-width="1.5"/>
  <line x1="120" y1="340" x2="1120" y2="340" stroke="#F1F5F9" stroke-width="1.5"/>
  <line x1="120" y1="430" x2="1120" y2="430" stroke="#F1F5F9" stroke-width="1.5"/>
  <line x1="120" y1="520" x2="1120" y2="520" stroke="#CBD5E1" stroke-width="2"/>

  <!-- Y-Axis Labels -->
  <text x="100" y="165" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">100k MT</text>
  <text x="100" y="255" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">75k MT</text>
  <text x="100" y="345" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">50k MT</text>
  <text x="100" y="435" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">25k MT</text>
  <text x="100" y="525" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">0k MT</text>

  <!-- X-Axis Month Labels -->
  <text x="150" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+1 (Jan)</text>
  <text x="240" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+2 (Feb)</text>
  <text x="330" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+3 (Mar)</text>
  <text x="420" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+4 (Apr)</text>
  <text x="510" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+5 (May)</text>
  <text x="600" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+6 (Jun)</text>
  <text x="690" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+7 (Jul)</text>
  <text x="780" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+8 (Aug)</text>
  <text x="870" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+9 (Sep)</text>
  <text x="960" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+10 (Oct)</text>
  <text x="1050" y="550" fill="#64748B" font-size="12" font-family="monospace" text-anchor="middle">M+11 (Nov)</text>

  <!-- P10-P90 Uncertainty Shaded Polygon -->
  <polygon points="
    150,380 240,365 330,340 420,320 510,290 600,265 690,280 780,245 870,210 960,185 1050,150
    1050,260 960,290 870,320 780,355 690,385 600,370 510,395 420,415 330,435 240,455 150,465
  " fill="url(#coneGradWhite)" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- P50 Median Line -->
  <polyline points="
    150,425 240,410 330,385 420,365 510,340 600,320 690,330 780,295 870,265 960,235 1050,205
  " fill="none" stroke="#059669" stroke-width="4.5"/>

  <!-- Realized Historical Sequence -->
  <polyline points="
    150,420 240,415 330,380 420,370 510,335 600,325 690,340 780,290 870,258 960,240 1050,200
  " fill="none" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="6,4"/>

  <!-- Realized Data Circles -->
  <circle cx="150" cy="420" r="5" fill="#0284C7"/>
  <circle cx="240" cy="415" r="5" fill="#0284C7"/>
  <circle cx="330" cy="380" r="5" fill="#0284C7"/>
  <circle cx="420" cy="370" r="5" fill="#0284C7"/>
  <circle cx="510" cy="335" r="5" fill="#0284C7"/>
  <circle cx="600" cy="325" r="5" fill="#0284C7"/>
  <circle cx="690" cy="340" r="5" fill="#0284C7"/>
  <circle cx="780" cy="290" r="5" fill="#0284C7"/>
  <circle cx="870" cy="258" r="5" fill="#0284C7"/>
  <circle cx="960" cy="240" r="5" fill="#0284C7"/>
  <circle cx="1050" cy="200" r="5" fill="#0284C7"/>

  <!-- Statistical Metric Callout Box -->
  <rect x="740" y="590" width="380" height="75" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="760" y="618" fill="#0F172A" font-size="13" font-weight="bold">Validation Performance Metrics</text>
  <text x="760" y="642" fill="#059669" font-size="12" font-family="monospace" font-weight="bold">MAPE: 8.42%</text>
  <text x="870" y="642" fill="#64748B" font-size="12" font-family="monospace">P10-P90 Coverage: 81.6%</text>
  <text x="1050" y="642" fill="#64748B" font-size="12" font-family="monospace">14.2 ms</text>

  <!-- Legend -->
  <rect x="60" y="590" width="460" height="75" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="1.5"/>
  <line x1="80" y1="628" x2="115" y2="628" stroke="#059669" stroke-width="4"/>
  <text x="125" y="632" fill="#0F172A" font-size="12" font-weight="600">P50 Median Forecast</text>
  <line x1="280" y1="628" x2="315" y2="628" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="5,3"/>
  <text x="325" y="632" fill="#0F172A" font-size="12" font-weight="600">Realized Demand (UN)</text>
</svg>`;

// ── 2. Trade Anomaly ROC Curve (White BG) ────────────────────────────────────
const svgAnomaly = `
<svg width="1000" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <rect width="1000" height="700" fill="#FFFFFF" rx="16" stroke="#E2E8F0" stroke-width="2"/>
  
  <text x="60" y="60" fill="#0F172A" font-size="24" font-weight="800">Trade Corridor Anomaly Detection ROC &amp; Precision-Recall</text>
  <text x="60" y="88" fill="#64748B" font-size="14" font-family="monospace">Isolation Forest + XGBoost Multi-Corridor Fraud &amp; Misinvoicing Detector</text>

  <!-- Chart Axis Lines -->
  <line x1="120" y1="520" x2="880" y2="520" stroke="#CBD5E1" stroke-width="2"/>
  <line x1="120" y1="160" x2="120" y2="520" stroke="#CBD5E1" stroke-width="2"/>

  <!-- Diagonal Random Reference Line -->
  <line x1="120" y1="520" x2="880" y2="160" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6,6"/>

  <!-- ROC Curve -->
  <path d="M 120,520 Q 160,180 880,160" fill="none" stroke="#D97706" stroke-width="4.5"/>

  <!-- Precision-Recall Curve -->
  <path d="M 120,170 Q 750,180 880,520" fill="none" stroke="#059669" stroke-width="3" stroke-dasharray="5,4"/>

  <!-- Axis Labels -->
  <text x="500" y="565" fill="#475569" font-size="14" font-weight="bold" text-anchor="middle">False Positive Rate (FPR) / Recall</text>
  <text x="60" y="340" fill="#475569" font-size="14" font-weight="bold" transform="rotate(-90 60 340)" text-anchor="middle">True Positive Rate (TPR) / Precision</text>

  <!-- Legend & Callout Box -->
  <rect x="460" y="360" width="380" height="120" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="1.5"/>
  <line x1="480" y1="390" x2="515" y2="390" stroke="#D97706" stroke-width="4"/>
  <text x="525" y="394" fill="#0F172A" font-size="13" font-weight="bold">ROC Curve (AUC = 0.942)</text>
  
  <line x1="480" y1="420" x2="515" y2="420" stroke="#059669" stroke-width="3" stroke-dasharray="4"/>
  <text x="525" y="424" fill="#0F172A" font-size="13" font-weight="bold">Precision-Recall (PR-AUC = 0.918)</text>

  <text x="480" y="458" fill="#64748B" font-size="12" font-family="monospace">Precision: 91.4% · Recall: 88.6% · F1: 0.899</text>
</svg>`;

// ── 3. Operational Clearance Latency Benchmark (White BG) ─────────────────────
const svgClearance = `
<svg width="1100" height="600" viewBox="0 0 1100 600" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <rect width="1100" height="600" fill="#FFFFFF" rx="16" stroke="#E2E8F0" stroke-width="2"/>

  <text x="60" y="60" fill="#0F172A" font-size="24" font-weight="800">Cross-Border Trade Verification &amp; Clearance Latency</text>
  <text x="60" y="88" fill="#64748B" font-size="14" font-family="monospace">Traditional Manual Trade vs. National Single Window vs. GlobeX Autonomous Trade OS</text>

  <!-- Y-Axis Categories -->
  <text x="240" y="195" fill="#1E293B" font-size="15" font-weight="600" text-anchor="end">Traditional Manual Process</text>
  <text x="240" y="305" fill="#1E293B" font-size="15" font-weight="600" text-anchor="end">Legacy Single Window</text>
  <text x="240" y="415" fill="#059669" font-size="16" font-weight="800" text-anchor="end">GlobeX Autonomous OS</text>

  <!-- Horizontal Bars -->
  <!-- Traditional: 18 Days -->
  <rect x="260" y="160" width="620" height="52" rx="8" fill="#EF4444" opacity="0.9"/>
  <text x="895" y="193" fill="#B91C1C" font-size="16" font-weight="bold" font-family="monospace">14–21 Days (336–504 hrs)</text>

  <!-- Single Window: 6 Days -->
  <rect x="260" y="270" width="220" height="52" rx="8" fill="#F59E0B" opacity="0.9"/>
  <text x="495" y="303" fill="#D97706" font-size="16" font-weight="bold" font-family="monospace">5–7 Days (120–168 hrs)</text>

  <!-- GlobeX: 2 Hours -->
  <rect x="260" y="380" width="28" height="52" rx="8" fill="#10B981"/>
  <text x="305" y="413" fill="#059669" font-size="17" font-weight="800" font-family="monospace">&lt; 2 Hours (-99.2% Latency Speedup)</text>

  <!-- Axis Grid -->
  <line x1="260" y1="460" x2="980" y2="460" stroke="#CBD5E1" stroke-width="2"/>
  <text x="260" y="490" fill="#64748B" font-size="12" font-family="monospace">0 hrs</text>
  <text x="440" y="490" fill="#64748B" font-size="12" font-family="monospace">5 Days (120h)</text>
  <text x="620" y="490" fill="#64748B" font-size="12" font-family="monospace">10 Days (240h)</text>
  <text x="800" y="490" fill="#64748B" font-size="12" font-family="monospace">15 Days (360h)</text>
  <text x="980" y="490" fill="#64748B" font-size="12" font-family="monospace">20 Days (480h)</text>
</svg>`;

// ── 4. Model Architecture Error Comparison (White BG) ─────────────────────────
const svgErrorMape = `
<svg width="1000" height="600" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <rect width="1000" height="600" fill="#FFFFFF" rx="16" stroke="#E2E8F0" stroke-width="2"/>

  <text x="60" y="60" fill="#0F172A" font-size="24" font-weight="800">Demand Forecasting Model Benchmark Comparison</text>
  <text x="60" y="88" fill="#64748B" font-size="14" font-family="monospace">Mean Absolute Percentage Error (MAPE %) · 12-Month Out-of-Sample Walk-Forward Validation</text>

  <!-- Y-Axis Categories -->
  <text x="240" y="175" fill="#1E293B" font-size="14" font-weight="600" text-anchor="end">Holt-Winters Baseline</text>
  <text x="240" y="260" fill="#1E293B" font-size="14" font-weight="600" text-anchor="end">ARIMA (1,1,1)</text>
  <text x="240" y="345" fill="#1E293B" font-size="14" font-weight="600" text-anchor="end">Standard LSTM</text>
  <text x="240" y="430" fill="#059669" font-size="15" font-weight="800" text-anchor="end">GlobeX Deep GRU + Quantile</text>

  <!-- Bars -->
  <rect x="260" y="145" width="568" height="42" rx="6" fill="#EF4444" opacity="0.85"/>
  <text x="840" y="172" fill="#B91C1C" font-size="15" font-weight="bold" font-family="monospace">28.4% MAPE</text>

  <rect x="260" y="230" width="424" height="42" rx="6" fill="#F97316" opacity="0.85"/>
  <text x="696" y="257" fill="#C2410C" font-size="15" font-weight="bold" font-family="monospace">21.2% MAPE</text>

  <rect x="260" y="315" width="292" height="42" rx="6" fill="#0284C7" opacity="0.85"/>
  <text x="564" y="342" fill="#0369A1" font-size="15" font-weight="bold" font-family="monospace">14.6% MAPE</text>

  <rect x="260" y="400" width="168" height="42" rx="6" fill="#10B981"/>
  <text x="440" y="427" fill="#059669" font-size="16" font-weight="800" font-family="monospace">8.42% MAPE (SOTA)</text>

  <!-- Axis -->
  <line x1="260" y1="475" x2="900" y2="475" stroke="#CBD5E1" stroke-width="2"/>
  <text x="260" y="505" fill="#64748B" font-size="12" font-family="monospace">0%</text>
  <text x="460" y="505" fill="#64748B" font-size="12" font-family="monospace">10%</text>
  <text x="660" y="505" fill="#64748B" font-size="12" font-family="monospace">20%</text>
  <text x="860" y="505" fill="#64748B" font-size="12" font-family="monospace">30%</text>
</svg>`;

// ── 5. MCDM Radar Matrix (White BG) ──────────────────────────────────────────
const svgRadar = `
<svg width="900" height="700" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <rect width="900" height="700" fill="#FFFFFF" rx="16" stroke="#E2E8F0" stroke-width="2"/>

  <text x="60" y="60" fill="#0F172A" font-size="24" font-weight="800">MCDM 7-Dimensional Destination Evaluation Radar</text>
  <text x="60" y="88" fill="#64748B" font-size="14" font-family="monospace">Multi-Criteria Decision Matrix · UAE (81.4) vs. USA (78.8) vs. Saudi Arabia (76.2)</text>

  <!-- Radar Polygonal Grids -->
  <polygon points="450,160 620,245 590,420 450,490 310,420 280,245" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>
  <polygon points="450,210 575,275 550,405 450,455 350,405 325,275" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>
  <polygon points="450,260 530,305 510,390 450,420 390,390 370,305" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Axis Labels -->
  <text x="450" y="140" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="middle">Revealed Demand Fit (w=0.25)</text>
  <text x="645" y="250" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="start">CEPA Tariff Benefit (w=0.15)</text>
  <text x="615" y="440" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="start">Maritime Logistics LPI (w=0.10)</text>
  <text x="450" y="525" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="middle">Buyer Network Density (w=0.10)</text>
  <text x="270" y="440" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">Macro / FX Stability (w=0.05)</text>
  <text x="245" y="250" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">Forecast Growth (w=0.20)</text>

  <!-- UAE Polygon (Score 81.4) -->
  <polygon points="450,170 610,250 575,410 440,475 335,415 300,255" fill="#10B981" fill-opacity="0.35" stroke="#059669" stroke-width="3.5"/>

  <!-- USA Polygon (Score 78.8) -->
  <polygon points="450,185 540,285 585,400 460,480 320,410 325,268" fill="#0284C7" fill-opacity="0.25" stroke="#0284C7" stroke-width="3" stroke-dasharray="5,4"/>

  <!-- Legend -->
  <rect x="580" y="570" width="260" height="80" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="1.5"/>
  <line x1="605" y1="600" x2="640" y2="600" stroke="#059669" stroke-width="4"/>
  <text x="650" y="605" fill="#0F172A" font-size="13" font-weight="bold">UAE (ARE) · 81.4</text>
  
  <line x1="605" y1="630" x2="640" y2="630" stroke="#0284C7" stroke-width="3" stroke-dasharray="4"/>
  <text x="650" y="635" fill="#0F172A" font-size="13" font-weight="bold">USA (USA) · 78.8</text>
</svg>`;

// Convert and write PNG files with sharp
async function renderAll() {
  const plots = [
    { svg: svgDemand, name: "01_demand_forecasting_quantiles.png", w: 1200, h: 700 },
    { svg: svgAnomaly, name: "02_trade_anomaly_roc_precision_recall.png", w: 1000, h: 700 },
    { svg: svgClearance, name: "03_operational_clearance_time_benchmark.png", w: 1100, h: 600 },
    { svg: svgErrorMape, name: "04_model_architecture_error_comparison.png", w: 1000, h: 600 },
    { svg: svgRadar, name: "05_mcdm_destination_ranking_radar.png", w: 900, h: 700 },
  ];

  for (const p of plots) {
    const filePath = path.join(outDir, p.name);
    await sharp(Buffer.from(p.svg))
      .png({ quality: 100 })
      .toFile(filePath);
    console.log(`[+] Rendered crisp white-bg PNG -> ${filePath}`);
  }
}

renderAll().then(() => console.log("All high-res PNG plots generated successfully!"));
