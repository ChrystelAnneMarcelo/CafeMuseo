import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, Send, Star, X } from "lucide-react";

import styles from "./ReviewsSection.module.css";
import shared from "./shared.module.css";
import { TESTIMONIALS } from "./data";

function isVideo(url) {
  if (!url) return false;
  return url.startsWith("data:video/") || !!url.match(/\.(mp4|webm|ogg)$/i);
}

function ReviewCard({ review, onClick }) {
  const { name, rating, quote, sub, photoUrls } = review;
  const photos = photoUrls || [];

  return (
    <div className={styles.reviewCard} onClick={() => onClick && onClick(review)} style={{ cursor: onClick ? "pointer" : "default" }}>
      {photos.length > 0 ? (
        <div className={styles.reviewPhotoWrap}>
          {photos.map((url, i) => (
            isVideo(url) ? (
              <video 
                key={i} 
                src={url} 
                muted
                playsInline
                className={`${styles.reviewPhoto} ${photos.length === 1 ? styles.reviewPhotoSingle : styles.reviewPhotoMulti}`} 
              />
            ) : (
              <img 
                key={i} 
                src={url} 
                alt={`Photo ${i + 1} by ${name}`} 
                className={`${styles.reviewPhoto} ${photos.length === 1 ? styles.reviewPhotoSingle : styles.reviewPhotoMulti}`} 
              />
            )
          ))}
        </div>
      ) : null}

      <div className={styles.reviewCardBody}>
        <div className={styles.starRow}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`${name}-${index}`}
              size={13}
              className={index < rating ? styles.starActive : styles.starInactive}
            />
          ))}
        </div>

        <p className={styles.reviewQuote}>
          &ldquo;{quote}&rdquo;
        </p>

        <div>
          <p className={styles.reviewName}>{name}</p>
          <p className={styles.reviewSub}>{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ review, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [review]);

  if (!review) return null;
  const photos = review.photoUrls || [];
  const hasMultiple = photos.length > 1;

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentUrl = photos[currentIndex] || "";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><X size={24} /></button>
        {photos.length > 0 && (
          <div className={styles.modalGallerySingle}>
            {isVideo(currentUrl) ? (
              <video key={currentIndex} src={currentUrl} controls playsInline className={styles.modalMedia} />
            ) : (
              <img key={currentIndex} src={currentUrl} className={styles.modalMedia} alt="Review Media" />
            )}

            {hasMultiple && (
              <>
                <button type="button" className={`${styles.modalNavBtn} ${styles.modalNavLeft}`} onClick={handlePrev}>
                  <ChevronLeft size={28} />
                </button>
                <button type="button" className={`${styles.modalNavBtn} ${styles.modalNavRight}`} onClick={handleNext}>
                  <ChevronRight size={28} />
                </button>
                <div className={styles.modalNavDots}>
                  {photos.map((_, idx) => (
                    <div key={idx} className={`${styles.modalNavDot} ${idx === currentIndex ? styles.modalNavDotActive : ""}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <div className={styles.modalBody}>
          <div className={styles.starRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={16} className={index < review.rating ? styles.starActive : styles.starInactive} />
            ))}
          </div>
          <p className={styles.modalQuote}>&ldquo;{review.quote}&rdquo;</p>
          <div className={styles.modalAuthor}>
            <p className={styles.reviewName}>{review.name}</p>
            <p className={styles.reviewSub}>{review.sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHovered(starValue)}
          onMouseLeave={() => setHovered(0)}
          className={styles.starPickerButton}
          aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
        >
          <Star
            size={28}
            className={
              starValue <= (hovered || value)
                ? styles.starActiveLarge
                : styles.starInactiveLarge
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ previewMode = false }) {
  const [userReviews, setUserReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 0, text: "", type: "Cafe Visit", photoUrls: [] });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeReview, setActiveReview] = useState(null);
  const fileRef = useRef(null);

  const handlePhoto = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    ).then((results) => {
      setForm((current) => ({
        ...current,
        photoUrls: [...(current.photoUrls || []), ...results],
      }));
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name";
    if (form.rating === 0) nextErrors.rating = "Please select a rating";
    if (form.text.trim().length < 10) nextErrors.text = "Please write at least a sentence";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    setUserReviews((current) => [
      {
        id: Date.now(),
        name: form.name.trim(),
        rating: form.rating,
        text: form.text.trim(),
        photoUrls: form.photoUrls,
        type: form.type,
        date: dateStr,
      },
      ...current,
    ]);

    setForm({ name: "", rating: 0, text: "", type: "Cafe Visit", photoUrls: [] });
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const allCards = [
    ...userReviews.map((review) => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      quote: review.text,
      sub: review.type ? `${review.type} • ${review.date}` : review.date,
      photoUrls: review.photoUrls || [],
    })),
    ...TESTIMONIALS.map((testimonial, index) => ({
      id: -index - 1,
      name: testimonial.name,
      rating: 5,
      quote: testimonial.quote,
      sub: testimonial.event,
      photoUrls: testimonial.photoUrls || (testimonial.photoUrl ? [testimonial.photoUrl] : []),
    })),
  ];

  return (
    <section id="reviews" className={styles.reviewsSection}>
      <div className={shared.content}>
        <div className={styles.sectionCenterIntro}>
          <span className={shared.eyebrow}>Guest Experiences</span>
          <h2 className={shared.sectionHeading}>What our guests say</h2>
        </div>

        <div className={styles.reviewGrid}>
          {allCards.slice(0, previewMode ? 3 : visibleCount).map((review) => (
            <ReviewCard key={review.id} review={review} onClick={setActiveReview} />
          ))}
        </div>

        {previewMode ? (
          <div className={styles.loadMoreWrap}>
            <Link href="/reviews" className={styles.loadMoreButton} style={{ textDecoration: 'none' }}>
              See all reviews & share yours
            </Link>
          </div>
        ) : (
          <>
            {(visibleCount < allCards.length || visibleCount > 6) && (
              <div className={styles.loadMoreWrap}>
                {visibleCount < allCards.length && (
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                  >
                    Show More Reviews
                  </button>
                )}
                {visibleCount > 6 && (
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={() => setVisibleCount(6)}
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}

            <div className={styles.reviewFormWrap}>
              <div className={styles.reviewFormCard}>
                <h3 className={styles.reviewFormTitle}>Share your experience</h3>
                <p className={styles.reviewFormDescription}>
                  Visited recently? We would love to hear from you.
                </p>

            {submitted ? (
              <div className={styles.reviewSuccessMessage}>
                <Star size={14} className={styles.reviewSuccessIcon} />
                Thank you! Your review has been posted.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className={styles.reviewForm}>
              <div>
                <label className={shared.fieldLabel}>Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }));
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                  placeholder="Juan dela Cruz"
                  className={`${shared.fieldInput} ${errors.name ? shared.fieldInputError : ""}`}
                />
                {errors.name ? <p className={shared.fieldError}>{errors.name}</p> : null}
              </div>

              <div>
                <label className={shared.fieldLabel}>Rating *</label>
                <StarPicker
                  value={form.rating}
                  onChange={(value) => {
                    setForm((current) => ({ ...current, rating: value }));
                    setErrors((current) => ({ ...current, rating: undefined }));
                  }}
                />
                {errors.rating ? <p className={shared.fieldError}>{errors.rating}</p> : null}
              </div>

              <div>
                <label className={shared.fieldLabel}>Visit Type *</label>
                <div className={styles.typeSelectorRow}>
                  {["Cafe Visit", "Catering Service"].map((typeOpt) => (
                    <button
                      key={typeOpt}
                      type="button"
                      className={`${styles.typeSelectorBtn} ${form.type === typeOpt ? styles.typeSelectorBtnActive : ""}`}
                      onClick={() => setForm(c => ({ ...c, type: typeOpt }))}
                    >
                      {typeOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={shared.fieldLabel}>Your Review *</label>
                <textarea
                  rows={4}
                  value={form.text}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, text: event.target.value }));
                    setErrors((current) => ({ ...current, text: undefined }));
                  }}
                  placeholder="Tell us about your visit, the food, the atmosphere..."
                  className={`${shared.textareaInput} ${errors.text ? shared.fieldInputError : ""}`}
                />
                {errors.text ? <p className={shared.fieldError}>{errors.text}</p> : null}
              </div>

              <div>
                <label className={shared.fieldLabel}>Add Photos or Videos (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className={styles.fileInput}
                  onChange={handlePhoto}
                />

                {form.photoUrls && form.photoUrls.length > 0 ? (
                  <div className={styles.reviewUploadPreviewGrid}>
                    {form.photoUrls.map((url, i) => (
                      <div key={i} className={styles.reviewUploadPreviewMini}>
                        {isVideo(url) ? (
                          <video src={url} className={styles.reviewUploadImage} />
                        ) : (
                          <img src={url} alt={`Preview ${i}`} className={styles.reviewUploadImage} />
                        )}
                        <button
                          type="button"
                          className={styles.reviewUploadRemove}
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              photoUrls: current.photoUrls.filter((_, idx) => idx !== i),
                            }));
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    {form.photoUrls.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={styles.reviewUploadButtonSmall}
                      >
                        <Camera size={20} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={styles.reviewUploadButton}
                  >
                    <Camera size={20} />
                    <span>Click to upload photos/videos</span>
                  </button>
                )}
              </div>

              <button type="submit" className={styles.reviewSubmitButton}>
                <Send size={14} />
                Post Review
              </button>
            </form>
          </div>
        </div>
        </>
        )}
      </div>
      <ReviewModal review={activeReview} onClose={() => setActiveReview(null)} />
    </section>
  );
}
