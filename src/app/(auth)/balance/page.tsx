"use client";

import BalanceTabs from "@/components/features/balance/BalanceTabs";
import styles from "./page.module.css";

export default function BalancePage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>잔고 확인</h1>
        <p className={styles.pageDescription}>
          국내 및 해외 주식 보유 현황을 확인하세요
        </p>
      </div>

      <div className={styles.content}>
        <BalanceTabs defaultTab="domestic" />
      </div>
    </div>
  );
}
