/* =========================================================
   Doctory — Home Page JS
   home.js
   يتحمّل بعد main.js ويضيف:
     1) أقسام التخصصات في الصفحة الرئيسية
     2) بطاقات الأطباء المميزين
     3) عداد الأرقام (Stats)
     4) Scroll Reveal
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    buildSpecialtiesHomeGrid();
    buildFeaturedDoctors();
    initStatsCounter();
    initScrollReveal();
  };
  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
});

/* ---------------------------------------------------------
   1) Specialties grid on homepage (top 12 only)
--------------------------------------------------------- */
function buildSpecialtiesHomeGrid() {
  const grid = document.getElementById("specialtiesHomeGrid");
  if (!grid || !window.MEDICAL_SPECIALTIES) return;

  const TOP_SPECS = MEDICAL_SPECIALTIES.slice(0, 12);

  TOP_SPECS.forEach((spec, i) => {
    const a = document.createElement("a");
    a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
    a.className = "spec-card reveal";
    a.style.transitionDelay = `${i * 40}ms`;
    a.innerHTML = `
      <div class="spec-card__icon">${spec.icon}</div>
      <span class="spec-card__name">${spec.name}</span>
    `;
    grid.appendChild(a);
  });
}

/* ---------------------------------------------------------
   2) Featured doctors grid (top 4 by rating)
--------------------------------------------------------- */
function buildFeaturedDoctors() {
  const grid = document.getElementById("featuredDoctorsGrid");
  if (!grid || !window.DEMO_DOCTORS) return;

  const featured = [...DEMO_DOCTORS]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  featured.forEach((doc, i) => {
    const stars = "★".repeat(Math.round(doc.rating || 5));
    const avatarBg = doc.avatarColor || "#0EA5A4";
    const initials = doc.initials || doc.name.slice(0, 2);

    const card = document.createElement("a");
    card.href = `doctor-profile.html?id=${doc.id}`;
    card.className = "doctor-card reveal";
    card.style.transitionDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="doctor-card__header">
        <div class="doctor-card__avatar" style="background:${avatarBg}">${initials}</div>
        <div class="doctor-card__info">
          <div class="doctor-card__name">${doc.name}</div>
          <div class="doctor-card__specialty">${doc.specialtyIcon || ""} ${doc.specialty}</div>
        </div>
      </div>
      <div class="doctor-card__rating">
        <span class="doctor-card__rating-stars">${stars}</span>
        <span>${doc.rating}</span>
        <span class="doctor-card__rating-count">(${doc.reviews || 0} تقييم)</span>
      </div>
      <div class="doctor-card__divider"></div>
      <div class="doctor-card__meta">
        <span class="doctor-card__badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/></svg>
          ${doc.governorate}
        </span>
        ${doc.availableToday ? `<span class="doctor-card__badge doctor-card__badge--teal">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          متاح اليوم
        </span>` : ""}
      </div>
      <div class="doctor-card__price">${doc.price} جنيه <small>/ الكشف</small></div>
      <span class="doctor-card__cta">احجز موعد</span>
    `;
    grid.appendChild(card);
  });
}

/* ---------------------------------------------------------
   3) Stats counter animation
--------------------------------------------------------- */
function initStatsCounter() {
  const nums = document.querySelectorAll(".stats-bar__number[data-target]");
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target).toLocaleString("ar-EG");
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString("ar-EG") + (el.dataset.suffix || "");
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  nums.forEach((n) => observer.observe(n));
}

/* ---------------------------------------------------------
   4) Scroll Reveal
--------------------------------------------------------- */
function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}
