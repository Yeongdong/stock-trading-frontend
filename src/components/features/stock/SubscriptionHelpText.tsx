import React, { memo } from "react";

const SubscriptionHelpText: React.FC = memo(() => (
  <div className="help-text">
    * 삼성전자: 005930, SK하이닉스: 000660, 카카오: 035720
  </div>
));

SubscriptionHelpText.displayName = "SubscriptionHelpText";

export default SubscriptionHelpText;
