/* =========================================================
   Doctory — MedService-inspired New Sections
   أقسام جديدة مستلهمة من تمبلت MedService
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    injectStatsBar();
    injectEmergencyBar();
    injectWhySection();
    injectSpecTabsSection();
    injectTrustSection();
    injectJoinBanner();
    initSpecTabs();
    initAnimatedCounters();
  };
  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
  // Fallback: run after 1s in case data loads fast
  setTimeout(boot, 800);
});

/* =========================================================
   1. Stats Bar — بعد الهيرو مباشرة
   ========================================================= */
function injectStatsBar() {
  if (document.getElementById("statsBar")) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const docCount = (window.DEMO_DOCTORS || []).length || 150;
  const specCount = (window.MEDICAL_SPECIALTIES || []).length || 35;

  const bar = document.createElement("div");
  bar.id = "statsBar";
  bar.className = "stats-bar";
  bar.innerHTML = `
    <div class="container">
      <div class="stats-bar__inner">
        <div class="stats-bar__item reveal">
          <div class="stats-bar__icon">👨‍⚕️</div>
          <div class="stats-bar__num" data-target="${docCount}"><span>0</span>+</div>
          <div class="stats-bar__label">طبيب متحقق منه</div>
        </div>
        <div class="stats-bar__item reveal" style="transition-delay:0.1s">
          <div class="stats-bar__icon">🏥</div>
          <div class="stats-bar__num" data-target="${specCount}"><span>0</span></div>
          <div class="stats-bar__label">تخصص طبي</div>
        </div>
        <div class="stats-bar__item reveal" style="transition-delay:0.2s">
          <div class="stats-bar__icon">🗺️</div>
          <div class="stats-bar__num" data-target="27"><span>0</span></div>
          <div class="stats-bar__label">محافظة مصرية</div>
        </div>
        <div class="stats-bar__item reveal" style="transition-delay:0.3s">
          <div class="stats-bar__icon">⭐</div>
          <div class="stats-bar__num">4.8<span>/5</span></div>
          <div class="stats-bar__label">متوسط تقييم الأطباء</div>
        </div>
      </div>
    </div>`;

  hero.insertAdjacentElement("afterend", bar);
}

/* =========================================================
   2. Emergency Bar
   ========================================================= */
function injectEmergencyBar() {
  if (document.getElementById("emergencyBar")) return;
  const statsBar = document.getElementById("statsBar");
  if (!statsBar) return;

  const bar = document.createElement("div");
  bar.id = "emergencyBar";
  bar.className = "emergency-bar";
  bar.innerHTML = `
    <div class="container">
      <div class="emergency-bar__inner">
        <div class="emergency-bar__text">
          <span class="emergency-bar__icon">🚨</span>
          <div>
            <div class="emergency-bar__title">حالة طوارئ؟ تواصل معنا فوراً</div>
            <div class="emergency-bar__sub">خدمة متاحة ٢٤ ساعة / ٧ أيام للحالات العاجلة</div>
          </div>
        </div>
        <div class="emergency-bar__phone">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          19999
        </div>
        <a href="tel:19999" class="emergency-bar__btn">اتصل الآن</a>
      </div>
    </div>`;

  statsBar.insertAdjacentElement("afterend", bar);
}

/* =========================================================
   3. Why Choose Doctory Section
   ========================================================= */
