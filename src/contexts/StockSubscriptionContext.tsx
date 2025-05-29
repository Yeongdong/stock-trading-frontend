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
import { ERROR_MESSAGES } from "@/constants";
import { realtimeApiService } from "@/services/api";
import {
  SubscriptionAction,
  SubscriptionState,
  SubscriptionActions,
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
      return {
        ...state,
        subscribedSymbols: action.payload,
      };
    case "ADD_SUBSCRIPTION":
      if (state.subscribedSymbols.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        subscribedSymbols: [...state.subscribedSymbols, action.payload],
      };
    case "REMOVE_SUBSCRIPTION":
      return {
        ...state,
        subscribedSymbols: state.subscribedSymbols.filter(
          (s) => s !== action.payload
        ),
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "INITIALIZE_SUBSCRIPTIONS":
      return {
        ...state,
        subscribedSymbols: action.payload,
      };
    default:
      return state;
  }
}

const SubscriptionStateContext = createContext<SubscriptionState | undefined>(
  undefined
);
const SubscriptionActionsContext = createContext<
  SubscriptionActions | undefined
>(undefined);

const saveSubscriptions = (symbols: string[]) => {
  try {
    localStorage.setItem("subscribed_symbols", JSON.stringify(symbols));
  } catch (error) {
    console.error("구독 목록 저장 중 오류:", error);
  }
};

const loadSubscriptions = (): string[] => {
  try {
    const savedSymbols = localStorage.getItem("subscribed_symbols");
    return savedSymbols ? JSON.parse(savedSymbols) : [];
  } catch (error) {
    console.error("구독 목록 로드 중 오류", error);
    return [];
  }
};

export const StockSubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const { addError } = useError();

  useEffect(() => {
    const savedSymbols = loadSubscriptions();
    dispatch({ type: "SET_SUBSCRIPTIONS", payload: savedSymbols });
  }, []);

  const fetchSubscriptionsFromServer = useCallback(async () => {
    try {
      const response = await realtimeApiService.getSubscriptions();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.symbols || [];
    } catch (error) {
      console.error("서버 구독 목록 조회 중 오류:", error);
      return [];
    }
  }, []);

  const initializeSubscriptions = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const serverSubscriptions = await fetchSubscriptionsFromServer();

      // 로컬 구독 목록과 서버 구독 목록 비교 및 동기화
      const localOnly = state.subscribedSymbols.filter(
        (s) => !serverSubscriptions.includes(s)
      );
      const serverOnly = serverSubscriptions.filter(
        (s) => !state.subscribedSymbols.includes(s)
      );

      // 서버에 없는 로컬 구독 추가
      for (const symbol of localOnly) {
        await realtimeApiService.subscribeSymbol(symbol);
      }

      const allSubscriptions = [...state.subscribedSymbols, ...serverOnly];

      // 상태 및 로컬 스토리지 업데이트
      dispatch({ type: "INITIALIZE_SUBSCRIPTIONS", payload: allSubscriptions });
      saveSubscriptions(allSubscriptions);

      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      dispatch({ type: "SET_ERROR", payload: `구독 초기화 실패: ${msg}` });
      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.subscribedSymbols, fetchSubscriptionsFromServer, addError]);

  useEffect(() => {
    if (state.subscribedSymbols.length === 0) {
      return;
    }
  }, [state.subscribedSymbols.length]);

  // 종목 구독
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (state.subscribedSymbols.includes(symbol)) {
        console.log(`이미 구독중인 종목: ${symbol}`);
        return true;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await realtimeApiService.subscribeSymbol(symbol);

        if (response.error) {
          throw new Error(response.error);
        }

        dispatch({ type: "ADD_SUBSCRIPTION", payload: symbol });
        saveSubscriptions([...state.subscribedSymbols, symbol]);

        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });

        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
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
        console.log(`구독 중이 아닌 종목: ${symbol}`);
        return true;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await realtimeApiService.unsubscribeSymbol(symbol);

        if (response.error) {
          throw new Error(response.error);
        }

        const updatedSymbols = state.subscribedSymbols.filter(
          (s) => s !== symbol
        );
        dispatch({ type: "REMOVE_SUBSCRIPTION", payload: symbol });
        saveSubscriptions(updatedSymbols);

        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });

        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
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

  const actions = useMemo(
    () => ({
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
      initializeSubscriptions,
    }),
    [subscribeSymbol, unsubscribeSymbol, isSubscribed, initializeSubscriptions]
  );

  return (
    <SubscriptionStateContext.Provider value={state}>
      <SubscriptionActionsContext.Provider value={actions}>
        {children}
      </SubscriptionActionsContext.Provider>
    </SubscriptionStateContext.Provider>
  );
};

export const useStockSubscriptionState = () => {
  const context = useContext(SubscriptionStateContext);
  if (context === undefined) {
    throw new Error(
      "useStockSubscriptionState must be used within a StockSubscriptionProvider"
    );
  }
  return context;
};

export const useStockSubscriptionActions = () => {
  const context = useContext(SubscriptionActionsContext);
  if (context === undefined) {
    throw new Error(
      "useStockSubscriptionActions must be used within a StockSubscriptionProvider"
    );
  }
  return context;
};

// 통합 훅
export const useStockSubscription = () => {
  return {
    ...useStockSubscriptionState(),
    ...useStockSubscriptionActions(),
  };
};
