// =========================================================
// Doctory — Search Results Page
// Handles: reading URL params, filtering, sorting, pagination,
// rendering doctor cards, and sidebar filter interactions.
// =========================================================

/* ---------------------------------------------------------
   State
--------------------------------------------------------- */
const CARDS_PER_PAGE = 9;

let state = {
  governorate: "",
  area: "",
  specialty: "",
  doctor: "",
  gender: "",
  minRating: 0,
  priceRange: "0-99999",
  availability: "",
  minExperience: 0,
  sortBy: "rating",
  page: 1,
};

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    readURLParams();
    initSearchDropdowns();
    initSearchSubmit();
    initFilters();
    initSortSelect();
    initMobileFilters();
    initBurgerMenu();
    renderResults();
    renderActiveTags();
  };
  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
});

/* ---------------------------------------------------------
   Read URL Params and populate search bar
--------------------------------------------------------- */
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  state.governorate = params.get("governorate") || "";
  state.area = params.get("area") || "";
  state.sortBy = params.get("sort") || "rating";

  // Strip emoji prefix if coming from specialty dropdown
  const rawSpecialty = params.get("specialty") || "";
  state.specialty = rawSpecialty.replace(/^[\p{Emoji}\s]+/u, "").trim();

  state.doctor = params.get("doctor") || "";

  if (state.governorate) {
    const govInput = document.getElementById("governorate");
    if (govInput) govInput.value = state.governorate;
    loadAreaDropdown(state.governorate);
  }

  if (state.area) {
    const areaInput = document.getElementById("area");
    if (areaInput) areaInput.value = state.area;
  }

  if (state.specialty) {
    const specInput = document.getElementById("specialty");
    if (specInput) {
      const found = MEDICAL_SPECIALTIES.find((s) => s.name === state.specialty);
      specInput.value = found ? `${found.icon} ${found.name}` : state.specialty;
    }
  }

  if (state.doctor) {
    const docInput = document.getElementById("doctor");
    if (docInput) docInput.value = state.doctor;
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect && state.sortBy) sortSelect.value = state.sortBy;
}

function loadAreaDropdown(governorate) {
  const areaInput = document.getElementById("area");
  const areaLabel = document.getElementById("areaLabel");
  if (!areaInput) return;
  currentAreaList = EGYPT_GOVERNORATES[governorate] || [];
  areaInput.disabled = false;
  areaInput.placeholder = `اختر ${getAreaLabel(governorate)}`;
  if (areaLabel) areaLabel.textContent = "المنطقة";
}

/* ---------------------------------------------------------
   Search dropdowns (reused from main.js patterns)
--------------------------------------------------------- */
let currentAreaList = [];

function initSearchDropdowns() {
  setupDropdownField({
    inputId: "governorate",
    wrapId: "governorateInput",
    dropdownId: "governorateDropdown",
    getItems: () => EGYPT_GOVERNORATES_LIST,
    onSelect: (value) => {
      state.governorate = value;
      onGovernorateSelected(value);
    },
  });

  setupDropdownField({
    inputId: "specialty",
    wrapId: "specialtyInput",
    dropdownId: "specialtyDropdown",
    getItems: () => MEDICAL_SPECIALTIES.map((s) => `${s.icon} ${s.name}`),
    onSelect: (value) => {
      state.specialty = value.replace(/^[\p{Emoji}\s]+/u, "").trim();
    },
  });

  setupDropdownField({
    inputId: "area",
    wrapId: "areaInput",
    dropdownId: "areaDropdown",
    getItems: () => currentAreaList,
    onSelect: (value) => {
      state.area = value;
    },
  });
}

function onGovernorateSelected(governorate) {
  const areaInputEl = document.getElementById("area");
  const areaLabel = document.getElementById("areaLabel");
  const areaWrap = document.getElementById("areaInput");
  currentAreaList = EGYPT_GOVERNORATES[governorate] || [];
  areaLabel.textContent = "المنطقة";
  areaInputEl.disabled = false;
  areaInputEl.placeholder = `اختر ${getAreaLabel(governorate)}`;
  areaInputEl.value = "";
  state.area = "";
  areaWrap.classList.remove("is-active");
}

