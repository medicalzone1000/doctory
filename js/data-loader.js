// =========================================================
// Doctory — Load site data from JSON (GitHub Pages source)
// Falls back to js/data.js when JSON is unavailable locally
// =========================================================

(function () {
  const DATA_BASE = "./data/";

  function loadLegacyScript() {
    return new Promise((resolve, reject) => {
      if (window.EGYPT_GOVERNORATES && window.MEDICAL_SPECIALTIES && window.DEMO_DOCTORS) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "js/data.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("تعذّر تحميل js/data.js"));
      document.head.appendChild(script);
    });
  }

  async function fetchJson(path) {
    const res = await fetch(`${DATA_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
  }

  function hydrateFromLegacy() {
    window.EGYPT_GOVERNORATES_LIST = Object.keys(window.EGYPT_GOVERNORATES || {});
    if (typeof window.getAreaLabel !== "function") {
      window.getAreaLabel = function (governorate) {
        const cityGovernorates = ["القاهرة", "الجيزة", "الإسكندرية"];
        return cityGovernorates.includes(governorate) ? "حي" : "مركز";
      };
    }
  }

  function hydrateFromJson(governoratesData, specialties, doctors, siteConfig) {
    window.EGYPT_GOVERNORATES = governoratesData.governorates || {};
    window.EGYPT_GOVERNORATES_LIST = Object.keys(window.EGYPT_GOVERNORATES);
    window.MEDICAL_SPECIALTIES = specialties;
    window.DEMO_DOCTORS = doctors;
    window.SITE_CONFIG = siteConfig;

    const cityGovernorates = governoratesData.cityGovernorates || ["القاهرة", "الجيزة", "الإسكندرية"];
    window.getAreaLabel = function (governorate) {
      return cityGovernorates.includes(governorate) ? "حي" : "مركز";
    };
  }

  async function loadSiteData() {
    try {
      const [governoratesData, specialties, doctors, siteConfig] = await Promise.all([
        fetchJson("governorates.json"),
        fetchJson("specialties.json"),
        fetchJson("doctors.json"),
        fetchJson("site-config.json"),
      ]);
      hydrateFromJson(governoratesData, specialties, doctors, siteConfig);
    } catch (jsonError) {
      console.warn("[Doctory] JSON load failed, using legacy data.js:", jsonError.message);
      await loadLegacyScript();
      hydrateFromLegacy();
      if (!window.SITE_CONFIG) {
        window.SITE_CONFIG = null;
      }
    }

    window.DOCTORY_DATA_READY = true;
    document.dispatchEvent(new CustomEvent("doctory:ready"));
  }

  window.loadSiteData = loadSiteData;
  loadSiteData();
})();
