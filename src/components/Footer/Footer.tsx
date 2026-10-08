import { siteConfig } from "@/config/site";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <small>
          &copy; {new Date().getFullYear()} {siteConfig.author}
        </small>
      </div>
    </footer>
  );
}
