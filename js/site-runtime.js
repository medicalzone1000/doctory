// =========================================================
// Doctory — Apply site-config.json to the live page
// =========================================================

(function () {
  function applyTheme(theme) {
    if (!theme) return;
    const map = {
      ink900: "--ink-900",
      ink700: "--ink-700",
      accentTeal: "--accent-teal",
      lilac300: "--lilac-300",
      lilac100: "--lilac-100",
      paper: "--paper",
      white: "--white",
      line: "--line",
      textMuted: "--text-muted",
      fontDisplay: "--font-display",
      fontBody: "--font-body",
      radiusLg: "--radius-lg",
      radiusMd: "--radius-md",
      navHeight: "--nav-h",
    };

    let css = ":root{";
    Object.entries(map).forEach(([key, varName]) => {
      if (theme[key] != null) css += `${varName}:${theme[key]};`;
    });
    css += "}";

    let el = document.getElementById("doctory-theme");
    if (!el) {
      el = document.createElement("style");
      el.id = "doctory-theme";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  function setText(sel, value) {
    const el = document.querySelector(sel);
    if (el && value != null) el.textContent = value;
  }

  function setAttr(sel, attr, value) {
    const el = document.querySelector(sel);
    if (el && value != null) el.setAttribute(attr, value);
  }

  function applySiteConfig(config) {
    if (!config) return;

    const { branding, hero, meta, navbar } = config;

    if (branding) {
      document.querySelectorAll(".brand__name").forEach((el) => {
        el.textContent = branding.name || el.textContent;
      });
      document.querySelectorAll(".brand__logo").forEach((el) => {
        if (branding.logo) el.src = branding.logo;
        if (branding.name) el.alt = branding.name;
      });
      document.querySelectorAll(".footer__tagline").forEach((el) => {
        if (branding.tagline) el.textContent = branding.tagline;
      });
    }

    if (hero) {
      setText(".hero__eyebrow", hero.eyebrow);
      setText(".hero__subtitle", hero.subtitle);
      const titleEl = document.querySelector(".hero__title");
      if (titleEl && hero.titleLine1) {
        titleEl.innerHTML = `${hero.titleLine1}<br><span class="hero__title-accent">${hero.titleLine2 || ""}</span> <span>${hero.titleAccent || ""}</span>`;
      }
      const heroImg = document.querySelector(".hero__doctor-img");
      if (heroImg && branding?.heroImage) {
        heroImg.src = branding.heroImage;
      }
    }

    if (meta) {
      const path = location.pathname.split("/").pop() || "index.html";
      if (path === "index.html" && meta.siteTitle) document.title = meta.siteTitle;
      if (path === "search.html" && meta.searchTitle) document.title = meta.searchTitle;
      if (path === "doctor-profile.html" && meta.profileTitle) document.title = meta.profileTitle;
    }

    applyTheme(config.theme);

    if (navbar?.appDownloadLabel) {
      document.querySelectorAll(".btn--app-download").forEach((btn) => {
        const svg = btn.querySelector("svg");
        btn.textContent = "";
        if (svg) btn.appendChild(svg);
        btn.append(" " + navbar.appDownloadLabel);
        if (navbar.appDownloadHref) btn.href = navbar.appDownloadHref;
      });
    }
  }

  document.addEventListener("doctory:ready", () => {
    applySiteConfig(window.SITE_CONFIG);
  });

  if (window.DOCTORY_DATA_READY && window.SITE_CONFIG) {
    applySiteConfig(window.SITE_CONFIG);
  }
})();
