import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, Send, Star, X, Loader2 } from "lucide-react";

import styles from "./ReviewsSection.module.css";
import shared from "./shared.module.css";
import { supabase } from "../../lib/supabase";

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
              fill={index < rating ? "currentColor" : "none"}
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
              <Star 
                key={index} 
                size={16} 
                className={index < review.rating ? styles.starActive : styles.starInactive} 
                fill={index < review.rating ? "currentColor" : "none"}
              />
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
            fill={starValue <= (hovered || value) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ previewMode = false }) {
  const [dbReviews, setDbReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 0, text: "", type: "Cafe Visit", mediaFiles: [] });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeReview, setActiveReview] = useState(null);
  const fileRef = useRef(null);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (data && !error) setDbReviews(data);
  };

  useEffect(() => {
    fetchReviews();

    // Subscribe to Postgres Realtime changes on reviews table
    const channel = supabase
      .channel('realtime-reviews-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload) => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePhoto = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setForm((current) => ({
      ...current,
      mediaFiles: [...(current.mediaFiles || []), ...newMedia],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name";
    if (form.rating === 0) nextErrors.rating = "Please select a rating";
    if (form.text.trim().length < 10) nextErrors.text = "Please write at least a sentence";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const uploadedUrls = [];
      for (const item of form.mediaFiles) {
        if (item.file) {
          const fileName = `${Date.now()}-${item.file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
          const { data, error } = await supabase.storage
            .from('review-media')
            .upload(fileName, item.file, {
              cacheControl: '3600',
              upsert: false
            });
          if (data) {
            const { data: publicData } = supabase.storage.from('review-media').getPublicUrl(fileName);
            uploadedUrls.push(publicData.publicUrl);
          }
        }
      }

      const { data, error } = await supabase.from('reviews').insert({
        name: form.name.trim(),
        rating: form.rating,
        quote: form.text.trim(),
        visit_type: form.type,
        photo_urls: uploadedUrls
      });

      if (!error) {
        setForm({ name: "", rating: 0, text: "", type: "Cafe Visit", mediaFiles: [] });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const allCards = [
    ...dbReviews.map((review) => {
      const d = new Date(review.created_at);
      const dateStr = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return {
        id: review.id,
        name: review.name,
        rating: review.rating,
        quote: review.quote,
        sub: review.visit_type ? `${review.visit_type} • ${dateStr}` : dateStr,
        photoUrls: review.photo_urls || [],
      };
    })
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

                {form.mediaFiles && form.mediaFiles.length > 0 ? (
                  <div className={styles.reviewUploadPreviewGrid}>
                    {form.mediaFiles.map((item, i) => (
                      <div key={i} className={styles.reviewUploadPreviewMini}>
                        {item.file.type.startsWith('video/') ? (
                          <video src={item.preview} className={styles.reviewUploadImage} />
                        ) : (
                          <img src={item.preview} alt={`Preview ${i}`} className={styles.reviewUploadImage} />
                        )}
                        <button
                          type="button"
                          className={styles.reviewUploadRemove}
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              mediaFiles: current.mediaFiles.filter((_, idx) => idx !== i),
                            }));
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    {form.mediaFiles.length < 5 && (
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

              <button type="submit" className={styles.reviewSubmitButton} disabled={submitting}>
                {submitting ? <Loader2 size={14} className={shared.spin} /> : <Send size={14} />}
                {submitting ? "Posting..." : "Post Review"}
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
