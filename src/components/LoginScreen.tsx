import React, { useState } from 'react';
import { signInWithGoogle } from '../services/authService';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg('Error al conectar con Google. Puedes probar el Modo Demo.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Error inesperado al iniciar sesión.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col justify-between p-6 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Brand Hero */}
      <div className="flex flex-col items-center text-center pt-8 pb-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#006c49] to-[#6ffbbe] flex items-center justify-center shadow-xl shadow-[#006c49]/25 mb-4 animate-bounce duration-1000">
          <span className="material-symbols-outlined text-white text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            payments
          </span>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#006c49] bg-[#10b981]/15 px-3 py-1 rounded-full mb-2">
          Finanzas Personales • Chile 🇨🇱
        </span>

        <h1 className="text-3xl font-black text-[#111c2d] tracking-tight">
          Gastos<span className="text-[#006c49]">App</span>
        </h1>
        <p className="text-sm text-[#3c4a42] mt-1.5 max-w-xs leading-relaxed">
          Controla tus gastos hormiga diarios en segundos y alcanza tus metas de ahorro.
        </p>
      </div>

      {/* Feature Highlights Bento */}
      <div className="flex flex-col gap-2.5 my-auto">
        <div className="bg-white p-3.5 rounded-2xl border border-[#e7eeff] flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 text-[#006c49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111c2d]">Registro ultra rápido</h4>
            <p className="text-[11px] text-[#3c4a42]">Guarda tus cafés, snacks y compras en 2 toques.</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#e7eeff] flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#ffdcc5]/70 text-[#944a00] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              military_tech
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111c2d]">Retos y gamificación</h4>
            <p className="text-[11px] text-[#3c4a42]">Cumple metas como "7 días sin delivery" y ahorra.</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#e7eeff] flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#dee8ff] text-[#006c49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              cloud_sync
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111c2d]">Sincronización segura</h4>
            <p className="text-[11px] text-[#3c4a42]">Tus datos protegidos y disponibles en cualquier celular.</p>
          </div>
        </div>
      </div>

      {/* Auth Actions Card */}
      <div className="flex flex-col gap-3 pt-4 pb-2">
        {errorMsg && (
          <div className="bg-[#ffdad6] text-[#93000a] text-xs p-3 rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-white hover:bg-[#f0f3ff] text-[#111c2d] border border-[#dee8ff] rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="text-xs text-[#3c4a42]">Conectando con Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Demo / Guest Option */}
        <button
          onClick={onContinueAsGuest}
          className="w-full py-3 px-4 text-xs font-semibold text-[#3c4a42] hover:text-[#111c2d] hover:bg-[#f0f3ff] rounded-xl transition-colors text-center"
        >
          Probar en Modo Demo / Invitado →
        </button>

        <p className="text-[11px] text-[#3c4a42]/70 text-center mt-1">
          Al continuar, tus datos se almacenan de forma segura y privada.
        </p>
      </div>
    </div>
  );
};
