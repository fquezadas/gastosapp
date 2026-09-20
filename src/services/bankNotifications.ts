import { Capacitor, registerPlugin } from '@capacitor/core';

export interface PendingPurchase {
  id: string;
  amount: number;
  merchant: string;
  receivedAt: number;
}
export interface BankState {
  enabled?: boolean;
  packageName?: string;
  access: boolean;
  pending: PendingPurchase[];
}
interface BankNotificationsPlugin {
  setOwner(options: { owner: string }): Promise<void>;
  getState(options: { owner: string }): Promise<BankState>;
  configure(options: { owner: string; enabled: boolean; packageName: string }): Promise<void>;
  dismiss(options: { owner: string; id: string }): Promise<void>;
  listApps(): Promise<{ apps: { packageName: string; label: string }[] }>;
  openSettings(): Promise<void>;
}
export const supportsBankNotifications = Capacitor.getPlatform() === 'android';
export const bankNotifications = registerPlugin<BankNotificationsPlugin>('BankNotifications');
