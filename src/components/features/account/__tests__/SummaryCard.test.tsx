import { render, screen } from "@testing-library/react";
import { SummaryCard } from "../SummaryCard";

// 테스트에 사용할 목(mock) 데이터
const mockSummary = {
  totalDeposit: "1000000",
  stockEvaluation: "2000000",
  totalEvaluation: "3000000",
};

describe("SummaryCard Component", () => {
  test("renders summary card with correct values", () => {
    render(<SummaryCard summary={mockSummary} />);

    // 각 항목이 화면에 표시되는지 확인
    expect(screen.getByText("예수금")).toBeInTheDocument();
    expect(screen.getByText("주식 평가금액")).toBeInTheDocument();
    expect(screen.getByText("총 평가금액")).toBeInTheDocument();

    // formatKRW 함수가 적용된 값들이 화면에 표시되는지 확인
    expect(screen.getByText("₩1,000,000")).toBeInTheDocument();
    expect(screen.getByText("₩2,000,000")).toBeInTheDocument();
    expect(screen.getByText("₩3,000,000")).toBeInTheDocument();
  });

  test("applies correct styles", () => {
    const { container } = render(<SummaryCard summary={mockSummary} />);

    // querySelector를 사용하여 요소 찾기
    const summaryCards = container.querySelector(".summary-cards");
    expect(summaryCards).toHaveClass("summary-cards");

    // querySelectorAll을 사용하여 여러 요소 찾기
    const cards = container.querySelectorAll(".card");
    expect(cards.length).toBe(3);
    cards.forEach((card) => {
      expect(card).toHaveClass("card");
    });
  });
});
