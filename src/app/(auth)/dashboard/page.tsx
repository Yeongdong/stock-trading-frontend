"use client";

import WelcomeSection from "@/components/features/dashboard/WelcomeSection";
import InvestmentSummary from "@/components/features/dashboard/InvestmentSummary";
import styles from "./page.module.css";
import MarketOverview from "@/components/features/dashboard/MarketOverview";
import HoldingsOverview from "@/components/features/dashboard/HoldingsOverview";

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>대시보드</h1>
      <WelcomeSection />
      <InvestmentSummary />
      <MarketOverview />
      <HoldingsOverview />
    </div>
  );
}
