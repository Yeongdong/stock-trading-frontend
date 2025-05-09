import { Summary } from "@/types/stock";
import { formatKRW } from "../../../utils/formatters";

interface SummaryCardsProps {
  summary: Summary;
}

export const SummaryCard = ({ summary }: SummaryCardsProps) => {
  return (
    <div className="summary-cards">
      <div className="card">
        <h3>예수금</h3>
        <div>{formatKRW(summary.totalDeposit)}</div>
      </div>
      <div className="card">
        <h3>주식 평가금액</h3>
        <div>{formatKRW(summary.stockEvaluation)}</div>
      </div>
      <div className="card">
        <h3>총 평가금액</h3>
        <div>{formatKRW(summary.totalEvaluation)}</div>
      </div>
    </div>
  );
};
