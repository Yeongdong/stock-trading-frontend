import React, { memo, useState, useEffect } from "react";
import styles from "./MarketOverview.module.css";

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changeRate: number;
}

interface TopStock {
  rank: number;
  name: string;
  code: string;
  price: number;
  changeRate: number;
}

interface MarketStats {
  rising: number;
  falling: number;
  unchanged: number;
}

const MarketOverview: React.FC = memo(() => {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    rising: 0,
    falling: 0,
    unchanged: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 가져와야 하지만, 현재는 목업 데이터 사용
    const loadMarketData = () => {
      // 주요 지수 목업 데이터
      const indices: MarketIndex[] = [
        { name: "KOSPI", value: 2640.15, change: 31.2, changeRate: 1.2 },
        { name: "KOSDAQ", value: 870.25, change: 6.9, changeRate: 0.8 },
        { name: "KRX100", value: 196.8, change: 2.1, changeRate: 1.1 },
      ];

      // 거래량/등락률 TOP 5 목업 데이터
      const topStockData: TopStock[] = [
        {
          rank: 1,
          name: "삼성전자",
          code: "005930",
          price: 76000,
          changeRate: 2.1,
        },
        {
          rank: 2,
          name: "SK하이닉스",
          code: "000660",
          price: 140500,
          changeRate: 3.2,
        },
        {
          rank: 3,
          name: "LG에너지솔루션",
          code: "373220",
          price: 420000,
          changeRate: -1.5,
        },
        {
          rank: 4,
          name: "카카오",
          code: "035720",
          price: 48950,
          changeRate: 0.9,
        },
        {
          rank: 5,
          name: "NAVER",
          code: "035420",
          price: 185000,
          changeRate: 1.8,
        },
      ];

      // 장 상황 목업 데이터
      const stats: MarketStats = {
        rising: 1245,
        falling: 892,
        unchanged: 183,
      };

      setMarketIndices(indices);
      setTopStocks(topStockData);
      setMarketStats(stats);
      setIsLoading(false);
    };

    // 실제 API 호출 대신 목업 데이터 로드
    setTimeout(loadMarketData, 500);
  }, []);

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const formatChange = (change: number): string => {
    return change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  };

  const formatChangeRate = (rate: number): string => {
    return rate > 0 ? `+${rate.toFixed(1)}%` : `${rate.toFixed(1)}%`;
  };

  const getChangeClass = (value: number): string => {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  };

  if (isLoading) {
    return (
      <section className={styles.marketOverview}>
        <h2 className={styles.sectionTitle}>📈 오늘의 시장 현황</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>시장 현황을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.marketOverview}>
      <h2 className={styles.sectionTitle}>📈 오늘의 시장 현황</h2>

      <div className={styles.contentContainer}>
        {/* 좌측: 주요 지수 */}
        <div className={styles.indicesSection}>
          <h3 className={styles.subsectionTitle}>📊 주요 지수</h3>

          <div className={styles.indicesList}>
            {marketIndices.map((index) => (
              <div key={index.name} className={styles.indexItem}>
                <div className={styles.indexName}>{index.name}</div>
                <div className={styles.indexValue}>
                  <span className={styles.price}>
                    {formatPrice(index.value)}
                  </span>
                  <span
                    className={`${styles.change} ${
                      styles[getChangeClass(index.changeRate)]
                    }`}
                  >
                    {formatChangeRate(index.changeRate)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.marketStatsSection}>
            <h4 className={styles.statsTitle}>📊 장 상황</h4>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>상승:</span>
                <span className={`${styles.statValue} ${styles.positive}`}>
                  {marketStats.rising.toLocaleString()}종목
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>하락:</span>
                <span className={`${styles.statValue} ${styles.negative}`}>
                  {marketStats.falling.toLocaleString()}종목
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>보합:</span>
                <span className={`${styles.statValue} ${styles.neutral}`}>
                  {marketStats.unchanged.toLocaleString()}종목
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 거래량/등락률 TOP 5 */}
        <div className={styles.topStocksSection}>
          <div className={styles.topStocksHeader}>
            <h3 className={styles.subsectionTitle}>🏆 거래량/등락률 TOP 5</h3>
            <button className={styles.moreButton}>더보기 →</button>
          </div>

          <div className={styles.topStocksList}>
            {topStocks.map((stock) => (
              <div key={stock.code} className={styles.topStockItem}>
                <div className={styles.stockRank}>{stock.rank}.</div>
                <div className={styles.stockInfo}>
                  <div className={styles.stockName}>{stock.name}</div>
                  <div className={styles.stockCode}>({stock.code})</div>
                </div>
                <div className={styles.stockPrice}>
                  <div className={styles.price}>
                    {formatPrice(stock.price)}원
                  </div>
                  <div
                    className={`${styles.changeRate} ${
                      styles[getChangeClass(stock.changeRate)]
                    }`}
                  >
                    {formatChangeRate(stock.changeRate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

MarketOverview.displayName = "MarketOverview";

export default MarketOverview;
