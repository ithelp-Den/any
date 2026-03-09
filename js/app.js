// ─────────────── SCRIPT URL ───────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2E0rKscA-Vh18kRvlekhgqSFogrSOLkcPDpKt2RnhlHBJ6lwjVLZYk1shHqxgb5T3/exec";

// ─────────────── SWITCH TAB ───────────────
function switchTab(tab, btn) {
  const allButtons = document.querySelectorAll('.tab-btn');
  const allPanels = document.querySelectorAll('.panel');

  allButtons.forEach(b => b.classList.remove('active'));
  allPanels.forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// ─────────────── SHOW/HIDE EXCHANGE DATE ───────────────
document.querySelectorAll('[name=exchanged]').forEach(radio => {
  radio.addEventListener('change', () => {
    const exchangeField = document.getElementById('exchange_date_field');
    exchangeField.style.display = radio.value === 'yes' ? 'block' : 'none';
  });
});

// ─────────────── HELPER: SHOW ANIMATED BANNER ───────────────
function showBanner(banner) {
  banner.style.display = 'block';
  banner.style.opacity = 0;
  banner.style.transition = 'opacity 0.6s';
  setTimeout(() => banner.style.opacity = 1, 50);

  // hide after 5s
  setTimeout(() => {
    banner.style.opacity = 0;
    setTimeout(() => banner.style.display = 'none', 600);
  }, 5000);

  // scroll to top on success
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────── DISABLE BUTTON ───────────────
function disableButton(button) {
  button.disabled = true;
  button.classList.add('disabled');
}

// ─────────────── SCROLL TO FIRST EMPTY FIELD ───────────────
function scrollToFirstEmpty(fields) {
  for (const f of fields) {
    if ((f.tagName === "INPUT" || f.tagName === "SELECT" || f.tagName === "TEXTAREA") && !f.value.trim()) {
      f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      f.focus();
      console.log(`Empty required field: ${f.id || f.name}`);
      return true;
    }
    if (f.type === 'radio') {
      const group = document.getElementsByName(f.name);
      if (![...group].some(r => r.checked)) {
        group[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        group[0].focus();
        console.log(`Empty required radio group: ${f.name}`);
        return true;
      }
    }
  }
  return false;
}

// ─────────────── REFUND FORM ───────────────
let refundSubmitting = false;

async function submitRefund() {
  if (refundSubmitting) return;
  refundSubmitting = true;

  const submitButton = document.querySelector('#panel-refund .btn-submit');
  disableButton(submitButton);

  const name = document.getElementById('r_name');
  const email = document.getElementById('r_email');
  const instagram = document.getElementById('r_ig');
  const purchaseDate = document.getElementById('r_date');
  const course = document.getElementById('r_course');
  const reason = document.getElementById('r_reason');
  const details = document.getElementById('r_details');
  const exchangeDateField = document.getElementById('exchange_date_field');
  const exchangeDate = document.getElementById('r_exchange_date');
  const exchanged = document.querySelector('input[name="exchanged"]:checked');
  const swapPreference = document.querySelector('input[name="swap"]:checked');
  const supportRating = document.querySelector('input[name="support_rating"]:checked');

  // Required fields array
  const requiredFields = [name, email, purchaseDate, course, reason];
  if (exchanged?.value === 'yes') requiredFields.push(exchangeDate);
  requiredFields.push(exchanged);
  requiredFields.push(swapPreference);

  // Check required
  if (scrollToFirstEmpty(requiredFields)) {
    refundSubmitting = false;
    submitButton.disabled = false;
    submitButton.classList.remove('disabled');
    return;
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    email.scrollIntoView({ behavior: 'smooth', block: 'center' });
    email.focus();
    refundSubmitting = false;
    submitButton.disabled = false;
    submitButton.classList.remove('disabled');
    return;
  }

  const data = {
    type: "refund",
    name: name.value.trim(),
    email: email.value.trim(),
    instagram: instagram.value.trim(),
    purchase_date: purchaseDate.value,
    course: course.value,
    exchanged: exchanged?.value || "",
    exchange_date: exchangeDate?.value || "",
    swap: swapPreference?.value || "",
    reason: reason.value,
    details: details.value,
    support_rating: supportRating?.value || ""
  };

  // ── ПОКАЗУЄМО БАНЕР І СКРОЛ ОДРАЗУ ──
  showBanner(document.getElementById('refund-success'));

  // ── ВІДПРАВКА В ФОНІ ──
  fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) })
    .then(() => console.log("Refund submitted successfully"))
    .catch(error => console.error("Error submitting refund:", error))
    .finally(() => {
      refundSubmitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove('disabled');
    });
}

// ─────────────── SURVEY FORM ───────────────
let surveySubmitting = false;

async function submitSurvey() {
  if (surveySubmitting) return;
  surveySubmitting = true;

  const submitButton = document.querySelector('#panel-survey .btn-submit');
  disableButton(submitButton);

  const name = document.getElementById('sv_name');
  const email = document.getElementById('sv_email');
  const course = document.getElementById('sv_course');
  const duration = document.querySelector('input[name="sv_duration"]:checked');
  const overall = document.querySelector('input[name="sv_overall"]:checked');
  const clarity = document.querySelector('input[name="sv_clarity"]:checked');
  const match = document.querySelector('input[name="sv_match"]:checked');
  const results = document.querySelector('input[name="sv_results"]:checked');
  const policy = document.querySelector('input[name="sv_policy"]:checked');
  const swapPolicy = document.querySelector('input[name="sv_swap_policy"]:checked');
  const liked = document.getElementById('sv_liked');
  const improve = document.getElementById('sv_improve');
  const recommend = document.querySelector('input[name="sv_recommend"]:checked');

  const requiredFields = [name, course];
  if (scrollToFirstEmpty(requiredFields)) {
    console.log("Validation failed: required fields missing");
    surveySubmitting = false;
    submitButton.disabled = false;
    submitButton.classList.remove('disabled');
    return;
  }

  const data = {
    type: "survey",
    name: name.value.trim(),
    email: email.value.trim(),
    course: course.value,
    duration: duration?.value || "",
    overall: overall?.value || "",
    clarity: clarity?.value || "",
    match: match?.value || "",
    results: results?.value || "",
    policy: policy?.value || "",
    swap_policy: swapPolicy?.value || "",
    liked: liked.value.trim(),
    improve: improve.value.trim(),
    recommend: recommend?.value || ""
  };

  try {
    console.log("Submitting survey:", data);
    await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
    showBanner(document.getElementById('survey-success'));
    console.log("Survey submitted successfully");
  } catch (error) {
    console.error("Error submitting survey:", error);
  } finally {
    surveySubmitting = false;
    submitButton.disabled = false;
    submitButton.classList.remove('disabled');
  }
}