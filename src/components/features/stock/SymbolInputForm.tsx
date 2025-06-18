import React, { memo } from "react";
import { UI_MESSAGES } from "@/constants";
import styles from "./SymbolInputForm.module.css";
import { SymbolInputFormProps } from "@/types";

const SymbolInputForm: React.FC<SymbolInputFormProps> = memo(
  ({ symbolInput, onInputChange, onSubmit, isLoading, error }) => (
    <form onSubmit={onSubmit} className={styles.subscriptionForm}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={symbolInput}
          onChange={onInputChange}
          placeholder={UI_MESSAGES.STOCK_INPUT.PLACEHOLDER}
          disabled={isLoading}
          aria-label={UI_MESSAGES.STOCK_INPUT.ARIA_LABEL}
          aria-invalid={!!error}
          aria-describedby={error ? "symbol-error" : undefined}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading || !symbolInput.trim()}
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

      <div className={styles.helpText}>{UI_MESSAGES.STOCK_INPUT.HELP_TEXT}</div>
    </form>
  )
);

SymbolInputForm.displayName = "SymbolInputForm";

export default SymbolInputForm;
