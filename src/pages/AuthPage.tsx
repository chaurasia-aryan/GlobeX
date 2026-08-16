import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import {
  Building2,
  User,
  Mail,
  Briefcase,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import PrimaryAction from "@/components/common/PrimaryAction";
import { UploadedDoc } from "@/services/appwrite/client";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [orgName, setOrgName] = useState("ABC Global Exports & Imports Ltd");
  const [adminName, setAdminName] = useState("Rajesh Sharma");
  const [email, setEmail] = useState("rajesh.sharma@abcglobaltrade.com");
  const [role, setSelectedRole] = useState<RoleType>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [documents, setDocuments] = useState<UploadedDoc[]>([
    {
      id: "doc_1",
      name: "IEC_Certificate_GovIndia.pdf",
      size: "2.4 MB",
      type: "IEC License",
      uploadTime: "Verified",
    },
    {
      id: "doc_2",
      name: "GSTIN_Incorporation_27AABCA.pdf",
      size: "1.1 MB",
      type: "GSTIN Registration",
      uploadTime: "Verified",
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, idx) => ({
        id: `doc_${Date.now()}_${idx}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.toLowerCase().includes("iec")
          ? "IEC License"
          : file.name.toLowerCase().includes("gst")
          ? "GSTIN Registration"
          : "Commercial Trade Doc",
        uploadTime: "Uploaded",
      }));
      setDocuments((prev) => [...newFiles, ...prev]);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === "signup") {
      await register({
        adminName,
        organizationName: orgName,
        email,
        role,
        documents,
      });
    } else {
      await login(email, role, orgName);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans select-none relative">
      <div className="w-full max-w-lg p-7 sm:p-9 rounded-3xl border border-white/[0.08] bg-[#0C121D] shadow-2xl space-y-6">
        
        {/* Header & Switcher */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>INSTITUTIONAL ACCESS</span>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white mt-1">
              {mode === "signin" ? "Sign in to GLOBEX" : "Register Organization"}
            </h1>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-[#111824] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organization Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Organization Name</span>
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. ABC Global Exports & Imports Ltd"
              className="w-full px-3 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans"
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Name (Full Name)</span>
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans"
              />
            </div>
          )}

          {/* Role Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role in Organization</span>
            </label>
            <select
              value={role}
              onChange={(e) => setSelectedRole(e.target.value as RoleType)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans cursor-pointer"
            >
              <option value="admin" className="bg-[#0C121D] text-white">
                Admin (Full Access & Organization Lead)
              </option>
              <option value="compliance" className="bg-[#0C121D] text-white">
                Compliance Officer (Verification & Customs)
              </option>
              <option value="salesman" className="bg-[#0C121D] text-white">
                Salesman (Commercial Contracts & Trade Deals)
              </option>
            </select>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Corporate Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@organization.com"
              className="w-full px-3 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans"
            />
          </div>

          {/* Add Documents Section (Sign Up Mode) */}
          {mode === "signup" && (
            <div className="p-3 rounded-2xl bg-[#0D1420] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add Documents & KYC</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-medium cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              </div>

              <div className="space-y-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111824] border border-white/[0.04] text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white truncate max-w-[180px] font-mono">{doc.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{doc.size}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PrimaryAction
            type="submit"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            <span>{mode === "signin" ? "Sign In to Workspace" : "Register Organization & Launch"}</span>
          </PrimaryAction>
        </form>

        <div className="text-center pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Sig Protocol Verified</span>
          </div>
          <Link to="/" className="text-emerald-400 hover:underline">
            ← Back to Globe
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;

