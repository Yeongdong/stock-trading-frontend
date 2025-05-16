import React, { useEffect, useState, useCallback, memo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { ERROR_MESSAGES, TIMINGS } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import useDebounce from "@/hooks/common/useDebounce";

const SymbolSubscriptionManager: React.FC = memo(() => {
  const { subscribeSymbol, isSubscribed } = useStockOperations();
  const { addError } = useError();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [symbolInput, setSymbolInput] = useState<string>("");
  const [internalError, setInternalError] = useState<string>("");
  const debouncedSymbolInput = useDebounce(symbolInput, TIMINGS.DEBOUNCE);

  // 디바운스된 입력에 대한 유효성 검사
  useEffect(() => {
    if (debouncedSymbolInput && !/^\d{6}$/.test(debouncedSymbolInput)) {
      setInternalError(ERROR_MESSAGES.INVALID_SYMBOL);
    } else if (debouncedSymbolInput) {
      setInternalError("");
    }
  }, [debouncedSymbolInput]);

  // 입력 처리 함수
  const handleSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSymbolInput(value);
      // 사용자가 타이핑 중일 때는 에러 메시지 초기화
      if (internalError) setInternalError("");
    },
    [internalError]
  );

  // 종목 구독 처리
  const handleSubscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedSymbol = symbolInput.trim();

      // 입력 유효성 검사
      if (!trimmedSymbol) {
        setInternalError(ERROR_MESSAGES.REQUIRED_SYMBOL);
        return;
      }

      // 한국 주식 종목 코드 형식 검사(6자리 숫자)
      if (!/^\d{6}$/.test(symbolInput)) {
        setInternalError(ERROR_MESSAGES.INVALID_SYMBOL);
        addError({
          message: ERROR_MESSAGES.INVALID_SYMBOL,
          severity: "warning",
        });
        return;
      }

      if (isSubscribed(symbolInput)) {
        setInternalError("이미 구독 중인 종목입니다.");
        return;
      }

      try {
        setIsLoading(true);
        const success = await subscribeSymbol(symbolInput);
        if (success) {
          setSymbolInput("");
        } else {
          setInternalError(ERROR_MESSAGES.SUBSCRIBE_FAIL);
        }
      } catch (err) {
        setInternalError(ERROR_MESSAGES.SUBSCRIBE_ERROR);
        console.error("Subscribe error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [symbolInput, subscribeSymbol, addError, isSubscribed]
  );

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

        {internalError && (
          <div className="error-message" role="alert">
            {internalError}
          </div>
        )}

        <div className="help-text">
          * 삼성전자: 005930, SK하이닉스: 000660, 카카오: 035720
        </div>
      </form>
    </div>
  );
});

SymbolSubscriptionManager.displayName = "SymbolSubscriptionManager";

export default SymbolSubscriptionManager;
