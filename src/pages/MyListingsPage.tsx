import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import {
  Package,
  PlusCircle,
  Search,
  Building2,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  Globe2,
  FileCheck2,
  Tag,
  Boxes,
  Eye,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationExportProduct {
  id: string;
  title: string;
  category: string;
  hsCode: string;
  unitPriceUSD: number;
  unit: string;
  availableStock: number;
  minOrderQty: number;
  originPort: string;
  certifications: string[];
  status: "active" | "low_stock" | "paused";
  inquiriesCount: number;
  topInquiry: string;
}

const INITIAL_ORG_PRODUCTS: OrganizationExportProduct[] = [
  {
    id: "org_prod_01",
    title: "1121 Steam Extra Long Grain Aged Basmati Rice",
    category: "Agriculture",
    hsCode: "1006.30.20",
    unitPriceUSD: 1100,
    unit: "MT",
    availableStock: 2500,
    minOrderQty: 100,
    originPort: "JNPT Nhava Sheva (INNSA)",
    certifications: ["ISO 22000", "APEDA", "FSSAI", "Halal"],
    status: "active",
    inquiriesCount: 5,
    topInquiry: "Al-Futtaim LLC (Dubai) requested 500 MT quote",
  },
  {
    id: "org_prod_02",
    title: "Traditional Sugandha White Sella Basmati Rice",
    category: "Agriculture",
    hsCode: "1006.30.10",
    unitPriceUSD: 940,
    unit: "MT",
    availableStock: 1800,
    minOrderQty: 80,
    originPort: "Mundra Port (INMUN)",
    certifications: ["APEDA", "FSSAI", "Global G.A.P."],
    status: "active",
    inquiriesCount: 3,
    topInquiry: "Jeddah Food Merchants requested 200 MT CIF",
  },
  {
    id: "org_prod_03",
    title: "Organic Durum Wheat Grain Milling Grade-A",
    category: "Agriculture",
    hsCode: "1001.19.00",
    unitPriceUSD: 360,
    unit: "MT",
    availableStock: 4200,
    minOrderQty: 250,
    originPort: "Kandla Port (INIXY)",
    certifications: ["NPOP Organic", "USDA Organic", "ISO 9001"],
    status: "active",
    inquiriesCount: 4,
    topInquiry: "Bremen Mills Germany requested sample inspection",
  },
  {
    id: "org_prod_04",
    title: "Non-Basmati PR-11 Raw White Rice (5% Broken)",
    category: "Agriculture",
    hsCode: "1006.30.90",
    unitPriceUSD: 520,
    unit: "MT",
    availableStock: 800,
    minOrderQty: 150,
    originPort: "Kakinada Deepwater Port (INKAK)",
    certifications: ["FSSAI", "ISO 22000"],
    status: "low_stock",
    inquiriesCount: 2,
    topInquiry: "Abidjan Grains Consortium inquiry pending",
  },
  {
    id: "org_prod_05",
    title: "Cold-Pressed Mustard Oil (Kachi Ghani Grade)",
    category: "Agriculture",
    hsCode: "1514.91.00",
    unitPriceUSD: 1450,
    unit: "MT",
    availableStock: 650,
    minOrderQty: 25,
    originPort: "JNPT Nhava Sheva (INNSA)",
    certifications: ["AGMARK Grade 1", "FSSAI", "ISO 22000"],
    status: "active",
    inquiriesCount: 2,
    topInquiry: "UK Indian Grocery Wholesalers FOB inquiry",
  },
];

const CATEGORIES = ["All Commodities", "Agriculture", "Spices", "Textiles", "Chemicals"];

export const MyListingsPage: React.FC = () => {
  const { user } = useWorkspace();
  const [products, setProducts] = useState<OrganizationExportProduct[]>(INITIAL_ORG_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Agriculture");
  const [newHsCode, setNewHsCode] = useState("1006.30");
  const [newPrice, setNewPrice] = useState(1200);
  const [newUnit, setNewUnit] = useState("MT");
  const [newStock, setNewStock] = useState(1000);
  const [newMinOrder, setNewMinOrder] = useState(50);
  const [newPort, setNewPort] = useState("JNPT Nhava Sheva (INNSA)");
  const [newCerts, setNewCerts] = useState("APEDA, FSSAI, ISO 22000");

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All Commodities" || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      p.title.toLowerCase().includes(q) ||
      p.hsCode.includes(q) ||
      p.originPort.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: OrganizationExportProduct = {
      id: `org_prod_${Date.now()}`,
      title: newTitle || "Export Commodity Batch",
      category: newCategory,
      hsCode: newHsCode || "1006.30.20",
      unitPriceUSD: Number(newPrice) || 1000,
      unit: newUnit,
      availableStock: Number(newStock) || 500,
      minOrderQty: Number(newMinOrder) || 50,
      originPort: newPort || "JNPT Nhava Sheva (INNSA)",
      certifications: newCerts.split(",").map((c) => c.trim()),
      status: "active",
      inquiriesCount: 1,
      topInquiry: "Published to Global Exporter Marketplace. Awaiting buyer matching.",
    };

    setProducts((prev) => [created, ...prev]);
    setShowAddModal(false);
    // Reset form
    setNewTitle("");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AppShell maxWidth="xl">
      <div className="space-y-6 select-none">
        
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Export Listings" },
          ]}
          section="Exporter Perspective"
          title="My Organization's Export Catalog"
          subtitle={`Active export commodities, inventory stock, and international buyer inquiries listed by ${user.companyName}.`}
          badge={
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{products.length} Active Listings for Export</span>
            </div>
          }
          action={
            <div className="flex items-center gap-2">
              <Link to="/trade-requests?duty=export">
                <button className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#162232] border border-white/[0.08] text-slate-300 text-xs font-medium transition-all">
                  <span>View Trade Inquiries</span>
                </button>
              </Link>

              <PrimaryAction
                onClick={() => setShowAddModal(true)}
                icon={<PlusCircle className="w-4 h-4" />}
                iconPosition="left"
              >
                <span>Add Export Product</span>
              </PrimaryAction>
            </div>
          }
        />

        {/* ── Organization Exporter KPIs ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0A171D] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Catalog Valuation</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300">
              $5.48M <span className="text-xs font-sans text-slate-400 font-normal">FOB</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              Across {products.length} verified products
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A171D] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Available Export Stock</span>
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              9,950 <span className="text-xs font-sans text-slate-400 font-normal">MT</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Ready for immediate port staging
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A171D] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Active Buyer Inquiries</span>
              <Globe2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-sky-300">
              16 Inquiries
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              From UAE, Saudi, Germany, Ivory Coast
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A171D] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Export Compliance</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              100% Passed
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              APEDA, FSSAI & Chamber COO Verified
            </div>
          </div>
        </div>

        {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B1019] border border-white/[0.08]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition-colors cursor-pointer",
                  selectedCategory === cat
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101726] border border-white/[0.08] focus-within:border-emerald-500/40 w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog or HS code..."
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 font-sans"
            />
          </div>
        </div>

        {/* ── Export Listings Table / Grid ────────────────────────────────── */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#0B121C] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                        HS {prod.hsCode}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{prod.category}</span>
                      <span className="text-xs font-mono text-slate-400">•</span>
                      <span className="text-xs font-mono text-slate-300">{prod.originPort}</span>
                    </div>

                    <h3 className="text-base font-display font-bold text-white">
                      {prod.title}
                    </h3>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <div className="text-lg font-mono font-bold text-emerald-300">
                      ${prod.unitPriceUSD.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">/ {prod.unit} FOB</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Stock: <strong className="text-white">{prod.availableStock.toLocaleString()} {prod.unit}</strong> (Min: {prod.minOrderQty} {prod.unit})
                    </div>
                  </div>
                </div>

                {/* Certifications & Inquiries */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {prod.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-slate-300"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* Active Inquiries Alert */}
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-sky-400 flex items-center gap-1.5 bg-sky-950/50 border border-sky-500/30 px-2.5 py-1 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      <span>{prod.inquiriesCount} Buyer Inquiries</span>
                    </div>

                    <Link
                      to="/trade-requests?duty=export"
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>View RFQ Bids</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADD NEW PRODUCT TO EXPORT CATALOG MODAL ─────────────────────── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl p-6 rounded-3xl bg-[#0C121D] border border-white/[0.12] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">
                      Add Product to Export Catalog
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Published under {user.companyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 1509 Golden Sella Basmati Rice Extra Long"
                    className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Agriculture">Agriculture & Grains</option>
                      <option value="Spices">Spices & Extracts</option>
                      <option value="Textiles">Textiles & Apparel</option>
                      <option value="Chemicals">Chemicals & Minerals</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">HS Code</label>
                    <input
                      type="text"
                      required
                      value={newHsCode}
                      onChange={(e) => setNewHsCode(e.target.value)}
                      placeholder="e.g. 1006.30.20"
                      className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Stock (Qty)</label>
                    <input
                      type="number"
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Min Order</label>
                    <input
                      type="number"
                      required
                      value={newMinOrder}
                      onChange={(e) => setNewMinOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Origin Port / Staging Hub</label>
                  <input
                    type="text"
                    required
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    placeholder="e.g. JNPT Nhava Sheva (INNSA)"
                    className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Certifications (comma separated)</label>
                  <input
                    type="text"
                    value={newCerts}
                    onChange={(e) => setNewCerts(e.target.value)}
                    placeholder="APEDA, FSSAI, Halal, ISO 22000"
                    className="w-full px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <PrimaryAction type="submit" size="md">
                    <span>Publish to Global Exporters Network</span>
                  </PrimaryAction>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default MyListingsPage;
