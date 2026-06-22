/* =========================================================
   Doctory — Home Page JS (Dynamic Sections)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    applyHeroFromConfig();
    buildHeroMiniDoctors();
    populateHeroStats();
    buildDynamicSections();
    initScrollReveal();
  };
  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
});

/* ---------------------------------------------------------
   Apply hero text from siteConfig
--------------------------------------------------------- */
function applyHeroFromConfig() {
  const cfg = window.SITE_CONFIG || {};
  const hero = cfg.hero || {};
  const eyebrow = document.getElementById("heroEyebrow");
  const title = document.getElementById("heroTitle");
  const accent = document.getElementById("heroAccent");
  const subtitle = document.getElementById("heroSubtitle");
  if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
  if (accent && hero.titleAccent) accent.textContent = hero.titleAccent;
  if (title && hero.titleLine1) {
    title.innerHTML = `${hero.titleLine1}<br>${hero.titleLine2 || ""} <span class="hero__title-accent">${hero.titleAccent || ""}</span>`;
  }
  if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
}

/* ---------------------------------------------------------
   Hero mini doctor cards (from real data)
--------------------------------------------------------- */
function buildHeroMiniDoctors() {
  const el = document.getElementById("heroMiniDoctors");
  if (!el || !window.DEMO_DOCTORS) return;
  const top3 = [...DEMO_DOCTORS].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0, 3);
  el.innerHTML = top3.map(doc => `
    <a href="doctor-profile.html?id=${doc.id}" class="hero__doctor-mini">
      <div class="hero__doctor-mini-avatar" style="background:${doc.avatarColor||'#0EA5A4'}">${doc.initials||doc.name.slice(0,2)}</div>
      <div class="hero__doctor-mini-info">
        <div class="hero__doctor-mini-name">${doc.name}</div>
        <div class="hero__doctor-mini-spec">${doc.specialtyIcon||''} ${doc.specialty}</div>
      </div>
      ${doc.availableToday ? '<span class="hero__doctor-mini-badge">متاح اليوم</span>' : ''}
    </a>
  `).join('');
}

/* ---------------------------------------------------------
   Hero stats from real data counts
--------------------------------------------------------- */
function populateHeroStats() {
  const docCount = (window.DEMO_DOCTORS || []).length;
  const specCount = (window.MEDICAL_SPECIALTIES || []).length;
  const govData = window.EGYPT_DATA || {};
  const govCount = Object.keys(govData).length || 27;

  animateCount(document.getElementById("statDoctors"), docCount || 0);
  animateCount(document.getElementById("statSpecs"), specCount || 0);
  animateCount(document.getElementById("statGovs"), govCount);
}

function animateCount(el, target) {
  if (!el) return;
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target).toLocaleString("ar-EG");
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString("ar-EG");
  };
  requestAnimationFrame(tick);
}

/* ---------------------------------------------------------
   Build Dynamic Sections from siteConfig.homeSections
--------------------------------------------------------- */
function buildDynamicSections() {
  const container = document.getElementById("homeSectionsContainer");
  if (!container) return;

  const cfg = window.SITE_CONFIG || {};
  const sections = (cfg.homeSections || defaultSections()).filter(s => s.visible !== false);
  sections.sort((a, b) => (a.order || 99) - (b.order || 99));

  container.innerHTML = "";
  sections.forEach(sec => {
    const el = buildSection(sec, cfg);
    if (el) container.appendChild(el);
  });

  // Re-init scroll reveal for newly added elements
  initScrollReveal();
  // Build specialties and doctor cards
  buildSpecialtiesHomeGrid();
  buildFeaturedDoctors();
  buildTestimonials(cfg.testimonials || []);
}

function defaultSections() {
  return [
    { id:"specialties", label:"تصفح حسب التخصص", eyebrow:"ابدأ من هنا", visible:true, order:1 },
    { id:"how", label:"كيف تستخدم Doctory؟", eyebrow:"بسيط وسريع", visible:true, order:2 },
    { id:"doctors", label:"أطباء مميزون", eyebrow:"الأكثر ثقة", visible:true, order:3 },
    { id:"testimonials", label:"آراء المرضى", eyebrow:"يقولون عنا", visible:true, order:4 },
    { id:"blog", label:"أحدث المقالات", eyebrow:"اقرأ وتعلم", visible:true, order:5 },
    { id:"app", label:"حمّل التطبيق", eyebrow:"تجربة أفضل", visible:true, order:6 },
  ];
}

