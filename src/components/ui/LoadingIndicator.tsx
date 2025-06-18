import React, { memo } from "react";
import styles from "./LoadingIndicator.module.css";
import { LoadingIndicatorProps } from "@/types";

const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(
  ({
    message = "데이터를 불러오는 중...",
    size = "default",
    variant = "default",
  }) => {
    const getClassName = () => {
      let className = styles.loadingIndicator;

      if (size === "small") className += ` ${styles.small}`;
      if (variant === "inline") className += ` ${styles.inline}`;

      return className;
    };

    return (
      <div
        className={getClassName()}
        role="status"
        aria-live="polite"
        aria-label="로딩 중"
      >
        <div className={styles.loadingSpinner} aria-hidden="true"></div>
        <p className={styles.loadingMessage}>{message}</p>
      </div>
    );
  }
);

LoadingIndicator.displayName = "LoadingIndicator";

export default LoadingIndicator;
