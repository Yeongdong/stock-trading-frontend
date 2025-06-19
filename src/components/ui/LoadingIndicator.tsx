import React from "react";
import styles from "./LoadingIndicator.module.css";
import { LoadingIndicatorProps } from "@/types";

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "데이터를 불러오는 중...",
  className = "",
}) => {
  return (
    <div
      className={`${styles.container} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="로딩 중"
    >
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingIndicator;