function buildSection(sec, cfg) {
  const builders = {
    specialties: buildSpecialtiesSection,
    how: buildHowSection,
    doctors: buildDoctorsSection,
    testimonials: buildTestimonialsSection,
    blog: buildBlogSection,
    app: buildAppSection,
  };
  const fn = builders[sec.id];
  return fn ? fn(sec, cfg) : null;
}

function sectionHead(sec) {
  return `
    <div class="section-head reveal">
      ${sec.eyebrow ? `<p class="section-head__eyebrow">${sec.eyebrow}</p>` : ''}
      <h2 class="section-head__title">${sec.label}</h2>
      ${sec.subtitle ? `<p class="section-head__sub">${sec.subtitle}</p>` : ''}
    </div>`;
}

/* --- Specialties --- */
function buildSpecialtiesSection(sec) {
  const div = document.createElement("section");
  div.className = "home-section specialties-section";
  div.innerHTML = `<div class="container">${sectionHead(sec)}<div class="specialties-grid" id="specialtiesHomeGrid"></div><div class="section-cta reveal"><a href="search.html" class="btn btn--ghost">عرض جميع التخصصات <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div></div>`;
  return div;
}

function buildSpecialtiesHomeGrid() {
  const grid = document.getElementById("specialtiesHomeGrid");
  if (!grid || !window.MEDICAL_SPECIALTIES) return;
  MEDICAL_SPECIALTIES.slice(0, 12).forEach((spec, i) => {
    const a = document.createElement("a");
    a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
    a.className = "spec-card reveal";
    a.style.transitionDelay = `${i * 35}ms`;
    a.innerHTML = `<div class="spec-card__icon">${spec.icon}</div><span class="spec-card__name">${spec.name}</span>`;
    grid.appendChild(a);
  });
}

/* --- How It Works --- */
function buildHowSection(sec) {
  const div = document.createElement("section");
  div.className = "home-section how-section";
  div.innerHTML = `
    <div class="container">
      ${sectionHead(sec)}
      <div class="how-steps">
        <div class="how-step reveal">
          <div class="how-step__num">١</div>
          <div class="how-step__icon">
            <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="var(--lilac-100)"/><circle cx="38" cy="36" r="13" stroke="var(--ink-700)" stroke-width="3"/><path d="M48 47l10 10" stroke="var(--accent-teal)" stroke-width="3.5" stroke-linecap="round"/><path d="M32 36h12M38 30v12" stroke="var(--ink-700)" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="how-step__title">ابحث عن طبيبك</h3>
          <p class="how-step__desc">اختر محافظتك والتخصص اللي تحتاجه وابحث باسم الطبيب</p>
        </div>
        <div class="how-step__arrow" aria-hidden="true">
          <svg viewBox="0 0 40 24" fill="none"><path d="M2 12h36M28 4l10 8-10 8" stroke="var(--lilac-300)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="how-step reveal" style="transition-delay:0.1s">
          <div class="how-step__num">٢</div>
          <div class="how-step__icon">
            <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="var(--lilac-100)"/><rect x="22" y="24" width="36" height="32" rx="6" stroke="var(--ink-700)" stroke-width="3"/><path d="M30 24v-4M50 24v-4" stroke="var(--ink-700)" stroke-width="2.5" stroke-linecap="round"/><path d="M22 34h36" stroke="var(--ink-700)" stroke-width="2"/><rect x="29" y="41" width="8" height="8" rx="2" fill="var(--accent-teal)" opacity=".7"/><rect x="43" y="41" width="8" height="8" rx="2" fill="var(--lilac-300)"/></svg>
          </div>
          <h3 class="how-step__title">اختر الموعد</h3>
          <p class="how-step__desc">اطلع على ملف الطبيب والمواعيد المتاحة واختر اللي يناسبك</p>
        </div>
        <div class="how-step__arrow" aria-hidden="true">
          <svg viewBox="0 0 40 24" fill="none"><path d="M2 12h36M28 4l10 8-10 8" stroke="var(--lilac-300)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="how-step reveal" style="transition-delay:0.2s">
          <div class="how-step__num">٣</div>
          <div class="how-step__icon">
            <svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="var(--lilac-100)"/><path d="M28 40c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12" stroke="var(--ink-700)" stroke-width="3" stroke-linecap="round"/><path d="M35 40l4 4 8-8" stroke="var(--accent-teal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 52c-2 0-4-1-4-3v-2c0-1 1-2 2-2h4" stroke="var(--ink-700)" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="how-step__title">احجز وانت مرتاح</h3>
          <p class="how-step__desc">احجز موعدك بضغطة واحدة واستلم تأكيد فوري على موبايلك</p>
        </div>
      </div>
    </div>`;
  return div;
}

