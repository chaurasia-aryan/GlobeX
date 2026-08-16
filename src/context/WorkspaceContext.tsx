import React, { createContext, useContext, useState, useEffect } from "react";
import { appwriteService, UserSession, OrganizationRole, UploadedDoc } from "@/services/appwrite/client";

export type RoleType = OrganizationRole;
export type DutyMode = "dual" | "import" | "export";

interface WorkspaceContextType {
  user: UserSession;
  role: RoleType;
  setRole: (role: RoleType) => void;
  dutyMode: DutyMode;
  setDutyMode: (mode: DutyMode) => void;
  isBuyer: boolean;
  isExporter: boolean;
  isAdmin: boolean;
  isCompliance: boolean;
  isSalesman: boolean;
  isDual: boolean;
  roleLabel: string;
  roleAccentColor: string;
  roleBadgeClass: string;
  register: (payload: {
    adminName: string;
    organizationName: string;
    email: string;
    role?: OrganizationRole;
    country?: string;
    documents?: UploadedDoc[];
  }) => Promise<UserSession>;
  login: (email: string, role?: OrganizationRole, organizationName?: string) => Promise<UserSession>;
  logout: () => Promise<void>;
  uploadDocument: (file: File, docType: string) => Promise<{ fileId: string; url: string }>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => appwriteService.getCurrentUser());
  const [dutyMode, setDutyMode] = useState<DutyMode>("import");

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

  const handleLogin = async (email: string, role: OrganizationRole = "admin", organizationName?: string) => {
    const res = await appwriteService.login(email, role, organizationName);
    setUser(res);
    return res;
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
        isBuyer,
        isExporter,
        isAdmin,
        isCompliance,
        isSalesman,
        isDual,
        roleLabel,
        roleAccentColor,
        roleBadgeClass,
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

