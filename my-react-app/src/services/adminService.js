import api from './api';

export const getAdminMetrics = async () => {
  const res = await api.get('/admin/metrics');
  return res.data;
};

export const getUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const updateUserStatus = async (id, is_active) => {
  try {
    const res = await api.patch(`/admin/users/${id}/status`, { is_active });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};
