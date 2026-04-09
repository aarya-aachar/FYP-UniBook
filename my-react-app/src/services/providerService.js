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

// Build FormData so we can include multiple image files if provided
const buildFormData = (data, imageFiles) => {
  const fd = new FormData();
  if (data.name)               fd.append('name', data.name);
  if (data.category)           fd.append('category', data.category);
  if (data.address)            fd.append('address', data.address);
  if (data.description !== undefined) fd.append('description', data.description);
  if (data.base_price !== undefined)  fd.append('base_price', data.base_price);
  if (data.opening_time)       fd.append('opening_time', data.opening_time);
  if (data.closing_time)       fd.append('closing_time', data.closing_time);
  
  // Append list of existing images to keep (for merging on backend)
  if (data.existing_gallery) {
    fd.append('existing_gallery', Array.isArray(data.existing_gallery) ? JSON.stringify(data.existing_gallery) : data.existing_gallery);
  }
  
  // Append all files in the array under the key 'images'
  if (Array.isArray(imageFiles)) {
    imageFiles.forEach(file => {
      if (file instanceof File) fd.append('images', file);
    });
  } else if (imageFiles instanceof File) {
    fd.append('images', imageFiles);
  }
  
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
