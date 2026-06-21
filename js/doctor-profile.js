// =========================================================
// Doctory — Doctor Profile Page
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    initSpecialtiesNav();
    initBurgerMenu();

    const params = new URLSearchParams(window.location.search);
    const doctorId = parseInt(params.get("id"), 10);

    if (!Number.isFinite(doctorId)) {
      document.getElementById("profileCard").innerHTML = `
        <div class="empty-state" style="padding:60px 20px; text-align:center;">
          <div class="empty-state__icon">⚠️</div>
          <h3 class="empty-state__title">لم يتم تحديد الطبيب</h3>
          <p class="empty-state__text">يرجى الانتقال من صفحة البحث أو استخدام رابط صحيح.</p>
          <a href="search.html" class="btn btn--primary">العودة للبحث</a>
        </div>
      `;
      return;
    }

    const doctor = DEMO_DOCTORS.find(d => d.id === doctorId);
    if (!doctor) {
      document.getElementById("profileCard").innerHTML = `
        <div class="empty-state" style="padding:60px 20px; text-align:center;">
          <div class="empty-state__icon">😕</div>
          <h3 class="empty-state__title">الطبيب غير موجود</h3>
          <p class="empty-state__text">قد يكون الرابط غير صحيح أو تم حذف الطبيب.</p>
          <a href="search.html" class="btn btn--primary">العودة للبحث</a>
        </div>
      `;
      return;
    }

    renderProfile(doctor);
    renderRelatedDoctors(doctor);
  };

  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
});

