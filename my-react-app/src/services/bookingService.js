import api from './api';
export const getBookedTimes = async (providerId, date) => {
  const res = await api.get(`/bookings/provider/${providerId}/date/${date}`);
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await api.post('/bookings', bookingData);
  return res.data;
};

export const getUserBookings = async () => {
  const res = await api.get('/bookings/user');
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get('/bookings/admin');
  return res.data;
};



export const getPastUserBookings = async () => {
  const res = await api.get('/bookings/user/reports');
  return res.data;
};

export const submitReview = async (booking_id, provider_id, rating, comment) => {
  const res = await api.post('/reviews', { booking_id, provider_id, rating, comment });
  return res.data;
};

export const getProviderReviews = async (providerId) => {
  const res = await api.get(`/reviews/provider/${providerId}`);
  return res.data;
};

export const getProviderReviewStats = async (providerId) => {
  const res = await api.get(`/reviews/provider/${providerId}/stats`);
  return res.data;
};


