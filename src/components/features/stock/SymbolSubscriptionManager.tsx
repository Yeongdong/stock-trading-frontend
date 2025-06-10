import React, { memo } from "react";
import { useSymbolSubscription } from "@/hooks/stock/useSymbolSubscription";
import SymbolInputForm from "./SymbolInputForm";
import styles from "./SymbolSubscriptionManager.module.css";

const SymbolSubscriptionManager: React.FC = memo(() => {
  const { symbolInput, isLoading, error, handleInputChange, handleSubscribe } =
    useSymbolSubscription();

  return (
    <div className={styles.subscriptionManager}>
      <h3 className={styles.title}>종목 구독</h3>
      <SymbolInputForm
        symbolInput={symbolInput}
        onInputChange={handleInputChange}
        onSubmit={handleSubscribe}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
});

SymbolSubscriptionManager.displayName = "SymbolSubscriptionManager";

export default SymbolSubscriptionManager;
