import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Transaction, BudgetSettings, Challenge } from '../types';
import {
  INITIAL_BUDGET,
  INITIAL_TRANSACTIONS,
  INITIAL_CHALLENGES,
  SUGGESTED_CHALLENGES,
} from '../data/mockData';

// Storage keys for local fallback
const STORAGE_KEYS = {
  TRANSACTIONS: 'gastosapp_transactions',
  BUDGET: 'gastosapp_budget',
  CHALLENGES: 'gastosapp_challenges',
  SUGGESTED_CHALLENGES: 'gastosapp_suggested_challenges',
};

// ==========================================
// TRANSACTIONS
// ==========================================

export async function getTransactions(): Promise<Transaction[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          title: row.title,
          place: row.place || '',
          time: row.time || '',
          category: row.category,
          amount: Number(row.amount),
          date: row.date,
          isToday: Boolean(row.is_today),
          notes: row.notes || undefined,
        }));
      }
    } catch (err) {
      console.warn('Error fetching transactions from Supabase, using localStorage fallback:', err);
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
}

export async function createTransaction(tx: Transaction): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          id: tx.id,
          title: tx.title,
          place: tx.place,
          time: tx.time,
          category: tx.category,
          amount: tx.amount,
          date: tx.date,
          is_today: tx.isToday,
          notes: tx.notes || null,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.warn('Error saving transaction to Supabase:', err);
    }
  }

  // Always update local cache
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const current: Transaction[] = saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([tx, ...current]));
}

export async function removeTransaction(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('Error removing transaction from Supabase:', err);
    }
  }

  // Update local cache
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (saved) {
    const current: Transaction[] = JSON.parse(saved);
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(current.filter((t) => t.id !== id))
    );
  }
}

// ==========================================
// BUDGET SETTINGS
// ==========================================

export async function getBudgetSettings(): Promise<BudgetSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          dailyLimit: Number(data.daily_limit),
          alertAt80: Boolean(data.alert_at_80),
        };
      }
    } catch (err) {
      console.warn('Error fetching budget from Supabase, using localStorage fallback:', err);
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
  return saved ? JSON.parse(saved) : INITIAL_BUDGET;
}

export async function saveBudgetSettings(budget: BudgetSettings): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('budget_settings').upsert([
        {
          id: 'default',
          daily_limit: budget.dailyLimit,
          alert_at_80: budget.alertAt80,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.warn('Error saving budget to Supabase:', err);
    }
  }

  // Update local cache
  localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
}

// ==========================================
// CHALLENGES
// ==========================================

export async function getChallenges(): Promise<{
  activeChallenges: Challenge[];
  suggestedChallenges: Challenge[];
}> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const all: Challenge[] = data.map((row) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle || '',
          category: row.category || '',
          icon: row.icon || 'savings',
          currentDay: row.current_day || 0,
          totalDays: row.total_days || 7,
          status: row.status as 'active' | 'completed' | 'suggested',
          currentAmount: Number(row.current_amount || 0),
          targetAmount: Number(row.target_amount || 0),
          rewardNote: row.reward_note || '',
          iconBgClass: row.icon_bg_class || 'bg-[#ffdcc5]/50',
          iconTextClass: row.icon_text_class || 'text-[#944a00]',
          estMonthlySavings: Number(row.est_monthly_savings || 0),
        }));

        const activeChallenges = all.filter((c) => c.status === 'active' || c.status === 'completed');
        const suggestedChallenges = all.filter((c) => c.status === 'suggested');

        return { activeChallenges, suggestedChallenges };
      }
    } catch (err) {
      console.warn('Error fetching challenges from Supabase, using localStorage fallback:', err);
    }
  }

  // Fallback to localStorage
  const savedActive = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
  const savedSuggested = localStorage.getItem(STORAGE_KEYS.SUGGESTED_CHALLENGES);

  return {
    activeChallenges: savedActive ? JSON.parse(savedActive) : INITIAL_CHALLENGES,
    suggestedChallenges: savedSuggested ? JSON.parse(savedSuggested) : SUGGESTED_CHALLENGES,
  };
}

export async function saveChallengeProgress(challenge: Challenge): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('challenges').upsert([
        {
          id: challenge.id,
          title: challenge.title,
          subtitle: challenge.subtitle,
          category: challenge.category,
          icon: challenge.icon,
          current_day: challenge.currentDay,
          total_days: challenge.totalDays,
          status: challenge.status,
          current_amount: challenge.currentAmount,
          target_amount: challenge.targetAmount,
          reward_note: challenge.rewardNote,
          icon_bg_class: challenge.iconBgClass,
          icon_text_class: challenge.iconTextClass,
          est_monthly_savings: challenge.estMonthlySavings,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.warn('Error saving challenge progress to Supabase:', err);
    }
  }
}
