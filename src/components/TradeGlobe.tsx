import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import { AggregatedCountry, COUNTRY_TO_ISO } from "@/lib/tradeData";

// Country coordinates for camera focusing
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "United Arab Emirates": { lat: 24.0, lng: 54.0 },
  "ARE": { lat: 24.0, lng: 54.0 },
  "UAE": { lat: 24.0, lng: 54.0 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "IND": { lat: 20.5937, lng: 78.9629 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  "SAU": { lat: 23.8859, lng: 45.0792 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "GBR": { lat: 55.3781, lng: -3.4360 },
  "UK": { lat: 55.3781, lng: -3.4360 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "DEU": { lat: 51.1657, lng: 10.4515 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "SGP": { lat: 1.3521, lng: 103.8198 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "USA": { lat: 37.0902, lng: -95.7129 },
  "China": { lat: 35.8617, lng: 104.1954 },
  "CHN": { lat: 35.8617, lng: 104.1954 },
  "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "NLD": { lat: 52.1326, lng: 5.2913 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  "ZAF": { lat: -30.5595, lng: 22.9375 },
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "BRA": { lat: -14.2350, lng: -51.9253 },
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "JPN": { lat: 36.2048, lng: 138.2529 },
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "AUS": { lat: -25.2744, lng: 133.7751 },
};

// Global Trade Hub Points of Interest
// Global Trade Hub Points of Interest - Clean City Names in Small Font
const TRADE_HUBS = [
  // ── India Gateways ─────────────────────────────────────────────────────
  {
    name: "Mumbai",
    code: "INNSA",
    country: "India",
    lat: 18.9499,
    lng: 72.9526,
    size: 1.2,
    color: "#34C795",
    isPrimary: true,
  },
  {
    name: "Gujarat",
    code: "INMUN",
    country: "India",
    lat: 22.7441,
    lng: 69.7042,
    size: 1.0,
    color: "#34C795",
  },
  {
    name: "Chennai",
    code: "INMAA",
    country: "India",
    lat: 13.0844,
    lng: 80.2974,
    size: 1.0,
    color: "#34C795",
  },
  {
    name: "Kochi",
    code: "INCOK",
    country: "India",
    lat: 9.9656,
    lng: 76.2694,
    size: 1.0,
    color: "#34C795",
  },
  {
    name: "Kolkata",
    code: "INCCU",
    country: "India",
    lat: 22.0229,
    lng: 88.0583,
    size: 0.9,
    color: "#34C795",
  },

  // ── Middle East & GCC ─────────────────────────────────────────────────
  {
    name: "Dubai",
    code: "AEJEA",
    country: "United Arab Emirates",
    lat: 24.9857,
    lng: 55.0273,
    size: 1.2,
    color: "#38BDF8",
  },
  {
    name: "Jeddah",
    code: "SAJED",
    country: "Saudi Arabia",
    lat: 21.4858,
    lng: 39.1925,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Dammam",
    code: "SADMM",
    country: "Saudi Arabia",
    lat: 26.4344,
    lng: 50.1033,
    size: 0.9,
    color: "#38BDF8",
  },
  {
    name: "Salalah",
    code: "OMSLL",
    country: "Oman",
    lat: 16.9400,
    lng: 54.0040,
    size: 0.9,
    color: "#38BDF8",
  },

  // ── Europe ─────────────────────────────────────────────────────────────
  {
    name: "Rotterdam",
    code: "NLRTM",
    country: "Netherlands",
    lat: 51.9244,
    lng: 4.4777,
    size: 1.1,
    color: "#EF4444",
  },
  {
    name: "Hamburg",
    code: "DEHAM",
    country: "Germany",
    lat: 53.5353,
    lng: 9.9872,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Antwerp",
    code: "BEANR",
    country: "Belgium",
    lat: 51.2611,
    lng: 4.3986,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "London",
    code: "GBLON",
    country: "United Kingdom",
    lat: 51.5074,
    lng: 0.4600,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Valencia",
    code: "ESVLC",
    country: "Spain",
    lat: 39.4442,
    lng: -0.3236,
    size: 0.9,
    color: "#EF4444",
  },

  // ── East Asia & ASEAN ──────────────────────────────────────────────────
  {
    name: "Singapore",
    code: "SGSIN",
    country: "Singapore",
    lat: 1.2644,
    lng: 103.8229,
    size: 1.2,
    color: "#38BDF8",
  },
  {
    name: "Shanghai",
    code: "CNSHA",
    country: "China",
    lat: 31.2304,
    lng: 121.4737,
    size: 1.2,
    color: "#38BDF8",
  },
  {
    name: "Ningbo",
    code: "CNNGB",
    country: "China",
    lat: 29.8683,
    lng: 121.5440,
    size: 1.0,
    color: "#38BDF8",
  },
  {
    name: "Tokyo",
    code: "JPTYO",
    country: "Japan",
    lat: 35.6197,
    lng: 139.7798,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Busan",
    code: "KRPUS",
    country: "South Korea",
    lat: 35.1028,
    lng: 129.0403,
    size: 1.0,
    color: "#38BDF8",
  },
  {
    name: "Hong Kong",
    code: "HKHKG",
    country: "Hong Kong",
    lat: 22.3384,
    lng: 114.1333,
    size: 1.0,
    color: "#38BDF8",
  },
  {
    name: "Kuala Lumpur",
    code: "MYPKG",
    country: "Malaysia",
    lat: 3.0000,
    lng: 101.4000,
    size: 0.9,
    color: "#38BDF8",
  },

  // ── Americas ───────────────────────────────────────────────────────────
  {
    name: "Los Angeles",
    code: "USLAX",
    country: "United States",
    lat: 33.7432,
    lng: -118.2673,
    size: 1.1,
    color: "#38BDF8",
  },
  {
    name: "New York",
    code: "USNYC",
    country: "United States",
    lat: 40.7128,
    lng: -74.0060,
    size: 1.1,
    color: "#38BDF8",
  },
  {
    name: "Savannah",
    code: "USSAV",
    country: "United States",
    lat: 32.0809,
    lng: -81.0912,
    size: 0.9,
    color: "#38BDF8",
  },
  {
    name: "Vancouver",
    code: "CAVAN",
    country: "Canada",
    lat: 49.2827,
    lng: -123.1207,
    size: 0.9,
    color: "#EF4444",
  },
  {
    name: "Santos",
    code: "BRSSZ",
    country: "Brazil",
    lat: -23.9618,
    lng: -46.3322,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Buenos Aires",
    code: "ARBUE",
    country: "Argentina",
    lat: -34.6037,
    lng: -58.3816,
    size: 0.9,
    color: "#EF4444",
  },
  {
    name: "Callao",
    code: "PECLO",
    country: "Peru",
    lat: -12.0565,
    lng: -77.1420,
    size: 0.9,
    color: "#EF4444",
  },

  // ── Africa & Oceania ───────────────────────────────────────────────────
  {
    name: "Durban",
    code: "ZADUR",
    country: "South Africa",
    lat: -29.8587,
    lng: 31.0218,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Alexandria",
    code: "EGALY",
    country: "Egypt",
    lat: 31.2001,
    lng: 29.9187,
    size: 0.9,
    color: "#38BDF8",
  },
  {
    name: "Mombasa",
    code: "KEMBA",
    country: "Kenya",
    lat: -4.0435,
    lng: 39.6682,
    size: 0.9,
    color: "#38BDF8",
  },
  {
    name: "Sydney",
    code: "AUSYD",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    size: 1.0,
    color: "#EF4444",
  },
  {
    name: "Melbourne",
    code: "AUMEL",
    country: "Australia",
    lat: -37.8136,
    lng: 144.9631,
    size: 0.9,
    color: "#EF4444",
  },
];

export interface TradeGlobeProps {
  aggregatedData?: AggregatedCountry[];
  onHover?: (data: AggregatedCountry | null) => void;
  selectedCountry?: string | null;
  onCountrySelect?: (countryName: string, iso: string) => void;
  showArcs?: boolean;
  highlightedCorridor?: { origin: string; destination: string };
  autoRotate?: boolean;
  className?: string;
  cameraPosition?: { lat: number; lng: number; altitude: number; duration?: number };
}

export interface TradeGlobeRef {
  pointOfView: (pov?: { lat: number; lng: number; altitude: number }, duration?: number) => any;
  getControls: () => any;
  getCurrentPointOfView: () => { lat: number; lng: number; altitude: number } | null;
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

// Official Survey of India compliant sovereign polygon for Jammu, Kashmir, and Ladakh
const KASHMIR_LADAKH_FEATURE = {
  type: "Feature",
  properties: {
    ISO_A3: "IND",
    NAME: "India",
    ADMIN: "India",
    NAME_LONG: "India (Jammu, Kashmir & Ladakh)",
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [74.87, 32.72],
        [74.35, 33.25],
        [73.95, 33.75],
        [73.45, 34.30],
        [73.30, 35.10],
        [74.20, 36.20],
        [74.80, 36.95],
        [75.00, 37.10], // Northernmost tip (Indira Col)
        [75.80, 36.85],
        [76.70, 36.40],
        [77.40, 36.00],
        [78.20, 35.60],
        [79.20, 35.30], // Aksai Chin & Karakash
        [80.30, 34.60],
        [79.90, 33.80],
        [79.20, 33.10],
        [78.80, 32.50],
        [77.60, 32.80],
        [76.40, 32.60],
        [75.40, 32.40],
        [74.87, 32.72],
      ],
    ],
  },
};

export const TradeGlobe = forwardRef<TradeGlobeRef, TradeGlobeProps>(({
  aggregatedData = [],
  onHover,
  selectedCountry = null,
  onCountrySelect,
  showArcs = true,
  autoRotate = true,
  className = "",
  cameraPosition,
}, ref) => {
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any>({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredArcData, setHoveredArcData] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    pointOfView: (pov, duration = 1000) => {
      if (globeRef.current) {
        if (!pov) return globeRef.current.pointOfView();
        globeRef.current.pointOfView(pov, duration);
      }
    },
    getControls: () => globeRef.current?.controls(),
    getCurrentPointOfView: () => {
      if (globeRef.current) {
        return globeRef.current.pointOfView();
      }
      return null;
    },
  }));

  // Build lookup from ISO A3 → aggregated data
  const isoToData = useMemo(() => {
    const map = new Map<string, AggregatedCountry>();
    for (const item of aggregatedData) {
      const iso = COUNTRY_TO_ISO[item.country];
      if (iso) map.set(iso, item);
    }
    return map;
  }, [aggregatedData]);

  const selectedIso = useMemo(() => {
    if (!selectedCountry) return null;
    return COUNTRY_TO_ISO[selectedCountry] || selectedCountry;
  }, [selectedCountry]);

  // Load GeoJSON and integrate complete official sovereign Indian boundary including Jammu & Kashmir and Ladakh
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.features) return;
        
        // Unify any separate disputed/regional Kashmir & Siachen entities to India
        const processedFeatures = data.features.map((feat: any) => {
          const name = feat.properties?.NAME || "";
          const admin = feat.properties?.ADMIN || "";
          const iso = feat.properties?.ISO_A3 || "";
          
          if (
            name.includes("Kashmir") ||
            name.includes("Siachen") ||
            admin.includes("Kashmir") ||
            admin.includes("Siachen") ||
            admin.includes("Indian Claim") ||
            (iso === "-99" && (name.includes("Jammu") || name.includes("Ladakh") || name.includes("Kashmir")))
          ) {
            return {
              ...feat,
              properties: {
                ...feat.properties,
                ISO_A3: "IND",
                NAME: "India",
                ADMIN: "India",
              },
            };
          }
          return feat;
        });

        // Append the complete official sovereign Jammu & Kashmir and Ladakh boundary
        processedFeatures.push(KASHMIR_LADAKH_FEATURE);

        setCountries({ ...data, features: processedFeatures });
      })
      .catch(console.error);
  }, []);

  // Setup auto-rotate slowly (speed 0.25)
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const setupControls = () => {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.25;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
      }
    };

    setupControls();
    if (!cameraPosition) {
      globe.pointOfView({ lat: 20, lng: 55, altitude: 2.2 });
    }

    const scene = globe.scene();
    if (scene) {
      scene.background = null;
    }

    const timer = setTimeout(setupControls, 200);
    return () => clearTimeout(timer);
  }, [autoRotate, dimensions]);

  // Sync camera position if prop changes
  useEffect(() => {
    if (cameraPosition && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: cameraPosition.lat, lng: cameraPosition.lng, altitude: cameraPosition.altitude },
        cameraPosition.duration ?? 0
      );
    }
  }, [cameraPosition]);

  // Camera focus on selected country
  useEffect(() => {
    if (!selectedCountry || !globeRef.current || cameraPosition) return;
    const coords = COUNTRY_COORDINATES[selectedCountry] || COUNTRY_COORDINATES[selectedIso || ""];
    if (coords) {
      globeRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.8 }, 1000);
    }
  }, [selectedCountry, selectedIso, cameraPosition]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Subtle & Smooth 3D Extruded Polygon Hover
  const getColor = useCallback(
    (feat: any) => {
      const iso = feat.properties?.ISO_A3;
      const countryName = feat.properties?.NAME;

      const isSelected =
        (selectedIso && iso === selectedIso) ||
        (selectedCountry && (countryName === selectedCountry || iso === selectedCountry));
      const isHovered = hoveredCountry === iso || hoveredCountry === countryName;

      if (isHovered) {
        return "rgba(239, 68, 68, 0.45)"; // Soft ruby glass glow
      }

      if (isSelected) {
        return "rgba(239, 68, 68, 0.35)";
      }

      if (iso === "IND") {
        return "rgba(16, 185, 129, 0.30)";
      }

      if (["ARE", "SAU", "GBR", "DEU", "SGP", "NLD", "USA", "CHN", "ZAF", "BRA", "JPN", "AUS"].includes(iso)) {
        return "rgba(56, 189, 248, 0.12)";
      }

      return "rgba(0, 0, 0, 0.0)";
    },
    [selectedIso, selectedCountry, hoveredCountry]
  );

  const getSideColor = useCallback(
    (feat: any) => {
      const iso = feat.properties?.ISO_A3;
      const countryName = feat.properties?.NAME;
      const isSelected =
        (selectedIso && iso === selectedIso) ||
        (selectedCountry && (countryName === selectedCountry || iso === selectedCountry));
      const isHovered = hoveredCountry === iso || hoveredCountry === countryName;

      if (isHovered) {
        return "rgba(220, 38, 38, 0.50)";
      }

      if (isSelected) {
        return "rgba(185, 28, 28, 0.45)";
      }

      if (iso === "IND") {
        return "rgba(16, 185, 129, 0.40)";
      }

      return "rgba(0, 0, 0, 0.0)";
    },
    [selectedIso, selectedCountry, hoveredCountry]
  );

  const getAltitude = useCallback(
    (feat: any) => {
      const iso = feat.properties?.ISO_A3;
      const countryName = feat.properties?.NAME;
      const isSelected =
        (selectedIso && iso === selectedIso) ||
        (selectedCountry && (countryName === selectedCountry || iso === selectedCountry));
      const isHovered = hoveredCountry === iso || hoveredCountry === countryName;

      // Gentle, subtle 3D lift (not aggressive)
      if (isHovered) return 0.045;
      if (isSelected) return 0.035;
      if (iso === "IND") return 0.02;
      if (["ARE", "SAU", "GBR", "DEU", "SGP", "NLD", "USA", "CHN", "ZAF", "BRA", "JPN", "AUS"].includes(iso)) return 0.015;
      return 0.003;
    },
    [selectedIso, selectedCountry, hoveredCountry]
  );

  const handlePolygonHover = useCallback(
    (polygon: any) => {
      if (!polygon) {
        setHoveredCountry(null);
        if (onHover) onHover(null);
        return;
      }
      const iso = polygon.properties?.ISO_A3;
      const name = polygon.properties?.NAME;
      setHoveredCountry(iso || name);

      if (onHover) {
        const item = isoToData.get(iso) || null;
        onHover(item);
      }
    },
    [isoToData, onHover]
  );

  const handlePolygonClick = useCallback(
    (polygon: any) => {
      if (!polygon) return;
      const name = polygon.properties?.NAME;
      const iso = polygon.properties?.ISO_A3;
      if (onCountrySelect && name && iso) {
        onCountrySelect(name, iso);
      }
    },
    [onCountrySelect]
  );

  // Global Interconnected Static Red Maritime Shipping Pool (16 Major Trade Corridors)
  const ALL_GLOBAL_ROUTES = useMemo(() => [
    // 1. Mumbai ➔ Dubai/Jebel Ali (Flagship Middle East Corridor)
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 24.9857,
      endLng: 55.0273,
      baseStroke: 0.85,
      altitude: 0.28,
      origin: "India (JNPT Nhava Sheva)",
      destination: "UAE (Jebel Ali)",
      commodity: "1121 Steam Basmati Rice & Spices",
      valueUSD: "$550,000 USDC",
      duty: "0.0% CEPA Preferential",
      score: "96 / 100 Match",
    },
    // 2. Mumbai ➔ Singapore (Malacca Strait / ASEAN Gateway)
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 1.2644,
      endLng: 103.8229,
      baseStroke: 0.8,
      altitude: 0.32,
      origin: "India (JNPT Nhava Sheva)",
      destination: "Singapore (SGSIN)",
      commodity: "Active Pharma Ingredients (APIs)",
      valueUSD: "$610,000 USDC",
      duty: "0.0% CECA Agreement",
      score: "88 / 100 Match",
    },
    // 3. Mumbai ➔ Jeddah (Red Sea / GCC Route)
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 21.4858,
      endLng: 39.1925,
      baseStroke: 0.8,
      altitude: 0.28,
      origin: "India (JNPT Nhava Sheva)",
      destination: "Saudi Arabia (Jeddah Port)",
      commodity: "Processed Agri & Engineering Units",
      valueUSD: "$480,000 USDC",
      duty: "5.0% Standard GCC",
      score: "89 / 100 Match",
    },
    // 4. Mumbai ➔ Rotterdam (European Container Gateway)
    {
      startLat: 19.0760,
      startLng: 72.8777,
      endLat: 51.9244,
      endLng: 4.4777,
      baseStroke: 0.75,
      altitude: 0.42,
      origin: "India (JNPT Nhava Sheva)",
      destination: "Netherlands (Rotterdam)",
      commodity: "Organic Cotton Yarn & Specialty Steel",
      valueUSD: "$720,000 USDC",
      duty: "EU GSP Preferential",
      score: "84 / 100 Match",
    },
    // 5. Transatlantic: Rotterdam ➔ New York
    {
      startLat: 51.9244,
      startLng: 4.4777,
      endLat: 40.7128,
      endLng: -74.0060,
      baseStroke: 0.8,
      altitude: 0.36,
      origin: "Netherlands (Rotterdam)",
      destination: "USA (New York)",
      commodity: "Automotive Precision & Industrial Pharma",
      valueUSD: "$2,400,000 USDC",
      duty: "Transatlantic Tariff",
      score: "95 / 100 Match",
    },
    // 6. Transpacific: Shanghai ➔ Los Angeles
    {
      startLat: 31.2304,
      startLng: 121.4737,
      endLat: 33.7432,
      endLng: -118.2673,
      baseStroke: 0.8,
      altitude: 0.45,
      origin: "China (Shanghai Port)",
      destination: "USA (Los Angeles)",
      commodity: "Consumer Electronics & Green Tech",
      valueUSD: "$4,200,000 USDC",
      duty: "Transpacific Schedule",
      score: "94 / 100 Match",
    },
    // 7. Transpacific: Tokyo ➔ Los Angeles
    {
      startLat: 35.6197,
      startLng: 139.7798,
      endLat: 33.7432,
      endLng: -118.2673,
      baseStroke: 0.75,
      altitude: 0.42,
      origin: "Japan (Tokyo Port)",
      destination: "USA (Los Angeles)",
      commodity: "Semiconductor Machinery & Optics",
      valueUSD: "$3,100,000 USDC",
      duty: "US-Japan Digital Trade",
      score: "97 / 100 Match",
    },
    // 8. Asia-Europe: Shanghai ➔ Rotterdam
    {
      startLat: 31.2304,
      startLng: 121.4737,
      endLat: 51.9244,
      endLng: 4.4777,
      baseStroke: 0.8,
      altitude: 0.50,
      origin: "China (Shanghai)",
      destination: "Netherlands (Rotterdam)",
      commodity: "Solar PV Modules & Industrial Goods",
      valueUSD: "$3,600,000 USDC",
      duty: "EU Standard Tariff",
      score: "89 / 100 Match",
    },
    // 9. Middle East-Asia: Jebel Ali ➔ Shanghai
    {
      startLat: 24.9857,
      startLng: 55.0273,
      endLat: 31.2304,
      endLng: 121.4737,
      baseStroke: 0.75,
      altitude: 0.35,
      origin: "UAE (Jebel Ali)",
      destination: "China (Shanghai)",
      commodity: "Petrochemicals & Aluminum Ingot",
      valueUSD: "$2,100,000 USDC",
      duty: "GCC-Asia Preferential",
      score: "91 / 100 Match",
    },
    // 10. South America-Europe: Santos ➔ Rotterdam
    {
      startLat: -23.9618,
      startLng: -46.3322,
      endLat: 51.9244,
      endLng: 4.4777,
      baseStroke: 0.75,
      altitude: 0.48,
      origin: "Brazil (Santos)",
      destination: "Netherlands (Rotterdam)",
      commodity: "Soybean Complex & Iron Ore",
      valueUSD: "$1,850,000 USDC",
      duty: "EU-Mercosur Agreement",
      score: "87 / 100 Match",
    },
    // 11. South America-North America: Santos ➔ New York
    {
      startLat: -23.9618,
      startLng: -46.3322,
      endLat: 40.7128,
      endLng: -74.0060,
      baseStroke: 0.75,
      altitude: 0.46,
      origin: "Brazil (Santos)",
      destination: "USA (New York)",
      commodity: "Coffee Beans & Specialized Steels",
      valueUSD: "$1,420,000 USDC",
      duty: "Inter-American Tariff",
      score: "85 / 100 Match",
    },
    // 12. Africa-Middle East: Durban ➔ Jebel Ali
    {
      startLat: -29.8587,
      startLng: 31.0218,
      endLat: 24.9857,
      endLng: 55.0273,
      baseStroke: 0.75,
      altitude: 0.36,
      origin: "South Africa (Durban)",
      destination: "UAE (Jebel Ali)",
      commodity: "Platinum Group Metals & Citrus",
      valueUSD: "$980,000 USDC",
      duty: "IORA Schedule",
      score: "83 / 100 Match",
    },
    // 13. ASEAN-Oceania: Singapore ➔ Sydney
    {
      startLat: 1.2644,
      startLng: 103.8229,
      endLat: -33.8688,
      endLng: 151.2093,
      baseStroke: 0.75,
      altitude: 0.40,
      origin: "Singapore (SGSIN)",
      destination: "Australia (Sydney Port)",
      commodity: "High-Tech Hardware & Biofuels",
      valueUSD: "$1,540,000 USDC",
      duty: "AANZFTA Free Trade",
      score: "93 / 100 Match",
    },
    // 14. UK-North America: London ➔ New York
    {
      startLat: 51.5074,
      startLng: 0.4600,
      endLat: 40.7128,
      endLng: -74.0060,
      baseStroke: 0.75,
      altitude: 0.38,
      origin: "UK (London Gateway)",
      destination: "USA (New York)",
      commodity: "Specialty Aerospace Components",
      valueUSD: "$1,680,000 USDC",
      duty: "US-UK Bilateral Agreement",
      score: "92 / 100 Match",
    },
  ], []);

  // Frame-driven animation clock for projectile ejection, static hold, and reverse retraction
  const [animClock, setAnimClock] = useState({ cycleIndex: 0, progress: 0.5 });

  useEffect(() => {
    if (!ALL_GLOBAL_ROUTES || ALL_GLOBAL_ROUTES.length === 0) return;
    let animId: number;
    const CYCLE_MS = 5000; // 5.0 seconds per route lifecycle transition
    const start = performance.now();

    const frame = (now: number) => {
      const totalElapsed = now - start;
      const cycleIndex = Math.abs(Math.floor(totalElapsed / CYCLE_MS)) % ALL_GLOBAL_ROUTES.length;
      const progress = (totalElapsed % CYCLE_MS) / CYCLE_MS; // 0.0 -> 1.0 within cycle
      setAnimClock({ cycleIndex, progress });
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [ALL_GLOBAL_ROUTES]);

  // Derive exactly 5-6 active shipping lines with Projectile Ejection ➔ Static Hold ➔ Reverse Retraction
  const arcsData = useMemo(() => {
    if (!showArcs || !ALL_GLOBAL_ROUTES || ALL_GLOBAL_ROUTES.length === 0) return [];
    const windowSize = Math.min(5, ALL_GLOBAL_ROUTES.length);
    const result = [];
    const { cycleIndex, progress } = animClock;

    for (let i = 0; i < windowSize; i++) {
      const routeIndex = (Math.abs(cycleIndex) + i) % ALL_GLOBAL_ROUTES.length;
      const route = ALL_GLOBAL_ROUTES[routeIndex];
      if (!route) continue;

      let dashLength = 1.0;
      let dashInitialGap = 0;
      let dashGap = 0;
      let stroke = route.baseStroke ?? 0.75;
      let color: [string, string] = ["#EF4444", "#EF4444"];

      if (i === windowSize - 1) {
        // ── 1. PROJECTILE EJECTION PHASE (Newest route shooting from Origin ➔ Destination)
        const ejectRatio = Math.min(1.0, progress / 0.35); // 0.0 -> 1.0 in first 35% of cycle (~1.7s)
        dashLength = Math.max(0.04, ejectRatio);
        dashInitialGap = 0;
        dashGap = 3.0; // Ensures single projectile beam extends to full length
        color = ["#EF4444", "rgba(239, 68, 68, 0.85)"];
        stroke = route.baseStroke ?? 0.75;
      } else if (i === 0) {
        // ── 3. REVERSE RETRACTION PHASE (Oldest route un-drawing / retracting in reverse)
        if (progress > 0.65) {
          const retractRatio = (progress - 0.65) / 0.35; // 0.0 -> 1.0 in final 35% of cycle
          dashInitialGap = Math.min(1.0, retractRatio);
          dashLength = Math.max(0.01, 1.0 - retractRatio);
          dashGap = 3.0;
          color = ["rgba(239, 68, 68, 0.50)", "rgba(239, 68, 68, 0.20)"];
          stroke = (route.baseStroke ?? 0.75) * 0.75;
        } else {
          // Still static before retraction starts
          dashLength = 1.0;
          dashInitialGap = 0;
          dashGap = 0;
          color = ["#EF4444", "rgba(239, 68, 68, 0.80)"];
        }
      } else {
        // ── 2. STATIC SOLID HOLD PHASE (Remaining active routes are 100% solid static red lines)
        dashLength = 1.0;
        dashInitialGap = 0;
        dashGap = 0;
        color = ["#EF4444", "rgba(239, 68, 68, 0.75)"];
      }

      result.push({
        ...route,
        color,
        stroke,
        dashLength,
        dashInitialGap,
        dashGap,
      });
    }

    return result;
  }, [showArcs, animClock, ALL_GLOBAL_ROUTES]);

  // Rings emanating from key global Hubs
  const ringsData = useMemo(() => [
    {
      lat: 19.0760,
      lng: 72.8777,
      maxR: 7,
      propagationSpeed: 2.2,
      repeatPeriod: 1400,
      color: (t: number) => `rgba(52, 199, 149, ${Math.max(0, 0.75 * (1 - t))})`,
    },
    {
      lat: 24.9857,
      lng: 55.0273,
      maxR: 5,
      propagationSpeed: 1.8,
      repeatPeriod: 1600,
      color: (t: number) => `rgba(239, 68, 68, ${Math.max(0, 0.6 * (1 - t))})`,
    },
    {
      lat: 51.9244,
      lng: 4.4777,
      maxR: 5,
      propagationSpeed: 1.8,
      repeatPeriod: 1700,
      color: (t: number) => `rgba(239, 68, 68, ${Math.max(0, 0.6 * (1 - t))})`,
    },
    {
      lat: 31.2304,
      lng: 121.4737,
      maxR: 5,
      propagationSpeed: 1.8,
      repeatPeriod: 1600,
      color: (t: number) => `rgba(239, 68, 68, ${Math.max(0, 0.6 * (1 - t))})`,
    },
    {
      lat: 40.7128,
      lng: -74.0060,
      maxR: 5,
      propagationSpeed: 1.8,
      repeatPeriod: 1750,
      color: (t: number) => `rgba(239, 68, 68, ${Math.max(0, 0.6 * (1 - t))})`,
    },
  ], []);

  // Smart Animated Hover Popover
  const smartPopoverData = useMemo(() => {
    if (hoveredArcData) return hoveredArcData;
    const target = selectedCountry || hoveredCountry;
    if (!target) return null;
    if (target.includes("Emirates") || target === "ARE" || target === "UAE") {
      return {
        origin: "India (JNPT Nhava Sheva)",
        destination: "United Arab Emirates (Jebel Ali)",
        commodity: "1121 Steam Basmati Rice",
        valueUSD: "$550,000 USDC",
        duty: "0.0% CEPA Preferential",
        score: "96 / 100 Match",
      };
    }
    if (target.includes("Singapore") || target === "SGP") {
      return {
        origin: "India (JNPT Nhava Sheva)",
        destination: "Singapore (SGSIN)",
        commodity: "Active Pharma Ingredients",
        valueUSD: "$610,000 USDC",
        duty: "0.0% CECA Agreement",
        score: "88 / 100 Match",
      };
    }
    if (target.includes("United States") || target === "USA") {
      return {
        origin: "Rotterdam / London / Shanghai",
        destination: "USA (New York / Los Angeles)",
        commodity: "High-Tech & Precision Industrial Goods",
        valueUSD: "$4,200,000 USDC",
        duty: "Bilateral Trade Preference",
        score: "94 / 100 Match",
      };
    }
    if (target.includes("China") || target === "CHN") {
      return {
        origin: "China (Shanghai Port)",
        destination: "Europe / USA / Middle East",
        commodity: "Green Tech, Electronics & Minerals",
        valueUSD: "$3,600,000 USDC",
        duty: "Standard Trade Preference",
        score: "91 / 100 Match",
      };
    }
    return null;
  }, [hoveredArcData, selectedCountry, hoveredCountry]);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden select-none pointer-events-auto ${className}`}>
      {/* Smart Animated Hover/Selection Popover */}
      <AnimatePresence>
        {smartPopoverData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-4 left-4 z-20 pointer-events-none"
          >
            <div className="p-4 rounded-xl border border-red-500/40 bg-[#0C121D]/95 backdrop-blur-xl shadow-2xl space-y-2.5 max-w-[290px]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  GLOBAL SHIPPING CORRIDOR
                </span>
                {smartPopoverData.score && (
                  <span className="text-[10px] font-mono text-[var(--emerald)] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    {smartPopoverData.score}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="font-semibold text-[var(--text-primary)]">
                  {smartPopoverData.origin} ➔ {smartPopoverData.destination}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Commodity:</span>
                  <span className="text-[var(--text-primary)] font-medium truncate max-w-[155px]">
                    {smartPopoverData.commodity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Volume / Value:</span>
                  <span className="text-[var(--emerald)] font-mono font-semibold">{smartPopoverData.valueUSD}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Applied Tariff:</span>
                  <span className="text-red-400 font-mono">{smartPopoverData.duty}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.16}
          polygonsData={countries.features}
          polygonCapColor={getColor}
          polygonSideColor={getSideColor}
          polygonAltitude={getAltitude}
          polygonStrokeColor={() => "rgba(255, 255, 255, 0.15)"}
          polygonsTransitionDuration={650}
          arcsTransitionDuration={800}
          // Projectile Ejection on Birth ➔ Solid Static Hold ➔ Reverse Retraction on Exit
          arcsData={arcsData}
          arcColor="color"
          arcStroke="stroke"
          arcAltitude="altitude"
          arcDashLength="dashLength"
          arcDashInitialGap="dashInitialGap"
          arcDashGap="dashGap"
          arcDashAnimateTime={0}
          onArcHover={(arc) => setHoveredArcData(arc)}
          onArcClick={(arc) => setHoveredArcData(arc)}
          ringsData={ringsData}
          ringColor="color"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          labelsData={TRADE_HUBS}
          labelLat="lat"
          labelText="name"
          labelSize={0.45}
          labelDotRadius={0.25}
          labelColor="color"
          labelAltitude={0.03}
        />
      )}
    </div>
  );
});

TradeGlobe.displayName = "TradeGlobe";
export default TradeGlobe;
