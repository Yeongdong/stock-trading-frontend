import { useState, useCallback, useEffect } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { ERROR_MESSAGES, TIMINGS } from "@/constants";
import useDebounce from "@/hooks/common/useDebounce";
import { SymbolSubscriptionResult } from "@/types";

export const useSymbolSubscription = (): SymbolSubscriptionResult => {
  const { subscribeSymbol, isSubscribed } = useStockOperations();

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
        return false;
      }

      if (isSubscribed(symbol)) {
        setError("이미 구독 중인 종목입니다.");
        return false;
      }

      return true;
    },
    [isSubscribed]
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

      setIsLoading(true);
      try {
        const success = await subscribeSymbol(trimmedSymbol);
        if (success) {
          setSymbolInput("");
        } else {
          setError(ERROR_MESSAGES.SUBSCRIBE_FAIL);
        }
      } catch (err) {
        console.error(err);
        setError(ERROR_MESSAGES.SUBSCRIBE_ERROR);
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
