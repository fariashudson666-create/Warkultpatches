import { Product, EventPost, HeaderBanner, SidebarBanner, SiteSettings } from '../types';

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
  lastSyncAt?: string;
  lastCommitSha?: string;
  lastCommitUrl?: string;
  lastStatus?: 'idle' | 'success' | 'error';
  lastError?: string;
}

export interface SitePayload {
  updatedAt: string;
  version: number;
  siteSettings: SiteSettings;
  products: Product[];
  events: EventPost[];
  headerBanners: HeaderBanner[];
  sidebarBanners: SidebarBanner[];
}

const GITHUB_CONFIG_KEY = 'site_github_sync_config_v1';

export const DEFAULT_GITHUB_CONFIG: GitHubSyncConfig = {
  owner: '',
  repo: '',
  branch: 'main',
  token: '',
  autoSync: false,
  lastStatus: 'idle'
};

export function getGitHubConfig(): GitHubSyncConfig {
  try {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!stored) return { ...DEFAULT_GITHUB_CONFIG };
    return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(stored) };
  } catch (error) {
    console.warn('Erro ao carregar configurações do GitHub', error);
    return { ...DEFAULT_GITHUB_CONFIG };
  }
}

export function saveGitHubConfig(config: GitHubSyncConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Erro ao salvar configurações do GitHub', error);
  }
}

/**
 * Normalizes user inputs for GitHub owner, repo and token.
 * Handles cases where user pastes full URLs like https://github.com/user/repo,
 * leaves .git suffix, prefixes token with 'Bearer', etc.
 */
export function normalizeGitHubInput(ownerInput: string, repoInput: string): { owner: string; repo: string } {
  let owner = (ownerInput || '').trim().replace(/^@/, '');
  let repo = (repoInput || '').trim();

  // If repo has full URL: https://github.com/owner/repo or https://github.com/owner/repo.git
  if (repo.includes('github.com')) {
    const match = repo.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (match) {
      owner = match[1];
      repo = match[2];
    }
  } else if (repo.includes('/')) {
    const parts = repo.split('/').filter(Boolean);
    if (parts.length >= 2) {
      owner = parts[0];
      repo = parts[1];
    }
  }

  // If owner has full URL
  if (owner.includes('github.com')) {
    const match = owner.match(/github\.com\/([^/]+)(?:\/([^/.]+))?/);
    if (match) {
      owner = match[1];
      if (match[2] && (!repo || repo === ownerInput.trim())) {
        repo = match[2];
      }
    }
  }

  // Clean trailing .git or slashes
  repo = repo.replace(/\.git$/, '').replace(/\/$/, '').trim();
  owner = owner.replace(/\/$/, '').trim();

  return { owner, repo };
}

export function normalizeGitHubToken(token: string): string {
  let t = (token || '').trim();
  if (t.toLowerCase().startsWith('bearer ')) {
    t = t.substring(7).trim();
  }
  if (t.toLowerCase().startsWith('token ')) {
    t = t.substring(6).trim();
  }
  return t.replace(/^["']|["']$/g, '');
}

/**
 * UTF-8 safe Base64 encoder for GitHub Contents API
 * Uses TextEncoder and chunked conversion to prevent call stack issues and URI malformed errors
 */
export function utf8ToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return btoa(binary);
  } catch {
    // Fallback for environments without TextEncoder
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  }
}

/**
 * Tests connection and write permissions to the configured GitHub repository
 */
export async function testGitHubConnection(config: GitHubSyncConfig): Promise<{
  success: boolean;
  message: string;
  repoFullName?: string;
  isPrivate?: boolean;
  defaultBranch?: string;
  hasPushPermission?: boolean;
}> {
  const { owner: rawOwner, repo: rawRepo } = normalizeGitHubInput(config.owner, config.repo);
  const token = normalizeGitHubToken(config.token);
  const branch = (config.branch || '').trim() || 'main';

  if (!rawOwner || !rawRepo) {
    return {
      success: false,
      message: 'Informe o Usuário/Organização e o Nome do Repositório.'
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'Informe o Token de Acesso Pessoal (PAT) do GitHub.'
    };
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${rawOwner}/${rawRepo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          success: false,
          message: `Repositório "${rawOwner}/${rawRepo}" não encontrado ou o token não possui acesso a repositórios privados.`
        };
      }
      if (repoRes.status === 401) {
        return {
          success: false,
          message: 'Token inválido ou expirado. Verifique o token nas configurações do GitHub.'
        };
      }
      if (repoRes.status === 403) {
        return {
          success: false,
          message: 'Acesso recusado pelo GitHub (permissões insuficientes ou limite de requisições).'
        };
      }
      const errData = await repoRes.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || `Erro HTTP ${repoRes.status} ao conectar com o GitHub.`
      };
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';
    const hasPushPermission = repoData.permissions?.push !== false;

    // Check branch existence
    const branchToCheck = branch || defaultBranch;
    const branchRes = await fetch(
      `https://api.github.com/repos/${rawOwner}/${rawRepo}/branches/${encodeURIComponent(branchToCheck)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!branchRes.ok && branchRes.status === 404) {
      return {
        success: false,
        message: `Repositório encontrado, mas a branch "${branchToCheck}" não existe. A branch padrão do seu repositório é "${defaultBranch}".`,
        defaultBranch,
        repoFullName: repoData.full_name,
        isPrivate: repoData.private,
        hasPushPermission
      };
    }

    if (!hasPushPermission) {
      return {
        success: true,
        message: `Conectado a "${repoData.full_name}", mas atenção: seu token não tem permissão de gravação ("push"). Certifique-se de marcar a opção "repo" ao criar o token.`,
        repoFullName: repoData.full_name,
        isPrivate: repoData.private,
        defaultBranch,
        hasPushPermission: false
      };
    }

    return {
      success: true,
      message: `Conexão bem sucedida com "${repoData.full_name}" na branch "${branchToCheck}"! Permissão de escrita confirmada.`,
      repoFullName: repoData.full_name,
      isPrivate: repoData.private,
      defaultBranch,
      hasPushPermission: true
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Falha de rede ao conectar com api.github.com: ${errorMsg}`
    };
  }
}

