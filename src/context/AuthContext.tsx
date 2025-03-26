
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  loading: true,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If no profile was found, create one
        if (error.code === 'PGRST116') {
          console.log('No user profile found, creating one...');
          const newProfile = await createProfile(userId);
          return newProfile;
        }
        
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Create a new user profile when signing up or when profile is missing
  const createProfile = async (userId: string, email?: string) => {
    try {
      const userEmail = email || user?.email;
      
      if (!userEmail) {
        console.error('No email available to create profile');
        return null;
      }
      
      console.log('Creating profile for user:', userId, 'with email:', userEmail);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userEmail,
          subscription_tier: 'free',
          credits_remaining: 100,
          credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      console.log('User profile created successfully:', data);
      return data as User;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  };

  // Get current site URL for redirects
  const getSiteUrl = () => {
    return window.location.origin;
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/login`,
        }
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      if (data?.user) {
        await createProfile(data.user.id, email);
        toast({
          title: 'Account created',
          description: 'Please check your email to verify your account',
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Signed in',
        description: 'Welcome back!',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/login');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id).then(userProfile => {
              setProfile(userProfile);
              setLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Got existing session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(userProfile => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        signUp,
        signIn,
        signOut,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
