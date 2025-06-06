"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationProps, NavItem } from "@/types";

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/stock-search", label: "종목 검색" },
    { href: "/order", label: "주식 주문" },
    { href: "/buyable-inquiry", label: "매수가능조회" },
    { href: "/balance", label: "잔고 확인" },
    { href: "/order-execution", label: "체결내역" },
    { href: "/realtime", label: "실시간" },
  ];

  return (
    <nav className={`navigation ${className}`}>
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.href} className="nav-item">
            <Link
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
