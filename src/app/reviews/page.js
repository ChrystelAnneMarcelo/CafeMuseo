"use client";

import { useEffect, useState } from "react";

import styles from "../page.module.css";
import reviewsStyles from "./page.module.css";
import Footer from "../../components/sections/Footer";
import Navbar from "../../components/sections/Navbar";
import ReviewsSection from "../../components/sections/ReviewsSection";

export default function ReviewsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Start scrolled so navbar has background on standalone pages
    setScrolled(true);
  }, []);

  return (
    <div className={styles.page}>
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={reviewsStyles.pageSpacer}>
        <ReviewsSection previewMode={false} />
      </div>
      <Footer />
    </div>
  );
}
