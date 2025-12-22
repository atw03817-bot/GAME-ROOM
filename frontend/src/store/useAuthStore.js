import { create } from 'zustand';

// Initialize from localStorage
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const initialUser = userStr ? JSON.parse(userStr) : null;

const useAuthStore = create((set) => ({
  user: initialUser,
  token: token,
  isAuthenticated: !!token,

  login: (user, token) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateUser: (userData) => {
    set((state) => {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  // Initialize user from token
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token and get user data
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          set({ 
            user: data.user, 
            token, 
            isAuthenticated: true 
          });
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Token invalid, clear everything
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}));

export default useAuthStore;
