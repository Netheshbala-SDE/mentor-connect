import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { User, RegisterData } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  loading: boolean;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (userToPersist: User | null) => {
    if (userToPersist) {
      localStorage.setItem('mentorConnectUser', JSON.stringify(userToPersist));
    } else {
      localStorage.removeItem('mentorConnectUser');
    }
  };

  useEffect(() => {
    // Check for stored user data and token on app load
    const token = localStorage.getItem('mentorConnectToken');
    const storedUser = localStorage.getItem('mentorConnectUser');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        
        // Verify token is still valid by fetching current user
        apiService.getCurrentUser().catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('mentorConnectToken');
          localStorage.removeItem('mentorConnectUser');
          setUser(null);
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('mentorConnectToken');
        localStorage.removeItem('mentorConnectUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('mentorConnectToken', token);
        persistUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('mentorConnectToken', token);
        persistUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mentorConnectUser');
    localStorage.removeItem('mentorConnectToken');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    persistUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
