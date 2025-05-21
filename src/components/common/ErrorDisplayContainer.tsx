import React from "react";
import { useError } from "@/contexts/ErrorContext";
import ErrorDisplay from "./ErrorDisplay";

const ErrorDisplayContainer: React.FC = () => {
  const { errors } = useError();

  if (errors.length === 0) return null;

  const latestError = errors[errors.length - 1];

  return <ErrorDisplay error={latestError.message} />;
};

export default ErrorDisplayContainer;
