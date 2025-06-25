import React from "react";
import styles from "./OverseasOrderExecutionTable.module.css";
import { OverseasOrderExecutionItem } from "@/types/domains/stock/overseas-order";
import {
  formatCurrency,
  formatExchangeName,
  formatNumber,
} from "@/utils/formatters";

interface OverseasOrderExecutionTableProps {
  executions: OverseasOrderExecutionItem[];
  isLoading: boolean;
}

const OverseasOrderExecutionTable: React.FC<
  OverseasOrderExecutionTableProps
> = ({ executions, isLoading }) => {
  const formatDateTime = (date: string, time: string): string => {
    if (!date || !time) return "-";
    // YYYYMMDD + HHMMSS 형식을 읽기 쉽게 변환
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);

    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  const getTradeTypeClass = (sllBuyDvsnCd: string): string => {
    if (sllBuyDvsnCd === "02") return "buy"; // 매수
    if (sllBuyDvsnCd === "01") return "sell"; // 매도
    return "neutral";
  };

  const getStatusClass = (prcsStatName: string): string => {
    if (prcsStatName === "완료") return "completed";
    if (prcsStatName === "거부") return "rejected";
    return "processing";
  };

  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>해외 주문체결내역을 조회하는 중...</p>
      </div>
    );

  if (!executions || executions.length === 0)
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h4>해외 주문체결내역</h4>
        </div>
        <div className={styles.emptyState}>
          <p>조회된 해외 주문체결내역이 없습니다.</p>
        </div>
      </div>
    );

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h4>해외 주문체결내역 (총 {executions.length}건)</h4>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.executionTable}>
          <thead>
            <tr>
              <th>주문일시</th>
              <th>종목명</th>
              <th>시장</th>
              <th>매매구분</th>
              <th>주문수량</th>
              <th>주문단가</th>
              <th>체결수량</th>
              <th>체결단가</th>
              <th>체결금액</th>
              <th>미체결수량</th>
              <th>처리상태</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution, index) => (
              <tr key={`${execution.odno || index}`}>
                <td className={styles.dateTime}>
                  {formatDateTime(execution.ord_dt, execution.ord_tmd)}
                </td>

                <td className={styles.stockInfo}>
                  <div className={styles.stockName}>{execution.prdt_name}</div>
                  <div className={styles.stockCode}>({execution.pdno})</div>
                </td>

                <td className={styles.market}>
                  <div className={styles.marketName}>
                    {formatExchangeName(execution.ovrs_excg_cd)}
                  </div>
                  <div className={styles.currency}>
                    ({execution.tr_crcy_cd})
                  </div>
                </td>

                <td>
                  <span
                    className={`${styles.tradeType} ${
                      styles[getTradeTypeClass(execution.sll_buy_dvsn_cd)]
                    }`}
                  >
                    {execution.sll_buy_dvsn_cd_name}
                  </span>
                </td>

                <td className={styles.number}>
                  {formatNumber(parseInt(execution.ft_ord_qty || "0"))}
                </td>

                <td className={styles.number}>
                  {formatCurrency(
                    parseFloat(execution.ft_ord_unpr3 || "0"),
                    execution.tr_crcy_cd
                  )}
                </td>

                <td className={styles.number}>
                  {formatNumber(parseInt(execution.ft_ccld_qty || "0"))}
                </td>

                <td className={styles.number}>
                  {formatCurrency(
                    parseFloat(execution.ft_ccld_unpr3 || "0"),
                    execution.tr_crcy_cd
                  )}
                </td>

                <td className={styles.number}>
                  {formatCurrency(
                    parseFloat(execution.ft_ccld_amt3 || "0"),
                    execution.tr_crcy_cd
                  )}
                </td>

                <td className={styles.number}>
                  {formatNumber(parseInt(execution.nccs_qty || "0"))}
                </td>

                <td>
                  <span
                    className={`${styles.status} ${
                      styles[getStatusClass(execution.prcs_stat_name)]
                    }`}
                  >
                    {execution.prcs_stat_name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverseasOrderExecutionTable;
