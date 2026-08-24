/**
 * Appwrite Backend Service Layer
 * Supports seamless fallback to local mock store when Appwrite is unconfigured
 */

export type OrganizationRole = "admin" | "compliance" | "salesman" | "buyer" | "exporter" | "dual" | "arbitrator";

/**
 * Which way goods flow for this organization.
 *
 * String-identical to the `public.business_type` Postgres enum
 * (backend/database/supabase/migrations/20260822111809_initial_globex_schema.sql),
 * so this can be populated directly from `organizations.business_type` once a
 * live org fetch exists.
 *
 * This is ORTHOGONAL to `OrganizationRole`, which is a job title *inside* an
 * organization (Admin / Compliance Officer / Salesman / Arbitrator). A compliance
 * officer at an importing firm and one at an exporting firm share a role and have
 * completely different trade directions — hence two fields, not one.
 */
export type BusinessType = "EXPORTER" | "IMPORTER" | "BOTH";

/** The concrete direction of a single trade — the `trade_flow` model parameter. */
export type TradeDirection = "Export" | "Import";

export interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadTime: string;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: OrganizationRole;
  roleTitle: string;
  /** Which way goods flow. Drives flow differentiation and the `trade_flow` model param. */
  businessType: BusinessType;
  companyName: string;
  country: string;
  isLoggedIn: boolean;
  documents?: UploadedDoc[];
}

const DEFAULT_USER: UserSession = {
  userId: "usr_abc_01",
  name: "John Doe",
  email: "john.doe@acmeglobaltrade.com",
  role: "admin",
  roleTitle: "Admin",
  businessType: "BOTH",
  companyName: "Acme Global Trading Ltd.",
  country: "India",
  isLoggedIn: true,
  documents: [
    { id: "doc_1", name: "IEC_Certificate_GovIndia.pdf", size: "2.4 MB", type: "IEC License", uploadTime: "Just now" },
    { id: "doc_2", name: "GSTIN_Incorporation_27AABCA.pdf", size: "1.1 MB", type: "GSTIN Registration", uploadTime: "Just now" },
  ],
};

const isBusinessType = (value: unknown): value is BusinessType =>
  value === "EXPORTER" || value === "IMPORTER" || value === "BOTH";

const getRoleTitle = (role: OrganizationRole): string => {
  switch (role) {
    case "admin":
      return "Admin";
    case "compliance":
      return "Compliance Officer";
    case "salesman":
      return "Salesman";
    case "buyer":
      return "Buyer (Importer)";
    case "exporter":
      return "Seller (Exporter)";
    case "dual":
      return "Dual Trade Operator";
    case "arbitrator":
      return "Arbitrator";
    default:
      return "Admin";
  }
};

class AppwriteService {
  private isConfigured: boolean;
  private currentUser: UserSession;

  constructor() {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    this.isConfigured = Boolean(endpoint && projectId);

    const savedUser = localStorage.getItem("globex_user_session");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.role || parsed.role === "delivery") {
          this.currentUser = DEFAULT_USER;
          localStorage.setItem("globex_user_session", JSON.stringify(DEFAULT_USER));
        } else {
          // Migrate sessions persisted before `businessType` existed. Without this
          // an older localStorage session yields `undefined`, and every direction
          // branch silently falls back to its default.
          this.currentUser = {
            ...parsed,
            businessType: isBusinessType(parsed.businessType)
              ? parsed.businessType
              : DEFAULT_USER.businessType,
          };
          localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
        }
      } catch {
        this.currentUser = DEFAULT_USER;
        localStorage.setItem("globex_user_session", JSON.stringify(DEFAULT_USER));
      }
    } else {
      this.currentUser = DEFAULT_USER;
      localStorage.setItem("globex_user_session", JSON.stringify(DEFAULT_USER));
    }
  }

  public getCurrentUser(): UserSession {
    return this.currentUser;
  }

  public setRole(role: OrganizationRole) {
    this.currentUser = {
      ...this.currentUser,
      role,
      roleTitle: getRoleTitle(role),
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));
  }

  public setBusinessType(businessType: BusinessType) {
    this.currentUser = { ...this.currentUser, businessType };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));
  }

  public async register(payload: {
    adminName: string;
    organizationName: string;
    email: string;
    role?: OrganizationRole;
    businessType?: BusinessType;
    country?: string;
    documents?: UploadedDoc[];
  }): Promise<UserSession> {
    const assignedRole = payload.role || "admin";
    this.currentUser = {
      userId: `usr_${Date.now().toString(36)}`,
      name: payload.adminName || "Organization Admin",
      email: payload.email || "admin@tradecorp.com",
      role: assignedRole,
      roleTitle: getRoleTitle(assignedRole),
      businessType: payload.businessType || DEFAULT_USER.businessType,
      companyName: payload.organizationName || "Global Trade Enterprise",
      country: payload.country || "India",
      isLoggedIn: true,
      documents: payload.documents && payload.documents.length > 0 ? payload.documents : DEFAULT_USER.documents,
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));
    return this.currentUser;
  }

  public async login(
    email: string,
    role: OrganizationRole = "admin",
    organizationName?: string,
    businessType?: BusinessType
  ): Promise<UserSession> {
    this.currentUser = {
      ...this.currentUser,
      email: email || this.currentUser.email,
      role,
      roleTitle: getRoleTitle(role),
      businessType: businessType || this.currentUser.businessType || DEFAULT_USER.businessType,
      companyName: organizationName || this.currentUser.companyName || "Acme Global Trading Ltd.",
      isLoggedIn: true,
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = DEFAULT_USER;
    localStorage.setItem("globex_user_session", JSON.stringify(DEFAULT_USER));
    window.dispatchEvent(new Event("storage"));
  }

  public async uploadKycDocument(file: File, docType: string): Promise<{ fileId: string; url: string }> {
    const newDoc: UploadedDoc = {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: docType || "Trade Document",
      uploadTime: "Just now",
    };
    const currentDocs = this.currentUser.documents || [];
    this.currentUser.documents = [newDoc, ...currentDocs];
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));

    return {
      fileId: newDoc.id,
      url: URL.createObjectURL(file),
    };
  }

  public getStatus() {
    return {
      configured: this.isConfigured,
      endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1 (Mock Fallback)",
      projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "globex-production-sih",
      databaseId: "globex_trade_db",
      storageBuckets: ["kyc_documents", "trade_documents", "inspection_evidence"],
      status: "OPERATIONAL",
    };
  }
}

export const appwriteService = new AppwriteService();