/* --- Featured Doctors --- */
function buildDoctorsSection(sec) {
  const div = document.createElement("section");
  div.className = "home-section doctors-section";
  div.innerHTML = `<div class="container">${sectionHead(sec)}<div class="doctors-grid" id="featuredDoctorsGrid"></div><div class="section-cta reveal"><a href="search.html" class="btn btn--ghost">تصفح جميع الأطباء <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div></div>`;
  return div;
}

function buildFeaturedDoctors() {
  const grid = document.getElementById("featuredDoctorsGrid");
  if (!grid || !window.DEMO_DOCTORS) return;
  const featured = [...DEMO_DOCTORS].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0, 4);
  featured.forEach((doc, i) => {
    const stars = "★".repeat(Math.round(doc.rating || 5));
    const card = document.createElement("a");
    card.href = `doctor-profile.html?id=${doc.id}`;
    card.className = "doctor-card reveal";
    card.style.transitionDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="doctor-card__header">
        <div class="doctor-card__avatar" style="background:${doc.avatarColor||'#0EA5A4'}">${doc.initials||doc.name.slice(0,2)}</div>
        <div class="doctor-card__info">
          <div class="doctor-card__name">${doc.name}</div>
          <div class="doctor-card__specialty">${doc.specialtyIcon||''} ${doc.specialty}</div>
        </div>
      </div>
      <div class="doctor-card__rating">
        <span class="doctor-card__rating-stars">${stars}</span>
        <span>${doc.rating}</span>
        <span class="doctor-card__rating-count">(${doc.reviews||0} تقييم)</span>
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
        </span>` : ''}
      </div>
      <div class="doctor-card__price">${doc.price} جنيه <small>/ الكشف</small></div>
      <span class="doctor-card__cta">احجز موعد ←</span>`;
    grid.appendChild(card);
  });
}

/* --- Testimonials --- */
function buildTestimonialsSection(sec) {
  const div = document.createElement("section");
  div.className = "home-section testimonials-section";
  div.innerHTML = `<div class="container">${sectionHead(sec)}<div class="testimonials-grid" id="testimonialsGrid"></div></div>`;
  return div;
}

function buildTestimonials(list) {
  const grid = document.getElementById("testimonialsGrid");
  if (!grid) return;
  if (!list || !list.length) {
    grid.closest('.testimonials-section')?.remove();
    return;
  }
  grid.innerHTML = list.map((t, i) => `
    <div class="testimonial-card reveal" style="transition-delay:${i*80}ms">
      <div class="testimonial-card__quote">"</div>
      <p class="testimonial-card__text">${t.text}</p>
      <div class="testimonial-card__stars">${'★'.repeat(t.rating||5)}</div>
      <div class="testimonial-card__author">
        <div class="testimonial-card__avatar" style="background:${t.avatarColor||'#0EA5A4'}">${t.name.slice(0,1)}</div>
        <div>
          <div class="testimonial-card__name">${t.name}</div>
          <div class="testimonial-card__label">${t.label||''}</div>
        </div>
      </div>
    </div>`).join('');
}

