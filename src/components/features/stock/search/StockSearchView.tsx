import React, { useEffect } from "react";
import StockSearchForm from "./StockSearchForm";
import StockSearchResults from "./StockSearchResults";
import { useStockSearch } from "@/hooks/stock/useStockSearch";
import styles from "./StockSearchView.module.css";
import { StockSearchViewProps } from "@/types";

const StockSearchView: React.FC<StockSearchViewProps> = ({ onStockSelect }) => {
  const stockSearchHook = useStockSearch();
  const { summary, getSearchSummary } = stockSearchHook;

  useEffect(() => {
    getSearchSummary();
  }, [getSearchSummary]);

  return (
    <div className={styles.stockSearchView}>
      <div className={styles.searchHeader}>
        <h2>주식 종목 검색</h2>
        {summary && (
          <div className={styles.searchSummary}>
            <span>
              전체 {summary.totalStocks?.toLocaleString() || 0}개 종목
            </span>
            <span>KOSPI: {summary.kospiCount?.toLocaleString() || 0}</span>
            <span>KOSDAQ: {summary.kosdaqCount?.toLocaleString() || 0}</span>
            <span>KONEX: {summary.konexCount?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>

      <div className={styles.searchContent}>
        <StockSearchForm stockSearchHook={stockSearchHook} />
        <StockSearchResults
          stockSearchHook={stockSearchHook}
          onStockSelect={onStockSelect}
        />
      </div>
    </div>
  );
};

export default StockSearchView;
