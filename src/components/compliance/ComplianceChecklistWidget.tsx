import { useState } from "react";
import { CheckSquare, AlertCircle, ShieldAlert, FileText, ExternalLink, Percent } from "lucide-react";

interface ComplianceChecklistWidgetProps {
  hsCode?: string;
  productName?: string;
  origin?: string;
  destination?: string;
}

export const ComplianceChecklistWidget = ({
  hsCode = "1006.30.20",
  productName = "1121 Steam Extra Long Grain Basmati Rice",
  origin = "India",
  destination = "United Arab Emirates",
}: ComplianceChecklistWidgetProps) => {
  const mandatoryDocs = [
    { name: "Commercial Invoice", authority: "Exporter / Shipper", status: "Uploaded", hash: "8f4e...2b5d" },
    { name: "Bill of Lading (Ocean)", authority: "MSC Shipping Line", status: "Uploaded", hash: "a1c3...0246" },
    { name: "Packing List", authority: "Warehouse Facility", status: "Uploaded", hash: "d7f1...3c4d" },
    { name: "Certificate of Origin (CEPA)", authority: "DGFT / Export Council", status: "Verified", hash: "e3b0...b855" },
    { name: "Phytosanitary Certificate", authority: "NPPO Plant Quarantine", status: "Verified", hash: "f1a2...0f1a" },
  ];

  const ntmRequirements = [
    "MOCCAE Import Permit (Dubai Municipality Food Safety Dept)",
    "Halal Certification by recognized Islamic body",
    "Pesticide residue test report conforming to UAE.S GSO 223/2021 standard",
    "Non-GMO origin declaration",
  ];

  return (
    <div className="glass-panel p-4 bg-card/80 border-border/70 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Compliance & Regulatory Intelligence
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
          87/100 COMPLIANT
        </span>
      </div>

      {/* Tariff & Trade Treaty Card */}
      <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-muted-foreground">Harmonized Tariff (HS Code):</span>
          <span className="font-bold text-primary">{hsCode}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-muted-foreground">Applied Import Duty:</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <Percent className="w-3 h-3" /> 0.0% (India-UAE CEPA)
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground bg-secondary/70 p-2 rounded border border-border/50">
          Estimated tariff savings for this contract: <strong className="text-emerald-400 font-mono">$27,500 USD</strong> compared to standard MFN 5% rates.
        </div>
      </div>

      {/* Mandatory Document Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold text-foreground flex items-center justify-between">
          <span>Mandatory Document Checklist</span>
          <span className="text-[11px] text-muted-foreground">5 of 5 Registered</span>
        </div>
        <div className="space-y-1.5">
          {mandatoryDocs.map((doc) => (
            <div
              key={doc.name}
              className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/40 text-xs"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{doc.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{doc.authority}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                  {doc.status}
                </span>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">{doc.hash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Tariff Measures (NTMs) */}
      <div className="space-y-1.5">
        <div className="text-xs font-mono font-semibold text-foreground">
          Non-Tariff Measures & Import Rules
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {ntmRequirements.map((req, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px]">
              <span className="text-primary font-bold">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal Disclaimer Warning */}
      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start gap-2 text-amber-300 text-[11px]">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="leading-tight">
          AI-generated regulatory analysis. Verify final customs declarations and clearance requirements with national customs authorities.
        </p>
      </div>
    </div>
  );
};

export default ComplianceChecklistWidget;
