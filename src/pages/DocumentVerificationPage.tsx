import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import DocumentVerificationStudio from "@/components/documents/DocumentVerificationStudio";
import { FileCheck2 } from "lucide-react";

export const DocumentVerificationPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Documents" },
          ]}
          title="Document Verification"
          subtitle="Multi-document OCR cross-reconciliation across Commercial Invoices, Bills of Lading, and Phytosanitary Certificates."
          badge={<StatusBadge status="verified" label="On-Chain Anchoring Active" size="md" />}
        />

        <DocumentVerificationStudio />
      </div>
    </AppShell>
  );
};

export default DocumentVerificationPage;
