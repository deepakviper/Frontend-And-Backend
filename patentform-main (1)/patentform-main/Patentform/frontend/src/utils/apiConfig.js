/**
 * Utility for resolving backend API Base URL dynamically.
 * Works seamlessly across local development, Vercel deployments, and production.
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8080';
  }
  return 'https://frontend-and-backend-1-kytc.onrender.com';
};

/**
 * Robust fetch wrapper that automatically handles Render cold starts with retries.
 */
export const fetchWithRetry = async (url, options = {}, retries = 2, delayMs = 3000) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      if (attempt < retries) {
        console.warn(`Fetch failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delayMs / 1000}s...`, err);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
};
