import React, { useState } from "react";
import { Anchor, ShieldCheck, Building2, Globe2, Search, ArrowRight, Gauge, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface PortInfo {
  code: string;
  name: string;
  country: string;
  countryCode: string;
  customsSpeed: string;
  sovereignTrust: number;
  creditRating: string;
  annualTEU: string;
  keyFacilities: string[];
  certifications: string[];
}

const GLOBAL_PORTS: PortInfo[] = [
  {
    code: "INNSA",
    name: "JNPT Nhava Sheva",
    country: "India",
    countryCode: "IND",
    customsSpeed: "24-36 hrs",
    sovereignTrust: 0.88,
    creditRating: "AA+",
    annualTEU: "6.05M TEU",
    keyFacilities: ["Automated Reefer Terminals", "ICEGATE Fast-Track EDI", "Direct Port Delivery (DPD)"],
    certifications: ["APEDA Export Staging", "FSSAI Food Safety Lab", "ISO 28000 Security"],
  },
  {
    code: "INMUN",
    name: "Mundra Port (Adani Terminals)",
    country: "India",
    countryCode: "IND",
    customsSpeed: "18-24 hrs",
    sovereignTrust: 0.90,
    creditRating: "AAA",
    annualTEU: "7.40M TEU",
    keyFacilities: ["Deep Draft Berths", "Automated Container Gate", "Dedicated Freight Corridor Rail Link"],
    certifications: ["Green Port Platinum", "ISO 9001/14001", "AEO-T3 Tier Staging"],
  },
  {
    code: "AEJEA",
    name: "Jebel Ali Port (DP World)",
    country: "United Arab Emirates",
    countryCode: "ARE",
    customsSpeed: "8-12 hrs (CEPA Lane)",
    sovereignTrust: 0.96,
    creditRating: "AAA",
    annualTEU: "14.50M TEU",
    keyFacilities: ["Automated High-Bay Storage (BoxBay)", "Halal Cold Chain Hub", "Paperless Blockchain Customs"],
    certifications: ["ESMA Halal Hub", "Dubai Trade Single Window", "WCO Authorized Economic Operator"],
  },
  {
    code: "SAJED",
    name: "Jeddah Islamic Port",
    country: "Saudi Arabia",
    countryCode: "SAU",
    customsSpeed: "16-24 hrs",
    sovereignTrust: 0.92,
    creditRating: "AA+",
    annualTEU: "5.10M TEU",
    keyFacilities: ["Red Sea Transshipment Hub", "SFDA Cold Logistics Center", "FASAH Fast Customs Gate"],
    certifications: ["SFDA Food Clearance", "SASO Safety Inspection", "ISO 22000"],
  },
  {
    code: "DEHAM",
    name: "Port of Hamburg (HHLA)",
    country: "Germany",
    countryCode: "DEU",
    customsSpeed: "12-18 hrs",
    sovereignTrust: 0.97,
    creditRating: "AAA",
    annualTEU: "8.70M TEU",
    keyFacilities: ["Altenwerder Automated AGV Terminal", "TRACES NT Health Post", "Rail Intermodal Hub"],
    certifications: ["EU Organic Control Post", "HACCP Food Safety", "ISPS Code Class 1"],
  },
  {
    code: "USHOU",
    name: "Port of Houston",
    country: "United States",
    countryCode: "USA",
    customsSpeed: "18-24 hrs",
    sovereignTrust: 0.95,
    creditRating: "AAA",
    annualTEU: "3.90M TEU",
    keyFacilities: ["Bayport Container Terminal", "USDA APHIS Plant Inspection", "Foreign Trade Zone #84"],
    certifications: ["US FDA Registered Point of Entry", "C-TPAT Tier 3", "USDA Organic Clearance"],
  },
  {
    code: "SGSIN",
    name: "Port of Singapore (PSA)",
    country: "Singapore",
    countryCode: "SGP",
    customsSpeed: "6-10 hrs (TradeNet)",
    sovereignTrust: 0.98,
    creditRating: "AAA",
    annualTEU: "39.00M TEU",
    keyFacilities: ["Tuas Mega Port Fully Automated", "Portnet Digital Ecosystem", "Direct Transshipment Bypass"],
    certifications: ["SFA Food Safety Clearance", "TradeNet Single Window", "AEO Mutual Recognition"],
  },
];

export const SovereignPortIntelligence: React.FC<{ className?: string }> = ({ className }) => {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");

  const filteredPorts = GLOBAL_PORTS.filter((p) => {
    const matchesCountry = selectedCountry === "ALL" || p.countryCode === selectedCountry;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Sovereign Port & Customs Infrastructure Intelligence
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Port throughput metrics, customs clearance lead times, cold-chain certifications, and sovereign credit ratings.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--text-tertiary)]">
            UN/LOCODE Indexed
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search port name, UN/LOCODE (e.g. INNSA, AEJEA), or country..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors pl-9"
          />
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Nations</option>
            <option value="IND">India (IND)</option>
            <option value="ARE">United Arab Emirates (ARE)</option>
            <option value="SAU">Saudi Arabia (SAU)</option>
            <option value="DEU">Germany (DEU)</option>
            <option value="USA">United States (USA)</option>
            <option value="SGP">Singapore (SGP)</option>
          </select>
        </div>
      </div>

      {/* Ports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPorts.map((port) => (
          <div
            key={port.code}
            className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-indigo-500/40 transition-all space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 border-b border-[var(--hairline)] pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--hairline)] font-mono text-xs font-bold text-indigo-400">
                    {port.code}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">{port.name}</h4>
                </div>
                <span className="text-xs text-[var(--text-secondary)] block mt-0.5">{port.country}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 block">
                  Trust: {Math.round(port.sovereignTrust * 100)}/100
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] block mt-0.5">
                  Rating: {port.creditRating}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)]">
                <span className="text-[10px] text-[var(--text-tertiary)] block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" /> Customs Clearance
                </span>
                <span className="font-semibold text-[var(--text-primary)]">{port.customsSpeed}</span>
              </div>

              <div className="p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)]">
                <span className="text-[10px] text-[var(--text-tertiary)] block flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-indigo-400" /> Annual Capacity
                </span>
                <span className="font-semibold text-[var(--text-primary)]">{port.annualTEU}</span>
              </div>
            </div>

            {/* Key Facilities */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Key Infrastructure:</span>
              <div className="flex flex-wrap gap-1">
                {port.keyFacilities.map((f, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--hairline)] text-[var(--text-secondary)]">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Staging Certifications */}
            <div className="flex flex-wrap gap-1 pt-1">
              {port.certifications.map((c, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SovereignPortIntelligence;
