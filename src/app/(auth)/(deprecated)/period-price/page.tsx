/* 현재 사용하지 않는 페이지 - 기간별 시세
"use client";

import React, { useState } from "react";
import PeriodPriceChart from "@/components/features/stock/PeriodPriceChart";
import { StockSearchResult } from "@/types/stock/search";
import styles from "./page.module.css";
import { stockService } from "@/services/api";

interface StockInfo {
  code: string;
  name: string;
}

export default function PeriodPricePage() {
  const [selectedStock, setSelectedStock] = useState<StockInfo>({
    code: "005930",
    name: "삼성전자",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await stockService.searchStocks({
        searchTerm: term,
        page: 1,
        pageSize: 10,
      });
      setSearchResults(response.results);
      setShowResults(true);
    } catch (error) {
      console.error("주식 검색 실패:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock({
      code: stock.code,
      name: stock.name,
    });
    setSearchTerm("");
    setShowResults(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 디바운싱을 위한 타이머
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const popularStocks = [
    { code: "005930", name: "삼성전자" },
    { code: "000660", name: "SK하이닉스" },
    { code: "035420", name: "NAVER" },
    { code: "005380", name: "현대차" },
    { code: "006400", name: "삼성SDI" },
    { code: "051910", name: "LG화학" },
    { code: "068270", name: "셀트리온" },
    { code: "035720", name: "카카오" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>기간별 주식 시세</h1>
        <p className={styles.description}>
          원하는 종목의 일봉, 주봉, 월봉, 년봉 차트를 확인해보세요.
        </p>
      </div>

      <div className={styles.stockSelector}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="종목명 또는 종목코드를 입력하세요 (예: 삼성전자, 005930)"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
            />
            {isSearching && (
              <div className={styles.searchSpinner}>검색중...</div>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => handleStockSelect(stock)}
                  className={styles.searchResultItem}
                >
                  <span className={styles.stockName}>{stock.name}</span>
                  <span className={styles.stockCode}>{stock.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.popularStocks}>
          <h3>인기 종목</h3>
          <div className={styles.stockButtons}>
            {popularStocks.map((stock) => (
              <button
                key={stock.code}
                onClick={() => setSelectedStock(stock)}
                className={`${styles.stockButton} ${
                  selectedStock.code === stock.code ? styles.selected : ""
                }`}
              >
                {stock.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.selectedStock}>
        <h2>
          선택된 종목: {selectedStock.name} ({selectedStock.code})
        </h2>
      </div>

      <div className={styles.chartSection}>
        <PeriodPriceChart
          stockCode={selectedStock.code}
          stockName={selectedStock.name}
        />
      </div>
    </div>
  );
}
*/
