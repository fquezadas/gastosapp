import { Capacitor, registerPlugin } from '@capacitor/core';

export interface PendingPurchase {
  id: string;
  amount: number;
  merchant: string;
  receivedAt: number;
  source?: string;
}
export interface BankState {
  enabled?: boolean;
  packageNames?: string[];
  access: boolean;
  connected?: boolean;
  reconnecting?: boolean;
  lastResult?: string;
  lastCheckedAt?: number;
  pending: PendingPurchase[];
}
interface BankNotificationsPlugin {
  setOwner(options: { owner: string }): Promise<void>;
  getState(options: { owner: string }): Promise<BankState>;
  configure(options: { owner: string; enabled: boolean; packageNames: string[] }): Promise<void>;
  dismiss(options: { owner: string; id: string }): Promise<void>;
  listApps(): Promise<{ apps: { packageName: string; label: string }[] }>;
  openSettings(): Promise<void>;
  reviewVisible(options: { owner: string }): Promise<{ added: number }>;
}
export const supportsBankNotifications = Capacitor.getPlatform() === 'android';
export const bankNotifications = registerPlugin<BankNotificationsPlugin>('BankNotifications');
