import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Navigation.module.css";
import { NavigationProps, NavItem } from "@/types";

const Navigation: React.FC<NavigationProps> = memo(({ className = "" }) => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "대시보드" },
    { href: "/order", label: "주식 주문" },
    { href: "/balance", label: "잔고 확인" },
    { href: "/realtime", label: "실시간" },
  ];

  const isActiveLink = (href: string): boolean => {
    return pathname === href;
  };

  const getLinkClassName = (href: string): string => {
    const baseClass = styles.navLink;
    const activeClass = isActiveLink(href) ? styles.active : "";
    return `${baseClass} ${activeClass}`.trim();
  };

  return (
    <nav
      className={`${styles.navigation} ${className}`}
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href} className={styles.navItem}>
            <Link
              href={item.href}
              className={getLinkClassName(item.href)}
              aria-current={isActiveLink(item.href) ? "page" : undefined}
              title={`${item.label} 페이지로 이동`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