function setupDropdownField({ inputId, wrapId, dropdownId, getItems, onSelect }) {
  const input = document.getElementById(inputId);
  const wrap = document.getElementById(wrapId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !wrap || !dropdown) return;

  const openDropdown = () => {
    if (input.disabled) return;
    closeAllOtherDropdowns(dropdown);
    const items = getItems();
    renderDropdownList(dropdown, items);
    dropdown.classList.add("is-open");
    wrap.classList.add("is-active");
  };

  const closeDropdown = () => {
    dropdown.classList.remove("is-open");
    wrap.classList.remove("is-active");
  };

  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.contains("is-open") ? closeDropdown() : openDropdown();
  });

  dropdown.addEventListener("click", (e) => {
    const item = e.target.closest(".search-dropdown__item");
    if (!item) return;
    const value = item.dataset.value;
    input.value = value;
    closeDropdown();
    onSelect(value);
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
  });
}

function closeAllOtherDropdowns(except) {
  document.querySelectorAll(".search-dropdown.is-open").forEach((el) => {
    if (el !== except) el.classList.remove("is-open");
  });
  document.querySelectorAll(".search-bar__input.is-active").forEach((el) => {
    el.classList.remove("is-active");
  });
}

function renderDropdownList(dropdownEl, items) {
  dropdownEl.innerHTML = "";
  const searchWrap = document.createElement("div");
  searchWrap.className = "search-dropdown__search";
  searchWrap.innerHTML = `<input type="text" placeholder="بحث..." />`;
  dropdownEl.appendChild(searchWrap);

  const listWrap = document.createElement("div");
  dropdownEl.appendChild(listWrap);

  const renderList = (filter) => {
    listWrap.innerHTML = "";
    const filtered = items.filter((item) =>
      item.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      listWrap.innerHTML = `<div class="search-dropdown__empty">لا توجد نتائج</div>`;
      return;
    }

    filtered.forEach((item) => {
      const div = document.createElement("div");
      div.className = "search-dropdown__item";
      div.dataset.value = item;
      div.textContent = item;
      listWrap.appendChild(div);
    });
  };

  renderList("");
  const searchInput = searchWrap.querySelector("input");
  searchInput.addEventListener("input", (e) => renderList(e.target.value));
  searchInput.addEventListener("click", (e) => e.stopPropagation());
}

/* ---------------------------------------------------------
   Search form submission
--------------------------------------------------------- */
function initSearchSubmit() {
  const form = document.getElementById("search");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const govVal = document.getElementById("governorate")?.value.trim() || "";
    const areaVal = document.getElementById("area")?.value.trim() || "";
    const specRaw = document.getElementById("specialty")?.value.trim() || "";
    const docVal = document.getElementById("doctor")?.value.trim() || "";

    state.governorate = govVal;
    state.area = areaVal;
    state.specialty = specRaw.replace(/^[\p{Emoji}\s]+/u, "").trim();
    state.doctor = docVal;
    state.page = 1;

    const params = new URLSearchParams();
    if (govVal) params.set("governorate", govVal);
    if (areaVal) params.set("area", areaVal);
    if (specRaw) params.set("specialty", specRaw.replace(/^[\p{Emoji}\s]+/u, "").trim());
    if (docVal) params.set("doctor", docVal);

    history.replaceState(null, "", `search.html?${params.toString()}`);
    renderResults();
    renderActiveTags();
  });
}

