/**
 * The Gatekeeper (Auth Service)
 * 
 * relative path: /src/services/authService.js
 * 
 * This file is the "Manager" for user identity. It handles the 
 * persistence of logins, cleaning up sessions on logout, and 
 * syncing the user's profile data with the server.
 */

import api from './api';

/**
 * login
 * Sends credentials to the server. If successful, it "pins" 
 * the identity to the browser's local storage.
 */
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      // We save the token (the key) and the user object (the ID card)
      localStorage.setItem('token', res.data.token);
      const user = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * logout
 * Effectively "forgets" the user by wiping their storage.
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * getProfile
 * A quick-access tool to see who is currently browsing the UI.
 */
export const getProfile = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

/**
 * fetchFullProfile
 * Pulls the absolute latest data from the database. 
 * Useful for refreshing the UI after a major change.
 */
export const fetchFullProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    // Keep the local storage mirror up to date
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

/**
 * updateProfile
 * Saves the user's new name, bio, or contact info.
 */
export const updateProfile = async (profileData) => {
  try {
    const res = await api.post('/auth/profile/update', profileData);

    if (res.data.user) {
      // Merge the new data into our local identity card
      const currentUser = getProfile();
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Update failed');
  }
};

/**
 * uploadProfilePhoto
 * Special handler for binary images. Uses FormData to bypass standard JSON limits.
 */
export const uploadProfilePhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post('/auth/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Update the photo path in our local session
    const currentUser = getProfile();
    if (currentUser) {
      currentUser.profile_photo = res.data.profile_photo;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Photo upload failed');
  }
};
