/**
 * The Alert System (Notification Service)
 * 
 * relative path: /src/services/notificationService.js
 * 
 * This file powers the "Bell" icon activity. It handles the fetching, 
 * marking as read, and deleting of system alerts.
 * 
 * It ensures that users, providers, and admins stay updated whenever a 
 * booking is confirmed, rejected, or a new message arrives.
 */

import api from './api';

/**
 * getNotifications
 * Pulls the personal feed of alerts for the logged-in user.
 */
export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

/**
 * getUnreadCount
 * Fetches the specific number of NEW alerts. 
 * This is what drives the red "badge" count on the navbar bell.
 */
export const getUnreadCount = async () => {
  const res = await api.get('/notifications/unread-count');
  return res.data.count;
};

/**
 * markAsRead
 * Silences a specific notification once the user has acknowledged it.
 */
export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

/**
 * markAllAsRead
 * A "Clear All" utility for a tidy notification center.
 */
export const markAllAsRead = async () => {
  const res = await api.put('/notifications/mark-all-read');
  return res.data;
};

/**
 * deleteNotification
 * Permanently removes an alert from the user's view.
 */
export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};
