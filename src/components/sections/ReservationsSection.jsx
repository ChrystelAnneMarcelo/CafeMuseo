import { useEffect, useMemo, useState } from "react";
import { Calendar, Mail, Phone, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";

import styles from "./ReservationsSection.module.css";
import shared from "./shared.module.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  eventType: "",
  pax: "",
  venue: "",
  notes: "",
};

function Field({ label, keyName, type = "text", placeholder = "", value, error, onChange }) {
  return (
    <div>
      <label className={shared.fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${shared.fieldInput} ${error ? shared.fieldInputError : ""}`}
      />
      {error ? <p className={shared.fieldError}>{error}</p> : null}
    </div>
  );
}

export default function ReservationsSection() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservedDates, setReservedDates] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = (e) => {
    e.stopPropagation();
    setCalendarDate(new Date(year, month - 1, 1));
  };
  const nextMonth = (e) => {
    e.stopPropagation();
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const fetchReservedDates = () => {
    fetch('/api/reserved-dates')
      .then(res => res.json())
      .then(data => { if (data.dates) setReservedDates(data.dates); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchReservedDates();

    // Subscribe to Postgres Realtime changes on reservations table
    const channel = supabase
      .channel('realtime-reservations-calendar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          fetchReservedDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.includes("@")) nextErrors.email = "Valid email required";

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = form.phone.replace(/[\s-()]/g, "");
      if (!/^(09|\+639)\d{9}$/.test(cleanPhone)) {
        nextErrors.phone = "Valid PH number required (e.g. 09123456789 or +639...)";
      }
    }

    if (!form.date) {
      nextErrors.date = "Please select a date";
    } else if (reservedDates.includes(form.date)) {
      nextErrors.date = "This date is already reserved";
    }
    if (!form.time) nextErrors.time = "Please select a time";
    if (!form.venue.trim()) nextErrors.venue = "Venue is required";
    if (!form.eventType) nextErrors.eventType = "Please select an event type";

    if (!form.pax || Number.isNaN(Number(form.pax)) || Number(form.pax) < 1) {
      nextErrors.pax = "Enter a valid guest count";
    }

    return nextErrors;
  };

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const formatTime = (timeStr) => {
      if (!timeStr) return timeStr;
      const [h, m] = timeStr.split(':');
      const hours = parseInt(h, 10);
      const suffix = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${m} ${suffix}`;
    };

    const formattedTime = formatTime(form.time);

    const { data, error } = await supabase.from('reservations').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      venue: form.venue.trim(),
      date: form.date,
      time: formattedTime,
      guests: form.pax,
      type: form.eventType,
      special_requests: form.notes.trim()
    });

    setSubmitting(false);

    if (!error) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          venue: form.venue.trim(),
          date: form.date,
          time: formattedTime,
          guests: form.pax,
          type: form.eventType,
          special_requests: form.notes.trim()
        })
      }).catch(console.error);

      setSubmitted(true);
    } else {
      console.error(error);
    }
  };

  const updateField = (fieldName, value) => {
    setForm((current) => ({ ...current, [fieldName]: value }));
    setErrors((current) => ({ ...current, [fieldName]: undefined }));
  };

  return (
    <section id="reservations" className={styles.reservationsSection}>
      <div className={shared.content}>
        <div className={styles.reservationGrid}>
          <div className={styles.reservationsIntro}>
            <span className={shared.eyebrow}>Catering & Reservations</span>
            <h2 className={shared.sectionHeading}>Plan your next event</h2>
            <p className={shared.sectionDescription}>
              Reservations are open for DLSU–D students, faculty, and visitors. Send us
              your details and we will get back to you.
            </p>

            <div className={styles.noticeBox}>
              <p className={styles.noticeTitle}>For DLSU community only</p>
              <p className={styles.noticeText}>
                We are open to DLSU students, faculty, and visitors. For external catering
                inquiries, feel free to reach out and we will look into it.
              </p>
            </div>

            <div className={styles.contactList}>
              {[Calendar, Users, Phone, Mail].map((Icon, index) => (
                <div key={index} className={styles.contactRow}>
                  <div className={styles.contactIconWrap}>
                    <Icon size={14} className={styles.contactIcon} />
                  </div>
                  <p className={styles.contactText}>
                    {index === 0 ? "Mon–Fri catering available" : index === 1 ? "All group sizes welcome" : index === 2 ? "+63 920 906 0188" : "cafemuseoph@gmail.com"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reservationCard}>
            {submitted ? (
              <div className={styles.successState}>
                <div className={styles.successIconWrap}>
                  <Calendar size={28} className={styles.contactIcon} />
                </div>
                <h3 className={styles.successTitle}>Inquiry Received!</h3>
                <p className={styles.successText}>
                  Thank you, {form.name.split(" ")[0]}! We will reach out to{" "}
                  <span className={styles.successEmail}>{form.email}</span> soon to confirm
                  your booking.
                </p>
                <button
                  type="button"
                  className={styles.successReset}
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                    setErrors({});
                  }}
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.reservationForm}>
                <div className={shared.formGridTwo}>
                  <Field
                    label="Full Name *"
                    keyName="name"
                    placeholder="Juan dela Cruz"
                    value={form.name}
                    error={errors.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                  <Field
                    label="Email Address *"
                    keyName="email"
                    type="email"
                    placeholder="juandelacruz@gmail.com"
                    value={form.email}
                    error={errors.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </div>

                <div className={shared.formGridTwo}>
                  <Field
                    label="Phone Number *"
                    keyName="phone"
                    type="tel"
                    placeholder="+63 9XX XXX XXXX"
                    value={form.phone}
                    error={errors.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                  <Field
                    label="Event Venue *"
                    keyName="venue"
                    placeholder="e.g. Ugnayang La Salle"
                    value={form.venue}
                    error={errors.venue}
                    onChange={(event) => updateField("venue", event.target.value)}
                  />
                </div>

                <div className={shared.formGridTwo}>
                  <div style={{ position: 'relative' }}>
                    <label className={shared.fieldLabel}>Event Date *</label>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`${shared.fieldInput} ${errors.date ? shared.fieldInputError : ""}`}
                      style={{
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: '#fff',
                        width: '100%'
                      }}
                    >
                      {form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select event date..."}
                      <Calendar size={16} style={{ color: '#6b3a2a' }} />
                    </button>
                    {errors.date ? <p className={shared.fieldError}>{errors.date}</p> : null}

                    {showDatePicker && (
                      <div className={styles.datepickerDropdown}>
                        <div className={styles.datepickerHeader}>
                          <button type="button" onClick={prevMonth} className={styles.datepickerNav}><ChevronLeft size={16} /></button>
                          <span className={styles.datepickerTitle}>{monthName}</span>
                          <button type="button" onClick={nextMonth} className={styles.datepickerNav}><ChevronRight size={16} /></button>
                        </div>
                        <div className={styles.datepickerWeekdays}>
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className={styles.datepickerWeekday}>{d}</div>
                          ))}
                        </div>
                        <div className={styles.datepickerGrid}>
                          {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className={styles.datepickerDayEmpty} />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const isReserved = reservedDates.includes(dateStr);
                            const isSelected = form.date === dateStr;
                            
                            const d = new Date();
                            const offset = d.getTimezoneOffset();
                            const localDate = new Date(d.getTime() - (offset * 60 * 1000));
                            const todayStr = localDate.toISOString().split('T')[0];
                            const isPast = dateStr < todayStr;
                            const isSelectable = !isPast && !isReserved;

                            let dayCls = styles.datepickerDay;
                            if (isReserved) dayCls += ` ${styles.datepickerDayReserved}`;
                            if (isPast) dayCls += ` ${styles.datepickerDayPast}`;
                            if (isSelected) dayCls += ` ${styles.datepickerDaySelected}`;

                            return (
                              <button
                                key={day}
                                type="button"
                                disabled={!isSelectable}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateField("date", dateStr);
                                  setShowDatePicker(false);
                                }}
                                className={dayCls}
                                title={isReserved ? "Already Reserved" : ""}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <div className={styles.datepickerLegend}>
                          <div className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: '#f8d7da', border: '1px solid #f5c6cb' }} /> Booked
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={shared.fieldLabel}>Preferred Time *</label>
                    <input
                      type="time"
                      min="08:00"
                      max="17:00"
                      value={form.time}
                      onChange={(event) => updateField("time", event.target.value)}
                      className={`${shared.fieldInput} ${errors.time ? shared.fieldInputError : ""}`}
                    />
                    {errors.time ? <p className={shared.fieldError}>{errors.time}</p> : null}
                  </div>
                </div>

                <div className={shared.formGridTwo}>
                  <div>
                    <label className={shared.fieldLabel}>Event Type *</label>
                    <select
                      value={form.eventType}
                      onChange={(event) => updateField("eventType", event.target.value)}
                      className={`${shared.fieldInput} ${shared.selectInput} ${errors.eventType ? shared.fieldInputError : ""}`}
                    >
                      <option value="" disabled>
                        Select event type
                      </option>
                      <option>Department Lunch / Dinner</option>
                      <option>Organization Event</option>
                      <option>Faculty Gathering</option>
                      <option>University Function</option>
                      <option>Team Building Meal</option>
                      <option>Other</option>
                    </select>
                    {errors.eventType ? <p className={shared.fieldError}>{errors.eventType}</p> : null}
                  </div>

                  <Field
                    label="Number of Guests (Pax) *"
                    keyName="pax"
                    type="number"
                    placeholder="e.g. 30"
                    value={form.pax}
                    error={errors.pax}
                    onChange={(event) => updateField("pax", event.target.value)}
                  />
                </div>

                <div>
                  <label className={shared.fieldLabel}>Additional Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Special requests, dietary needs, or anything else we should know..."
                    className={shared.textareaInput}
                  />
                </div>

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? <Loader2 size={16} className={shared.spin} /> : null}
                  {submitting ? "Submitting..." : "Submit Reservation Inquiry"}
                </button>

                <p className={styles.formNote}>
                  For DLSU–D students, faculty, and visitors only. We will confirm
                  availability and get back to you shortly.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
