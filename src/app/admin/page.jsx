"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Check, X, User, Mail, Phone, MapPin, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import styles from "./Admin.module.css";

function AdminCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const approvedDates = new Set(
    bookings.filter(b => b.status === "Approved").map(b => b.date)
  );
  const pendingDates = new Set(
    bookings.filter(b => b.status === "Pending" || !b.status).map(b => b.date)
  );

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isApproved = approvedDates.has(dateStr);
    const isPending = pendingDates.has(dateStr);
    const todayStr = new Date().toISOString().split("T")[0];
    const isPast = dateStr < todayStr;

    let cls = styles.calendarDay;
    if (isApproved) cls += ` ${styles.calendarDayApproved}`;
    else if (isPending) cls += ` ${styles.calendarDayPending}`;
    if (isPast) cls += ` ${styles.calendarDayPast}`;
    if (dateStr === todayStr) cls += ` ${styles.calendarDayToday}`;

    days.push(
      <div key={d} className={cls} title={isApproved ? "Reserved" : isPending ? "Pending" : ""}>
        <span>{d}</span>
        {isApproved && <span className={styles.calendarDot} style={{ background: "#155724" }} />}
        {isPending && !isApproved && <span className={styles.calendarDot} style={{ background: "#856404" }} />}
      </div>
    );
  }

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth} className={styles.calendarNav}><ChevronLeft size={18} /></button>
        <h3 className={styles.calendarTitle}>{monthName}</h3>
        <button onClick={nextMonth} className={styles.calendarNav}><ChevronRight size={18} /></button>
      </div>
      <div className={styles.calendarWeekdays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className={styles.calendarWeekday}>{d}</div>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {days}
      </div>
      <div className={styles.calendarLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "#155724" }} /> Reserved
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "#856404" }} /> Pending
        </div>
      </div>
    </div>
  );
}

