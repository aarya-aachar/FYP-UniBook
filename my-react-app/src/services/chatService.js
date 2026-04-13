import api from './api';

/**
 * Get message history with another user
 */
export const getChatHistory = async (otherId) => {
  const res = await api.get(`/chat/history/${otherId}`);
  return res.data;
};

/**
 * Send a message to another user
 */
export const sendMessage = async (receiverId, message) => {
  const res = await api.post('/chat/send', { receiverId, message });
  return res.data;
};

/**
 * (Admin Only) Fetch active conversations, optionally filtered by role
 */
export const getConversations = async (role = 'user') => {
  const res = await api.get(`/chat/conversations?role=${role}`);
  return res.data;
};
/**
 * Get total unread messages count for notifications
 */
export const getUnreadChatCount = async (role = '') => {
  const params = role ? `?role=${role}` : '';
  const res = await api.get(`/chat/unread-total${params}`);
  return res.data.total || 0;
};
