import React, { memo } from "react";
import styles from "./SubscriptionHelpText.module.css";

interface SubscriptionHelpTextProps {
  examples?: Array<{ name: string; code: string }>;
}

const DEFAULT_EXAMPLES = [
  { name: "삼성전자", code: "005930" },
  { name: "SK하이닉스", code: "000660" },
  { name: "카카오", code: "035720" },
];

const SubscriptionHelpText: React.FC<SubscriptionHelpTextProps> = memo(
  ({ examples = DEFAULT_EXAMPLES }) => (
    <div className={styles.helpText}>
      <span className={styles.helpIcon}>💡</span>
      <span className={styles.helpContent}>
        예시:{" "}
        {examples.map(({ name, code }, index) => (
          <span key={code}>
            {index > 0 && ", "}
            <span className={styles.exampleItem}>
              {name}: <code className={styles.stockCode}>{code}</code>
            </span>
          </span>
        ))}
      </span>
    </div>
  )
);

SubscriptionHelpText.displayName = "SubscriptionHelpText";

export default SubscriptionHelpText;
