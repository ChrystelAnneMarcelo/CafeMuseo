import { Clock, Mail, MapPin, Phone } from "lucide-react";

import styles from "./HoursSection.module.css";
import shared from "./shared.module.css";
import { GALLERY_ASSETS, HOURS } from "./data";

export default function HoursSection() {
  return (
    <section id="hours" className={styles.hoursSection}>
      <div className={shared.content}>
        <div className={styles.hoursGrid}>
          <div>
            <span className={shared.eyebrow}>Visit Us</span>
            <h2 className={`${shared.sectionHeading} ${styles.headingLight}`}>Hours & Location</h2>

            <div className={styles.hoursList}>
              {HOURS.map((hour) => (
                <div key={hour.day} className={styles.hoursRow}>
                  <div className={styles.hoursDayWrap}>
                    <Clock size={15} className={styles.hoursIcon} />
                    <span className={styles.hoursDay}>{hour.day}</span>
                  </div>
                  <span className={styles.hoursValue}>
                    {hour.close ? `${hour.open} – ${hour.close}` : hour.open}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.locationList}>
              <div className={styles.locationItem}>
                <MapPin size={16} className={styles.hoursIcon} />
                <div>
                  <p className={styles.locationTitle}>Museo De La Salle</p>
                  <p className={styles.locationText}>
                    De La Salle University – Dasmariñas
                    <br />
                    Dasmariñas, Cavite
                  </p>
                </div>
              </div>

              <div className={styles.locationItemRow}>
                <Phone size={15} className={styles.hoursIcon} />
                <p className={styles.locationText}>+63 920 906 0188</p>
              </div>

              <div className={styles.locationItemRow}>
                <Mail size={15} className={styles.hoursIcon} />
                <p className={styles.locationText}>pleiadesfoodservice@gmail.com</p>
              </div>
            </div>

            <div className={styles.infoBanner}>
              <p className={styles.infoBannerText}>
                🌿 Open to DLSU students, faculty, and visitors. For catering inquiries
                outside the university, reach out and we will look into it!
              </p>
            </div>
          </div>

          <div className={styles.hoursImageWrap}>
            <img
              src={GALLERY_ASSETS.hours}
              alt="Outdoor dining area beside a calm lake surrounded by lush greenery"
              className={styles.hoursImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
