import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStartRef = { current: Date.now() };

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          sessionStartRef.current = Date.now();
          // Update last_sign_in_at
          setTimeout(() => {
            supabase
              .from('profiles')
              .update({ 
                last_sign_in_at: new Date().toISOString(),
                last_active_at: new Date().toISOString()
              } as any)
              .eq('user_id', session.user.id)
              .then(() => {});
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          // Calculate session duration and update
          const sessionMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
          if (sessionMinutes > 0) {
            // We can't update after sign out since RLS blocks it, so it's handled by the heartbeat
          }
        }
      }
    );

    // Check for existing session and immediately mark active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        sessionStartRef.current = Date.now();
        // Immediately update last_active_at on page load
        supabase
          .from('profiles')
          .update({ 
            last_active_at: new Date().toISOString() 
          } as any)
          .eq('user_id', session.user.id)
          .then(() => {});
      }
    });

    // Heartbeat: update last_active_at every 1 minute
    const heartbeat = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        await supabase
          .from('profiles')
          .update({ 
            last_active_at: new Date().toISOString()
          } as any)
          .eq('user_id', currentSession.user.id)
          .then(() => {});
        // Also accumulate session time
        await supabase.rpc('update_session_activity' as any, {
          _user_id: currentSession.user.id,
          _minutes: 1
        }).then(() => {});
      }
    }, 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(heartbeat);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    sessionStorage.removeItem('demo_data_reset');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
