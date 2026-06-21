document.addEventListener("DOMContentLoaded", () => {
  const applyConfig = () => {
    const slug = window.STUB_PAGE_SLUG;
    const config = window.STUB_PAGE_CONFIG || {};
    const fromSite = slug && window.SITE_CONFIG?.stubPages?.[slug];

    if (fromSite) {
      config.title = config.title || slug;
      config.heading = fromSite.heading;
      config.message = fromSite.message;
      if (fromSite.icon) {
        const iconEl = document.getElementById("stubIcon");
        if (iconEl) iconEl.textContent = fromSite.icon;
      }
    }

    if (config.title) document.title = `${config.title} | Doctory`;
    const heading = document.getElementById("stubHeading");
    const message = document.getElementById("stubMessage");
    if (heading && config.heading) heading.textContent = config.heading;
    if (message && config.message) message.textContent = config.message;

    if (window.SITE_CONFIG?.branding?.name) {
      document.querySelectorAll(".brand__name").forEach((el) => {
        el.textContent = window.SITE_CONFIG.branding.name;
      });
    }
  };

  if (window.DOCTORY_DATA_READY) applyConfig();
  else document.addEventListener("doctory:ready", applyConfig);
});