function injectWhySection() {
  if (document.getElementById("whySection")) return;
  const container = document.getElementById("homeSectionsContainer");
  if (!container) return;

  const section = document.createElement("section");
  section.id = "whySection";
  section.className = "home-section why-section";
  section.innerHTML = `
    <div class="container">
      <div class="why-inner">

        <div class="why-visual reveal">
          <div class="why-visual__card">
            <div class="why-visual__number">١٠٠٪</div>
            <div class="why-visual__label">أطباء موثّقون ومرخّصون</div>
            <div class="why-visual__sub">كل طبيب على المنصة مراجَع ومرخَّص من نقابة الأطباء المصرية</div>
          </div>
          <div class="why-float-badge why-float-badge--1">
            <span class="why-float-badge__icon">✅</span>
            <div class="why-float-badge__text">
              <strong>طبيب موثّق</strong>
              <span>تحقق من الترخيص</span>
            </div>
          </div>
          <div class="why-float-badge why-float-badge--2">
            <span class="why-float-badge__icon">⭐</span>
            <div class="why-float-badge__text">
              <strong>٤٫٨ من ٥</strong>
              <span>متوسط تقييمات المرضى</span>
            </div>
          </div>
        </div>

        <div class="why-content">
          <div class="section-head" style="text-align:right; margin-bottom:0">
            <p class="section-head__eyebrow">ليه Doctory؟</p>
            <h2 class="section-head__title">الدليل الطبي الأكثر ثقة في مصر</h2>
            <p class="section-head__sub" style="margin:0; text-align:right">بنساعدك تلاقي الطبيب الصح بدون تعب — معلومات دقيقة، تقييمات حقيقية، وحجز سهل</p>
          </div>

          <div class="why-features">
            <div class="why-feature reveal">
              <div class="why-feature__icon">🔍</div>
              <div class="why-feature__body">
                <div class="why-feature__title">بحث ذكي ودقيق</div>
                <div class="why-feature__desc">ابحث بالمحافظة والمنطقة والتخصص واسم الطبيب في خطوة واحدة بسيطة</div>
              </div>
            </div>
            <div class="why-feature reveal" style="transition-delay:0.08s">
              <div class="why-feature__icon">⭐</div>
              <div class="why-feature__body">
                <div class="why-feature__title">تقييمات حقيقية من مرضى فعليين</div>
                <div class="why-feature__desc">اطلع على آراء مرضى حقيقيين وقرارات مبنية على تجارب موثّقة</div>
              </div>
            </div>
            <div class="why-feature reveal" style="transition-delay:0.16s">
              <div class="why-feature__icon">💰</div>
              <div class="why-feature__body">
                <div class="why-feature__title">أسعار الكشف واضحة ومتاحة</div>
                <div class="why-feature__desc">اطلع على سعر الكشف قبل ما تروح — مفيش مفاجآت</div>
              </div>
            </div>
            <div class="why-feature reveal" style="transition-delay:0.24s">
              <div class="why-feature__icon">✅</div>
              <div class="why-feature__body">
                <div class="why-feature__title">أطباء موثّقون ومرخّصون</div>
                <div class="why-feature__desc">كل طبيب على Doctory مراجَع ومرخَّص — بتثق في الطبيب الصح</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Insert before homeSectionsContainer (before specialties)
  container.parentElement.insertBefore(section, container);
}

/* =========================================================
   4. Specialty Tabs Section (after doctors section)
   ========================================================= */
function injectSpecTabsSection() {
  if (document.getElementById("specTabsSection")) return;
  const container = document.getElementById("homeSectionsContainer");
  if (!container) return;

  const specialties = [
    { id: "heart", icon: "❤️", name: "قلب وأوعية", desc: "يتخصص أطباء القلب في Doctory في تشخيص وعلاج أمراض القلب والأوعية الدموية، بدءًا من ارتفاع ضغط الدم والتشخيص المبكر حتى القسطرة العلاجية وزراعة الصمامات.", features: ["تشخيص أمراض القلب", "قسطرة القلب التداخلية", "رسم قلب وإيكو", "علاج اضطرابات النبض"] },
    { id: "bone", icon: "🦴", name: "عظام ومفاصل", desc: "أخصائيو العظام والمفاصل على Doctory يغطون كل حالات الكسور والتهابات المفاصل وعمليات التثبيت والاستبدال بأحدث التقنيات.", features: ["كسور وإصلاح العظام", "استبدال مفصل الركبة والورك", "تنظير المفاصل", "علاج الانزلاق الغضروفي"] },
    { id: "skin", icon: "🧴", name: "جلدية وتجميل", desc: "أطباء الجلدية في Doctory متخصصون في الأمراض الجلدية والعلاجات التجميلية، من حب الشباب والصدفية لليزر وإزالة الوشم وحقن البوتوكس.", features: ["علاج حب الشباب والأكزيما", "ليزر إزالة الشعر", "حقن البوتوكس والفيلر", "علاجات تجديد البشرة"] },
    { id: "eye", icon: "👁️", name: "عيون", desc: "طاقم أطباء العيون المتميزين على Doctory يقدمون خدمات الكشف الشامل للبصر وجراحة الليزك وعمليات الكتاراكت وعلاج الضغط.", features: ["قياس النظر والعدسات", "جراحة الليزك", "عمليات الكتاراكت", "علاج الجلوكوما"] },
  ];

  const tabBtns = specialties.map((s, i) => `
    <button class="spec-tab${i===0?' is-active':''}" data-tab="${s.id}">
      <span class="spec-tab__icon">${s.icon}</span> ${s.name}
    </button>`).join('');

  const panels = specialties.map((s, i) => `
    <div class="spec-tab__panel${i===0?' is-active':''}" data-panel="${s.id}">
      <div class="spec-tab-panel__img reveal">${s.icon}</div>
      <div class="spec-tab-panel__content reveal" style="transition-delay:0.1s">
        <h3 class="spec-tab-panel__title">${s.name}</h3>
        <p class="spec-tab-panel__desc">${s.desc}</p>
        <ul class="spec-tab-panel__features">
          ${s.features.map(f=>`<li>${f}</li>`).join('')}
        </ul>
        <a href="search.html?specialty=${encodeURIComponent(s.name)}" class="btn btn--primary">
          ابحث عن دكتور ${s.name}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>`).join('');

  const section = document.createElement("section");
  section.id = "specTabsSection";
  section.className = "home-section spec-tabs-section";
  section.innerHTML = `
    <div class="container">
      <div class="section-head reveal">
        <p class="section-head__eyebrow">تصفح التخصصات</p>
        <h2 class="section-head__title">دكاترة متميزون في كل التخصصات</h2>
        <p class="section-head__sub">اختر التخصص اللي تحتاجه وابحث عن أفضل طبيب قريب منك</p>
      </div>
      <div class="spec-tabs reveal">${tabBtns}</div>
      <div class="spec-tabs__panels">${panels}</div>
    </div>`;

  container.appendChild(section);
}

/* =========================================================
   5. Trust / Partners Section
   ========================================================= */
function injectTrustSection() {
  if (document.getElementById("trustSection")) return;
  const container = document.getElementById("homeSectionsContainer");
  if (!container) return;

  const section = document.createElement("div");
  section.id = "trustSection";
  section.className = "trust-section";
  section.innerHTML = `
    <div class="container">
      <div class="trust-inner">
        <span class="trust-label">موثوق من قِبَل</span>
        <div class="trust-divider"></div>
        <div class="trust-logos">
          <div class="trust-logo"><span class="trust-logo__icon">🏥</span> نقابة الأطباء المصرية</div>
          <div class="trust-logo"><span class="trust-logo__icon">🎓</span> جامعة القاهرة</div>
          <div class="trust-logo"><span class="trust-logo__icon">🏛️</span> وزارة الصحة</div>
          <div class="trust-logo"><span class="trust-logo__icon">⚕️</span> مستشفى القصر العيني</div>
          <div class="trust-logo"><span class="trust-logo__icon">🏆</span> المجلس الطبي المصري</div>
        </div>
      </div>
    </div>`;

  container.insertBefore(section, container.firstChild);
}

/* =========================================================
   6. Join As Doctor Banner
   ========================================================= */
function injectJoinBanner() {
  if (document.getElementById("joinBanner")) return;
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  const section = document.createElement("section");
  section.id = "joinBanner";
  section.className = "join-banner";
  section.innerHTML = `
    <div class="container">
      <div class="join-banner__inner">
        <div class="reveal">
          <span class="join-banner__eyebrow">للأطباء والأخصائيين</span>
          <h2 class="join-banner__title">انضم إلى أكبر شبكة أطباء في مصر</h2>
          <p class="join-banner__sub">سجّل عيادتك أو عملك على Doctory وابدأ في استقبال مرضى جدد — مجاناً خلال أقل من ٢٤ ساعة</p>
          <div class="join-banner__btns">
            <a href="join-doctor.html" class="join-banner__btn--primary">سجّل عيادتك مجاناً</a>
            <a href="about.html" class="join-banner__btn--ghost">اعرف أكثر</a>
          </div>
        </div>
        <div class="join-banner__features reveal" style="transition-delay:0.15s">
          <div class="join-banner__feature">
            <div class="join-banner__feature-icon">🆓</div>
            <div class="join-banner__feature-text">
              <strong>تسجيل مجاني بالكامل</strong>
              <span>مفيش رسوم خفية</span>
            </div>
          </div>
          <div class="join-banner__feature">
            <div class="join-banner__feature-icon">📱</div>
            <div class="join-banner__feature-text">
              <strong>لوحة تحكم سهلة</strong>
              <span>إدارة البروفايل والمواعيد</span>
            </div>
          </div>
          <div class="join-banner__feature">
            <div class="join-banner__feature-icon">⭐</div>
            <div class="join-banner__feature-text">
              <strong>تقييمات حقيقية</strong>
              <span>ابن ثقتك مع مرضى جدد</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  footer.insertAdjacentElement("beforebegin", section);
}

