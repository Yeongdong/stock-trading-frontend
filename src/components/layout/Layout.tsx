import React from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import styles from "./Layout.module.css";
import { LayoutProps } from "@/types";

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div className={styles.layout}>
      <Header />
      {showNavigation && <Navigation />}
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
