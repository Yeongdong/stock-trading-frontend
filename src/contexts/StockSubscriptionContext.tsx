"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useMemo,
  ReactNode,
} from "react";
import { useError } from "./ErrorContext";
import { realtimeApiService } from "@/services/api/realtime/realtimeApiService";
import {
  SubscriptionAction,
  SubscriptionContextType,
  SubscriptionState,
} from "@/types/domains/realtime/context";

const initialState: SubscriptionState = {
  subscribedSymbols: [],
  isLoading: false,
  error: null,
};

// 최대 구독 종목 수 제한
const MAX_SUBSCRIPTION_COUNT = 30;

function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  try {
    switch (action.type) {
      case "SET_SUBSCRIPTIONS": {
        const symbols = Array.isArray(action.payload) ? action.payload : [];
        const validSymbols = symbols.filter(
          (symbol) => typeof symbol === "string" && symbol.trim().length > 0
        );

        return {
          ...state,
          subscribedSymbols: validSymbols.slice(0, MAX_SUBSCRIPTION_COUNT),
        };
      }

      case "ADD_SUBSCRIPTION": {
        const symbol = action.payload;

        if (
          !symbol ||
          typeof symbol !== "string" ||
          symbol.trim().length === 0
        ) {
          console.warn("Invalid symbol for subscription:", symbol);
          return state;
        }

        if (state.subscribedSymbols.includes(symbol)) return state;

        // 최대 구독 수 체크
        if (state.subscribedSymbols.length >= MAX_SUBSCRIPTION_COUNT) {
          console.warn(
            `Maximum subscription limit (${MAX_SUBSCRIPTION_COUNT}) reached`
          );
          return state;
        }

        return {
          ...state,
          subscribedSymbols: [...state.subscribedSymbols, symbol],
        };
      }

      case "REMOVE_SUBSCRIPTION": {
        const symbol = action.payload;

        if (!symbol || !state.subscribedSymbols.includes(symbol)) return state;

        return {
          ...state,
          subscribedSymbols: state.subscribedSymbols.filter(
            (s) => s !== symbol
          ),
        };
      }

      case "SET_LOADING":
        return { ...state, isLoading: action.payload };

      case "SET_ERROR":
        return { ...state, error: action.payload };

      default:
        return state;
    }
  } catch (error) {
    console.error("Subscription reducer error:", error);
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
        const response = await realtimeApiService.getSubscriptions();

        if (response.error) {
          dispatch({ type: "SET_SUBSCRIPTIONS", payload: [] });
          return;
        }

        const symbols = response.data?.symbols || [];
        dispatch({ type: "SET_SUBSCRIPTIONS", payload: symbols });
      } catch (error) {
        console.error("Load subscriptions error:", error);
        dispatch({ type: "SET_SUBSCRIPTIONS", payload: [] });
      }
    };

    loadSubscriptions();
  }, []);

  // 종목 구독
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        if (
          !symbol ||
          typeof symbol !== "string" ||
          symbol.trim().length === 0
        ) {
          console.warn("Invalid symbol for subscription:", symbol);
          return false;
        }

        const trimmedSymbol = symbol.trim();

        // 이미 구독중인지 확인
        if (state.subscribedSymbols.includes(trimmedSymbol)) return true;

        // 최대 구독 수 체크
        if (state.subscribedSymbols.length >= MAX_SUBSCRIPTION_COUNT) {
          addError({
            message: `최대 ${MAX_SUBSCRIPTION_COUNT}개 종목까지만 구독 가능합니다.`,
            severity: "warning",
          });
          return false;
        }

        dispatch({ type: "SET_LOADING", payload: true });

        const response = await realtimeApiService.subscribeSymbol(
          trimmedSymbol
        );

        if (response.error) return false;

        dispatch({ type: "ADD_SUBSCRIPTION", payload: trimmedSymbol });

        return true;
      } catch (error) {
        console.error("Subscribe symbol error:", error);
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.subscribedSymbols, addError]
  );

  const unsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        if (
          !symbol ||
          typeof symbol !== "string" ||
          symbol.trim().length === 0
        ) {
          console.warn("Invalid symbol for unsubscription:", symbol);
          return false;
        }

        const trimmedSymbol = symbol.trim();

        if (!state.subscribedSymbols.includes(trimmedSymbol)) return true;

        dispatch({ type: "SET_LOADING", payload: true });

        const response = await realtimeApiService.unsubscribeSymbol(
          trimmedSymbol
        );

        if (response.error) return false;

        dispatch({ type: "REMOVE_SUBSCRIPTION", payload: trimmedSymbol });

        return true;
      } catch (error) {
        console.error("Unsubscribe symbol error:", error);
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.subscribedSymbols]
  );

  // 구독 여부 확인
  const isSubscribed = useCallback(
    (symbol: string): boolean => {
      try {
        if (!symbol || typeof symbol !== "string") return false;

        return state.subscribedSymbols.includes(symbol.trim());
      } catch (error) {
        console.error("Check subscription error:", error);
        return false;
      }
    },
    [state.subscribedSymbols]
  );

  // 모든 구독 취소
  const clearAllSubscriptions = useCallback(async (): Promise<boolean> => {
    try {
      const symbols = [...state.subscribedSymbols];
      let allSuccess = true;

      for (const symbol of symbols) {
        const success = await unsubscribeSymbol(symbol);
        if (!success) allSuccess = false;
      }

      return allSuccess;
    } catch (error) {
      console.error("Clear all subscriptions error:", error);
      return false;
    }
  }, [state.subscribedSymbols, unsubscribeSymbol]);

  const contextValue = useMemo(
    () => ({
      subscribedSymbols: state.subscribedSymbols,
      isLoading: state.isLoading,
      error: state.error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
      clearAllSubscriptions,
    }),
    [
      state.subscribedSymbols,
      state.isLoading,
      state.error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
      clearAllSubscriptions,
    ]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useStockSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined)
    throw new Error(
      "useStockSubscription must be used within a StockSubscriptionProvider"
    );

  return context;
};
