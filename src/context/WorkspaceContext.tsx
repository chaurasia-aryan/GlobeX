import React, { createContext, useContext, useState, useEffect } from "react";
import { appwriteService, UserSession } from "@/services/appwrite/client";

export type RoleType = "buyer" | "exporter" | "arbitrator" | "admin";

interface WorkspaceContextType {
  user: UserSession;
  role: RoleType;
  setRole: (role: RoleType) => void;
  isBuyer: boolean;
  isExporter: boolean;
  roleLabel: string;
  roleAccentColor: string;
  roleBadgeClass: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => appwriteService.getCurrentUser());

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

  const role = user.role as RoleType;
  const isBuyer = role === "buyer";
  const isExporter = role === "exporter";

  const roleLabel = isBuyer
    ? "Buyer Workspace"
    : isExporter
    ? "Exporter Workspace"
    : role === "arbitrator"
    ? "Arbitrator Portal"
    : "System Admin";

  const roleAccentColor = isBuyer ? "#38bdf8" : isExporter ? "#34C795" : "#E8A73D";

  const roleBadgeClass = isBuyer
    ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
    : isExporter
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/10 text-amber-400 border-amber-500/30";

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        role,
        setRole: handleSetRole,
        isBuyer,
        isExporter,
        roleLabel,
        roleAccentColor,
        roleBadgeClass,
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
