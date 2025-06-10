import React, { memo } from "react";
import StockPriceCard from "./StockPriceCard";
import { StockGridProps } from "@/types";
import styles from "./StockGrid.module.css";

const StockGrid: React.FC<StockGridProps> = memo(({ symbols }) => (
  <div className={styles.stockGrid}>
    {symbols.map((symbol) => (
      <StockPriceCard key={symbol} symbol={symbol} />
    ))}
  </div>
));

StockGrid.displayName = "StockGrid";

export default StockGrid;
