import React from "react";
import styles from "./PlaygroundPanel.module.css";

export default function PlaygroundPanel({ title, description, children }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>{title}</div>
      <p className={styles.panelDescription}>{description}</p>
      {children}
    </div>
  );
}