/* ---------------------------------------------------------
   Sidebar Filters
--------------------------------------------------------- */
function initFilters() {
  // Gender chips
  initChipGroup("genderFilter", (value) => {
    state.gender = value;
    state.page = 1;
    renderResults();
    renderActiveTags();
    updateActiveFiltersCount();
  });

  // Rating chips
  initChipGroup("ratingFilter", (value) => {
    state.minRating = parseFloat(value);
    state.page = 1;
    renderResults();
    renderActiveTags();
    updateActiveFiltersCount();
  });

  // Price chips
  initChipGroup("priceFilter", (value) => {
    state.priceRange = value;
    state.page = 1;
    renderResults();
    renderActiveTags();
    updateActiveFiltersCount();
  });

  // Availability chips
  initChipGroup("availabilityFilter", (value) => {
    state.availability = value;
    state.page = 1;
    renderResults();
    renderActiveTags();
    updateActiveFiltersCount();
  });

  // Experience chips
  initChipGroup("experienceFilter", (value) => {
    state.minExperience = parseInt(value);
    state.page = 1;
    renderResults();
    renderActiveTags();
    updateActiveFiltersCount();
  });

  // Reset all
  document.getElementById("resetFilters")?.addEventListener("click", resetAllFilters);
  document.getElementById("clearAllFilters")?.addEventListener("click", resetAllFilters);
}

function initChipGroup(groupId, onChange) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      group.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      onChange(chip.dataset.value);
    });
  });
}

function resetAllFilters() {
  state.gender = "";
  state.minRating = 0;
  state.priceRange = "0-99999";
  state.availability = "";
  state.minExperience = 0;
  state.page = 1;

  // Reset chip UI
  ["genderFilter", "ratingFilter", "priceFilter", "availabilityFilter", "experienceFilter"].forEach((id) => {
    const group = document.getElementById(id);
    if (!group) return;
    group.querySelectorAll(".filter-chip").forEach((c, i) => {
      c.classList.toggle("is-active", i === 0);
    });
  });

  updateActiveFiltersCount();
  renderResults();
  renderActiveTags();
}

function updateActiveFiltersCount() {
  let count = 0;
  if (state.gender) count++;
  if (state.minRating > 0) count++;
  if (state.priceRange !== "0-99999") count++;
  if (state.availability) count++;
  if (state.minExperience > 0) count++;

  const badge = document.getElementById("activeFiltersCount");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "grid";
  } else {
    badge.style.display = "none";
  }
}

/* ---------------------------------------------------------
   Sort
--------------------------------------------------------- */
function initSortSelect() {
  const select = document.getElementById("sortSelect");
  select?.addEventListener("change", () => {
    state.sortBy = select.value;
    state.page = 1;
    renderResults();
  });
}

