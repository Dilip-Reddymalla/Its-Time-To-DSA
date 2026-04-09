import axios from 'axios';

// As per user requirements, this relies on axios@1.12.0 that was installed
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor for handling 401s globally (token expiration / not logged in)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the server returns 401, they are unauthenticated
    // We can emit an event or direct state manipulation if needed, 
    // but typically the caller or AuthContext handles routing.
    if (error.response && error.response.status === 401) {
      // In a more complex app, we might check for an explicit 'TokenExpiredError' 
      // and redirect to a login page, but since we are using sliding expiration 
      // in the authGuard, 401 strictly means "session dead".
      window.dispatchEvent(new CustomEvent('auth-failed'));
    }
    return Promise.reject(error);
  }
);

export default api;