/**
 * Gets the current SHA of a file in the repository (needed for updating)
 */
async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}&_t=${Date.now()}`,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

/**
 * Converts the site payload to a formatted TypeScript file (src/data/initialData.ts)
 */
function generateInitialDataTs(data: SitePayload): string {
  return `import { Product, EventPost, HeaderBanner, SidebarBanner, SiteSettings } from '../types';

/**
 * Arquivo gerado automaticamente pelo Painel Administrativo.
 * Última sincronização: ${data.updatedAt}
 */

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(data.products, null, 2)};

export const INITIAL_EVENTS: EventPost[] = ${JSON.stringify(data.events, null, 2)};

export const INITIAL_HEADER_BANNERS: HeaderBanner[] = ${JSON.stringify(data.headerBanners, null, 2)};

export const INITIAL_SIDEBAR_BANNERS: SidebarBanner[] = ${JSON.stringify(data.sidebarBanners, null, 2)};

export const INITIAL_SITE_SETTINGS: SiteSettings = ${JSON.stringify(data.siteSettings, null, 2)};
`;
}

/**
 * Commits updated site data directly to GitHub repository (both public/site-data.json and src/data/initialData.ts)
 */
export async function syncDataToGitHub(
  data: SitePayload,
  config: GitHubSyncConfig
): Promise<{
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}> {
  const { owner: rawOwner, repo: rawRepo } = normalizeGitHubInput(config.owner, config.repo);
  const token = normalizeGitHubToken(config.token);
  let branch = (config.branch || '').trim() || 'main';

  if (!rawOwner || !rawRepo || !token) {
    return {
      success: false,
      error: 'Configurações incompletas do GitHub. Informe usuário, repositório e o token.'
    };
  }

  try {
    // 1. Verify repository and determine correct branch
    const repoCheckRes = await fetch(`https://api.github.com/repos/${rawOwner}/${rawRepo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!repoCheckRes.ok) {
      if (repoCheckRes.status === 401) {
        return {
          success: false,
          error: 'Token do GitHub inválido ou expirado. Verifique as credenciais.'
        };
      }
      if (repoCheckRes.status === 404) {
        return {
          success: false,
          error: `Repositório "${rawOwner}/${rawRepo}" não foi encontrado. Verifique se o nome do usuário e do repositório estão digitados corretamente.`
        };
      }
      if (repoCheckRes.status === 403) {
        return {
          success: false,
          error: 'Acesso negado pelo GitHub. Certifique-se de que o token possui permissão de escrita ("repo").'
        };
      }
      const errJson = await repoCheckRes.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.message || `Erro HTTP ${repoCheckRes.status} ao acessar repositório no GitHub.`
      };
    }

    const repoInfo = await repoCheckRes.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // Verify if specified branch exists; if not and user had 'main', fallback to defaultBranch (e.g. 'master')
    const branchCheckRes = await fetch(
      `https://api.github.com/repos/${rawOwner}/${rawRepo}/branches/${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!branchCheckRes.ok && branchCheckRes.status === 404) {
      console.warn(`Branch "${branch}" não encontrada. Usando branch padrão "${defaultBranch}".`);
      branch = defaultBranch;
    }

    const nowIso = new Date().toISOString();
    const payloadWithTimestamp: SitePayload = {
      ...data,
      updatedAt: nowIso
    };

    const jsonContent = JSON.stringify(payloadWithTimestamp, null, 2);
    const jsonBase64 = utf8ToBase64(jsonContent);

    // 2. Commit public/site-data.json
    const jsonPath = 'public/site-data.json';
    let jsonSha = await getFileSha(rawOwner, rawRepo, jsonPath, branch, token);

    const commitMessage = `Atualização de catálogo e configurações [Painel Admin - ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}]`;

    let jsonPutRes = await fetch(
      `https://api.github.com/repos/${rawOwner}/${rawRepo}/contents/${jsonPath}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: jsonBase64,
          branch,
          ...(jsonSha ? { sha: jsonSha } : {})
        })
      }
    );

    // If conflict (409), re-fetch latest SHA and retry once
    if (jsonPutRes.status === 409) {
      jsonSha = await getFileSha(rawOwner, rawRepo, jsonPath, branch, token);
      jsonPutRes = await fetch(
        `https://api.github.com/repos/${rawOwner}/${rawRepo}/contents/${jsonPath}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: commitMessage,
            content: jsonBase64,
            branch,
            ...(jsonSha ? { sha: jsonSha } : {})
          })
        }
      );
    }

    if (!jsonPutRes.ok) {
      const err = await jsonPutRes.json().catch(() => ({}));
      let friendlyMessage = err.message || `Erro HTTP ${jsonPutRes.status}`;
      if (jsonPutRes.status === 401) {
        friendlyMessage = 'Token inválido ou expirado.';
      } else if (jsonPutRes.status === 403) {
        friendlyMessage = 'Acesso negado: o token não possui permissão de gravação ("push") no repositório. Gere um token marcando a caixinha "repo".';
      } else if (jsonPutRes.status === 404) {
        friendlyMessage = `Repositório "${rawOwner}/${rawRepo}" ou branch "${branch}" não encontrado.`;
      } else if (jsonPutRes.status === 409) {
        friendlyMessage = 'Conflito de versão no GitHub. Tente sincronizar novamente.';
      } else if (jsonPutRes.status === 422) {
        friendlyMessage = `Erro ao gravar arquivo no GitHub: ${err.message || 'Arquivo excede o limite direto ou dados inválidos'}.`;
      }

      const updatedConfig: GitHubSyncConfig = {
        ...config,
        owner: rawOwner,
        repo: rawRepo,
        branch,
        lastStatus: 'error',
        lastError: friendlyMessage
      };
      saveGitHubConfig(updatedConfig);

      return {
        success: false,
        error: friendlyMessage
      };
    }

    const jsonPutData = await jsonPutRes.json();
    const commitSha = jsonPutData?.commit?.sha || '';
    const commitUrl = jsonPutData?.commit?.html_url || `https://github.com/${rawOwner}/${rawRepo}/commits/${branch}`;

    // 3. Try committing src/data/initialData.ts so repository source code stays in sync
    try {
      const tsContent = generateInitialDataTs(payloadWithTimestamp);
      const tsBase64 = utf8ToBase64(tsContent);
      const tsPath = 'src/data/initialData.ts';
      const tsSha = await getFileSha(rawOwner, rawRepo, tsPath, branch, token);

      await fetch(
        `https://api.github.com/repos/${rawOwner}/${rawRepo}/contents/${tsPath}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Atualização de código fonte inicial [Painel Admin - ${new Date().toLocaleDateString('pt-BR')}]`,
            content: tsBase64,
            branch,
            ...(tsSha ? { sha: tsSha } : {})
          })
        }
      );
    } catch (e) {
      console.warn('Não foi possível atualizar src/data/initialData.ts (opcional):', e);
    }

    // 4. Save successful state
    const updatedConfig: GitHubSyncConfig = {
      ...config,
      owner: rawOwner,
      repo: rawRepo,
      branch,
      token,
      lastSyncAt: nowIso,
      lastCommitSha: commitSha,
      lastCommitUrl: commitUrl,
      lastStatus: 'success',
      lastError: undefined
    };
    saveGitHubConfig(updatedConfig);

    return {
      success: true,
      commitSha,
      commitUrl
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const updatedConfig: GitHubSyncConfig = {
      ...config,
      owner: rawOwner,
      repo: rawRepo,
      branch,
      lastStatus: 'error',
      lastError: errorMsg
    };
    saveGitHubConfig(updatedConfig);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Fetches latest data published on GitHub or from local server public/site-data.json
 * This allows all visiting clients to immediately see the changes published by the admin!
 */
export async function fetchPublishedSiteData(config?: GitHubSyncConfig): Promise<SitePayload | null> {
  const urlsToTry: string[] = [];

  // 1. Try raw.githubusercontent.com if repo is configured
  if (config && config.owner && config.repo) {
    const { owner, repo } = normalizeGitHubInput(config.owner, config.repo);
    const branch = config.branch || 'main';
    if (owner && repo) {
      urlsToTry.push(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/site-data.json?t=${Date.now()}`
      );
    }
  }

  // 2. Try the local public site-data.json served by GitHub Pages or Vercel
  urlsToTry.push(`/site-data.json?t=${Date.now()}`);

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.siteSettings) {
          return data as SitePayload;
        }
      }
    } catch {
      // Continue to next URL
    }
  }

  return null;
}

/**
 * Downloads the current site payload as a site-data.json file directly to user's computer
 */
export function downloadSiteDataJson(data: SitePayload): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

