import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <Link
      href="/"
    >
      <a>
        <header className={styles.container}>
          <img src="/images/logo.svg" alt="logo" />
        </header>
      </a>
    </Link>
  )
}
