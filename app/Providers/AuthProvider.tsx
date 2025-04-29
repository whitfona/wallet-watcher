import React, {createContext, useContext, useState, useEffect, type ReactNode} from 'react'
import {type User, type Session,} from '@supabase/supabase-js'
import {supabase} from '@/utils/supabase'

interface UserData extends User {
    user_metadata: {
        name?: string;
    };
}

interface AuthContextType {
    user: UserData | null
    session: Session | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = (
    {
        children,
    }) => {
    const [user, setUser] = useState<UserData | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)

        const initializeAuth = async () => {
            try {
                const {data} = await supabase.auth.getSession()

                if (data.session) {
                    setSession(data.session)
                    setUser(data.session.user as UserData)
                }

                const {data: authListener} = supabase.auth.onAuthStateChange(
                    async (event, currentSession) => {
                        setSession(currentSession)
                        setUser(currentSession?.user as UserData || null)
                        setIsLoading(false)
                    }
                )

                return () => {
                    authListener.subscription.unsubscribe()
                }
            } catch (err) {
                setError('Failed to initialize authentication')
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [supabase.auth])

    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const {error: signInError} = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                setError('Incorrect email or password')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign in failed')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async (): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const {error: signOutError} = await supabase.auth.signOut()

            if (signOutError) {
                setError('Sign out failed')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign out failed')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const authValue: AuthContextType = {
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn,
        signOut,
    }

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    )
}

// Example usage in your app:
/*
import { AuthProvider } from './path/to/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
};

// Then in any component:
import { useAuth } from './path/to/AuthProvider';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Redirect or show success
    } catch (err) {
      // Error is handled in the provider
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Sign In'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
*/