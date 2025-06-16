import React, { memo } from "react";
import { SymbolInputFormProps } from "@/types";
import styles from "./SymbolInputForm.module.css";

const SymbolInputForm: React.FC<SymbolInputFormProps> = memo(
  ({ symbolInput, onInputChange, onSubmit, isLoading, error }) => (
    <form onSubmit={onSubmit} className={styles.subscriptionForm}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={symbolInput}
          onChange={onInputChange}
          placeholder="종목 코드 (예: 005930)"
          disabled={isLoading}
          aria-label="종목 코드 입력"
          aria-invalid={!!error}
          aria-describedby={error ? "symbol-error" : undefined}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading || !symbolInput.trim()}
          aria-label="종목 구독"
          className={styles.submitButton}
        >
          {isLoading ? "처리중..." : "구독"}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert" id="symbol-error">
          {error}
        </div>
      )}

      <div className={styles.helpText}>
        * 삼성전자: 005930, SK하이닉스: 000660, 카카오: 035720
      </div>
    </form>
  )
);

SymbolInputForm.displayName = "SymbolInputForm";

export default SymbolInputForm;
