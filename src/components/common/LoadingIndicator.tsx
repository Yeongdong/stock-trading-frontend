import React, { memo } from "react";
import { LoadingIndicatorProps } from "@/types";

const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(
  ({ message = "데이터를 불러오는 중..." }) => (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  )
);

LoadingIndicator.displayName = "LoadingIndicator";

export default LoadingIndicator;
