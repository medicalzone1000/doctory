/* =========================================================
   Doctory Admin Panel — Professional Control Dashboard
   ========================================================= */

const App = (() => {
  const state = {
    section: "dashboard",
    data: { governorates: null, specialties: null, doctors: null, siteConfig: null },
    shas: {},
    dirty: false,
    saving: false,
    searchDoctor: "",
    editingDoctor: null,
    editingSpecialty: null,
    selectedGovernorate: null,
  };

  const sections = [
    { id: "dashboard", icon: "📊", label: "لوحة التحكم" },
    { id: "doctors", icon: "👨‍⚕️", label: "الأطباء" },
    { id: "specialties", icon: "🩺", label: "التخصصات" },
    { id: "governorates", icon: "📍", label: "المحافظات" },
    { id: "content", icon: "📝", label: "محتوى الموقع" },
    { id: "design", icon: "🎨", label: "التصميم والألوان" },
    { id: "settings", icon: "⚙️", label: "GitHub والإعدادات" },
  ];

  /* ---------- UI helpers ---------- */
  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function toast(msg, type = "info") {
    const box = $("#toastBox");
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.classList.add("is-visible"), 10);
    setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  function setDirty(v = true) {
    state.dirty = v;
    $("#saveBar")?.classList.toggle("is-visible", v);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nextDoctorId() {
    const ids = (state.data.doctors || []).map((d) => d.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  function markSaved() {
    state.dirty = false;
    $("#saveBar")?.classList.remove("is-visible");
  }

  /* ---------- Auth ---------- */
  function renderLogin() {
    const session = GitHubAPI.getSession();
    $("#loginScreen").hidden = !!session;
    $("#adminShell").hidden = !session;
    if (session) {
      $("#sessionUser").textContent = session.username;
      $("#sessionRepo").textContent = `${session.owner}/${session.repo} (${session.branch})`;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const btn = $("#loginBtn");
    btn.disabled = true;
    btn.textContent = "جاري التحقق...";
    try {
      await GitHubAPI.validateAndConnect({
        token: $("#ghToken").value,
        owner: $("#ghOwner").value,
        repo: $("#ghRepo").value,
        branch: $("#ghBranch").value || "main",
      });
      $("#ghToken").value = "";
      renderLogin();
      await bootstrapData();
      toast("تم الاتصال بنجاح", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "دخول لوحة التحكم";
    }
  }

  function logout() {
    if (state.dirty && !confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    GitHubAPI.clearSession();
    location.reload();
  }

  /* ---------- Data loading ---------- */
  async function bootstrapData() {
    $("#loadingOverlay").hidden = false;
    try {
      const { data, shas } = await GitHubAPI.loadAllData();
      state.shas = shas;

      const missing = Object.entries(data).filter(([, v]) => v == null).map(([k]) => k);
      if (missing.length) {
        const useDefaults = confirm(
          `ملفات JSON غير موجودة على GitHub (${missing.join(", ")}).\n\nهل تريد إنشاءها الآن من البيانات الافتراضية؟`
        );
        if (useDefaults) {
          await initializeRepoData();
        } else {
          state.data = getDefaults();
          setDirty(true);
        }
      } else {
        state.data = data;
      }

      renderSection();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      $("#loadingOverlay").hidden = true;
    }
  }

  async function initializeRepoData() {
    const defaults = getDefaults();
    await GitHubAPI.saveJsonFile("governorates", defaults.governorates, "Initialize governorates data");
    await GitHubAPI.saveJsonFile("specialties", defaults.specialties, "Initialize specialties data");
    await GitHubAPI.saveJsonFile("doctors", defaults.doctors, "Initialize doctors data");
    await GitHubAPI.saveJsonFile("siteConfig", defaults.siteConfig, "Initialize site config");
    const refreshed = await GitHubAPI.loadAllData();
    state.data = refreshed.data;
    state.shas = refreshed.shas;
    markSaved();
    toast("تم إنشاء ملفات JSON على GitHub", "success");
  }

  async function saveAll() {
    if (state.saving) return;
    state.saving = true;
    $("#saveAllBtn").disabled = true;
    try {
      await GitHubAPI.saveJsonFile("governorates", state.data.governorates, "Update governorates");
      await GitHubAPI.saveJsonFile("specialties", state.data.specialties, "Update specialties");
      await GitHubAPI.saveJsonFile("doctors", state.data.doctors, "Update doctors");
      await GitHubAPI.saveJsonFile("siteConfig", state.data.siteConfig, "Update site config");
      const refreshed = await GitHubAPI.loadAllData();
      state.shas = refreshed.shas;
      markSaved();
      toast("تم النشر على GitHub بنجاح", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      state.saving = false;
      $("#saveAllBtn").disabled = false;
    }
  }

  /* ---------- Navigation ---------- */
  function renderNav() {
    $("#sidebarNav").innerHTML = sections
      .map(
        (s) => `
      <button class="sidebar__link${state.section === s.id ? " is-active" : ""}" data-section="${s.id}">
        <span class="sidebar__icon">${s.icon}</span>
        <span>${s.label}</span>
      </button>`
      )
      .join("");

    $("#sidebarNav").querySelectorAll("[data-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.section = btn.dataset.section;
        renderNav();
        renderSection();
      });
    });
  }

  function renderSection() {
    const main = $("#mainContent");
    const renderers = {
      dashboard: renderDashboard,
      doctors: renderDoctors,
      specialties: renderSpecialties,
      governorates: renderGovernorates,
      content: renderContent,
      design: renderDesign,
      settings: renderSettings,
    };
    main.innerHTML = renderers[state.section]?.() || "";
    bindSectionEvents();
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const d = state.data;
    const docCount = d.doctors?.length || 0;
    const specCount = d.specialties?.length || 0;
    const govCount = Object.keys(d.governorates?.governorates || {}).length;
    const featured = (d.doctors || []).filter((x) => x.featured).length;

    return `
      <div class="page-head">
        <div>
          <h1>لوحة التحكم</h1>
          <p>إدارة شاملة لمنصة Doctory — البيانات تُحفظ على GitHub كملفات JSON</p>
        </div>
        <a href="${GitHubAPI.getPublicSiteUrl()}" target="_blank" rel="noopener" class="btn btn--ghost">معاينة الموقع ↗</a>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-card__value">${docCount}</span><span class="stat-card__label">طبيب</span></div>
        <div class="stat-card"><span class="stat-card__value">${specCount}</span><span class="stat-card__label">تخصص</span></div>
        <div class="stat-card"><span class="stat-card__value">${govCount}</span><span class="stat-card__label">محافظة</span></div>
        <div class="stat-card"><span class="stat-card__value">${featured}</span><span class="stat-card__label">طبيب مميز</span></div>
      </div>
      <div class="panel-grid">
        <div class="panel">
          <h3>إجراءات سريعة</h3>
          <div class="quick-actions">
            <button class="btn btn--primary" data-go="doctors">إضافة طبيب</button>
            <button class="btn btn--ghost" data-go="specialties">إدارة التخصصات</button>
            <button class="btn btn--ghost" data-go="design">تخصيص الألوان</button>
            <button class="btn btn--ghost" data-go="content">تعديل الصفحة الرئيسية</button>
          </div>
        </div>
        <div class="panel">
          <h3>ملاحظات</h3>
          <ul class="notes-list">
            <li>التوكن لا يُحفظ في ملفات الموقع — فقط في جلسة المتصفح.</li>
            <li>بعد الحفظ، قد يستغرق GitHub Pages دقيقة لتحديث الموقع.</li>
            <li>تأكد أن التوكن Classic يملك صلاحية <code>repo</code>.</li>
          </ul>
        </div>
      </div>`;
  }

  /* ---------- Doctors ---------- */
  function renderDoctors() {
    const doctors = (state.data.doctors || []).filter((d) => {
      if (!state.searchDoctor) return true;
      const q = state.searchDoctor.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
    });

    return `
      <div class="page-head">
        <div>
          <h1>الأطباء</h1>
          <p>إضافة وتعديل وحذف الأطباء</p>
        </div>
        <button class="btn btn--primary" id="addDoctorBtn">+ إضافة طبيب</button>
      </div>
      <div class="toolbar">
        <input class="input" id="doctorSearch" placeholder="بحث بالاسم أو التخصص..." value="${escapeHtml(state.searchDoctor)}">
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th><th>الاسم</th><th>التخصص</th><th>المحافظة</th><th>التقييم</th><th>السعر</th><th>مميز</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${doctors
              .map(
                (d) => `
              <tr>
                <td>${d.id}</td>
                <td><strong>${escapeHtml(d.name)}</strong></td>
                <td>${escapeHtml(d.specialty)}</td>
                <td>${escapeHtml(d.governorate)}</td>
                <td>${d.rating} ⭐</td>
                <td>${d.price} ج</td>
                <td>${d.featured ? "⭐" : "—"}</td>
                <td class="table-actions">
                  <button class="btn-icon" data-edit-doctor="${d.id}" title="تعديل">✏️</button>
                  <button class="btn-icon btn-icon--danger" data-del-doctor="${d.id}" title="حذف">🗑️</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      ${renderDoctorModal()}`;
  }

  function doctorFormFields(doc = {}) {
    const specs = state.data.specialties || [];
    const govs = Object.keys(state.data.governorates?.governorates || {});
    const areas = doc.governorate ? state.data.governorates.governorates[doc.governorate] || [] : [];

    return `
      <div class="form-grid">
        <label class="field"><span>الاسم</span><input class="input" name="name" value="${escapeHtml(doc.name || "")}" required></label>
        <label class="field"><span>الجنس</span>
          <select class="input" name="gender">
            <option value="male" ${doc.gender === "male" ? "selected" : ""}>دكتور</option>
            <option value="female" ${doc.gender === "female" ? "selected" : ""}>دكتورة</option>
          </select>
        </label>
        <label class="field"><span>التخصص</span>
          <select class="input" name="specialty" id="docSpecialtySelect">
            ${specs.map((s) => `<option value="${escapeHtml(s.name)}" data-icon="${escapeHtml(s.icon)}" ${doc.specialty === s.name ? "selected" : ""}>${s.icon} ${escapeHtml(s.name)}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>الدرجة العلمية</span><input class="input" name="degree" value="${escapeHtml(doc.degree || "")}"></label>
        <label class="field"><span>المحافظة</span>
          <select class="input" name="governorate" id="docGovSelect">
            ${govs.map((g) => `<option ${doc.governorate === g ? "selected" : ""}>${escapeHtml(g)}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>المنطقة</span>
          <select class="input" name="area" id="docAreaSelect">
            ${areas.map((a) => `<option ${doc.area === a ? "selected" : ""}>${escapeHtml(a)}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>العيادة</span><input class="input" name="clinic" value="${escapeHtml(doc.clinic || "")}"></label>
        <label class="field"><span>سنوات الخبرة</span><input class="input" type="number" name="experience" value="${doc.experience ?? 0}"></label>
        <label class="field"><span>سعر الكشف</span><input class="input" type="number" name="price" value="${doc.price ?? 0}"></label>
        <label class="field"><span>التقييم</span><input class="input" type="number" step="0.1" min="0" max="5" name="rating" value="${doc.rating ?? 4.5}"></label>
        <label class="field"><span>عدد التقييمات</span><input class="input" type="number" name="reviews" value="${doc.reviews ?? 0}"></label>
        <label class="field"><span>الأحرف (Avatar)</span><input class="input" name="initials" maxlength="3" value="${escapeHtml(doc.initials || "")}"></label>
        <label class="field"><span>لون Avatar</span><input class="input" type="color" name="avatarColor" value="${doc.avatarColor || "#1B3A6B"}"></label>
        <label class="field field--check"><input type="checkbox" name="featured" ${doc.featured ? "checked" : ""}> مميز</label>
        <label class="field field--check"><input type="checkbox" name="verified" ${doc.verified ? "checked" : ""}> موثق</label>
        <label class="field field--check"><input type="checkbox" name="availableToday" ${doc.availableToday ? "checked" : ""}> متاح اليوم</label>
        <label class="field field--check"><input type="checkbox" name="availableTomorrow" ${doc.availableTomorrow ? "checked" : ""}> متاح غداً</label>
        <label class="field field--check"><input type="checkbox" name="hasOnline" ${doc.hasOnline ? "checked" : ""}> كشف أونلاين</label>
        <label class="field field--full"><span>نبذة عن الطبيب</span><textarea class="input textarea" name="bio" rows="4">${escapeHtml(doc.bio || "")}</textarea></label>
      </div>`;
  }

  function renderDoctorModal() {
    const doc = state.editingDoctor;
    if (doc === null) return "";
    const isNew = !doc.id;
    return `
      <div class="modal is-open" id="doctorModal">
        <div class="modal__backdrop" data-close-modal></div>
        <div class="modal__dialog modal__dialog--wide">
          <div class="modal__head">
            <h2>${isNew ? "إضافة طبيب" : "تعديل طبيب"}</h2>
            <button class="btn-icon" data-close-modal>✕</button>
          </div>
          <form id="doctorForm">${doctorFormFields(doc)}</form>
          <div class="modal__foot">
            <button class="btn btn--ghost" data-close-modal>إلغاء</button>
            <button class="btn btn--primary" id="saveDoctorBtn">حفظ</button>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Specialties ---------- */
  function renderSpecialties() {
    const items = state.data.specialties || [];
    return `
      <div class="page-head">
        <div><h1>التخصصات</h1><p>${items.length} تخصص طبي</p></div>
        <button class="btn btn--primary" id="addSpecBtn">+ إضافة تخصص</button>
      </div>
      <div class="cards-grid cards-grid--3">
        ${items
          .map(
            (s, i) => `
          <div class="item-card">
            <div class="item-card__icon">${s.icon}</div>
            <div class="item-card__body">
              <strong>${escapeHtml(s.name)}</strong>
            </div>
            <div class="item-card__actions">
              <button class="btn-icon" data-edit-spec="${i}">✏️</button>
              <button class="btn-icon btn-icon--danger" data-del-spec="${i}">🗑️</button>
            </div>
          </div>`
          )
          .join("")}
      </div>
      ${renderSpecialtyModal()}`;
  }

  function renderSpecialtyModal() {
    if (state.editingSpecialty === null) return "";
    const s = state.editingSpecialty;
    const isNew = s.index == null;
    return `
      <div class="modal is-open">
        <div class="modal__backdrop" data-close-modal></div>
        <div class="modal__dialog">
          <div class="modal__head"><h2>${isNew ? "تخصص جديد" : "تعديل تخصص"}</h2><button class="btn-icon" data-close-modal>✕</button></div>
          <form id="specForm" class="form-grid">
            <label class="field"><span>الاسم</span><input class="input" name="name" value="${escapeHtml(s.name || "")}" required></label>
            <label class="field"><span>الأيقونة (Emoji)</span><input class="input" name="icon" value="${escapeHtml(s.icon || "🩺")}"></label>
          </form>
          <div class="modal__foot">
            <button class="btn btn--ghost" data-close-modal>إلغاء</button>
            <button class="btn btn--primary" id="saveSpecBtn">حفظ</button>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Governorates ---------- */
  function renderGovernorates() {
    const govs = state.data.governorates?.governorates || {};
    const names = Object.keys(govs);
    const selected = state.selectedGovernorate || names[0] || null;
    const areas = selected ? govs[selected] || [] : [];

    return `
      <div class="page-head">
        <div><h1>المحافظات والمناطق</h1><p>${names.length} محافظة</p></div>
        <button class="btn btn--primary" id="addGovBtn">+ محافظة</button>
      </div>
      <div class="split-layout">
        <div class="panel">
          <h3>المحافظات</h3>
          <div class="list-nav" id="govList">
            ${names
              .map(
                (g) => `
              <button class="list-nav__item${g === selected ? " is-active" : ""}" data-gov="${escapeHtml(g)}">
                ${escapeHtml(g)} <span>${govs[g].length}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>
        <div class="panel">
          <div class="panel__head">
            <h3>مناطق: ${escapeHtml(selected || "—")}</h3>
            <button class="btn btn--ghost btn--sm" id="addAreaBtn" ${selected ? "" : "disabled"}>+ منطقة</button>
          </div>
          <div class="tags-editor" id="areasEditor">
            ${areas
              .map(
                (a, i) => `
              <div class="tag-item">
                <span>${escapeHtml(a)}</span>
                <button class="btn-icon btn-icon--danger" data-del-area="${i}">✕</button>
              </div>`
              )
              .join("")}
          </div>
          ${selected ? `<button class="btn btn--danger btn--sm" id="delGovBtn">حذف المحافظة</button>` : ""}
        </div>
      </div>`;
  }

  /* ---------- Site Content ---------- */
  function renderContent() {
    const c = state.data.siteConfig || {};
    const hero = c.hero || {};
    const branding = c.branding || {};
    const meta = c.meta || {};
    const navbar = c.navbar || {};
    const footer = c.footer || {};

    return `
      <div class="page-head"><div><h1>محتوى الموقع</h1><p>النصوص والروابط والصفحات</p></div></div>
      <div class="panel-stack">
        <div class="panel">
          <h3>الهوية والصفحة الرئيسية</h3>
          <div class="form-grid" id="contentForm">
            <label class="field"><span>اسم المنصة</span><input class="input" data-path="branding.name" value="${escapeHtml(branding.name)}"></label>
            <label class="field"><span>الشعار (مسار)</span><input class="input" data-path="branding.logo" value="${escapeHtml(branding.logo)}"></label>
            <label class="field"><span>صورة Hero</span><input class="input" data-path="branding.heroImage" value="${escapeHtml(branding.heroImage)}"></label>
            <label class="field"><span>الشعار الفرعي</span><input class="input" data-path="branding.tagline" value="${escapeHtml(branding.tagline)}"></label>
            <label class="field"><span>Hero — سطر علوي</span><input class="input" data-path="hero.eyebrow" value="${escapeHtml(hero.eyebrow)}"></label>
            <label class="field"><span>Hero — السطر الأول</span><input class="input" data-path="hero.titleLine1" value="${escapeHtml(hero.titleLine1)}"></label>
            <label class="field"><span>Hero — السطر الثاني</span><input class="input" data-path="hero.titleLine2" value="${escapeHtml(hero.titleLine2)}"></label>
            <label class="field"><span>Hero — كلمة مميزة</span><input class="input" data-path="hero.titleAccent" value="${escapeHtml(hero.titleAccent)}"></label>
            <label class="field field--full"><span>Hero — الوصف</span><textarea class="input textarea" data-path="hero.subtitle" rows="3">${escapeHtml(hero.subtitle)}</textarea></label>
          </div>
        </div>
        <div class="panel">
          <h3>عناوين الصفحات (Meta)</h3>
          <div class="form-grid">
            <label class="field"><span>الرئيسية</span><input class="input" data-path="meta.siteTitle" value="${escapeHtml(meta.siteTitle)}"></label>
            <label class="field"><span>نتائج البحث</span><input class="input" data-path="meta.searchTitle" value="${escapeHtml(meta.searchTitle)}"></label>
            <label class="field"><span>ملف الطبيب</span><input class="input" data-path="meta.profileTitle" value="${escapeHtml(meta.profileTitle)}"></label>
          </div>
        </div>
        <div class="panel">
          <h3>شريط التنقل</h3>
          <div class="form-grid">
            <label class="field"><span>نص تسجيل الدخول</span><input class="input" data-path="navbar.loginLabel" value="${escapeHtml(navbar.loginLabel)}"></label>
            <label class="field"><span>رابط تسجيل الدخول</span><input class="input" data-path="navbar.loginHref" value="${escapeHtml(navbar.loginHref)}"></label>
            <label class="field"><span>نص حمل التطبيق</span><input class="input" data-path="navbar.appDownloadLabel" value="${escapeHtml(navbar.appDownloadLabel)}"></label>
            <label class="field"><span>رابط التطبيق</span><input class="input" data-path="navbar.appDownloadHref" value="${escapeHtml(navbar.appDownloadHref)}"></label>
          </div>
          <div id="navLinksEditor" class="links-editor"></div>
          <button class="btn btn--ghost btn--sm" id="addNavLinkBtn">+ رابط</button>
        </div>
        <div class="panel">
          <h3>التذييل (Footer)</h3>
          <div class="form-grid">
            <label class="field field--full"><span>حقوق النشر</span><input class="input" data-path="footer.copyright" value="${escapeHtml(footer.copyright)}"></label>
          </div>
        </div>
        <div class="panel">
          <h3>صفحات «قريباً»</h3>
          <div id="stubPagesEditor" class="panel-stack"></div>
        </div>
      </div>`;
  }

  /* ---------- Design ---------- */
  function renderDesign() {
    const theme = state.data.siteConfig?.theme || {};
    const themeFields = [
      ["ink900", "لون النص الداكن"],
      ["ink700", "اللون الأساسي"],
      ["accentTeal", "لون التمييز"],
      ["lilac300", "بنفسجي فاتح"],
      ["lilac100", "خلفية بنفسجية"],
      ["paper", "خلفية الصفحة"],
      ["textMuted", "نص ثانوي"],
    ];

    return `
      <div class="page-head"><div><h1>التصميم والألوان</h1><p>تخصيص ألوان وخطوط الموقع</p></div></div>
      <div class="split-layout">
        <div class="panel">
          <h3>الألوان</h3>
          <div class="form-grid" id="themeForm">
            ${themeFields
              .map(
                ([key, label]) => `
              <label class="field field--color">
                <span>${label}</span>
                <input type="color" data-theme="${key}" value="${toColorInput(theme[key])}">
                <input class="input input--sm" data-theme-text="${key}" value="${escapeHtml(theme[key] || "")}">
              </label>`
              )
              .join("")}
            <label class="field"><span>ارتفاع الشريط العلوي</span><input class="input" data-path="theme.navHeight" value="${escapeHtml(theme.navHeight || "80px")}"></label>
            <label class="field"><span>خط العناوين</span><input class="input" data-path="theme.fontDisplay" value="${escapeHtml(theme.fontDisplay || "")}"></label>
            <label class="field"><span>خط النص</span><input class="input" data-path="theme.fontBody" value="${escapeHtml(theme.fontBody || "")}"></label>
          </div>
        </div>
        <div class="panel preview-panel">
          <h3>معاينة</h3>
          <div id="themePreview" class="theme-preview"></div>
        </div>
      </div>`;
  }

  function toColorInput(val) {
    if (!val || val.startsWith("rgba")) return "#102A4C";
    if (val.startsWith("#") && val.length >= 7) return val.slice(0, 7);
    return "#102A4C";
  }

  function updateThemePreview() {
    const el = $("#themePreview");
    if (!el) return;
    const t = state.data.siteConfig.theme;
    el.style.setProperty("--pv-ink", t.ink700);
    el.style.setProperty("--pv-accent", t.accentTeal);
    el.style.setProperty("--pv-paper", t.paper);
    el.innerHTML = `
      <div class="pv-navbar">Doctory</div>
      <div class="pv-hero">
        <small>${escapeHtml(state.data.siteConfig.hero?.eyebrow)}</small>
        <h2>${escapeHtml(state.data.siteConfig.hero?.titleLine1)}</h2>
        <p>${escapeHtml(state.data.siteConfig.hero?.subtitle?.slice(0, 80))}...</p>
        <button class="pv-btn">بحث</button>
      </div>`;
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    const s = GitHubAPI.getSession();
    return `
      <div class="page-head"><div><h1>GitHub والإعدادات</h1><p>إدارة الاتصال بالمستودع</p></div></div>
      <div class="panel-stack">
        <div class="panel">
          <h3>الاتصال الحالي</h3>
          <dl class="info-dl">
            <dt>المستخدم</dt><dd>${escapeHtml(s?.username)}</dd>
            <dt>المستودع</dt><dd>${escapeHtml(s?.owner)}/${escapeHtml(s?.repo)}</dd>
            <dt>الفرع</dt><dd>${escapeHtml(s?.branch)}</dd>
            <dt>ملفات JSON</dt><dd>${Object.values(GitHubAPI.DATA_FILES).join("<br>")}</dd>
          </dl>
        </div>
        <div class="panel">
          <h3>إجراءات</h3>
          <div class="quick-actions">
            <button class="btn btn--primary" id="initRepoBtn">إعادة تهيئة JSON من الافتراضي</button>
            <button class="btn btn--ghost" id="reloadDataBtn">إعادة تحميل من GitHub</button>
            <button class="btn btn--danger" id="logoutBtn">تسجيل الخروج</button>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Event binding ---------- */
  function bindSectionEvents() {
    document.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.section = btn.dataset.go;
        renderNav();
        renderSection();
      });
    });

    // Dashboard & settings
    $("#reloadDataBtn")?.addEventListener("click", bootstrapData);
    $("#initRepoBtn")?.addEventListener("click", () => {
      if (confirm("سيتم استبدال ملفات JSON على GitHub بالبيانات الافتراضية. متابعة؟")) initializeRepoData();
    });
    $("#logoutBtn")?.addEventListener("click", logout);

    // Doctors
    $("#addDoctorBtn")?.addEventListener("click", () => {
      state.editingDoctor = {};
      renderSection();
    });
    $("#doctorSearch")?.addEventListener("input", (e) => {
      state.searchDoctor = e.target.value;
      renderSection();
    });
    document.querySelectorAll("[data-edit-doctor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.editDoctor);
        state.editingDoctor = structuredClone(state.data.doctors.find((d) => d.id === id));
        renderSection();
      });
    });
    document.querySelectorAll("[data-del-doctor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.delDoctor);
        if (!confirm("حذف هذا الطبيب؟")) return;
        state.data.doctors = state.data.doctors.filter((d) => d.id !== id);
        setDirty();
        renderSection();
        toast("تم الحذف — احفظ للنشر", "info");
      });
    });
    $("#saveDoctorBtn")?.addEventListener("click", saveDoctorForm);
    $("#docGovSelect")?.addEventListener("change", (e) => {
      const areas = state.data.governorates.governorates[e.target.value] || [];
      $("#docAreaSelect").innerHTML = areas.map((a) => `<option>${escapeHtml(a)}</option>`).join("");
    });
    bindModalClose();

    // Specialties
    $("#addSpecBtn")?.addEventListener("click", () => {
      state.editingSpecialty = { name: "", icon: "🩺" };
      renderSection();
    });
    document.querySelectorAll("[data-edit-spec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.editSpec);
        state.editingSpecialty = { ...state.data.specialties[i], index: i };
        renderSection();
      });
    });
    document.querySelectorAll("[data-del-spec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.delSpec);
        if (!confirm("حذف التخصص؟")) return;
        state.data.specialties.splice(i, 1);
        setDirty();
        renderSection();
      });
    });
    $("#saveSpecBtn")?.addEventListener("click", saveSpecForm);

    // Governorates
    document.querySelectorAll("[data-gov]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedGovernorate = btn.dataset.gov;
        renderSection();
      });
    });
    $("#addGovBtn")?.addEventListener("click", () => {
      const name = prompt("اسم المحافظة الجديدة:");
      if (!name?.trim()) return;
      state.data.governorates.governorates[name.trim()] = [];
      state.selectedGovernorate = name.trim();
      setDirty();
      renderSection();
    });
    $("#addAreaBtn")?.addEventListener("click", () => {
      const area = prompt("اسم المنطقة:");
      if (!area?.trim() || !state.selectedGovernorate) return;
      state.data.governorates.governorates[state.selectedGovernorate].push(area.trim());
      setDirty();
      renderSection();
    });
    document.querySelectorAll("[data-del-area]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.delArea);
        state.data.governorates.governorates[state.selectedGovernorate].splice(i, 1);
        setDirty();
        renderSection();
      });
    });
    $("#delGovBtn")?.addEventListener("click", () => {
      if (!confirm(`حذف محافظة ${state.selectedGovernorate}؟`)) return;
      delete state.data.governorates.governorates[state.selectedGovernorate];
      state.selectedGovernorate = Object.keys(state.data.governorates.governorates)[0] || null;
      setDirty();
      renderSection();
    });

    // Content form
    document.querySelectorAll("[data-path]").forEach((input) => {
      input.addEventListener("input", () => {
        setNestedValue(state.data.siteConfig, input.dataset.path, input.value);
        setDirty();
        if (state.section === "design") updateThemePreview();
      });
    });
    renderNavLinksEditor();
    renderStubPagesEditor();
    $("#addNavLinkBtn")?.addEventListener("click", () => {
      state.data.siteConfig.navbar.links.push({ label: "رابط جديد", href: "#", visible: true });
      setDirty();
      renderSection();
    });

    // Theme
    document.querySelectorAll("[data-theme]").forEach((input) => {
      input.addEventListener("input", () => {
        state.data.siteConfig.theme[input.dataset.theme] = input.value;
        $(`[data-theme-text="${input.dataset.theme}"]`).value = input.value;
        setDirty();
        updateThemePreview();
      });
    });
    document.querySelectorAll("[data-theme-text]").forEach((input) => {
      input.addEventListener("input", () => {
        state.data.siteConfig.theme[input.dataset.themeText] = input.value;
        setDirty();
        updateThemePreview();
      });
    });
    if (state.section === "design") updateThemePreview();
  }

  function renderStubPagesEditor() {
    const wrap = $("#stubPagesEditor");
    if (!wrap) return;
    const pages = state.data.siteConfig?.stubPages || {};
    wrap.innerHTML = Object.entries(pages)
      .map(
        ([slug, p]) => `
      <div class="panel" style="box-shadow:none;border-style:dashed">
        <h3>${escapeHtml(slug)}</h3>
        <div class="form-grid">
          <label class="field"><span>أيقونة</span><input class="input" data-stub-icon="${slug}" value="${escapeHtml(p.icon)}"></label>
          <label class="field"><span>العنوان</span><input class="input" data-stub-heading="${slug}" value="${escapeHtml(p.heading)}"></label>
          <label class="field field--full"><span>النص</span><textarea class="input textarea" data-stub-message="${slug}" rows="2">${escapeHtml(p.message)}</textarea></label>
        </div>
      </div>`
      )
      .join("");

    wrap.querySelectorAll("[data-stub-icon]").forEach((el) => {
      el.addEventListener("input", () => {
        pages[el.dataset.stubIcon].icon = el.value;
        setDirty();
      });
    });
    wrap.querySelectorAll("[data-stub-heading]").forEach((el) => {
      el.addEventListener("input", () => {
        pages[el.dataset.stubHeading].heading = el.value;
        setDirty();
      });
    });
    wrap.querySelectorAll("[data-stub-message]").forEach((el) => {
      el.addEventListener("input", () => {
        pages[el.dataset.stubMessage].message = el.value;
        setDirty();
      });
    });
  }

  function renderNavLinksEditor() {
    const wrap = $("#navLinksEditor");
    if (!wrap) return;
    const links = state.data.siteConfig?.navbar?.links || [];
    wrap.innerHTML = links
      .map(
        (l, i) => `
      <div class="link-row">
        <input class="input" data-nav-label="${i}" value="${escapeHtml(l.label)}" placeholder="النص">
        <input class="input" data-nav-href="${i}" value="${escapeHtml(l.href)}" placeholder="الرابط">
        <label class="field field--check"><input type="checkbox" data-nav-visible="${i}" ${l.visible ? "checked" : ""}> ظاهر</label>
        <button class="btn-icon btn-icon--danger" data-nav-del="${i}">✕</button>
      </div>`
      )
      .join("");

    wrap.querySelectorAll("[data-nav-label]").forEach((el) => {
      el.addEventListener("input", () => {
        links[el.dataset.navLabel].label = el.value;
        setDirty();
      });
    });
    wrap.querySelectorAll("[data-nav-href]").forEach((el) => {
      el.addEventListener("input", () => {
        links[el.dataset.navHref].href = el.value;
        setDirty();
      });
    });
    wrap.querySelectorAll("[data-nav-visible]").forEach((el) => {
      el.addEventListener("change", () => {
        links[el.dataset.navVisible].visible = el.checked;
        setDirty();
      });
    });
    wrap.querySelectorAll("[data-nav-del]").forEach((el) => {
      el.addEventListener("click", () => {
        links.splice(Number(el.dataset.navDel), 1);
        setDirty();
        renderSection();
      });
    });
  }

  function setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function bindModalClose() {
    document.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => {
        state.editingDoctor = null;
        state.editingSpecialty = null;
        renderSection();
      });
    });
  }

  function saveDoctorForm() {
    const form = $("#doctorForm");
    const fd = new FormData(form);
    const specSelect = $("#docSpecialtySelect");
    const specOption = specSelect.selectedOptions[0];

    const doc = {
      id: state.editingDoctor.id || nextDoctorId(),
      name: fd.get("name"),
      gender: fd.get("gender"),
      specialty: fd.get("specialty"),
      specialtyIcon: specOption?.dataset.icon || "🩺",
      degree: fd.get("degree"),
      governorate: fd.get("governorate"),
      area: fd.get("area"),
      clinic: fd.get("clinic"),
      experience: Number(fd.get("experience")),
      price: Number(fd.get("price")),
      rating: Number(fd.get("rating")),
      reviews: Number(fd.get("reviews")),
      initials: fd.get("initials"),
      avatarColor: fd.get("avatarColor"),
      featured: !!fd.get("featured"),
      verified: !!fd.get("verified"),
      availableToday: !!fd.get("availableToday"),
      availableTomorrow: !!fd.get("availableTomorrow"),
      hasOnline: !!fd.get("hasOnline"),
      bio: fd.get("bio"),
    };

    const idx = state.data.doctors.findIndex((d) => d.id === doc.id);
    if (idx >= 0) state.data.doctors[idx] = doc;
    else state.data.doctors.push(doc);

    state.editingDoctor = null;
    setDirty();
    renderSection();
    toast("تم حفظ الطبيب محلياً — اضغط «نشر على GitHub»", "info");
  }

  function saveSpecForm() {
    const form = $("#specForm");
    const fd = new FormData(form);
    const item = { name: fd.get("name"), icon: fd.get("icon") || "🩺" };
    if (state.editingSpecialty.index != null) {
      state.data.specialties[state.editingSpecialty.index] = item;
    } else {
      state.data.specialties.push(item);
    }
    state.editingSpecialty = null;
    setDirty();
    renderSection();
  }

  /* ---------- Init ---------- */
  function init() {
    renderLogin();
    renderNav();

    $("#loginForm")?.addEventListener("submit", handleLogin);
    $("#saveAllBtn")?.addEventListener("click", saveAll);
    $("#sidebarToggle")?.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });

    window.addEventListener("beforeunload", (e) => {
      if (state.dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    if (GitHubAPI.getSession()) bootstrapData();
    else renderSection();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