/* =========================================================
   Init: Spec Tabs Interactivity
   ========================================================= */
function initSpecTabs() {
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".spec-tab");
    if (!tab) return;
    const id = tab.dataset.tab;
    document.querySelectorAll(".spec-tab").forEach(t => t.classList.remove("is-active"));
    document.querySelectorAll(".spec-tab__panel").forEach(p => p.classList.remove("is-active"));
    tab.classList.add("is-active");
    const panel = document.querySelector(`.spec-tab__panel[data-panel="${id}"]`);
    if (panel) panel.classList.add("is-active");
  });
}

/* =========================================================
   Init: Animated Counters for Stats Bar
   ========================================================= */
function initAnimatedCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target || "0");
      if (!target) return;
      const numEl = el.querySelector("span");
      if (!numEl) return;
      let start = 0;
      const duration = 1600;
      const startTime = performance.now();
      const tick = (now) => {
        const p = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        numEl.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else numEl.textContent = target;
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".stats-bar__num[data-target]").forEach(el => observer.observe(el));
}

/* =========================================================
   Re-init scroll reveal for injected elements
   ========================================================= */
function reinitReveal() {
  if (typeof initScrollReveal === "function") {
    initScrollReveal();
    return;
  }
  // Fallback inline reveal
  const els = document.querySelectorAll(".reveal:not(.in-view)");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// Run reveal after injections settle
setTimeout(reinitReveal, 500);
setTimeout(reinitReveal, 1200);
