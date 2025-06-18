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
      <p className={styles.emptyMessage}>{message}</p>
      <p className={styles.emptySubmessage}>{submessage}</p>
    </div>
  )
);

EmptySubscriptionState.displayName = "EmptySubscriptionState";

export default EmptySubscriptionState;
