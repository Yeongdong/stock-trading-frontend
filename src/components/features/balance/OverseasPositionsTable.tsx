import React from "react";
import { OverseasBalancePosition } from "@/types/domains/stock/overseas-balance";
import styles from "./OverseasPositionsTable.module.css";
import {
  formatCurrency,
  formatExchangeName,
  formatNumber,
} from "@/utils/formatters";

interface OverseasPositionsTableProps {
  positions: OverseasBalancePosition[];
}

const OverseasPositionsTable: React.FC<OverseasPositionsTableProps> = ({
  positions,
}) => {
  const getProfitLossClass = (profitLoss: string): string => {
    const value = parseFloat(profitLoss || "0");
    if (value > 0) return styles.positive;
    if (value < 0) return styles.negative;
    return styles.neutral;
  };

  const getExchangeName = (exchangeCode: string): string => {
    return formatExchangeName(exchangeCode);
  };

  const getLoanTypeName = (loanTypeCode: string): string => {
    const loanTypes: Record<string, string> = {
      "00": "해당사항없음",
      "10": "현금",
      "01": "자기융자일반형",
      "03": "자기융자투자형",
      // 필요한 대로 추가
    };
    return loanTypes[loanTypeCode] || loanTypeCode;
  };

  return (
    <div className={styles.tableContainer}>
      <h3 className={styles.tableTitle}>보유 종목 상세</h3>

      <div className={styles.tableWrapper}>
        <table className={styles.positionsTable}>
          <thead>
            <tr>
              <th>종목명</th>
              <th>거래소</th>
              <th>보유수량</th>
              <th>매입단가</th>
              <th>현재가</th>
              <th>매입금액</th>
              <th>평가금액</th>
              <th>평가손익</th>
              <th>수익률</th>
              <th>주문가능</th>
              <th>대출유형</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => {
              const profitLoss = parseFloat(position.profitLoss || "0");
              const profitLossRate = parseFloat(position.profitLossRate || "0");

              return (
                <tr key={`${position.stockCode}-${index}`}>
                  <td className={styles.stockInfo}>
                    <div className={styles.stockName}>{position.stockName}</div>
                    <div className={styles.stockCode}>{position.stockCode}</div>
                  </td>

                  <td className={styles.exchange}>
                    <span className={styles.exchangeName}>
                      {getExchangeName(position.exchangeCode)}
                    </span>
                    <span className={styles.currency}>
                      ({position.currencyCode})
                    </span>
                  </td>

                  <td className={styles.quantity}>
                    {formatNumber(parseInt(position.quantity || "0"))}
                  </td>

                  <td className={styles.price}>
                    {formatCurrency(
                      parseFloat(position.averagePrice || "0"),
                      position.currencyCode
                    )}
                  </td>

                  <td className={styles.price}>
                    {formatCurrency(
                      parseFloat(position.currentPrice || "0"),
                      position.currencyCode
                    )}
                  </td>

                  <td className={styles.amount}>
                    {formatCurrency(
                      parseFloat(position.purchaseAmount || "0"),
                      position.currencyCode
                    )}
                  </td>

                  <td className={styles.amount}>
                    {formatCurrency(
                      parseFloat(position.evaluationAmount || "0"),
                      position.currencyCode
                    )}
                  </td>

                  <td
                    className={`${styles.profitLoss} ${getProfitLossClass(
                      position.profitLoss
                    )}`}
                  >
                    {formatCurrency(profitLoss, position.currencyCode)}
                  </td>

                  <td
                    className={`${styles.profitLossRate} ${getProfitLossClass(
                      position.profitLossRate
                    )}`}
                  >
                    {profitLossRate >= 0 ? "+" : ""}
                    {profitLossRate.toFixed(2)}%
                  </td>

                  <td className={styles.quantity}>
                    {formatNumber(parseInt(position.orderableQuantity || "0"))}
                  </td>

                  <td className={styles.loanType}>
                    {getLoanTypeName(position.loanTypeCode)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverseasPositionsTable;
