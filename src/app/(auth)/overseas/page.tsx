"use client";

import React from "react";
import OverseasStockView from "@/components/features/stock/overseas/OverseasStockView";
import styles from "./page.module.css";

export default function OverseasPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>해외 주식</h1>
        <p className={styles.pageDescription}>
          전 세계 주요 증권거래소의 주식을 검색하고 현재가를 확인하세요.
        </p>
      </div>

      <div className={styles.content}>
        <OverseasStockView />
      </div>
    </div>
  );
}
