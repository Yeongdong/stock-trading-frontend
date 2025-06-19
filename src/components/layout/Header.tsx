import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          📈 주식거래시스템
        </Link>

        {user && (
          <div className={styles.userSection}>
            <span className={styles.userName}>{user.name}님</span>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              type="button"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
