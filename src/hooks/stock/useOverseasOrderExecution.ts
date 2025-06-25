import { useState, useCallback } from "react";
import { stockService } from "@/services/api/stock/stockService";
import { OverseasOrderExecutionItem } from "@/types/domains/stock/overseas-order";

interface UseOverseasOrderExecutionResult {
  executions: OverseasOrderExecutionItem[];
  isLoading: boolean;
  error: string | null;
  fetchExecutions: (startDate: string, endDate: string) => Promise<void>;
  clearExecutions: () => void;
}

export const useOverseasOrderExecution =
  (): UseOverseasOrderExecutionResult => {
    const [executions, setExecutions] = useState<OverseasOrderExecutionItem[]>(
      []
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExecutions = useCallback(
      async (startDate: string, endDate: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        const response = await stockService.getOverseasOrderExecutions(
          startDate,
          endDate
        );

        if (response.data && !response.error) {
          // API 응답이 배열이 아닐 수 있으므로 확인 후 설정
          const executionsArray = Array.isArray(response.data)
            ? response.data
            : [];
          setExecutions(
            executionsArray.filter((item) => item.pdno && item.prdt_name)
          ); // 유효한 데이터만 필터링
        } else {
          setError("해외 주문체결내역 조회에 실패했습니다.");
          setExecutions([]);
        }

        setIsLoading(false);
      },
      []
    );

    const clearExecutions = useCallback((): void => {
      setExecutions([]);
      setError(null);
    }, []);

    return {
      executions,
      isLoading,
      error,
      fetchExecutions,
      clearExecutions,
    };
  };
