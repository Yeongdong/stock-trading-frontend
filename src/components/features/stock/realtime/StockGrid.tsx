import React, { memo } from "react";
import { StockGridProps } from "@/types/components/stock";
import styles from "./StockGrid.module.css";
import StockPriceCard from "./StockPriceCard";

const StockGrid: React.FC<StockGridProps> = memo(({ symbols }) => (
  <div className={styles.stockGrid}>
    {symbols.map((symbol) => (
      <StockPriceCard key={symbol} symbol={symbol} />
    ))}
  </div>
));

StockGrid.displayName = "StockGrid";

export default StockGrid;
