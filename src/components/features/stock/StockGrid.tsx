import React, { memo } from "react";
import StockPriceCard from "./StockPriceCard";
import { StockGridProps } from "@/types";

const StockGrid: React.FC<StockGridProps> = memo(({ symbols }) => (
  <div className="stock-grid">
    {symbols.map((symbol) => (
      <StockPriceCard key={symbol} symbol={symbol} />
    ))}
  </div>
));

StockGrid.displayName = "StockGrid";

export default StockGrid;
