import React from "react";
import { PhasePendingPage } from "@/components/common/PhasePendingPage";

export const SettingsPage: React.FC = () => (
  <PhasePendingPage
    section="System"
    title="Settings"
    subtitle="Org, profile, and direction switch."
    pendingNote="Wired in Phase 6 — the first user/org/direction-settings surface in the app; today's direction switch lives only in the AppShell top bar."
  />
);

export default SettingsPage;
