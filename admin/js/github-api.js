// =========================================================
// Doctory Admin — GitHub Contents API
// Token is stored in sessionStorage only (never in repo files)
// =========================================================

const GitHubAPI = (() => {
  const STORAGE_KEY = "doctory_admin_session";
  const API = "https://api.github.com";

  // Fixed repository owner/repo/branch — not exposed in the login UI.
  const REPO_OWNER = "medicalzone1000";
  const REPO_NAME = "doctory";
  const REPO_BRANCH = "main";

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

  async function validateAndConnect({ token, displayName }) {
    const trimmed = {
      token: (token || "").trim(),
      owner: REPO_OWNER,
      repo: REPO_NAME,
      branch: REPO_BRANCH,
      displayName: (displayName || "").trim(),
    };

    const userRes = await fetch(`${API}/user`, {
      headers: {
        Authorization: `Bearer ${trimmed.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!userRes.ok) {
      throw new Error("بيانات الدخول غير صحيحة");
    }

    const repoRes = await fetch(`${API}/repos/${trimmed.owner}/${trimmed.repo}`, {
      headers: {
        Authorization: `Bearer ${trimmed.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!repoRes.ok) {
      throw new Error("بيانات الدخول غير صحيحة");
    }

    saveSession(trimmed);
    return trimmed;
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

  async function putBinaryFile(path, base64Content, message, sha) {
    const session = getSession();
    const body = {
      message,
      content: base64Content,
      branch: session.branch,
    };
    if (sha) body.sha = sha;

    const data = await request(`/repos/${session.owner}/${session.repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return data;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // result looks like "data:image/png;base64,AAAA..."
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("فشل قراءة الملف"));
      reader.readAsDataURL(file);
    });
  }

  function sanitizeFileName(name) {
    return name
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_");
  }

  async function uploadDoctorImage(doctorId, file) {
    const base64 = await fileToBase64(file);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeBase = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
    const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const path = `assets/doctors/${doctorId}/${unique}-${safeBase}.${ext}`;

    await putBinaryFile(path, base64, `Upload doctor image (${doctorId})`);
    return path;
  }

  async function deleteRepoFile(path, message) {
    const session = getSession();
    const existing = await getFile(path).catch(() => null);
    if (!existing) return;
    await request(`/repos/${session.owner}/${session.repo}/contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify({ message, sha: existing.sha, branch: session.branch }),
    });
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
    putBinaryFile,
    uploadDoctorImage,
    deleteRepoFile,
    loadAllData,
    saveJsonFile,
    getPublicSiteUrl,
  };
})();
