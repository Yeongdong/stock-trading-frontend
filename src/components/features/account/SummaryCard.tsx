import { SummaryCardsProps } from "@/types";
import { formatKRW } from "../../../utils/formatters";
import styles from "./SummaryCard.module.css";

export const SummaryCard = ({ summary }: SummaryCardsProps) => {
  return (
    <div className={styles.summaryCards}>
      <div className={styles.card}>
        <h3>예수금</h3>
        <div>{formatKRW(summary.dnca_tot_amt)}</div>
      </div>
      <div className={styles.card}>
        <h3>주식 평가금액</h3>
        <div>{formatKRW(summary.scts_evlu_amt)}</div>
      </div>
      <div className={styles.card}>
        <h3>총 평가금액</h3>
        <div>{formatKRW(summary.tot_evlu_amt)}</div>
      </div>
    </div>
  );
};
