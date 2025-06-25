import { useState } from "react";
import styles from "./BalanceTabs.module.css";
import DomesticBalance from "./DomesticBalance";
import OverseasBalance from "./OverseasBalance";

type BalanceTab = "domestic" | "overseas";

interface BalanceTabsProps {
  defaultTab?: BalanceTab;
}

const BalanceTabs: React.FC<BalanceTabsProps> = ({
  defaultTab = "domestic",
}) => {
  const [activeTab, setActiveTab] = useState<BalanceTab>(defaultTab);

  const tabs = [
    { id: "domestic" as const, label: "국내 잔고" },
    { id: "overseas" as const, label: "해외 잔고" },
  ];

  return (
    <div className={styles.container}>
      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === "domestic" && <DomesticBalance />}
        {activeTab === "overseas" && <OverseasBalance />}
      </div>
    </div>
  );
};

export default BalanceTabs;