/* --- Blog --- */
function buildBlogSection(sec) {
  const div = document.createElement("section");
  div.className = "home-section reports-section";
  div.innerHTML = `
    <div class="container">
      ${sectionHead(sec)}
      <div class="reports-grid" id="reportsGrid">
        <article class="report-card reveal">
          <div class="report-card__cover report-card__cover--heart">
            <svg viewBox="0 0 120 90" fill="none"><rect width="120" height="90" rx="12" fill="#EEF2FF"/><path d="M60 65s-24-16-24-32a16 16 0 0 1 24-13.9A16 16 0 0 1 84 33c0 16-24 32-24 32z" fill="#6366F1" opacity=".2"/><path d="M60 65s-24-16-24-32a16 16 0 0 1 24-13.9A16 16 0 0 1 84 33c0 16-24 32-24 32z" stroke="#6366F1" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 38h8l4-8 8 16 4-8h8" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="report-card__body">
            <span class="report-card__tag">القلب والأوعية</span>
            <h3 class="report-card__title">٧ علامات تحذيرية يجب ألا تتجاهلها في صحة قلبك</h3>
            <p class="report-card__excerpt">يصف الأطباء أعراضًا يكثر تجاهلها رغم كونها مؤشرات مبكرة لأمراض القلب التي يمكن علاجها إن اكتُشفت مبكرًا...</p>
            <div class="report-card__meta"><span class="report-card__date"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> ١٥ يونيو ٢٠٢٥</span><a href="blog.html" class="report-card__link">اقرأ ←</a></div>
          </div>
        </article>
        <article class="report-card reveal" style="transition-delay:80ms">
          <div class="report-card__cover report-card__cover--brain">
            <svg viewBox="0 0 120 90" fill="none"><rect width="120" height="90" rx="12" fill="#F0FDF4"/><ellipse cx="60" cy="42" rx="22" ry="18" stroke="#16A34A" stroke-width="2.5"/><circle cx="60" cy="42" r="6" fill="#16A34A" opacity=".3"/></svg>
          </div>
          <div class="report-card__body">
            <span class="report-card__tag report-card__tag--green">المخ والأعصاب</span>
            <h3 class="report-card__title">الصداع النصفي — الأسباب والعلاج وأحدث التوصيات</h3>
            <p class="report-card__excerpt">يعاني ملايين المصريين من الصداع النصفي دون معرفة أسبابه الحقيقية أو أساليب العلاج الحديثة المتاحة الآن في مصر...</p>
            <div class="report-card__meta"><span class="report-card__date"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> ١٠ يونيو ٢٠٢٥</span><a href="blog.html" class="report-card__link">اقرأ ←</a></div>
          </div>
        </article>
        <article class="report-card reveal" style="transition-delay:160ms">
          <div class="report-card__cover report-card__cover--bone">
            <svg viewBox="0 0 120 90" fill="none"><rect width="120" height="90" rx="12" fill="#FFF7ED"/><circle cx="60" cy="45" r="18" fill="#EA580C" opacity=".12" stroke="#EA580C" stroke-width="2"/></svg>
          </div>
          <div class="report-card__body">
            <span class="report-card__tag report-card__tag--orange">العظام والمفاصل</span>
            <h3 class="report-card__title">هشاشة العظام — كيف تكتشفها مبكرًا وتحمي نفسك؟</h3>
            <p class="report-card__excerpt">هشاشة العظام مرض صامت يصيب الملايين دون أعراض واضحة حتى تحدث كسر. تعرف على طرق الوقاية والكشف المبكر...</p>
            <div class="report-card__meta"><span class="report-card__date"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> ٣ يونيو ٢٠٢٥</span><a href="blog.html" class="report-card__link">اقرأ ←</a></div>
          </div>
        </article>
        <article class="report-card reveal" style="transition-delay:240ms">
          <div class="report-card__cover report-card__cover--sugar">
            <svg viewBox="0 0 120 90" fill="none"><rect width="120" height="90" rx="12" fill="#FFF1F2"/><rect x="35" y="28" width="50" height="34" rx="6" stroke="#E11D48" stroke-width="2.5"/><path d="M35 38h50" stroke="#E11D48" stroke-width="1.5"/><circle cx="53" cy="49" r="6" fill="#E11D48" opacity=".15" stroke="#E11D48" stroke-width="2"/><path d="M50 49l2 2 4-4" stroke="#E11D48" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div class="report-card__body">
            <span class="report-card__tag report-card__tag--red">السكر والغدد</span>
            <h3 class="report-card__title">السكر من النوع الثاني — دليل المريض للتعايش والسيطرة</h3>
            <p class="report-card__excerpt">يعيش مع مرض السكر أكثر من ١٠ ملايين مصري. هذا الدليل المبسط يشرح كيف تسيطر على مستوى السكر بالغذاء والدواء...</p>
            <div class="report-card__meta"><span class="report-card__date"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> ٢٨ مايو ٢٠٢٥</span><a href="blog.html" class="report-card__link">اقرأ ←</a></div>
          </div>
        </article>
      </div>
      <div class="section-cta reveal"><a href="blog.html" class="btn btn--ghost">عرض جميع المقالات <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
    </div>`;
  return div;
}

