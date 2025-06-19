import React, { memo, useMemo } from "react";
import styles from "./WelcomeSection.module.css";
import { MarketStatus } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";

const useMarketStatus = (): {
  currentTime: string;
  marketStatus: MarketStatus;
} => {
  return useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

    const isMarketHours =
      hours >= 9 && (hours < 15 || (hours === 15 && minutes <= 30));
    const isOpen = isWeekday && isMarketHours;

    const getMarketStatusInfo = (): {
      statusText: string;
      statusIcon: string;
    } => {
      if (!isWeekday) return { statusText: "휴장", statusIcon: "🏢" };
      if (isOpen) return { statusText: "장중", statusIcon: "📈" };
      if (hours < 9) return { statusText: "장전", statusIcon: "⏰" };

      return { statusText: "장후", statusIcon: "🌙" };
    };

    const { statusText, statusIcon } = getMarketStatusInfo();

    const marketStatus: MarketStatus = {
      isOpen,
      statusText,
      statusIcon,
    };

    const currentTime = `${now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })} ${now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return { currentTime, marketStatus };
  }, []);
};

const WelcomeSection: React.FC = memo(() => {
  const { user } = useAuthContext();
  const { currentTime, marketStatus } = useMarketStatus();

  const userName = user?.name || "사용자";

  return (
    <section className={styles.welcomeSection}>
      <div className={styles.greeting}>
        <span className={styles.greetingIcon}>👋</span>
        <span className={styles.greetingText}>
          환영합니다, <strong>{userName}</strong>님
        </span>
      </div>

      <div className={styles.timeInfo}>
        <span className={styles.currentTime}>⏰ {currentTime}</span>
        <span
          className={`${styles.marketStatus} ${
            marketStatus.isOpen ? styles.marketOpen : styles.marketClosed
          }`}
        >
          {marketStatus.statusIcon} {marketStatus.statusText}
        </span>
      </div>
    </section>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
