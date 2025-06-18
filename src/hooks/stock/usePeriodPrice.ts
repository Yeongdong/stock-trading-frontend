import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { stockService } from "@/services/api/stock/stockService";
import {
  PeriodPriceRequest,
  PeriodPriceResponse,
} from "@/types/domains/stock/price";
import { ErrorHandler } from "@/utils/errorHandler";
import { ERROR_CODES, StandardError } from "@/types/common/error";

export const usePeriodPrice = () => {
  const [data, setData] = useState<PeriodPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchPeriodPrice = useCallback(
    async (request: PeriodPriceRequest) => {
      if (!request.stockCode?.trim()) {
        const validationError: StandardError = {
          code: ERROR_CODES.VALIDATION_REQUIRED,
          message: "종목코드: 필수 입력 항목입니다",
          severity: "warning",
        };
        setError(validationError.message);
        addError({
          message: validationError.message,
          code: validationError.code,
          severity: validationError.severity,
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await stockService.getPeriodPrice(request);

        if (response.error) {
          const standardError: StandardError = {
            code: ERROR_CODES.BUSINESS_ORDER_FAIL,
            message: response.error,
            severity: "error",
          };
          throw standardError;
        }

        setData(response.data || null);
      } catch (error) {
        const standardError = ErrorHandler.standardize(error);

        setError(standardError.message);
        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });
      } finally {
        setLoading(false);
      }
    },
    [addError]
  );

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchPeriodPrice,
    clearData,
  };
};
