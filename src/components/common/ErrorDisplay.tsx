import React, { memo } from "react";
import { ErrorDisplayProps } from "@/types";

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ error, title = "오류 발생", onRetry }) => (
    <div className="error-container" role="alert">
      <h3>{title}</h3>
      <p>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          다시 시도
        </button>
      )}
    </div>
  )
);

ErrorDisplay.displayName = "ErrorDisplay";

export default ErrorDisplay;
