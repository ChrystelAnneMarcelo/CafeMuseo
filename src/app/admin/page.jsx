"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Check, X, User, Mail, Phone, MapPin, ChevronLeft, ChevronRight, CalendarDays, Trash2 } from "lucide-react";
import styles from "./Admin.module.css";

function AdminCalendar({ bookings, setApproveModal, setCancelModal, setConfirmModal, updatingId, getResolvedStatus }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"

  // Get local date string for initial selection (today)
  const getLocalDateString = (d = new Date()) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation Logic
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const nextD = new Date(currentDate);
      nextD.setDate(currentDate.getDate() - 7);
      setCurrentDate(nextD);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextD = new Date(currentDate);
      nextD.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextD);
    }
  };

  // Helper to check if date matches selectedDate
  const isSelected = (dateStr) => dateStr === selectedDate;

  // Month View Days Generation
  const monthDays = [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    monthDays.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
  }

  const todayStr = getLocalDateString(new Date());

  // Week View Days Generation
  const startOfWeek = new Date(currentDate);
  const dayIndex = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayIndex);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    weekDays.push(dayDate);
  }

  // Set Title based on View Mode
  let calendarTitle = "";
  if (viewMode === "month") {
    calendarTitle = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      calendarTitle = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      const firstMonth = first.toLocaleDateString("en-US", { month: "short" });
      const lastMonth = last.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      calendarTitle = `${firstMonth} - ${lastMonth}`;
    }
  }

  // Gather active bookings for selected date side panel
  const activeBookings = bookings.filter(b => b.date === selectedDate);
  const formattedSelectedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const renderCell = (dayNumber, dateStr, key) => {
    const dayBookings = bookings.filter(b => b.date === dateStr);
    const approved = dayBookings.filter(b => b.status === "Approved");
    const pending = dayBookings.filter(b => b.status === "Pending" || !b.status);

    const isApp = approved.length > 0;
    const isPend = pending.length > 0;
    const isPast = dateStr < todayStr;
    const isSel = isSelected(dateStr);

    let cls = styles.calendarDay;
    if (isApp) cls += ` ${styles.calendarDayApproved}`;
    else if (isPend) cls += ` ${styles.calendarDayPending}`;
    if (isPast) cls += ` ${styles.calendarDayPast}`;
    if (dateStr === todayStr) cls += ` ${styles.calendarDayToday}`;
    if (isSel) cls += ` ${styles.calendarDaySelected}`;

    const totalCount = approved.length + pending.length;

    return (
      <div 
        key={key} 
        className={cls} 
        onClick={() => setSelectedDate(dateStr)}
        title={`${dayBookings.length} booking(s)`}
      >
        <span>{dayNumber}</span>
        {totalCount > 1 ? (
          <span className={`${styles.calendarDayBadge} ${
            isApp && !isPend ? styles.calendarDayBadgeApproved :
            !isApp && isPend ? styles.calendarDayBadgePending :
            styles.calendarDayBadgeMixed
          }`}>
            {totalCount}
          </span>
        ) : totalCount === 1 ? (
          <span 
            className={styles.calendarDot} 
            style={{ background: isApp ? "#28a745" : "#ffc107" }} 
          />
        ) : null}
      </div>
    );
  };

  const daysToRender = [];
  if (viewMode === "month") {
    // Render empty prepended cells for month padding
    daysToRender.push(...monthDays);
    // Render calendar days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      daysToRender.push(renderCell(d, dateStr, `day-${d}`));
    }
  } else {
    // Render week days
    weekDays.forEach((dayDate, idx) => {
      const dNum = dayDate.getDate();
      const dateStr = getLocalDateString(dayDate);
      daysToRender.push(renderCell(dNum, dateStr, `week-day-${idx}`));
    });
  }

  return (
    <div className={styles.calendarTabContainer}>
      {/* Left side: Calendar Grid */}
      <div className={styles.calendarCard}>
        {/* Toggle Mode */}
        <div className={styles.viewToggle}>
          <button 
            onClick={() => setViewMode("month")} 
            className={`${styles.viewToggleBtn} ${viewMode === "month" ? styles.viewToggleBtnActive : ""}`}
          >
            Month
          </button>
          <button 
            onClick={() => setViewMode("week")} 
            className={`${styles.viewToggleBtn} ${viewMode === "week" ? styles.viewToggleBtnActive : ""}`}
          >
            Week
          </button>
        </div>

        <div className={styles.calendarHeader}>
          <button onClick={handlePrev} className={styles.calendarNav}><ChevronLeft size={18} /></button>
          <h3 className={styles.calendarTitle}>{calendarTitle}</h3>
          <button onClick={handleNext} className={styles.calendarNav}><ChevronRight size={18} /></button>
        </div>
        <div className={styles.calendarWeekdays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className={styles.calendarWeekday}>{d}</div>
          ))}
        </div>
        <div className={styles.calendarGrid}>
          {daysToRender}
        </div>
        <div className={styles.calendarLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#28a745" }} /> Approved
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#ffc107" }} /> Pending
          </div>
        </div>
      </div>

      {/* Right side: Selected Day Detail list */}
      <div className={styles.sidePanel}>
        <h3 className={styles.sidePanelHeader}>Reservations: {formattedSelectedDate}</h3>
        {activeBookings.length === 0 ? (
          <div className={styles.sidePanelEmpty}>No bookings scheduled for this date.</div>
        ) : (
          <div className={styles.sidePanelList}>
            {activeBookings.map(b => {
              const resStatus = getResolvedStatus(b);
              return (
                <div key={b.id} className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <h4 className={styles.miniCardTitle}>{b.name}</h4>
                    <span className={`${styles.badge} ${styles["badge" + resStatus]}`}>
                      {resStatus}
                    </span>
                  </div>
                  
                  <div className={styles.miniCardRow}>
                    <strong>Time:</strong> {b.time}
                  </div>
                  <div className={styles.miniCardRow}>
                    <strong>Guests:</strong> {b.guests} Pax ({b.type})
                  </div>
                  <div className={styles.miniCardRow}>
                    <strong>Venue:</strong> {b.venue}
                  </div>
                  <div className={styles.miniCardRow}>
                    <strong>Contact:</strong> {b.phone} | {b.email}
                  </div>
                  {b.special_requests && (
                    <div className={styles.miniCardNotes}>
                      <strong>Notes:</strong> {b.special_requests}
                    </div>
                  )}

                  {/* Inline quick actions matching original design */}
                  {resStatus === "Pending" && (
                    <div className={styles.miniCardActions}>
                      <button
                        disabled={updatingId === b.id}
                        onClick={() => setApproveModal({ show: true, booking: b, message: "" })}
                        className={styles.miniApproveBtn}
                      >
                        {updatingId === b.id ? <Loader2 size={12} className={styles.spin} /> : <Check size={12} />} Approve
                      </button>
                      <button
                        disabled={updatingId === b.id}
                        onClick={() => setConfirmModal({ show: true, booking: b, action: "Delete", message: "" })}
                        className={styles.miniDeclineBtn}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}

                  {resStatus === "Approved" && (
                    <div className={styles.miniCardActions}>
                      <button
                        disabled={updatingId === b.id}
                        onClick={() => setCancelModal({ show: true, booking: b, reason: "" })}
                        className={styles.miniCancelBtn}
                      >
                        <X size={12} /> Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

// Sound synthesis chime for realtime bookings notifications
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, time, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.08, time); // Subtle volume
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = ctx.currentTime;
    // Sweet arpeggio chime: C6 (1046.50 Hz) and E6 (1318.51 Hz)
    playTone(1046.50, now, 0.4);
    playTone(1318.51, now + 0.08, 0.5);
  } catch (err) {
    console.warn("Audio chime blocked or not supported:", err);
  }
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = sessionStorage.getItem("adminToken");
      if (savedToken) {
        setPassword(savedToken);
        setLoggedIn(true);
      }
    }
  }, []);

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

  const [cancelModal, setCancelModal] = useState({ show: false, booking: null, reason: "" });
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
            playChime();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("adminToken", password);
        setLoggedIn(true);
      } else {
        alert("Incorrect password");
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed. Please try again.");
    }
  };

  const updateStatus = async (booking, newStatus, adminMessage = "") => {
    setUpdatingId(booking.id);

    const res = await fetch('/api/admin/update-booking', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
      },
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
      if (newStatus === "Delete") {
        setBookings(curr => curr.filter(b => b.id !== booking.id));
      } else {
        setBookings(curr => curr.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
      }
      setCancelModal({ show: false, booking: null, reason: "" });
      setApproveModal({ show: false, booking: null, message: "" });
      setConfirmModal({ show: false, booking: null, action: "", message: "" });
      if (!result.emailSent && newStatus !== "Delete") {
        alert(`Booking ${newStatus.toLowerCase()} successfully! (Email could not be sent - Resend free tier only allows sending to your registered email)`);
      } else if (newStatus === "Delete") {
        alert("Booking deleted successfully!");
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

  const uniqueEventTypes = useMemo(() => {
    const types = bookings.map(b => b.type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [bookings]);

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
              onClick={() => setConfirmModal({ show: true, booking: b, action: "Delete", message: "" })}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}

        {resolvedStatus === 'Approved' && (
          <div className={styles.actions} style={{ gridTemplateColumns: '1fr' }}>
            <button
              disabled={updatingId === b.id}
              className={styles.declineBtn}
              onClick={() => setCancelModal({ show: true, booking: b, reason: "" })}
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
        <AdminCalendar 
          bookings={bookings} 
          setApproveModal={setApproveModal}
          setCancelModal={setCancelModal}
          setConfirmModal={setConfirmModal}
          updatingId={updatingId}
          getResolvedStatus={getResolvedStatus}
        />
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
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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

      {cancelModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Cancel Reservation</h3>
            <p>
              Cancel {cancelModal.booking?.name}&apos;s approved reservation for <strong>{cancelModal.booking?.date}</strong>?
            </p>
            <textarea
              value={cancelModal.reason}
              onChange={e => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Required: Reason for cancellation (this will be emailed to the customer)"
              className={styles.reasonInput}
              required
            />
            <div className={styles.modalActions}>
              <button onClick={() => setCancelModal({ show: false, booking: null, reason: "" })} className={styles.cancelBtn}>Go Back</button>
              <button
                type="button"
                onClick={() => setConfirmModal({
                  show: true,
                  booking: cancelModal.booking,
                  action: "Cancelled",
                  message: cancelModal.reason
                })}
                className={styles.confirmDeclineBtn}
                disabled={!cancelModal.reason || !cancelModal.reason.trim()}
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
            <div className={styles.modalActions}>
              <button onClick={() => setApproveModal({ show: false, booking: null, message: "" })} className={styles.cancelBtn}>Cancel</button>
              <button
                type="button"
                onClick={() => setConfirmModal({
                  show: true,
                  booking: approveModal.booking,
                  action: 'Approved',
                  message: ''
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
            <h3 style={{ textTransform: "capitalize" }}>Confirm {confirmModal.action === "Approved" ? "Approval" : confirmModal.action === "Cancelled" ? "Cancellation" : confirmModal.action === "Delete" ? "Deletion" : "Decline"}</h3>
            <p>
              Are you sure you want to <strong>{
                confirmModal.action === "Approved" ? "approve" :
                  confirmModal.action === "Declined" ? "decline" :
                    confirmModal.action === "Cancelled" ? "cancel" :
                      confirmModal.action === "Delete" ? "delete" :
                        confirmModal.action.toLowerCase()
              }</strong> the reservation for <strong>{confirmModal.booking?.name}</strong>?
            </p>
            {confirmModal.action === "Delete" ? (
              <p style={{ fontSize: "13px", color: "#dc3545", fontWeight: "500", marginTop: "10px" }}>
                ⚠️ This booking will be permanently deleted from the database. No email notification will be sent to the customer.
              </p>
            ) : (
              <p style={{ fontSize: "13px", color: "#666", marginTop: "10px" }}>
                An email notification will be sent to <strong>{confirmModal.booking?.email}</strong>.
              </p>
            )}
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
