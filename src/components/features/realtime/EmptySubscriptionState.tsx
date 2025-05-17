import React, { memo } from "react";
import { EmptySubscriptionStateProps } from "@/types/components";

const EmptySubscriptionState: React.FC<EmptySubscriptionStateProps> = memo(
  ({
    message = "구독 중인 종목이 없습니다.",
    submessage = "위 입력창에서 종목 코드를 입력하여 실시간 시세를 구독해보세요.",
  }) => (
    <div className="empty-state">
      <p>{message}</p>
      <p>{submessage}</p>
    </div>
  )
);

EmptySubscriptionState.displayName = "EmptySubscriptionState";

export default EmptySubscriptionState;
