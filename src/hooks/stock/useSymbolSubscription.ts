import { useState, useCallback, useEffect } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { ERROR_MESSAGES, TIMINGS } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import useDebounce from "@/hooks/common/useDebounce";
import { SymbolSubscriptionResult } from "@/types";

export const useSymbolSubscription = (): SymbolSubscriptionResult => {
  const { subscribeSymbol, isSubscribed } = useStockOperations();
  const { addError } = useError();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [symbolInput, setSymbolInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const debouncedSymbolInput = useDebounce(symbolInput, TIMINGS.DEBOUNCE);

  // 입력값 유효성 검사
  const validateSymbol = useCallback(
    (symbol: string): boolean => {
      if (!symbol.trim()) {
        setError(ERROR_MESSAGES.REQUIRED_SYMBOL);
        return false;
      }

      if (!/^\d{6}$/.test(symbol)) {
        setError(ERROR_MESSAGES.INVALID_SYMBOL);
        addError({
          message: ERROR_MESSAGES.INVALID_SYMBOL,
          severity: "warning",
        });
        return false;
      }

      if (isSubscribed(symbol)) {
        setError("이미 구독 중인 종목입니다.");
        return false;
      }

      return true;
    },
    [isSubscribed, addError]
  );

  // 디바운스된 입력값 검증
  useEffect(() => {
    if (debouncedSymbolInput && !/^\d{6}$/.test(debouncedSymbolInput)) {
      setError(ERROR_MESSAGES.INVALID_SYMBOL);
    } else if (debouncedSymbolInput && isSubscribed(debouncedSymbolInput)) {
      setError("이미 구독 중인 종목입니다.");
    } else if (debouncedSymbolInput) {
      setError("");
    }
  }, [debouncedSymbolInput, isSubscribed]);

  // 입력 처리 함수
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSymbolInput(value);

      // 사용자가 타이핑 중일 때는 에러 메시지 초기화
      if (error) setError("");
    },
    [error]
  );

  // 종목 구독 처리
  const handleSubscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedSymbol = symbolInput.trim();
      if (!validateSymbol(trimmedSymbol)) return;

      try {
        setIsLoading(true);
        const success = await subscribeSymbol(trimmedSymbol);
        if (success) {
          setSymbolInput("");
        } else {
          setError(ERROR_MESSAGES.SUBSCRIBE_FAIL);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.SUBSCRIBE_ERROR);
        console.error("Subscribe error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [symbolInput, subscribeSymbol, validateSymbol]
  );

  return {
    symbolInput,
    setSymbolInput,
    isLoading,
    error,
    handleInputChange,
    handleSubscribe,
    validateSymbol,
  };
};