/* ---------------------------------------------------------
   Mobile Filters
--------------------------------------------------------- */
function initMobileFilters() {
  const btn = document.getElementById("mobileFilterBtn");
  const sidebar = document.getElementById("filtersSidebar");
  const overlay = document.getElementById("filtersOverlay");

  btn?.addEventListener("click", () => {
    sidebar?.classList.add("is-open");
    overlay?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });

  overlay?.addEventListener("click", closeFilters);

  function closeFilters() {
    sidebar?.classList.remove("is-open");
    overlay?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
}

/* ---------------------------------------------------------
   Burger Menu (reuse same pattern)
--------------------------------------------------------- */
function initBurgerMenu() {
  const burger = document.getElementById("burgerBtn");
  const menu = document.getElementById("mobileMenu");
  const specTrigger = document.getElementById("mobileSpecialtiesTrigger");
  const specPanel = document.getElementById("mobileSpecialtiesPanel");

  // Build specialties nav
  const grid = document.getElementById("specialtiesGrid");
  if (grid) {
    MEDICAL_SPECIALTIES.forEach((spec) => {
      const a = document.createElement("a");
      a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
      a.className = "mega-menu__link";
      a.innerHTML = `<span class="icon">${spec.icon}</span><span>${spec.name}</span>`;
      grid.appendChild(a);
    });
  }

  if (specPanel) {
    MEDICAL_SPECIALTIES.forEach((spec) => {
      const a = document.createElement("a");
      a.href = `search.html?specialty=${encodeURIComponent(spec.name)}`;
      a.className = "mega-menu__link";
      a.innerHTML = `<span class="icon">${spec.icon}</span><span>${spec.name}</span>`;
      specPanel.appendChild(a);
    });
  }

  burger?.addEventListener("click", () => {
    const isOpen = menu?.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  specTrigger?.addEventListener("click", () => {
    specPanel?.classList.toggle("is-open");
  });

  // Desktop specialties mega menu
  const trigger = document.getElementById("specialtiesTrigger");
  const menuPanel = document.getElementById("specialtiesPanel");
  const wrap = document.getElementById("specialtiesWrap");

  let closeTimer = null;
  const open = () => {
    clearTimeout(closeTimer);
    wrap?.classList.add("is-open");
    menuPanel?.classList.add("is-open");
    trigger?.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    closeTimer = setTimeout(() => {
      wrap?.classList.remove("is-open");
      menuPanel?.classList.remove("is-open");
      trigger?.setAttribute("aria-expanded", "false");
    }, 150);
  };

  trigger?.addEventListener("mouseenter", open);
  menuPanel?.addEventListener("mouseenter", open);
  trigger?.addEventListener("mouseleave", close);
  menuPanel?.addEventListener("mouseleave", close);
  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    wrap?.classList.contains("is-open") ? close() : open();
  });
  document.addEventListener("click", (e) => {
    if (!wrap?.contains(e.target) && !menuPanel?.contains(e.target)) {
      wrap?.classList.remove("is-open");
      menuPanel?.classList.remove("is-open");
      trigger?.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------------------------------------------------------
   Filter & Sort Logic
--------------------------------------------------------- */
function getFilteredDoctors() {
  let doctors = [...DEMO_DOCTORS];

  // Text filters from URL/search bar
  if (state.governorate) {
    doctors = doctors.filter((d) =>
      d.governorate === state.governorate
    );
  }

  if (state.area) {
    doctors = doctors.filter((d) =>
      d.area === state.area
    );
  }

  if (state.specialty) {
    doctors = doctors.filter((d) =>
      d.specialty.includes(state.specialty) ||
      state.specialty.includes(d.specialty)
    );
  }

  if (state.doctor) {
    const q = state.doctor.toLowerCase();
    doctors = doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
    );
  }

  // Sidebar filters
  if (state.gender) {
    doctors = doctors.filter((d) => d.gender === state.gender);
  }

  if (state.minRating > 0) {
    doctors = doctors.filter((d) => d.rating >= state.minRating);
  }

  if (state.priceRange !== "0-99999") {
    const [min, max] = state.priceRange.split("-").map(Number);
    doctors = doctors.filter((d) => d.price >= min && d.price <= max);
  }

  if (state.availability === "today") {
    doctors = doctors.filter((d) => d.availableToday);
  } else if (state.availability === "tomorrow") {
    doctors = doctors.filter((d) => d.availableTomorrow);
  } else if (state.availability === "online") {
    doctors = doctors.filter((d) => d.hasOnline);
  }

  if (state.minExperience > 0) {
    doctors = doctors.filter((d) => d.experience >= state.minExperience);
  }

  // Sort
  doctors.sort((a, b) => {
    if (state.sortBy === "rating") return b.rating - a.rating;
    if (state.sortBy === "experience") return b.experience - a.experience;
    if (state.sortBy === "price-asc") return a.price - b.price;
    if (state.sortBy === "price-desc") return b.price - a.price;
    if (state.sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  // Featured first
  doctors.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return doctors;
}

/* ---------------------------------------------------------
   Render Results
--------------------------------------------------------- */
function renderResults() {
  const grid = document.getElementById("doctorsGrid");
  const emptyState = document.getElementById("emptyState");
  const titleEl = document.getElementById("resultsTitle");
  const countEl = document.getElementById("resultsCount");
  if (!grid) return;

  const allFiltered = getFilteredDoctors();
  const total = allFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / CARDS_PER_PAGE));
  if (state.page > totalPages) state.page = 1;

  const start = (state.page - 1) * CARDS_PER_PAGE;
  const pageItems = allFiltered.slice(start, start + CARDS_PER_PAGE);

  // Build title from search params
  const titleParts = [];
  if (state.specialty) titleParts.push(state.specialty);
  if (state.governorate) titleParts.push(state.governorate);
  if (state.area) titleParts.push(state.area);

  titleEl.textContent = titleParts.length > 0
    ? `أطباء ${titleParts.join(" — ")}`
    : "نتائج البحث";

  countEl.innerHTML = total > 0
    ? `تم العثور على <span>${total}</span> طبيب`
    : "لا توجد نتائج";

  grid.innerHTML = "";

  if (total === 0) {
    emptyState.style.display = "block";
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  emptyState.style.display = "none";
  pageItems.forEach((doc) => grid.appendChild(buildDoctorCard(doc)));
  renderPagination(total, totalPages);
}

/* ---------------------------------------------------------
   Build Doctor Card
--------------------------------------------------------- */
function buildDoctorCard(doc) {
  const card = document.createElement("div");
  card.className = `doctor-card${doc.featured ? " doctor-card--featured" : ""}`;

  const starsHTML = buildStars(doc.rating);

  const pills = [];
  pills.push(`
    <span class="doctor-card__pill doctor-card__pill--location">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity=".3"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/></svg>
      ${doc.area}، ${doc.governorate}
    </span>
  `);

  pills.push(`
    <span class="doctor-card__pill doctor-card__pill--exp">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/></svg>
      ${doc.experience} سنة خبرة
    </span>
  `);

  if (doc.hasOnline) {
    pills.push(`
      <span class="doctor-card__pill doctor-card__pill--online">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2"/></svg>
        أونلاين
      </span>
    `);
  }

  if (doc.availableToday) {
    pills.push(`
      <span class="doctor-card__pill doctor-card__pill--today">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.049-.12-2.07-.336-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        متاح اليوم
      </span>
    `);
  }

  card.innerHTML = `
    ${doc.featured ? `<div class="doctor-card__featured-badge">⭐ مميز</div>` : ""}
    <div class="doctor-card__top">
      <div class="doctor-card__avatar-wrap">
        <div class="doctor-card__avatar-placeholder" style="background: linear-gradient(135deg, ${doc.avatarColor}22, ${doc.avatarColor}44);">
          <span style="color:${doc.avatarColor}">${doc.initials}</span>
        </div>
        ${doc.verified ? `<span class="doctor-card__badge doctor-card__badge--verified">✓ موثق</span>` : ""}
      </div>
      <div class="doctor-card__info">
        <div class="doctor-card__name">${doc.name}</div>
        <div class="doctor-card__specialty">${doc.specialtyIcon} ${doc.specialty}</div>
        <div class="doctor-card__degree">${doc.degree}</div>
      </div>
    </div>

    <div class="doctor-card__rating">
      <div class="doctor-card__stars">${starsHTML}</div>
      <span class="doctor-card__rating-value">${doc.rating.toFixed(1)}</span>
      <span class="doctor-card__reviews">(${doc.reviews} تقييم)</span>
    </div>

    <div class="doctor-card__meta">
      ${pills.join("")}
    </div>

    <div class="doctor-card__divider"></div>

    <div class="doctor-card__footer">
      <div class="doctor-card__price-wrap">
        <span class="doctor-card__price-label">سعر الكشف</span>
        <span class="doctor-card__price">${doc.price} <span>جنيه</span></span>
      </div>
      <div class="doctor-card__actions">
        <button class="btn--profile" title="عرض الملف الشخصي" onclick="event.stopPropagation(); window.location.href='doctor-profile.html?id=${doc.id}'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.5c-3.6 0-9 1.8-9 5.4V21h18v-1.1c0-3.6-5.4-5.4-9-5.4Z" fill="currentColor"/></svg>
        </button>
        <button class="btn--book" onclick="event.stopPropagation(); alert('جارٍ تحويلك لصفحة الحجز (تجريبي)')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          احجز موعد
        </button>
      </div>
    </div>
  `;

  // جعل البطاقة بأكملها قابلة للنقر للانتقال لصفحة الطبيب
  card.dataset.doctorId = doc.id;
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    if (e.target.closest(".btn--book") || e.target.closest(".btn--profile")) return;
    window.location.href = `doctor-profile.html?id=${doc.id}`;
  });

  return card;
}

function buildStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    html += `<svg class="star ${filled ? "" : "star--empty"}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>`;
  }
  return html;
}

/* ---------------------------------------------------------
   Pagination
--------------------------------------------------------- */
function renderPagination(total, totalPages) {
  const container = document.getElementById("pagination");
  if (!container) return;
  container.innerHTML = "";
  if (totalPages <= 1) return;

  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn page-btn--nav";
  nextBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> التالي`;
  nextBtn.disabled = state.page >= totalPages;
  nextBtn.addEventListener("click", () => {
    state.page++;
    renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn page-btn--nav";
  prevBtn.innerHTML = `السابق <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  prevBtn.disabled = state.page <= 1;
  prevBtn.addEventListener("click", () => {
    state.page--;
    renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - state.page) > 1) {
      if (i === 3 || i === totalPages - 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "page-ellipsis";
        ellipsis.textContent = "…";
        container.appendChild(ellipsis);
      }
      continue;
    }
    const btn = document.createElement("button");
    btn.className = `page-btn${state.page === i ? " is-active" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      state.page = i;
      renderResults();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    container.appendChild(btn);
  }

  container.appendChild(nextBtn);
}

/* ---------------------------------------------------------
   Active Tags
--------------------------------------------------------- */
function renderActiveTags() {
  const container = document.getElementById("activeTags");
  if (!container) return;
  container.innerHTML = "";

  const tags = [];

  if (state.governorate) {
    tags.push({ label: `📍 ${state.governorate}`, remove: () => {
      state.governorate = "";
      state.area = "";
      currentAreaList = [];
      const govEl = document.getElementById("governorate");
      const areaEl = document.getElementById("area");
      if (govEl) govEl.value = "";
      if (areaEl) {
        areaEl.value = "";
        areaEl.disabled = true;
        areaEl.placeholder = "اختر المحافظة أولاً";
      }
    } });
  }
  if (state.area) {
    tags.push({ label: `🏘️ ${state.area}`, remove: () => { state.area = ""; const el = document.getElementById("area"); if (el) el.value = ""; } });
  }
  if (state.specialty) {
    tags.push({ label: `🩺 ${state.specialty}`, remove: () => { state.specialty = ""; const el = document.getElementById("specialty"); if (el) el.value = ""; } });
  }
  if (state.doctor) {
    tags.push({ label: `👤 ${state.doctor}`, remove: () => { state.doctor = ""; const el = document.getElementById("doctor"); if (el) el.value = ""; } });
  }
  if (state.gender) {
    tags.push({ label: state.gender === "male" ? "دكتور" : "دكتورة", remove: () => { state.gender = ""; resetChipGroup("genderFilter"); } });
  }
  if (state.minRating > 0) {
    tags.push({ label: `⭐ ${state.minRating}+`, remove: () => { state.minRating = 0; resetChipGroup("ratingFilter"); } });
  }
  if (state.priceRange !== "0-99999") {
    const [min, max] = state.priceRange.split("-");
    tags.push({ label: `💰 ${min}–${max === "99999" ? "∞" : max} جنيه`, remove: () => { state.priceRange = "0-99999"; resetChipGroup("priceFilter"); } });
  }
  if (state.availability) {
    const avMap = { today: "متاح اليوم", tomorrow: "متاح غدًا", online: "أونلاين" };
    tags.push({ label: avMap[state.availability], remove: () => { state.availability = ""; resetChipGroup("availabilityFilter"); } });
  }
  if (state.minExperience > 0) {
    tags.push({ label: `خبرة +${state.minExperience} سنوات`, remove: () => { state.minExperience = 0; resetChipGroup("experienceFilter"); } });
  }

  tags.forEach(({ label, remove }) => {
    const tag = document.createElement("div");
    tag.className = "active-tag";
    tag.innerHTML = `
      <span>${label}</span>
      <button class="active-tag__remove" aria-label="إزالة">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </button>
    `;
    tag.querySelector(".active-tag__remove").addEventListener("click", () => {
      remove();
      state.page = 1;
      renderResults();
      renderActiveTags();
    });
    container.appendChild(tag);
  });
}

function resetChipGroup(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll(".filter-chip").forEach((c, i) => {
    c.classList.toggle("is-active", i === 0);
  });
}