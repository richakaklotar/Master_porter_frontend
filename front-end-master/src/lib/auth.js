const AUTH_KEY = "mp-auth";
const USERNAME_KEY = "mp-login-username";
const MOCK_USER = { username: "admin", password: "admin123" };

export function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function login(username, password) {
  if (username === MOCK_USER.username && password === MOCK_USER.password) {
    try {
      localStorage.setItem(AUTH_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function getSavedUsername() {
  try {
    return localStorage.getItem(USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

export function saveUsername(username) {
  try {
    localStorage.setItem(USERNAME_KEY, username);
  } catch {
    /* ignore */
  }
}

export function clearSavedUsername() {
  try {
    localStorage.removeItem(USERNAME_KEY);
  } catch {
    /* ignore */
  }
}