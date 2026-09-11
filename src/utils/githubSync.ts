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
 * UTF-8 safe Base64 encoder for GitHub Contents API
 */
function utf8ToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Tests connection and write permissions to the configured GitHub repository
 */
export async function testGitHubConnection(config: GitHubSyncConfig): Promise<{
  success: boolean;
  message: string;
  repoFullName?: string;
  isPrivate?: boolean;
}> {
  const { owner, repo, token, branch } = config;

  if (!owner.trim() || !repo.trim()) {
    return {
      success: false,
      message: 'Informe o Usuário/Organização e o Nome do Repositório.'
    };
  }

  if (!token.trim()) {
    return {
      success: false,
      message: 'Informe o Token de Acesso Pessoal (PAT) do GitHub.'
    };
  }

  try {
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cleanBranch = branch.trim() || 'main';

    const repoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          success: false,
          message: `Repositório "${cleanOwner}/${cleanRepo}" não encontrado ou o token não possui permissão de leitura.`
        };
      }
      if (repoRes.status === 401) {
        return {
          success: false,
          message: 'Token inválido ou expirado. Verifique as credenciais no GitHub.'
        };
      }
      const errData = await repoRes.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || `Erro HTTP ${repoRes.status} ao conectar no GitHub.`
      };
    }

    const repoData = await repoRes.json();

    // Verify branch existence
    const branchRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches/${cleanBranch}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!branchRes.ok && branchRes.status === 404) {
      return {
        success: false,
        message: `Repositório encontrado, mas a branch "${cleanBranch}" não existe no GitHub.`
      };
    }

    return {
      success: true,
      message: `Conexão bem sucedida com "${repoData.full_name}" na branch "${cleanBranch}"!`,
      repoFullName: repoData.full_name,
      isPrivate: repoData.private
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
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
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
  const { owner, repo, token, branch } = config;

  if (!owner.trim() || !repo.trim() || !token.trim()) {
    return {
      success: false,
      error: 'Configurações incompletas do GitHub. Informe usuário, repositório e token.'
    };
  }

  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = branch.trim() || 'main';
  const cleanToken = token.trim();

  try {
    const nowIso = new Date().toISOString();
    const payloadWithTimestamp: SitePayload = {
      ...data,
      updatedAt: nowIso
    };

    const jsonContent = JSON.stringify(payloadWithTimestamp, null, 2);
    const tsContent = generateInitialDataTs(payloadWithTimestamp);

    // 1. Commit public/site-data.json
    const jsonPath = 'public/site-data.json';
    const jsonSha = await getFileSha(cleanOwner, cleanRepo, jsonPath, cleanBranch, cleanToken);

    const jsonPutRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${jsonPath}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${cleanToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Atualização de catálogo e configurações [Painel Admin - ${new Date().toLocaleDateString('pt-BR')}]`,
          content: utf8ToBase64(jsonContent),
          branch: cleanBranch,
          ...(jsonSha ? { sha: jsonSha } : {})
        })
      }
    );

    if (!jsonPutRes.ok) {
      const err = await jsonPutRes.json().catch(() => ({}));
      return {
        success: false,
        error: err.message || `Falha ao salvar ${jsonPath} no GitHub (HTTP ${jsonPutRes.status}).`
      };
    }

    const jsonPutData = await jsonPutRes.json();
    const commitSha = jsonPutData?.commit?.sha || '';
    const commitUrl = jsonPutData?.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commits/${cleanBranch}`;

    // 2. Also try committing src/data/initialData.ts so repo code is 100% up-to-date
    try {
      const tsPath = 'src/data/initialData.ts';
      const tsSha = await getFileSha(cleanOwner, cleanRepo, tsPath, cleanBranch, cleanToken);

      await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${tsPath}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${cleanToken}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Atualização de código fonte inicial [Painel Admin - ${new Date().toLocaleDateString('pt-BR')}]`,
            content: utf8ToBase64(tsContent),
            branch: cleanBranch,
            ...(tsSha ? { sha: tsSha } : {})
          })
        }
      );
    } catch (e) {
      console.warn('Não foi possível atualizar src/data/initialData.ts no GitHub (opcional):', e);
    }

    // Update config with last success
    const updatedConfig: GitHubSyncConfig = {
      ...config,
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
    const branch = config.branch || 'main';
    urlsToTry.push(
      `https://raw.githubusercontent.com/${config.owner.trim()}/${config.repo.trim()}/${branch}/public/site-data.json?t=${Date.now()}`
    );
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
