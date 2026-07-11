import { Mail, MapPin, Phone } from "lucide-react";

import styles from "./Footer.module.css";
import shared from "./shared.module.css";
import { FOOTER_LINKS } from "./data";

export default function Footer() {
  return (
    <footer className={styles.footerShell}>
      <div className={shared.content}>
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerBrand}>Cafe Museo</p>
            <p className={styles.footerTag}>DLSU–D</p>
            <p className={styles.footerText}>
              Delicious homey dishes and drinks enjoyed in the middle of nature with a
              lakeside view inside De La Salle University Dasmariñas.
            </p>
          </div>

          <div>
            <p className={styles.footerHeading}>Quick Links</p>
            <ul className={styles.footerList}>
              {FOOTER_LINKS.map(([label, id]) => (
                <li key={id}>
                  <button
                    type="button"
                    className={styles.footerLinkButton}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={styles.footerHeading}>Contact</p>
            <ul className={styles.footerList}>
              <li className={styles.footerContactItem}>
                <MapPin size={13} className={styles.footerContactIcon} />
                <span className={styles.footerTextMuted}>
                  Museo De La Salle, DLSU–Dasmariñas, Cavite
                </span>
              </li>
              <li className={styles.footerContactItem}>
                <Phone size={13} className={styles.footerContactIcon} />
                <span className={styles.footerTextMuted}>+63 920 906 0188</span>
              </li>
              <li className={styles.footerContactItem}>
                <Mail size={13} className={styles.footerContactIcon} />
                <span className={styles.footerTextMuted}>pleiadesfoodservice@gmail.com</span>
              </li>
            </ul>
            <a
              href="https://www.facebook.com/profile.php?id=61576679105893"
              target="_blank"
              rel="noreferrer"
              className={styles.footerExternalLink}
            >
              facebook.com/cafemuseodldsu ↗
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerBottomText}>
            © 2026 Cafe Museo · Pleiades Food Service. All rights reserved.
          </p>
          <p className={styles.footerBottomText}>Dasmariñas, Cavite · Philippines</p>
        </div>
      </div>
    </footer>
  );
}
