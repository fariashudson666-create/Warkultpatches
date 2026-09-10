export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt: string;
}

export interface AdminSession {
  username: string;
  loggedInAt: string;
  remember: boolean;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'site_admin_auth_credentials_v1',
  SESSION_LOCAL: 'site_admin_auth_session_v1',
  SESSION_TEMP: 'site_admin_auth_session_temp_v1',
};

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
  updatedAt: new Date().toISOString(),
};

/**
 * Retrieve current saved credentials or defaults
 */
export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!raw) return DEFAULT_CREDENTIALS;
    const parsed = JSON.parse(raw) as AdminCredentials;
    if (!parsed.username || !parsed.password) return DEFAULT_CREDENTIALS;
    return parsed;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

/**
 * Check if the admin is still using the default factory password
 */
export function isDefaultCredentials(): boolean {
  const current = getAdminCredentials();
  return current.username === DEFAULT_CREDENTIALS.username && current.password === DEFAULT_CREDENTIALS.password;
}

/**
 * Validate username and password
 */
export function verifyCredentials(usernameInput: string, passwordInput: string): boolean {
  const creds = getAdminCredentials();
  const trimmedUser = usernameInput.trim().toLowerCase();
  const targetUser = creds.username.trim().toLowerCase();

  return trimmedUser === targetUser && passwordInput === creds.password;
}

/**
 * Update the admin credentials
 */
export function updateAdminCredentials(
  currentPasswordInput: string,
  newUsername: string,
  newPassword: string
): { success: boolean; error?: string } {
  const creds = getAdminCredentials();

  if (currentPasswordInput !== creds.password) {
    return { success: false, error: 'A senha atual informada está incorreta.' };
  }

  const cleanUser = newUsername.trim();
  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: 'O usuário deve ter pelo menos 3 caracteres.' };
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' };
  }

  const updated: AdminCredentials = {
    username: cleanUser,
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updated));
    // Update active session if present
    const session = getStoredSession();
    if (session) {
      createSession(cleanUser, session.remember);
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Erro ao salvar credenciais no navegador.' };
  }
}

/**
 * Reset credentials back to factory defaults (admin / admin123)
 */
export function resetAdminCredentials(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(DEFAULT_CREDENTIALS));
  } catch (err) {
    console.warn('Failed to reset credentials', err);
  }
}

/**
 * Retrieve active session from localStorage or sessionStorage
 */
export function getStoredSession(): AdminSession | null {
  try {
    // Check sessionStorage first (temporary session)
    const temp = sessionStorage.getItem(STORAGE_KEYS.SESSION_TEMP);
    if (temp) {
      return JSON.parse(temp) as AdminSession;
    }

    // Check localStorage (persistent remember-me session)
    const local = localStorage.getItem(STORAGE_KEYS.SESSION_LOCAL);
    if (local) {
      return JSON.parse(local) as AdminSession;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Create a new logged-in session
 */
export function createSession(username: string, remember: boolean): AdminSession {
  const session: AdminSession = {
    username,
    loggedInAt: new Date().toISOString(),
    remember,
  };

  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.SESSION_LOCAL, JSON.stringify(session));
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_TEMP);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_TEMP, JSON.stringify(session));
      localStorage.removeItem(STORAGE_KEYS.SESSION_LOCAL);
    }
  } catch (err) {
    console.warn('Failed to store session in browser storage', err);
  }

  return session;
}

/**
 * Terminate session / logout
 */
export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TEMP);
    localStorage.removeItem(STORAGE_KEYS.SESSION_LOCAL);
  } catch (err) {
    console.warn('Failed to clear session', err);
  }
}
