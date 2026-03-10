
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxJN_n_DKeRETuDrweUllo8Gl5i4colItoUonTtOlkmrw3SSUxBQTscX-a9CEEN_o7r/exec";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dm1uelfwv/auto/upload";
const CLOUDINARY_PRESET = "survey_upload";

let uploadedFile = null;

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

  let receiptUrl = "";

    if (uploadedFile) {
    try {
        receiptUrl = await uploadToCloudinary(uploadedFile);
    } catch (e) {
        console.error("Upload failed", e);
    }
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
    support_rating: supportRating?.value || "",
    receipt: receiptUrl
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

function submitSurvey() {
  if (surveySubmitting) return;
  surveySubmitting = true;

  const submitButton = document.querySelector('#panel-survey .btn-submit');
  disableButton(submitButton);

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

  // ── ПОКАЗ БАНЕРА І СКРОЛ ОДРАЗУ ──
  showBanner(document.getElementById('survey-success'));

  // ── ВІДПРАВКА В ФОНІ ──
  fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) })
    .then(() => console.log("Survey submitted successfully"))
    .catch(error => console.error("Error submitting survey:", error))
    .finally(() => {
      surveySubmitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove('disabled');
    });
}

function handleUpload(input) {
  const file = input.files[0];
  if (!file) return;

  uploadedFile = file;

  const previewBox = document.getElementById("upload-preview");
  const placeholder = document.getElementById("upload-placeholder");
  const previewImg = document.getElementById("preview-img");
  const previewName = document.getElementById("preview-name");

  previewName.textContent = file.name;

  if (file.type.startsWith("image/")) {
    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = "block";
  } else {
    previewImg.style.display = "none";
  }

  placeholder.style.display = "none";
  previewBox.style.display = "flex";
}

function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise(resolve => {

    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file) {

  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log(data);
  
  return data.secure_url;
}
