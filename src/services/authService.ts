import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

// Listener for deep linking in Capacitor native app
if (Capacitor.isNativePlatform()) {
  App.addListener('appUrlOpen', async ({ url }) => {
    if (url.includes('google-auth') || url.includes('access_token') || url.includes('#')) {
      try {
        await Browser.close();
      } catch {
        // ignore if browser was already closed
      }

      // Convert hash into query params to easily extract tokens
      const normalizedUrl = url.replace('#', '?');
      const parsedUrl = new URL(normalizedUrl);
      const accessToken = parsedUrl.searchParams.get('access_token');
      const refreshToken = parsedUrl.searchParams.get('refresh_token');

      if (accessToken && refreshToken && supabase) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  });
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: new Error('Supabase no está configurado') };
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative
      ? 'com.gastosapp.app://google-auth'
      : (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: isNative,
      },
    });

    if (error) return { error };

    if (isNative && data?.url) {
      await Browser.open({ url: data.url, windowName: '_self' });
    }

    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user = session.user;
      callback({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      });
    } else {
      callback(null);
    }
  });
}
