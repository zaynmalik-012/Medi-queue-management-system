// =========================================================
// 1. FIREBASE INITIALIZATION (Your Exact Config)
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyBObdWjBpQtZIO4x8GbKopAf9AkU84i9X8",
  authDomain: "mediqueue-opd.firebaseapp.com",
  databaseURL: "https://mediqueue-opd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediqueue-opd",
  storageBucket: "mediqueue-opd.firebasestorage.app",
  messagingSenderId: "17605326894",
  appId: "1:17605326894:web:78e594469fc01563c487bf"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Local session namespace (keeps login session per browser)
const STORAGE_PREFIX = "mediqueue_";

// Real-Time Cloud Memory Mirrors (Auto-updated by Firebase)
let cloudBookings = [];
let cloudPatients = [];
let cloudAvailability = [];
let cloudDirectConsults = [];

// =========================================================
// 2. MASTER OPD DEPARTMENTS & DOCTORS DIRECTORY
// =========================================================
const OPD_DEPARTMENTS = [
  { id: "gen", name: "General Medicine / General Doctor" },
  { id: "ped", name: "Pediatrics / Child Specialist" },
  { id: "ortho", name: "Orthopedics / Bones and Joints" },
  { id: "cardio", name: "Cardiology / Heart" },
  { id: "ent", name: "ENT / Ear, Nose and Throat" },
  { id: "derma", name: "Dermatology / Skin" },
  { id: "neuro", name: "Neurology / Brain and Nerves" },
  { id: "ophta", name: "Ophthalmology / Eye" },
  { id: "gyne", name: "Gynecology / Women's Health" },
  { id: "psych", name: "Psychiatry / Mental Health" },
  { id: "gastro", name: "Gastroenterology / Stomach and Digestive System" },
  { id: "pulmo", name: "Pulmonology / Lungs and Breathing" },
  { id: "uro", name: "Urology / Urinary System" },
  { id: "endo", name: "Endocrinology / Hormones and Diabetes" }
];

const defaultDoctors = [
  {
    id: "doc_rao",
    name: "Dr. Arvind Rao, MD",
    deptId: "gen",
    deptName: "General Medicine / General Doctor",
    room: "OPD 104",
    intercom: "Ext: 4104",
    phone: "+91 98201 44104",
    avgTime: 10,
    email: "dr.rao@hospital.org",
    password: "rao@med104"
  },
  {
    id: "doc_sen",
    name: "Dr. Sunita Sen, DCH",
    deptId: "ped",
    deptName: "Pediatrics / Child Specialist",
    room: "OPD 202",
    intercom: "Ext: 4202",
    phone: "+91 98201 44202",
    avgTime: 12,
    email: "dr.sen@hospital.org",
    password: "sen@ped202"
  },
  {
    id: "doc_mehta",
    name: "Dr. K. Mehta, MS",
    deptId: "ortho",
    deptName: "Orthopedics / Bones and Joints",
    room: "OPD 110",
    intercom: "Ext: 4110",
    phone: "+91 98201 44110",
    avgTime: 15,
    email: "dr.mehta@hospital.org",
    password: "mehta@ortho110"
  },
  {
    id: "doc_ali",
    name: "Dr. Farhan Ali, DM",
    deptId: "cardio",
    deptName: "Cardiology / Heart",
    room: "OPD 305",
    intercom: "Ext: 4305",
    phone: "+91 98201 44305",
    avgTime: 15,
    email: "dr.ali@hospital.org",
    password: "ali@cardio305"
  },
  {
    id: "doc_nayak",
    name: "Dr. R. Nayak, MS",
    deptId: "ent",
    deptName: "ENT / Ear, Nose and Throat",
    room: "OPD 108",
    intercom: "Ext: 4108",
    phone: "+91 98201 44108",
    avgTime: 10,
    email: "dr.nayak@hospital.org",
    password: "nayak@ent108"
  },
  {
    id: "doc_sharma",
    name: "Dr. P. Sharma, MD",
    deptId: "derma",
    deptName: "Dermatology / Skin",
    room: "OPD 214",
    intercom: "Ext: 4214",
    phone: "+91 98201 44214",
    avgTime: 10,
    email: "dr.sharma@hospital.org",
    password: "sharma@skin214"
  },
  {
    id: "doc_verma",
    name: "Dr. N. Verma, DM",
    deptId: "neuro",
    deptName: "Neurology / Brain and Nerves",
    room: "OPD 312",
    intercom: "Ext: 4312",
    phone: "+91 98201 44312",
    avgTime: 15,
    email: "dr.verma@hospital.org",
    password: "verma@neuro312"
  },
  {
    id: "doc_kapoor",
    name: "Dr. S. Kapoor, MS",
    deptId: "ophta",
    deptName: "Ophthalmology / Eye",
    room: "OPD 118",
    intercom: "Ext: 4118",
    phone: "+91 98201 44118",
    avgTime: 10,
    email: "dr.kapoor@hospital.org",
    password: "kapoor@eye118"
  }
];

const ALL_20MIN_SLOTS = [
  "09:00 AM - 09:20 AM",
  "09:20 AM - 09:40 AM",
  "09:40 AM - 10:00 AM",
  "10:00 AM - 10:20 AM",
  "10:20 AM - 10:40 AM",
  "10:40 AM - 11:00 AM",
  "11:20 AM - 11:40 AM",
  "11:40 AM - 12:00 PM",
  "12:00 PM - 12:20 PM",
  "12:20 PM - 12:40 PM",
  "02:00 PM - 02:20 PM",
  "02:20 PM - 02:40 PM",
  "02:40 PM - 03:00 PM",
  "03:00 PM - 03:20 PM",
  "03:20 PM - 03:40 PM",
  "03:40 PM - 04:00 PM"
];

const emergencyDoctors = [
  { name: "Dr. Vikram Deshmukh", role: "Chief Trauma Specialist", phone: "+91 98201 11999", room: "Emergency Bay 1" },
  { name: "Dr. Neha Kulkarni", role: "Critical Care & Resuscitation", phone: "+91 98201 22888", room: "ICU Triage" },
  { name: "Dr. Tariq Sheikh", role: "Acute Surgical Resident", phone: "+91 98201 33777", room: "Trauma OT" }
];

let isBookingLock = false;
let currentTargetDoctor = null;
let currentPendingReportBase64 = null;
let callTimerInterval = null;

// =========================================================
// 3. CLOUD DATABASE GETTERS, SETTERS & REAL-TIME LISTENERS
// =========================================================
function getDoctors() {
  return defaultDoctors;
}

function getBookings() {
  return cloudBookings;
}

function saveBookings(bookings) {
  cloudBookings = bookings;
  bookings.forEach(booking => {
    db.collection("bookings").doc(booking.bookingId).set(booking)
      .catch(err => console.error("Firebase booking write error:", err));
  });
}

