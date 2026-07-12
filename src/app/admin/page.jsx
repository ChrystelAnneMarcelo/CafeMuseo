"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Check, X, User, Mail, Phone, MapPin } from "lucide-react";
import styles from "./Admin.module.css";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [declineModal, setDeclineModal] = useState({ show: false, booking: null, reason: "" });

  useEffect(() => {
    if (loggedIn) fetchBookings();
  }, [loggedIn]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    if (data) setBookings(data);
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "museo-admin") setLoggedIn(true);
    else alert("Incorrect password");
  };

  const updateStatus = async (booking, newStatus, reason = "") => {
    setUpdatingId(booking.id);

    const res = await fetch('/api/admin/update-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: booking.id,
        status: newStatus,
        reason,
        customerEmail: booking.email,
        customerName: booking.name,
        date: booking.date,
        time: booking.time,
        venue: booking.venue
      })
    });

    if (res.ok) {
      setBookings(curr => curr.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
      if (declineModal.show) setDeclineModal({ show: false, booking: null, reason: "" });
    } else {
      alert("Failed to update booking. Make sure your Resend API key is valid in .env.local.");
    }
    setUpdatingId(null);
  };

  if (!loggedIn) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <h2>Admin Access</h2>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>Enter admin password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={styles.loginInput}
          />
          <button type="submit" className={styles.loginBtn}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Reservations Dashboard</h1>
        <button onClick={() => fetchBookings()} className={styles.refreshBtn}>Refresh</button>
      </header>

      {loading ? (
        <div className={styles.loader}><Loader2 className={styles.spin} size={32} /></div>
      ) : bookings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No reservations found in the database.</p>
      ) : (
        <div className={styles.grid}>
          {bookings.map(b => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.badge} ${styles['badge' + (b.status || 'Pending')]}`}>
                  {b.status || 'Pending'}
                </span>
                <span className={styles.date}>{b.date} • {b.time}</span>
              </div>

              <div className={styles.cardBody}>
                <h3>{b.name}</h3>
                <div className={styles.infoRow}><Mail size={14} /> {b.email}</div>
                <div className={styles.infoRow}><Phone size={14} /> {b.phone}</div>
                <div className={styles.infoRow}><User size={14} /> {b.guests} Guests ({b.type})</div>
                <div className={styles.infoRow}><MapPin size={14} /> {b.venue}</div>
                {b.special_requests && (
                  <div className={styles.notes}>
                    <strong>Notes:</strong> {b.special_requests}
                  </div>
                )}
              </div>

              {(b.status === 'Pending' || !b.status) && (
                <div className={styles.actions}>
                  <button
                    disabled={updatingId === b.id}
                    className={styles.approveBtn}
                    onClick={() => updateStatus(b, 'Approved')}
                  >
                    {updatingId === b.id ? <Loader2 size={16} className={styles.spin} /> : <Check size={16} />} Approve
                  </button>
                  <button
                    disabled={updatingId === b.id}
                    className={styles.declineBtn}
                    onClick={() => setDeclineModal({ show: true, booking: b, reason: "" })}
                  >
                    <X size={16} /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {declineModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Decline Reservation</h3>
            <p>Are you sure you want to decline {declineModal.booking?.name}&apos;s reservation?</p>
            <textarea
              value={declineModal.reason}
              onChange={e => setDeclineModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Optional: Reason for declining (this will be emailed to the customer)"
              className={styles.reasonInput}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setDeclineModal({ show: false, booking: null, reason: "" })} className={styles.cancelBtn}>Cancel</button>
              <button
                onClick={() => updateStatus(declineModal.booking, 'Declined', declineModal.reason)}
                className={styles.confirmDeclineBtn}
                disabled={updatingId === declineModal.booking.id}
              >
                {updatingId === declineModal.booking.id ? <Loader2 size={16} className={styles.spin} /> : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