function Column({ title, items, page, setPage, renderCard }) {
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={styles.boardColumn}>
      <div className={styles.columnHeader}>
        <h3>
          {title} <span className={styles.columnCount}>{items.length}</span>
        </h3>
      </div>
      <div className={styles.columnBody}>
        {paginatedItems.length === 0 ? (
          <p className={styles.emptyColumnText}>No reservations</p>
        ) : (
          paginatedItems.map(renderCard)
        )}
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");

  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");

  // Column Pagination States
  const [pendingPage, setPendingPage] = useState(1);
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const resetPages = () => {
    setPendingPage(1);
    setAcceptedPage(1);
    setHistoryPage(1);
  };

  const [declineModal, setDeclineModal] = useState({ show: false, booking: null, reason: "", action: "Declined" });
  const [approveModal, setApproveModal] = useState({ show: false, booking: null, message: "" });
  const [confirmModal, setConfirmModal] = useState({ show: false, booking: null, action: "", message: "" });

  useEffect(() => {
    if (!loggedIn) return;

    fetchBookings();

    // Subscribe to Postgres Realtime changes on reservations table
    const channel = supabase
      .channel('realtime-reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log("Received Realtime Payload:", payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;
          if (eventType === 'INSERT') {
            setBookings(curr => [newRecord, ...curr]);
          } else if (eventType === 'UPDATE') {
            setBookings(curr => curr.map(b => b.id === newRecord.id ? newRecord : b));
          } else if (eventType === 'DELETE') {
            setBookings(curr => curr.filter(b => b.id !== oldRecord.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription connection status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
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

  const updateStatus = async (booking, newStatus, adminMessage = "") => {
    setUpdatingId(booking.id);

    const res = await fetch('/api/admin/update-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: booking.id,
        status: newStatus,
        message: adminMessage,
        reason: adminMessage,
        customerEmail: booking.email,
        customerName: booking.name,
        date: booking.date,
        time: booking.time,
        venue: booking.venue
      })
    });

    if (res.ok) {
      const result = await res.json();
      setBookings(curr => curr.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
      setDeclineModal({ show: false, booking: null, reason: "", action: "Declined" });
      setApproveModal({ show: false, booking: null, message: "" });
      setConfirmModal({ show: false, booking: null, action: "", message: "" });
      if (!result.emailSent) {
        alert(`Booking ${newStatus.toLowerCase()} successfully! (Email could not be sent - Resend free tier only allows sending to your registered email)`);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      alert(errData.error || "Failed to update booking. Check your database permissions.");
    }
    setUpdatingId(null);
    setConfirmModal({ show: false, booking: null, action: "", message: "" });
  };

  // Local date calculations for auto-statusing Completed/Expired ones
  const todayStr = useMemo(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }, []);

  const getResolvedStatus = (b) => {
    if (b.status === 'Declined') return 'Declined';
    if (b.status === 'Cancelled') return 'Cancelled';
    if (b.date < todayStr) {
      return b.status === 'Approved' ? 'Done' : 'Expired';
    }
    return b.status || 'Pending';
  };

  const sortedAndFiltered = useMemo(() => {
    return [...bookings]
      .filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || b.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "date_asc") {
          return a.date.localeCompare(b.date);
        } else if (sortBy === "date_desc") {
          return b.date.localeCompare(a.date);
        } else if (sortBy === "created_desc") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        return 0;
      });
  }, [bookings, searchQuery, filterType, sortBy]);

  const pendingBookings = useMemo(() => {
    return sortedAndFiltered.filter(b => getResolvedStatus(b) === 'Pending');
  }, [sortedAndFiltered, todayStr]);

  const acceptedBookings = useMemo(() => {
    return sortedAndFiltered.filter(b => getResolvedStatus(b) === 'Approved');
  }, [sortedAndFiltered, todayStr]);

  const historyBookings = useMemo(() => {
    return sortedAndFiltered.filter(b => ['Declined', 'Cancelled', 'Done', 'Expired'].includes(getResolvedStatus(b)));
  }, [sortedAndFiltered, todayStr]);

  const isAlreadyBooked = useMemo(() => {
    if (!approveModal.booking) return false;
    return bookings.some(b => 
      b.date === approveModal.booking.date && 
      b.status === 'Approved' && 
      b.id !== approveModal.booking.id
    );
  }, [bookings, approveModal.booking]);

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

  const renderCard = (b) => {
    const resolvedStatus = getResolvedStatus(b);
    return (
      <div key={b.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles['badge' + resolvedStatus]}`}>
            {resolvedStatus}
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

        {resolvedStatus === 'Pending' && (
          <div className={styles.actions}>
            <button
              disabled={updatingId === b.id}
              className={styles.approveBtn}
              onClick={() => setApproveModal({ show: true, booking: b, message: "" })}
            >
              {updatingId === b.id ? <Loader2 size={16} className={styles.spin} /> : <Check size={16} />} Approve
            </button>
            <button
              disabled={updatingId === b.id}
              className={styles.declineBtn}
              onClick={() => setDeclineModal({ show: true, booking: b, reason: "", action: "Declined" })}
            >
              <X size={16} /> Decline
            </button>
          </div>
        )}

        {resolvedStatus === 'Approved' && (
          <div className={styles.actions} style={{ gridTemplateColumns: '1fr' }}>
            <button
              disabled={updatingId === b.id}
              className={styles.declineBtn}
              onClick={() => setDeclineModal({ show: true, booking: b, reason: "", action: "Cancelled" })}
            >
              {updatingId === b.id ? <Loader2 size={16} className={styles.spin} /> : <X size={16} />} Cancel Reservation
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Reservations Dashboard</h1>
        <div className={styles.headerActions}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "bookings" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings
            </button>
            <button
              className={`${styles.tab} ${activeTab === "calendar" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              <CalendarDays size={14} /> Calendar
            </button>
          </div>
          <button onClick={() => fetchBookings()} className={styles.refreshBtn}>Refresh</button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loader}><Loader2 className={styles.spin} size={32} /></div>
      ) : activeTab === "calendar" ? (
        <AdminCalendar bookings={bookings} />
      ) : (
        <>
          {/* Controls Bar for Filtering & Sorting */}
          <div className={styles.controlsBar}>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); resetPages(); }}
              className={styles.searchInput}
            />
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); resetPages(); }}
              className={styles.filterSelect}
            >
              <option value="all">All Event Types</option>
              <option value="Department Lunch / Dinner">Department Lunch / Dinner</option>
              <option value="Organization Event">Organization Event</option>
              <option value="Faculty Gathering">Faculty Gathering</option>
              <option value="University Function">University Function</option>
              <option value="Team Building Meal">Team Building Meal</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); resetPages(); }}
              className={styles.sortSelect}
            >
              <option value="date_asc">Event Date: Earliest First</option>
              <option value="date_desc">Event Date: Latest First</option>
              <option value="created_desc">Created Date: Newest First</option>
            </select>
          </div>

          {/* 3-Column Board Layout */}
          <div className={styles.board}>
            <Column
              title="Pending Bookings"
              items={pendingBookings}
              page={pendingPage}
              setPage={setPendingPage}
              renderCard={renderCard}
            />
            <Column
              title="Accepted Bookings"
              items={acceptedBookings}
              page={acceptedPage}
              setPage={setAcceptedPage}
              renderCard={renderCard}
            />
            <Column
              title="History & Completed"
              items={historyBookings}
              page={historyPage}
              setPage={setHistoryPage}
              renderCard={renderCard}
            />
          </div>
        </>
      )}

      {declineModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{declineModal.action === 'Cancelled' ? 'Cancel Reservation' : 'Decline Reservation'}</h3>
            <p>
              {declineModal.action === 'Cancelled'
                ? <>Cancel {declineModal.booking?.name}&apos;s approved reservation for <strong>{declineModal.booking?.date}</strong>?</>
                : <>Are you sure you want to decline {declineModal.booking?.name}&apos;s reservation?</>}
            </p>
            <textarea
              value={declineModal.reason}
              onChange={e => setDeclineModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder={declineModal.action === 'Cancelled' ? "Optional: Reason for cancellation (this will be emailed to the customer)" : "Optional: Reason for declining (this will be emailed to the customer)"}
              className={styles.reasonInput}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setDeclineModal({ show: false, booking: null, reason: "", action: "Declined" })} className={styles.cancelBtn}>Go Back</button>
              <button
                type="button"
                onClick={() => setConfirmModal({
                  show: true,
                  booking: declineModal.booking,
                  action: declineModal.action,
                  message: declineModal.reason
                })}
                className={styles.confirmDeclineBtn}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {approveModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Approve Reservation</h3>
            <p>Approve {approveModal.booking?.name}&apos;s reservation for <strong>{approveModal.booking?.date}</strong> at <strong>{approveModal.booking?.time}</strong>?</p>
            {isAlreadyBooked && (
              <p style={{ color: '#dc3545', fontSize: '13px', margin: '12px 0', fontWeight: 'bold' }}>
                ⚠️ Warning: Another reservation is already approved for this date ({approveModal.booking?.date}). You cannot approve multiple reservations for the same day.
              </p>
            )}
            <textarea
              value={approveModal.message}
              onChange={e => setApproveModal(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Optional: Add a message for the customer (e.g. 'Looking forward to serving you!')"
              className={styles.reasonInput}
              disabled={isAlreadyBooked}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setApproveModal({ show: false, booking: null, message: "" })} className={styles.cancelBtn}>Cancel</button>
              <button
                type="button"
                disabled={isAlreadyBooked}
                onClick={() => setConfirmModal({
                  show: true,
                  booking: approveModal.booking,
                  action: 'Approved',
                  message: approveModal.message
                })}
                className={styles.confirmApproveBtn}
              >
                <Check size={16} /> Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className={styles.modalOverlay} style={{ zIndex: 110 }}>
          <div className={styles.modal}>
            <h3 style={{ textTransform: 'capitalize' }}>Confirm {confirmModal.action === 'Approved' ? 'Approval' : confirmModal.action === 'Cancelled' ? 'Cancellation' : 'Decline'}</h3>
            <p>
              Are you sure you want to <strong>{
                confirmModal.action === 'Approved' ? 'approve' :
                confirmModal.action === 'Declined' ? 'decline' :
                confirmModal.action === 'Cancelled' ? 'cancel' :
                confirmModal.action.toLowerCase()
              }</strong> the reservation for <strong>{confirmModal.booking?.name}</strong>?
            </p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
              An email notification will be sent to <strong>{confirmModal.booking?.email}</strong>.
            </p>
            <div className={styles.modalActions} style={{ marginTop: '24px' }}>
              <button
                onClick={() => setConfirmModal({ show: false, booking: null, action: "", message: "" })}
                className={styles.cancelBtn}
                disabled={updatingId !== null}
              >
                Go Back
              </button>
              <button
                onClick={() => updateStatus(confirmModal.booking, confirmModal.action, confirmModal.message)}
                className={confirmModal.action === 'Approved' ? styles.confirmApproveBtn : styles.confirmDeclineBtn}
                disabled={updatingId !== null}
              >
                {updatingId !== null ? <Loader2 size={16} className={styles.spin} /> : 'Yes, Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
