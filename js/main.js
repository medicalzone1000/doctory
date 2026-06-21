// =========================================================
// Doctory — Homepage interactions
// Handles: navbar specialties dropdown, search-bar selectors
// (governorate -> area, specialty), and form submission.
// Data comes from data.js
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    initSpecialtiesNavDropdown();
    initSearchDropdowns();
    initSearchSubmit();
    initBurgerMenu();
  };
  if (window.DOCTORY_DATA_READY) boot();
  else document.addEventListener("doctory:ready", boot);
});

/* ---------------------------------------------------------
   1) Navbar "التخصصات" full-width mega-menu (hover + click + a11y)
--------------------------------------------------------- */
function initSpecialtiesNavDropdown() {
  const header = document.querySelector(".navbar");
  const wrap = document.getElementById("specialtiesWrap");
  const trigger = document.getElementById("specialtiesTrigger");
  const menu = document.getElementById("specialtiesPanel");
  const grid = document.getElementById("specialtiesGrid");
  if (!header || !wrap || !trigger || !menu || !grid) return;

  // Build the grid of specialties (links to a filtered listing page)
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

/* ---------------------------------------------------------
   2) Search bar dropdowns: governorate -> area, specialty
--------------------------------------------------------- */
function initSearchDropdowns() {
  setupDropdownField({
    inputId: "governorate",
    wrapId: "governorateInput",
    dropdownId: "governorateDropdown",
    getItems: () => EGYPT_GOVERNORATES_LIST,
    searchable: true,
    onSelect: (value) => {
      onGovernorateSelected(value);
    },
  });

  setupDropdownField({
    inputId: "specialty",
    wrapId: "specialtyInput",
    dropdownId: "specialtyDropdown",
    getItems: () => MEDICAL_SPECIALTIES.map((s) => `${s.icon} ${s.name}`),
    searchable: true,
    onSelect: () => {},
  });

  setupDropdownField({
    inputId: "area",
    wrapId: "areaInput",
    dropdownId: "areaDropdown",
    getItems: () => currentAreaList,
    searchable: true,
    onSelect: () => {},
  });
}

let currentAreaList = [];

function onGovernorateSelected(governorate) {
  const areaInputEl = document.getElementById("area");
  const areaLabel = document.getElementById("areaLabel");
  const areaWrap = document.getElementById("areaInput");

  currentAreaList = EGYPT_GOVERNORATES[governorate] || [];
  const label = getAreaLabel(governorate);

  areaLabel.textContent = "المنطقة";
  areaInputEl.disabled = false;
  areaInputEl.placeholder = `اختر ${label}`;
  areaInputEl.value = "";
  areaWrap.classList.remove("is-active");
}

function setupDropdownField({ inputId, wrapId, dropdownId, getItems, searchable, onSelect }) {
  const input = document.getElementById(inputId);
  const wrap = document.getElementById(wrapId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !wrap || !dropdown) return;

  const openDropdown = () => {
    if (input.disabled) return;
    closeAllOtherDropdowns(dropdown);
    const items = getItems();
    renderDropdownList(dropdown, items, "");
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
    if (!wrap.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
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

function renderDropdownList(dropdownEl, items, filterText) {
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
      const empty = document.createElement("div");
      empty.className = "search-dropdown__empty";
      empty.textContent = "لا توجد نتائج";
      listWrap.appendChild(empty);
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

  renderList(filterText);

  const searchInput = searchWrap.querySelector("input");
  searchInput.addEventListener("input", (e) => renderList(e.target.value));
  searchInput.addEventListener("click", (e) => e.stopPropagation());
}

/* ---------------------------------------------------------
   3) Search form submission -> redirects to search.html
--------------------------------------------------------- */
function initSearchSubmit() {
  const form = document.getElementById("search");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    const governorate = document.getElementById("governorate").value.trim();
    const area = document.getElementById("area").value.trim();
    const specialty = document.getElementById("specialty").value.trim();
    const doctor = document.getElementById("doctor").value.trim();

    if (governorate) params.set("governorate", governorate);
    if (area) params.set("area", area);
    if (specialty) {
      params.set("specialty", specialty.replace(/^[\p{Emoji}\s]+/u, "").trim());
    }
    if (doctor) params.set("doctor", doctor);

    window.location.href = `search.html?${params.toString()}`;
  });
}

/* ---------------------------------------------------------
   4) Mobile burger menu — slide-down nav + specialties sub-list
--------------------------------------------------------- */
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