import React, { memo } from "react";
import { DashboardHeaderProps } from "@/types";
import styles from "./DashboardHeader.module.css";

const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({ title }) => (
  <header className={styles.dashboardHeader}>
    <h1 className={styles.title}>{title}</h1>
  </header>
));

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
