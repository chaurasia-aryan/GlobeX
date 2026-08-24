import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DirectionChooser } from "@/components/common/DirectionChooser";
import { DashboardPage } from "@/pages/DashboardPage";

/**
 * /home — the command center, direction-framed (route table §1c). Orgs that
 * can switch direction (businessType === "BOTH") see the DirectionChooser
 * first each visit; a pinned EXPORTER/IMPORTER org skips straight to the
 * command center since there's nothing to choose.
 */
export const HomePage: React.FC = () => {
  const { canSwitchDirection } = useWorkspace();
  const [entered, setEntered] = useState(!canSwitchDirection);

  if (!entered) {
    return <DirectionChooser onEnter={() => setEntered(true)} />;
  }
  return <DashboardPage />;
};

export default HomePage;
