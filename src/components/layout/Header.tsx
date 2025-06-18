import React, { memo } from "react";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import styles from "./Header.module.css";
import { useAuthContext } from "@/contexts/AuthContext";

const Header: React.FC = memo(() => {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className={styles.appHeader} role="banner">
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Link
            href="/dashboard"
            className={styles.logo}
            aria-label="홈으로 이동"
          >
            📈 주식거래시스템
          </Link>
        </div>

        <div className={styles.headerRight}>
          {user && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}님</span>
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                type="button"
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.navigationWrapper}>
        <Navigation />
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
