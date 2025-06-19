import React, { memo } from "react";
import styles from "./EmptySubscriptionState.module.css";
import { EmptySubscriptionStateProps } from "@/types";

const EmptySubscriptionState: React.FC<EmptySubscriptionStateProps> = memo(
  ({
    message = "구독 중인 종목이 없습니다.",
    submessage = "위 입력창에서 종목 코드를 입력하여 실시간 시세를 구독해보세요.",
  }) => (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.emptyIcon} aria-hidden="true">
        📈
      </div>
      <h3 className={styles.emptyMessage}>{message}</h3>
      <p className={styles.emptySubmessage}>{submessage}</p>
      <div className={styles.actionHint}>
        <span className={styles.hintIcon}>💡</span>
        <span className={styles.hintText}>
          종목 코드 예시: 005930 (삼성전자), 000660 (SK하이닉스)
        </span>
      </div>
    </div>
  )
);

EmptySubscriptionState.displayName = "EmptySubscriptionState";

export default EmptySubscriptionState;
