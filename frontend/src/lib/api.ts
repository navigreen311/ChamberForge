import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  headers: { 'Content-Type': 'application/json' },
  // Send the httpOnly session cookie with every request.
  withCredentials: true,
});

// Attach token and request ID to every request
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  // P-11: no token is read from localStorage any more.
  //
  // The session lives in an httpOnly cookie NextAuth sets, which script
  // cannot read - that is the point. `withCredentials` sends it, so the
  // request is authenticated without the token ever being exposed to the
  // page. Every one of the 97 files importing this keeps working unchanged;
  // only how the credential travels has changed.
  return config;
});

// Parse standardized error envelope and handle 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const requestId = error.response?.headers?.['x-request-id'] || data?.request_id;
    if (data?.error_code) {
      error.errorCode = data.error_code;
      error.userMessage = data.message;
      error.fieldErrors = data.details?.field_errors;
    }
    if (requestId) {
      error.requestId = requestId;
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Nothing to clear - the session is an httpOnly cookie the server
      // owns. Send them to sign in and let NextAuth resolve it.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
