import React, { useState } from "react";
import { useStockData } from "@/contexts/StockDataContext";
import { ERROR_MESSAGES } from "@/constants";

const SymbolSubscriptionManager: React.FC = () => {
  const { subscribeSymbol, isLoading, error } = useStockData();
  const [symbolInput, setSymbolInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 종목 코드 입력 처리
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbolInput(e.target.value.toUpperCase());
    setErrorMessage("");
  };

  // 종목 구독 처리
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력 유효성 검사
    if (!symbolInput.trim()) {
      setErrorMessage(ERROR_MESSAGES.REQUIRED_SYMBOL);
      return;
    }

    // 한국 주식 종목 코드 형식 검사(6자리 숫자)
    if (!/^\d{6}$/.test(symbolInput)) {
      setErrorMessage(ERROR_MESSAGES.INVALID_SYMBOL);
      return;
    }

    try {
      const success = await subscribeSymbol(symbolInput);
      if (success) {
        setSymbolInput(""); // 입력 필드 초기화
      } else {
        setErrorMessage(ERROR_MESSAGES.SUBSCRIBE_FAIL);
      }
    } catch (err) {
      setErrorMessage(ERROR_MESSAGES.SUBSCRIBE_ERROR);
      console.error("Subscribe error:", err);
    }
  };

  return (
    <div className="subscription-manager">
      <h3>종목 구독</h3>

      <form onSubmit={handleSubscribe} className="subscription-form">
        <div className="input-group">
          <input
            type="text"
            value={symbolInput}
            onChange={handleSymbolChange}
            placeholder="종목 코드 (예: 005930)"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !symbolInput.trim()}>
            {isLoading ? "처리중..." : "구독"}
          </button>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {error && <div className="error-message">{error}</div>}

        <div className="help-text">
          * 삼성전자: 005930, SK하이닉스: 000660, 카카오: 035720
        </div>
      </form>
    </div>
  );
};

export default SymbolSubscriptionManager;
