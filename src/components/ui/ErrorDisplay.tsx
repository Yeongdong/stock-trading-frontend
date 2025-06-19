import React from "react";
import styles from "./ErrorDisplay.module.css";
import { ErrorDisplayProps } from "@/types";

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  title = "오류 발생",
  onRetry,
  className = "",
}) => {
  return (
    <div className={`${styles.container} ${className}`} role="alert">
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton} type="button">
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
