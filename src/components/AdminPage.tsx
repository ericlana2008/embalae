import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Store,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Cloud,
  Mail,
} from 'lucide-react';
import { DistributorConfig, Product, Category } from '../types';
import { SettingsModal } from './SettingsModal';
import {
  supabase,
  loginWithSupabase,
  logoutSupabase,
  onSupabaseAuthStateChange,
  User,
} from '../supabase';

interface AdminPageProps {
  config: DistributorConfig;
  onSaveConfig: (newConfig: DistributorConfig) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onNavigateToCatalog: () => void;
  onClearAllMemory?: () => void;
}

const PASSWORD_KEY = 'embalae_admin_password';
const AUTH_SESSION_KEY = 'embalae_admin_auth';
const DEFAULT_PASSWORD = 'abc1234';

// Validates 3 letters followed by 4 digits (e.g., abc1234, EMB2026, xyz9999)
export const validatePasswordFormat = (pwd: string): boolean => {
  return /^[a-zA-Z]{3}[0-9]{4}$/.test(pwd);
};

export const AdminPage: React.FC<AdminPageProps> = ({
  config,
  onSaveConfig,
  categories,
  onUpdateCategories,
  products,
  onUpdateProducts,
  onNavigateToCatalog,
  onClearAllMemory,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });

  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSupabaseUser(data.user);
    });

    const unsub = onSupabaseAuthStateChange((user) => {
      setSupabaseUser(user);
    });
    return () => unsub();
  }, []);

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings modal visibility when authenticated
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  // Change password modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmNewPwdInput, setConfirmNewPwdInput] = useState('');
  const [changePwdError, setChangePwdError] = useState<string | null>(null);
  const [changePwdSuccess, setChangePwdSuccess] = useState(false);

  // Clear memory modal state
  const [isClearMemoryModalOpen, setIsClearMemoryModalOpen] = useState(false);
  const [clearMemorySuccess, setClearMemorySuccess] = useState(false);

  const handleConfirmClearMemory = () => {
    if (onClearAllMemory) {
      onClearAllMemory();
    }
    setClearMemorySuccess(true);
    setTimeout(() => {
      setClearMemorySuccess(false);
      setIsClearMemoryModalOpen(false);
    }, 1400);
  };

  // Get current stored password
  const getStoredPassword = (): string => {
    try {
      const saved = localStorage.getItem(PASSWORD_KEY);
      if (saved && validatePasswordFormat(saved)) return saved;
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PASSWORD;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmed = passwordInput.trim();

    if (!trimmed) {
      setAuthError('Por favor, informe a senha de acesso.');
      return;
    }

    if (!validatePasswordFormat(trimmed)) {
      setAuthError('A senha deve ser composta por 3 letras seguidas de 4 números (ex: abc1234).');
      return;
    }

    const currentSavedPassword = getStoredPassword();

    if (trimmed.toLowerCase() !== currentSavedPassword.toLowerCase()) {
      setAuthError('Senha incorreta. Verifique e tente novamente.');
      return;
    }

    // Success
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    } catch (err) {
      console.warn(err);
    }
    setIsAuthenticated(true);
    setIsSettingsOpen(true);
    setPasswordInput('');
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseLoading(true);
    setSupabaseError(null);

    try {
      const { data, error } = await loginWithSupabase(supabaseEmail.trim(), supabasePassword);
      if (error) {
        setSupabaseError(error.message || 'Falha ao autenticar no Supabase. Verifique e-mail e senha.');
      } else if (data.user) {
        setSupabaseUser(data.user);
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setIsSettingsOpen(true);
        setIsSupabaseModalOpen(false);
        setSupabaseEmail('');
        setSupabasePassword('');
      }
    } catch (err: unknown) {
      setSupabaseError('Erro inesperado ao conectar ao Supabase.');
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      await logoutSupabase();
    } catch (err) {
      console.warn(err);
    }
    setIsAuthenticated(false);
    setIsSettingsOpen(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwdError(null);
    setChangePwdSuccess(false);

    const stored = getStoredPassword();

    if (currentPwdInput.trim().toLowerCase() !== stored.toLowerCase()) {
      setChangePwdError('A senha atual informada está incorreta.');
      return;
    }

    if (!validatePasswordFormat(newPwdInput.trim())) {
      setChangePwdError('A nova senha deve ter exatamente 3 letras seguidas de 4 números (ex: abc1234).');
      return;
    }

    if (newPwdInput.trim().toLowerCase() !== confirmNewPwdInput.trim().toLowerCase()) {
      setChangePwdError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      localStorage.setItem(PASSWORD_KEY, newPwdInput.trim().toLowerCase());
      setChangePwdSuccess(true);
      setCurrentPwdInput('');
      setNewPwdInput('');
      setConfirmNewPwdInput('');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setChangePwdSuccess(false);
      }, 1800);
    } catch (err) {
      setChangePwdError('Não foi possível salvar a nova senha no navegador.');
    }
  };

  // If NOT authenticated, render the blank page with the password modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-orange-200">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-700 to-orange-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-orange-700/20">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo conectado à nuvem
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                  Senha de Acesso
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  autoFocus
                  className="w-full h-12 pl-4 pr-11 text-sm bg-slate-50 focus:bg-white text-slate-900 font-semibold rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                Padrão inicial: <strong className="font-semibold text-slate-600">abc1234</strong>
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 hover:from-orange-800 hover:to-orange-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Acessar Painel</span>
            </button>
          </form>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-bold text-[10px]">ou entrar com Supabase</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Entrar como Administrador</span>
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="text-xs font-bold text-slate-600 hover:text-orange-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Catálogo</span>
            </button>
          </div>
        </div>

        {/* Supabase Login Modal */}
        {isSupabaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Entrar com Supabase</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSupabaseModalOpen(false);
                    setSupabaseError(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSupabaseLogin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    E-mail do Administrador
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={supabaseEmail}
                      onChange={(e) => setSupabaseEmail(e.target.value)}
                      placeholder="admin@exemplo.com"
                      className="w-full h-10 pl-3 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Senha do Supabase
                  </label>
                  <input
                    type="password"
                    value={supabasePassword}
                    onChange={(e) => setSupabasePassword(e.target.value)}
                    placeholder="Sua senha no Supabase"
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                    required
                  />
                </div>

                {supabaseError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{supabaseError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSupabaseModalOpen(false);
                      setSupabaseError(null);
                    }}
                    className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={supabaseLoading}
                    className="flex-1 h-10 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-700/20 cursor-pointer disabled:opacity-50"
                  >
                    {supabaseLoading ? 'Conectando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated state: render administrative dashboard + SettingsModal
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-orange-200">
      {/* Top Admin Navigation Bar */}
      <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 px-4 min-w-[64px] rounded-lg bg-orange-700 flex items-center justify-center font-black text-xs text-white tracking-widest shadow-inner">
            ADM
          </div>
          <div>
            <h1 className="text-sm font-black leading-tight text-white">
              {config.name ? config.name : 'Painel Administrativo'}
            </h1>
            <p className="text-[10px] text-slate-400">Ambiente Administrativo Seguro</p>
          </div>
        </div>
      </nav>

      {/* Main Admin Dashboard Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Welcome & Quick actions card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Sessão Ativa
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Gerenciamento do Aplicativo
            </h2>
            <div>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Trocar a senha de acesso (3 letras + 4 números)"
              >
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span>Alterar Senha de Acesso</span>
              </button>
            </div>
          </div>

          {/* Action buttons stacked vertically */}
          <div className="flex flex-col gap-2.5 w-full sm:w-56 shrink-0">
            {/* 1. Botão Abrir Painel de Controle */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-full px-4 py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-700/20 active:scale-98 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Abrir Painel de Controle</span>
            </button>

            {/* 2. Botão Ver Catálogo */}
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              title="Ir para o catálogo público de clientes"
            >
              <ExternalLink className="w-4 h-4 text-orange-600" />
              <span>Ver Catálogo</span>
            </button>

            {/* 3. Botão Sair */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-4 h-4 text-slate-600" />
              <span>Sair</span>
            </button>

            {/* 4. Botão Limpar Memória do Aplicativo */}
            <button
              type="button"
              onClick={() => setIsClearMemoryModalOpen(true)}
              className="w-full px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              title="Apagar todos os dados gravados na memória interna do aplicativo"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Limpar Memória</span>
            </button>
          </div>
        </div>

        {/* Supabase Cloud Status Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">
                    Banco de Dados em Nuvem (Supabase PostgreSQL)
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {supabaseUser
                    ? `Sincronização em nuvem ativa para a conta: ${supabaseUser.email}`
                    : `Para sincronizar alterações na nuvem em tempo real para os clientes, conecte sua conta de administrador Supabase.`}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {supabaseUser ? (
                <button
                  type="button"
                  onClick={async () => {
                    await logoutSupabase();
                    setSupabaseUser(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Desconectar Supabase
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Conectar Supabase</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overview metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Categorias</span>
              <Store className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {categories.filter((c) => c.isActive !== false).length}
            </div>
            <span className="text-[10px] text-slate-400">Categorias ativas no catálogo</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Produtos</span>
              <ShieldCheck className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {products.filter((p) => p.isActive !== false).length}
            </div>
            <span className="text-[10px] text-slate-400">Produtos disponíveis para venda</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>WhatsApp Pedidos</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sm font-black text-slate-800 truncate">
              {config.whatsappNumber || 'Não configurado'}
            </div>
            <span className="text-[10px] text-slate-400">Recebimento dos pedidos</span>
          </div>
        </div>
      </main>

      {/* Main Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={onSaveConfig}
        categories={categories}
        onUpdateCategories={onUpdateCategories}
        products={products}
        onUpdateProducts={onUpdateProducts}
      />

      {/* Modal to Connect Supabase */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Conectar ao Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSupabaseModalOpen(false);
                  setSupabaseError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Insira o e-mail e senha do usuário administrador cadastrado no Supabase.
            </p>

            <form onSubmit={handleSupabaseLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={supabaseEmail}
                    onChange={(e) => setSupabaseEmail(e.target.value)}
                    placeholder="admin@exemplo.com"
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={supabasePassword}
                  onChange={(e) => setSupabasePassword(e.target.value)}
                  placeholder="Sua senha no Supabase"
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              {supabaseError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{supabaseError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSupabaseModalOpen(false);
                    setSupabaseError(null);
                  }}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={supabaseLoading}
                  className="flex-1 h-10 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-700/20 cursor-pointer disabled:opacity-50"
                >
                  {supabaseLoading ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Change Admin Password */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Alterar Senha do Admin</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  setChangePwdError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              A nova senha deve ter <strong>3 letras seguidas de 4 números</strong> (ex: abc1234).
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPwdInput}
                  onChange={(e) => setCurrentPwdInput(e.target.value)}
                  placeholder="Digite a senha atual"
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nova Senha (3 letras + 4 números)
                </label>
                <input
                  type="text"
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="Ex: xyz5678"
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="text"
                  value={confirmNewPwdInput}
                  onChange={(e) => setConfirmNewPwdInput(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-orange-500 outline-none uppercase font-mono"
                  required
                />
              </div>

              {changePwdError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{changePwdError}</span>
                </div>
              )}

              {changePwdSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Senha alterada com sucesso!</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-700/20 cursor-pointer"
                >
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Confirm Clear Memory */}
      {isClearMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Limpar Memória do Aplicativo
            </h3>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Todos os campos, produtos e categorias gravados na memória interna serão totalmente apagados e limpos. Nenhum resíduo anterior permanecerá.
            </p>

            {clearMemorySuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 mb-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Memória totalmente limpa com sucesso!</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsClearMemoryModalOpen(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearMemory}
                  className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 cursor-pointer"
                >
                  Sim, Limpar Tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
