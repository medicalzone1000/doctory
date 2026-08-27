// =========================================================
// Doctory — Unified Icon System
// Replaces the old multi-colored emoji set with a single,
// consistent line-icon language (one stroke color, inherited
// via `currentColor`, so it always matches the surrounding
// design tokens instead of clashing with them).
// =========================================================

const DoctoryIcons = (() => {
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

  // Icon glyphs — one visual family, ~30 shapes covering every specialty.
  const GLYPHS = {
    stethoscope: `<path ${STROKE} d="M7 3v6a4 4 0 0 0 8 0V3M7 3H5.5M15 3h1.5M11 13v3a5 5 0 0 0 10 0v-1.5"/><circle cx="21" cy="12.5" r="1.6" ${STROKE}/>`,
    heart: `<path ${STROKE} d="M12 20s-7.5-4.6-10-9.4C.4 7 2 3.5 5.6 3c2.3-.3 4.2 1 6.4 3.4C14.2 4 16.1 2.7 18.4 3c3.6.5 5.2 4 3.6 7.6C19.5 15.4 12 20 12 20Z"/>`,
    scalpel: `<path ${STROKE} d="M4 20 15 9m0 0 3.5-3.5a1.5 1.5 0 0 1 2.1 2.1L17 11m-2-2-4 4"/><path ${STROKE} d="M4 20l2-5"/>`,
    bone: `<path ${STROKE} d="M6.5 6.5a2 2 0 1 0-3 2.6l8.4 8.4a2 2 0 1 0 2.6-3L6.5 6.5Z"/><path ${STROKE} d="M17.5 6.5a2 2 0 1 1 3-2.6M6.5 17.5a2 2 0 1 1-3 2.6"/><circle cx="5" cy="5" r="1.6" ${STROKE}/><circle cx="19" cy="19" r="1.6" ${STROKE}/>`,
    pregnancy: `<circle cx="9" cy="6" r="3" ${STROKE}/><path ${STROKE} d="M9 9v2c3.5 0 6.5 3 6.5 6.5V21H4v-3.5C4 14 6.5 11 9 11"/>`,
    baby: `<circle cx="12" cy="9" r="4" ${STROKE}/><path ${STROKE} d="M8.5 8c-.3-1.6.9-3 2.5-3M6 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/><circle cx="10" cy="9" r=".4" fill="currentColor"/><circle cx="14" cy="9" r=".4" fill="currentColor"/>`,
    skin: `<path ${STROKE} d="M12 3c3.5 3.6 6.5 7.3 6.5 10.8A6.5 6.5 0 1 1 5.5 13.8C5.5 10.3 8.5 6.6 12 3Z"/>`,
    eye: `<path ${STROKE} d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6" ${STROKE}/>`,
    ear: `<path ${STROKE} d="M14 3a6 6 0 0 0-6 6c0 2 1 2.8 1 4.5A2.5 2.5 0 0 1 6.5 16 2.5 2.5 0 0 1 4 13.5"/><path ${STROKE} d="M14 3a6 6 0 0 1 6 6c0 4-4 5-4 8.5a3.5 3.5 0 0 1-7 0v-1"/>`,
    tooth: `<path ${STROKE} d="M12 3c2.4 0 3 1.4 4.3 1.4 1.8 0 2.7-1 3-.4.6 1.2.7 5-1 9-1 2.6-1 6-2.8 6-1.4 0-1.5-3.4-2.8-3.4S10.1 19 8.7 19c-1.8 0-1.8-3.4-2.8-6-1.7-4-1.6-7.8-1-9 .3-.6 1.2.4 3 .4C9 4.4 9.6 3 12 3Z"/>`,
    kidney: `<path ${STROKE} d="M9 3C5.5 3 4 6.4 4 10.5S6.5 21 10 21c2 0 2-2 1-3.3-1-1.3-1.4-2-.6-3 .8-1 3 .3 4.3-.8C16 12.8 15.4 11 14 10.4c-1.6-.7-1.6-1.7-.9-3C13.9 5.8 12.5 3 9 3Z"/>`,
    brain: `<path ${STROKE} d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6A3.2 3.2 0 0 0 6 18a3 3 0 0 0 3 3c1.7 0 3-1.3 3-3V7c0-1.7-1.3-3-3-3Z"/><path ${STROKE} d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.6A3.2 3.2 0 0 1 18 18a3 3 0 0 1-3 3c-1.7 0-3-1.3-3-3"/>`,
    mind: `<path ${STROKE} d="M12 3a4 4 0 0 0-4 4c0 1.2.5 1.9 1.2 2.6L7 12.3c-1 1-1 2.6 0 3.5l1.8 1.8c1 1 2.6 1 3.5 0l.3-.3c.7.7 1.4 1.2 2.6 1.2a4 4 0 0 0 4-4c0-1.2-.5-1.9-1.2-2.6l2.2-2.7c1-1 1-2.6 0-3.5l-1.8-1.8c-1-1-2.6-1-3.5 0l-.3.3C15 3.5 14.3 3 13 3Z"/>`,
    lungs: `<path ${STROKE} d="M12 3v9"/><path ${STROKE} d="M12 12c0-2.5-1.6-3.5-3-3.5-2.2 0-3.5 2-3.5 5 0 3.5 1.3 6 3 6 1.6 0 2-1.3 2-2.7V12Z"/><path ${STROKE} d="M12 12c0-2.5 1.6-3.5 3-3.5 2.2 0 3.5 2 3.5 5 0 3.5-1.3 6-3 6-1.6 0-2-1.3-2-2.7V12Z"/>`,
    syringe: `<path ${STROKE} d="m20 4-2.5 2.5M17 8.5 4.5 21H3v-1.5L15.5 7M14 4l6 6"/><path ${STROKE} d="m12 9 3 3M9 12l3 3"/>`,
    liver: `<path ${STROKE} d="M4 10c1-3.5 4.3-6 8.5-6C17.5 4 21 7 21 11c0 5-4.5 9-10 9-4 0-7-2.4-7-6 0-1.8.7-3 1-4Z"/>`,
    ribbon: `<circle cx="12" cy="6.5" r="3.5" ${STROKE}/><path ${STROKE} d="m9.5 9-4 11 4.5-2 2 2.5 2-2.5 4.5 2-4-11"/>`,
    leaf: `<path ${STROKE} d="M20 4C10 4 4 10 4 18c0 .6 0 1.3.1 2 .7.1 1.4.1 2 .1 8 0 14-6 14-16Z"/><path ${STROKE} d="M6 18C11 13 15 9 20 4"/>`,
    sparkle: `<path ${STROKE} d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5"/>`,
    vessel: `<path ${STROKE} d="M4 6c3 0 3 4 6 4s3-4 6-4 3 4 6 4"/><path ${STROKE} d="M4 14c3 0 3 4 6 4s3-4 6-4 3 4 6 4"/>`,
    "blood-drop": `<path ${STROKE} d="M12 3c3.5 4.2 7 8.2 7 12a7 7 0 1 1-14 0c0-3.8 3.5-7.8 7-12Z"/>`,
    allergy: `<circle cx="12" cy="12" r="3" ${STROKE}/><path ${STROKE} d="M12 3v3.2M12 17.8V21M21 12h-3.2M6.2 12H3M18.4 5.6l-2.3 2.3M7.9 16.1l-2.3 2.3M18.4 18.4l-2.3-2.3M7.9 7.9 5.6 5.6"/>`,
    activity: `<path ${STROKE} d="M3 12h4l2-7 4 14 2-7h6"/>`,
    moon: `<path ${STROKE} d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>`,
    radar: `<circle cx="12" cy="12" r="9" ${STROKE}/><circle cx="12" cy="12" r="5" ${STROKE}/><path ${STROKE} d="M12 12 17 7"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>`,
    flask: `<path ${STROKE} d="M9 3h6M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3"/><path ${STROKE} d="M7.5 15h9"/>`,
    home: `<path ${STROKE} d="m4 11 8-7 8 7"/><path ${STROKE} d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>`,
    ambulance: `<path ${STROKE} d="M3 16V8a1 1 0 0 1 1-1h10v9M3 16h1m10 0h4m0 0h2.5a.5.5 0 0 0 .5-.5V12l-2.5-3H14v7"/><path ${STROKE} d="M8 6v4M6 8h4"/><circle cx="7.5" cy="17.5" r="1.8" ${STROKE}/><circle cx="17" cy="17.5" r="1.8" ${STROKE}/>`,
    child: `<circle cx="12" cy="6" r="3" ${STROKE}/><path ${STROKE} d="M7 21v-4.5C7 13.5 9.2 12 12 12s5 1.5 5 4.5V21"/>`,
    hair: `<path ${STROKE} d="M12 3c4 0 7 2.8 7 7 0 3-1.5 4-1.5 6.5S19 21 19 21M12 3c-4 0-7 2.8-7 7 0 3 1.5 4 1.5 6.5S5 21 5 21"/><path ${STROKE} d="M9.5 9c0 3 1 4 1 6.5M14.5 9c0 3-1 4-1 6.5"/>`,
    speech: `<path ${STROKE} d="M4 5h16v10H9l-4 4v-4H4Z"/><path ${STROKE} d="M8 9h8M8 12h5"/>`,
    gift: `<rect x="4" y="9" width="16" height="11" ${STROKE}/><path ${STROKE} d="M4 9h16v3.5H4Z"/><path ${STROKE} d="M12 9v11M12 9c-1-2.5-2.7-4-4.3-4a2 2 0 0 0 0 4M12 9c1-2.5 2.7-4 4.3-4a2 2 0 0 1 0 4"/>`,
    lock: `<rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" ${STROKE}/><path ${STROKE} d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>`,
    info: `<circle cx="12" cy="12" r="9" ${STROKE}/><path ${STROKE} d="M12 11v6"/><circle cx="12" cy="7.7" r=".5" fill="currentColor"/>`,
    mail: `<rect x="3" y="5.5" width="18" height="13" rx="1.5" ${STROKE}/><path ${STROKE} d="m4 7 8 6 8-6"/>`,
    shield: `<path ${STROKE} d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6Z"/><path ${STROKE} d="m9 12 2 2 4-4.2"/>`,

    /* General UI glyphs (badges, tags, empty states) */
    pin: `<path ${STROKE} d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4" ${STROKE}/>`,
    check: `<path ${STROKE} d="M4 12.5 9.5 18 20 6"/>`,
    price: `<circle cx="12" cy="12" r="9" ${STROKE}/><path ${STROKE} d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 .9-3 2.2c0 3 6 1.5 6 4.5 0 1.3-1.3 2.3-3 2.3s-3-1-3-2.4"/>`,
    person: `<circle cx="12" cy="8" r="3.5" ${STROKE}/><path ${STROKE} d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"/>`,
    warning: `<path ${STROKE} d="M12 4 2.5 20h19L12 4Z"/><path ${STROKE} d="M12 10.5v4.2"/><circle cx="12" cy="17.3" r=".5" fill="currentColor"/>`,
    "help-circle": `<circle cx="12" cy="12" r="9" ${STROKE}/><path ${STROKE} d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2 1-1.2 1.9"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>`,
  };

  const DEFAULT_KEY = "stethoscope";

  // Specialty name → icon key. Closely related sub-specialties
  // intentionally share one glyph (e.g. every pediatric sub-specialty
  // reuses its parent organ/field icon) rather than inventing a new
  // shape for every row — one visual family, used with restraint.
  const SPECIALTY_ICON_MAP = {
    "باطنة عامة": "stethoscope",
    "قلب وأوعية دموية": "heart",
    "جراحة عامة": "scalpel",
    "عظام ومفاصل": "bone",
    "نساء وتوليد": "pregnancy",
    "أطفال وحديثي الولادة": "baby",
    "جلدية وتناسلية وتجميل": "skin",
    "عيون": "eye",
    "أنف وأذن وحنجرة": "ear",
    "أسنان": "tooth",
    "مسالك بولية وتناسلية": "kidney",
    "مخ وأعصاب وجراحة المخ والأعصاب": "brain",
    "نفسية وعلاج إدمان": "mind",
    "صدر وأمراض الجهاز التنفسي": "lungs",
    "غدد صماء وسكر": "syringe",
    "كلى وحالات الفشل الكلوي": "kidney",
    "كبد وجهاز هضمي": "liver",
    "روماتيزم ومناعة": "bone",
    "أورام وعلاج كيماوي": "ribbon",
    "تخسيس وتغذية علاجية": "leaf",
    "جراحة تجميل وحروق": "sparkle",
    "جراحة أوعية دموية": "vessel",
    "أمراض دم": "blood-drop",
    "حساسية ومناعة": "allergy",
    "علاج طبيعي وتأهيل": "activity",
    "تخدير ورعاية مركزة": "moon",
    "أشعة تشخيصية وتداخلية": "radar",
    "تحاليل وباثولوجيا إكلينيكية": "flask",
    "طب أسرة": "home",
    "طب الطوارئ": "ambulance",
    "جراحة أطفال": "child",
    "جراحة مسالك بولية للأطفال": "kidney",
    "أمراض الروماتيزم للأطفال": "bone",
    "زراعة الشعر": "hair",
    "علاج طبيعي للأطفال": "activity",
    "طب نفسي للأطفال": "mind",
    "علاج الخصوبة وحقن مجهري": "pregnancy",
    "جراحة المسالك البولية والتناسلية للذكور": "kidney",
    "السمعيات وعلاج النطق": "speech",
    "طب الأسرة والمجتمع": "home",
  };

  function keyFor(nameOrKey) {
    if (!nameOrKey) return DEFAULT_KEY;
    if (GLYPHS[nameOrKey]) return nameOrKey; // already a valid icon key
    return SPECIALTY_ICON_MAP[nameOrKey] || DEFAULT_KEY;
  }

  // Returns a ready-to-use <svg> string sized via CSS (width/height: 1em by default).
  function svg(nameOrKey, { size = "1.15em", className = "" } = {}) {
    const key = keyFor(nameOrKey);
    return `<svg class="doctory-icon${className ? " " + className : ""}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${GLYPHS[key]}</svg>`;
  }

  return { svg, keyFor, SPECIALTY_ICON_MAP, GLYPHS };
})();

if (typeof window !== "undefined") window.DoctoryIcons = DoctoryIcons;
