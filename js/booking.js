/* ============================================================
   Sterling Hotels and Resorts — BOOKING & MODAL ENGINE
   India Date Format (DD/MM/YYYY) · Progressive Flatpickr
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Room rates mapping
  const roomRates = {
    'suite': 2500,
    'deluxe': 2000,
    'double': 1800,
    'dormitory': 500
  };

  // --- DATE PICKER ENGINE (DD/MM/YYYY) ---
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');
  const modalCheckIn = document.getElementById('modal-check-in');
  const modalCheckOut = document.getElementById('modal-check-out');

  // Helper: Format Date object to DD/MM/YYYY
  function formatDateToDMY(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // Helper: Parse DD/MM/YYYY string to Date object
  function parseDMYToDate(str) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    const date = new Date(y, m, d);
    if (date.getDate() !== d || date.getMonth() !== m || date.getFullYear() !== y) return null;
    return date;
  }

  // Load Flatpickr dynamically from CDN (Progressive Enhancement)
  function loadFlatpickr(callback) {
    if (typeof flatpickr !== 'undefined') {
      callback();
      return;
    }
    
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
    document.head.appendChild(link);
    
    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
    script.onload = callback;
    script.onerror = () => {
      console.log('Flatpickr load failed, using native text date inputs.');
      initializeFallbackInputs();
    };
    document.body.appendChild(script);
  }

  // Set default values (Check-in = tomorrow, Check-out = 3 days after tomorrow)
  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 4);

  const initValues = () => {
    const checkInStr = formatDateToDMY(defaultCheckIn);
    const checkOutStr = formatDateToDMY(defaultCheckOut);
    if (checkInInput) checkInInput.value = checkInStr;
    if (checkOutInput) checkOutInput.value = checkOutStr;
    if (modalCheckIn) modalCheckIn.value = checkInStr;
    if (modalCheckOut) modalCheckOut.value = checkOutStr;
    calculateNightsAndPrice();
  };

  // ── Mode A: Initialize Flatpickr ──
  function initializeFlatpickr() {
    const fpConfig = {
      dateFormat: "d/m/Y",
      minDate: "today",
      allowInput: true,
      onChange: function() {
        calculateNightsAndPrice();
      }
    };

    const cInInstance = flatpickr("#check-in", {
      ...fpConfig,
      defaultDate: defaultCheckIn,
      onClose: function(selectedDates) {
        if (selectedDates[0]) {
          const nextDay = new Date(selectedDates[0]);
          nextDay.setDate(nextDay.getDate() + 1);
          if (cOutInstance) cOutInstance.set("minDate", nextDay);
          if (mOutInstance) mOutInstance.set("minDate", nextDay);
          
          // Sync with modal check-in
          if (mInInstance) mInInstance.setDate(selectedDates[0]);
        }
      }
    });

    const cOutInstance = flatpickr("#check-out", {
      ...fpConfig,
      defaultDate: defaultCheckOut
    });

    const mInInstance = flatpickr("#modal-check-in", {
      ...fpConfig,
      defaultDate: defaultCheckIn,
      onClose: function(selectedDates) {
        if (selectedDates[0]) {
          const nextDay = new Date(selectedDates[0]);
          nextDay.setDate(nextDay.getDate() + 1);
          if (cOutInstance) cOutInstance.set("minDate", nextDay);
          if (mOutInstance) mOutInstance.set("minDate", nextDay);
          
          // Sync with booking bar check-in
          if (cInInstance) cInInstance.setDate(selectedDates[0]);
        }
      }
    });

    const mOutInstance = flatpickr("#modal-check-out", {
      ...fpConfig,
      defaultDate: defaultCheckOut
    });
    
    // Recalculate initially
    calculateNightsAndPrice();
  }

  // ── Mode B: Fallback Text Input Mask & Validation (Offline) ──
  function initializeFallbackInputs() {
    initValues();

    const addInputMask = (input, isCheckOut) => {
      if (!input) return;
      
      input.addEventListener('input', () => {
        let val = input.value.replace(/\D/g, ''); // Digits only
        if (val.length > 8) val = val.substring(0, 8);
        
        let formatted = '';
        if (val.length > 0) formatted += val.substring(0, 2);
        if (val.length > 2) formatted += '/' + val.substring(2, 4);
        if (val.length > 4) formatted += '/' + val.substring(4, 8);
        
        input.value = formatted;
      });

      input.addEventListener('blur', () => {
        let parsed = parseDMYToDate(input.value);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (!parsed || parsed < today) {
          // Reset to default
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() + (isCheckOut ? 4 : 1));
          input.value = formatDateToDMY(fallbackDate);
          parsed = fallbackDate;
        }

        // Validate date order
        if (!isCheckOut) {
          // Check-in changed, verify check-out is after check-in
          const otherInput = input.id.includes('modal') ? modalCheckOut : checkOutInput;
          const otherDate = parseDMYToDate(otherInput.value);
          if (!otherDate || otherDate <= parsed) {
            const nextDay = new Date(parsed);
            nextDay.setDate(nextDay.getDate() + 1);
            otherInput.value = formatDateToDMY(nextDay);
          }
          // Sync check-in value
          const partnerIn = input.id.includes('modal') ? checkInInput : modalCheckIn;
          if (partnerIn) partnerIn.value = input.value;
        } else {
          // Check-out changed
          const otherInput = input.id.includes('modal') ? modalCheckIn : checkInInput;
          const otherDate = parseDMYToDate(otherInput.value);
          if (otherDate && parsed <= otherDate) {
            const nextDay = new Date(otherDate);
            nextDay.setDate(nextDay.getDate() + 1);
            input.value = formatDateToDMY(nextDay);
          }
          // Sync check-out value
          const partnerOut = input.id.includes('modal') ? checkOutInput : modalCheckOut;
          if (partnerOut) partnerOut.value = input.value;
        }
        calculateNightsAndPrice();
      });
    };

    addInputMask(checkInInput, false);
    addInputMask(checkOutInput, true);
    addInputMask(modalCheckIn, false);
    addInputMask(modalCheckOut, true);
  }

  // Load and start
  loadFlatpickr(initializeFlatpickr);

  // --- GUEST STEPPER LOGIC ---
  const adultsVal = document.getElementById('adults-val');
  const childrenVal = document.getElementById('children-val');

  const setupStepper = (minusBtnId, plusBtnId, countSpanId, inputHiddenId, min, max) => {
    const minus = document.getElementById(minusBtnId);
    const plus = document.getElementById(plusBtnId);
    const count = document.getElementById(countSpanId);
    const input = document.getElementById(inputHiddenId);

    if (minus && plus && count) {
      minus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = parseInt(count.textContent);
        if (val > min) {
          val--;
          count.textContent = val;
          if (input) input.value = val;
          calculateNightsAndPrice();
        }
      });

      plus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = parseInt(count.textContent);
        if (val < max) {
          val++;
          count.textContent = val;
          if (input) input.value = val;
          calculateNightsAndPrice();
        }
      });
    }
  };

  setupStepper('adults-minus', 'adults-plus', 'adults-count', 'adults-val', 1, 6);
  setupStepper('children-minus', 'children-plus', 'children-count', 'children-val', 0, 6);

  // --- BOOKING MODAL OPEN/CLOSE ---
  const bookingBarForm = document.getElementById('booking-bar-form');
  const bookingModal = document.getElementById('booking-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalAdults = document.getElementById('modal-adults');
  const modalChildren = document.getElementById('modal-children');
  const modalRoomType = document.getElementById('modal-room-type');

  const openModal = () => {
    if (bookingModal) {
      bookingModal.classList.add('open');
      document.body.style.overflow = 'hidden'; // Scroll lock
      
      // Populate fields from booking bar if they exist
      if (checkInInput && modalCheckIn) modalCheckIn.value = checkInInput.value;
      if (checkOutInput && modalCheckOut) modalCheckOut.value = checkOutInput.value;
      if (adultsVal && modalAdults) modalAdults.value = adultsVal.value;
      if (childrenVal && modalChildren) modalChildren.value = childrenVal.value;
      
      const barRoomSelect = document.getElementById('room-type');
      if (barRoomSelect && modalRoomType) {
        modalRoomType.value = barRoomSelect.value;
      }

      // Sync Flatpickr dates if active
      if (document.getElementById('modal-check-in')._flatpickr) {
        document.getElementById('modal-check-in')._flatpickr.setDate(parseDMYToDate(checkInInput.value));
      }
      if (document.getElementById('modal-check-out')._flatpickr) {
        document.getElementById('modal-check-out')._flatpickr.setDate(parseDMYToDate(checkOutInput.value));
      }

      calculateNightsAndPrice();
    }
  };

  const closeModal = () => {
    if (bookingModal) {
      bookingModal.classList.remove('open');
      document.body.style.overflow = '';
      
      // Reset success state if visible
      const successDiv = document.querySelector('.modal__success');
      const form = document.getElementById('modal-booking-form');
      if (successDiv) successDiv.classList.remove('visible');
      if (form) form.style.display = 'block';
    }
  };

  if (bookingBarForm) {
    bookingBarForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = "checkin.html";
    });
  }

  // Hook up button CTAs that say "Book Now" or "Reserve"
  document.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = "checkin.html";
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeModal();
    });
  }

  // --- DYNAMIC CALCULATIONS ---
  const totalNightsSpan = document.getElementById('total-nights');
  const totalPriceSpan = document.getElementById('total-price');

  function calculateNightsAndPrice() {
    let checkInVal, checkOutVal, roomType;
    let adults = 2;
    let children = 0;
    let extraBed = false;

    // Determine values depending on if we are checking from modal or bar
    if (bookingModal && bookingModal.classList.contains('open')) {
      checkInVal = modalCheckIn ? modalCheckIn.value : '';
      checkOutVal = modalCheckOut ? modalCheckOut.value : '';
      roomType = modalRoomType ? modalRoomType.value : 'deluxe';
      adults = modalAdults ? parseInt(modalAdults.value, 10) : 2;
      children = modalChildren ? parseInt(modalChildren.value, 10) : 0;
      const extraBedCheckbox = document.getElementById('modal-extra-bed');
      extraBed = extraBedCheckbox ? extraBedCheckbox.checked : false;
    } else {
      checkInVal = checkInInput ? checkInInput.value : '';
      checkOutVal = checkOutInput ? checkOutInput.value : '';
      const barRoomSelect = document.getElementById('room-type');
      roomType = barRoomSelect ? barRoomSelect.value : 'deluxe';
      adults = adultsVal ? parseInt(adultsVal.value, 10) : 2;
      children = childrenVal ? parseInt(childrenVal.value, 10) : 0;
    }

    if (!checkInVal || !checkOutVal) return;

    const checkIn = parseDMYToDate(checkInVal);
    const checkOut = parseDMYToDate(checkOutVal);

    if (!checkIn || !checkOut || checkOut <= checkIn) return;

    const diffTime = Math.abs(checkOut - checkIn);
    const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let baseRate = roomRates[roomType] || 2000;
    let totalRatePerNight = baseRate;

    if (roomType === 'dormitory') {
      // Dormitory is per-person (kids under 9 free)
      totalRatePerNight = adults * baseRate;
      if (extraBed) {
        totalRatePerNight += 500;
      }
    } else {
      // Suite, Deluxe, Double/King standard capacity is 2 adults. Extra adults or people above 9 are charged Rs 500.
      // Kids under 9 free.
      const extraPersonCount = Math.max(0, adults - 2);
      totalRatePerNight += extraPersonCount * 500;
      if (extraBed) {
        totalRatePerNight += 500;
      }
    }

    const totalPrice = diffNights * totalRatePerNight;

    // Update displays
    if (totalNightsSpan) {
      totalNightsSpan.textContent = `${diffNights} Night${diffNights > 1 ? 's' : ''}`;
    }
    if (totalPriceSpan) {
      totalPriceSpan.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }
  }

  if (modalRoomType) modalRoomType.addEventListener('change', calculateNightsAndPrice);
  if (modalAdults) modalAdults.addEventListener('change', calculateNightsAndPrice);
  if (modalChildren) modalChildren.addEventListener('change', calculateNightsAndPrice);
  const extraBedCheckbox = document.getElementById('modal-extra-bed');
  if (extraBedCheckbox) extraBedCheckbox.addEventListener('change', calculateNightsAndPrice);

  // --- SUBMIT MODAL RESERVATION ---
  const modalBookingForm = document.getElementById('modal-booking-form');
  if (modalBookingForm) {
    modalBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic client side validation
      const name = document.getElementById('guest-name').value.trim();
      const email = document.getElementById('guest-email').value.trim();
      const phone = document.getElementById('guest-phone').value.trim();

      if (!name || !email || !phone) {
        showToast('Please fill out all contact details.');
        return;
      }

      // Hide form and show success message
      modalBookingForm.style.display = 'none';
      const successDiv = document.querySelector('.modal__success');
      if (successDiv) {
        successDiv.classList.add('visible');
        
        // Populate custom details in success message
        const confirmationNumber = 'ST' + Math.floor(100000 + Math.random() * 900000);
        const confirmSpan = document.getElementById('confirmation-code');
        if (confirmSpan) confirmSpan.textContent = confirmationNumber;
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message) => {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  };
});
