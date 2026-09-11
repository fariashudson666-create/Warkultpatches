import { useState, useEffect, FormEvent } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Download, 
  Save, 
  Radio, 
  HelpCircle,
  FolderGit2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  GitHubSyncConfig, 
  getGitHubConfig, 
  saveGitHubConfig, 
  testGitHubConnection, 
  syncDataToGitHub, 
  downloadSiteDataJson,
  normalizeGitHubInput,
  normalizeGitHubToken,
  SitePayload
} from '../utils/githubSync';
import { Product, EventPost, HeaderBanner, SidebarBanner, SiteSettings } from '../types';

interface GitHubSyncTabProps {
  products: Product[];
  events: EventPost[];
  headerBanners: HeaderBanner[];
  sidebarBanners: SidebarBanner[];
  siteSettings: SiteSettings;
  showToast: (msg: string) => void;
}

export function GitHubSyncTab({
  products,
  events,
  headerBanners,
  sidebarBanners,
  siteSettings,
  showToast
}: GitHubSyncTabProps) {
  const [config, setConfig] = useState<GitHubSyncConfig>(getGitHubConfig);
  const [owner, setOwner] = useState(config.owner || '');
  const [repo, setRepo] = useState(config.repo || '');
  const [branch, setBranch] = useState(config.branch || 'main');
  const [token, setToken] = useState(config.token || '');
  const [autoSync, setAutoSync] = useState(config.autoSync ?? false);
  const [showToken, setShowToken] = useState(false);

  // States for actions
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    message: string; 
    defaultBranch?: string;
    hasPushPermission?: boolean;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ 
    success: boolean; 
    message: string; 
    commitUrl?: string;
  } | null>(null);

  const [showTutorial, setShowTutorial] = useState(!config.token);

  useEffect(() => {
    const current = getGitHubConfig();
    setConfig(current);
    setOwner(current.owner);
    setRepo(current.repo);
    setBranch(current.branch || 'main');
    setToken(current.token);
    setAutoSync(current.autoSync ?? false);
  }, []);

  // Intelligent auto-clean when user pastes a full github URL into repo or owner
  const handleOwnerChange = (val: string) => {
    if (val.includes('github.com')) {
      const normalized = normalizeGitHubInput(val, repo);
      setOwner(normalized.owner);
      if (normalized.repo && (!repo || repo === val)) {
        setRepo(normalized.repo);
      }
    } else {
      setOwner(val);
    }
  };

  const handleRepoChange = (val: string) => {
    if (val.includes('github.com') || val.includes('/')) {
      const normalized = normalizeGitHubInput(owner, val);
      if (normalized.owner && (!owner || owner === val)) {
        setOwner(normalized.owner);
      }
      setRepo(normalized.repo);
    } else {
      setRepo(val);
    }
  };

  const handleTokenChange = (val: string) => {
    setToken(normalizeGitHubToken(val));
  };

  const getPayload = (): SitePayload => ({
    updatedAt: new Date().toISOString(),
    version: 1,
    siteSettings,
    products,
    events,
    headerBanners,
    sidebarBanners
  });

  const getCleanConfig = (): GitHubSyncConfig => {
    const norm = normalizeGitHubInput(owner, repo);
    const cleanTok = normalizeGitHubToken(token);
    return {
      ...config,
      owner: norm.owner,
      repo: norm.repo,
      branch: branch.trim() || 'main',
      token: cleanTok,
      autoSync
    };
  };

  const handleSaveConfig = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const updated = getCleanConfig();
    saveGitHubConfig(updated);
    setConfig(updated);
    setOwner(updated.owner);
    setRepo(updated.repo);
    setToken(updated.token);
    showToast('Configurações do GitHub salvas com sucesso!');
  };

  const handleTestConnection = async () => {
    const tempConfig = getCleanConfig();
    if (!tempConfig.owner || !tempConfig.repo) {
      showToast('Preencha o Usuário e o Repositório antes de testar.');
      return;
    }
    if (!tempConfig.token) {
      showToast('Preencha o Token do GitHub antes de testar.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGitHubConnection(tempConfig);
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      // If default branch detected differs, update branch state
      if (result.defaultBranch && result.defaultBranch !== tempConfig.branch) {
        tempConfig.branch = result.defaultBranch;
        setBranch(result.defaultBranch);
      }
      saveGitHubConfig(tempConfig);
      setConfig(tempConfig);
      showToast('Conexão com o repositório confirmada!');
    } else {
      if (result.defaultBranch && result.defaultBranch !== tempConfig.branch) {
        setBranch(result.defaultBranch);
      }
      showToast('Falha na conexão com o GitHub. Veja os detalhes abaixo.');
    }
  };

  const handleManualSync = async () => {
    const tempConfig = getCleanConfig();

    if (!tempConfig.owner || !tempConfig.repo) {
      setSyncResult({
        success: false,
        message: 'Por favor, preencha o Usuário e o Nome do Repositório nos campos abaixo antes de sincronizar.'
      });
      showToast('Preencha o usuário e o repositório.');
      return;
    }

    if (!tempConfig.token) {
      setSyncResult({
        success: false,
        message: 'Por favor, informe seu Token de Acesso Pessoal (PAT) do GitHub no campo correspondente abaixo.'
      });
      showToast('Informe o Token do GitHub para sincronizar.');
      return;
    }

    // Auto-save configuration so user never loses what they typed
    saveGitHubConfig(tempConfig);
    setConfig(tempConfig);
    setOwner(tempConfig.owner);
    setRepo(tempConfig.repo);
    setToken(tempConfig.token);

    setIsSyncing(true);
    setSyncResult(null);

    const payload = getPayload();
    const res = await syncDataToGitHub(payload, tempConfig);
    setIsSyncing(false);

    if (res.success) {
      setSyncResult({
        success: true,
        message: 'Commit realizado com sucesso no GitHub! Os arquivos public/site-data.json e src/data/initialData.ts foram atualizados no repositório.',
        commitUrl: res.commitUrl
      });
      const updated = getGitHubConfig();
      setConfig(updated);
      showToast('Site sincronizado no GitHub com sucesso!');
    } else {
      setSyncResult({
        success: false,
        message: res.error || 'Ocorreu um erro ao sincronizar com o GitHub.'
      });
      showToast('Erro ao sincronizar no GitHub. Veja os detalhes abaixo.');
    }
  };

  const handleDownloadBackup = () => {
    const payload = getPayload();
    downloadSiteDataJson(payload);
    showToast('Download do arquivo site-data.json iniciado!');
  };

  const displayOwner = owner.trim() || config.owner;
  const displayRepo = repo.trim() || config.repo;
  const displayBranch = branch.trim() || config.branch || 'main';
  const isConnected = !!(config.token && config.owner && config.repo && config.lastStatus === 'success');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <FolderGit2 className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-base sm:text-lg">Sincronização Direta com GitHub</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Conecte seu repositório no GitHub para que tudo o que você atualizar no painel (produtos, banners, eventos e temas) seja gravado diretamente no GitHub e exibido instantaneamente para os clientes que acessam o site.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTutorial(!showTutorial)}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-indigo-300" />
          <span>{showTutorial ? 'Ocultar Instruções' : 'Como Gerar Token'}</span>
        </button>
      </div>

      {/* Tutorial / Help Box */}
      {showTutorial && (
        <div className="bg-indigo-50/80 border border-indigo-200/80 p-5 rounded-2xl text-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Passo a Passo: Como obter o Token do GitHub em 1 minuto</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed pl-1">
            <li>
              Acesse sua conta do GitHub e vá em <strong>Settings</strong> &gt; <strong>Developer Settings</strong> (no final do menu lateral esquerdo).
            </li>
            <li>
              Clique em <strong>Personal Access Tokens</strong> &gt; <strong>Tokens (classic)</strong>.
            </li>
            <li>
              Clique em <strong>Generate new token</strong> (Generate new token classic).
            </li>
            <li>
              Dê uma nota (ex: <span className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">Painel Loja</span>) e <strong>MUITO IMPORTANTE</strong>: marque a caixinha <strong className="text-indigo-950 font-mono bg-amber-100 px-1 py-0.5 rounded">repo</strong> (para ter permissão de leitura e gravação/push).
            </li>
            <li>
              Role até o final da página e clique no botão verde <strong>Generate token</strong>. Copie o token gerado (começa com <span className="font-mono font-bold">ghp_</span>) e cole no campo abaixo!
            </li>
          </ol>
          <div className="pt-1 flex items-center gap-3">
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
            >
              <span>Abrir página de tokens do GitHub diretamente</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'
          }`}>
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">
                {displayOwner && displayRepo ? `${displayOwner}/${displayRepo}` : 'Repositório não configurado'}
              </h4>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  Sincronizado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Branch: <span className="font-mono font-semibold text-slate-700">{displayBranch}</span>
              {config.lastSyncAt && (
                <> • Último commit: {new Date(config.lastSyncAt).toLocaleString('pt-BR')}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {config.lastCommitUrl && (
            <a
              href={config.lastCommitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Commit no GitHub</span>
            </a>
          )}
          <button
            type="button"
            id="btn-sync-github-top"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Enviando para GitHub...' : 'Sincronizar no GitHub Agora'}</span>
          </button>
        </div>
      </div>

      {/* Sync / Test Results notifications */}
      {testResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          testResult.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-bold">{testResult.success ? 'Conexão Bem-Sucedida!' : 'Falha na Conexão com o GitHub'}</p>
            <p className="text-[11px] leading-relaxed">{testResult.message}</p>
            {testResult.defaultBranch && testResult.defaultBranch !== branch && (
              <button
                type="button"
                onClick={() => {
                  setBranch(testResult.defaultBranch!);
                  showToast(`Branch ajustada para "${testResult.defaultBranch}".`);
                }}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 underline cursor-pointer"
              >
                <span>Mudar branch de "{branch}" para "{testResult.defaultBranch}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {syncResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          syncResult.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {syncResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1.5 w-full">
            <p className="font-bold">{syncResult.success ? 'GitHub Atualizado com Sucesso!' : 'Falha na Sincronização'}</p>
            <p className="text-[11px] leading-relaxed">{syncResult.message}</p>
            {syncResult.commitUrl && (
              <a
                href={syncResult.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-700 font-bold underline text-[11px] pt-1"
              >
                <span>Visualizar alterações gravadas no repositório GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {!syncResult.success && (
              <div className="mt-2 p-3 bg-white/80 rounded-lg border border-rose-200 text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Dicas para resolver:</span>
                </div>
                <ul className="list-disc list-inside text-[10px] space-y-1 text-rose-700">
                  <li><strong>Token sem permissão de escrita?</strong> Certifique-se de que a caixinha <code>repo</code> foi marcada ao gerar o token.</li>
                  <li><strong>Nome do repositório correto?</strong> Digite apenas o nome exato (ex: <code>visualizador-telas</code>).</li>
                  <li><strong>Branch correta?</strong> Verifique se no GitHub a sua branch é <code>main</code> ou <code>master</code>.</li>
                  <li>Clique no botão <strong>"Testar Conexão"</strong> abaixo para validar o token antes de sincronizar.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Configurações de Acesso ao Repositório
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">api.github.com</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Usuário ou Organização*
            </label>
            <input
              type="text"
              required
              value={owner}
              onChange={(e) => handleOwnerChange(e.target.value)}
              placeholder="Ex: farias-hudson"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Seu usuário no GitHub (sem @). Aceita colar link do GitHub.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome do Repositório*
            </label>
            <input
              type="text"
              required
              value={repo}
              onChange={(e) => handleRepoChange(e.target.value)}
              placeholder="Ex: visualizador-telas"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              O nome exato do repositório no GitHub. Aceita colar link completo.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Branch Principal
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value.trim())}
              placeholder="main"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Normalmente <strong>main</strong> ou <strong>master</strong>.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Token de Acesso Pessoal (PAT) do GitHub*
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              required
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full pr-10 pl-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>O token é guardado com segurança apenas no seu navegador para comunicar com o GitHub.</span>
          </p>
        </div>

        {/* Automatic Sync Switch */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <label htmlFor="toggle-auto-sync" className="font-bold text-xs text-slate-800 cursor-pointer">
              Sincronização Automática ao Salvar Alterações
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Quando ativado, qualquer produto, banner, evento ou cor editada no painel fará um commit automático no GitHub em segundo plano.
            </p>
          </div>
          <input
            id="toggle-auto-sync"
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            className="w-5 h-5 accent-indigo-600 cursor-pointer shrink-0"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-test-github-connection"
              onClick={handleTestConnection}
              disabled={isTesting || !token.trim() || !owner.trim() || !repo.trim()}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              id="btn-download-site-data"
              onClick={handleDownloadBackup}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Baixar arquivo JSON com todos os dados"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar site-data.json</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              id="btn-save-github-config"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>

            <button
              type="button"
              id="btn-sync-github-bottom"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Enviando para GitHub...' : 'Sincronizar no GitHub Agora'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

