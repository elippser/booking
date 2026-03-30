import NavBar from "@/components/shared/NavBar/NavBar";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <NavBar />
      <div className={styles.content}>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}
