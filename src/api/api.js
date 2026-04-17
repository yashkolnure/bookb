import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};


// ── Stores ──
export const storeAPI = {
  getBySlug: (slug) => api.get(`/stores/${slug}`),
  getMyStore: () => api.get('/stores/my/details'),
  updateMyStore: (data) => api.put('/stores/my', data),
  uploadLogo: (formData) => api.post('/stores/my/logo', formData),
  uploadBanner: (formData) => api.post('/stores/my/banner', formData),
  updatePayment: (data) => api.put('/stores/my/payment', data),
  togglePayment: (enabled) => api.put('/stores/my/payment/toggle', { enabled }),
  getAnalytics: () => api.get('/stores/my/analytics'),
  getSubscription: () => api.get('/stores/my/subscription'),
  upgradePlan: (planId) => api.put('/stores/my/upgrade', { planId }),
};

// ── Services ──
export const serviceAPI = {
  getByStore: (storeId, params) => api.get(`/services/store/${storeId}`, { params }),
  getById: (id) => api.get(`/services/${id}`),
  getSlots: (id, date) => api.get(`/services/${id}/slots`, { params: { date } }),
  getMyServices: () => api.get('/services/my/list'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  uploadImages: (id, formData) => api.post(`/services/${id}/images`, formData),
};

// ── Appointments ──
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  manage: (id, token) => api.get(`/appointments/manage/${id}`, { params: { token } }),
  cancel: (id, token, reason) => api.put(`/appointments/manage/${id}/cancel`, { token, reason }),
  confirmPayment: (id, data) => api.post(`/appointments/${id}/payment`, data),
  getProviderList: (params) => api.get('/appointments/provider/list', { params }),
  updateStatus: (id, status, reason) => api.put(`/appointments/${id}/status`, { status, reason }),
};

// ── Coupons ──
export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// ── Reviews ──
export const reviewAPI = {
  getByStore: (storeId) => api.get(`/reviews/store/${storeId}`),
  getByService: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  submit: (data) => api.post('/reviews', data),
  getProviderReviews: () => api.get('/reviews/provider/list'),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default api;
