import Link from "next/link";
import styles from "./index.module.css";

export default function NotFound() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="t-display">This card isn&rsquo;t in the book</h1>
        <p className={`t-lead ${styles.lede}`}>
          The page you followed doesn&rsquo;t exist. The <Link href="/collections">collections</Link> and{" "}
          <Link href="/studies">studies</Link> are all here.
        </p>
      </header>
    </div>
  );
}