/* ---------------------------------------------------------
   Navbar specialties (copied from main.js)
--------------------------------------------------------- */
function initSpecialtiesNav() {
  const trigger = document.getElementById("specialtiesTrigger");
  const menu = document.getElementById("specialtiesPanel");
  const grid = document.getElementById("specialtiesGrid");
  const wrap = document.getElementById("specialtiesWrap");
  if (!trigger || !menu || !grid || !wrap) return;

  grid.innerHTML = "";
  MEDICAL_SPECIALTIES.forEach((spec) => {
    const a = document.createElement("a");
    a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
    a.className = "mega-menu__link";
    a.innerHTML = `<span class="icon">${spec.icon}</span><span>${spec.name}</span>`;
    grid.appendChild(a);
  });

  let closeTimer = null;
  const open = () => {
    clearTimeout(closeTimer);
    wrap.classList.add("is-open");
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    closeTimer = setTimeout(() => {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }, 150);
  };

  trigger.addEventListener("mouseenter", open);
  menu.addEventListener("mouseenter", open);
  trigger.addEventListener("mouseleave", close);
  menu.addEventListener("mouseleave", close);
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    wrap.classList.contains("is-open") ? close() : open();
  });
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target) && !menu.contains(e.target)) {
      wrap.classList.remove("is-open");
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

function initBurgerMenu() {
  const burger = document.getElementById("burgerBtn");
  const menu = document.getElementById("mobileMenu");
  const specTrigger = document.getElementById("mobileSpecialtiesTrigger");
  const specPanel = document.getElementById("mobileSpecialtiesPanel");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  if (specTrigger && specPanel) {
    specPanel.innerHTML = "";
    MEDICAL_SPECIALTIES.forEach((spec) => {
      const a = document.createElement("a");
      a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
      a.className = "mega-menu__link";
      a.innerHTML = `<span class="icon">${spec.icon}</span><span>${spec.name}</span>`;
      specPanel.appendChild(a);
    });
    specTrigger.addEventListener("click", () => {
      specPanel.classList.toggle("is-open");
    });
  }
}

/* ---------------------------------------------------------
   Render Profile
--------------------------------------------------------- */
function renderProfile(doctor) {
  const container = document.getElementById("profileCard");
  document.getElementById("breadcrumbName").textContent = doctor.name;

  const stars = buildStars(doctor.rating);
  const badges = [];
  if (doctor.verified) badges.push(`<span class="profile-card__badge profile-card__badge--verified">✓ موثق</span>`);
  if (doctor.featured) badges.push(`<span class="profile-card__badge profile-card__badge--featured">⭐ مميز</span>`);
  if (doctor.availableToday) badges.push(`<span class="profile-card__badge profile-card__badge--today">● متاح اليوم</span>`);
  if (doctor.hasOnline) badges.push(`<span class="profile-card__badge profile-card__badge--online">● أونلاين</span>`);

  const hours = ["السبت – الأربعاء: 10 ص – 8 م", "الخميس: 10 ص – 2 م", "الجمعة: مغلق"];
  const qualifications = Array.isArray(doctor.qualifications) ? doctor.qualifications.filter(Boolean) : [];

  const avatarImg = (doctor.images && doctor.images[0]) ? doctor.images[0].replace(/^(\.\.\/)+/, "") : null;
  const avatarInner = avatarImg
    ? `<img src="${avatarImg}" alt="${doctor.name}" class="profile-card__avatar-img">`
    : doctor.initials;

  container.innerHTML = `
    <div class="profile-card__grid">
      <div class="profile-card__avatar-wrap">
        <div class="profile-card__avatar" style="background: linear-gradient(135deg, ${doctor.avatarColor}22, ${doctor.avatarColor}44); color:${doctor.avatarColor};">
          ${avatarInner}
        </div>
        <div class="profile-card__badges">${badges.join("")}</div>
      </div>

      <div class="profile-card__info">
        <h1 class="profile-card__name">${doctor.name}</h1>
        <div class="profile-card__specialty">${doctor.specialtyIcon} ${doctor.specialty}</div>
        <div class="profile-card__degree">${doctor.degree}</div>

        <div class="profile-card__rating">
          <div class="profile-card__stars">${stars}</div>
          <span class="profile-card__rating-value">${doctor.rating.toFixed(1)}</span>
          <span class="profile-card__reviews">(${doctor.reviews} تقييم)</span>
        </div>

        <div class="profile-card__meta">
          <span class="profile-card__pill profile-card__pill--exp">🧑‍⚕️ ${doctor.experience} سنة خبرة</span>
          <span class="profile-card__pill profile-card__pill--price">💰 ${doctor.price} جنيه</span>
          <span class="profile-card__pill profile-card__pill--location">📍 ${doctor.area}، ${doctor.governorate}</span>
        </div>

        <div class="profile-card__actions">
          <button class="btn--book-large" type="button" id="bookBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            احجز موعد
          </button>
          <button class="btn--share" type="button" id="shareBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            مشاركة
          </button>
        </div>
      </div>
    </div>

    <div class="profile-details">
      <div class="profile-details__section">
        <h3>عن الطبيب</h3>
        <p>${doctor.bio || "هذا الطبيب يمتلك خبرة واسعة في تخصصه، ويقدم رعاية طبية عالية الجودة لمرضاه."}</p>
        ${qualifications.length ? `
        <br>
        <h3>المؤهلات</h3>
        <ul>${qualifications.map(q => `<li>${q}</li>`).join("")}</ul>` : ""}
      </div>
      <div class="profile-details__section">
        <h3>العيادة</h3>
        <div class="clinic-card">
          <div class="clinic-card__name">${doctor.clinic}</div>
          <div class="clinic-card__address">${doctor.area}، ${doctor.governorate}</div>
          <div class="clinic-hours">
            ${hours.map(h => `<span class="clinic-hours__item">${h}</span>`).join("")}
          </div>
        </div>
        <div class="map-placeholder">
          <span>📍 خريطة الموقع (تجريبي)</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById("bookBtn")?.addEventListener("click", () => {
    alert("جارٍ تحويلك لصفحة الحجز... (تجريبي)");
  });

  document.getElementById("shareBtn")?.addEventListener("click", async () => {
    const shareData = { title: doctor.name, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          alert(`شارك الرابط: ${window.location.href}`);
        }
      }
    } else {
      alert(`شارك الرابط: ${window.location.href}`);
    }
  });

  document.title = `${doctor.name} | Doctory`;
}

/* ---------------------------------------------------------
   Build Stars
--------------------------------------------------------- */
function buildStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    html += `<svg class="star ${filled ? "" : "star--empty"}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>`;
  }
  return html;
}

/* ---------------------------------------------------------
   Render Related Doctors
--------------------------------------------------------- */
function renderRelatedDoctors(doctor) {
  const grid = document.getElementById("relatedDoctorsGrid");
  const related = DEMO_DOCTORS
    .filter(d => d.id !== doctor.id && (d.specialty === doctor.specialty || d.governorate === doctor.governorate))
    .slice(0, 4);

  if (related.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted);font-size:14px;">لا يوجد أطباء مقترحون</p>`;
    return;
  }

  grid.innerHTML = "";
  related.forEach(d => {
    const card = document.createElement("div");
    card.className = "related-doctor-card";
    card.addEventListener("click", () => {
      window.location.href = `doctor-profile.html?id=${d.id}`;
    });
    card.innerHTML = `
      <div class="related-doctor-card__top">
        <div class="related-doctor-card__avatar" style="background:linear-gradient(135deg, ${d.avatarColor}22, ${d.avatarColor}44); color:${d.avatarColor};">${d.initials}</div>
        <div class="related-doctor-card__info">
          <div class="related-doctor-card__name">${d.name}</div>
          <div class="related-doctor-card__specialty">${d.specialtyIcon} ${d.specialty}</div>
          <div class="related-doctor-card__rating">
            ${buildStars(d.rating)} ${d.rating.toFixed(1)} (${d.reviews})
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}