function getDoctorAvailabilityRecords() {
  return cloudAvailability;
}

function saveDoctorAvailabilityRecords(records) {
  cloudAvailability = records;
  records.forEach(record => {
    db.collection("doctor_availability").doc(record.doctorId).set(record)
      .catch(err => console.error("Firebase availability write error:", err));
  });
}

function getDoctorAvailability(docId) {
  const records = getDoctorAvailabilityRecords();
  return records.find(r => r.doctorId === docId) || {
    doctorId: docId,
    isAvailable: true,
    status: "Active",
    startTime: null,
    expectedReturnTime: null,
    reason: ""
  };
}

function getDirectConsultations() {
  return cloudDirectConsults;
}

function saveDirectConsultations(consults) {
  cloudDirectConsults = consults;
  consults.forEach(channel => {
    db.collection("direct_consults").doc(channel.channelKey).set(channel)
      .catch(err => console.error("Firebase consult write error:", err));
  });
}

function getActiveUser() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_user") || "null");
}

function getActiveDoctor() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_doc") || "null");
}

function getMyToken() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "my_token") || "null");
}

function initRealtimeDatabaseListeners() {
  // 1. Real-time Bookings & Queue Stream
  db.collection("bookings").onSnapshot(snapshot => {
    cloudBookings = snapshot.docs.map(doc => doc.data());
    refreshAllVisibleViews();
  }, err => console.error("Bookings listener error:", err));

  // 2. Real-time Doctor Availability / Pause Stream
  db.collection("doctor_availability").onSnapshot(snapshot => {
    cloudAvailability = snapshot.docs.map(doc => doc.data());
    refreshAllVisibleViews();
  }, err => console.error("Availability listener error:", err));

  // 3. Real-time Direct Specialist Chat & Report Stream
  db.collection("direct_consults").onSnapshot(snapshot => {
    cloudDirectConsults = snapshot.docs.map(doc => doc.data());
    if (currentTargetDoctor) {
      renderDirectConsultMessages();
    }
  }, err => console.error("Consultations listener error:", err));

  // 4. Real-time Patients Account Stream
  db.collection("patients").onSnapshot(snapshot => {
    cloudPatients = snapshot.docs.map(doc => doc.data());
  }, err => console.error("Patients listener error:", err));
}

function refreshAllVisibleViews() {
  renderHome();
  renderLiveQueueBoard();
  renderPatientTokenView();
  renderDoctorDesk();
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================================================
// 4. SMART QUEUE ENGINE (Preserves Late Patient Priority)
// =========================================================
// Helper: Converts slot string (e.g. "03:00 PM - 03:20 PM") into minutes from midnight for accurate sorting
function getSlotStartMinutes(slotStr) {
  if (!slotStr) return 9999;
  const startPart = slotStr.split("-")[0].trim(); // e.g., "03:00 PM"
  const [time, modifier] = startPart.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return (hours * 60) + minutes;
}

// =========================================================
// 4. SMART QUEUE ENGINE (Sorts by Appointment Slot + Preserves Late Priority)
// =========================================================
const SmartQueue = {
  getDoctorQueue(docId, date) {
    const bookings = getBookings();
    return bookings.filter(b => b.doctorId === docId && b.appointmentDate === date && b.status !== "Cancelled");
  },

  // Sorts by chronological appointment time slot first, then original tokenNumber
  getEligibleQueue(docId, date) {
    const queue = this.getDoctorQueue(docId, date);
    return queue
      .filter(b => b.status === "Waiting" || b.status === "Arrived Late – Waiting")
      .sort((a, b) => {
        const slotDiff = getSlotStartMinutes(a.timeSlot) - getSlotStartMinutes(b.timeSlot);
        if (slotDiff !== 0) return slotDiff;
        return parseInt(a.tokenNumber, 10) - parseInt(b.tokenNumber, 10);
      });
  },

  getCurrentPatient(docId, date) {
    const queue = this.getDoctorQueue(docId, date);
    return queue.find(b => b.status === "In Consultation" || b.status === "Called") || null;
  },

  getLateAwaitingQueue(docId, date) {
    const queue = this.getDoctorQueue(docId, date);
    return queue
      .filter(b => b.status === "No Show – Awaiting Arrival")
      .sort((a, b) => getSlotStartMinutes(a.timeSlot) - getSlotStartMinutes(b.timeSlot));
  },

  callNext(docId, date) {
    const avail = getDoctorAvailability(docId);
    if (!avail.isAvailable) {
      return { success: false, message: "Consultations are paused. Resume availability first." };
    }

    const current = this.getCurrentPatient(docId, date);
    if (current && current.status === "In Consultation") {
      return { success: false, message: "A patient is currently In Consultation. Complete it before calling next." };
    }

    const eligible = this.getEligibleQueue(docId, date);
    if (eligible.length === 0) {
      return { success: false, message: "No waiting patients eligible in the queue." };
    }

    const nextOne = eligible[0];
    const all = getBookings();
    const target = all.find(b => b.bookingId === nextOne.bookingId);
    if (target) {
      target.status = "Called";
      target.calledTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      this.recalculateWaitTimes(docId, date, all);
      saveBookings(all);
      return { success: true, booking: target };
    }
    return { success: false, message: "Patient not found." };
  },

  startConsultation(bookingId) {
    const all = getBookings();
    const target = all.find(b => b.bookingId === bookingId);
    if (!target) return { success: false, message: "Booking not found." };
    if (target.status !== "Called") {
      return { success: false, message: "Patient must be Called before starting consultation." };
    }

    target.status = "In Consultation";
    target.consultationStartTime = Date.now();
    this.recalculateWaitTimes(target.doctorId, target.appointmentDate, all);
    saveBookings(all);
    return { success: true, booking: target };
  },

  completeConsultation(bookingId) {
    const all = getBookings();
    const target = all.find(b => b.bookingId === bookingId);
    if (!target) return { success: false, message: "Booking not found." };
    if (target.status !== "In Consultation") {
      return { success: false, message: "Consultation is not in progress." };
    }

    target.status = "Completed";
    target.completedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.recalculateWaitTimes(target.doctorId, target.appointmentDate, all);
    saveBookings(all);
    return { success: true, booking: target };
  },

  markNoShow(bookingId) {
    const all = getBookings();
    const target = all.find(b => b.bookingId === bookingId);
    if (!target) return { success: false, message: "Booking not found." };
    if (target.status !== "Called") {
      return { success: false, message: "Only Called patients can be marked No Show." };
    }

    target.status = "No Show – Awaiting Arrival";
    this.recalculateWaitTimes(target.doctorId, target.appointmentDate, all);
    saveBookings(all);
    return { success: true, booking: target };
  },

  patientArrived(bookingId) {
    const all = getBookings();
    const target = all.find(b => b.bookingId === bookingId);
    if (!target) return { success: false, message: "Booking not found." };
    if (target.status !== "No Show – Awaiting Arrival") {
      return { success: false, message: "Patient status is not No Show." };
    }

    target.status = "Arrived Late – Waiting";
    this.recalculateWaitTimes(target.doctorId, target.appointmentDate, all);
    saveBookings(all);
    return { success: true, booking: target };
  },

  cancelToken(bookingId) {
    const all = getBookings();
    const target = all.find(b => b.bookingId === bookingId);
    if (!target) return { success: false, message: "Booking not found." };
    if (target.status === "Completed") {
      return { success: false, message: "Cannot cancel a completed appointment." };
    }
    if (target.status === "Cancelled") {
      return { success: false, message: "Token is already cancelled." };
    }

    target.status = "Cancelled";
    this.recalculateWaitTimes(target.doctorId, target.appointmentDate, all);
    saveBookings(all);
    return { success: true, booking: target };
  },

  recalculateWaitTimes(docId, date, bookingsList = null) {
    const all = bookingsList || getBookings();
    const docs = getDoctors();
    const doc = docs.find(d => d.id === docId) || { avgTime: 10 };

    // Sort chronologically by slot time first, then token number
    const eligible = all
      .filter(b => b.doctorId === docId && b.appointmentDate === date && (b.status === "Waiting" || b.status === "Arrived Late – Waiting"))
      .sort((a, b) => {
        const slotDiff = getSlotStartMinutes(a.timeSlot) - getSlotStartMinutes(b.timeSlot);
        if (slotDiff !== 0) return slotDiff;
        return parseInt(a.tokenNumber, 10) - parseInt(b.tokenNumber, 10);
      });

    const inConsult = all.some(b => b.doctorId === docId && b.appointmentDate === date && b.status === "In Consultation");
    const avail = getDoctorAvailability(docId);

    let baseDelay = inConsult ? doc.avgTime : 0;
    if (!avail.isAvailable) {
      baseDelay += 30;
    }

    eligible.forEach((item, index) => {
      const wait = (index * doc.avgTime) + baseDelay;
      const ref = all.find(b => b.bookingId === item.bookingId);
      if (ref) {
        ref.estimatedWaitMinutes = wait;
      }
    });
  }
};

// =========================================================
// 5. NAVIGATION & TOAST NOTIFICATIONS
// =========================================================
function navigateTo(viewName) {
  const views = ["home", "book", "track", "patient", "doctor", "auth"];
  views.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.classList.add("hidden");
    const navBtn = document.getElementById("nav-" + v);
    if (navBtn) navBtn.classList.remove("active");
  });

  const targetView = document.getElementById("view-" + viewName);
  if (targetView) targetView.classList.remove("hidden");

  const targetBtn = document.getElementById("nav-" + viewName);
  if (targetBtn) targetBtn.classList.add("active");

  window.scrollTo(0, 0);

  if (viewName === "home") renderHome();
  if (viewName === "track") renderLiveQueueBoard();
  if (viewName === "book") renderBookingForm();
  if (viewName === "patient") renderPatientTokenView();
  if (viewName === "doctor") renderDoctorDesk();
  updateAuthHeader();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}

