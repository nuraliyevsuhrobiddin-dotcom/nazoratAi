export const getToken = () => localStorage.getItem('token');

export const decodeToken = (token = getToken()) => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.warn('Invalid auth token', error);
    return null;
  }
};

export const isAdminUser = () => {
  const decodedToken = decodeToken();
  return Boolean(decodedToken?.is_admin);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
};
