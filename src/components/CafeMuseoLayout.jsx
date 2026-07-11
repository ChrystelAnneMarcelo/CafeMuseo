"use client";

import { useEffect, useState } from "react";

import styles from "../app/page.module.css";
import AboutSection from "./sections/AboutSection";
import Footer from "./sections/Footer";
import GallerySection from "./sections/GallerySection";
import HeroSection from "./sections/HeroSection";
import HoursSection from "./sections/HoursSection";
import MenuSection from "./sections/MenuSection";
import Navbar from "./sections/Navbar";
import ReservationsSection from "./sections/ReservationsSection";
import ReviewsSection from "./sections/ReviewsSection";

export default function CafeMuseoLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.page}>
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <HeroSection />
      <MenuSection />
      <GallerySection />
      <ReservationsSection />
      <HoursSection />
      <AboutSection />
      <ReviewsSection previewMode={true} />
      <Footer />
    </div>
  );
}
