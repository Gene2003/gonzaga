// src/api/endpoints.js
const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // ✅ Authentication
  TOKEN_OBTAIN: '/token/',                           // login (email or username)
  REFRESH_TOKEN: '/token/refresh/',                  // refresh token
  LOGOUT: '/users/logout/',
  REGISTER: '/users/register/',
  CURRENT_USER: '/users/me/',

  // ✅ Activation
  ACTIVATE_ACCOUNT: (uid, token) => `/users/auth/activate/${uid}/${token}/`,
  RESEND_ACTIVATION_EMAIL: '/users/registration/resend-email/',

  // ✅ Password reset
  FORGOT_PASSWORD: '/users/password/reset/',
  RESET_PASSWORD_CONFIRM: '/users/password/reset/confirm/',

  // ✅ Profile
  USER_PROFILE: '/users/me/',
  UPDATE_PROFILE: '/users/update/',

  // ✅ Affiliate
  AFFILIATE_SUMMARY: '/users/affiliate/summary/',
  AFFILIATE_REFERRALS: '/users/affiliate/referrals/',

  // ✅ Vendor
  VENDOR_PRODUCTS: `${API_BASE_URL}/products/`,
  VENDOR_PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/${id}/`,

  // ✅ Admin
  ADMIN_REPORTS: '/admin/reports/',
  ADMIN_PAYOUT_APPROVAL: '/admin/payouts/approve/',
  ADMIN_ANALYTICS: '/admin/analytics/',

  // ✅ M-Pesa
  MPESA_INITIATE_PAYMENT: '/payments/mpesa/initiate/',
  MPESA_PAYMENT_CALLBACK: '/payments/mpesa/callback/',

  // ✅ Contact
  CONTACT_FORM: '/contact/submit/',

  // ✅ Misc
  OPPORTUNITIES: '/opportunities/',
  PARTNERSHIPS: '/partnerships/',
  SERVICES: '/services/',
  HELLO: '/hello/',
  PROTECTED: '/protected/',
};

// Utility
export const getFullUrl = (endpoint, baseUrl = '') => {
  if (typeof endpoint === 'function') {
    throw new Error('Use the endpoint function first, then pass the result to getFullUrl');
  }
  return `${baseUrl}${endpoint}`;
};

export const validateEndpoint = (endpoint) => {
  if (!endpoint) throw new Error('Endpoint is required');
  if (!endpoint.startsWith('/')) {
    console.warn(`Endpoint "${endpoint}" should start with "/"`);
  }
  return endpoint;
};

export const AUTH_ENDPOINTS = {
  LOGIN: API_ENDPOINTS.TOKEN_OBTAIN,
  LOGOUT: API_ENDPOINTS.LOGOUT,
  REGISTER: API_ENDPOINTS.REGISTER,
  CURRENT_USER: API_ENDPOINTS.CURRENT_USER,
  GET_TOKEN: API_ENDPOINTS.TOKEN_OBTAIN,
  REFRESH_TOKEN: API_ENDPOINTS.REFRESH_TOKEN,
  ACTIVATE: API_ENDPOINTS.ACTIVATE_ACCOUNT,
  RESEND_EMAIL: API_ENDPOINTS.RESEND_ACTIVATION_EMAIL,
};
