import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import type { BusinessType, OrganizationRole } from "@/services/auth/authService";
import { Listing } from "@/types/trade";
import { aiService, ListingRecord } from "@/services/api/aiService";

export type TradeDirection = "Export" | "Import";

/**
 * Maps a real, DB-backed listing (src/api/trades_api.py::list_listings) to the
 * UI's Listing shape. Trust/risk/match scores are not fabricated here: a
 * listing with no trade or compliance history has no earned score, so it
 * stays 0/unrated rather than showing a plausible-looking fake number (same
 * rule CreateListingPage.tsx already applies on write).
 */
function toUiListing(record: ListingRecord): Listing {
  return {
    id: record.id,
    exporterId: record.organizationId,
    exporterName: record.exporterName || "Unverified Exporter",
    exporterCountry: record.exporterCountry || "Unknown",
    exporterCity: record.exporterCity || "Unknown",
    title: record.productName,
    category: (record.productCategory as Listing["category"]) || "Agriculture",
    hsCode: record.hsCode || "",
    unitPriceUSD: record.price || 0,
    unit: record.unit || "MT",
    minimumOrderQuantity: record.minimumOrderQuantity || 0,
    availableQuantity: record.quantityAvailable || 0,
    originPort: record.originPort || "",
    certifications: record.certifications,
    leadTimeDays: record.leadTimeDays || 0,
    trustScore: 0,
    riskScore: 0,
    aiMatchScore: 0,
    description: record.description || "",
    specs: record.specs,
    isTopTrusted: false,
  };
}

const ROLE_TITLES: Record<OrganizationRole, string> = {
  ORGANIZATION_ADMIN: "Admin",
  SALES: "Sales",
  COMPLIANCE: "Compliance Officer",
  LOGISTICS: "Logistics",
  DELIVERY_STAFF: "Delivery Staff",
};

interface WorkspaceUser {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  roleTitle: string;
  companyName: string;
  country: string;
}

interface WorkspaceContextType {
  user: WorkspaceUser;
  businessType: BusinessType;
  /**
   * The direction the user is currently operating in. Pinned by `businessType` for
   * EXPORTER/IMPORTER orgs; user-toggleable for BOTH.
   *
   * This is the SINGLE SOURCE OF TRUTH for the `trade_flow` parameter sent to the
   * trade-anomaly model. Do not hardcode "Export" at a call site.
   */
  activeDirection: TradeDirection;
  setActiveDirection: (direction: TradeDirection) => void;
  /** True only when the org is BOTH — i.e. the direction toggle should be offered. */
  canSwitchDirection: boolean;
  isImporterView: boolean;
  isExporterView: boolean;
  listings: Listing[];
  listingsLoading: boolean;
  listingsError: string | null;
  refreshListings: () => Promise<void>;
  addListing: (newListing: Listing) => void;
  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser, organization, signOut } = useAuthContext();

  const [preferredDirection, setPreferredDirection] = useState<TradeDirection>(() => {
    const saved = localStorage.getItem("globex_active_direction");
    return saved === "Import" || saved === "Export" ? saved : "Export";
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState<boolean>(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const refreshListings = async () => {
    setListingsLoading(true);
    setListingsError(null);
    try {
      const records = await aiService.getListings({ status: "ACTIVE" });
      setListings(records.map(toUiListing));
    } catch (err) {
      // Honest empty state on failure — never fall back to fabricated demo
      // listings. The marketplace must show "no live listings" rather than
      // pretend the catalog is populated when the backend is unreachable.
      setListingsError(err instanceof Error ? err.message : "Could not load marketplace listings.");
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    refreshListings();
  }, []);

  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  const handleSetActiveDirection = (direction: TradeDirection) => {
    setPreferredDirection(direction);
    localStorage.setItem("globex_active_direction", direction);
  };

  const user: WorkspaceUser = {
    userId: appUser?.id || "",
    organizationId: organization?.id || "",
    name: [appUser?.firstName, appUser?.lastName].filter(Boolean).join(" ") || appUser?.email || "User",
    email: appUser?.email || "",
    roleTitle: organization ? ROLE_TITLES[organization.organizationRole] : "Member",
    companyName: organization?.legalName || "",
    country: organization?.country || "",
  };

  const businessType: BusinessType = organization?.businessType || "EXPORTER";
  const canSwitchDirection = businessType === "BOTH";

  // EXPORTER / IMPORTER orgs are pinned to their one direction — a pinned org must
  // never be able to land on the other side's flow. Only BOTH honours the toggle.
  const activeDirection: TradeDirection =
    businessType === "EXPORTER"
      ? "Export"
      : businessType === "IMPORTER"
        ? "Import"
        : preferredDirection;

  const isExporterView = activeDirection === "Export";
  const isImporterView = activeDirection === "Import";

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        businessType,
        activeDirection,
        setActiveDirection: handleSetActiveDirection,
        canSwitchDirection,
        isImporterView,
        isExporterView,
        listings,
        listingsLoading,
        listingsError,
        refreshListings,
        addListing: handleAddListing,
        logout: signOut,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
