import axios from 'axios';

const API_URL = 'http://localhost:4001/api/reviews';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getProviderReviews = async (providerId) => {
  const response = await axios.get(`${API_URL}/provider/${providerId}`);
  return response.data;
};

export const getProviderReviewStats = async (providerId) => {
  const response = await axios.get(`${API_URL}/provider/${providerId}/stats`);
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await axios.post(API_URL, reviewData, getAuthHeaders());
  return response.data;
};
