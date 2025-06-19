import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";
import { NavigationProps } from "@/types";
import { NAV_ITEMS } from "@/constants";

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const pathname = usePathname();

  return (
    <nav className={`${styles.navigation} ${className}`}>
      <div className={styles.container}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${
                  pathname === item.href ? styles.active : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
