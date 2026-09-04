import React, { useState } from 'react';
import { Challenge } from '../../types';
import { formatCLP } from '../../utils/formatters';

interface SavingsScreenProps {
  challenges: Challenge[];
  suggestedChallenges: Challenge[];
  onRegisterDay: (challengeId: string) => void;
  onJoinChallenge: (challenge: Challenge) => void;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  challenges,
  suggestedChallenges,
  onRegisterDay,
  onJoinChallenge,
}) => {
  const [selectedCompletedChallenge, setSelectedCompletedChallenge] = useState<Challenge | null>(null);
  const [justRegisteredId, setJustRegisteredId] = useState<string | null>(null);

  const handleRegister = (id: string) => {
    onRegisterDay(id);
    setJustRegisteredId(id);
    setTimeout(() => {
      setJustRegisteredId(null);
    }, 1500);
  };

  return (
    <main className="px-4 py-3 max-w-xl mx-auto flex flex-col gap-5 pb-28 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#111c2d]">Retos de Ahorro</h1>
        <p className="text-sm text-[#3c4a42]">
          Transforma tus pequeños hábitos diarios en grandes metas financieras cumplidas.
        </p>
      </div>

      {/* Impacto Acumulado Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dee8ff]/50 relative overflow-hidden flex flex-col gap-4">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#10b981]/10 rounded-full pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-3 py-1 bg-[#10b981]/20 text-[#006c49] rounded-full flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            <span>Impacto de Gastos Hormiga</span>
          </span>
          <span className="text-xs text-[#3c4a42]">Actualizado hoy</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-bold text-[#111c2d] leading-snug">
            ¡Si reduces 2 cafés al día ahorrarás{' '}
            <span className="text-[#006c49]">$60.000</span> al mes!
          </p>
          <p className="text-xs text-[#3c4a42] leading-relaxed">
            Al año esto representa un total acumulado de{' '}
            <strong className="text-[#111c2d] font-bold">$720.000</strong> que podrías invertir en
            tus vacaciones soñadas o fondo de emergencia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#f0f3ff]">
          <div className="flex flex-col">
            <span className="text-xs text-[#3c4a42]">Ahorro Mensual</span>
            <span className="text-lg font-bold text-[#006c49]">$60.000</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#3c4a42]">Ahorro Anual</span>
            <span className="text-lg font-bold text-[#944a00]">$720.000</span>
          </div>
        </div>
      </div>

      {/* Retos Activos Section */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-[#111c2d]">Retos Activos</h2>
          <button className="text-xs font-bold text-[#006c49] hover:underline">Ver todos</button>
        </div>

        {challenges.map((challenge) => {
          const isDone = challenge.status === 'completed' || challenge.currentDay >= challenge.totalDays;
          const percentage = Math.min(
            100,
            Math.round((challenge.currentAmount / challenge.targetAmount) * 100)
          );

          return (
            <div
              key={challenge.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col gap-3.5 transition-all hover:border-[#dee8ff]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${challenge.iconBgClass} ${challenge.iconTextClass} flex items-center justify-center shrink-0`}
                  >
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {challenge.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111c2d] leading-tight">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-[#3c4a42] mt-0.5">
                      Día {challenge.currentDay} de {challenge.totalDays} completados
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isDone
                      ? 'bg-[#dee8ff] text-[#3c4a42]'
                      : 'bg-[#10b981]/20 text-[#006c49]'
                  }`}
                >
                  {isDone ? 'Completado' : 'Activo'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#3c4a42]">Progreso</span>
                  <span className="font-semibold text-[#111c2d]">
                    {percentage}% (
                    {isDone
                      ? `${formatCLP(challenge.targetAmount)} ahorrados`
                      : `${formatCLP(challenge.currentAmount)} / ${formatCLP(challenge.targetAmount)}`}
                    )
                  </span>
                </div>
                <div className="w-full bg-[#e7eeff] h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isDone ? 'bg-[#006c49]' : 'bg-[#10b981]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {isDone ? (
                  <span className="text-xs text-[#006c49] font-medium flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span>¡Recompensa desbloqueada!</span>
                  </span>
                ) : (
                  <span className="text-xs text-[#3c4a42]">
                    {challenge.totalDays - challenge.currentDay > 0
                      ? `Faltan ${challenge.totalDays - challenge.currentDay} días para reclamar recompensa`
                      : '¡Listo para completar!'}
                  </span>
                )}

                {isDone ? (
                  <button
                    onClick={() => setSelectedCompletedChallenge(challenge)}
                    className="bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    Ver detalle
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(challenge.id)}
                    className="bg-[#006c49] hover:bg-[#005236] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    {justRegisteredId === challenge.id ? '✓ Registrado' : 'Registrar día'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explorar más retos sugeridos */}
      <div className="flex flex-col gap-3 pt-2">
        <h2 className="text-base font-bold text-[#111c2d]">Nuevos Retos Sugeridos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedChallenges.map((sug) => (
            <div
              key={sug.id}
              onClick={() => onJoinChallenge(sug)}
              className="bg-white rounded-2xl p-4 border border-[#e7eeff] flex flex-col justify-between gap-3 hover:border-[#006c49] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${sug.iconBgClass} ${sug.iconTextClass} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-[20px]">{sug.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111c2d]">{sug.title}</h4>
                  <p className="text-xs text-[#3c4a42]">{sug.subtitle}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#f0f3ff]">
                <span className="text-xs text-[#006c49] font-medium">
                  Est. {formatCLP(sug.estMonthlySavings || 20000)} / mes
                </span>
                <span className="text-xs text-[#006c49] font-bold flex items-center gap-1">
                  Unirme <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for viewing completed challenge details */}
      {selectedCompletedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-[#e7eeff] text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/20 text-[#006c49] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_events
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#111c2d]">
              {selectedCompletedChallenge.title}
            </h3>
            <span className="text-xs text-[#006c49] font-bold bg-[#10b981]/15 px-3 py-1 rounded-full mt-1">
              ¡Reto Cumplido!
            </span>
            <p className="text-xs text-[#3c4a42] mt-3 leading-relaxed">
              Completaste todos los días del reto y ahorraste exitosamente{' '}
              <strong className="text-[#111c2d]">
                {formatCLP(selectedCompletedChallenge.targetAmount, true)}
              </strong>
              . ¡Excelente disciplina financiera!
            </p>
            <button
              onClick={() => setSelectedCompletedChallenge(null)}
              className="mt-5 w-full py-2.5 bg-[#006c49] text-white font-bold text-sm rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
