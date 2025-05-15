import React from "react";
import { useError } from "../../contexts/ErrorContext";
import { ErrorItemProps } from "@/types";

// 개별 오류 항목 컴포넌트
const ErrorItem: React.FC<ErrorItemProps> = ({ error, onDismiss }) => {
  const { id, message, severity } = error;

  return (
    <div className={`error-time ${severity}`}>
      <div className="error-content">
        <span className="error-icon">
          {severity === "error" ? "❌" : severity === "warning" ? "⚠️" : "ℹ️"}
        </span>
        <span className="error-message">{message}</span>
      </div>
      <button className="dissmiss-button" onClick={() => onDismiss(id)}>
        X
      </button>
    </div>
  );
};

// 오류 표시 컨테이너 컴포넌트
const ErrorDissplay: React.FC = () => {
  const { errors, removeError, clearErrors } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="error-container">
      {errors.map((error) => (
        <ErrorItem key={error.id} error={error} onDismiss={removeError} />
      ))}
      {errors.length > 1 && (
        <button className="clear-all-button" onClick={clearErrors}>
          모든 알림 닫기
        </button>
      )}
    </div>
  );
};

export default ErrorDissplay;
