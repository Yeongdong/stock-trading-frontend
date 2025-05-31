"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/layout/Navigation";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Link href="/dashboard" className="logo">
            주식거래시스템
          </Link>
        </div>

        <div className="header-right">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button
                onClick={handleLogout}
                className="logout-button"
                type="button"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="navigation">
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
