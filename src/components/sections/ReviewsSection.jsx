import { useRef, useState } from "react";
import { Camera, Send, Star, X } from "lucide-react";

import styles from "./ReviewsSection.module.css";
import shared from "./shared.module.css";
import { TESTIMONIALS } from "./data";

function ReviewCard({ name, rating, quote, sub, photoUrl }) {
  return (
    <div className={styles.reviewCard}>
      {photoUrl ? (
        <div className={styles.reviewPhotoWrap}>
          <img src={photoUrl} alt={`Photo by ${name}`} className={styles.reviewPhoto} />
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

export default function ReviewsSection() {
  const [userReviews, setUserReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 0, text: "", photoUrl: null });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, photoUrl: reader.result }));
    reader.readAsDataURL(file);
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
        photoUrl: form.photoUrl,
        date: dateStr,
      },
      ...current,
    ]);

    setForm({ name: "", rating: 0, text: "", photoUrl: null });
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
      sub: review.date,
      photoUrl: review.photoUrl,
    })),
    ...TESTIMONIALS.map((testimonial, index) => ({
      id: -index - 1,
      name: testimonial.name,
      rating: 5,
      quote: testimonial.quote,
      sub: testimonial.event,
      photoUrl: null,
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
          {allCards.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>

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
                <label className={shared.fieldLabel}>Add a Photo (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handlePhoto}
                />

                {form.photoUrl ? (
                  <div className={styles.reviewUploadPreview}>
                    <img src={form.photoUrl} alt="Preview" className={styles.reviewUploadImage} />
                    <button
                      type="button"
                      className={styles.reviewUploadRemove}
                      onClick={() => {
                        setForm((current) => ({ ...current, photoUrl: null }));
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={styles.reviewUploadButton}
                  >
                    <Camera size={20} />
                    <span>Click to upload a photo</span>
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
      </div>
    </section>
  );
}
