import React, { createContext, useContext, useState, useEffect } from "react";
import {
  appwriteService,
  UserSession,
  OrganizationRole,
  UploadedDoc,
  BusinessType,
  TradeDirection,
} from "@/services/appwrite/client";
import { Listing } from "@/types/trade";
import { aiService, ListingRecord } from "@/services/api/aiService";

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

export type RoleType = OrganizationRole;
export type DutyMode = "dual" | "import" | "export";

interface WorkspaceContextType {
  user: UserSession;
  role: RoleType;
  setRole: (role: RoleType) => void;
  dutyMode: DutyMode;
  setDutyMode: (mode: DutyMode) => void;
  /** Which way goods flow for this organization (mirrors `organizations.business_type`). */
  businessType: BusinessType;
  setBusinessType: (businessType: BusinessType) => void;
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
  isBuyer: boolean;
  isExporter: boolean;
  isAdmin: boolean;
  isCompliance: boolean;
  isSalesman: boolean;
  isDual: boolean;
  roleLabel: string;
  roleAccentColor: string;
  roleBadgeClass: string;
  listings: Listing[];
  listingsLoading: boolean;
  listingsError: string | null;
  refreshListings: () => Promise<void>;
  addListing: (newListing: Listing) => void;
  register: (payload: {
    adminName: string;
    organizationName: string;
    email: string;
    role?: OrganizationRole;
    businessType?: BusinessType;
    country?: string;
    documents?: UploadedDoc[];
  }) => Promise<UserSession>;
  login: (
    email: string,
    role?: OrganizationRole,
    organizationName?: string,
    businessType?: BusinessType
  ) => Promise<UserSession>;
  logout: () => Promise<void>;
  uploadDocument: (file: File, docType: string) => Promise<{ fileId: string; url: string }>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => appwriteService.getCurrentUser());
  const [dutyMode, setDutyMode] = useState<DutyMode>("import");

  // Only meaningful for a BOTH org; for EXPORTER/IMPORTER the businessType wins below.
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

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(appwriteService.getCurrentUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSetRole = (newRole: RoleType) => {
    appwriteService.setRole(newRole);
    const updated = appwriteService.getCurrentUser();
    setUser(updated);
  };

  const handleRegister = async (payload: {
    adminName: string;
    organizationName: string;
    email: string;
    role?: OrganizationRole;
    country?: string;
    documents?: UploadedDoc[];
  }) => {
    const res = await appwriteService.register(payload);
    setUser(res);
    return res;
  };

  const handleLogin = async (
    email: string,
    role: OrganizationRole = "admin",
    organizationName?: string,
    businessType?: BusinessType
  ) => {
    const res = await appwriteService.login(email, role, organizationName, businessType);
    setUser(res);
    return res;
  };

  const handleSetBusinessType = (next: BusinessType) => {
    appwriteService.setBusinessType(next);
    setUser(appwriteService.getCurrentUser());
  };

  const handleSetActiveDirection = (direction: TradeDirection) => {
    setPreferredDirection(direction);
    localStorage.setItem("globex_active_direction", direction);
  };

  const handleLogout = async () => {
    await appwriteService.logout();
    setUser(appwriteService.getCurrentUser());
  };

  const handleUploadDocument = async (file: File, docType: string) => {
    const res = await appwriteService.uploadKycDocument(file, docType);
    setUser(appwriteService.getCurrentUser());
    return res;
  };

  const businessType: BusinessType = user.businessType || "BOTH";
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

  const role = user.role as RoleType;
  const isBuyer = role === "buyer" || dutyMode === "import";
  const isExporter = role === "exporter" || dutyMode === "export";
  const isAdmin = role === "admin";
  const isCompliance = role === "compliance";
  const isSalesman = role === "salesman";
  const isDual = role === "dual" || dutyMode === "dual" || isAdmin || isCompliance || isSalesman;

  const roleLabel =
    role === "admin"
      ? "Enterprise Admin"
      : role === "compliance"
        ? "Compliance Officer"
        : role === "salesman"
          ? "Salesman"
          : role === "buyer"
            ? "Buyer Workspace"
            : role === "exporter"
              ? "Exporter Workspace"
              : role === "arbitrator"
                ? "Arbitrator Portal"
                : "Dual Trade Operator";

  const roleAccentColor =
    role === "compliance"
      ? "#818CF8" // Indigo/Violet
      : role === "salesman"
        ? "#F59E0B" // Amber
        : role === "buyer"
          ? "#38BDF8" // Sky
          : role === "exporter"
            ? "#34C795" // Emerald
            : "#34C795"; // Admin / Dual

  const roleBadgeClass =
    role === "compliance"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
      : role === "salesman"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
        : role === "buyer"
          ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
          : role === "exporter"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        role,
        setRole: handleSetRole,
        dutyMode,
        setDutyMode,
        businessType,
        setBusinessType: handleSetBusinessType,
        activeDirection,
        setActiveDirection: handleSetActiveDirection,
        canSwitchDirection,
        isImporterView,
        isExporterView,
        isBuyer,
        isExporter,
        isAdmin,
        isCompliance,
        isSalesman,
        isDual,
        roleLabel,
        roleAccentColor,
        roleBadgeClass,
        listings,
        listingsLoading,
        listingsError,
        refreshListings,
        addListing: handleAddListing,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        uploadDocument: handleUploadDocument,
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

