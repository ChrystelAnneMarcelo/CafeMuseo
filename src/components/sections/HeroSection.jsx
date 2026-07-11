import { ChevronDown } from "lucide-react";

import styles from "./HeroSection.module.css";
import { GALLERY_ASSETS } from "./data";

export default function HeroSection() {
  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToReservations = () => {
    document.getElementById("reservations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.heroBackdrop}>
        <img
          src="/Hero_CafeMuseo.png"
          alt="Outdoor cafe dining area beside a calm lake surrounded by lush greenery"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContentWrap}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>
            Est. 2011 · DLSU–Dasmariñas
          </span>
          <h1 className={styles.heroHeading}>
            Homey food,
            <br />
            <em className={styles.heroHeadingAccent}>lakeside views.</em>
          </h1>
          <p className={styles.heroDescription}>
            Since 2011, Cafe Museo has served delicious homey dishes and drinks you can
            enjoy in the middle of nature.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryCta} onClick={scrollToMenu}>
              See Our Menu
            </button>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={scrollToReservations}
            >
              Book Catering
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.heroScrollIndicator}
        onClick={scrollToMenu}
        aria-label="Scroll to menu"
      >
        <ChevronDown size={28} className={styles.scrollChevron} />
      </button>
    </section>
  );
}
