import React, { memo } from "react";
import { useSymbolSubscription } from "@/hooks/stock/useSymbolSubscription";
import SymbolInputForm from "./SymbolInputForm";

const SymbolSubscriptionManager: React.FC = memo(() => {
  const { symbolInput, isLoading, error, handleInputChange, handleSubscribe } =
    useSymbolSubscription();

  return (
    <div className="subscription-manager">
      <h3>종목 구독</h3>
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
