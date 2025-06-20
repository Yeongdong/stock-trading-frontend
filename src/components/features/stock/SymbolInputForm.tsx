import React, { useState, useCallback, useEffect } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import useDebounce from "@/hooks/common/useDebounce";
import { UI_MESSAGES, TIMINGS, ERROR_MESSAGES } from "@/constants";
import styles from "./SymbolInputForm.module.css";

const SYMBOL_PATTERN = /^\d{6}$/;

const SymbolInputForm: React.FC = () => {
  const { subscribeSymbol, isSubscribed } = useStockOperations();

  const [symbolInput, setSymbolInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedSymbolInput = useDebounce(symbolInput, TIMINGS.DEBOUNCE);

  // 디바운싱된 검증
  useEffect(() => {
    if (!debouncedSymbolInput) {
      setError("");
      return;
    }

    if (!SYMBOL_PATTERN.test(debouncedSymbolInput)) {
      setError(ERROR_MESSAGES.INVALID_SYMBOL);
      return;
    }

    if (isSubscribed(debouncedSymbolInput)) {
      setError("이미 구독 중인 종목입니다.");
      return;
    }

    setError("");
  }, [debouncedSymbolInput, isSubscribed]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setSymbolInput(value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedSymbol = symbolInput.trim();

      // 최종 검증
      if (!trimmedSymbol) {
        setError(ERROR_MESSAGES.REQUIRED_SYMBOL);
        return;
      }

      if (!SYMBOL_PATTERN.test(trimmedSymbol)) {
        setError(ERROR_MESSAGES.INVALID_SYMBOL);
        return;
      }

      if (isSubscribed(trimmedSymbol)) {
        setError("이미 구독 중인 종목입니다.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const success = await subscribeSymbol(trimmedSymbol);
        if (success) {
          setSymbolInput("");
        } else {
          setError(ERROR_MESSAGES.SUBSCRIBE_FAIL);
        }
      } catch (err) {
        console.error("Symbol subscription error:", err);
        setError(ERROR_MESSAGES.SUBSCRIBE_ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [symbolInput, subscribeSymbol, isSubscribed]
  );

  const isSubmitDisabled = isLoading || !symbolInput.trim() || !!error;

  return (
    <div className={styles.subscriptionContainer}>
      <h3 className={styles.title}>종목 구독</h3>

      <form onSubmit={handleSubmit} className={styles.subscriptionForm}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={symbolInput}
            onChange={handleInputChange}
            placeholder={UI_MESSAGES.STOCK_INPUT.PLACEHOLDER}
            disabled={isLoading}
            aria-label={UI_MESSAGES.STOCK_INPUT.ARIA_LABEL}
            aria-invalid={!!error}
            aria-describedby={error ? "symbol-error" : "symbol-help"}
            className={`${styles.input} ${error ? styles.inputError : ""}`}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            aria-label={UI_MESSAGES.STOCK_INPUT.ARIA_SUBMIT}
            className={styles.submitButton}
          >
            {isLoading
              ? UI_MESSAGES.STOCK_INPUT.SUBMIT_LOADING
              : UI_MESSAGES.STOCK_INPUT.SUBMIT_DEFAULT}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert" id="symbol-error">
            {error}
          </div>
        )}

        <div className={styles.helpText} id="symbol-help">
          {UI_MESSAGES.STOCK_INPUT.HELP_TEXT}
        </div>
      </form>
    </div>
  );
};

export default SymbolInputForm;
