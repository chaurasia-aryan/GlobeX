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
  Layers,
} from "lucide-react";
import PrimaryAction from "@/components/common/PrimaryAction";
import { UploadedDoc } from "@/services/appwrite/client";

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRegisterAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register({
      adminName,
      organizationName: orgName,
      email,
      role,
      documents,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56, 189, 248, 0.08), transparent 70%)",
        }}
      />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GLOBEX UNIFIED PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Register Organization
          </h1>

          <p className="text-sm text-slate-400">
            Set up your organization credentials, admin profile, and verified documents
          </p>
        </div>

        <div className="p-7 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0C121D] shadow-2xl">
          <form onSubmit={handleRegisterAndProceed} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

              {/* Admin Name */}
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

              {/* Corporate Email */}
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

              {/* Role Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Organization Role</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans cursor-pointer"
                >
                  <option value="admin" className="bg-[#0C121D] text-white">
                    Admin (Full Enterprise Access)
                  </option>
                  <option value="compliance" className="bg-[#0C121D] text-white">
                    Compliance Officer (Regulatory & Verification)
                  </option>
                  <option value="salesman" className="bg-[#0C121D] text-white">
                    Salesman (Commercial Contracts & Deals)
                  </option>
                </select>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="p-3.5 rounded-2xl bg-[#0D1420] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add Documents & KYC Credentials</span>
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-medium cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Documents</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.06] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white truncate max-w-[200px] font-mono">{doc.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{doc.size}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                        {doc.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <PrimaryAction
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              <span>Launch Unified Workspace →</span>
            </PrimaryAction>
          </form>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <Link to="/login" className="text-emerald-400 hover:underline">
              Already registered? Sign in →
            </Link>
            <Link to="/" className="hover:text-white">
              Back to Globe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

