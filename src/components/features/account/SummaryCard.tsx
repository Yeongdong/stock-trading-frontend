import { SummaryCardItem, SummaryCardsProps } from "@/types";
import { formatKRW } from "../../../utils/formatters";
import styles from "./SummaryCard.module.css";

export const SummaryCard = ({ summary }: SummaryCardsProps) => {
  const cardItems: SummaryCardItem[] = [
    {
      title: "예수금",
      value: formatKRW(summary.dnca_tot_amt),
    },
    {
      title: "주식 평가금액",
      value: formatKRW(summary.scts_evlu_amt),
    },
    {
      title: "총 평가금액",
      value: formatKRW(summary.tot_evlu_amt),
    },
  ];

  return (
    <div className={styles.summaryCards}>
      {cardItems.map((item, index) => (
        <div key={index} className={styles.card}>
          <h3>{item.title}</h3>
          <div>{item.value}</div>
        </div>
      ))}
    </div>
  );
};
