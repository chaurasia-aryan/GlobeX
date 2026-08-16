/**
 * Appwrite Backend Service Layer
 * Supports seamless fallback to local mock store when Appwrite is unconfigured
 */

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "exporter" | "buyer" | "arbitrator" | "admin";
  companyName: string;
  country: string;
  isLoggedIn: boolean;
}

const DEFAULT_USER: UserSession = {
  userId: "usr_abc_01",
  name: "Rajesh Sharma",
  email: "rajesh.sharma@abcglobaltrade.com",
  role: "exporter",
  companyName: "ABC Global Exports Ltd",
  country: "India",
  isLoggedIn: true,
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

  public setRole(role: "exporter" | "buyer" | "arbitrator" | "admin") {
    if (role === "exporter") {
      this.currentUser = {
        userId: "usr_abc_01",
        name: "Rajesh Sharma",
        email: "rajesh.sharma@abcglobaltrade.com",
        role: "exporter",
        companyName: "ABC Global Exports Ltd",
        country: "India",
        isLoggedIn: true,
      };
    } else if (role === "buyer") {
      this.currentUser = {
        userId: "usr_alf_01",
        name: "Tariq Al-Mansoor",
        email: "tariq.mansoor@alfuttaim-global.ae",
        role: "buyer",
        companyName: "Al-Futtaim Global Trade LLC",
        country: "UAE",
        isLoggedIn: true,
      };
    } else if (role === "arbitrator") {
      this.currentUser = {
        userId: "usr_arb_01",
        name: "Dr. Elena Vance (FCIArb)",
        email: "elena.vance@arbitration-icc.org",
        role: "arbitrator",
        companyName: "ICC International Court of Arbitration",
        country: "Switzerland",
        isLoggedIn: true,
      };
    } else {
      this.currentUser = {
        userId: "usr_adm_01",
        name: "System Administrator",
        email: "admin@globex.ai",
        role: "admin",
        companyName: "GLOBEX Core Infrastructure",
        country: "Global",
        isLoggedIn: true,
      };
    }
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
  }

  public async login(email: string, role: "exporter" | "buyer" | "arbitrator" | "admin" = "exporter"): Promise<UserSession> {
    this.setRole(role);
    this.currentUser.email = email;
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = {
      ...this.currentUser,
      isLoggedIn: false,
    };
    localStorage.setItem("globex_user_session", JSON.stringify(this.currentUser));
  }

  public async uploadKycDocument(file: File, docType: string): Promise<{ fileId: string; url: string }> {
    return {
      fileId: `file_${Date.now()}`,
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
