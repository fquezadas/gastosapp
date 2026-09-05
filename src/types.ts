export type ScreenTab = 'dashboard' | 'add' | 'stats' | 'savings' | 'budget';

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  place: string;
  time: string;
  category: 'cafe' | 'snacks' | 'bebidas' | 'antojos' | 'transporte' | 'otros';
  amount: number; // in CLP
  date: string; // YYYY-MM-DD
  isToday: boolean;
  notes?: string;
}

export interface CategoryInfo {
  id: Transaction['category'];
  name: string;
  iconName: string;
  emoji: string;
  bgClass: string;
  textClass: string;
}

export interface Challenge {
  id: string;
  userId?: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  currentDay: number;
  totalDays: number;
  status: 'active' | 'completed' | 'suggested';
  currentAmount: number;
  targetAmount: number;
  rewardNote: string;
  iconBgClass: string;
  iconTextClass: string;
  estMonthlySavings?: number;
}

export interface BudgetSettings {
  userId?: string;
  dailyLimit: number; // CLP
  alertAt80: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'challenge' | 'tip';
}
