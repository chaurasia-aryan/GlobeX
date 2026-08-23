"""
GlobeXAI Trade OS — Regulatory Compliance & Tariff Router
Endpoint: POST /compliance/rag-analyze

Deterministic rule-based compliance engine grounded in official bilateral trade
treaties (India-UAE CEPA, India-Singapore CECA, India-Australia ECTA, etc.) and
Harmonized System non-tariff measures (NTMs).
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Compliance & Tariffs"])

# ---------------------------------------------------------------------------
# Bilateral Trade Agreements & Tariff Rules
# ---------------------------------------------------------------------------

_TREATY_MAP: Dict[Tuple[str, str], Dict[str, Any]] = {
    ("IND", "ARE"): {
        "agreement": "India-UAE Comprehensive Economic Partnership Agreement (CEPA)",
        "preferential_rate_pct": 0.0,
        "standard_mfn_rate_pct": 5.0,
        "ntm_barriers": [
            "Ministry of Climate Change and Environment (MOCCAE) Food Import Permit",
            "Halal Certification for processed products",
            "NPPO Phytosanitary Inspection at origin port",
            "Maximum Residue Limit (MRL) laboratory test certificate",
        ],
    },
    ("IND", "SGP"): {
        "agreement": "India-Singapore Comprehensive Economic Cooperation Agreement (CECA)",
        "preferential_rate_pct": 0.0,
        "standard_mfn_rate_pct": 0.0,
        "ntm_barriers": [
            "Singapore Food Agency (SFA) TradeNet Import Declaration",
            "Certificate of Origin (CECA form)",
        ],
    },
    ("IND", "AUS"): {
        "agreement": "India-Australia Economic Cooperation and Trade Agreement (ECTA)",
        "preferential_rate_pct": 0.0,
        "standard_mfn_rate_pct": 5.0,
        "ntm_barriers": [
            "Department of Agriculture, Fisheries and Forestry (DAFF) Biosecurity Import Conditions (BICON)",
            "Certificate of Analysis for contaminants & pesticide residues",
        ],
    },
    ("IND", "JPN"): {
        "agreement": "India-Japan Comprehensive Economic Partnership Agreement (IJCEPA)",
        "preferential_rate_pct": 0.0,
        "standard_mfn_rate_pct": 3.5,
        "ntm_barriers": [
            "Ministry of Health, Labour and Welfare (MHLW) Food Sanitation Law Notification",
            "Plant Protection Station Quarantine Inspection",
        ],
    },
    ("IND", "KOR"): {
        "agreement": "India-Korea Comprehensive Economic Partnership Agreement (IKCEPA)",
        "preferential_rate_pct": 2.0,
        "standard_mfn_rate_pct": 8.0,
        "ntm_barriers": [
            "Ministry of Food and Drug Safety (MFDS) Import Food Safety Control Declaration",
            "Quarantine Inspection Certificate",
        ],
    },
    ("IND", "MYS"): {
        "agreement": "ASEAN-India Trade in Goods Agreement (AITIGA) / India-Malaysia CECA",
        "preferential_rate_pct": 3.0,
        "standard_mfn_rate_pct": 8.0,
        "ntm_barriers": [
            "Malaysian Quarantine and Inspection Services (MAQIS) Import Permit",
            "JAKIM-recognized Halal Certification",
        ],
    },
    ("IND", "USA"): {
        "agreement": "Standard Most-Favoured-Nation (MFN) Tariff Regime",
        "preferential_rate_pct": 5.5,
        "standard_mfn_rate_pct": 5.5,
        "ntm_barriers": [
            "US FDA Prior Notice of Imported Foods (FSMA Rule)",
            "USDA APHIS Phytosanitary Certificate",
            "Customs and Border Protection (CBP) Entry Summary Form 7501",
        ],
    },
    ("IND", "GBR"): {
        "agreement": "UK Developing Countries Trading Scheme (DCTS) / Standard MFN",
        "preferential_rate_pct": 6.0,
        "standard_mfn_rate_pct": 12.0,
        "ntm_barriers": [
            "UK Department for Environment, Food & Rural Affairs (DEFRA) IPAFFS Notification",
            "Phytosanitary Certificate conforming to GB Plant Health Regulations",
        ],
    },
    ("IND", "DEU"): {
        "agreement": "European Union Common Customs Tariff / Standard Third-Country Duty",
        "preferential_rate_pct": 7.5,
        "standard_mfn_rate_pct": 12.0,
        "ntm_barriers": [
            "TRACES NT (Trade Control and Expert System) Common Health Entry Document (CHED-PP)",
            "EU Maximum Residue Limits (MRL) Lab Test Report (Regulation EC 396/2005)",
        ],
    },
}

_PRODUCT_DOCUMENTS: Dict[int, List[Dict[str, Any]]] = {
    100630: [
        {"name": "Commercial Invoice", "issuing_authority": "Exporter / Shipper", "mandatory": True},
        {"name": "Bill of Lading", "issuing_authority": "Ocean Carrier (MSC / Maersk)", "mandatory": True},
        {"name": "Packing List", "issuing_authority": "Exporter / Warehouse", "mandatory": True},
        {"name": "Certificate of Origin", "issuing_authority": "Export Inspection Council (EIC) / DGFT", "mandatory": True},
        {"name": "Phytosanitary Certificate", "issuing_authority": "NPPO / Directorate of Plant Protection, Quarantine & Storage", "mandatory": True},
        {"name": "APEDA Registration-cum-Allocation Certificate (RCAC)", "issuing_authority": "APEDA Ministry of Commerce", "mandatory": True},
        {"name": "FSSAI Food Export Clearance", "issuing_authority": "Food Safety and Standards Authority of India", "mandatory": True},
        {"name": "Independent Quality & Weight Certificate", "issuing_authority": "SGS / Bureau Veritas / Intertek", "mandatory": False},
    ]
}

_DEFAULT_DOCUMENTS: List[Dict[str, Any]] = [
    {"name": "Commercial Invoice", "issuing_authority": "Exporter / Shipper", "mandatory": True},
    {"name": "Bill of Lading / Air Waybill", "issuing_authority": "Freight Carrier", "mandatory": True},
    {"name": "Packing List", "issuing_authority": "Exporter", "mandatory": True},
    {"name": "Certificate of Origin", "issuing_authority": "Chamber of Commerce / DGFT", "mandatory": True},
    {"name": "Export Declaration", "issuing_authority": "Customs Authority (ICEGATE)", "mandatory": True},
    {"name": "Inspection Certificate", "issuing_authority": "Third-Party Inspector", "mandatory": False},
]


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class ComplianceRequest(BaseModel):
    hs6: int = Field(..., description="6-digit HS product code", example=100630)
    hs_code_str: Optional[str] = Field(default=None, description="Formatted HS code string", example="1006.30")
    origin_country: str = Field(default="IND", description="ISO3 origin country code", example="IND")
    destination_country: str = Field(..., description="ISO3 destination country code", example="ARE")
    certifications: Optional[List[str]] = Field(default=None, description="Certifications held by exporter", example=["FSSAI", "APEDA"])
    trade_value_usd: Optional[float] = Field(default=None, description="Total trade contract value in USD", example=250000.0)


class TariffDetail(BaseModel):
    preferential_rate_pct: float
    standard_mfn_rate_pct: float
    agreement: str
    duty_savings_usd: Optional[float] = None


class ComplianceDocument(BaseModel):
    name: str
    issuing_authority: str
    mandatory: bool


class ComplianceResponse(BaseModel):
    status: str
    compliance_engine: str = "rule-based-v1.0"
    analysis_id: str
    origin_country: str
    destination_country: str
    hs6: int
    tariff: TariffDetail
    ntm_barriers: List[str]
    required_documents: List[ComplianceDocument]
    compliance_score: float = Field(..., description="0-100 score, higher is better/more compliant")
    flags: List[str]
    disclaimer: str


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/compliance/rag-analyze",
    response_model=ComplianceResponse,
    summary="Regulatory Compliance & Tariff RAG Analysis",
    description=(
        "Analyzes customs tariff schedules, preferential bilateral trade agreements, "
        "non-tariff measures (NTMs), and mandatory document requirements for a specific "
        "origin-destination corridor and HS6 commodity."
    ),
)
def rag_analyze(req: ComplianceRequest) -> Dict[str, Any]:
    analysis_id = str(uuid.uuid4())
    origin = req.origin_country.strip().upper()
    dest = req.destination_country.strip().upper()

    corridor_key = (origin, dest)
    treaty = _TREATY_MAP.get(
        corridor_key,
        {
            "agreement": f"General MFN Tariff Regime ({origin} -> {dest})",
            "preferential_rate_pct": 5.0,
            "standard_mfn_rate_pct": 6.5,
            "ntm_barriers": [
                f"Standard {dest} Customs Import Declaration",
                "Destination Sanitary & Phytosanitary (SPS) Clearance",
            ],
        },
    )

    pref_rate = treaty["preferential_rate_pct"]
    mfn_rate = treaty["standard_mfn_rate_pct"]

    duty_savings: Optional[float] = None
    if req.trade_value_usd and req.trade_value_usd > 0:
        savings_pct = max(0.0, mfn_rate - pref_rate)
        duty_savings = round(req.trade_value_usd * (savings_pct / 100.0), 2)

    required_docs = _PRODUCT_DOCUMENTS.get(req.hs6, _DEFAULT_DOCUMENTS)

    # Compliance score calculation
    held_certs = set(c.upper() for c in (req.certifications or []))
    score = 90.0

    flags: List[str] = []
    if pref_rate == 0.0 and mfn_rate > 0.0:
        flags.append(f"ZERO_TARIFF_PREFERENCE ({treaty['agreement']})")
        score += 5.0

    if req.hs6 == 100630:
        if "APEDA" not in held_certs:
            flags.append("MISSING_APEDA_CERTIFICATION")
            score -= 10.0
        if "FSSAI" not in held_certs:
            flags.append("MISSING_FSSAI_CLEARANCE")
            score -= 5.0

    ntm_count = len(treaty["ntm_barriers"])
    score -= min(15.0, ntm_count * 2.5)
    final_score = round(max(10.0, min(100.0, score)), 1)

    return ComplianceResponse(
        status="OK",
        compliance_engine="rule-based-v1.0",
        analysis_id=analysis_id,
        origin_country=origin,
        destination_country=dest,
        hs6=req.hs6,
        tariff=TariffDetail(
            preferential_rate_pct=pref_rate,
            standard_mfn_rate_pct=mfn_rate,
            agreement=treaty["agreement"],
            duty_savings_usd=duty_savings,
        ),
        ntm_barriers=treaty["ntm_barriers"],
        required_documents=[ComplianceDocument(**d) for d in required_docs],
        compliance_score=final_score,
        flags=flags,
        disclaimer="Rule-based engine. Verify with official customs authorities before shipment.",
    ).model_dump()
