import { DashboardHeaderProps } from "@/types";
import React, { memo } from "react";

const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({ title }) => (
  <header className="dashboard-header">
    <h1>{title}</h1>
  </header>
));

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
