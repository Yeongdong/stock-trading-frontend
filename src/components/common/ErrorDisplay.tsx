import React, { memo } from "react";
import { ErrorDisplayProps } from "@/types";
import styles from "./ErrorDisplay.module.css";

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ error, title = "오류 발생", onRetry }) => (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon} aria-hidden="true">
        ⚠️
      </div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton} type="button">
          다시 시도
        </button>
      )}
    </div>
  )
);

ErrorDisplay.displayName = "ErrorDisplay";

export default ErrorDisplay;
