import React, { memo, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./WelcomeSection.module.css";

interface MarketStatus {
  isOpen: boolean;
  statusText: string;
  statusIcon: string;
}

const WelcomeSection: React.FC = memo(() => {
  const { user } = useAuth();

  // 현재 시간과 장 상태 계산
  const { currentTime, marketStatus } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 장 시간: 09:00 ~ 15:30 (평일)
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    const isMarketHours =
      hours >= 9 && (hours < 15 || (hours === 15 && minutes <= 30));
    const isOpen = isWeekday && isMarketHours;

    let statusText: string;
    let statusIcon: string;

    if (!isWeekday) {
      statusText = "휴장";
      statusIcon = "🏢";
    } else if (isOpen) {
      statusText = "장중";
      statusIcon = "📈";
    } else if (hours < 9) {
      statusText = "장전";
      statusIcon = "⏰";
    } else {
      statusText = "장후";
      statusIcon = "🌙";
    }

    const marketStatus: MarketStatus = {
      isOpen,
      statusText,
      statusIcon,
    };

    const currentTime =
      now.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
      }) +
      " " +
      now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });

    return { currentTime, marketStatus };
  }, []);

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
