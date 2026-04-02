import api from './api';

export const register = async (name, email, password) => {
  try {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      const user = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getProfile = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const fetchFullProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    // Update local storage with the latest data
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await api.post('/auth/profile/update', profileData);

    if (res.data.user) {
      const currentUser = getProfile();
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Update failed');
  }
};
