import { Play } from "lucide-react";

import styles from "./GallerySection.module.css";
import shared from "./shared.module.css";
import { GALLERY_ASSETS, GALLERY_PHOTOS } from "./data";

function AVPPlayer() {
  return (
    <div className={styles.avpFrame}>
      <video
        controls
        playsInline
        preload="metadata"
        poster="/Museo_Pic.png"
        className={styles.avpImage}
      >
        <source src="/CafeMuseo_AVP.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default function GallerySection() {
  return (
    <section id="gallery" className={styles.gallerySection}>
      <div className={shared.content}>
        <div className={styles.sectionIntro}>
          <span className={shared.eyebrow}>Gallery</span>
          <h2 className={shared.sectionHeading}>Moments & events</h2>
          <p className={shared.sectionDescription}>
            A glimpse of the meals and moments we have been honored to be part of within
            the DLSU community.
          </p>
        </div>

        <div className={styles.avpWrapper}>
          <AVPPlayer />
        </div>

        <div className={styles.galleryGrid}>
          {GALLERY_PHOTOS.map((photo, index) => (
            <div
              key={`${photo.alt}-${index}`}
              className={`${styles.galleryCard} ${photo.large ? styles.galleryCardLarge : ""}`}
            >
              <img src={photo.url} alt={photo.alt} className={styles.galleryImage} />
            </div>
          ))}
        </div>

        <p className={styles.galleryFooterText}>
          Follow us on Facebook for more event photos and updates.
        </p>
      </div>
    </section>
  );
}
