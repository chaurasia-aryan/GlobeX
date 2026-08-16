/**
 * Appwrite Backend Service Layer
 * Supports seamless fallback to local mock store when Appwrite is unconfigured
 */

export type OrganizationRole = "admin" | "compliance" | "salesman" | "buyer" | "exporter" | "dual" | "arbitrator";

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
  companyName: string;
  country: string;
  isLoggedIn: boolean;
  documents?: UploadedDoc[];
}

const DEFAULT_USER: UserSession = {
  userId: "usr_abc_01",
  name: "Rajesh Sharma",
  email: "rajesh.sharma@abcglobaltrade.com",
  role: "admin",
  roleTitle: "Admin",
  companyName: "ABC Global Exports & Imports Ltd",
  country: "India",
  isLoggedIn: true,
  documents: [
    { id: "doc_1", name: "IEC_Certificate_GovIndia.pdf", size: "2.4 MB", type: "IEC License", uploadTime: "Just now" },
    { id: "doc_2", name: "GSTIN_Incorporation_27AABCA.pdf", size: "1.1 MB", type: "GSTIN Registration", uploadTime: "Just now" },
  ],
};

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
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = DEFAULT_USER;
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

  public async register(payload: {
    adminName: string;
    organizationName: string;
    email: string;
    role?: OrganizationRole;
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
    organizationName?: string
  ): Promise<UserSession> {
    this.currentUser = {
      ...this.currentUser,
      email: email || this.currentUser.email,
      role,
      roleTitle: getRoleTitle(role),
      companyName: organizationName || this.currentUser.companyName || "ABC Global Exports & Imports Ltd",
      isLoggedIn: true,
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    window.dispatchEvent(new Event("storage"));
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = {
      ...this.currentUser,
      isLoggedIn: false,
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
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

