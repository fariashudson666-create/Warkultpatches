import { useState, FormEvent, useEffect } from 'react';
import { 
  KeyRound, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  getAdminCredentials, 
  updateAdminCredentials, 
  resetAdminCredentials, 
  isDefaultCredentials 
} from '../utils/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getAdminCredentials();
      setCurrentUsername(creds.username);
      setNewUsername(creds.username);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDefault = isDefaultCredentials();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', text: '' };
    if (pwd.length < 4) return { label: 'Muito curta (mín. 4)', color: 'bg-rose-500', text: 'text-rose-600' };
    if (pwd.length < 7) return { label: 'Média', color: 'bg-amber-500', text: 'text-amber-600' };
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (hasSpecial && hasNumber && pwd.length >= 8) {
      return { label: 'Muito Forte', color: 'bg-emerald-600', text: 'text-emerald-600' };
    }
    return { label: 'Boa', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Por favor, informe a sua senha atual.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere. Digite a mesma senha nos dois campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = updateAdminCredentials(
        currentPassword,
        newUsername.trim() || currentUsername,
        newPassword
      );

      setIsLoading(false);

      if (!result.success) {
        setErrorMsg(result.error || 'Erro ao atualizar a senha.');
      } else {
        setSuccessMsg('Senha de administrador alterada com sucesso!');
        setTimeout(() => {
          onSuccess(newUsername.trim() || currentUsername);
          onClose();
        }, 1200);
      }
    }, 200);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Tem certeza de que deseja restaurar a senha padrão de fábrica (admin / admin123)?')) {
      resetAdminCredentials();
      setSuccessMsg('Credenciais restauradas para o padrão: admin / admin123');
      const creds = getAdminCredentials();
      setCurrentUsername(creds.username);
      setNewUsername(creds.username);
      setCurrentPassword(creds.password);
      setTimeout(() => {
        onSuccess(creds.username);
        onClose();
      }, 1500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-change-password-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden relative max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Segurança
                </span>
                {isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Senha Padrão Ativa
                  </span>
                )}
              </div>
              <h3 id="modal-change-password-title" className="text-xl font-black text-white mt-1">
                Trocar Senha do Admin
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Altere a senha de acesso ao painel de controle do seu catálogo e eventos.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {isDefault && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-2">
              <div className="text-[11px] leading-snug">
                <span className="font-bold">Aviso de Segurança:</span> Você ainda está utilizando a senha padrão de fábrica (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">admin123</code>). Recomendamos definir uma senha própria.
              </div>
            </div>
          )}

          <form id="form-change-password" onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Login */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Nome de Usuário (Login)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="input-change-username"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: admin ou seu nome"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 text-xs"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Você pode manter &quot;{currentUsername}&quot; ou escolher um novo nome de usuário.
              </span>
            </div>

            {/* Current Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700">
                  Senha Atual*
                </label>
                {isDefault && (
                  <button
                    type="button"
                    onClick={() => setCurrentPassword('admin123')}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Preencher padrão (admin123)
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="input-current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite a senha atual"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showCurrentPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">
                    Nova Senha*
                  </label>
                  {newPassword && (
                    <span className={`text-[10px] font-bold ${strength.text}`}>
                      Força: {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="input-new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres (ex: MinhaLoja@2026)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword && (
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ 
                        width: newPassword.length < 4 ? '25%' : newPassword.length < 7 ? '60%' : '100%' 
                      }} 
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Confirmar Nova Senha*
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="input-confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 text-xs ${
                      confirmPassword && confirmPassword !== newPassword 
                        ? 'border-rose-300 bg-rose-50/40' 
                        : confirmPassword && confirmPassword === newPassword 
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-slate-200'
                    }`}
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    As senhas não coincidem ainda.
                  </span>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    As senhas coincidem perfeitamente.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Restaurar usuário e senha originais (admin / admin123)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão de Fábrica</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>{isLoading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
