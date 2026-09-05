import { useState, useEffect } from 'react';
import { ScreenTab, Transaction, BudgetSettings, Challenge, NotificationItem, UserProfile } from './types';
import {
  INITIAL_BUDGET,
  INITIAL_TRANSACTIONS,
  INITIAL_CHALLENGES,
  SUGGESTED_CHALLENGES,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AddExpenseScreen } from './components/screens/AddExpenseScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { SavingsScreen } from './components/screens/SavingsScreen';
import { BudgetSettingsScreen } from './components/screens/BudgetSettingsScreen';
import { NotificationsModal } from './components/NotificationsModal';
import { AllTransactionsModal } from './components/AllTransactionsModal';
import { LoginScreen } from './components/LoginScreen';
import { formatCLP } from './utils/formatters';
import { isSupabaseConfigured } from './lib/supabase';
import { getCurrentUser, onAuthStateChange, signOut } from './services/authService';
import {
  getTransactions,
  createTransaction,
  removeTransaction,
  getBudgetSettings,
  saveBudgetSettings,
  getChallenges,
  saveChallengeProgress,
} from './services/dbService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  const isCloudConnected = isSupabaseConfigured();

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Budget State
  const [budget, setBudget] = useState<BudgetSettings>(INITIAL_BUDGET);

  // Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [suggestedChallenges, setSuggestedChallenges] = useState<Challenge[]>(SUGGESTED_CHALLENGES);

  // Notifications State with localStorage
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('gastosapp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Listen to Auth State
  useEffect(() => {
    async function checkAuth() {
      try {
        const activeUser = await getCurrentUser();
        setUser(activeUser);
      } catch (err) {
        console.error('Auth check error:', err);
      }
    }

    checkAuth();

    const { data: authSubscription } = onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      if (updatedUser) {
        setIsGuestMode(false);
      }
    });

    return () => {
      authSubscription?.subscription?.unsubscribe();
    };
  }, []);

  // Load data when user changes or enters guest mode
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Don't fetch if not logged in and not in guest mode
      if (!user && !isGuestMode) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [txs, bgt, chs] = await Promise.all([
          getTransactions(),
          getBudgetSettings(),
          getChallenges(),
        ]);

        if (isMounted) {
          if (txs) setTransactions(txs);
          if (bgt) setBudget(bgt);
          if (chs) {
            setChallenges(chs.activeChallenges);
            setSuggestedChallenges(chs.suggestedChallenges);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, isGuestMode]);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('gastosapp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setIsGuestMode(false);
    showToast('Sesión cerrada');
  };

  // Add Transaction Handler
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const created: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
      userId: user?.id,
      date: newTx.date || todayStr,
      isToday: newTx.isToday ?? (newTx.date === todayStr),
    };

    // Optimistic UI update
    const updated = [created, ...transactions];
    setTransactions(updated);

    // Save to DB / localStorage
    await createTransaction(created);

    // Calculate today's spent after adding
    const todaySpent = updated
      .filter((t) => t.isToday)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Check 80% threshold
    if (budget.alertAt80 && todaySpent >= budget.dailyLimit * 0.8) {
      const alertNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '¡Alerta de límite al 80%!',
        message: `Has gastado ${formatCLP(todaySpent)} de tu presupuesto diario de ${formatCLP(budget.dailyLimit)}.`,
        time: 'Justo ahora',
        read: false,
        type: 'alert',
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    showToast(`✓ Gasto de ${formatCLP(newTx.amount)} registrado`);
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await removeTransaction(id);
    showToast('Movimiento eliminado');
  };

  // Save Budget Handler
  const handleSaveBudget = async (newBudget: BudgetSettings) => {
    setBudget(newBudget);
    await saveBudgetSettings(newBudget);
    showToast('✓ Presupuesto diario actualizado');
  };

  // Register Day for Challenge
  const handleRegisterDay = async (challengeId: string) => {
    let updatedCh: Challenge | null = null;

    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === challengeId) {
          const nextDay = ch.currentDay + 1;
          const isFinished = nextDay >= ch.totalDays;
          const incAmount = Math.round(ch.targetAmount / ch.totalDays);
          const nextAmount = isFinished ? ch.targetAmount : ch.currentAmount + incAmount;

          if (isFinished) {
            showToast(`🎉 ¡Felicitaciones! Completaste "${ch.title}"`);
            const finishNotif: NotificationItem = {
              id: `notif-done-${Date.now()}`,
              title: `¡Reto completado! 🏆`,
              message: `Has concluido con éxito "${ch.title}" ahorrando ${formatCLP(ch.targetAmount)}.`,
              time: 'Justo ahora',
              read: false,
              type: 'challenge',
            };
            setNotifications((n) => [finishNotif, ...n]);
          } else {
            showToast(`Día ${nextDay} registrado para "${ch.title}"`);
          }

          updatedCh = {
            ...ch,
            currentDay: nextDay,
            currentAmount: nextAmount,
            status: isFinished ? 'completed' : 'active',
          };
          return updatedCh;
        }
        return ch;
      })
    );

    if (updatedCh) {
      await saveChallengeProgress(updatedCh);
    }
  };

  // Join Suggested Challenge
  const handleJoinChallenge = async (sug: Challenge) => {
    const newActive: Challenge = {
      ...sug,
      id: `active-${Date.now()}`,
      userId: user?.id,
      status: 'active',
      currentDay: 1,
      currentAmount: Math.round(sug.targetAmount * 0.1),
    };

    setChallenges((prev) => [...prev, newActive]);
    setSuggestedChallenges((prev) => prev.filter((s) => s.id !== sug.id));
    await saveChallengeProgress(newActive);
    showToast(`Te has unido al reto "${sug.title}"`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Show Login Screen if not authenticated and not in guest mode
  if (!user && !isGuestMode) {
    return <LoginScreen onContinueAsGuest={() => setIsGuestMode(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-6 text-[#111c2d]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006c49] to-[#6ffbbe] animate-pulse flex items-center justify-center shadow-lg shadow-[#006c49]/20 mb-4">
          <span className="material-symbols-outlined text-white text-2xl font-bold">payments</span>
        </div>
        <h2 className="text-base font-bold tracking-tight">Cargando GastosApp...</h2>
        <p className="text-xs text-slate-500 mt-1">Sincronizando información</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-sans relative pb-20">
      {/* Sync Status Banner */}
      <div className="w-full bg-[#111c2d] text-white text-[11px] font-medium py-1 px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>{user ? `Cuenta: ${user.email || user.name}` : 'Modo Demo (Local)'}</span>
        </div>
        <span className="text-white/60 text-[10px]">CLP ($)</span>
      </div>

      {/* Persistent Top Header */}
      <Header
        currentTab={currentTab}
        user={user}
        onNavigate={setCurrentTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadCount}
      />

      {/* Screen Views */}
      <div className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardScreen
            transactions={transactions}
            budget={budget}
            onNavigate={setCurrentTab}
            onOpenAllTransactions={() => setIsAllTransactionsOpen(true)}
          />
        )}

        {currentTab === 'add' && (
          <AddExpenseScreen
            onAddTransaction={handleAddTransaction}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'stats' && (
          <StatsScreen
            transactions={transactions}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'savings' && (
          <SavingsScreen
            challenges={challenges}
            suggestedChallenges={suggestedChallenges}
            onRegisterDay={handleRegisterDay}
            onJoinChallenge={handleJoinChallenge}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetSettingsScreen
            budget={budget}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
            onNavigate={setCurrentTab}
          />
        )}
      </div>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onNavigate={setCurrentTab} />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onClearAll={() => setNotifications([])}
      />

      {/* All Transactions Modal */}
      <AllTransactionsModal
        isOpen={isAllTransactionsOpen}
        onClose={() => setIsAllTransactionsOpen(false)}
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Toast feedback pill */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#111c2d] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
