import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Check current session
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // The backend uses authGuard for this endpoint to verify cookie
      const response = await api.get('/auth/me');
      
      // If the backend returned a new token (rotating), capture it
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
      console.log('No active session.');
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  // Provide Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${import.meta.env.VITE_API_URL}/auth/google`;
  }
}));

export default useAuthStore;
