import { StockOrder } from "@/types/domains/stock";

interface OrderConfirmToastOptions {
  onConfirm: () => void;
  onCancel?: () => void;
}

export const toast = {
  createOrderConfirmMsg: (orderInfo: StockOrder) => {
    return `주문 내역을 확인해주세요:
        ------------------------------
        거래 구분: ${orderInfo.trId === "buy" ? "매수" : "매도"}
        주문 종목: ${orderInfo.pdno}
        주문 수량: ${orderInfo.ordQty}주
        주문 구분: ${orderInfo.ordDvsn}
        주문 단가: ${orderInfo.ordUnpr}원
        ─────────────────
        주문을 진행하시겠습니까?`;
  },

  confirm: (message: string, options: OrderConfirmToastOptions) => {
    const userChoice = window.confirm(message);

    if (userChoice) {
      options.onConfirm();
    } else if (options.onCancel) {
      options.onCancel();
    }
  },
};

export default toast;