function updateAuthHeader() {
  const authBox = document.getElementById("auth-header-actions");
  if (!authBox) return;
  const user = getActiveUser();
  if (user) {
    authBox.innerHTML = `
      <span class="user-name-tag">👤 ${escapeHtml(user.name.split(" ")[0])}</span>
      <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Sign Out</button>
    `;
  } else {
    authBox.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="navigateTo('auth')">Sign In / Register</button>
    `;
  }
}

// =========================================================
// 6. HOME VIEW
// =========================================================
function renderHome() {
  const container = document.getElementById("home-dept-list");
  if (!container) return;
  const docs = getDoctors();
  const today = getTodayString();

  container.innerHTML = docs.map(d => {
    const eligible = SmartQueue.getEligibleQueue(d.id, today);
    const avail = getDoctorAvailability(d.id);
    const waitMins = eligible.length * d.avgTime;

    return `
      <div class="card">
        <h3 style="color:var(--primary-navy); margin-bottom:0.25rem;">${escapeHtml(d.deptName)}</h3>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:0.75rem;">${escapeHtml(d.name)} • ${d.room}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
          <span style="font-size:0.9rem;">Waiting: <strong>${eligible.length}</strong></span>
          ${!avail.isAvailable ? 
            `<span class="q-badge q-noshow">Unavailable (${avail.expectedReturnTime || 'Paused'})</span>` : 
            `<span style="font-size:0.95rem; font-weight:700; color:var(--medical-blue);">~${waitMins} mins wait</span>`
          }
        </div>
      </div>
    `;
  }).join("");
}

function handleStartBooking() {
  const user = getActiveUser();
  if (!user) {
    showToast("Please create an account or sign in first.");
    navigateTo("auth");
  } else {
    navigateTo("book");
  }
}

// =========================================================
// 7. BOOKING VIEW & SLOT LOCKING
// =========================================================
function renderBookingForm() {
  const deptSelect = document.getElementById("book-department");
  if (!deptSelect) return;

  deptSelect.innerHTML = OPD_DEPARTMENTS.map(d => 
    `<option value="${d.id}">${d.name}</option>`
  ).join("");

  const today = getTodayString();
  const dateInput = document.getElementById("book-date");
  if (!dateInput.value) {
    dateInput.value = today;
  }
  dateInput.min = today;

  onDepartmentSelectChange();
}

function onDepartmentSelectChange() {
  const deptId = document.getElementById("book-department").value;
  const docs = getDoctors();
  const filteredDocs = docs.filter(d => d.deptId === deptId);

  const docSelect = document.getElementById("book-doctor");
  if (filteredDocs.length === 0) {
    docSelect.innerHTML = `<option value="">No Doctor Available in this OPD</option>`;
    document.getElementById("btn-submit-booking").disabled = true;
  } else {
    document.getElementById("btn-submit-booking").disabled = false;
    docSelect.innerHTML = filteredDocs.map(d => 
      `<option value="${d.id}">${escapeHtml(d.name)} (${d.room})</option>`
    ).join("");
  }

  onDoctorOrDateChange();
}

function onDoctorOrDateChange() {
  const docId = document.getElementById("book-doctor").value;
  const date = document.getElementById("book-date").value;
  const docs = getDoctors();
  const doc = docs.find(d => d.id === docId);

  if (!doc) {
    document.getElementById("preview-doc-name").innerText = "No Doctor";
    document.getElementById("preview-doc-dept").innerText = "Department Closed";
    document.getElementById("preview-doc-queue").innerText = "0 Waiting";
    document.getElementById("preview-doc-wait").innerText = "~0 Mins";
    document.getElementById("book-slot").innerHTML = `<option value="">No slots</option>`;
    return;
  }

  updateBookingPreview(doc, date);
  populateAvailableSlots(doc.id, date);
}

function populateAvailableSlots(doctorId, date) {
  const slotSelect = document.getElementById("book-slot");
  const bookings = getBookings();

  const bookedSlots = bookings
    .filter(b => b.doctorId === doctorId && b.appointmentDate === date && b.status !== "Cancelled")
    .map(b => b.timeSlot);

  const freeSlots = ALL_20MIN_SLOTS.filter(slot => !bookedSlots.includes(slot));

  if (freeSlots.length === 0) {
    slotSelect.innerHTML = `<option value="">⚠️ No slots available for this date (All Booked)</option>`;
    slotSelect.disabled = true;
    document.getElementById("btn-submit-booking").disabled = true;
  } else {
    slotSelect.disabled = false;
    document.getElementById("btn-submit-booking").disabled = false;
    slotSelect.innerHTML = freeSlots.map(slot => `<option value="${slot}">${slot}</option>`).join("");
  }
}

function updateBookingPreview(doc, date) {
  const eligible = SmartQueue.getEligibleQueue(doc.id, date || getTodayString());
  const waitMins = eligible.length * doc.avgTime;

  document.getElementById("preview-doc-name").innerText = doc.name;
  document.getElementById("preview-doc-dept").innerText = `${doc.deptName} • ${doc.room}`;
  document.getElementById("preview-doc-queue").innerText = `${eligible.length} Patients Waiting`;
  document.getElementById("preview-doc-wait").innerText = `~${waitMins} Mins Wait Time`;
}

function handleBookingSubmit(e) {
  e.preventDefault();
  if (isBookingLock) return;

  const user = getActiveUser();
  if (!user) {
    showToast("Session expired. Please log in.");
    navigateTo("auth");
    return;
  }

  const docId = document.getElementById("book-doctor").value;
  const date = document.getElementById("book-date").value;
  const slot = document.getElementById("book-slot").value;
  const symptom = document.getElementById("book-symptom").value.trim();

  if (!docId || !slot) {
    alert("Please select an active doctor and an available time slot.");
    return;
  }

  const docs = getDoctors();
  const doc = docs.find(d => d.id === docId);
  const bookings = getBookings();

  const duplicate = bookings.find(b => 
    b.patientId === user.id &&
    b.departmentId === doc.deptId &&
    b.appointmentDate === date &&
    b.status !== "Cancelled" &&
    b.status !== "Completed"
  );

  if (duplicate) {
    alert(`You already hold Token #${duplicate.tokenNumber} (${duplicate.tokenCode}) for this department today.`);
    return;
  }

  isBookingLock = true;
  const submitBtn = document.getElementById("btn-submit-booking");
  submitBtn.disabled = true;
  submitBtn.innerText = "Reserving Token...";

  const doctorDailyBookings = bookings.filter(b => b.doctorId === doc.id && b.appointmentDate === date);
  const nextTokenNum = doctorDailyBookings.length + 1;
  const formattedTokenNum = String(nextTokenNum).padStart(2, "0");
  const tokenCode = `MQ-${doc.deptId.toUpperCase()}-${formattedTokenNum}`;

  const newBooking = {
    bookingId: "BKG-" + Date.now().toString().slice(-6),
    doctorId: doc.id,
    doctorName: doc.name,
    departmentId: doc.deptId,
    department: doc.deptName,
    room: doc.room,
    patientId: user.id,
    patientName: user.name,
    patientPhone: user.phone,
    appointmentDate: date,
    timeSlot: slot,
    tokenCode: tokenCode,
    tokenNumber: formattedTokenNum,
    symptoms: symptom || "General consultation",
    status: "Waiting",
    estimatedWaitMinutes: doctorDailyBookings.length * doc.avgTime,
    bookedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  bookings.push(newBooking);
  SmartQueue.recalculateWaitTimes(doc.id, date, bookings);
  saveBookings(bookings);

  localStorage.setItem(STORAGE_PREFIX + "my_token", JSON.stringify(newBooking));

  showToast(`Token ${tokenCode} booked successfully!`);
  isBookingLock = false;
  submitBtn.disabled = false;
  submitBtn.innerText = "Confirm & Generate Token";

  navigateTo("patient");
}

// =========================================================
// 8. LIVE QUEUE BOARD
// =========================================================
function renderLiveQueueBoard() {
  const container = document.getElementById("queue-board-list");
  if (!container) return;
  const docs = getDoctors();
  const today = getTodayString();

  container.innerHTML = docs.map(d => {
    const current = SmartQueue.getCurrentPatient(d.id, today);
    const eligible = SmartQueue.getEligibleQueue(d.id, today);
    const avail = getDoctorAvailability(d.id);
    const waitTime = eligible.length * d.avgTime;

    return `
      <div class="card" style="border-top:3px solid var(--primary-navy);">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
          <div>
            <h3 style="font-size:1.15rem; color:var(--primary-navy);">${escapeHtml(d.deptName)}</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">${d.room} • ${d.intercom}</span>
          </div>
          <span class="q-badge ${avail.isAvailable ? 'q-called' : 'q-noshow'}">
            ${avail.isAvailable ? 'Active' : 'Doctor Unavailable'}
          </span>
        </div>
        <p style="font-weight:600; font-size:0.95rem; margin-bottom:0.75rem;">${escapeHtml(d.name)}</p>
        
        ${!avail.isAvailable ? `
          <div class="app-alert alert-paused" style="padding:0.75rem; margin-bottom:1rem; font-size:0.85rem;">
            <strong>Temporarily Unavailable:</strong> ${avail.startTime} - ${avail.expectedReturnTime}<br>
            <em>${escapeHtml(avail.reason || 'Emergency rounds')}</em>
          </div>
        ` : ''}

        <div style="background:#f8fafc; border:1px solid var(--border-subtle); padding:1rem; border-radius:6px; margin-bottom:1rem; text-align:center;">
          <div style="font-size:0.85rem; color:var(--text-muted);">Now Consulting</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary-navy);">
            ${current ? current.tokenCode : "None (In Waiting)"}
          </div>
          ${current ? `<span class="q-badge ${current.status === 'In Consultation' ? 'q-consulting' : 'q-called'}">${current.status}</span>` : ''}
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.92rem;">
          <span>In Waiting Queue: <strong>${eligible.length}</strong></span>
          <span style="color:var(--medical-blue); font-weight:700;">~${waitTime} mins wait</span>
        </div>
      </div>
    `;
  }).join("");
}

// =========================================================
// 9. PATIENT DASHBOARD / ACTIVE TOKEN
// =========================================================
function renderPatientTokenView() {
  const container = document.getElementById("patient-token-container");
  if (!container) return;
  const storedToken = getMyToken();

  if (!storedToken) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem 1.5rem; max-width:550px; margin:0 auto;">
        <h3 style="color:var(--primary-navy); margin-bottom:0.5rem;">No Active Token Found</h3>
        <p class="text-muted" style="margin-bottom:1.5rem;">You do not currently have an active OPD appointment token booked.</p>
        <button class="btn btn-primary" onclick="handleStartBooking()">Book a Token Now</button>
      </div>
    `;
    return;
  }

  const allBookings = getBookings();
  const token = allBookings.find(b => b.bookingId === storedToken.bookingId) || storedToken;
  const avail = getDoctorAvailability(token.doctorId);
  const eligibleQueue = SmartQueue.getEligibleQueue(token.doctorId, token.appointmentDate);
  const currentConsulting = SmartQueue.getCurrentPatient(token.doctorId, token.appointmentDate);

  let positionAhead = 0;
  const myQueueIdx = eligibleQueue.findIndex(b => b.bookingId === token.bookingId);
  if (myQueueIdx >= 0) {
    positionAhead = myQueueIdx;
  }

  container.innerHTML = `
    <div class="token-display-box">
      ${!avail.isAvailable ? `
        <div class="app-alert alert-paused" style="text-align:left; margin-bottom:1.25rem;">
          <strong>Doctor Temporarily Unavailable:</strong> ${escapeHtml(token.doctorName)} is on a temporary emergency break from ${avail.startTime} to ${avail.expectedReturnTime} (${escapeHtml(avail.reason || 'Hospital duty')}).
          <br><small>Your token and queue position are secured and will resume as soon as the doctor returns.</small>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge">Confirmed Appointment</span>
        <span class="q-badge ${getStatusBadgeClass(token.status)}">${token.status}</span>
      </div>

      <div class="token-huge">${token.tokenCode}</div>
      <p style="color:var(--text-muted); font-size:0.95rem;">Patient: <strong>${escapeHtml(token.patientName)}</strong></p>
      
      <div class="wait-callout">
        ${token.status === "In Consultation" ? 
          "🟢 You are currently in Consultation Room!" : 
          token.status === "Called" ? 
          "🔔 Your Token is Called! Please step inside the OPD room immediately." : 
          token.status === "No Show – Awaiting Arrival" ? 
          "⚠️ Marked No-Show. Please contact the room staff to reclaim your turn." : 
          positionAhead === 0 ? 
          "You're Next! Please be ready outside the door." : 
          `~${token.estimatedWaitMinutes || 0} Minutes (~${positionAhead} patients ahead)`
        }
      </div>

      <table class="info-table">
        <tr>
          <td>Department</td>
          <td>${escapeHtml(token.department)}</td>
        </tr>
        <tr>
          <td>Doctor</td>
          <td>${escapeHtml(token.doctorName)}</td>
        </tr>
        <tr>
          <td>Room</td>
          <td>${token.room}</td>
        </tr>
        <tr>
          <td>Reserved Slot</td>
          <td><strong style="color:var(--primary-navy);">${token.timeSlot}</strong> (${token.appointmentDate})</td>
        </tr>
        <tr>
          <td>Doctor Currently Serving</td>
          <td>${currentConsulting ? currentConsulting.tokenCode : "None"}</td>
        </tr>
      </table>

      <div style="margin-top:1.8rem; display:flex; gap:0.75rem;">
        <button class="btn btn-secondary flex-1" onclick="navigateTo('track')">Live Queue Board</button>
        ${(token.status === "Waiting" || token.status === "Arrived Late – Waiting" || token.status === "Called") ? `
          <button class="btn btn-danger flex-1" onclick="handlePatientCancelToken('${token.bookingId}')">Cancel Token</button>
        ` : ''}
      </div>
    </div>
  `;
}

function handlePatientCancelToken(bookingId) {
  if (confirm("Are you sure you want to cancel your appointment token? This releases your slot and cannot be reclaimed.")) {
    const res = SmartQueue.cancelToken(bookingId);
    if (!res.success) {
      alert(res.message);
    } else {
      localStorage.removeItem(STORAGE_PREFIX + "my_token");
      showToast("Your token booking has been cancelled.");
      renderPatientTokenView();
    }
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Waiting": return "q-waiting";
    case "Called": return "q-called";
    case "In Consultation": return "q-consulting";
    case "Completed": return "q-completed";
    case "No Show – Awaiting Arrival": return "q-noshow";
    case "Arrived Late – Waiting": return "q-late";
    case "Cancelled": return "q-cancelled";
    default: return "q-waiting";
  }
}

// =========================================================
// 10. DOCTOR AUTHENTICATION & DESK
// =========================================================
function renderDoctorDesk() {
  const container = document.getElementById("doctor-view-container");
  if (!container) return;
  const activeDoc = getActiveDoctor();
  const docs = getDoctors();

  if (!activeDoc) {
    container.innerHTML = `
      <div class="auth-card">
        <div class="form-header">
          <h2>Doctor Consultation Desk Login</h2>
          <p>Secure login for hospital specialists and OPD consultants.</p>
        </div>
        <form onsubmit="handleDoctorLogin(event)">
          <div class="form-group">
            <label>Doctor's Official Email</label>
            <input type="email" id="doc-email" class="form-input" placeholder="e.g. dr.rao@hospital.org" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="doc-pass" class="form-input" placeholder="Enter password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Access My Consultation Desk</button>
        </form>

        <div style="margin-top:1.5rem; background:#f8fafc; border:1px solid var(--border-color); border-radius:6px; padding:1rem;">
          <strong style="display:block; font-size:0.9rem; margin-bottom:0.5rem; color:var(--primary-navy);">
            📋 Demo Doctor Login Directory (Click to Auto-Fill):
          </strong>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.82rem;">
            ${docs.map(d => `
              <div style="padding:0.4rem; background:#fff; border:1px solid #e2e8f0; border-radius:4px; cursor:pointer;" onclick="autofillDocLogin('${d.email}','${d.password}')">
                <strong>${d.name.split(',')[0]}</strong><br>
                <span class="text-muted">${d.deptName.split('/')[0]}</span><br>
                <span style="color:var(--medical-blue); font-family:monospace;">${d.email}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  const today = getTodayString();
  const currentDoc = docs.find(d => d.id === activeDoc.id) || activeDoc;
  const dailyQueue = SmartQueue.getDoctorQueue(currentDoc.id, today);
  const eligible = SmartQueue.getEligibleQueue(currentDoc.id, today);
  const current = SmartQueue.getCurrentPatient(currentDoc.id, today);
  const lateList = SmartQueue.getLateAwaitingQueue(currentDoc.id, today);
  const avail = getDoctorAvailability(currentDoc.id);

  const totalToday = dailyQueue.length;
  const inConsultCount = dailyQueue.filter(b => b.status === "In Consultation").length;
  const noShowCount = lateList.length;

  container.innerHTML = `
    <div style="max-width:1100px; margin:0 auto;">
      <!-- Top Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.5rem;">
        <div>
          <h2>${escapeHtml(currentDoc.name)}</h2>
          <p class="text-muted">${escapeHtml(currentDoc.deptName)} • Room: <strong>${currentDoc.room}</strong> • <strong>${currentDoc.intercom}</strong></p>
        </div>
        <div style="display:flex; gap:0.6rem;">
          <button class="btn ${avail.isAvailable ? 'btn-secondary' : 'btn-success'} btn-sm" onclick="handleToggleUnavailability('${currentDoc.id}')">
            ${avail.isAvailable ? 'Set Unavailability / Break' : 'Resume Queue Now'}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="handleDoctorLogout()">Sign Out</button>
        </div>
      </div>

      <!-- Doctor Unavailability Notification -->
      ${!avail.isAvailable ? `
        <div class="app-alert alert-paused">
          <strong>Consultations Paused:</strong> You are marked unavailable from ${avail.startTime} to ${avail.expectedReturnTime} (${escapeHtml(avail.reason)}). Patients are informed that queue positions are secured.
        </div>
      ` : ''}

      <!-- Statistics Row -->
      <div class="grid grid-4" style="margin-bottom:1.5rem;">
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.8rem;">TOTAL TODAY</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary-navy);">${totalToday}</div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.8rem;">WAITING</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--medical-blue);">${eligible.length}</div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.8rem;">CONSULTING</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--success);">${inConsultCount}</div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.8rem;">NO-SHOW / LATE</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--danger);">${noShowCount}</div>
        </div>
      </div>

      <div class="grid grid-2">
        <!-- Left Column: Active Patient Management -->
        <div>
          <div class="card" style="margin-bottom:1.5rem;">
            <h3 style="color:var(--primary-navy); margin-bottom:1rem;">Active Consultation Desk</h3>
            ${!current ? `
              <div style="text-align:center; padding:1.5rem 0;">
                <p class="text-muted" style="margin-bottom:1rem;">No patient is currently inside the consultation room.</p>
                <button class="btn btn-primary btn-lg" onclick="handleDocCallNext('${currentDoc.id}')">
                  🔔 Call Next Patient
                </button>
              </div>
            ` : `
              <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:6px; padding:1.2rem; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:1.3rem; color:var(--primary-navy);">${current.tokenCode} (#${current.tokenNumber})</strong>
                  <span class="q-badge ${current.status === 'In Consultation' ? 'q-consulting' : 'q-called'}">${current.status}</span>
                </div>
                <div style="margin:0.5rem 0;">
                  <span style="font-weight:600;">Patient:</span> ${escapeHtml(current.patientName)} | 
                  <span style="font-weight:600;">Phone:</span> ${escapeHtml(current.patientPhone)}
                </div>
                <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:1rem;">
                  <strong>Symptoms:</strong> ${escapeHtml(current.symptoms)}
                </div>

                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  ${current.status === "Called" ? `
                    <button class="btn btn-success flex-1" onclick="handleDocStartConsultation('${current.bookingId}')">
                      ▶️ Start Consultation
                    </button>
                    <button class="btn btn-warning flex-1" onclick="handleDocMarkNoShow('${current.bookingId}')">
                      ⚠️ Mark No Show
                    </button>
                  ` : `
                    <button class="btn btn-primary flex-1" onclick="handleDocCompleteConsultation('${current.bookingId}')">
                      ✓ Complete Consultation
                    </button>
                  `}
                  <button class="btn btn-danger btn-sm" onclick="handleDocCancelToken('${current.bookingId}')">
                    Cancel Token
                  </button>
                </div>
              </div>
            `}
          </div>

          <!-- Late / Awaiting Arrival Section -->
          <div class="card">
            <h3 style="color:var(--primary-navy); margin-bottom:0.5rem;">Late / Awaiting Arrival</h3>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
              Patients who arrived after their slot. Confirming arrival restores original priority ahead of later tokens.
            </p>
            ${lateList.length === 0 ? `
              <p class="text-muted" style="font-size:0.9rem;">No late patients currently awaiting arrival.</p>
            ` : `
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${lateList.map(item => `
                    <tr>
                      <td><strong>${item.tokenCode}</strong></td>
                      <td>${escapeHtml(item.patientName)}</td>
                      <td><span class="q-badge q-noshow">${item.status}</span></td>
                      <td>
                        <button class="btn btn-success btn-sm" onclick="handleDocPatientArrived('${item.bookingId}')">
                          ✓ Patient Arrived
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Right Column: Queue Order & DIRECT Specialist Directory -->
        <div>
          <div class="card" style="margin-bottom:1.5rem;">
            <h3 style="color:var(--primary-navy); margin-bottom:0.5rem;">Current Waiting Queue</h3>
            ${eligible.length === 0 ? `
              <p class="text-muted" style="font-size:0.9rem;">No patients waiting in queue.</p>
            ` : `
              <table class="info-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <th>Patient Name</th>
                    <th>Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${eligible.map((item, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${item.tokenCode}</strong></td>
                      <td>${escapeHtml(item.patientName)}</td>
                      <td style="font-size:0.82rem;">${item.timeSlot}</td>
                      <td><span class="q-badge ${item.status === 'Arrived Late – Waiting' ? 'q-late' : 'q-waiting'}">${item.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>

          <!-- DIRECT DOCTOR-TO-DOCTOR INSTANT COLLABORATION -->
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <h3 style="color:var(--primary-navy); margin:0;">Direct Specialist Connect</h3>
              <span class="q-badge q-consulting" style="font-size:0.75rem;">Instant Access</span>
            </div>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:1rem;">
              Direct call, message, or upload diagnostic reports to any specialist immediately without waiting for request approval.
            </p>

            <div style="max-height: 290px; overflow-y: auto; padding-right: 4px;">
              ${docs.filter(d => d.id !== currentDoc.id).map(d => {
                const targetAvail = getDoctorAvailability(d.id);
                return `
                  <div class="doc-contact-card">
                    <div class="doc-info-block">
                      <span class="doc-name-line">${escapeHtml(d.name)}</span>
                      <span class="doc-dept-line">${escapeHtml(d.deptName.split('/')[0])} • ${d.room} (${d.intercom})</span>
                      <small style="margin-top:2px;">
                        ${targetAvail.isAvailable ? 
                          '<span style="color:var(--success); font-weight:600;">● Available</span>' : 
                          `<span style="color:var(--danger); font-weight:600;">● Unavailable (${targetAvail.expectedReturnTime || 'Busy'})</span>`
                        }
                      </small>
                    </div>
                    <div style="display:flex; gap:0.4rem;">
                      <button class="btn btn-primary btn-sm" onclick="openDirectConsultModal('${d.id}')">
                        💬 Chat & Reports
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="initiateQuickCall('${d.id}')" title="Call Intercom">
                        📞 Call
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function autofillDocLogin(email, pass) {
  document.getElementById("doc-email").value = email;
  document.getElementById("doc-pass").value = pass;
}

function handleDoctorLogin(e) {
  e.preventDefault();
  const email = document.getElementById("doc-email").value.trim().toLowerCase();
  const pass = document.getElementById("doc-pass").value;

  const docs = getDoctors();
  const found = docs.find(d => d.email.toLowerCase() === email && d.password === pass);

  if (found) {
    localStorage.setItem(STORAGE_PREFIX + "active_doc", JSON.stringify(found));
    showToast(`Welcome, ${found.name}`);
    renderDoctorDesk();
  } else {
    alert("Invalid doctor credentials. Please check your email or click one of the pre-filled demo accounts.");
  }
}

function handleDoctorLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_doc");
  showToast("Doctor logged out.");
  renderDoctorDesk();
}

function handleDocCallNext(docId) {
  const res = SmartQueue.callNext(docId, getTodayString());
  if (!res.success) {
    alert(res.message);
  } else {
    showToast(`Called Token ${res.booking.tokenCode}`);
    renderDoctorDesk();
  }
}

function handleDocStartConsultation(bookingId) {
  const res = SmartQueue.startConsultation(bookingId);
  if (!res.success) alert(res.message);
  renderDoctorDesk();
}

function handleDocCompleteConsultation(bookingId) {
  const res = SmartQueue.completeConsultation(bookingId);
  if (!res.success) alert(res.message);
  renderDoctorDesk();
}

function handleDocMarkNoShow(bookingId) {
  if (confirm("Mark patient as No Show? They will be preserved in 'Late / Awaiting Arrival' and can resume priority upon arrival.")) {
    const res = SmartQueue.markNoShow(bookingId);
    if (!res.success) alert(res.message);
    renderDoctorDesk();
  }
}

function handleDocPatientArrived(bookingId) {
  const res = SmartQueue.patientArrived(bookingId);
  if (!res.success) {
    alert(res.message);
  } else {
    showToast("Patient arrival recorded. Original token priority restored.");
    renderDoctorDesk();
  }
}

function handleDocCancelToken(bookingId) {
  if (confirm("Are you sure you want to cancel this token?")) {
    const res = SmartQueue.cancelToken(bookingId);
    if (!res.success) alert(res.message);
    renderDoctorDesk();
  }
}

// =========================================================
// 11. DOCTOR UNAVAILABILITY
// =========================================================
function handleToggleUnavailability(docId) {
  const avail = getDoctorAvailability(docId);
  if (!avail.isAvailable) {
    if (confirm("Confirm return and resume active patient queue?")) {
      const records = getDoctorAvailabilityRecords();
      const updated = records.map(r => r.doctorId === docId ? { ...r, isAvailable: true, status: "Active" } : r);
      saveDoctorAvailabilityRecords(updated);
      showToast("Consultations resumed.");
      renderDoctorDesk();
    }
  } else {
    document.getElementById("modal-unavailability").classList.add("show");
  }
}

function closeUnavailModal() {
  document.getElementById("modal-unavailability").classList.remove("show");
}

function handleSetUnavailabilitySubmit(e) {
  e.preventDefault();
  const start = document.getElementById("unavail-start").value;
  const expected = document.getElementById("unavail-return").value;
  const reason = document.getElementById("unavail-reason").value.trim();
  const activeDoc = getActiveDoctor();

  if (!start || !expected) {
    alert("Please provide start and expected return times.");
    return;
  }

  const records = getDoctorAvailabilityRecords();
  const idx = records.findIndex(r => r.doctorId === activeDoc.id);
  const newRecord = {
    doctorId: activeDoc.id,
    isAvailable: false,
    status: "Doctor Unavailable",
    startTime: formatTimeDisplay(start),
    expectedReturnTime: formatTimeDisplay(expected),
    reason: reason || "Emergency rounds"
  };

  if (idx >= 0) {
    records[idx] = newRecord;
  } else {
    records.push(newRecord);
  }

  saveDoctorAvailabilityRecords(records);
  closeUnavailModal();
  showToast("Queue paused. Patients notified.");
  renderDoctorDesk();
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

// =========================================================
// 12. DIRECT SPECIALIST CONSULTATION & COMPRESSED REPORT UPLOAD
// =========================================================
function getChannelKey(docId1, docId2) {
  return [docId1, docId2].sort().join("___");
}

function openDirectConsultModal(targetDocId) {
  const docs = getDoctors();
  currentTargetDoctor = docs.find(d => d.id === targetDocId);
  if (!currentTargetDoctor) return;

  const activeDoc = getActiveDoctor();
  document.getElementById("direct-consult-title").innerText = `Direct Line: ${currentTargetDoctor.name}`;
  document.getElementById("direct-consult-subtitle").innerText = `${currentTargetDoctor.deptName} • Room ${currentTargetDoctor.room} (${currentTargetDoctor.intercom})`;
  
  const today = getTodayString();
  const currentPatient = SmartQueue.getCurrentPatient(activeDoc.id, today);
  const tokenRefInput = document.getElementById("direct-consult-token-ref");
  if (currentPatient && !tokenRefInput.value) {
    tokenRefInput.value = currentPatient.tokenCode;
  }

  clearImageAttachment();
  renderDirectConsultMessages();
  document.getElementById("modal-direct-consult").classList.add("show");
}

function closeDirectConsultModal() {
  document.getElementById("modal-direct-consult").classList.remove("show");
  clearImageAttachment();
  currentTargetDoctor = null;
}

// Compresses photo on HTML Canvas so it stays under Firestore's 1MB document limit
function handleReportFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file (JPG, PNG, X-Ray / Lab report photo).");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX_DIM = 800;
      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_DIM) {
        height *= MAX_DIM / width;
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width *= MAX_DIM / height;
        height = MAX_DIM;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      currentPendingReportBase64 = canvas.toDataURL("image/jpeg", 0.7);
      document.getElementById("preview-img-tag").src = currentPendingReportBase64;
      document.getElementById("preview-img-name").innerText = `${file.name.substring(0, 20)}...`;
      document.getElementById("image-attachment-preview").classList.remove("hidden");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearImageAttachment() {
  currentPendingReportBase64 = null;
  const input = document.getElementById("direct-report-upload");
  if (input) input.value = "";
  const preview = document.getElementById("image-attachment-preview");
  if (preview) preview.classList.add("hidden");
}

function sendDirectSpecialistMessage() {
  if (!currentTargetDoctor) return;
  const activeDoc = getActiveDoctor();
  const input = document.getElementById("directConsultInput");
  const text = input.value.trim();
  const tokenRef = document.getElementById("direct-consult-token-ref").value.trim();

  if (!text && !currentPendingReportBase64) {
    alert("Please type a message or attach a report photo.");
    return;
  }

  const channelKey = getChannelKey(activeDoc.id, currentTargetDoctor.id);
  const consults = getDirectConsultations();
  let channel = consults.find(c => c.channelKey === channelKey);

  if (!channel) {
    channel = {
      channelKey,
      doc1: activeDoc.id,
      doc2: currentTargetDoctor.id,
      messages: []
    };
    consults.push(channel);
  }

  channel.messages.push({
    id: "MSG-" + Date.now(),
    senderId: activeDoc.id,
    senderName: activeDoc.name,
    text: text || "Attached diagnostic report for review.",
    tokenRef: tokenRef || null,
    reportImage: currentPendingReportBase64 || null,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  saveDirectConsultations(consults);
  input.value = "";
  clearImageAttachment();
  renderDirectConsultMessages();
}

function renderDirectConsultMessages() {
  if (!currentTargetDoctor) return;
  const activeDoc = getActiveDoctor();
  const channelKey = getChannelKey(activeDoc.id, currentTargetDoctor.id);
  const consults = getDirectConsultations();
  const channel = consults.find(c => c.channelKey === channelKey);
  const win = document.getElementById("directConsultChatWindow");

  if (!channel || channel.messages.length === 0) {
    win.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding-top:4rem;">
        No prior messages. Direct communication is active.<br>Type advice or attach an X-Ray / Lab report below.
      </div>
    `;
    return;
  }

  win.innerHTML = channel.messages.map(m => {
    const isMine = m.senderId === activeDoc.id;
    return `
      <div class="chat-bubble ${isMine ? 'chat-mine' : 'chat-other'}">
        <div style="font-size:0.75rem; font-weight:700; margin-bottom:2px;">
          ${escapeHtml(m.senderName)} ${m.tokenRef ? `<span class="q-badge q-waiting" style="font-size:0.65rem; margin-left:4px;">Token: ${escapeHtml(m.tokenRef)}</span>` : ''}
        </div>
        <div>${escapeHtml(m.text)}</div>
        ${m.reportImage ? `
          <div style="margin-top:4px;">
            <img src="${m.reportImage}" class="chat-report-thumb" onclick="openImageViewer('${m.reportImage}')" title="Click to enlarge report" alt="Medical Diagnostic Report" />
            <span class="report-tag">🔍 Click photo to inspect</span>
          </div>
        ` : ''}
        <div style="font-size:0.68rem; opacity:0.8; text-align:right; margin-top:3px;">${m.time}</div>
      </div>
    `;
  }).join("");

  win.scrollTop = win.scrollHeight;
}

// =========================================================
// 13. DIRECT INTERCOM CALL SIMULATION
// =========================================================
function initiateQuickCall(targetDocId) {
  const docs = getDoctors();
  currentTargetDoctor = docs.find(d => d.id === targetDocId);
  initiateSpecialistCall();
}

function initiateSpecialistCall() {
  if (!currentTargetDoctor) return;
  document.getElementById("call-doc-name").innerText = currentTargetDoctor.name;
  document.getElementById("call-doc-room").innerText = `${currentTargetDoctor.deptName} • ${currentTargetDoctor.room} (${currentTargetDoctor.intercom})`;
  
  const statusEl = document.getElementById("call-status");
  statusEl.className = "q-badge q-waiting";
  statusEl.innerText = "Dialing OPD Extension...";

  document.getElementById("modal-intercom-call").classList.add("show");

  let seconds = 0;
  if (callTimerInterval) clearInterval(callTimerInterval);

  setTimeout(() => {
    statusEl.className = "q-badge q-consulting";
    callTimerInterval = setInterval(() => {
      seconds++;
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      statusEl.innerText = `🟢 Connected • ${mins}:${secs}`;
    }, 1000);
  }, 1200);
}

function endIntercomCall() {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
  document.getElementById("modal-intercom-call").classList.remove("show");
  showToast("Direct consultation call ended.");
}

// =========================================================
// 14. IMAGE VIEWER
// =========================================================
function openImageViewer(imageSrc) {
  const img = document.getElementById("enlarged-report-img");
  img.src = imageSrc;
  document.getElementById("modal-image-viewer").classList.add("show");
}

function closeImageViewer() {
  document.getElementById("modal-image-viewer").classList.remove("show");
}

// =========================================================
// 15. PATIENT AUTHENTICATION (Cloud Synced)
// =========================================================
function switchAuthTab(mode) {
  const loginForm = document.getElementById("patient-login-form");
  const regForm = document.getElementById("patient-register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabReg = document.getElementById("tab-register");

  if (mode === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabReg.classList.add("active");
  }
}

function handlePatientRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const age = document.getElementById("reg-age").value;
  const gender = document.getElementById("reg-gender").value;
  const phone = document.getElementById("reg-phone").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  const existing = cloudPatients.find(p => p.phone === phone || p.email === email);
  if (existing) {
    alert("An account with this phone or email already exists. Please log in.");
    switchAuthTab("login");
    return;
  }

  const newPatient = {
    id: "PAT-" + Date.now().toString().slice(-5),
    name,
    age,
    gender,
    phone,
    email,
    password
  };

  db.collection("patients").doc(newPatient.id).set(newPatient)
    .catch(err => console.error("Error saving patient:", err));

  localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(newPatient));

  showToast(`Welcome, ${name}!`);
  navigateTo("book");
}

function handlePatientLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("login-identifier").value.trim();
  const pass = document.getElementById("login-password").value;

  const user = cloudPatients.find(p => (p.phone === identifier || p.email === identifier) && p.password === pass);

  if (user) {
    localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    navigateTo("home");
  } else {
    alert("Invalid credentials. Please register if you are new.");
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_user");
  showToast("You have been signed out.");
  updateAuthHeader();
  navigateTo("home");
}

// =========================================================
// 16. EMERGENCY LIST & INITIAL BOOT
// =========================================================
function renderEmergencySection() {
  const container = document.getElementById("emergency-doctors-list");
  if (!container) return;

  container.innerHTML = emergencyDoctors.map(doc => `
    <div class="emergency-doc-card">
      <div>
        <div style="font-weight:700; font-size:0.95rem; color:#991b1b;">${doc.name}</div>
        <div style="font-size:0.85rem; color:#7f1d1d;">${doc.role} • ${doc.room}</div>
      </div>
      <a href="tel:${doc.phone.replace(/\s+/g, '')}" class="btn-emergency-call">
        📞 Call EMO
      </a>
    </div>
  `).join("");
}

window.addEventListener("DOMContentLoaded", () => {
  initRealtimeDatabaseListeners();
  renderHome();
  renderEmergencySection();
  updateAuthHeader();
});