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
 * (Admin Only) Fetch all active conversations
 */
export const getConversations = async () => {
  const res = await api.get('/chat/conversations');
  return res.data;
};
/**
 * Get total unread messages count for notifications
 */
export const getUnreadChatCount = async () => {
  const res = await api.get('/chat/unread-total');
  return res.data.total || 0;
};
