import api from './api';

export const getAdminMetrics = async () => {
  const res = await api.get('/admin/metrics');
  return res.data;
};
