"use client";

import { useBalance } from "@/hooks/balance/useBalance";
import WelcomeSection from "@/components/features/dashboard/WelcomeSection";
import InvestmentSummary from "@/components/features/dashboard/InvestmentSummary";
import styles from "./page.module.css";
import MarketOverview from "@/components/features/dashboard/MarketOverview";
import HoldingsOverview from "@/components/features/dashboard/HoldingsOverview";
import LoadingIndicator from "@/components/common/LoadingIndicator";

export default function DashboardPage() {
  const { balanceData, isLoading } = useBalance();

  if (isLoading) return <LoadingIndicator />;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>대시보드</h1>
      <WelcomeSection />
      <InvestmentSummary
        summary={balanceData?.summary}
        positions={balanceData?.positions || []}
        isLoading={isLoading}
      />
      <MarketOverview />
      <HoldingsOverview
        positions={balanceData?.positions || []}
        isLoading={isLoading}
      />
    </div>
  );
}
