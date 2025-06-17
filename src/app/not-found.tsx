import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.message}>
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
        </p>
        <Link href="/" className={styles.homeButton}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
