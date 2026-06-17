/* ============================================================
   Sterling Hotels and Resorts — BOOKING & MODAL ENGINE
   Date Validation · Dynamic Calculations · Local Storage Forms
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Room rates mapping
  const roomRates = {
    'deluxe': 450,
    'premier': 650,
    'suite': 1200,
    'penthouse': 2500
  };

  // --- DATE PICKER LOGIC ---
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');

  // Set minimum date to today
  if (checkInInput && checkOutInput) {
    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;
    
    // Default values: Check-in = tomorrow, Check-out = day after tomorrow
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 1);
    checkInInput.value = checkInDate.toISOString().split('T')[0];

    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 3);
    checkOutInput.value = checkOutDate.toISOString().split('T')[0];
    checkOutInput.min = checkInInput.value;

    checkInInput.addEventListener('change', () => {
      // Ensure check-out is at least 1 day after check-in
      const checkInVal = new Date(checkInInput.value);
      const minCheckOutDate = new Date(checkInVal);
      minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
      
      checkOutInput.min = minCheckOutDate.toISOString().split('T')[0];
      
      if (new Date(checkOutInput.value) <= checkInVal) {
        checkOutInput.value = minCheckOutDate.toISOString().split('T')[0];
      }
      calculateNightsAndPrice();
    });

    checkOutInput.addEventListener('change', () => {
      calculateNightsAndPrice();
    });
  }

  // --- GUEST STEPPER LOGIC ---
  const adultsVal = document.getElementById('adults-val');
  const childrenVal = document.getElementById('children-val');
  const adultsCount = document.getElementById('adults-count');
  const childrenCount = document.getElementById('children-count');

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
        }
      });

      plus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = parseInt(count.textContent);
        if (val < max) {
          val++;
          count.textContent = val;
          if (input) input.value = val;
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
  
  // Modal Fields to fill from booking bar
  const modalCheckIn = document.getElementById('modal-check-in');
  const modalCheckOut = document.getElementById('modal-check-out');
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
      openModal();
    });
  }

  // Hook up button CTAs that say "Book Now" or "Reserve"
  document.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoom = btn.getAttribute('data-room');
      openModal();
      if (targetRoom && modalRoomType) {
        modalRoomType.value = targetRoom;
        calculateNightsAndPrice();
      }
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

    // Determine values depending on if we are checking from modal or bar
    if (bookingModal && bookingModal.classList.contains('open')) {
      checkInVal = modalCheckIn ? modalCheckIn.value : '';
      checkOutVal = modalCheckOut ? modalCheckOut.value : '';
      roomType = modalRoomType ? modalRoomType.value : 'deluxe';
    } else {
      checkInVal = checkInInput ? checkInInput.value : '';
      checkOutVal = checkOutInput ? checkOutInput.value : '';
      const barRoomSelect = document.getElementById('room-type');
      roomType = barRoomSelect ? barRoomSelect.value : 'deluxe';
    }

    if (!checkInVal || !checkOutVal) return;

    const checkIn = new Date(checkInVal);
    const checkOut = new Date(checkOutVal);

    const diffTime = Math.abs(checkOut - checkIn);
    const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rate = roomRates[roomType] || 450;
    const totalPrice = diffNights * rate;

    // Update displays
    if (totalNightsSpan) {
      totalNightsSpan.textContent = `${diffNights} Night${diffNights > 1 ? 's' : ''}`;
    }
    if (totalPriceSpan) {
      totalPriceSpan.textContent = `$${totalPrice.toLocaleString()}`;
    }
  }

  // Handle value change inside modal to recalculate price dynamically
  if (modalCheckIn) modalCheckIn.addEventListener('change', () => {
    const checkInVal = new Date(modalCheckIn.value);
    const minCheckOutDate = new Date(checkInVal);
    minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
    
    if (modalCheckOut) {
      modalCheckOut.min = minCheckOutDate.toISOString().split('T')[0];
      if (new Date(modalCheckOut.value) <= checkInVal) {
        modalCheckOut.value = minCheckOutDate.toISOString().split('T')[0];
      }
    }
    calculateNightsAndPrice();
  });
  
  if (modalCheckOut) modalCheckOut.addEventListener('change', calculateNightsAndPrice);
  if (modalRoomType) modalRoomType.addEventListener('change', calculateNightsAndPrice);

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
