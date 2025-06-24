// 임시 컴포넌트 - 추후 구현

import React, { useState } from "react";
import {
  OverseasMarket,
  OVERSEAS_MARKETS,
} from "@/types/domains/stock/overseas";
import styles from "./OverseasStockSearch.module.css";

interface OverseasStockSearchProps {
  onStockSelect: (stock: {
    code: string;
    name: string;
    market: OverseasMarket;
  }) => void;
}

const OverseasStockSearch: React.FC<OverseasStockSearchProps> = ({
  onStockSelect,
}) => {
  const [selectedMarket, setSelectedMarket] =
    useState<OverseasMarket>("nasdaq");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    // 임시 데이터 - 추후 실제 API 연동
    onStockSelect({
      code: searchTerm.toUpperCase(),
      name: `${searchTerm.toUpperCase()} Company`,
      market: selectedMarket,
    });
  };

  return (
    <div className={styles.overseasStockSearch}>
      <h2>해외 주식 검색</h2>

      <div className={styles.searchForm}>
        <div className={styles.marketSelector}>
          <label>거래소</label>
          <select
            value={selectedMarket}
            onChange={(e) =>
              setSelectedMarket(e.target.value as OverseasMarket)
            }
            className={styles.select}
          >
            {Object.entries(OVERSEAS_MARKETS).map(([key, market]) => (
              <option key={key} value={key}>
                {market.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.searchInput}>
          <label>종목 코드</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="AAPL, MSFT, GOOGL..."
              className={styles.input}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              검색
            </button>
          </div>
        </div>
      </div>

      <div className={styles.popularStocks}>
        <h3>인기 종목</h3>
        <div className={styles.stockGrid}>
          {["AAPL", "MSFT", "GOOGL", "TSLA"].map((stock) => (
            <button
              key={stock}
              onClick={() =>
                onStockSelect({
                  code: stock,
                  name: `${stock} Inc.`,
                  market: selectedMarket,
                })
              }
              className={styles.stockButton}
            >
              {stock}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverseasStockSearch;
