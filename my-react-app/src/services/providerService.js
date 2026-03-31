import api from './api';

export const getProviders = async (category = null) => {
  const url = category ? `/providers?category=${encodeURIComponent(category)}` : '/providers';
  const res = await api.get(url);
  return res.data;
};

export const getProviderById = async (id) => {
  const res = await api.get(`/providers/${id}`);
  return res.data;
};

// Build FormData so we can include an image file if provided
const buildFormData = (data, imageFile) => {
  const fd = new FormData();
  if (data.name)               fd.append('name', data.name);
  if (data.category)           fd.append('category', data.category);
  if (data.address)            fd.append('address', data.address);
  if (data.description !== undefined) fd.append('description', data.description);
  if (data.base_price !== undefined)  fd.append('base_price', data.base_price);
  if (data.opening_time)       fd.append('opening_time', data.opening_time);
  if (data.closing_time)       fd.append('closing_time', data.closing_time);
  if (imageFile)               fd.append('image', imageFile);
  return fd;
};

export const createProvider = async (data, imageFile) => {
  try {
    const fd = buildFormData(data, imageFile);
    // Set Content-Type undefined so Axios drops its default 'application/json'
    // and the browser sets multipart/form-data with the correct boundary automatically
    const res = await api.post('/providers', fd, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add provider');
  }
};

export const updateProvider = async (id, data, imageFile) => {
  try {
    const fd = buildFormData(data, imageFile);
    // Set Content-Type undefined so Axios drops its default 'application/json'
    // and the browser sets multipart/form-data with the correct boundary automatically
    const res = await api.put(`/providers/${id}`, fd, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update provider');
  }
};

export const deleteProvider = async (id) => {
  try {
    const res = await api.delete(`/providers/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete provider');
  }
};
