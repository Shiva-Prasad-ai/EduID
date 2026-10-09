// Centralized API configuration for EduID
// Hides all backend connection details and supports hosting on Vercel, Netlify, Render, Railway, etc.

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5001' : '');

export default API_BASE_URL;
