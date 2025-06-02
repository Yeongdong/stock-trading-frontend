"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { realtimeApiService } from "@/services/api";
import {
  SubscriptionAction,
  SubscriptionState,
  SubscriptionContextType,
} from "@/types/contexts/stockData";

const initialState: SubscriptionState = {
  subscribedSymbols: [],
  isLoading: false,
  error: null,
};

function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  switch (action.type) {
    case "SET_SUBSCRIPTIONS":
      console.log("📝 [SubscriptionContext] 구독 목록 설정:", action.payload);
      return { ...state, subscribedSymbols: action.payload };

    case "ADD_SUBSCRIPTION":
      console.log("➕ [SubscriptionContext] 구독 추가:", action.payload);
      return {
        ...state,
        subscribedSymbols: state.subscribedSymbols.includes(action.payload)
          ? state.subscribedSymbols
          : [...state.subscribedSymbols, action.payload],
      };

    case "REMOVE_SUBSCRIPTION":
      console.log("➖ [SubscriptionContext] 구독 제거:", action.payload);
      return {
        ...state,
        subscribedSymbols: state.subscribedSymbols.filter(
          (s) => s !== action.payload
        ),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const StockSubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const { addError } = useError();

  // 초기 구독 목록 로드
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        console.log("🔄 [SubscriptionContext] 서버에서 구독 목록 로드 시작");

        const response = await realtimeApiService.getSubscriptions();
        if (response.data?.symbols) {
          console.log(
            "📊 [SubscriptionContext] 서버 구독 목록:",
            response.data.symbols
          );
          dispatch({
            type: "SET_SUBSCRIPTIONS",
            payload: response.data.symbols,
          });
        } else {
          console.log("📊 [SubscriptionContext] 서버에서 빈 구독 목록 받음");
          dispatch({ type: "SET_SUBSCRIPTIONS", payload: [] });
        }
      } catch (error) {
        console.error("❌ [SubscriptionContext] 구독 목록 로드 실패:", error);
        // 에러가 있어도 빈 배열로 초기화
        dispatch({ type: "SET_SUBSCRIPTIONS", payload: [] });
      }
    };

    loadSubscriptions();
  }, []);

  // 종목 구독
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (state.subscribedSymbols.includes(symbol)) {
        console.log(`⚠️ [SubscriptionContext] ${symbol} 이미 구독 중`);
        return true;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        console.log(`🔄 [SubscriptionContext] ${symbol} 구독 요청`);

        const response = await realtimeApiService.subscribeSymbol(symbol);
        if (response.error) throw new Error(response.error);

        dispatch({ type: "ADD_SUBSCRIPTION", payload: symbol });

        console.log(`✅ [SubscriptionContext] ${symbol} 구독 성공`);
        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`❌ [SubscriptionContext] ${symbol} 구독 실패:`, msg);

        dispatch({ type: "SET_ERROR", payload: `종목 구독 실패: ${msg}` });
        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.subscribedSymbols, addError]
  );

  // 종목 구독 취소
  const unsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (!state.subscribedSymbols.includes(symbol)) {
        console.log(`⚠️ [SubscriptionContext] ${symbol} 구독하지 않은 종목`);
        return true;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        console.log(`🔄 [SubscriptionContext] ${symbol} 구독 취소 요청`);

        const response = await realtimeApiService.unsubscribeSymbol(symbol);
        if (response.error) throw new Error(response.error);

        dispatch({ type: "REMOVE_SUBSCRIPTION", payload: symbol });

        console.log(`✅ [SubscriptionContext] ${symbol} 구독 취소 성공`);
        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(
          `❌ [SubscriptionContext] ${symbol} 구독 취소 실패:`,
          msg
        );

        dispatch({ type: "SET_ERROR", payload: `종목 구독 취소 실패: ${msg}` });
        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.subscribedSymbols, addError]
  );

  // 구독 여부 확인
  const isSubscribed = useCallback(
    (symbol: string): boolean => {
      return state.subscribedSymbols.includes(symbol);
    },
    [state.subscribedSymbols]
  );

  const value = {
    ...state,
    subscribeSymbol,
    unsubscribeSymbol,
    isSubscribed,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useStockSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useStockSubscription must be used within a StockSubscriptionProvider"
    );
  }
  return context;
};