/* --- App CTA --- */
function buildAppSection(sec) {
  const div = document.createElement("section");
  div.className = "app-cta-section";
  div.innerHTML = `
    <div class="container app-cta__inner">
      <div class="app-cta__copy reveal">
        <p class="section-head__eyebrow" style="color:var(--lilac-300)">${sec.eyebrow||'تجربة أفضل'}</p>
        <h2 class="app-cta__title">${sec.label||'حمّل تطبيق Doctory'}</h2>
        <p class="app-cta__sub">${sec.subtitle||'احجز مواعيدك، اتابع ملفك الصحي، وتواصل مع طبيبك في أي وقت من على موبايلك.'}</p>
        <div class="app-cta__btns">
          <a href="#" class="app-store-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span><small>حمّل من</small><strong>App Store</strong></span>
          </a>
          <a href="#" class="app-store-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="m3.18 23.77 9.5-9.5L4.76 6.35c-.33.1-.56.4-.56.75v15.96c0 .27.14.52.37.66zM14.03 13l2.28-2.28L5.42 4.49c-.15-.08-.31-.12-.48-.12-.34 0-.64.19-.78.48zM20.1 10.58l-2.28 1.31-2.28-2.28 2.28-2.28 2.28 1.31c.55.31.91.91.91 1.48 0 .57-.36 1.15-.91 1.46zM4.76 19.51l8.93 5.14.34.19-2.28-2.28z"/></svg>
            <span><small>حمّل من</small><strong>Google Play</strong></span>
          </a>
        </div>
      </div>
      <div class="app-cta__mockup reveal" aria-hidden="true">
        <svg viewBox="0 0 200 360" fill="none" class="phone-svg">
          <rect x="10" y="10" width="180" height="340" rx="28" fill="white" opacity=".08" stroke="white" stroke-width="2" stroke-opacity=".25"/>
          <rect x="18" y="18" width="164" height="324" rx="22" fill="white" opacity=".06"/>
          <rect x="72" y="14" width="56" height="10" rx="5" fill="white" opacity=".3"/>
          <rect x="24" y="36" width="152" height="298" rx="18" fill="#1B3A6B" opacity=".5"/>
          <rect x="24" y="36" width="152" height="44" rx="18" fill="#102A4C" opacity=".9"/>
          <circle cx="50" cy="58" r="12" fill="#0EA5A4" opacity=".6"/>
          <rect x="70" y="52" width="60" height="8" rx="4" fill="white" opacity=".6"/>
          <rect x="70" y="63" width="40" height="6" rx="3" fill="white" opacity=".3"/>
          <rect x="30" y="92" width="140" height="64" rx="12" fill="white" opacity=".08"/>
          <circle cx="52" cy="120" r="16" fill="#0EA5A4" opacity=".3"/>
          <rect x="75" y="108" width="70" height="8" rx="4" fill="white" opacity=".7"/>
          <rect x="75" y="120" width="50" height="6" rx="3" fill="white" opacity=".4"/>
          <rect x="75" y="132" width="40" height="16" rx="8" fill="#0EA5A4" opacity=".6"/>
          <rect x="30" y="165" width="140" height="64" rx="12" fill="white" opacity=".08"/>
          <circle cx="52" cy="193" r="16" fill="#C7BBF5" opacity=".3"/>
          <rect x="75" y="181" width="70" height="8" rx="4" fill="white" opacity=".7"/>
          <rect x="75" y="193" width="50" height="6" rx="3" fill="white" opacity=".4"/>
          <rect x="30" y="238" width="140" height="64" rx="12" fill="white" opacity=".06"/>
          <rect x="24" y="309" width="152" height="25" rx="18" fill="#102A4C" opacity=".9"/>
          <circle cx="54" cy="318" r="8" fill="white" opacity=".6"/>
          <circle cx="100" cy="318" r="8" fill="#0EA5A4" opacity=".8"/>
          <circle cx="146" cy="318" r="8" fill="white" opacity=".3"/>
        </svg>
      </div>
    </div>`;
  return div;
}

/* ---------------------------------------------------------
   Scroll Reveal
--------------------------------------------------------- */
function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal:not(.in-view)").forEach(el => io.observe(el));
}
