import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import styles from "./Navbar.module.css";
import { NAV_LINKS } from "./data";

export default function Navbar({ scrolled, mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (pathname !== "/") {
      router.push(`/#${id.toLowerCase()}`);
    } else {
      document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (pathname !== "/") {
      router.push("/#home");
    } else {
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`${styles.navbarShell} ${scrolled ? styles.navbarShellScrolled : ""}`}
      aria-label="Primary navigation"
    >
      <div className={styles.navInner}>
        <a href="/#home" className={styles.brandLink} onClick={goHome}>
          <img src="/cafemuseo_logo.jpg" alt="Cafe Museo Logo" className={styles.brandLogo} />
          <div className={styles.brandTextWrap}>
            <span className={styles.brandName}>Cafe Museo</span>
            <span className={styles.brandSub}>DLSU–D</span>
          </div>
        </a>

        <div className={styles.desktopNav}>
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              className={styles.navLinkButton}
              onClick={() => scrollTo(link)}
            >
              {link}
            </button>
          ))}

          <button
            type="button"
            className={styles.reserveButton}
            onClick={() => scrollTo("reservations")}
          >
            Reserve a Date
          </button>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              className={styles.mobileMenuItem}
              onClick={() => scrollTo(link)}
            >
              {link}
            </button>
          ))}
          <button
            type="button"
            className={styles.mobileReserveButton}
            onClick={() => scrollTo("reservations")}
          >
            Reserve a Date
          </button>
        </div>
      ) : null}
    </nav>
  );
}
