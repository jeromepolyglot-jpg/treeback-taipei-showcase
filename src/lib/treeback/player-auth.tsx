import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const PlayerContext = createContext<{ user: User | null; loading: boolean; recovery: boolean }>({ user: null, loading: true, recovery: false });
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<{ user: User | null; loading: boolean; recovery: boolean }>({ user: null, loading: true, recovery: false });
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setValue(prev => ({ user: session?.user ?? null, loading: false, recovery: event === 'PASSWORD_RECOVERY' || (prev.recovery && event !== 'SIGNED_OUT') }));
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
export const usePlayer = () => useContext(PlayerContext);