import styles from "./AboutSection.module.css";
import shared from "./shared.module.css";
import { ABOUT_STATS, GALLERY_ASSETS } from "./data";

export default function AboutSection() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={shared.content}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutImageGrid}>
            <img
              src={GALLERY_ASSETS.aboutPrimary}
              alt="Outdoor dining among trees and lush greenery"
              className={styles.aboutImagePrimary}
            />
            <img
              src={GALLERY_ASSETS.aboutSecondary}
              alt="Freshly plated Filipino food on a serving tray"
              className={styles.aboutImageSecondary}
            />
          </div>

          <div>
            <span className={shared.eyebrow}>About Cafe Museo</span>
            <h2 className={shared.sectionHeading}>In the middle of nature.</h2>
            <p className={shared.sectionDescription}>
              Since 2011, Cafe Museo has been a beloved part of the DLSU–Dasmariñas
              campus. Tucked inside the Museo De La Salle, we serve comforting homey dishes
              and refreshing drinks, with a peaceful lakeside view to make every meal feel
              like a break from the ordinary.
            </p>
            <p className={`${shared.sectionDescription} ${styles.aboutDescriptionBottom}`}>
              We also offer catering and reservation services for events within the
              university. From department lunches to organizational gatherings, we bring
              that same warmth to every occasion.
            </p>

            <div className={styles.statsGrid}>
              {ABOUT_STATS.map(([value, label]) => (
                <div key={label}>
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
