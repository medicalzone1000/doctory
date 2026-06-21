// Default data source for first-time GitHub initialization
// Loads from the legacy bundled data.js in the parent folder

window.DOCTORY_DEFAULTS = null;

function buildDefaultsFromLegacy() {
  if (!window.EGYPT_GOVERNORATES || !window.MEDICAL_SPECIALTIES || !window.DEMO_DOCTORS) {
    throw new Error("legacy data.js not loaded");
  }

  return {
    governorates: {
      governorates: window.EGYPT_GOVERNORATES,
      cityGovernorates: ["القاهرة", "الجيزة", "الإسكندرية"],
    },
    specialties: window.MEDICAL_SPECIALTIES,
    doctors: window.DEMO_DOCTORS,
    siteConfig: {
      branding: {
        name: "Doctory",
        logo: "assets/logo-placeholder.svg",
        heroImage: "assets/doctor-hero.svg",
        tagline: "دليلك الطبي الموثوق",
      },
      theme: {
        ink900: "#102A4C",
        ink700: "#1B3A6B",
        accentTeal: "#0EA5A4",
        lilac300: "#C7BBF5",
        lilac100: "#EFEAFB",
        paper: "#FBFAFF",
        white: "#FFFFFF",
        line: "rgba(16, 42, 76, 0.10)",
        textMuted: "#5B6478",
        fontDisplay: '"Cairo", system-ui, sans-serif',
        fontBody: '"Tajawal", system-ui, sans-serif',
        radiusLg: "20px",
        radiusMd: "14px",
        navHeight: "80px",
      },
      hero: {
        eyebrow: "دليلك الطبي الموثوق",
        titleLine1: "تحتاج طبيب؟",
        titleAccent: "دليل أطباء",
        titleLine2: "تصفح أكبر",
        subtitle:
          "أفضل الأطباء والأخصائيين والاستشاريين المرخصين لتقديم الجلسات بسهولة وثقة، في مكان واحد.",
      },
      navbar: {
        links: [
          { label: "الرئيسية", href: "index.html", visible: true },
          { label: "الأعلى تقييمًا", href: "top-rated.html", visible: true },
          { label: "العروض", href: "offers.html", visible: true },
          { label: "انضم كطبيب", href: "join-doctor.html", visible: true },
        ],
        loginLabel: "تسجيل دخول",
        loginHref: "login.html",
        appDownloadLabel: "حمل التطبيق",
        appDownloadHref: "#",
      },
      footer: {
        tagline: "دليلك الطبي الموثوق",
        copyright: "© 2026 Doctory. جميع الحقوق محفوظة.",
        links: [
          { label: "عن الموقع", href: "about.html" },
          { label: "اتصل بنا", href: "contact.html" },
          { label: "سياسة الخصوصية", href: "privacy.html" },
        ],
      },
      stubPages: {
        offers: {
          icon: "🎁",
          heading: "العروض قريباً",
          message: "نعمل على إطلاق قسم العروض والخصومات الطبية.",
        },
        "join-doctor": {
          icon: "🩺",
          heading: "بوابة الأطباء قريباً",
          message: "سيتم إطلاق نموذج التسجيل للأطباء قريباً.",
        },
        login: {
          icon: "🔐",
          heading: "تسجيل الدخول قريباً",
          message: "نعمل على بناء نظام تسجيل الدخول.",
        },
        about: {
          icon: "ℹ️",
          heading: "عن Doctory",
          message: "Doctory منصة مصرية للبحث عن الأطباء.",
        },
        contact: {
          icon: "✉️",
          heading: "اتصل بنا",
          message: "نموذج التواصل قيد التطوير.",
        },
        privacy: {
          icon: "🛡️",
          heading: "سياسة الخصوصية",
          message: "سيتم نشر سياسة الخصوصية قبل الإطلاق.",
        },
      },
      meta: {
        siteTitle: "Doctory | منصة البحث عن طبيبك",
        searchTitle: "نتائج البحث | Doctory",
        profileTitle: "الملف الشخصي للطبيب | Doctory",
      },
    },
  };
}

function getDefaults() {
  if (!window.DOCTORY_DEFAULTS) {
    window.DOCTORY_DEFAULTS = buildDefaultsFromLegacy();
  }
  return structuredClone(window.DOCTORY_DEFAULTS);
}
