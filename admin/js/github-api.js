// =========================================================
// Doctory Admin — GitHub Contents API
// Token is stored in sessionStorage only (never in repo files)
// =========================================================

const GitHubAPI = (() => {
  const STORAGE_KEY = "doctory_admin_session";
  const API = "https://api.github.com";

  const DATA_FILES = {
    governorates: "data/governorates.json",
    specialties: "data/specialties.json",
    doctors: "data/doctors.json",
    siteConfig: "data/site-config.json",
  };

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function encodeUtf8Base64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function decodeUtf8Base64(str) {
    return decodeURIComponent(escape(atob(str.replace(/\n/g, ""))));
  }

  async function request(path, options = {}) {
    const session = getSession();
    if (!session?.token) throw new Error("لم يتم تسجيل الدخول");

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      clearSession();
      throw new Error("التوكن غير صالح أو منتهي الصلاحية");
    }

    if (res.status === 404) {
      return null;
    }

    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try {
        const j = JSON.parse(text);
        msg = j.message || text;
      } catch (_) {}
      throw new Error(msg);
    }

    return text ? JSON.parse(text) : null;
  }

  async function validateAndConnect({ token, owner, repo, branch }) {
    const trimmed = {
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      branch: (branch || "main").trim(),
    };

    const user = await fetch(`${API}/user`, {
      headers: {
        Authorization: `Bearer ${trimmed.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }).then(async (r) => {
      if (!r.ok) throw new Error("فشل التحقق من التوكن");
      return r.json();
    });

    const repoRes = await fetch(`${API}/repos/${trimmed.owner}/${trimmed.repo}`, {
      headers: {
        Authorization: `Bearer ${trimmed.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!repoRes.ok) {
      throw new Error("المستودع غير موجود أو لا تملك صلاحية الوصول");
    }

    saveSession({ ...trimmed, username: user.login });
    return { ...trimmed, username: user.login };
  }

  async function getFile(path) {
    const session = getSession();
    const data = await request(
      `/repos/${session.owner}/${session.repo}/contents/${path}?ref=${encodeURIComponent(session.branch)}`
    );
    if (!data) return null;
    return {
      path,
      sha: data.sha,
      content: decodeUtf8Base64(data.content),
    };
  }

  async function putFile(path, content, message, sha) {
    const session = getSession();
    const body = {
      message,
      content: encodeUtf8Base64(content),
      branch: session.branch,
    };
    if (sha) body.sha = sha;

    const data = await request(`/repos/${session.owner}/${session.repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return data.content.sha;
  }

  async function loadAllData() {
    const shas = {};
    const result = {};

    for (const [key, path] of Object.entries(DATA_FILES)) {
      const file = await getFile(path);
      if (file) {
        shas[path] = file.sha;
        result[key] = JSON.parse(file.content);
      } else {
        result[key] = null;
      }
    }

    return { data: result, shas };
  }

  async function saveJsonFile(key, data, message) {
    const path = DATA_FILES[key];
    const session = getSession();
    const existing = await getFile(path);
    const sha = await putFile(path, JSON.stringify(data, null, 2), message, existing?.sha);
    return sha;
  }

  function getPublicSiteUrl() {
    const session = getSession();
    if (!session) return "../index.html";
    return `https://${session.owner}.github.io/${session.repo}/`;
  }

  return {
    DATA_FILES,
    getSession,
    saveSession,
    clearSession,
    validateAndConnect,
    getFile,
    putFile,
    loadAllData,
    saveJsonFile,
    getPublicSiteUrl,
  };
})();
